/** @format */

const express = require("express");

const user_type_check = require("@api/v1/middlewares/user_type_check.middleware");
const verify_token = require("@api/v1/middlewares/verify_token.middleware");
const validate_request = require("@api/v1/middlewares/validate_request_joi.middleware");
const TermsAndConditionController = require("@api/v1/controllers/terms_and_conditions");
const TermsAndConditionSchema = require("@api/v1/validations/terms_and_conditions");

const terms_and_conditions_controller = new TermsAndConditionController();
const terms_and_conditions_schema = new TermsAndConditionSchema();

const router = express.Router();

router.post(
  "/",
  verify_token,
  user_type_check("ADMIN"),
  validate_request(
    terms_and_conditions_schema.create_terms_and_condition_schema
  ),
  terms_and_conditions_controller.create_terms_and_condition
);

router.get("/", terms_and_conditions_controller.get_terms_and_conditions);

module.exports = router;
