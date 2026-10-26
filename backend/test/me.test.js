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

const validProfile = {
  name: "Namn Namnsson",
  program: "Frontend Mobil och Webb",
  year: 2,
  dietary: "Vegetarisk",
};

test("GET /me visar min profil utan lösenordshash", async () => {
  const res = await memberApi.get("/me");
  assert.equal(res.status, 200);
  assert.equal(res.body.id, memberId);
  assert.equal(res.body.password_hash, undefined);
});

test("PUT /me uppdaterar profilen och den sparas", async () => {
  const res = await memberApi.put("/me").send(validProfile);
  assert.equal(res.status, 200);
  assert.equal(res.body.name, "Namn Namnsson");
  assert.equal(res.body.year, 2);
  assert.equal(res.body.password_hash, undefined);

  const getRes = await memberApi.get("/me");
  assert.equal(getRes.body.dietary, "Vegetarisk");
});

test("PUT /me sparar tomma valfria fält som null", async () => {
  const res = await memberApi
    .put("/me")
    .send({ name: "Namn Namnsson", program: "", year: null, dietary: "" });
  assert.equal(res.status, 200);
  assert.equal(res.body.program, null);
  assert.equal(res.body.dietary, null);
});

test("PUT /me ger 400 utan namn", async () => {
  const res = await memberApi.put("/me").send({ ...validProfile, name: " " });
  assert.equal(res.status, 400);
});

test("PUT /me ger 400 för ogiltig årskurs", async () => {
  const tooHigh = await memberApi.put("/me").send({ ...validProfile, year: 7 });
  assert.equal(tooHigh.status, 400);
  const notNumber = await memberApi
    .put("/me")
    .send({ ...validProfile, year: "två" });
  assert.equal(notNumber.status, 400);
});

test("PUT /me kan inte ändra rollen", async () => {
  const res = await memberApi
    .put("/me")
    .send({ ...validProfile, role: "admin" });
  assert.equal(res.status, 200);
  assert.equal(res.body.role, "member");

  const { rows } = await pool.query("SELECT role FROM users WHERE id = $1", [
    memberId,
  ]);
  assert.equal(rows[0].role, "member");
});

test("PUT /me ändrar inte någon annans profil", async () => {
  await memberApi.put("/me").send({ ...validProfile, name: "Bara jag" });

  const { rows } = await pool.query("SELECT name FROM users WHERE id = $1", [
    otherMemberId,
  ]);
  assert.equal(rows[0].name, "Testperson");
});

test("PUT /me ger 401 utan inloggning", async () => {
  const res = await request(app).put("/me").send(validProfile);
  assert.equal(res.status, 401);
});
