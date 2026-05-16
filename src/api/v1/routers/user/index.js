/** @format */

const express = require("express");
const rateLimit = require("express-rate-limit");
const user_type_check = require("@v1_middlewares/user_type_check.middleware");
const validate_request = require("@v1_middlewares/validate_request_joi.middleware");
const verify_token = require("@v1_middlewares/verify_token.middleware");
const verify_token_optional = require("@v1_middlewares/verify_token_optional.middleware");
const handle_multipart_data = require("@v1_middlewares/populate_multipart_data.middleware");
const upload_media = require("@api/v1/middlewares/upload_media.middleware");
const UserSchema = require("@v1_validations/user");
const UserController = require("@api/v1/controllers/user");

const validations = new UserSchema();
const controller = new UserController();

const router = express.Router();

// Rate limiter: max 5 OTP attempts per IP per 10 minutes
const otp_rate_limiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 5,
  message: {
    status: { code: 429, success: false },
    data: null,
    message: "Too many OTP attempts. Please try again after 10 minutes.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

//register
router.post(
  "/register",
  validate_request(validations.register_schema),
  controller.register_user,
);

//verify_otp — no token needed, user_id comes in body
router.post(
  "/verify_otp",
  otp_rate_limiter,
  validate_request(validations.verify_otp_schema),
  controller.verify_otp,
);

//resend_otp
router.post(
  "/resend_otp",
  validate_request(validations.resend_otp_schema),
  controller.resend_otp,
);

//login
router.post(
  "/login",
  validate_request(validations.login_schema),
  controller.login_user,
);

//forget_password
router.post(
  "/forget_password",
  validate_request(validations.forget_password_schema),
  controller.forget_password,
);

//reset_password (requires access_token from forget_password + verify_otp flow)
router.post(
  "/reset_password",
  verify_token,
  validate_request(validations.reset_password_schema),
  controller.reset_password,
);

//change_password
router.post(
  "/change_password",
  verify_token,
  validate_request(validations.change_password_schema),
  controller.change_password,
);

//social_login
router.post(
  "/social_login",
  validate_request(validations.social_login_schema),
  controller.social_login,
);

//delete
router.delete("/", verify_token, controller.delete_user);

//get_all
router.get("/", verify_token, controller.get_all_users);

//logout
router.post(
  "/logout",
  validate_request(validations.logout_schema),
  verify_token,
  controller.logout_user,
);

//refresh_token
router.post(
  "/refresh_token",
  validate_request(validations.logout_schema),
  controller.refresh_user,
);

//get_profile
router.get(
  "/profile",
  verify_token,
  validate_request(validations.get_profile_schema),
  controller.get_profile,
);

//update_profile (works for both USER and CONTRACTOR)
router.patch(
  "/profile",
  verify_token,
  handle_multipart_data(),
  upload_media,
  validate_request(validations.update_profile_schema),
  controller.update_profile,
);

//create_user_profile
router.post(
  "/create_user_profile",
  verify_token,
  handle_multipart_data(),
  upload_media,
  user_type_check("USER"),
  validate_request(validations.create_user_profile_schema),
  controller.create_user_profile,
);

//create_contractor_profile
router.post(
  "/create_contractor_profile",
  verify_token,
  handle_multipart_data(),
  upload_media,
  user_type_check("CONTRACTOR"),
  validate_request(validations.create_contractor_profile_schema),
  controller.create_user_profile,
);

//edit_user_profile (legacy route - use /profile instead)
router.patch(
  "/update_user_profile",
  verify_token,
  handle_multipart_data(),
  upload_media,
  validate_request(validations.edit_user_profile_schema),
  controller.edit_user_profile,
);

//edit_user_profile_picture
router.patch(
  "/profile_picture",
  verify_token,
  handle_multipart_data(["profile_picture"]),
  upload_media,
  validate_request(validations.edit_user_profile_picture_schema),
  controller.edit_profile_picture,
);

router.get(
  "/me",
  verify_token,
  validate_request(validations.get_about_of_self_user_schema),
  controller.get_about,
);

router.patch(
  "/update_fcm",
  verify_token,
  validate_request(validations.update_fcm),
  controller.update_fcm_token,
);

module.exports = router;
