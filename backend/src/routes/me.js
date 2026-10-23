import { Router } from "express";
import pool from "../db.js";

const router = Router();

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
