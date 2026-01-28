const Firebase = require("@configs/firebase/firebase.config");
const { prisma } = require("@configs/prisma");

class Notifications extends Firebase {
  constructor(name) {
    super(name);
  }

  // Create payload for a single recipient
  #create_payload = ({
    title,
    message,
    recipient_id,
    metadata = {},
    screen_name,
    token,
  }) => {
    return {
      notification: {
        title,
        body: message,
      },
      data: {
        recipient_id,
        screen_name,
        ...metadata,
      },
      token,
    };
  };

  // Send a single notification
  #send_notification = async (payload) => {
    try {
      if (!this.admin) {
        console.warn("Firebase is not configured. Notification not sent.");
        return { success: false, error: "Firebase not configured" };
      }
      const response = await this.admin.messaging().send(payload);
      console.log("Notification sent:", response);
      return { success: true, response };
    } catch (error) {
      console.error("Notification send error:", error);
      return { success: false, error };
    }
  };

  // Get all FCM tokens for a user
  #get_user_fcms = async ({ user_id }) => {
    return await prisma.user_sessions.findMany({
      where: {
        user_id,
      },
    });
  };

  // Save notification to DB
  #save_notification = async ({
    title,
    message,
    recipient_id,
    metadata = {},
    screen_name,
  }) => {
    try {
      return await prisma.notifications.create({
        data: {
          title,
          message,
          recipient_id,
          metadata,
          screen_name,
        },
      });
    } catch (error) {
      console.error("Notification save error:", error);
    }
  };

  // Public handler to send and save notification
  notification_handler = async ({
    title,
    message,
    recipient_id,
    metadata = {},
    screen_name,
    save_to_db = true,
  }) => {
    try {
      const fcms = await this.#get_user_fcms({ user_id: recipient_id });

      const payloads = fcms
        .filter((session) => session.fcm_token)
        .map((session) =>
          this.#create_payload({
            title,
            message,
            recipient_id,
            metadata,
            screen_name,
            token: session.fcm_token,
          })
        );

      const promises = await Promise.allSettled(
        payloads.map((payload) => this.#send_notification(payload))
      );

      console.log(promises, "notifications promises");

      if (save_to_db) {
        await this.#save_notification({
          title,
          message,
          recipient_id,
          metadata,
          screen_name,
        });
      }
    } catch (error) {
      console.error("Notification handler error:", error);
    }
  };

  // Example: Notify all users via topic (optional)
  // #create_payload_all = (title, message, metadata = {}) => {
  //   return {
  //     topic: "All",
  //     notification: {
  //       title,
  //       body: message,
  //     },
  //     data: {
  //       ...metadata,
  //     },
  //   };
  // };

  // to_all_users = async (title, message, metadata) => {
  //   const payload = this.#create_payload_all(title, message, metadata);
  //   return await this.#send_notification(payload);
  // };
}

module.exports = Notifications;
