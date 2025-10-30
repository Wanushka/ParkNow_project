// src/app.ts
import express from "express";
import cors from "cors";
import routes from "./routes";
import dotenv from "dotenv";
dotenv.config();

const app = express();

// middleware
// allow Authorization header for bearer tokens and reflect origin
app.use(cors({ origin: true, allowedHeaders: ["Content-Type", "Authorization"] }));
app.use(express.json());

// prefix all API routes with /api
app.use("/api", routes);

// simple health route
app.get("/", (req, res) => res.send({ ok: true, now: new Date() }));

export default app;
