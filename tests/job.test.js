/** @format */

const request = require("supertest");
const app = require("../src/app");
const { registerAndVerify } = require("./helpers");

const BASE = "/api/v1/job";
let userToken;
let contractorToken;
let createdJobId;

beforeAll(async () => {
  const user = await registerAndVerify(app, "USER");
  const contractor = await registerAndVerify(app, "CONTRACTOR");
  userToken = user.token;
  contractorToken = contractor.token;
});

describe("Job CRUD (TEST_CASES: TC-JOB)", () => {
  test("TC-JOB-01: Create job – valid body (REGULAR)", async () => {
    if (!userToken) return;
    const res = await request(app)
      .post(`${BASE}/create`)
      .set("Authorization", `Bearer ${userToken}`)
      .send({
        title: "Fix Plumbing",
        description: "Kitchen sink repair",
        expire_days: 3,
        min_budget: 500,
        max_budget: 2000,
        timeline: "1 week",
        location: "NYC",
      });
    expect([200, 201]).toContain(res.status);
    expect(res.body).toHaveProperty("id");
    if (res.body.id) createdJobId = res.body.id;
  });

  test("TC-JOB-03: Create job – invalid expire_days (400)", async () => {
    if (!userToken) return;
    const res = await request(app)
      .post(`${BASE}/create`)
      .set("Authorization", `Bearer ${userToken}`)
      .send({
        title: "T",
        description: "D",
        expire_days: 99,
        min_budget: 100,
        max_budget: 500,
        timeline: "1w",
        location: "NY",
      });
    expect(res.status).toBe(400);
  });

  test("TC-JOB-04: Create job – min_budget > max_budget (400)", async () => {
    if (!userToken) return;
    const res = await request(app)
      .post(`${BASE}/create`)
      .set("Authorization", `Bearer ${userToken}`)
      .send({
        title: "T",
        description: "D",
        expire_days: 3,
        min_budget: 5000,
        max_budget: 1000,
        timeline: "1w",
        location: "NY",
      });
    expect(res.status).toBe(400);
  });

  test("TC-JOB-05: Get job by ID – valid jobId", async () => {
    if (!userToken || !createdJobId) return;
    const res = await request(app)
      .get(`${BASE}/${createdJobId}`)
      .set("Authorization", `Bearer ${userToken}`);
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("id", createdJobId);
  });

  test("TC-JOB-06: Get job by ID – invalid jobId (404)", async () => {
    const fakeUuid = "00000000-0000-0000-0000-000000000099";
    const res = await request(app)
      .get(`${BASE}/${fakeUuid}`)
      .set("Authorization", `Bearer ${userToken}`);
    expect([404, 400]).toContain(res.status);
  });

  test("TC-JOB-07: Update job – valid (owner)", async () => {
    if (!userToken || !createdJobId) return;
    const res = await request(app)
      .patch(`${BASE}/${createdJobId}`)
      .set("Authorization", `Bearer ${userToken}`)
      .send({ title: "Updated Title", description: "Updated desc" });
    expect(res.status).toBe(200);
  });

  test("TC-JOB-08: Update job – non-owner (403)", async () => {
    if (!contractorToken || !createdJobId) return;
    const res = await request(app)
      .patch(`${BASE}/${createdJobId}`)
      .set("Authorization", `Bearer ${contractorToken}`)
      .send({ title: "Hacked" });
    expect(res.status).toBe(403);
  });

  test("TC-JOB-11: Get my jobs – USER tab=pending", async () => {
    if (!userToken) return;
    const res = await request(app)
      .get(`${BASE}/my-jobs?tab=pending`)
      .set("Authorization", `Bearer ${userToken}`);
    expect(res.status).toBe(200);
    expect(res.body).toBeDefined();
  });

  test("TC-JOB-14: Get job list – CONTRACTOR", async () => {
    if (!contractorToken) return;
    const res = await request(app)
      .get(`${BASE}/list`)
      .set("Authorization", `Bearer ${contractorToken}`);
    expect(res.status).toBe(200);
  });

  test("TC-JOB-09: Delete job – valid (owner)", async () => {
    if (!userToken || !createdJobId) return;
    const res = await request(app)
      .delete(`${BASE}/${createdJobId}`)
      .set("Authorization", `Bearer ${userToken}`);
    expect([200, 204]).toContain(res.status);
  });
});
