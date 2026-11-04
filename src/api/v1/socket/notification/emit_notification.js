/** @format */

/**
 * Emit a real-time notification to a specific user via their personal socket room.
 * Works from any controller/service after SocketManager has set globalThis.io.
 *
 * @param {string} user_id  — the recipient's user ID
 * @param {object} notification  — { title, message, is_read, created_at, ... }
 *
 * Usage:
 *   const emitNotification = require('@api/v1/socket/notification/emit_notification');
 *   emitNotification(user.id, { title: 'Hello', message: 'Something happened' });
 */
const emitNotification = (user_id, notification) => {
  try {
    const io = globalThis.io;
    if (!io) {
      console.warn('[emitNotification] Socket.io not initialized yet — skipping real-time emit.');
      return;
    }
    io.to(`user-${user_id}`).emit('new_notification', {
      id: notification.id,
      title: notification.title,
      message: notification.message,
      recipient_id: notification.recipient_id,
      metadata: notification.metadata,
      screen_name: notification.screen_name,
      created_at: notification.created_at,
      is_read: notification.is_read,
    });
  } catch (err) {
    // Never crash a request because of a failed socket emit
    console.error('[emitNotification] Emit failed:', err.message);
  }
};

module.exports = emitNotification;
