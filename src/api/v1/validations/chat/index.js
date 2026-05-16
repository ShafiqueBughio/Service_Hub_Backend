const Joi = require("joi");

class ChatValidations {
  get_single_chat_schema = Joi.object({
    query: Joi.object({}),
    params: Joi.object({
      chat_id: Joi.string().uuid().required(),
    }),
    body: Joi.object({}),
  });

  get_chat_by_job_schema = Joi.object({
    query: Joi.object({}),
    params: Joi.object({
      jobId: Joi.string().uuid().required(),
    }),
    body: Joi.object({}),
  });
}

module.exports = ChatValidations;
