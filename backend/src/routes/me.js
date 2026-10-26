import { Router } from "express";
import pool from "../db.js";

const router = Router();

const MAX_NAME_LENGTH = 100;
const MAX_TEXT_LENGTH = 200;

function validateProfile(body) {
  const { name, program, year, dietary } = body ?? {};
  const errors = [];

  if (typeof name !== "string" || name.trim() === "") {
    errors.push("Namn krävs");
  } else if (name.trim().length > MAX_NAME_LENGTH) {
    errors.push(`Namnet får vara högst ${MAX_NAME_LENGTH} tecken`);
  }
  if (program != null && (typeof program !== "string" || program.trim().length > MAX_TEXT_LENGTH)) {
    errors.push(`Program måste vara text, högst ${MAX_TEXT_LENGTH} tecken`);
  }
  if (year != null && !(Number.isInteger(year) && year >= 1 && year <= 6)) {
    errors.push("Årskurs måste vara ett heltal mellan 1 och 6");
  }
  if (dietary != null && (typeof dietary !== "string" || dietary.trim().length > MAX_TEXT_LENGTH)) {
    errors.push(`Specialkost måste vara text, högst ${MAX_TEXT_LENGTH} tecken`);
  }
  return errors;
}

router.get("/", async (req, res) => {
  const { rows } = await pool.query(
    "SELECT id, email, name, program, year, dietary, role FROM users WHERE id = $1",
    [req.user.id],
  );
  if (!rows[0]) {
    return res.status(404).json({ error: "Användaren hittades inte" });
  }
  res.json(rows[0]);
});

router.put("/", async (req, res) => {
  const errors = validateProfile(req.body);
  if (errors.length > 0) {
    return res.status(400).json({ error: errors.join(", ") });
  }

  const { name, program, year, dietary } = req.body;
  const { rows } = await pool.query(
    `UPDATE users
        SET name = $1, program = $2, year = $3, dietary = $4
      WHERE id = $5
      RETURNING id, email, name, program, year, dietary, role`,
      [
        name.trim(),
        program?.trim() || null,
        year ?? null,
        dietary?.trim() || null,
        req.user.id,
      ],
  );
  if (!rows[0]) {
    return res.status(404).json({ error: "Användaren hittades inte" });
  }
  res.json(rows[0]);
});

router.get("/registrations", async (req, res) => {
  const { rows } = await pool.query(
    `SELECT events.*, COUNT(all_registrations.id)::int AS registered_count
    FROM registrations AS my_registration
    JOIN events ON events.id = my_registration.event_id
    LEFT JOIN registrations AS all_registrations
    ON all_registrations.event_id = events.id
    WHERE my_registration.user_id = $1
    AND events.starts_at >= now()
    GROUP BY events.id
    ORDER BY events.starts_at`,
    [req.user.id],
  );
  res.json(rows);
});

export default router;
