/** @format */

const Joi = require("joi");

class AboutAppSchema {
  create_about_app_schema = Joi.object({
    query: Joi.object({}),
    params: Joi.object({}),
    body: Joi.object({
      data: Joi.string().required(),
    }),
  });
}

module.exports = AboutAppSchema;
