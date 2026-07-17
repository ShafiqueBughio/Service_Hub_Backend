/** @format */

const { prisma } = require("@configs/prisma");
const TokenService = require("@api/v1/services/token");
const Responses = require("@constants/responses");

const responses = new Responses();
const token_service = new TokenService(process.env.JWT_SECRET_KEY);

/**
 * Middleware for the reset_password route only.
 * Expects:  Authorization: Bearer <reset_token>
 * The reset_token is a short-lived (15 min) JWT with purpose="password_reset".
 * It does NOT create a session — it is single-use for resetting password only.
 */
const verify_reset_token = async (req, res, next) => {
  let reset_token = req.headers.authorization || req.headers.Authorization;

  if (!reset_token) {
    const response = responses.unauthorized_response(
      "Reset token required. Please verify your OTP first."
    );
    return res.status(response.status.code).json(response);
  }

  // Strip "Bearer " prefix
  if (
    reset_token.startsWith("Bearer ") ||
    reset_token.startsWith("bearer ")
  ) {
    reset_token = reset_token.substring(7);
  }

  const decoded = token_service.verify_reset_token(reset_token);

  if (!decoded) {
    const response = responses.session_expired_response(
      "Reset token is invalid or has expired. Please request a new OTP."
    );
    return res.status(response.status.code).json(response);
  }

  const user = await prisma.users.findFirst({
    where: { id: decoded.id },
  });

  if (!user) {
    const response = responses.unauthorized_response("User not found.");
    return res.status(response.status.code).json(response);
  }

  req.user = { user };
  next();
};

module.exports = verify_reset_token;
