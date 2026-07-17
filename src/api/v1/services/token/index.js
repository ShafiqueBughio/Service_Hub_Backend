/** @format */

const jwt = require("jsonwebtoken");

class TokenService {
  constructor(secret_key) {
    this.secret_key = secret_key;
  }

  // Generate an access token
  generate_access_token(id, type) {
    return jwt.sign({ id, type }, this.secret_key, { expiresIn: "7d" });
  }

  // Generate a refresh token
  generate_refresh_token(id, type) {
    return jwt.sign({ id, type }, this.secret_key, { expiresIn: "14d" });
  }

  // Generate a short-lived password reset token (15 minutes, single-purpose)
  generate_reset_token(id) {
    return jwt.sign({ id, purpose: "password_reset" }, this.secret_key, {
      expiresIn: "15m",
    });
  }

  // Verify and decode the access token
  verify_access_token(accessToken) {
    try {
      const { id, type } = jwt.verify(accessToken, this.secret_key);
      return { id, type };
    } catch (error) {
      return null;
    }
  }

  // Verify a password reset token — must have purpose: "password_reset"
  verify_reset_token(resetToken) {
    try {
      const decoded = jwt.verify(resetToken, this.secret_key);
      if (decoded.purpose !== "password_reset") return null;
      return { id: decoded.id };
    } catch (error) {
      return null;
    }
  }

  // Refresh the access token using the refresh token
  refresh_access_token(refreshToken) {
    try {
      const decoded = jwt.verify(refreshToken, this.secret_key);
      const { id, type } = decoded;
      return this.generate_access_token(id, type);
    } catch (error) {
      return null;
    }
  }
}

module.exports = TokenService;
