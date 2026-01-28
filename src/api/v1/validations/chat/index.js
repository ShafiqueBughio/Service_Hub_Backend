const Joi = require("joi");

class ChatValidations {
  get_single_chat_schema = Joi.object({
    query: Joi.object({}),
    params: Joi.object({
      chat_id: Joi.string().required(),
    }),
    body: Joi.object({}),
  });
}

module.exports = ChatValidations;
