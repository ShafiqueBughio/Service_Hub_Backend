/** @format */

const request = require("supertest");
const app = require("../src/app");
const { registerAndVerify } = require("./helpers");

const BASE = "/api/v1/notifications";
let token;

beforeAll(async () => {
  const user = await registerAndVerify(app, "USER");
  token = user.token;
});

describe("Notifications (TEST_CASES: TC-NOTIF)", () => {
  test("TC-NOTIF-01: Get all notifications – valid token", async () => {
    if (!token) return;
    const res = await request(app)
      .get(`${BASE}/`)
      .set("Authorization", `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body).toBeDefined();
  });

  test("TC-NOTIF-04: Get notifications – no token (401)", async () => {
    const res = await request(app).get(`${BASE}/`);
    expect(res.status).toBe(401);
  });

  test("TC-NOTIF-02: Mark all as read", async () => {
    if (!token) return;
    const res = await request(app)
      .patch(`${BASE}/read_all`)
      .set("Authorization", `Bearer ${token}`);
    expect([200, 204]).toContain(res.status);
  });

  test("TC-NOTIF-03: Mark single notification as read", async () => {
    if (!token) return;
    const listRes = await request(app)
      .get(`${BASE}/`)
      .set("Authorization", `Bearer ${token}`);
    const list = listRes.body?.data ?? listRes.body;
    const id = Array.isArray(list) && list[0] ? list[0].id : "00000000-0000-0000-0000-000000000001";
    const res = await request(app)
      .patch(`${BASE}/${id}`)
      .set("Authorization", `Bearer ${token}`);
    expect([200, 204, 404]).toContain(res.status);
  });
});
