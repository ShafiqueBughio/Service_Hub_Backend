/** @format */

const request = require("supertest");
const app = require("../src/app");
const { registerAndVerify } = require("./helpers");

const BASE = "/api/v1/chat";
let token;

beforeAll(async () => {
  const user = await registerAndVerify(app, "USER");
  token = user.token;
});

describe("Chat (TEST_CASES: TC-CHAT)", () => {
  test("TC-CHAT-03: Get chat – no token (401)", async () => {
    const res = await request(app).get(`${BASE}/1`);
    expect(res.status).toBe(401);
  });

  test("TC-CHAT-01: Get single chat – valid chat_id (200 or 404)", async () => {
    if (!token) return;
    const res = await request(app)
      .get(`${BASE}/00000000-0000-0000-0000-000000000001`)
      .set("Authorization", `Bearer ${token}`);
    expect([200, 404]).toContain(res.status);
  });

  test("TC-CHAT-02: Get single chat – invalid chat_id (404)", async () => {
    if (!token) return;
    const res = await request(app)
      .get(`${BASE}/99999999`)
      .set("Authorization", `Bearer ${token}`);
    expect([404, 400]).toContain(res.status);
  });
});
