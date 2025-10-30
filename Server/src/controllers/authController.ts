import { Request, Response } from "express";
import bcrypt from "bcrypt";
import { findUserByEmail, createUser } from "../models/userModel";
import { signToken } from "../utils/jwt";

export const signup = async (req: Request, res: Response) => {
  const { name, email, password, role } = req.body;
  if (!email || !password) return res.status(400).json({ message: "Email and password required" });

  try {
    const exists = await findUserByEmail(email);
  if (exists) return res.status(400).json({ message: "Email already in use", field: "email" });

    const hash = await bcrypt.hash(password, 10);
  const id = await createUser({ name, email, password_hash: hash, role });
  // if role is not provided, createUser will default to "user"
  const token = signToken({ id, email, role: role || "user" });

    return res.status(201).json({ token, user: { id, email, name } });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ message: "Email and password required", field: (!email ? 'email' : !password ? 'password' : undefined) });

  try {
    const user = await findUserByEmail(email);
  if (!user) return res.status(401).json({ message: "Email not found", field: "email" });

  const valid = await bcrypt.compare(password, user.password_hash);
  if (!valid) return res.status(401).json({ message: "Incorrect password", field: "password" });

    const token = signToken({ id: user.id, email: user.email, role: user.role });

    return res.json({ token, user: { id: user.id, email: user.email, name: user.name } });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};
