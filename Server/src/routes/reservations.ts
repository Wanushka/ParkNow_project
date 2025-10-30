// src/routes/reservations.ts
import { Router } from "express";
import { requireAuth } from "../middleware/authMiddleware";
import {
  createReservation,
  listReservations,
  cancelReservation,
} from "../controllers/reservationsController";

const router = Router();

// POST /api/reservations
router.post("/", requireAuth, createReservation);

// GET /api/reservations
router.get("/", requireAuth, listReservations);

// POST /api/reservations/:id/cancel
router.post("/:id/cancel", requireAuth, cancelReservation);

export default router;
