// src/routes/index.ts
import { Router } from "express";
import authRoutes from "./auth";
import spotsRoutes from "./spots";
import reservationsRoutes from "./reservations";

const router = Router();

router.use("/auth", authRoutes);
router.use("/spots", spotsRoutes);
router.use("/reservations", reservationsRoutes);

export default router;
