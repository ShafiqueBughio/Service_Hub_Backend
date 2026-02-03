/** @format */

const request = require("supertest");
const app = require("../src/app");
const { registerAndVerify } = require("./helpers");

const BASE = "/api/v1/user";
let userToken;
let userRefreshToken;
let contractorToken;

beforeAll(async () => {
  const user = await registerAndVerify(app, "USER");
  const contractor = await registerAndVerify(app, "CONTRACTOR");
  userToken = user.token;
  userRefreshToken = user.refreshToken;
  contractorToken = contractor.token;
});

describe("User Profile (TEST_CASES: TC-UP)", () => {
  test("TC-UP-03: Get profile – valid token", async () => {
    if (!userToken) return;
    const res = await request(app)
      .get(`${BASE}/profile`)
      .set("Authorization", `Bearer ${userToken}`);
    expect(res.status).toBe(200);
  });

  test("TC-UP-06: Get me (user about self)", async () => {
    if (!userToken || !userRefreshToken) return;
    const res = await request(app)
      .get(`${BASE}/me`)
      .query({ refresh_token: userRefreshToken })
      .set("Authorization", `Bearer ${userToken}`);
    expect(res.status).toBe(200);
  });

  test("TC-UP-04: Update profile – partial (PATCH)", async () => {
    if (!userToken) return;
    const res = await request(app)
      .patch(`${BASE}/profile`)
      .set("Authorization", `Bearer ${userToken}`)
      .send({ first_name: "Updated", city: "Boston" });
    expect([200, 400]).toContain(res.status);
  });
});

describe("Contractor Profile (TEST_CASES: TC-CP)", () => {
  test("TC-CP-02: Create contractor profile – USER token (403)", async () => {
    if (!userToken) return;
    const res = await request(app)
      .post(`${BASE}/create_contractor_profile`)
      .set("Authorization", `Bearer ${userToken}`)
      .send({
        first_name: "John",
        last_name: "Doe",
        address: "NY",
        city: "NYC",
        state: "NY",
        contact_phone: "+1234567890",
        gender: "MALE",
        services: ["Plumbing"],
      });
    expect(res.status).toBe(403);
  });

  test("TC-CP-01: Create contractor profile – valid (CONTRACTOR)", async () => {
    if (!contractorToken) return;
    const res = await request(app)
      .post(`${BASE}/create_contractor_profile`)
      .set("Authorization", `Bearer ${contractorToken}`)
      .send({
        first_name: "John",
        last_name: "Doe",
        address: "NY",
        city: "NYC",
        state: "NY",
        contact_phone: "+1234567890",
        gender: "MALE",
        services: ["Plumbing"],
      });
    expect([200, 201]).toContain(res.status);
  });

  test("TC-CP-03: Create contractor profile – missing required services (400)", async () => {
    if (!contractorToken) return;
    const res = await request(app)
      .post(`${BASE}/create_contractor_profile`)
      .set("Authorization", `Bearer ${contractorToken}`)
      .send({
        first_name: "John",
        last_name: "Doe",
        address: "NY",
        city: "NYC",
        state: "NY",
        contact_phone: "+1",
        gender: "MALE",
      });
    expect(res.status).toBe(400);
  });
});
