/** @format */

const { prisma } = require("@configs/prisma");

const Responses = require("@constants/responses");
const responses = new Responses();

class ChatService {
  #mark_chat_read = async ({ chat_id, user_id }) => {
    return await prisma.chatMessage.updateMany({
      data: { is_read: true },
      where: {
        chat_id,
        is_read: false,
        recipient_id: user_id,
      },
    });
  };

  unread_count = async ({ user_id }) => {
    try {
      const count = await prisma.chatMessage.count({
        where: { recipient_id: user_id, is_read: false },
      });
      if (globalThis.io) globalThis.io.emit(`unread_count_${user_id}`, count);
    } catch (error) {
      console.error("unread_count:", error?.message);
    }
  };

  /**
   * Get or create chat for a job. Only for ACTIVE job (bid accepted, not completed).
   * Caller must be job owner (user_id) or accepted bid contractor.
   */
  get_or_create_chat_by_job = async ({ job_id, user_id }) => {
    const job = await prisma.job.findUnique({
      where: { id: job_id },
      include: {
        user: {
          select: {
            id: true,
            user_details: {
              select: { first_name: true, last_name: true, profile_picture: true },
            },
          },
        },
        accepted_bid: {
          select: {
            contractor_id: true,
            contractor: {
              select: {
                id: true,
                user_details: {
                  select: { first_name: true, last_name: true, profile_picture: true },
                },
              },
            },
          },
        },
      },
    });
    if (!job) throw responses.not_found_response("Job not found.");
    if (!job.accepted_bid_id || !job.accepted_bid) {
      throw responses.bad_request_response("No bid accepted for this job. Chat is available only for active jobs.");
    }
    const contractor_id = job.accepted_bid.contractor_id;
    const owner_id = job.user_id;
    if (user_id !== owner_id && user_id !== contractor_id) {
      throw responses.forbidden_response("You are not part of this job.");
    }
    let chat = await prisma.chat.findUnique({
      where: { job_id },
      include: {
        job: {
          select: {
            id: true,
            title: true,
            status: true,
            is_completed: true,
          },
        },
        messages: {
          orderBy: { created_at: "asc" },
          include: {
            sender: {
              select: {
                id: true,
                user_details: {
                  select: { first_name: true, last_name: true, profile_picture: true },
                },
              },
            },
          },
        },
      },
    });
    if (!chat) {
      chat = await prisma.chat.create({
        data: { job_id },
        include: {
          job: {
            select: {
              id: true,
              title: true,
              status: true,
              is_completed: true,
            },
          },
          messages: true,
        },
      });
      chat.messages = [];
    }
    const other_user = user_id === owner_id ? job.accepted_bid.contractor : job.user;
    const chat_allowed = !job.is_completed; // completed hone k baad message nahi bhej sakte
    await this.#mark_chat_read({ chat_id: chat.id, user_id });
    await this.unread_count({ user_id });
    return {
      id: chat.id,
      job_id: chat.job_id,
      job: chat.job,
      other_participant: other_user,
      chat_allowed,
      messages: chat.messages || [],
    };
  };

  /**
   * Get single chat by chat_id. chat_allowed = false when job is completed (read-only).
   */
  get_single_chat = async ({ chat_id, user_id }) => {
    const chat = await prisma.chat.findUnique({
      where: { id: chat_id },
      include: {
        job: {
          select: {
            id: true,
            title: true,
            status: true,
            is_completed: true,
            user_id: true,
            accepted_bid: {
              select: { contractor_id: true },
            },
          },
        },
        messages: {
          orderBy: { created_at: "asc" },
          include: {
            sender: {
              select: {
                id: true,
                user_details: {
                  select: { first_name: true, last_name: true, profile_picture: true },
                },
              },
            },
            recipient: {
              select: {
                id: true,
                user_details: {
                  select: { first_name: true, last_name: true, profile_picture: true },
                },
              },
            },
          },
        },
      },
    });
    if (!chat) throw responses.not_found_response("Chat not found.");
    const job = chat.job;
    const owner_id = job.user_id;
    const contractor_id = job.accepted_bid?.contractor_id;
    if (user_id !== owner_id && user_id !== contractor_id) {
      throw responses.forbidden_response("You are not part of this chat.");
    }
    const chat_allowed = !job.is_completed;
    await this.#mark_chat_read({ chat_id, user_id });
    await this.unread_count({ user_id });
    return {
      ...chat,
      chat_allowed,
    };
  };

  /**
   * Save message (socket/API). Fails if job is completed (chat_allowed = false).
   */
  save_message = async ({ chat_id, sender_id, recipient_id, message, attachment }) => {
    const chat = await prisma.chat.findUnique({
      where: { id: chat_id },
      include: { job: { select: { is_completed: true } } },
    });
    if (!chat) throw responses.not_found_response("Chat not found.");
    if (chat.job.is_completed) {
      throw responses.bad_request_response("You can't send messages for a completed job.");
    }
    const msg = await prisma.chatMessage.create({
      data: {
        chat_id,
        sender_id,
        recipient_id: recipient_id || null,
        message: message && String(message).trim() ? String(message).trim() : null,
        attachment: attachment && String(attachment).trim() ? String(attachment).trim() : null,
      },
      include: {
        sender: {
          select: {
            id: true,
            user_details: {
              select: { first_name: true, last_name: true, profile_picture: true },
            },
          },
        },
      },
    });
    await this.unread_count({ user_id: recipient_id });
    return msg;
  };
}

module.exports = ChatService;
