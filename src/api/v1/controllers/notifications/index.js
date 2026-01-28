const NotificationHelper = require("@api/v1/helpers/notifications.helper");
const Responses = require("@constants/responses");

const resposes = new Responses();
const helper = new NotificationHelper();

class NotificationsController {
  get_all_notifications = async (req, res, next) => {
    try {
      const { user } = req.user;
      const { web } = req.query;

      const data = await helper.get_all_notifications({
        user_id: user.id,
        web,
      });

      const response = resposes.ok_response(
        data,
        "Successfully fetched notifications"
      );
      return res.status(response.status.code).json(response);
    } catch (error) {
      next(error);
    }
  };

  mark_as_read_notification = async (req, res, next) => {
    try {
      const { notification_id } = req.params;

      await helper.mark_read({ notification_id });

      const response = resposes.update_success_response(
        null,
        "Successfully mark as read notifications"
      );
      return res.status(response.status.code).json(response);
    } catch (error) {
      next(error);
    }
  };

  read_all_notifications = async (req, res, next) => {
    try {
      const { user } = req.user;

      await helper.read_all({ user_id: user.id });

      const response = resposes.update_success_response(
        null,
        "Successfully mark as read notifications"
      );
      return res.status(response.status.code).json(response);
    } catch (error) {
      next(error);
    }
  };
}

module.exports = NotificationsController;
