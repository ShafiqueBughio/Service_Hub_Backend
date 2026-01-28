const socket_io = require("socket.io");
const ChatEvents = require("./events/chat_events");
const TokenService = require("../services/token");

const token_service = new TokenService(process.env.JWT_SECRET_KEY);

class SocketManager {
  constructor(http_server) {
    this.io = socket_io(http_server, {
      cors: {
        origin: "*",
      },
    });

    this.users = new Map();
    this.rooms = new Map();

    // Make io accessible globally for other modules to use
    globalThis.io = this.io;

    //storing users and socket_id
    globalThis.users = new Map();

    //initialize socket manager
    this.#initialize();
  }

  #initialize = () => {
    this.io.on("connection", (socket) => {
      // handshake
      this.#handshake({ socket });
      // Pass connection to adaptor
      this.#register_events({ socket });

      socket.on("disconnect", () => {
        this.#handle_disconnect({ socket });
      });
    });
  };

  #handshake = ({ socket }) => {
    try {
      const access_token = socket.handshake.headers.authorization;

      if (!access_token) {
        console.warn("No authorization token");
        socket.emit("error", { message: "No authorization token" });
        this.#handle_disconnect({ socket });
        return;
      }

      const { id, type } = token_service.verify_access_token(access_token);
      if (!id) {
        console.warn("Invalid or expired access token");
        socket.emit("error", { message: "Invalid or expired access token" });
        this.#handle_disconnect({ socket });

        return;
      }

      socket.user_id = id;
      socket.user_type = type;

      console.log(
        "Client connected with socket_id:",
        socket.id,
        "and user_id:",
        socket.user_id
      );
    } catch (error) {
      console.error("Error verifying access token:", error.message);
    }
  };

  #register_events = ({ socket }) => {
    new ChatEvents(socket, this.users, this.rooms, this.io);
  };

  static event_emitter = ({ name, data }) => {
    globalThis.io.emit(name, data);
  };

  #handle_disconnect = ({ socket }) => {
    console.log(`Client disconnected: ${socket.id}`);

    let userIdToRemove = null;
    let roomToRemove = null;

    const user_id = socket.user_id;

    if (this.users.has(user_id)) {
      this.users.delete(user_id);
      console.warn("Successfully deleted user with id ", user_id);
    }

    // Find the user ID associated with this socket
    for (let [userId, roomName] of this.users.entries()) {
      if (
        roomName.startsWith("private-chat-") &&
        this.io.sockets.sockets.get(socket.id)
      ) {
        userIdToRemove = userId;
        roomToRemove = roomName;
        break;
      }
    }

    if (userIdToRemove) {
      this.users.delete(userIdToRemove);
      console.log(`Removed user ${userIdToRemove} from users map.`);
    }

    // Check if room exists and remove only the socket that disconnected
    if (roomToRemove) {
      socket.leave(roomToRemove);
      console.log(`Socket ${socket.id} left room ${roomToRemove}`);

      // Check if the room is now empty before deleting it
      const clients = this.io.sockets.adapter.rooms.get(roomToRemove);
      if (!clients || clients.size === 0) {
        for (let [chatId, roomName] of this.rooms.entries()) {
          if (roomName === roomToRemove) {
            this.rooms.delete(chatId);
            console.log(`Removed room ${roomName} for chat ID ${chatId}`);
            break;
          }
        }
      }
    }
  };
}

module.exports = SocketManager;
