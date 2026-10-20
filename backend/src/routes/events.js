import { Router } from "express";
import pool from "../db.js";

const router = Router();

const SELECT_EVENT = `
  SELECT events.*, COUNT(registrations.id)::int AS registered_count
    FROM events
    LEFT JOIN registrations ON registrations.event_id = events.id`;

function validateEvent(body) {
  const { title, description, starts_at, location, max_participants } = body;
  const errors = [];
  if (typeof title !== "string" || title.trim() === "") {
    errors.push("Titel krävs");
  }
  if (typeof location !== "string" || location.trim() === "") {
    errors.push("Plats krävs");
  }
  if (typeof starts_at !== "string" || isNaN(Date.parse(starts_at))) {
    errors.push("Startdatum måste vara ett giltigt datum");
  }
  if (description != null && typeof description !== "string") {
    errors.push("Beskrivning måste vara text");
  }
  if (
    max_participants != null &&
    !(Number.isInteger(max_participants) && max_participants > 0)
  ) {
    errors.push("Maximalt antal deltagare måste vara ett heltal större än 0");
  }
  return errors;
}

router.get("/", async (req, res) => {
  const { rows } = await pool.query(
    `${SELECT_EVENT}
            WHERE events.starts_at >= now()
            GROUP BY events.id
            ORDER BY events.starts_at`,
  );
  res.json(rows);
});

router.get("/:id", async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) {
    return res.status(404).json({ error: "Evenemanget hittades inte" });
  }
  const { rows } = await pool.query(
    `${SELECT_EVENT}
            WHERE events.id = $1
            GROUP BY events.id`,
    [id],
  );
  if (rows.length === 0) {
    return res.status(404).json({ error: "Evenemanget hittades inte" });
  }
  res.json(rows[0]);
});

router.post("/", async (req, res) => {
  const errors = validateEvent(req.body);
  if (errors.length > 0) {
    return res.status(400).json({ error: errors.join(", ") });
  }
  const { title, description, starts_at, location, max_participants } =
    req.body;
  const { rows } = await pool.query(
    `INSERT INTO events (title, description, starts_at, location, max_participants, created_by)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING *`,

    [
      title.trim(),
      description?.trim() || null,
      starts_at,
      location.trim(),
      max_participants ?? null,
      req.user.id,
    ],
  );
  res.status(201).json({ ...rows[0], registered_count: 0 });
});
export default router;
