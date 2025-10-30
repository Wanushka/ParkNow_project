// src/models/spotModel.ts
import pool from "../config/db";

export interface Spot {
  id?: number;
  title: string;
  description?: string;
  latitude: number;
  longitude: number;
  is_available?: boolean;
  price_per_hour?: number;
  sensor_id?: string;
  capacity?: number; // total parking areas for this location
  available_count?: number; // currently available areas
}

export const getAllSpots = async () => {
  const [rows] = await pool.query("SELECT * FROM spots ORDER BY id DESC");
  // @ts-ignore
  return rows;
};

export const getSpotById = async (id: number) => {
  const [rows] = await pool.query("SELECT * FROM spots WHERE id = ?", [id]);
  // @ts-ignore
  return rows[0] || null;
};

export const createSpot = async (spot: Spot) => {
  const capacity = typeof spot.capacity === 'number' && spot.capacity > 0 ? spot.capacity : 1;
  const available_count = capacity;
  const is_available = available_count > 0;

  const [result] = await pool.query(
    "INSERT INTO spots (title, description, latitude, longitude, price_per_hour, sensor_id, capacity, available_count, is_available) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
    [spot.title, spot.description || null, spot.latitude, spot.longitude, spot.price_per_hour || 0, spot.sensor_id || null, capacity, available_count, is_available]
  );
  // @ts-ignore
  return result.insertId;
};

export const updateSpotAvailability = async (spotId: number, available: boolean) => {
  await pool.query("UPDATE spots SET is_available = ? WHERE id = ?", [available, spotId]);
};
