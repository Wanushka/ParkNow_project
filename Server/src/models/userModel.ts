// src/models/userModel.ts
import pool from "../config/db";

export interface User {
  id?: number;
  name?: string;
  email: string;
  password_hash: string;
  role?: "user" | "admin";
}

export const findUserByEmail = async (email: string) => {
  const [rows] = await pool.query("SELECT * FROM users WHERE email = ?", [email]);
  // @ts-ignore
  return rows[0] || null;
};

export const createUser = async (user: User) => {
  const [result] = await pool.query(
    "INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)",
    [user.name || null, user.email, user.password_hash, user.role || "user"]
  );
  // @ts-ignore
  return result.insertId;
};

export const findUserById = async (id: number) => {
  const [rows] = await pool.query("SELECT * FROM users WHERE id = ?", [id]);
  // @ts-ignore
  return rows[0] || null;
};
