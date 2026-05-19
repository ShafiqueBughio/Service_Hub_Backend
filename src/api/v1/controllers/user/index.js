/** @format */

const UserService = require("@api/v1/services/user");
const Responses = require("@constants/responses");
const send_email = require("@configs/email");

const responses = new Responses();
const service = new UserService();

const mergeProfileMedia = (body, media = {}) => ({
  ...body,
  ...(media.profile_picture?.[0]?.path
    ? { profile_picture: media.profile_picture[0].path }
    : {}),
  ...(media.business_license?.[0]?.path
    ? { business_license: media.business_license[0].path }
    : {}),
  ...(media.certifications?.length
    ? { certifications: media.certifications.map((file) => file.path) }
    : {}),
  ...(media.portfolio_images?.length
    ? { portfolio_images: media.portfolio_images.map((file) => file.path) }
    : {}),
});

class UserController {
  register_user = async (req, res, next) => {
    try {
      const { identifier, password, user_type, fcm_token } = req.body;

      const { user } = await service.register_user({
        identifier,
        password,
        user_type,
        fcm_token,
      });

      const response = responses.ok_response(
        { email: user.email },
        "Account created successfully. OTP sent to your email."
      );
      return res.status(response.status.code).json(response);
    } catch (error) {
      next(error);
    }
  };

  login_user = async (req, res, next) => {
    try {
      const { identifier, password, fcm_token } = req.body;

      const data = await service.login_user({
        identifier,
        password,
        fcm_token,
      });

      return responses.send_ok_with_refresh_cookie(
        res,
        data,
        "Login Success"
      );
    } catch (error) {
      next(error);
    }
  };

  verify_otp = async (req, res, next) => {
    try {
      const { identifier, otp, fcm_token } = req.body;

      const data = await service.verify_otp({ identifier, otp, fcm_token });

      return responses.send_ok_with_refresh_cookie(
        res,
        data,
        "OTP verified successfully."
      );
    } catch (error) {
      next(error);
    }
  };

  forget_password = async (req, res, next) => {
    try {
      const { identifier } = req.body;

      const data = await service.forget_password({
        identifier,
      });


      const response = responses.ok_response(
        data,
        "OTP sent to your email. Please verify OTP."
      );
      return res.status(response.status.code).json(response);
    } catch (error) {
      next(error);
    }
  };

  reset_password = async (req, res, next) => {
    try {
      const { password } = req.body;
      const user = req.user?.user;

      if (!user) {
        throw responses.unauthorized_response("Access token required. Please verify OTP first.");
      }

      await service.reset_password({ user, password });

      const response = responses.ok_response(
        null,
        "Password reset successfully"
      );
      return res.status(response.status.code).json(response);
    } catch (error) {
      next(error);
    }
  };

  change_password = async (req, res, next) => {
    try {
      const { user } = req.user;
      const { password, old_password } = req.body;

      await service.change_password({ user, password, old_password });

      const response = responses.ok_response(
        null,
        "Password changed successfully"
      );
      return res.status(response.status.code).json(response);
    } catch (error) {
      next(error);
    }
  };

  resend_otp = async (req, res, next) => {
    try {
      const { identifier } = req.body;

      await service.resend_otp({ identifier });

      const response = responses.ok_response(
        null,
        "OTP resent successfully. Please check your email."
      );
      return res.status(response.status.code).json(response);
    } catch (error) {
      next(error);
    }
  };

  social_login = async (req, res, next) => {
    try {
      const { token, fcm_token, user_type, social_type } = req.body;

      const data = await service.social_login({
        token,
        fcm_token,
        user_type,
        social_type,
      });

      return responses.send_ok_with_refresh_cookie(
        res,
        data,
        "Login Success"
      );
    } catch (error) {
      next(error);
    }
  };

  delete_user = async (req, res, next) => {
    try {
      const { user } = req.user;

      await service.delete_user({ user });

      const response = responses.ok_response(
        null,
        `User deleted successfully.`
      );
      return res.status(response.status.code).json(response);
    } catch (error) {
      next(error);
    }
  };

  logout_user = async (req, res, next) => {
    try {
      const refresh_token =
        req.cookies?.refresh_token || req.body?.refresh_token;

      if (!refresh_token) {
        throw responses.bad_request_response(
          "Refresh token required. Send via cookie or request body."
        );
      }

      await service.logout_user({ refresh_token });

      responses.clear_refresh_token_cookie(res);

      const response = responses.ok_response(null, "User logout successful.");
      return res.status(response.status.code).json(response);
    } catch (error) {
      next(error);
    }
  };

  refresh_user = async (req, res, next) => {
    try {
      const refresh_token = req.cookies?.refresh_token;

      if (!refresh_token) {
        throw responses.bad_request_response(
          "Refresh token required. Please login again."
        );
      }

      const { access_token } = await service.refresh_user({
        refresh_token,
      });

      const response = responses.ok_response(
        { access_token },
        "New Access Token generated successfully."
      );
      return res.status(response.status.code).json(response);
    } catch (error) {
      next(error);
    }
  };

  get_me = async (req, res, next) => {
    try {
      const { user } = req.user;

      const { db_user } = await service.get_user_profile({ id: user.id });

      const response = responses.ok_response(db_user, "User Data");
      return res.status(response.status.code).json(response);
    } catch (error) {
      next(error);
    }
  };

  get_profile = async (req, res, next) => {
    try {
      const { user } = req.user;

      const { db_user } = await service.get_user_profile({ id: user.id });

      const response = responses.ok_response(db_user, "Profile fetched successfully.");
      return res.status(response.status.code).json(response);
    } catch (error) {
      next(error);
    }
  };

  update_profile = async (req, res, next) => {
    try {
      const { user } = req.user;
      const profile_picture = req.media?.profile_picture?.[0]?.path || null;

      await service.edit_profile({
        id: user.id,
        data: { ...req.body, ...(profile_picture && { profile_picture }) },
      });

      const response = responses.ok_response(
        null,
        "Your profile updated successfully."
      );
      return res.status(response.status.code).json(response);
    } catch (error) {
      next(error);
    }
  };

  get_user_by_id = async (req, res, next) => {
    try {
      const { user_id } = req.params;

      const { db_user } = await service.get_user_profile({ id: user_id });

      const response = responses.ok_response(db_user, "User Data");
      return res.status(response.status.code).json(response);
    } catch (error) {
      next(error);
    }
  };

  edit_user_profile = async (req, res, next) => {
    try {
      const { user } = req.user;
      const profile_picture = req.media?.profile_picture?.[0]?.path || null;

      await service.edit_profile({
        id: user.id,
        data: { ...req.body, ...(profile_picture && { profile_picture }) },
      });

      const response = responses.ok_response(
        null,
        "Your profile updated successfully."
      );
      return res.status(response.status.code).json(response);
    } catch (error) {
      next(error);
    }
  };

  edit_profile_picture = async (req, res, next) => {
    try {
      const { user } = req.user;

      await service.update_profile_picture({
        id: user.id,
        data: { profile_picture: req.media.profile_picture[0].path },
      });

      const response = responses.ok_response(
        null,
        "Your profile updated successfully."
      );
      return res.status(response.status.code).json(response);
    } catch (error) {
      next(error);
    }
  };

  create_user_profile = async (req, res, next) => {
    try {
      const { user } = req.user;

      const data = await service.create_profile({
        user,
        data: mergeProfileMedia(req.body, req.media),
      });

      const response = responses.ok_response(
        data,
        "Your profile created successfully."
      );
      return res.status(response.status.code).json(response);
    } catch (error) {
      next(error);
    }
  };

  get_all_users = async (_, res) => {
    try {
      const { users } = await service.get_all_user();

      const response = responses.ok_response(users, "All users.");
      return res.status(response.status.code).json(response);
    } catch (error) {
      next(error);
    }
  };

  get_about = async (req, res, next) => {
    try {
      const { user } = req.user;
      const { refresh_token } = req.query;

      const data = await service.get_about({ user, refresh_token });

    
      const response = responses.ok_response(
        data,
        "About Fetched Successfully"
      );
      return res.status(response.status.code).json(response);
    } catch (error) {
      next(error);
    }
  };

  get_user_referral_code = async (req, res, next) => {
    try {
      const { user } = req.user;

      const data = await service.get_referral({ user_id: user.id });

      const response = responses.ok_response(
        data,
        "Successfully fetched top performerce"
      );
      return res.status(response.status.code).json(response);
    } catch (error) {
      next(error);
    }
  };

  create_user_documents = async (req, res, next) => {
    try {
      const id_front = req.media.id_front[0].path;
      const id_back = req.media.id_back[0].path;
      const { user } = req.user;

      await service.create_documents({
        id_front,
        id_back,
        user_id: user.id,
      });

      const response = responses.ok_response(
        null,
        "Successfully uploaded documents"
      );
      return res.status(response.status.code).json(response);
    } catch (error) {
      next(error);
    }
  };

  update_fcm_token = async (req, res, next) => {
    try {
      const { refresh_token, fcm_token } = req.body;

      await service.change_fcm({ refresh_token, fcm_token });

      const response = responses.update_success_response(
        null,
        "Successfully updated user fcm"
      );
      return res.status(response.status.code).json(response);
    } catch (error) {
      next(error);
    }
  };

  change_location = async (req, res, next) => {
    try {
      const { user } = req.user;

      await service.edit_profile({
        id: user.id,
        data: req.body,
      });

      const response = responses.ok_response(
        null,
        "Your profile location updated."
      );
      return res.status(response.status.code).json(response);
    } catch (error) {
      next(error);
    }
  };
}
module.exports = UserController;