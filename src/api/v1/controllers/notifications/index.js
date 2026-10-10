const NotificationHelper = require("@api/v1/helpers/notifications.helper");
const Responses = require("@constants/responses");

const responses = new Responses();
const helper    = new NotificationHelper();

class NotificationsController {
  get_all_notifications = async (req, res, next) => {
    try {
      const { user } = req.user;
      const { days = 12, page = 1, limit = 20 } = req.query;

      const result = await helper.get_all_notifications({
        user_id: user.id,
        days,
        page,
        limit,
      });

      const response = responses.ok_response(result, "Successfully fetched notifications");
      return res.status(response.status.code).json(response);
    } catch (error) {
      next(error);
    }
  };

  get_unread_count = async (req, res, next) => {
    try {
      const { user } = req.user;
      const count = await helper.get_unread_count({ user_id: user.id });
      const response = responses.ok_response({ unread_count: count }, "Unread count fetched");
      return res.status(response.status.code).json(response);
    } catch (error) {
      next(error);
    }
  };

  mark_as_read_notification = async (req, res, next) => {
    try {
      const { notification_id } = req.params;
      await helper.mark_read({ notification_id });
      const response = responses.update_success_response(null, "Notification marked as read");
      return res.status(response.status.code).json(response);
    } catch (error) {
      next(error);
    }
  };

  read_all_notifications = async (req, res, next) => {
    try {
      const { user } = req.user;
      await helper.read_all({ user_id: user.id });
      const response = responses.update_success_response(null, "All notifications marked as read");
      return res.status(response.status.code).json(response);
    } catch (error) {
      next(error);
    }
  };
}

module.exports = NotificationsController;
