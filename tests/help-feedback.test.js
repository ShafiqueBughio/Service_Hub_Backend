/** @format */

const request = require("supertest");
const app = require("../src/app");
const { registerAndVerify } = require("./helpers");

const BASE = "/api/v1/help_and_feedback";
let token;

beforeAll(async () => {
  const user = await registerAndVerify(app, "USER");
  token = user.token;
});

describe("Help and Feedback (TEST_CASES: TC-HF)", () => {
  test("TC-HF-01: Send help and feedback – valid", async () => {
    if (!token) return;
    const res = await request(app)
      .post(`${BASE}/`)
      .set("Authorization", `Bearer ${token}`)
      .send({ subject: "Bug report", message: "Description of issue" });
    expect([200, 201]).toContain(res.status);
  });

  test("TC-HF-02: Send help and feedback – missing subject (400)", async () => {
    if (!token) return;
    const res = await request(app)
      .post(`${BASE}/`)
      .set("Authorization", `Bearer ${token}`)
      .send({ message: "Only message" });
    expect(res.status).toBe(400);
  });

  test("TC-HF-04: Send help and feedback – no token (401)", async () => {
    const res = await request(app)
      .post(`${BASE}/`)
      .send({ subject: "S", message: "M" });
    expect(res.status).toBe(401);
  });

  test("TC-HF-03: Get help and feedback list – valid token", async () => {
    if (!token) return;
    const res = await request(app)
      .get(`${BASE}/`)
      .set("Authorization", `Bearer ${token}`);
    expect(res.status).toBe(200);
  });
});
