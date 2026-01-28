const ChatService = require("@api/v1/services/chat");
const Responses = require("@constants/responses");

const responses = new Responses();
const service = new ChatService();

class ChatController {
  get_single_chat = async (req, res, next) => {
    try {
      const { chat_id } = req.params;
      const { user } = req.user;

      const data = await service.get_single_chat({ chat_id, user_id: user.id });

      const response = responses.ok_response(
        data,
        "Successfully received chat "
      );

      return res.status(response.status.code).json(response);
    } catch (error) {
      next(error);
    }
  };
}

module.exports = ChatController;
