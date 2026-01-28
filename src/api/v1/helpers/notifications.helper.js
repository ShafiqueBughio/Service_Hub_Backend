const { prisma } = require("@configs/prisma");

class NotificationHelper {
  get_all_notifications = async ({ user_id, web = false }) => {
    const data = await prisma.notifications.findMany({
      where: {
        recipient_id: user_id,
      },
      orderBy:{
        createdAt:"desc"
      }
    });

    web == "false" &&
      (await prisma.notifications.updateMany({
        where: {
          recipient_id: user_id,
        },
        data: {
          is_read: true,
        },
      }));

    return data;
  };

  read_all = async ({ user_id }) => {
    return await prisma.notifications.updateMany({
      where: {
        recipient_id: user_id,
      },
      data: {
        is_read: true,
      },
    });
  };

  mark_read = async ({ notification_id }) => {
    return await prisma.notifications.update({
      where: {
        id: notification_id,
      },
      data: {
        is_read: true,
      },
    });
  };
}

module.exports = NotificationHelper;
