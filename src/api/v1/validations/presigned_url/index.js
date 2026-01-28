/** @format */

const Joi = require("joi");

class PresignedUrlSchema {
  generate_upload_url_schema = Joi.object({
    query: Joi.object({}),
    params: Joi.object({}),
    body: Joi.object({
      file_name: Joi.string().required(),
      file_type: Joi.string().required(),
      folder: Joi.string().optional(),
      expires_in: Joi.number().integer().min(60).max(3600).optional(), // 1 minute to 1 hour
    }),
  });

  generate_multiple_upload_urls_schema = Joi.object({
    query: Joi.object({}),
    params: Joi.object({}),
    body: Joi.object({
      files: Joi.array()
        .items(
          Joi.object({
            file_name: Joi.string().required(),
            file_type: Joi.string().required(),
            folder: Joi.string().optional(),
            expires_in: Joi.number().integer().min(60).max(3600).optional(),
          })
        )
        .min(1)
        .required(),
    }),
  });
}

module.exports = PresignedUrlSchema;
