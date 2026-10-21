import { Router } from "express";
import pool from "../db.js";
import { requireAdmin } from "../middleware/auth.js";
const router = Router();

const SELECT_EVENT = `
  SELECT events.*, COUNT(registrations.id)::int AS registered_count
    FROM events
    LEFT JOIN registrations ON registrations.event_id = events.id`;

async function findEventById(id) {
  const { rows } = await pool.query(
    `${SELECT_EVENT}
            WHERE events.id = $1
            GROUP BY events.id`,
    [id],
  );
  return rows[0];
}

function validateEvent(body) {
  const { title, description, starts_at, location, max_participants } =
    body ?? {};
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

  const event = await findEventById(id);
  if (!event) {
    return res.status(404).json({ error: "Evenemanget hittades inte" });
  }
  res.json(event);
});

router.post("/", requireAdmin, async (req, res) => {
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

router.put("/:id", requireAdmin, async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) {
    return res.status(404).json({ error: "Evenemanget hittades inte" });
  }
  const errors = validateEvent(req.body);
  if (errors.length > 0) {
    return res.status(400).json({ error: errors.join(", ") });
  }
  const { title, description, starts_at, location, max_participants } =
    req.body;
  const { rowCount } = await pool.query(
    `UPDATE events
    SET title = $1, description = $2, starts_at = $3, location = $4, max_participants = $5
    WHERE id = $6`,
    [
      title.trim(),
      description?.trim() || null,
      starts_at,
      location.trim(),
      max_participants ?? null,
      id,
    ],
  );
  if (rowCount === 0) {
    return res.status(404).json({ error: "Evenemanget hittades inte" });
  }
  res.json(await findEventById(id));
});

router.delete("/:id", requireAdmin, async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) {
    return res.status(404).json({ error: "Evenemanget hittades inte" });
  }
  const { rowCount } = await pool.query("DELETE FROM events WHERE id = $1", [
    id,
  ]);
  if (rowCount === 0) {
    return res.status(404).json({ error: "Evenemanget hittades inte" });
  }
  res.status(204).end();
});
export default router;
