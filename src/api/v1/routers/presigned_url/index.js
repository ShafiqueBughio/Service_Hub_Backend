/** @format */

const express = require("express");
const verify_token = require("@v1_middlewares/verify_token.middleware");
const validate_request = require("@v1_middlewares/validate_request_joi.middleware");
const PresignedUrlController = require("@api/v1/controllers/presigned_url");
const PresignedUrlSchema = require("@api/v1/validations/presigned_url");

const router = express.Router();
const controller = new PresignedUrlController();
const validations = new PresignedUrlSchema();

// Generate single presigned URL
router.post(
  "/upload-url",
  verify_token,
  validate_request(validations.generate_upload_url_schema),
  controller.generate_upload_url
);

// Generate multiple presigned URLs
router.post(
  "/upload-urls",
  verify_token,
  validate_request(validations.generate_multiple_upload_urls_schema),
  controller.generate_multiple_upload_urls
);

module.exports = router;
