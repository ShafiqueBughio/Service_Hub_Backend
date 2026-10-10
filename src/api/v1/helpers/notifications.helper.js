const { prisma } = require("@configs/prisma");

const ALLOWED_DAYS  = [12, 60];
const DEFAULT_DAYS  = 12;
const DEFAULT_LIMIT = 20;
const MAX_LIMIT     = 50;

class NotificationHelper {
  /**
   * Fetch paginated notifications for a user within a date range.
   * Never auto-marks notifications as read — that is an explicit action only.
   */
  get_all_notifications = async ({ user_id, days, page, limit }) => {
    // Sanitise inputs
    const safeDays  = ALLOWED_DAYS.includes(Number(days))  ? Number(days)  : DEFAULT_DAYS;
    const safePage  = Number(page)  >= 1                   ? Number(page)  : 1;
    const safeLimit = Math.min(Number(limit) >= 1 ? Number(limit) : DEFAULT_LIMIT, MAX_LIMIT);
    const skip      = (safePage - 1) * safeLimit;

    // Date cutoff
    const cutoff = new Date(Date.now() - safeDays * 24 * 60 * 60 * 1000);

    const where = {
      recipient_id: user_id,
      created_at: { gte: cutoff },
    };

    // Run count + data in parallel for efficiency
    const [total, data] = await Promise.all([
      prisma.notifications.count({ where }),
      prisma.notifications.findMany({
        where,
        orderBy: { created_at: "desc" },
        take:    safeLimit,
        skip,
      }),
    ]);

    const totalPages = Math.ceil(total / safeLimit);

    return {
      data,
      pagination: {
        total,
        page:        safePage,
        limit:       safeLimit,
        totalPages,
        hasNextPage: safePage < totalPages,
        days:        safeDays,
      },
    };
  };

  /**
   * Fetch unread count for the authenticated user across ALL time.
   * Used by the Navbar badge — independent of the selected date range.
   */
  get_unread_count = async ({ user_id }) => {
    return prisma.notifications.count({
      where: { recipient_id: user_id, is_read: false },
    });
  };

  read_all = async ({ user_id }) => {
    return prisma.notifications.updateMany({
      where: { recipient_id: user_id },
      data:  { is_read: true },
    });
  };

  mark_read = async ({ notification_id }) => {
    return prisma.notifications.update({
      where: { id: notification_id },
      data:  { is_read: true },
    });
  };
}

module.exports = NotificationHelper;
