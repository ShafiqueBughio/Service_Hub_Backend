/** @format */

const Joi = require("joi");

class HelpAndFeedbackSchema {
  create_help_and_feedback_schema = Joi.object({
    query: Joi.object({}),
    params: Joi.object({}),
    body: Joi.object({
      subject: Joi.string().required(),
      message: Joi.string().required(),
    }),
  });
}

module.exports = HelpAndFeedbackSchema;
