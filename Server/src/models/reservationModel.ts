// src/models/reservationModel.ts
import pool from "../config/db";
import { RowDataPacket } from "mysql2";

export interface Reservation {
  id?: number;
  user_id: number;
  spot_id: number;
  start_at: string;
  end_at: string;
  status?: string;
}

export const createReservation = async (reservation: Reservation, conn: any) => {
  const [result] = await conn.query(
    "INSERT INTO reservations (user_id, spot_id, start_at, end_at, status) VALUES (?, ?, ?, ?, 'confirmed')",
    [reservation.user_id, reservation.spot_id, reservation.start_at, reservation.end_at]
  );
  // @ts-ignore
  return result.insertId;
};

export const getUserReservations = async (userId: number) => {
  const [rows] = await pool.query(
    "SELECT * FROM reservations WHERE user_id = ? ORDER BY created_at DESC",
    [userId]
  );
  // @ts-ignore
  return rows;
};

export const getAllReservations = async () => {
  const [rows] = await pool.query("SELECT * FROM reservations ORDER BY created_at DESC");
  // @ts-ignore
  return rows;
};

export const getReservationById = async (id: number) => {
  const [rows] = await pool.query("SELECT * FROM reservations WHERE id = ?", [id]);
  // @ts-ignore
  return rows[0] || null;
};

export const cancelReservation = async (id: number) => {
  await pool.query("UPDATE reservations SET status = 'cancelled' WHERE id = ?", [id]);
};
