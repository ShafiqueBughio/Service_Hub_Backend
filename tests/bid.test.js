/** @format */

const request = require("supertest");
const app = require("../src/app");
const { registerAndVerify } = require("./helpers");

const BASE = "/api/v1/job";
let userToken;
let contractorToken;
let jobIdForBid;
let acceptedBidId;

beforeAll(async () => {
  const user = await registerAndVerify(app, "USER");
  const contractor = await registerAndVerify(app, "CONTRACTOR");
  userToken = user.token;
  contractorToken = contractor.token;
  if (userToken) {
    const createRes = await request(app)
      .post(`${BASE}/create`)
      .set("Authorization", `Bearer ${userToken}`)
      .send({
        title: "Job for Bid Test",
        description: "Description for bid test",
        expire_days: 3,
        min_budget: 500,
        max_budget: 2000,
        timeline: "1 week",
        location: "NYC",
      });
    if (createRes.status === 200 || createRes.status === 201) jobIdForBid = createRes.body.id;
  }
});

describe("Bids (TEST_CASES: TC-BID)", () => {
  test("TC-BID-01: Place bid – CONTRACTOR valid jobId", async () => {
    if (!contractorToken || !jobIdForBid) return;
    const res = await request(app)
      .post(`${BASE}/${jobIdForBid}/bid`)
      .set("Authorization", `Bearer ${contractorToken}`)
      .send({
        quote_price: 1500,
        timeline_estimate: "1 week",
        notes: "Can start tomorrow",
      });
    expect([200, 201]).toContain(res.status);
    if (res.body?.id) acceptedBidId = res.body.id;
  });

  test("TC-BID-02: Place bid – USER token (non-contractor) 403 or 400", async () => {
    if (!userToken || !jobIdForBid) return;
    const res = await request(app)
      .post(`${BASE}/${jobIdForBid}/bid`)
      .set("Authorization", `Bearer ${userToken}`)
      .send({ quote_price: 1500, timeline_estimate: "1 week" });
    expect([400, 403]).toContain(res.status);
  });

  test("TC-BID-03: Place bid – invalid jobId (404)", async () => {
    if (!contractorToken) return;
    const fakeUuid = "00000000-0000-0000-0000-000000000099";
    const res = await request(app)
      .post(`${BASE}/${fakeUuid}/bid`)
      .set("Authorization", `Bearer ${contractorToken}`)
      .send({ quote_price: 1500, timeline_estimate: "1 week" });
    expect([404, 400]).toContain(res.status);
  });

  test("TC-BID-04: Get bids by job – job owner (USER)", async () => {
    if (!userToken || !jobIdForBid) return;
    const res = await request(app)
      .get(`${BASE}/${jobIdForBid}/bids`)
      .set("Authorization", `Bearer ${userToken}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body) || res.body?.data != null || res.body?.bids != null).toBe(true);
  });

  test("TC-BID-05: Get bids by job – CONTRACTOR", async () => {
    if (!contractorToken || !jobIdForBid) return;
    const res = await request(app)
      .get(`${BASE}/${jobIdForBid}/bids`)
      .set("Authorization", `Bearer ${contractorToken}`);
    expect(res.status).toBe(200);
  });

  test("TC-BID-06: Accept bid – USER (job owner) valid bidId", async () => {
    if (!userToken || !jobIdForBid) return;
    const bidsRes = await request(app)
      .get(`${BASE}/${jobIdForBid}/bids`)
      .set("Authorization", `Bearer ${userToken}`);
    const bids = Array.isArray(bidsRes.body) ? bidsRes.body : bidsRes.body?.data || bidsRes.body?.bids || [];
    const bidId = bids[0]?.id;
    if (!bidId) return;
    const res = await request(app)
      .post(`${BASE}/${jobIdForBid}/bid/${bidId}/accept`)
      .set("Authorization", `Bearer ${userToken}`);
    expect([200, 201]).toContain(res.status);
  });

  test("TC-JOB-15: Get my bids – CONTRACTOR tab=pending", async () => {
    if (!contractorToken) return;
    const res = await request(app)
      .get(`${BASE}/my-bids?tab=pending`)
      .set("Authorization", `Bearer ${contractorToken}`);
    expect(res.status).toBe(200);
  });
});
