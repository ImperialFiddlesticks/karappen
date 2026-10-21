import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import jwt from "jsonwebtoken";
import request from "supertest";
import app from "../src/app.js";
import pool from "../src/db.js";

let adminId;
let memberId;
let adminApi;
let memberApi;

async function createUser(role) {
  const { rows } = await pool.query(
    `INSERT INTO users (email, password_hash, name, role)
    VALUES ($1, 'inte-en-riktig-hash', 'Testperson', $2)
    RETURNING id`,
    [`events-test${role}-${Date.now()}@test.se`, role],
  );
  return rows[0].id;
}

function loggedInAs(userId, role) {
  const token = jwt.sign({ sub: userId, role }, process.env.JWT_SECRET);
  return request.agent(app).set("Authorization", `Bearer ${token}`);
}

before(async () => {
  adminId = await createUser("admin");
  memberId = await createUser("member");
  adminApi = loggedInAs(adminId, "admin");
  memberApi = loggedInAs(memberId, "member");
});

async function createEvent(title, startsAt) {
  const { rows } = await pool.query(
    `INSERT INTO events (title, starts_at, location, max_participants, created_by)
     VALUES ($1, $2, 'Skolan', 50, $3)
     RETURNING id`,
    [title, startsAt, adminId],
  );
  return rows[0].id;
}

after(async () => {
  await pool.query("DELETE FROM events WHERE created_by = $1", [adminId]);
  await pool.query("DELETE FROM users WHERE id IN ($1, $2)", [
    adminId,
    memberId,
  ]);
  await pool.end();
});

test("GET /events visar kommande evenemang men inte tidigare", async () => {
  const upcomingId = await createEvent("Spelkväll", "2099-01-01T18:00:00Z");
  const pastId = await createEvent("Gammal sittning", "2000-01-01T18:00:00Z");

  const res = await adminApi.get("/events");

  assert.equal(res.status, 200);
  const ids = res.body.map((event) => event.id);
  assert.ok(ids.includes(upcomingId));
  assert.ok(!ids.includes(pastId));
});

test("GET /events/:id visar ett evenemang med antal anmälda", async () => {
  const id = await createEvent("Föreläsning", "2099-02-01T18:00:00Z");

  const res = await adminApi.get(`/events/${id}`);

  assert.equal(res.status, 200);
  assert.equal(res.body.title, "Föreläsning");
  assert.equal(res.body.registered_count, 0);
});

test("GET /events/:id ger 404 för ett id som inte finns", async () => {
  const res = await adminApi.get("/events/999999");
  assert.equal(res.status, 404);
});

test("GET /events/:id ger 404 för ett id som inte är ett tal", async () => {
  const res = await adminApi.get("/events/abc");
  assert.equal(res.status, 404);
});

const validEvent = {
  title: "Sittning",
  starts_at: "2099-03-01T18:00:00Z",
  location: "Skolan",
  max_participants: 60,
};

test("POST /events skapar ett nytt evenemang med giltiga data", async () => {
  const res = await adminApi.post("/events").send(validEvent);

  assert.equal(res.status, 201);
  assert.equal(res.body.title, "Sittning");
  assert.equal(res.body.created_by, adminId);

  const getRes = await adminApi.get(`/events/${res.body.id}`);
  assert.equal(getRes.status, 200);
});

test("POST /events ger 400 utan titel", async () => {
  const res = await adminApi.post("/events").send({ ...validEvent, title: "" });
  assert.equal(res.status, 400);
});

test("POST /events ger 400 med ogiltigt datum", async () => {
  const res = await adminApi
    .post("/events")
    .send({ ...validEvent, starts_at: "inte-en-datum" });
  assert.equal(res.status, 400);
});

test("POST /events ger 400 när max antal platser är 0", async () => {
  const res = await adminApi
    .post("/events")
    .send({ ...validEvent, max_participants: 0 });
  assert.equal(res.status, 400);
});

test("PUT /events/:id uppdaterar ett evenemang", async () => {
  const id = await createEvent("Pub", "2099-04-01T18:00:00Z");

  const res = await adminApi
    .put(`/events/${id}`)
    .send({ ...validEvent, title: "Pub med quiz" });

  assert.equal(res.status, 200);
  assert.equal(res.body.title, "Pub med quiz");
  assert.equal(res.body.registered_count, 0);
});

test("PUT /events/:id ger 400 med ogiltig data", async () => {
  const id = await createEvent("Pub", "2099-04-01T18:00:00Z");

  const res = await adminApi
    .put(`/events/${id}`)
    .send({ ...validEvent, location: "" });

  assert.equal(res.status, 400);
});

test("PUT /events/:id ger 404 för ett id som inte finns", async () => {
  const res = await adminApi.put("/events/999999").send(validEvent);
  assert.equal(res.status, 404);
});

test("DELETE /events/:id tar bort evenemanget och dess anmälningar", async () => {
  const id = await createEvent("Pub", "2099-05-01T18:00:00Z");
  await pool.query(
    "INSERT INTO registrations (user_id, event_id) VALUES ($1, $2)",
    [adminId, id],
  );

  const res = await adminApi.delete(`/events/${id}`);
  assert.equal(res.status, 204);

  const getRes = await adminApi.get(`/events/${id}`);
  assert.equal(getRes.status, 404);

  const { rows } = await pool.query(
    "SELECT * FROM registrations WHERE event_id =$1",
    [id],
  );
  assert.equal(rows.length, 0);
});

test("DELETE /events/:id ger 404 för ett id som inte finns", async () => {
  const res = await adminApi.delete("/events/999999");
  assert.equal(res.status, 404);
});

test("GET /events get 401 utan inloggning", async () => {
  const res = await request(app).get("/events");
  assert.equal(res.status, 401);
});

test("GET /events fungerar för en vanlig medlem", async () => {
  const res = await memberApi.get("/events");
  assert.equal(res.status, 200);
});

test("POST /events get 403 för en vanlig medlem", async () => {
  const res = await memberApi.post("/events").send(validEvent);
  assert.equal(res.status, 403);
});

test("PUT /events/:id ger 403 för en vanlig medlem", async () => {
  const id = await createEvent("Pub", "2099-06-01T18:00:00Z");
  const res = await memberApi.put(`/events/${id}`).send(validEvent);
  assert.equal(res.status, 403);
});

test("DELETE /events/:id ger 403 och evenemanger finns kvar", async () => {
  const id = await createEvent("Pub", "2099-06-01T18:00:00Z");
  const res = await memberApi.delete(`/events/${id}`);
  assert.equal(res.status, 403);

  const getRes = await adminApi.get(`/events/${id}`);
  assert.equal(getRes.status, 200);
});
