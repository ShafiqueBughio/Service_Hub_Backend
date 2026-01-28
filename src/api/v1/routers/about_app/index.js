/** @format */

const express = require("express");
const verify_token = require("@v1_middlewares/verify_token.middleware");
const validate_request = require("@v1_middlewares/validate_request_joi.middleware");
const user_type_check = require("@api/v1/middlewares/user_type_check.middleware");
const AboutAppSchema = require("@api/v1/validations/about_app");
const AboutAppController = require("@api/v1/controllers/about_app");

const about_app_schema = new AboutAppSchema();
const about_app_controller = new AboutAppController();
const router = express.Router();

router.post(
  "/",
  verify_token,
  user_type_check("ADMIN"),
  validate_request(about_app_schema.create_about_app_schema),
  about_app_controller.create_about_app
);
router.get("/", about_app_controller.get_about_app);

module.exports = router;
