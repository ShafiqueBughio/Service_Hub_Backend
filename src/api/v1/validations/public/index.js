const Joi = require("joi");

class PublicValidations {
  get_schema = Joi.object({
    params: Joi.object({}),
    query: Joi.object({
      type: Joi.string().valid("CANCEL", "DISPUTE").required(),
    }),
    body: Joi.object({}),
  });

  get_schema_no_query = Joi.object({
    params: Joi.object({}),
    query: Joi.object({}),
    body: Joi.object({}),
  });

  get_single_profession_schema = Joi.object({
    params: Joi.object({
      profession_id: Joi.string().required(),
    }),
    query: Joi.object({}),
    body: Joi.object({}),
  });
}

module.exports = PublicValidations;
