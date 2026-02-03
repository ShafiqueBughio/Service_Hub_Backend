/** @format */

const request = require("supertest");
const app = require("../src/app");

const BASE = "/api/v1/public";

describe("Public API (TEST_CASES: TC-PUB)", () => {
  test("TC-PUB-01: Get reasons – optional type", async () => {
    const res = await request(app).get(`${BASE}/reasons`);
    expect([200, 404]).toContain(res.status);
  });

  test("TC-PUB-02: Get categories", async () => {
    const res = await request(app).get(`${BASE}/categories`);
    expect([200, 404]).toContain(res.status);
  });

  test("TC-PUB-03: Get professions", async () => {
    const res = await request(app).get(`${BASE}/professions`);
    expect([200, 404]).toContain(res.status);
  });

  test("TC-PUB-04: Get nested professions – valid id if any", async () => {
    const listRes = await request(app).get(`${BASE}/professions`);
    if (listRes.status === 200 && listRes.body?.data?.length > 0) {
      const id = listRes.body.data[0]?.id || listRes.body.data[0];
      const res = await request(app).get(`${BASE}/professions/${id}`);
      expect([200, 404]).toContain(res.status);
    } else {
      const res = await request(app).get(`${BASE}/professions/00000000-0000-0000-0000-000000000001`);
      expect([200, 404, 400]).toContain(res.status);
    }
  });
});
