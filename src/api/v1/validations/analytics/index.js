/** @format */

const Joi = require("joi");

class AnalyticsSchema {
  get_contractor_analytics_schema = Joi.object({
    query: Joi.object({
      period: Joi.string().valid("monthly", "weekly").optional(),
    }),
    params: Joi.object({}),
    body: Joi.object({}),
  });
}

module.exports = AnalyticsSchema;
