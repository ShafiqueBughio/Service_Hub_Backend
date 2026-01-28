/** @format */

const express = require("express");

const verify_token = require("@v1_middlewares/verify_token.middleware");
const validate_request = require("@v1_middlewares/validate_request_joi.middleware");
const user_type_check = require("@api/v1/middlewares/user_type_check.middleware");
const PrivacyPolicyController = require("@api/v1/controllers/privacy_policy");
const PrivacyPolicySchema = require("@api/v1/validations/privacy_policy");

const privacy_policy_controller = new PrivacyPolicyController();
const privacy_policy_schema = new PrivacyPolicySchema();

const router = express.Router();

router.post(
  "/",
  verify_token,
  user_type_check("ADMIN"),
  validate_request(privacy_policy_schema.create_privacy_policy_schema),
  privacy_policy_controller.create_privacy_policy
);

router.get("/", privacy_policy_controller.create_privacy_policy);

module.exports = router;
