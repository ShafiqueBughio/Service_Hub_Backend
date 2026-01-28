/** @format */

const express = require("express");
const validate_request = require("@v1_middlewares/validate_request_joi.middleware");
const verify_token = require("@v1_middlewares/verify_token.middleware");
const ChatController = require("@api/v1/controllers/chat");
const ChatValidations = require("@api/v1/validations/chat");

const router = express.Router();
const controller = new ChatController();
const validations = new ChatValidations();

router.get(
  "/:chat_id",
  verify_token,
  validate_request(validations.get_single_chat_schema),
  controller.get_single_chat
);

module.exports = router;
