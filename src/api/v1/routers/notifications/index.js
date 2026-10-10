/** @format */

const express = require("express");
const verify_token        = require("@v1_middlewares/verify_token.middleware");
const validate_request    = require("@v1_middlewares/validate_request_joi.middleware");
const NotificationsController  = require("@api/v1/controllers/notifications");
const NotificationsValidations = require("@api/v1/validations/notifications");

const router      = express.Router();
const controller  = new NotificationsController();
const validations = new NotificationsValidations();

// GET  /notifications?days=12&page=1&limit=20
router.get(
  "/",
  verify_token,
  validate_request(validations.get_all_notifications),
  controller.get_all_notifications
);

// GET  /notifications/unread_count  — independent of date range, used by Navbar badge
router.get(
  "/unread_count",
  verify_token,
  validate_request(validations.get_unread_count),
  controller.get_unread_count
);

// PATCH /notifications/read_all
router.patch(
  "/read_all",
  verify_token,
  validate_request(validations.read_all),
  controller.read_all_notifications
);

// PATCH /notifications/:notification_id
router.patch(
  "/:notification_id",
  verify_token,
  validate_request(validations.mark_as_read),
  controller.mark_as_read_notification
);

module.exports = router;
