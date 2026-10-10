const Joi = require("joi");

class NotificationsValidations {
  get_all_notifications = Joi.object({
    query: Joi.object({
      days:  Joi.number().valid(12, 60).default(12),
      page:  Joi.number().integer().min(1).default(1),
      limit: Joi.number().integer().min(1).max(50).default(20),
    }),
    params: Joi.object({}),
    body:   Joi.object({}),
  });

  get_unread_count = Joi.object({
    query:  Joi.object({}),
    params: Joi.object({}),
    body:   Joi.object({}),
  });

  read_all = Joi.object({
    query:  Joi.object({}),
    params: Joi.object({}),
    body:   Joi.object({}),
  });

  mark_as_read = Joi.object({
    query:  Joi.object({}),
    params: Joi.object({
      notification_id: Joi.string().required(),
    }),
    body: Joi.object({}),
  });
}

module.exports = NotificationsValidations;
