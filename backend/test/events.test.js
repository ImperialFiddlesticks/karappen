import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import express from "express";
import request from "supertest";
import pool from "../src/db.js";
import eventsRouter from "../src/routes/events.js";

let adminId;
let testApp;

async function createEvent(title, startsAt) {
  const { rows } = await pool.query(
    `INSERT INTO events (title, starts_at, location, max_participants, created_by)
     VALUES ($1, $2, 'Skolan', 50, $3)
     RETURNING id`,
    [title, startsAt, adminId],
  );
  return rows[0].id;
}

before(async () => {
  const { rows } = await pool.query(
    `INSERT INTO users (email, password_hash, name, role)
        VALUES($1, 'inte-en-riktig-hash', 'Testadmin', 'admin')
        RETURNING id`,
    [`admin-${Date.now()}@test.se`],
  );
  adminId = rows[0].id;

  testApp = express();
  testApp.use(express.json());
  testApp.use((req, res, next) => {
    req.user = { id: adminId, role: "admin" };
    next();
  });
  testApp.use("/events", eventsRouter);
});

after(async () => {
  await pool.query("DELETE FROM events WHERE created_by = $1", [adminId]);
  await pool.query("DELETE FROM users WHERE id = $1", [adminId]);
  await pool.end();
});

test("GET /events visar kommande evenemang men inte tidigare", async () => {
  const upcomingId = await createEvent("Spelkväll", "2099-01-01T18:00:00Z");
  const pastId = await createEvent("Gammal sittning", "2000-01-01T18:00:00Z");

  const res = await request(testApp).get("/events");

  assert.equal(res.status, 200);
  const ids = res.body.map((event) => event.id);
  assert.ok(ids.includes(upcomingId));
  assert.ok(!ids.includes(pastId));
});

test("GET /events/:id visar ett evenemang med antal anmälda", async () => {
  const id = await createEvent("Föreläsning", "2099-02-01T18:00:00Z");

  const res = await request(testApp).get(`/events/${id}`);

  assert.equal(res.status, 200);
  assert.equal(res.body.title, "Föreläsning");
  assert.equal(res.body.registered_count, 0);
});

test("GET /events/:id ger 404 för ett id som inte finns", async () => {
  const res = await request(testApp).get("/events/999999");
  assert.equal(res.status, 404);
});

test("GET /events/:id ger 404 för ett id som inte är ett tal", async () => {
  const res = await request(testApp).get("/events/abc");
  assert.equal(res.status, 404);
});

const validEvent = {
  title: "Sittning",
  starts_at: "2099-03-01T18:00:00Z",
  location: "Skolan",
  max_participants: 60,
};

test("POST /events skapar ett nytt evenemang med giltiga data", async () => {
  const res = await request(testApp).post("/events").send(validEvent);

  assert.equal(res.status, 201);
  assert.equal(res.body.title, "Sittning");
  assert.equal(res.body.created_by, adminId);

  const getRes = await request(testApp).get(`/events/${res.body.id}`);
  assert.equal(getRes.status, 200);
});

test("POST /events ger 400 utan titel", async () => {
  const res = await request(testApp)
    .post("/events")
    .send({ ...validEvent, title: "" });
  assert.equal(res.status, 400);
});

test("POST /events ger 400 med ogiltigt datum", async () => {
  const res = await request(testApp)
    .post("/events")
    .send({ ...validEvent, starts_at: "inte-en-datum" });
  assert.equal(res.status, 400);
});

test("POST /events ger 400 när max antal platser är 0", async () => {
  const res = await request(testApp)
    .post("/events")
    .send({ ...validEvent, max_participants: 0 });
  assert.equal(res.status, 400);
});
