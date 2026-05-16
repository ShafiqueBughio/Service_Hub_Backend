/** @format */

const express = require("express");
const verify_token = require("@v1_middlewares/verify_token.middleware");
const validate_request = require("@v1_middlewares/validate_request_joi.middleware");
const AnalyticsController = require("@api/v1/controllers/analytics");
const AnalyticsSchema = require("@api/v1/validations/analytics");

const router = express.Router();
const controller = new AnalyticsController();
const validations = new AnalyticsSchema();

// Contractor analytics – Job Success Score, Bids Success Rate, Profile Views (screenshot wala)
router.get(
  "/contractor",
  verify_token,
  validate_request(validations.get_contractor_analytics_schema),
  controller.get_contractor_analytics
);

module.exports = router;
