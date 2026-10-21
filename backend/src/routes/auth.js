import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import pool from "../db.js";

const router = Router();
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function signToken(user) {
  return jwt.sign({ sub: user.id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });
}

router.post("/register", async (req, res) => {
  const { email, password, name } = req.body ?? {};

  if (typeof email !== "string" || !EMAIL_REGEX.test(email.trim())) {
    return res.status(400).json({ error: "Ange en giltig e-postadress" });
  }
  if (typeof password !== "string" || password.length < 8) {
    return res
      .status(400)
      .json({ error: "Lösenordet måste vara minst 8 tecken" });
  }
  if (typeof name !== "string" || name.trim() === "") {
    return res.status(400).json({ error: "Ange ditt namn" });
  }

  const passwordHash = await bcrypt.hash(password, 10);

  try {
    const { rows } = await pool.query(
      `INSERT INTO users (email, password_hash, name)
      VALUES ($1, $2, $3)
      RETURNING id, email, name, role`,
      [email.trim().toLowerCase(), passwordHash, name.trim()],
    );
    const user = rows[0];
    res.status(201).json({ token: signToken(user), user });
  } catch (err) {
    if (err.code === "23505") {
      return res
        .status(409)
        .json({ error: "E-postadressen är redan registrerad" });
    }
    throw err;
  }
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body ?? {};

  if (
    typeof email !== "string" ||
    typeof password !== "string" ||
    !email ||
    !password
  ) {
    return res.status(400).json({ error: "Ange e-post och lösenord" });
  }

  const { rows } = await pool.query(
    "SELECT id, email, name, role, password_hash FROM users WHERE email = $1",
    [email.trim().toLowerCase()],
  );
  const found = rows[0];

  const ok = found && (await bcrypt.compare(password, found.password_hash));
  if (!ok) {
    return res.status(401).json({ error: "Fel e-post eller lösenord" });
  }

  const { password_hash, ...user } = found;
  res.json({ token: signToken(user), user });
});

export default router;
