/** @format */

class ChatHelper {
  total_chat_count = async ({ socket }) => {
    try {
      const user_id = socket?.user_id;
      if (!user_id) {
        socket?.emit("error", { message: "Handshake required" });
        return;
      }
      const ChatService = require("@api/v1/services/chat");
      const chat_service = new ChatService();
      await chat_service.unread_count({ user_id });
    } catch (error) {
      console.error("total_chat_count:", error?.message);
      if (socket) {
        try {
          if (globalThis.io) globalThis.io.emit(`unread_count_${socket.user_id}`, 0);
        } catch (_) {}
      }
    }
  };

  get_all_chats = async ({ socket }) => {
    try {
      const user_id = socket?.user_id;
      if (!user_id) {
        socket?.emit("error", { message: "Handshake required" });
        return;
      }
      // Stub: emit empty list until chat list API is wired (prisma.chats may not exist)
      socket.emit("get_chats_response", []);
    } catch (error) {
      console.error("get_all_chats:", error?.message);
      socket?.emit("error", { message: error?.message || "Failed to get chats" });
    }
  };

  join_private_chat = async ({
    chat_id,
    recipient_id,
    job_id,
    socket,
    users,
    rooms,
  }) => {
    try {
      const user_id = socket?.user_id;
      if (!user_id) {
        socket?.emit("error", { message: "Handshake required" });
        return;
      }
      const roomName = `private-chat-${chat_id}`;
      socket.join(roomName);
      if (rooms) rooms.set(chat_id, roomName);
      if (users) users.set(user_id, socket.id);
      socket.emit("joined_chat", { chat_id, roomName });
    } catch (error) {
      console.error("join_private_chat:", error?.message);
      socket?.emit("error", { message: error?.message || "Failed to join chat" });
    }
  };

  send_private_message = async ({
    chat_id,
    recipient_id,
    message,
    rooms,
    socket,
    users,
    job_id,
    attachment,
    io,
  }) => {
    try {
      const roomName = `private-chat-${chat_id}`;
      if (io) {
        socket.to(roomName).emit("private_message", {
          message,
          attachment,
          sender_id: socket.user_id,
          chat_id,
          job_id,
        });
      }
    } catch (error) {
      console.error("send_private_message:", error?.message);
      socket?.emit("error", { message: error?.message || "Failed to send message" });
    }
  };
}

module.exports = ChatHelper;
