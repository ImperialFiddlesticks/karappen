import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import jwt from "jsonwebtoken";
import request from "supertest";
import app from "../src/app.js";
import pool from "../src/db.js";

let adminId;
let memberId;
let otherMemberId;
let memberApi;

async function createUser(role) {
  const { rows } = await pool.query(
    `INSERT INTO users (email, password_hash, name, role)
    VALUES ($1, 'inte-en-riktig-hash', 'Testperson', $2)
    RETURNING id`,
    [`me-test-${role}-${randomUUID()}@test.se`, role],
  );
  return rows[0].id;
}

function loggedInAs(userId, role) {
  const token = jwt.sign({ sub: userId, role }, process.env.JWT_SECRET);
  return request.agent(app).set("Authorization", `Bearer ${token}`);
}

async function createEvent(title, startsAt) {
  const { rows } = await pool.query(
    `INSERT INTO events (title, starts_at, location, created_by)
        VALUES ($1, $2, 'Skolan', $3)
        RETURNING id`,
    [title, startsAt, adminId],
  );
  return rows[0].id;
}

async function register(userId, eventId) {
  await pool.query(
    "INSERT INTO registrations (user_id, event_id) VALUES ($1, $2)",
    [userId, eventId],
  );
}

before(async () => {
  adminId = await createUser("admin");
  memberId = await createUser("member");
  otherMemberId = await createUser("member");
  memberApi = loggedInAs(memberId, "member");
});

after(async () => {
  await pool.query("DELETE FROM events WHERE created_by = $1", [adminId]);
  await pool.query("DELETE FROM users WHERE id IN ($1, $2, $3)", [
    adminId,
    memberId,
    otherMemberId,
  ]);
  await pool.end();
});

test("GET /me/registrations visar bara mina kommande anmälningar", async () => {
  const mine = await createEvent("Min pub", "2099-08-01T18:00:00Z");
  const notMine = await createEvent("Annans pub", "2099-08-02T18:00:00Z");
  const past = await createEvent("Gammal pub", "2000-01-01T18:00:00Z");

  await register(memberId, mine);
  await register(memberId, past);
  await register(otherMemberId, mine);
  await register(otherMemberId, notMine);

  const res = await memberApi.get("/me/registrations");

  assert.equal(res.status, 200);
  const ids = res.body.map((event) => event.id);
  assert.deepEqual(ids, [mine]);
  assert.equal(res.body[0].registered_count, 2);
});

test("GET /me/registrations ger 401 utan inloggning", async () => {
  const res = await request(app).get("/me/registrations");
  assert.equal(res.status, 401);
});
