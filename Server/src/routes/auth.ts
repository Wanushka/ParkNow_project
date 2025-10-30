// src/routes/auth.ts
import { Router } from "express";
import * as authController from "../controllers/authController";

const router = Router();

router.post("/signup", (authController as any).signup);
router.post("/login", (authController as any).login);

export default router;
