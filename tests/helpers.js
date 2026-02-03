/** @format */

const request = require("supertest");

const PASSWORD = "Test@1234";
const BASE_USER = "/api/v1/user";

async function registerAndVerify(app, userType = "USER") {
  const prefix = userType === "USER" ? "testuser" : "testcontractor";
  const identifier = `${prefix}+${Date.now()}@example.com`;
  const reg = await request(app).post(`${BASE_USER}/register`).send({
    identifier,
    password: PASSWORD,
    user_type: userType,
  });
  if (reg.status !== 200 && reg.status !== 201) return { token: null, refreshToken: null, identifier };
  const verify = await request(app)
    .post(`${BASE_USER}/verify_otp`)
    .set("Authorization", `Bearer ${reg.body.access_token}`)
    .send({ otp: reg.body.otp });
  const token = verify.body.access_token || reg.body.access_token;
  const refreshToken = verify.body.refresh_token || reg.body.refresh_token;
  return { token, refreshToken, identifier };
}

module.exports = { registerAndVerify, PASSWORD, BASE_USER };
