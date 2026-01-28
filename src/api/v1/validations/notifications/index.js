const Joi = require("joi");

class NotificationsValidations {
  get_all_notifications = Joi.object({
    query: Joi.object({
      web: Joi.string().valid("true", "false"),
    }),
    params: Joi.object({}),
    body: Joi.object({}),
  });

  read_all = Joi.object({
    query: Joi.object({}),
    params: Joi.object({}),
    body: Joi.object({}),
  });

  mark_as_read = Joi.object({
    query: Joi.object({}),
    params: Joi.object({
      notification_id: Joi.string().required(),
    }),
    body: Joi.object({}),
  });
}

module.exports = NotificationsValidations;
