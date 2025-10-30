// src/controllers/spotsController.ts
import { Request, Response } from "express";
import pool from "../config/db";

function haversineSQL(lat: number, lng: number) {
  return `(
    6371 * acos(
      cos(radians(${lat})) * cos(radians(latitude)) *
      cos(radians(longitude) - radians(${lng})) +
      sin(radians(${lat})) * sin(radians(latitude))
    )
  )`;
}

export const listSpots = async (req: Request, res: Response) => {
  const { lat, lng, radius_km, available } = req.query;
  try {
    if (lat && lng && radius_km) {
      const latN = Number(lat);
      const lngN = Number(lng);
      const radiusN = Number(radius_km);
      const distanceExpr = haversineSQL(latN, lngN);
   const q = `SELECT id, title, description, latitude, longitude, is_available, price_per_hour, capacity, available_count,
          ${distanceExpr} as distance_km
        FROM spots
       HAVING distance_km <= ?
       ORDER BY distance_km ASC
       LIMIT 200`;
      const [rows] = await pool.query(q, [radiusN]);
      // @ts-ignore
      return res.json(rows);
    } else {
      // simple list
  let q = "SELECT id, title, description, latitude, longitude, is_available, price_per_hour, capacity, available_count FROM spots";
      const params: any[] = [];
      if (available === "true") {
        q += " WHERE is_available = TRUE";
      }
      const [rows] = await pool.query(q, params);
      // @ts-ignore
      return res.json(rows);
    }
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};

export const getSpot = async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  try {
    const [rows] = await pool.query("SELECT * FROM spots WHERE id = ?", [id]);
    // @ts-ignore
    const spot = Array.isArray(rows) && rows.length ? rows[0] : null;
    if (!spot) return res.status(404).json({ message: "Spot not found" });
    return res.json(spot);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};

export const createSpot = async (req: Request, res: Response) => {
  const { title, description, latitude, longitude, price_per_hour, sensor_id, capacity } = req.body;
  try {
    const cap = typeof capacity === "number" && capacity > 0 ? capacity : 1;
    const [result] = await pool.query(
      "INSERT INTO spots (title, description, latitude, longitude, price_per_hour, sensor_id, capacity, available_count, is_available) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
      [title, description || null, latitude, longitude, price_per_hour || 0, sensor_id || null, cap, cap, cap > 0]
    );
    // @ts-ignore
    const insertId = (result as any).insertId;
    // emit socket event so clients get update (if io available)
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const io = req.app.get("io");
    if (io) io.emit("spot:updated", { spot_id: insertId, is_available: true, current_reservation_id: null });
    return res.status(201).json({ id: insertId });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};
