// src/api/api.ts
import axios from "axios";

// Default to environment override. For Expo on a physical Android device, use
// your development machine's LAN IP so the phone can reach the server.
// Replace 192.168.8.184 with your machine IP if different. For Android emulator
// running on the same machine you can use http://10.0.2.2:8001/api instead.
const API_BASE_URL =
  (process && (process as any).env && (process as any).env.API_BASE_URL) ||
  "http://192.168.8.184:8001/api";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { "Content-Type": "application/json" },
});

// helper to attach Authorization header for authenticated requests
export const setAuthToken = (token?: string | null) => {
  if (token) api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  else delete api.defaults.headers.common["Authorization"];
};

// AUTH
export const signup = (data: { name: string; email: string; password: string; role?: string }) =>
  api.post("/auth/signup", data);

export const login = (data: { email: string; password: string }) =>
  api.post("/auth/login", data);

// SPOTS
export const getSpots = () => api.get("/spots");
export const getSpotDetail = (id: number) => api.get(`/spots/${id}`);

// RESERVATIONS
export const createReservation = (data: { spot_id: number; start_at: string; end_at: string }) =>
  api.post("/reservations", data);

export const cancelReservation = (id: number) => api.post(`/reservations/${id}/cancel`);
export const getMyReservations = () => api.get("/reservations");

// ADMIN
export const adminCreateSpot = (data: any) => api.post("/spots", data);

export default api;
