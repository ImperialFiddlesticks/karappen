import { test, after } from "node:test";
import assert from "node:assert/strict";
import request from "supertest";
import app from "../src/app.js";
import pool from "../src/db.js";

const email = `auth-test-${Date.now()}@test.se`;
const password = "lösen123";
let token;

after(async () => {
  await pool.query("DELETE FROM users WHERE email LIKE 'auth-test-%@test.se'");
  await pool.end();
});

test("POST /auth/register skapar användare utan att skicka hash", async () => {
  const res = await request(app).post("/auth/register").send({
    email,
    password,
    name: "Test",
  });
  assert.equal(res.status, 201);
  assert.ok(res.body.token);
  assert.equal(res.body.user.role, "member");
  assert.equal(res.body.user.password_hash, undefined);
});

test("POST /auth/register ger 409 för upptagen e-post", async () => {
  const res = await request(app).post("/auth/register").send({
    email,
    password,
    name: "Test",
  });
  assert.equal(res.status, 409);
});

test("POST /auth/register ger 400 för kort lösenord", async () => {
  const res = await request(app)
    .post("/auth/register")
    .send({
      email: `auth-test-x${Date.now()}@test.se`,
      password: "kort",
      name: "X",
    });
  assert.equal(res.status, 400);
});

test("POST /auth/login ger 401 med fel lösenord", async () => {
  const res = await request(app).post("/auth/login").send({
    email,
    password: "felfelfel",
  });
  assert.equal(res.status, 401);
});

test("POST /auth/login ger token med rätt lösenord", async () => {
  const res = await request(app).post("/auth/login").send({
    email,
    password,
  });
  assert.equal(res.status, 200);
  assert.equal(res.body.user.password_hash, undefined);
  token = res.body.token;
});

test("GET /me ger 401 utan token och med ogiltig token", async () => {
  const res = await request(app).get("/me");
  assert.equal(res.status, 401);
  const res2 = await request(app).get("/me").set("Authorization", "Bearer fel");
  assert.equal(res2.status, 401);
});

test("GET /me ger den inloggade användaren", async () => {
  const res = await request(app)
    .get("/me")
    .set("Authorization", `Bearer ${token}`);
  assert.equal(res.status, 200);
  assert.equal(res.body.email, email);
});

test("POST /auth/register ignorerar role och skapar alltid en medlem", async () => {
  const res = await request(app)
    .post("/auth/register")
    .send({
      email: `auth-test-role-${Date.now()}@test.se`,
      password,
      name: "Fuskare",
      role: "admin",
    });
  assert.equal(res.status, 201);
  assert.equal(res.body.user.role, "member");
});
