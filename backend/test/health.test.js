import { test } from "node:test";
import assert from "node:assert/strict";
import request from "supertest";
import app from "../src/app.js";

test("GET /health svarar 200", async () => {
  const res = await request(app).get("/health");
  assert.equal(res.status, 200);
  assert.deepEqual(res.body, { status: "ok" });
});

test("okänd route ger 404", async () => {
  const res = await request(app).get("/finns-inte");
  assert.equal(res.status, 404);
});
