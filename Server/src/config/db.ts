// src/config/db.ts
import mysql from "mysql2/promise";
import dotenv from "dotenv";
dotenv.config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || "127.0.0.1",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "parknow_db",
  port: process.env.DB_PORT ? parseInt(process.env.DB_PORT) : 3306,
  waitForConnections: true,
  connectionLimit: 10,
  namedPlaceholders: true,
});

export default pool;
