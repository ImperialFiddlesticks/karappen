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

export default router;
