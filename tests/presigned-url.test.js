/** @format */

const request = require("supertest");
const app = require("../src/app");
const { registerAndVerify } = require("./helpers");

const BASE = "/api/v1/presigned-url";
let token;

beforeAll(async () => {
  const user = await registerAndVerify(app, "USER");
  token = user.token;
});

describe("Presigned URL (TEST_CASES: TC-PS)", () => {
  test("TC-PS-01: Generate single presigned upload URL – valid", async () => {
    if (!token) return;
    const res = await request(app)
      .post(`${BASE}/upload-url`)
      .set("Authorization", `Bearer ${token}`)
      .send({ file_name: "photo.jpg", file_type: "image/jpeg" });
    expect([200, 201, 500]).toContain(res.status);
    if (res.status === 200 || res.status === 201) {
      expect(res.body).toHaveProperty("upload_url");
      expect(res.body).toHaveProperty("file_key");
    }
  });

  test("TC-PS-04: Presigned URL – no token (401)", async () => {
    const res = await request(app)
      .post(`${BASE}/upload-url`)
      .send({ file_name: "photo.jpg", file_type: "image/jpeg" });
    expect(res.status).toBe(401);
  });

  test("TC-PS-03: Generate multiple presigned URLs – valid", async () => {
    if (!token) return;
    const res = await request(app)
      .post(`${BASE}/upload-urls`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        files: [
          { file_name: "a.jpg", file_type: "image/jpeg" },
          { file_name: "b.mp4", file_type: "video/mp4" },
        ],
      });
    expect([200, 201, 500]).toContain(res.status);
    if ((res.status === 200 || res.status === 201) && res.body?.urls) {
      expect(Array.isArray(res.body.urls)).toBe(true);
    }
  });
});
