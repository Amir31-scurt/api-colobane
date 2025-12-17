import { pool } from "../config/db";
import bcrypt from "bcryptjs";

export async function createUser({
  name,
  email,
  password,
  phone,
  role = "CUSTOMER"
}: {
  name: string;
  email: string;
  password: string;
  phone?: string;
  role?: string;
}) {
  const hash = await bcrypt.hash(password, 10);

  const query = `
    INSERT INTO users (name, email, password_hash, role, phone)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING id, name, email, role, phone, created_at
  `;

  const values = [name, email, hash, role, phone || null];

  const result = await pool.query(query, values);
  return result.rows[0];
}

export async function findUserByEmail(email: string) {
  const result = await pool.query("SELECT * FROM users WHERE email=$1", [email]);
  return result.rows[0] || null;
}

export async function findUserById(id: number) {
  const result = await pool.query(
    "SELECT id, name, email, role, phone, created_at FROM users WHERE id=$1",
    [id]
  );
  return result.rows[0] || null;
}

export function verifyPassword(plain: string, hash: string) {
  return bcrypt.compare(plain, hash);
}
