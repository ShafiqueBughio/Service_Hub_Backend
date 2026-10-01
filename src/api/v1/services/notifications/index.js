const Firebase = require("@configs/firebase/firebase.config");
const { getFirebaseApp } = require("@configs/firebase/firebase.config");
const { getMessaging } = require("firebase-admin/messaging");
const { prisma } = require("@configs/prisma");

class Notifications extends Firebase {
  constructor(name) {
    super(name);
  }

  // Create payload for a single recipient
  // #create_payload = ({
  //   title,
  //   message,
  //   recipient_id,
  //   metadata = {},
  //   screen_name,
  //   token,
  // }) => {
  //   return {
  //     notification: {
  //       title,
  //       body: message,
  //     },
  //     data: {
  //       recipient_id,
  //       screen_name,
  //       ...metadata,
  //     },
  //     token,
  //   };
  // };

  #create_payload = ({
    title,
    message,
    recipient_id,
    metadata = {},
    screen_name,
    fid,
  }) => {
    return {
      notification: {
        title,
        body: message,
      },
      data: {
        recipient_id: String(recipient_id),
        screen_name: screen_name ?? "",
        ...Object.fromEntries(
          Object.entries(metadata).map(([k, v]) => [k, String(v)])
        ),
      },
      token: fid,   // Firebase Admin needs "token" field, not "fid"
    };
  };

  // Send a single notification
  #send_notification = async (payload) => {
    try {
      const app = getFirebaseApp();
      if (!app) {
        console.warn("Firebase is not configured. Notification not sent.");
        return { success: false, error: "Firebase not configured" };
      }
      // v14: use getMessaging(app).send(payload)
      const response = await getMessaging(app).send(payload);
      console.log("Notification sent:", response);
      return { success: true, response };
    } catch (error) {
      console.error("Notification send error:", error.message);
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
  // #save_notification = async ({
  //   title,
  //   message,
  //   recipient_id,
  //   metadata = {},
  //   screen_name,
  // }) => {
  //   try {
  //     return await prisma.notifications.create({
  //       data: {
  //         title,
  //         message,
  //         recipient_id,
  //         metadata,
  //         screen_name,
  //       },
  //     });
  //   } catch (error) {
  //     console.error("Notification save error:", error);
  //   }
  // };

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
        metadata: JSON.stringify(metadata),
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
            fid: session.fcm_token,
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
