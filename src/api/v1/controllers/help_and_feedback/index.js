/** @format */

const HelpAndFeedbackService = require("@api/v1/services/help_and_feedback");
const Responses = require("@constants/responses");

const responses = new Responses();
const help_and_feedback_service = new HelpAndFeedbackService();

class HelpAndFeedbackController {
  send_help_and_feedback = async (req, res, next) => {
    try {
      const { user } = req.user;
      const { subject, message } = req.body;
      const images = req.media.help_and_feedback_images;

      const { help_and_feedback } =
        await help_and_feedback_service.create_help_and_feedback({
          data: {
            message,
            subject,
            sender_id: user.id,
          },
          images,
        });

      // send notification
      const response = responses.ok_response(
        help_and_feedback,
        "Successfully Saved"
      );
      return res.status(response.status.code).json(response);
    } catch (error) {
      next(error);
    }
  };

  get_help_and_feedback = async (req, res, next) => {
    try {
      const { help_and_feedback } =
        await help_and_feedback_service.get_help_and_feedback();
      const response = responses.ok_response(
        help_and_feedback,
        "All help and feedbacks"
      );
      return res.status(response.status.code).json(response);
    } catch (error) {
      next(error);
    }
  };
}

module.exports = HelpAndFeedbackController;
