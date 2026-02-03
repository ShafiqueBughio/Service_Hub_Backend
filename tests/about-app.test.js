/** @format */

const request = require("supertest");
const app = require("../src/app");

const BASE_ABOUT = "/api/v1/about-app";
const BASE_PRIVACY = "/api/v1/privacy_policy";
const BASE_TERMS = "/api/v1/terms_and_conditions";

describe("About App / Privacy / Terms (TEST_CASES: TC-APP)", () => {
  test("TC-APP-01: Get about app – no auth", async () => {
    const res = await request(app).get(`${BASE_ABOUT}/`);
    expect([200, 404]).toContain(res.status);
  });

  test("TC-APP-02: Get privacy policy", async () => {
    const res = await request(app).get(`${BASE_PRIVACY}/`);
    expect([200, 404]).toContain(res.status);
  });

  test("TC-APP-03: Get terms and conditions", async () => {
    const res = await request(app).get(`${BASE_TERMS}/`);
    expect([200, 404]).toContain(res.status);
  });
});
