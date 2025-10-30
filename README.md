# 🚗 ParkNow — Parking Reservation App

**ParkNow** is a small parking and reservation application built with:

- 📱 **React Native (Expo)** — Mobile & Web frontend  
- ⚙️ **Node.js + TypeScript (Express)** — Backend API server  
- 🗄️ **MySQL** — Database  

This guide will help you **set up**, **run**, and **test** the project step by step.

---

## 📁 Project Structure
```
ParkNow_project/
├── ParkNowApp/ # Frontend - React Native (Expo)
│ 
└── Server/ # Backend - Node.js + TypeScript (Express)
```
## 🔗 Useful Links

- 🎥 [Demo Video](https://drive.google.com/file/d/17wzy9yqQLnddniegm784dH_0mOT4JE_W/view?usp=sharing)
- 💾 [MySQL Database File](https://drive.google.com/file/d/1-r6Ue3qEAK1XfjSXtn0UXeHagZa7MV7S/view?usp=sharing)

---

## 🧰 Prerequisites

Make sure you have the following installed:

| Tool | Version | Download |
|------|----------|-----------|
| **Node.js** | 18+ | [https://nodejs.org](https://nodejs.org) |
| **npm** (comes with Node) | — | — |
| **Expo CLI** | Latest | Run `npm install -g expo-cli` |
| **MySQL** | 8.x | [https://dev.mysql.com/downloads/](https://dev.mysql.com/downloads/) |
| **Git** | Latest | [https://git-scm.com/](https://git-scm.com/) |

💡 *If you’re using Windows, run all commands in **PowerShell**.*

---

## ⚙️ Step 1 — Clone the Repository
```
git clone https://github.com/Wanushka/ParkNow_project.git
cd ParkNow_project
```

⚙️ Step 2 — Setup the Backend (Server)

1️⃣ Go to the server folder
```
cd Server
```

2️⃣ Install dependencies
```
npm install
```

3️⃣ Create a .env file inside Server/
```
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=parknow_db
PORT=8001
```
⚙️ Step 3 — Create Database
import provided database file inside of your MySQL server.

🚀 Step 4 — Run the Backend Server

```
npm run dev

```
If it starts successfully, you’ll see something like:
Server running on http://localhost:8001
Database connected!

📱 Step 5 — Setup the Frontend (Expo App)

1️⃣ Go to the app folder
```
cd ../ParkNowApp
```

2️⃣ Install dependencies
```
npm install
```

3️⃣ Set your API Base URL
Open this file:

ParkNowApp/src/api/api.ts
And set your backend API URL:

export const API_BASE_URL = "http://YOUR_IP_ADDRESS:8001/api";

---

## 🧠 Notes:

For Android Emulator, use:
http://10.0.2.2:8001/api
For real mobile devices, use your computer’s LAN IP, e.g.:

📲 Step 6 — Run the Expo App
```
npm start
```
Then choose:

a → Run on Android emulator

w → Run in web browser

Or scan the QR code using the Expo Go app on your phone

Your mobile app will now connect to the backend 🎉

---

## ✅ Testing the App

Test the Backend:
```
cd Server
npm run build
npm run dev
```
Test the Frontend:
```
cd ../ParkNowApp
npm start
```
---

## 🧩 Common Issues and Fixes
Problem Reason Solution

❌ CORS error	Server not allowing requests Ensure cors is enabled (already included in this project).

❌ Database error Wrong credentials or database missing	Check .env and confirm parknow_db exists.

❌ App not connecting Wrong IP or port Use your LAN IP (not localhost).

❌ Port already in use Another app using 8001 Change PORT in .env (e.g., 8002).

---

## 🌟 Next Improvements (Optional)

🧪 Add Jest tests for backend and frontend

⚡ Add GitHub Actions (CI/CD)

🔐 Use .env in Expo app with react-native-dotenv

🗺️ Add Admin Dashboard or enhanced map features

If something doesn’t work, check the console logs in both Server and Expo, they’ll tell you what’s wrong.

---

Made with ❤️ by Wanushka Lakmal
