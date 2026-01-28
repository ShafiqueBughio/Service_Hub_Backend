/** @format */

const jwt = require("jsonwebtoken");

class TokenService {
  constructor(secret_key) {
    this.secret_key = secret_key;
  }

  // Generate an access token
  generate_access_token(id, type) {
    return jwt.sign({ id, type }, this.secret_key, { expiresIn: "7d" }); // Expires in 7 day
  }

  // Generate a refresh token
  generate_refresh_token(id, type) {
    return jwt.sign({ id, type }, this.secret_key, { expiresIn: "14d" }); // Expires in 14 days
  }

  // Verify and decode the access token
  verify_access_token(accessToken) {
    try {
      const { id, type } = jwt.verify(accessToken, this.secret_key);

      return { id, type };
    } catch (error) {
      return null; // Token verification failed
    }
  }

  // Refresh the access token using the refresh token
  refresh_access_token(refreshToken) {
    try {
      const decoded = jwt.verify(refreshToken, this.secret_key);
      const { id, type } = decoded;
      return this.generate_access_token(id, type);
    } catch (error) {
      return null; // Token verification failed
    }
  }
}

module.exports = TokenService;
