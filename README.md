# ParkNow (ParkNow_project)

A small parking/reservation application consisting of a React Native (Expo) frontend and a Node + TypeScript backend using MySQL. This README explains how to set up and run both projects locally, provides a simple architecture diagram, testing/validation steps, and points to the included MySQL schema & seed files.

---

## Repository layout

- `ParkNowApp/` – Expo React Native app (mobile + web).
  - `src/api/api.ts` — API client; set `API_BASE_URL` to point at the server.
- `Server/` – Express + TypeScript API server.
  - `src/config/db.ts` — MySQL connection (reads env variables).
  - `schema.sql` and `seed.sql` — SQL files to create the database schema and seed sample data.

---

## Quick links

- Demo video (replace with actual URL): https://example.com/your-demo-video
- MySQL schema: `Server/schema.sql`
- MySQL seed data: `Server/seed.sql`

---

## Prerequisites

- Node.js (LTS recommended, e.g. 18+)
- npm (or yarn)
- Expo CLI (for mobile/Expo workflows): `npm install -g expo-cli` (optional if you use `npx`)
- MySQL server (8.x or compatible) or MariaDB
- Git (to clone the repo)

On Windows, run commands from PowerShell (examples below are for PowerShell).

---

## Environment variables

Server expects the following environment variables (create a `.env` file inside `Server/`):

```
# Server/.env (example)
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=parknow_db
JWT_SECRET=verysecretkey
PORT=8001
```

Frontend (Expo) uses an `API_BASE_URL` variable inside code (or you can create `ParkNowApp/.env`). Example value to use in `ParkNowApp/.env`:

```
API_BASE_URL=http://192.168.1.100:8001/api  # replace with your machine LAN IP or http://localhost:8001/api if using an emulator
```

Notes about `API_BASE_URL`:
- On a physical phone, use your dev machine's LAN IP (so the device can reach your server).
- On Android emulator running on the same machine, you can use `http://10.0.2.2:8001/api`.
- `src/api/api.ts` in `ParkNowApp` defaults to `http://192.168.8.184:8001/api` if no env override is present. Update it or set `API_BASE_URL`.

---

## Setup and run (PowerShell)

Open two terminals (or more): one for the server and one for the app.

1) Server (API)

```powershell
# from repo root
cd .\Server
# install dependencies
npm install
# create or edit .env (see example above)
# create mysql database and import schema/seed (see next section)
# start in development (auto-reloads)
npm run dev
# or build and run production:
npm run build; npm start
```

2) Frontend (Expo)

```powershell
# from repo root
cd .\ParkNowApp
npm install
# start expo metro
npm start
# open on Android emulator
npm run android
# open on iOS simulator (macOS only)
npm run ios
# open in web browser
npm run web
```

When running on a real device, make sure `API_BASE_URL` is reachable from the device (use your host LAN IP). If you get CORS issues, the server includes `cors` dependency — ensure CORS is enabled in `Server` code (it's already a dependency in package.json).

---

## Importing the MySQL schema and seed

The repository contains `Server/schema.sql` and `Server/seed.sql`. To create the database and import sample data:

```powershell
# Replace user/password/host/name accordingly
# Example using the mysql CLI (PowerShell):
mysql -u root -p -h 127.0.0.1 -P 3306 < .\Server\schema.sql
mysql -u root -p -h 127.0.0.1 -P 3306 < .\Server\seed.sql
```

Or, manually in MySQL Workbench / phpMyAdmin: run the SQL statements in `schema.sql` first, then `seed.sql`.

After import, ensure `DB_NAME` in `.env` matches the database name created by `schema.sql` (defaults to `parknow_db` in `src/config/db.ts`).

---

## Architecture (high-level)

Simple diagram (ASCII):

```
[Mobile / Web (Expo React Native)]
           |
           | REST / HTTP + WebSocket (Socket.IO)
           v
  [Express API Server (TypeScript)]
           |
           | MySQL (mysql2)
           v
      [MySQL Database]

Live reservations push: Server <-> Client via Socket.IO for realtime updates
```

Mermaid flow (if your Markdown renderer supports it):

```mermaid
flowchart LR
  A[Mobile / Web (Expo)] -->|HTTP / REST| B[Express + Socket.IO Server]
  B -->|MySQL queries| C[MySQL Database]
  B <-->|Socket.IO| A
```

Files of interest:
- `ParkNowApp/src/api/api.ts` — API client and base URL config
- `Server/src/routes/*` — API endpoints
- `Server/src/config/db.ts` — DB pool and env keys

---

## Tests / Validation

This repository doesn't include a test suite by default (no Jest/Mocha setup). To validate the projects locally, use the following quick checks:

- Server TypeScript compile (basic validation):

```powershell
cd .\Server
npm run build
```

- Start server in dev mode and watch logs for runtime errors:

```powershell
npm run dev
```

- For the frontend, open the Expo dev tools and run on emulator/device; test flows manually (signup/login, create/cancel reservation, admin spot creation).

If you want to add unit tests, consider adding Jest + ts-jest for the server and react-native-testing-library + jest for Expo app.

---

## Troubleshooting

- CORS errors: ensure the API server is running and CORS is enabled.
- DB connection errors: confirm `.env` values and that MySQL is running and accessible.
- Mobile device can't reach API: replace `API_BASE_URL` with your machine LAN IP and ensure firewall allows the port (default 8001).

---

## Demo video

Placeholder: https://example.com/your-demo-video

Replace with your hosted demo (YouTube, Vimeo or direct MP4 URL).

---

## Included files (important)

- `Server/schema.sql` — create tables
- `Server/seed.sql` — insert sample records
- `ParkNowApp/src/api/api.ts` — default API URL; adjust for your environment

---

## Next steps / suggestions

- Add automated tests (Jest) and a `npm test` script for both server and app.
- Add CI (GitHub Actions) to run `npm run build` for the server and `tsc` for the app on PRs.
- Add more robust environment configuration for Expo (e.g., `react-native-dotenv` or using `expo-constants`).

---

If you want, I can:
- add a real demo video link if you provide it,
- create a sample `.env.example` in both `Server/` and `ParkNowApp/`, or
- add a simple `npm test` (Jest) setup for the Server and create a minimal unit test to validate the build.

Tell me which of the above you'd like me to do next.
