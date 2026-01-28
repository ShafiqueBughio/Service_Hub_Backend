/** @format */

const Joi = require("joi");

class PrivacyPolicySchema {
  create_privacy_policy_schema = Joi.object({
    query: Joi.object({}),
    params: Joi.object({}),
    body: Joi.object({
      data: Joi.string().required(),
    }),
  });
}

module.exports = PrivacyPolicySchema;
