# 🚗 ParkNow — Parking Reservation App

**ParkNow** is a small parking and reservation application built with:

- 📱 **React Native (Expo)** — Mobile & Web frontend  
- ⚙️ **Node.js + TypeScript (Express)** — Backend API server  
- 🗄️ **MySQL** — Database  

This guide will help you **set up**, **run**, and **test** the project step by step.

---

## 📁 Project Structure

ParkNow_project/
│
├── ParkNowApp/ # Frontend - React Native (Expo)
│ └── src/api/api.ts # Set API base URL here
│
└── Server/ # Backend - Node.js + TypeScript (Express)
├── src/config/db.ts # MySQL connection setup
├── schema.sql # Database schema (tables)
└── seed.sql # Sample data for testing

yaml
Copy code

---

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

```bash
git clone https://github.com/Wanushka/ParkNow_project.git
cd ParkNow_project
⚙️ Step 2 — Setup the Backend (Server)
1️⃣ Go to the server folder
bash
Copy code
cd Server
2️⃣ Install dependencies
bash
Copy code
npm install
3️⃣ Create a .env file inside Server/
Paste this example and update with your MySQL credentials:

ini
Copy code
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=parknow_db
PORT=8001
🗄️ Step 3 — Setup the Database
Option 1: Using Command Line
bash
Copy code
mysql -u root -p -h 127.0.0.1 -P 3306 < .\Server\schema.sql
mysql -u root -p -h 127.0.0.1 -P 3306 < .\Server\seed.sql
Option 2: Using MySQL Workbench / phpMyAdmin
Open your SQL client

Create a new database named parknow_db

Run the code from schema.sql

Then run seed.sql to insert sample data

✅ Done! The database is ready.

🚀 Step 4 — Run the Backend Server
bash
Copy code
npm run dev
If it starts successfully, you’ll see something like:

arduino
Copy code
Server running on http://localhost:8001
Database connected!
📱 Step 5 — Setup the Frontend (Expo App)
1️⃣ Go to the app folder
bash
Copy code
cd ../ParkNowApp
2️⃣ Install dependencies
bash
Copy code
npm install
3️⃣ Set your API Base URL
Open this file:

bash
Copy code
ParkNowApp/src/api/api.ts
And set your backend API URL:

ts
Copy code
export const API_BASE_URL = "http://YOUR_IP_ADDRESS:8001/api";
🧠 Notes:

For Android Emulator, use:

ts
Copy code
http://10.0.2.2:8001/api
For real mobile devices, use your computer’s LAN IP, e.g.:

ts
Copy code
http://192.168.1.5:8001/api
📲 Step 6 — Run the Expo App
bash
Copy code
npm start
Then choose:

a → Run on Android emulator

w → Run in web browser

Or scan the QR code using the Expo Go app on your phone

Your mobile app will now connect to the backend 🎉

🧠 Architecture Overview
csharp
Copy code
[React Native App]
       |
       | REST API + WebSocket
       v
[Node.js + Express Server]
       |
       v
[MySQL Database]
Or in Mermaid (if supported):

mermaid
Copy code
flowchart LR
  A[React Native (Expo)] -->|HTTP / Socket.IO| B[Node.js + Express Server]
  B -->|MySQL Queries| C[(MySQL Database)]
✅ Testing the App
Test the Backend:
bash
Copy code
cd Server
npm run build
npm run dev
Test the Frontend:
bash
Copy code
cd ../ParkNowApp
npm start
Now test these features:

✅ User Signup / Login

✅ View available parking spots

✅ Create & cancel reservations

✅ Realtime updates with Socket.IO

🧩 Common Issues and Fixes
Problem	Reason	Solution
❌ CORS error	Server not allowing requests	Ensure cors is enabled (already included in this project)
❌ Database error	Wrong credentials or database missing	Check .env and confirm parknow_db exists
❌ App not connecting	Wrong IP or port	Use your LAN IP (not localhost)
❌ Port already in use	Another app using 8001	Change PORT in .env (e.g., 8002)

🌟 Next Improvements (Optional)
🧪 Add Jest tests for backend and frontend

⚡ Add GitHub Actions (CI/CD)

🔐 Use .env in Expo app with react-native-dotenv

🗺️ Add Admin Dashboard or enhanced map features

🧾 Quick Command Summary
bash
Copy code
# 1️⃣ Clone the project
git clone https://github.com/Wanushka/ParkNow_project.git

# 2️⃣ Setup server
cd Server
npm install
# Create .env and import schema.sql + seed.sql
npm run dev

# 3️⃣ Setup frontend
cd ../ParkNowApp
npm install
npm start
🎉 Now your ParkNow App is running locally!
If something doesn’t work, check the console logs in both Server and Expo, they’ll tell you what’s wrong.

Made with ❤️ by Wanushka Lakmal
