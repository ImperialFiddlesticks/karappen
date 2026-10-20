import { Router } from "express";
import pool from "../db.js";

const router = Router();

const SELECT_EVENT = `
  SELECT events.*, COUNT(registrations.id)::int AS registered_count
    FROM events
    LEFT JOIN registrations ON registrations.event_id = events.id`;

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
export default router;
