/** @format */

const request = require("supertest");
const app = require("../src/app");

const BASE = "/api/v1/user";
const PASSWORD = "Test@1234";
const BAD_PASSWORD = "plainpassword"; // no special char

describe("Auth API (TEST_CASES: TC-AUTH)", () => {
  let userToken;
  let userRefreshToken;
  let userOtp;
  let userIdentifier;

  describe("Register & Verify OTP", () => {
    test("TC-AUTH-01: Register USER with email – valid body", async () => {
      userIdentifier = `testuser${Date.now()}@example.com`;
      const res = await request(app)
        .post(`${BASE}/register`)
        .send({
          identifier: userIdentifier,
          password: PASSWORD,
          user_type: "USER",
        })
        .expect((e) => {
          if (e.status !== 200 && e.status !== 201) console.log(e.body);
        });
      expect([200, 201]).toContain(res.status);
      expect(res.body).toHaveProperty("user");
      expect(res.body).toHaveProperty("otp");
      expect(res.body).toHaveProperty("access_token");
      expect(res.body).toHaveProperty("refresh_token");
      userToken = res.body.access_token;
      userRefreshToken = res.body.refresh_token;
      userOtp = res.body.otp;
    });

    test("TC-AUTH-04: Register – missing identifier (400)", async () => {
      const res = await request(app)
        .post(`${BASE}/register`)
        .send({ password: PASSWORD, user_type: "USER" });
      expect(res.status).toBe(400);
    });

    test("TC-AUTH-03: Register – invalid password no special char (400)", async () => {
      const res = await request(app)
        .post(`${BASE}/register`)
        .send({
          identifier: "a@b.com",
          password: BAD_PASSWORD,
          user_type: "USER",
        });
      expect(res.status).toBe(400);
    });

    test("TC-AUTH-05: Verify OTP – valid", async () => {
      if (!userToken || userOtp == null) return;
      const res = await request(app)
        .post(`${BASE}/verify_otp`)
        .set("Authorization", `Bearer ${userToken}`)
        .send({ otp: userOtp });
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("access_token");
      if (res.body.access_token) userToken = res.body.access_token;
    });

    test("TC-AUTH-06: Verify OTP – wrong OTP (400)", async () => {
      const reg = await request(app)
        .post(`${BASE}/register`)
        .send({
          identifier: `wrongotp${Date.now()}@example.com`,
          password: PASSWORD,
          user_type: "USER",
        });
      if (reg.status !== 200 && reg.status !== 201) return;
      const res = await request(app)
        .post(`${BASE}/verify_otp`)
        .set("Authorization", `Bearer ${reg.body.access_token}`)
        .send({ otp: 999999 });
      expect(res.status).toBe(400);
    });
  });

  describe("Login, Profile, Logout", () => {
    test("TC-AUTH-08: Login – valid credentials", async () => {
      if (!userIdentifier) userIdentifier = `testuser${Date.now()}@example.com`;
      const res = await request(app)
        .post(`${BASE}/login`)
        .send({ identifier: userIdentifier, password: PASSWORD });
      if (res.status === 200) {
        userToken = res.body.access_token;
        userRefreshToken = res.body.refresh_token;
      }
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("access_token");
    });

    test("TC-AUTH-09: Login – wrong password (401)", async () => {
      const res = await request(app)
        .post(`${BASE}/login`)
        .send({ identifier: userIdentifier || "test@example.com", password: "WrongPass@1" });
      expect(res.status).toBe(401);
    });

    test("TC-AUTH-17: Get profile without token (401)", async () => {
      const res = await request(app).get(`${BASE}/profile`);
      expect(res.status).toBe(401);
    });

    test("TC-AUTH: Get profile with token", async () => {
      if (!userToken) return;
      const res = await request(app)
        .get(`${BASE}/profile`)
        .set("Authorization", `Bearer ${userToken}`);
      expect(res.status).toBe(200);
    });

    test("TC-AUTH-15: Refresh token – valid (cookie)", async () => {
      if (!userRefreshToken) return;
      const res = await request(app)
        .post(`${BASE}/refresh_token`)
        .set("Cookie", [`refresh_token=${userRefreshToken}`]);
      expect(res.status).toBe(200);
      expect(res.body.data).toHaveProperty("access_token");
    });
  });
});
