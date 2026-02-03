/** @format */
const socket_io = require("socket.io");
const ChatEvents = require("./chat/chat_events");
const TokenService = require("../services/token");
const jobSocket = require("./job");

const token_service = new TokenService(process.env.JWT_SECRET_KEY);

class SocketManager {
  constructor(http_server) {
    this.io = socket_io(http_server, {
      cors: { origin: "*" },
      connectTimeout: 60000,
      pingTimeout: 20000,
      pingInterval: 25000,
    });
    this.users = new Map();
    this.rooms = new Map();

    globalThis.io = this.io;
    globalThis.users = new Map();
    globalThis.rooms = new Map();

    this.#initialize();
  }

  #initialize = () => {
    this.io.on("connection", (socket) => {
      this.#handshake({ socket });
      if (socket.user_id) {
        this.#register_events({ socket });
      }
      socket.on("disconnect", () => {
        this.#handle_disconnect({ socket });
      });
    });
  };

  #handshake = ({ socket }) => {
    const fail = (message) => {
      socket.emit("error", { message });
      socket.disconnect(true);
    };
    try {
      let access_token =
        socket.handshake.headers.authorization ||
        socket.handshake.auth?.token;
      if (!access_token) {
        console.log("Socket handshake: no token", socket.id);
        fail("No authorization token");
        return;
      }
      if (
        typeof access_token === "string" &&
        (access_token.startsWith("Bearer ") || access_token.startsWith("bearer "))
      ) {
        access_token = access_token.substring(7);
      }

      const decoded = token_service.verify_access_token(access_token);
      if (!decoded) {
        console.log("Socket handshake: invalid/expired token", socket.id);
        fail("Invalid or expired token");
        return;
      }
      const { id, type } = decoded;
      socket.user_id = id;
      socket.user_type = type;

      console.log("Client connected:", socket.id, "user_id:", socket.user_id, "user_type:", type);
      socket.emit("authenticated", { user_id: id, user_type: type });
    } catch (error) {
      console.error("Handshake error:", error.message);
      fail(error.message || "Handshake failed");
    }
  };

  #register_events = ({ socket }) => {
    new ChatEvents(socket, this.users, this.rooms, this.io);
    jobSocket(this.io, socket); // include job socket here
  };

  #handle_disconnect = ({ socket }) => {
    console.log(`Client disconnected: ${socket.id}`);
    this.users.delete(socket.user_id);
    // handle room cleanup if needed
  };
}

module.exports = SocketManager;
