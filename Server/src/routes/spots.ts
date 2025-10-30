// src/routes/spots.ts
import { Router } from "express";
import { listSpots, getSpot, createSpot } from "../controllers/spotController";
import { requireAuth, requireAdmin } from "../middleware/authMiddleware";

const router = Router();

// GET /api/spots?lat=&lng=&radius_km=&available=
router.get("/", listSpots);

// GET /api/spots/:id
router.get("/:id", getSpot);

// POST /api/spots  (admin)
router.post("/", requireAuth, requireAdmin, createSpot);

export default router;
