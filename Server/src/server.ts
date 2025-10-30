// src/server.ts
import dotenv from "dotenv";
dotenv.config();

import http from "http";
import { Server as SocketIOServer } from "socket.io";
import app from "./app";

const PORT = process.env.PORT ? parseInt(process.env.PORT) : 8001;

const httpServer = http.createServer(app);

// create socket.io server
const io = new SocketIOServer(httpServer, {
  cors: { origin: "*" },
});

// simple in-memory mapping of socket subscriptions (for demo)
const geoRooms = new Map<string, Set<string>>(); // gridHash -> set(socket.id)

// socket handlers
io.on("connection", (socket) => {
  console.log("Socket connected:", socket.id);

  // client:subscribe { token, lat, lng, radius }
  socket.on("client:subscribe", (payload: any) => {
    // naive: subscribe by spot id room or geo hash (client may send desired)
    if (!payload) return;
    if (payload.spotId) {
      socket.join(`spot:${payload.spotId}`);
    }
    if (payload.geo) {
      const key = `geo:${payload.geo}`;
      socket.join(key);
      // track membership (optional)
      if (!geoRooms.has(key)) geoRooms.set(key, new Set());
      geoRooms.get(key)!.add(socket.id);
    }
  });

  // client:reserve -> we still recommend using REST, but accept for optimistic UX
  socket.on("client:reserve", (data) => {
    // simply forward to server-side logic through REST ideally.
    console.log("client:reserve", data);
    // no DB logic here for simplicity
  });

  socket.on("disconnect", () => {
    console.log("Socket disconnected:", socket.id);
    // clean geoRooms entries
    for (const [k, s] of geoRooms) {
      s.delete(socket.id);
      if (s.size === 0) geoRooms.delete(k);
    }
  });
});

// Provide io to app via locals so controllers can emit events
app.set("io", io);

httpServer.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});
