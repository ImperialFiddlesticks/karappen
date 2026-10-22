import bcrypt from "bcryptjs";
import pool from "../src/db.js";

const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
const password = process.env.ADMIN_PASSWORD;
const name = process.env.ADMIN_NAME?.trim() || "Kårens admin";

if (!email || !password) {
  console.error("Sätt ADMIN_EMAIL och ADMIN_PASSWORD innan du kör skriptet");
  process.exit(1);
}
if (password.length < 8) {
  console.error("ADMIN_PASSWORD måste vara minst 8 tecken");
  process.exit(1);
}

const passwordHash = await bcrypt.hash(password, 10);

const { rows } = await pool.query(
  `INSERT INTO users (email, password_hash, name, role)
  VALUES ($1, $2, $3, 'admin')
  ON CONFLICT (email) DO UPDATE
    SET password_hash = EXCLUDED.password_hash,
      name = EXCLUDED.name,
      role = 'admin'
  RETURNING id, email, role`,
  [email, passwordHash, name],
);

console.log(`Adminkontot är klart: ${rows[0].email} (id ${rows[0].id})`);
await pool.end();
