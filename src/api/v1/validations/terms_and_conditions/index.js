/** @format */

const Joi = require("joi");

class TermsAndConditionSchema {
  create_terms_and_condition_schema = Joi.object({
    query: Joi.object({}),
    params: Joi.object({}),
    body: Joi.object({
      data: Joi.string().required(),
    }),
  });
}

module.exports = TermsAndConditionSchema;
