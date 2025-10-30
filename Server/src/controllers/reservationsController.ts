// src/controllers/reservationsController.ts
import { Request, Response } from "express";
import pool from "../config/db";
import { RowDataPacket } from "mysql2";

export const createReservation = async (req: Request, res: Response) => {
  const userId = (req as any).user?.id;
  const { spot_id, start_at, end_at } = req.body;
  if (!userId) return res.status(401).json({ message: "Unauthorized" });
  if (!spot_id || !start_at || !end_at) return res.status(400).json({ message: "Missing fields" });

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    // lock spot row to avoid concurrent reservations
    const [spotRows] = await conn.query<RowDataPacket[]>("SELECT * FROM spots WHERE id = ? FOR UPDATE", [spot_id]);
    if (!Array.isArray(spotRows) || spotRows.length === 0) {
      await conn.rollback();
      return res.status(404).json({ message: "Spot not found" });
    }

    const spot = spotRows[0];

    // check available count
    const availableCount = typeof spot.available_count === 'number' ? spot.available_count : (spot.is_available ? 1 : 0);
    if (availableCount <= 0) {
      await conn.rollback();
      return res.status(409).json({ message: "No available areas at this spot" });
    }

    // check overlapping reservations (confirmed or pending)
    const [overlapRows] = await conn.query<RowDataPacket[]>(
      `SELECT * FROM reservations
       WHERE spot_id = ?
         AND status IN ('pending','confirmed')
         AND NOT (end_at <= ? OR start_at >= ?)`,
      [spot_id, start_at, end_at]
    );

    if (Array.isArray(overlapRows) && overlapRows.length > 0) {
      await conn.rollback();
      return res.status(409).json({ message: "Spot already reserved for this time range" });
    }

    // create reservation
    const [ins] = await conn.query(
      `INSERT INTO reservations (user_id, spot_id, start_at, end_at, status)
       VALUES (?, ?, ?, ?, 'confirmed')`,
      [userId, spot_id, start_at, end_at]
    );

    // decrement available_count and update is_available flag
    await conn.query(
      `UPDATE spots SET available_count = available_count - 1, is_available = (available_count - 1) > 0 WHERE id = ?`,
      [spot_id]
    );

    await conn.commit();

    // @ts-ignore
    const io = req.app.get("io");
    const reservation = {
      // @ts-ignore
      id: (ins as any).insertId,
      user_id: userId,
      spot_id,
      start_at,
      end_at,
      status: "confirmed",
    };
    // emit reservation created and spot updated
    if (io) {
      io.emit("reservation:created", { reservation });
      io.to(`spot:${spot_id}`).emit("spot:updated", { spot_id, available_count: availableCount - 1, is_available: availableCount - 1 > 0, current_reservation_id: reservation.id });
    }

    return res.status(201).json({ reservation });
  } catch (err) {
    await conn.rollback();
    console.error("reservation error", err);
    return res.status(500).json({ message: "Server error creating reservation" });
  } finally {
    conn.release();
  }
};

export const listReservations = async (req: Request, res: Response) => {
  const userId = (req as any).user?.id;
  const isAdmin = (req as any).user?.role === "admin";
  try {
    let rows;
    if (isAdmin) {
      const [r] = await pool.query("SELECT * FROM reservations ORDER BY created_at DESC LIMIT 200");
      // @ts-ignore
      rows = r;
    } else {
      const [r] = await pool.query("SELECT * FROM reservations WHERE user_id = ? ORDER BY created_at DESC", [userId]);
      // @ts-ignore
      rows = r;
    }
    return res.json(rows);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};

export const cancelReservation = async (req: Request, res: Response) => {
  const userId = (req as any).user?.id;
  const id = Number(req.params.id);
  try {
  // fetch reservation
  const [rows] = await pool.query<RowDataPacket[]>("SELECT * FROM reservations WHERE id = ?", [id]);
    const reservation = Array.isArray(rows) && rows.length ? (rows[0] as RowDataPacket & { user_id: number; spot_id: number }) : null;
    if (!reservation) return res.status(404).json({ message: "Reservation not found" });

    // only admin or owner can cancel
    if (reservation.user_id !== userId && (req as any).user?.role !== "admin") {
      return res.status(403).json({ message: "Forbidden" });
    }

    await pool.query("UPDATE reservations SET status = 'cancelled' WHERE id = ?", [id]);
    // increment available_count but don't exceed capacity
    await pool.query(
      `UPDATE spots SET available_count = LEAST(capacity, available_count + 1), is_available = LEAST(capacity, available_count + 1) > 0 WHERE id = ?`,
      [reservation.spot_id]
    );

    // emit events
    // @ts-ignore
    const io = req.app.get("io");
    if (io) {
      io.emit("reservation:cancelled", { reservation_id: id });
      io.to(`spot:${reservation.spot_id}`).emit("spot:updated", { spot_id: reservation.spot_id, action: 'cancelled' });
    }

    return res.json({ ok: true });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};
