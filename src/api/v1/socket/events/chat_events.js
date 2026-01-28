const ChatHelper = require("../helpers/chat_helpers");
const chat_helper = new ChatHelper();

class ChatEvents {
  constructor(sockets, users, rooms, io) {
    this.users = users;
    this.rooms = rooms;
    this.sockets = sockets;
    this.io = io;

    this.on_initialize(this.sockets);
  }

  on_initialize(socket) {
    socket.on("get_chats", () => {
      this.get_all_chats_of_user({ socket });
    });

    socket.on("typing_starting", ({ chat_id }) => {
      this.typing_started({ socket, chat_id });
    });

    socket.on("typing_stopping", ({ chat_id }) => {
      this.typing_stopped({ socket, chat_id });
    });

    socket.on("get_unread_count", async () => {
      await chat_helper.total_chat_count({ socket });
    });

    socket.on("join_private_chat", ({ chat_id, job_id, recipient_id }) =>
      this.join_single_single({
        socket,
        chat_id,
        job_id,
        recipient_id,
      })
    );

    socket.on(
      "private_chat_message",
      ({ message, chat_id, recipient_id, attachment, job_id }) => {
        this.send_private_message({
          message,
          chat_id,
          recipient_id,
          attachment,
          rooms: this.rooms,
          socket,
          job_id,
          users: this.users,
          io: this.io,
        });
      }
    );

    socket.on("leave_chat", ({ chat_id }) => {
      this.leave_chat({ socket, chat_id });
    });
  }

  leave_chat = async ({ socket, chat_id }) => {
    try {
      if (!chat_id) {
        socket.emit("error", { message: "Chat id is required" });
        return;
      }

      const user_id = socket.user_id;
      if (!user_id) {
        socket.emit("error", { message: "Handshake didnt make" });
        return;
      }

      let roomToRemove = `private-chat-${chat_id}`;

      // Ensure the socket leaves the room
      socket.leave(roomToRemove);
      // console.log(`User ${user_id} left chat room ${roomToRemove}`);

      // Remove the user from the users map
      if (this.users.has(user_id)) {
        this.users.delete(user_id);
        console.log(`Removed user ${user_id} from users map.`);
      }

      // Remove the user from the room map and delete the room if empty
      if (this.rooms.has(chat_id)) {
        const roomUsers = this.rooms.get(chat_id);

        if (roomUsers === roomToRemove) {
          this.rooms.delete(chat_id);
          console.log(`Deleted room ${roomToRemove} for chat ID ${chat_id}`);
        }
      }

      // Notify others in the room
      socket.to(roomToRemove).emit("user_left", { user_id, chat_id });

      // Confirm user has left
      socket.emit("left_chat", {
        message: `You have left the chat ${chat_id}`,
      });
    } catch (error) {
      console.log(error);
      socket.emit("error", { message: error.message });
    }
  };

  join_single_single = async ({ chat_id, recipient_id, job_id, socket }) => {
    try {
      await chat_helper.join_private_chat({
        chat_id,
        recipient_id,
        job_id,
        socket,
        users: this.users,
        rooms: this.rooms,
      });
    } catch (error) {
      console.log(error);
      socket.emit("error", { message: error.message });
    }
  };

  send_private_message = async ({
    message,
    chat_id,
    recipient_id,
    attachment,
    rooms,
    users,
    socket,
    job_id,
    io,
  }) => {
    try {
      await chat_helper.send_private_message({
        chat_id,
        recipient_id,
        message,
        rooms,
        socket,
        users,
        job_id,
        attachment,
        io,
      });

      socket.emit("private_message_success", "message sent successfully");
    } catch (error) {
      console.log(error);
      socket.emit("error", { message: error.message });
    }
  };

  get_all_chats_of_user = async ({ socket }) => {
    try {
      await chat_helper.get_all_chats({ socket });
    } catch (error) {
      console.log(error.message);
      socket.emit("error", { message: error.message });
    }
  };



  typing_started = ({ socket, chat_id }) => {
    try {
      const room = `private-chat-${chat_id}`;

      socket.to(room).emit("is_typing", {
        status: true,
      });
    } catch (error) {
      console.log(error, "typing started");
      socket.emit(error);
    }
  };

  typing_stopped = ({ socket, chat_id }) => {
    try {
      const room = `private-chat-${chat_id}`;

      socket.to(room).emit("is_typing", {
        status: false,
      });
    } catch (error) {
      console.log(error, "typing stopped");
      socket.emit(error);
    }
  };
}

module.exports = ChatEvents;
