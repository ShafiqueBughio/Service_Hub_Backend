/** @format */

const express = require("express");

const verify_token = require("@v1_middlewares/verify_token.middleware");
const validate_request = require("@v1_middlewares/validate_request_joi.middleware");
const NotificationsController = require("@api/v1/controllers/notifications");
const NotificationsValidations = require("@api/v1/validations/notifications");

const router = express.Router();

const controller = new NotificationsController();
const validations = new NotificationsValidations();

router.get(
  "/",
  verify_token,
  validate_request(validations.get_all_notifications),
  controller.get_all_notifications
);

router.patch(
  "/read_all",
  verify_token,
  validate_request(validations.read_all),
  controller.read_all_notifications
);

router.patch(
  "/:notification_id",
  verify_token,
  validate_request(validations.mark_as_read),
  controller.mark_as_read_notification
);

module.exports = router;
