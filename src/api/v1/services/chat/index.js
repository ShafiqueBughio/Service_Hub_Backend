const { prisma } = require("@configs/prisma");

class ChatService {
  #mark_chat_read = async ({ chat_id, user_id }) => {
    return await prisma.chat_messages.updateMany({
      data: {
        is_read: true,
      },
      where: {
        chat_id,
        is_read: false,
        recipient_id: user_id,
      },
    });
  };

  unread_count = async ({ user_id }) => {
    try {
      const unread_count = await prisma.chat_messages.count({
        where: {
          recipient_id: user_id,
          is_read: false,
        },
      });

      // console.log(unread_count, socket?.user_id, user_id, "unread_count");

      globalThis.io.emit(`unread_count_${user_id}`, unread_count);

      console.log(`unread_count_${user_id}`, unread_count);
    } catch (error) {
      console.log(error);
    }
  };

  get_single_chat = async ({ chat_id, user_id }) => {
    const data = await prisma.chats.findUnique({
      where: {
        id: chat_id,
      },
      select: {
        id: true,
        job_id: true,
        user_one_id: true,
        user_two_id: true,
        jobs: {
          select: {
            id: true,
            title: true,
            description: true,
            provider_id: true,
            job_status: true,
            start_time: true,
            job_date: true,
          },
        },
        user_one: {
          select: {
            user_details: {
              select: {
                first_name: true,
                last_name: true,
                profile_picture: true,
                face_verified: true,
                contact_phone: true,
              },
            },

            user_ratings: {
              select: {
                id: true,
                average_ratings: true,
                rating_count: true,
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
                contact_phone: true,
              },
            },
          },
        },

        chat_messages: {
          select: {
            id: true,
            message: true,
            attachment: true,
            is_read: true,
            recipient: {
              select: {
                user_details: {
                  select: {
                    first_name: true,
                    last_name: true,
                    profile_picture: true,
                  },
                },
              },
            },
            sender_id: true,
            createdAt: true,
            recipient_id: true,
          },

          orderBy: {
            createdAt: "desc",
          },
        },
      },
    });

    data.job_already_assigned = data?.jobs?.provider_id != null ? true : false;
    data.chat_allowed = data.jobs.job_status === "COMPLETED" ? false : true;

    const read_count = await this.#mark_chat_read({ chat_id, user_id });

    console.log(read_count, "count");

    await this.unread_count({ user_id });

    data.chat_messages = data.chat_messages.reverse();

    return data;
  };
}

module.exports = ChatService;
