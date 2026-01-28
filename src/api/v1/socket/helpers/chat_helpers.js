const Notifications = require("@api/v1/services/notifications");
const TokenService = require("@api/v1/services/token");
const { prisma } = require("@configs/prisma");

const tokenService = new TokenService(process.env.JWT_SECRET_KEY);
const notifier = new Notifications("CHAT");
class ChatHelper {
  #check_join_chat_arguments = ({
    user_id,
    socket,
    chat_id,
    recipient_id,
    job_id,
  }) => {
    if (!user_id) {
      socket.emit("error", {
        message: "Arguments not fulfilled, user_id required",
      });
      return { status: false };
    }

    if (!chat_id && !recipient_id) {
      console.log("no chat_id  recipient_id");

      socket.emit("error", {
        message: "Arguments not fulfilled, chat_id required",
      });
      return { status: false };
    }
    if (!job_id && !recipient_id && !chat_id) {
      console.log("no job_id  recipient_id");

      socket.emit("error", {
        message: "Arguments not fulfilled, job_id is required",
      });
      return { status: false };
    }

    return { status: true, user_id };
  };
  read_private_message = async ({ access_token, message_id }) => {
    if (!access_token) {
      socket.emit("error", {
        message: "Arguments not fulfilled, access_token required",
      });
      return;
    }

    recipient_id = tokenService.verifyAccessToken(access_token)?.id;

    if (!recipient_id) {
      socket.emit("error", { message: "User token invalid or expired" });
      return;
    }
    try {
      const message = await prisma.chat_messages.update({
        data: {
          is_read: true,
        },
        where: {
          recipient_id: Number(recipient_id),
          id: Number(message_id),
        },
      });
      // console.log(message.attachment.length,"ATTACHMENT");
    } catch (error) {
      console.log(error);
      throw new Error(error.message);
    }
  };

  get_all_chats = async ({ socket, receiver_id, users }) => {
    if (!socket) {
      socket.emit("error", {
        message: "Arguments not fulfilled, Handshake is required",
      });
      return;
    }

    let user_id = receiver_id ? receiver_id : socket?.user_id;

    try {
      let all_chats = await prisma.chats.findMany({
        where: {
          OR: [{ user_one_id: user_id }, { user_two_id: user_id }],
          chat_settings: {
            some: {
              user_id: user_id,
              is_deleted: false,
            },
          },
          chat_messages: {
            some: {}, // Ensures at least one message exists
          },
        },

        select: {
          id: true,
          user_one_id: true,
          user_two_id: true,
          job_id: true,
          user_one: {
            select: {
              user_details: {
                select: {
                  first_name: true,
                  last_name: true,
                  profile_picture: true,
                  face_verified: true,
                },
              },
            },
          },
          user_two: {
            select: {
              user_details: {
                select: {
                  first_name: true,
                  last_name: true,
                  profile_picture: true,
                  face_verified: true,
                },
              },
            },
          },
          chat_messages: {
            // where: {
            //   OR: [{ recipient_id: user_id }, { sender_id: user_id }],
            //   is_read: false,
            // },
            orderBy: {
              createdAt: "desc",
            },
            select: {
              id: true,
              createdAt: true,
              message: true,
              is_read: true,
              sender_id: true,
              recipient_id: true,
              attachment: true,
            },
            take: 1,
          },
          jobs: {
            select: {
              id: true,
              title: true,
            },
          },
          _count: {
            select: {
              chat_messages: {
                where: {
                  recipient_id: user_id,
                  is_read: false,
                },
              },
            },
          },
        },
      });

      all_chats.sort(
        (a, b) => b.chat_messages[0].createdAt - a.chat_messages[0].createdAt
      );

      // if (socket?.user_id) {
      //   console.log(users, "my users");
      //   users.set(user_id);
      // }

      if (receiver_id) {
        await this.total_chat_count({ socket, user_id: receiver_id });
        socket.broadcast.emit(`allChats-user_id-${user_id}`, all_chats);
      } else {
        socket.emit(`allChats-user_id-${user_id}`, all_chats);
      }

      // await this.total_chat_count({ socket });
    } catch (error) {
      console.log(error);
      throw new Error(error.message);
    }
  };

  create_chat = async ({ user_one_id, user_two_id, job_id }) => {
    try {
      let chat;
      await prisma.$transaction(async (tx) => {
        chat = await tx.chats.create({
          data: {
            user_one_id,
            user_two_id,
            job_id,
          },
        });
        await tx.chat_settings.create({
          data: {
            chat_id: chat.id,
            user_id: user_one_id,
            is_deleted: false,
          },
        });
        await tx.chat_settings.create({
          data: {
            chat_id: chat.id,
            user_id: user_two_id,
            is_deleted: false,
          },
        });
        return chat;
      });
      return chat;
    } catch (error) {
      return error;
    }
  };

  send_private_message = async ({
    message,
    chat_id,
    recipient_id,
    socket,
    rooms,
    users,
    attachment,
    job_id,
    io,
  }) => {
    const new_chat_id = await this.join_private_chat({
      chat_id,
      recipient_id,
      job_id,
      socket,
      users,
      rooms,
    });

    const user_id = socket.user_id;

    const { message_id, receiver_id, createdAt } =
      await this.create_chat_message({
        message,
        sender_id: user_id,
        chat_id: chat_id ? chat_id : new_chat_id,
        attachment,
        users,
      });
    if (message_id) {
      await this.send_message({
        chat_id: chat_id ? chat_id : new_chat_id,
        message_id,
        message,
        attachment,
        sender_id: user_id,
        socket,
        users,
        recipient_id: receiver_id,
        createdAt,
        io,
      });
      await this.get_all_chats({ socket });
      await this.get_all_chats({ socket, receiver_id: receiver_id });
    }
  };

  create_chat_message = async ({
    message,
    sender_id,
    chat_id,
    attachment,
    users,
    rooms,
  }) => {
    const chat_setting = await prisma.chat_settings.findFirst({
      where: {
        chat_id,
        user_id: { not: sender_id },
      },
    });

    const recipient = await prisma.users.findFirst({
      where: {
        id: chat_setting.user_id,
      },
    });

    const room_name = `private-chat-${chat_id}`;

    const flag =
      users &&
      users.get(recipient.id) === room_name &&
      users.get(sender_id) === room_name
        ? true
        : false;
    // const flag =
    //   users && users.has(recipient.id) && users.has(sender_id) ? true : false;
    const newMessage = await prisma.chat_messages.create({
      data: {
        message,
        attachment,
        sender_id,
        chat_id,
        recipient_id: recipient.id,
        is_read: flag,
      },
    });
    return {
      message_id: newMessage.id,
      fcm_token: recipient.fcm_token,
      receiver_id: recipient.id,
      createdAt: newMessage.createdAt,
    };
  };

  send_message = async ({
    chat_id,
    message,
    attachment,
    sender_id,
    socket,
    message_id,
    recipient_id,
    users,
    createdAt,
    io,
  }) => {
    console.log(users, "users");

    const room = `private-chat-${chat_id}`;

    // Get the number of sockets connected in the room
    const roomSize = io.sockets.adapter.rooms.get(room)?.size || 0;
    console.log(`Number of sockets connected in room ${room}: ${roomSize}`);
    console.log(
      io.sockets.adapter.rooms.get(room),
      "io.sockets.adapter.rooms.get(room)?.size"
    );
    // Emit message to all users in the room
    socket.to(room).emit("privateMessage", [
      {
        message_id,
        message,
        sender_id,
        recipient_id,
        attachment,
        createdAt,
      },
    ]);

    console.log("Message sent to chat room:", room);

    if (users && !users.has(recipient_id)) {
      await notifier.notification_handler({
        title: `You have a new message!!!`,
        message: message,
        recipient_id: recipient_id,
        screen_name: "CHAT", // screen to navigate to (if applicable)
        metadata: JSON.stringify({
          chat_id,
        }),
        save_to_db: false,
      });
    }
  };

  total_chat_count = async ({ socket, user_id }) => {
    try {
      let id = user_id ? user_id : socket?.user_id;
      const unread_count = await prisma.chat_messages.count({
        where: {
          recipient_id: id,
          is_read: false,
        },
      });

      // console.log(unread_count, socket?.user_id, user_id, "unread_count");

      if (user_id) {
        socket.broadcast.emit(`unread_count_${id}`, unread_count);
      } else {
        socket.emit(`unread_count_${id}`, unread_count);
      }
    } catch (error) {
      socket.emit("error", {
        message: error?.message,
      });
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
      // Validate input arguments
      const { status, user_id } = this.#check_join_chat_arguments({
        user_id: socket.user_id,
        chat_id,
        job_id,
        recipient_id,
        socket,
      });

      if (!status) {
        socket.emit("error", { message: "Arguments not fulfilled." });
        return;
      }

      let chat;

      if (!chat_id) {
        // Check for an existing chat in the database
        const existingChat = await prisma.chats.findFirst({
          where: {
            job_id,
            OR: [
              { user_one_id: user_id, user_two_id: recipient_id },
              { user_one_id: recipient_id, user_two_id: user_id },
            ],
          },
        });

        // Create a new chat if none exists
        if (!existingChat) {
          const newChat = await this.create_chat({
            user_one_id: user_id,
            user_two_id: recipient_id,
            job_id,
          });
          chat = newChat.id;
        } else {
          chat = existingChat.id;
        }
      } else {
        // Reactivate the existing chat
        await prisma.chat_settings.updateMany({
          where: { chat_id },
          data: { is_deleted: false },
        });
        chat = chat_id;
      }

      // Join the socket to the private chat room
      const roomName = `private-chat-${chat}`;

      // Check if the user is already in the room
      if (users.get(user_id) === roomName) {
        console.log("users", users);
        console.log(`User ${user_id} is already in chat room ${roomName}`);
        // socket.emit("joined_private_chat_success", { chat_id: chat });
        return chat;
      }
      socket.join(roomName);
      users.set(user_id, roomName); // Track the user's current room
      rooms.set(chat, roomName); // Track the active room

      // console.log(`User ${user_id} joined chat room ${roomName}`);
      socket.emit("joined_private_chat_success", { chat_id: chat });

      return chat;
    } catch (error) {
      console.error("Error joining private chat:", error);
      socket.emit("error", {
        message: "An error occurred while joining the chat. Please try again.",
      });
    }
  };
}

module.exports = ChatHelper;
