# LunchMate 🍱 🚀

[![Live Demo](https://img.shields.io/badge/Live%20Demo-lunch--mate--opal.vercel.app-success?style=flat-square&logo=vercel&logoColor=white)](https://lunch-mate-opal.vercel.app)
[![API Status](https://img.shields.io/badge/API%20Status-Live%20(Render)-blue?style=flat-square&logo=render&logoColor=white)](https://lunchmate-1hq9.onrender.com/api/health)
[![React](https://img.shields.io/badge/React-18.x-61DAFB?style=flat-square&logo=react&logoColor=black)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-5.x-646CFF?style=flat-square&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Node.js](https://img.shields.io/badge/Node.js-20.x-339933?style=flat-square&logo=node.js&logoColor=white)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-5.x-000000?style=flat-square&logo=express&logoColor=white)](https://expressjs.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-4169E1?style=flat-square&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Prisma](https://img.shields.io/badge/Prisma-ORM-2D3748?style=flat-square&logo=prisma&logoColor=white)](https://www.prisma.io/)
[![Redis](https://img.shields.io/badge/Redis-7-DC382D?style=flat-square&logo=redis&logoColor=white)](https://redis.io/)
[![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?style=flat-square&logo=docker&logoColor=white)](https://www.docker.com/)
[![License](https://img.shields.io/badge/License-MIT-green.svg?style=flat-square)](LICENSE)

> **LunchMate** is an end-to-end full-stack logistics and subscription platform that connects working parents, neighborhood drivers, and school gates to ensure hot, home-cooked lunches are securely picked up from doorsteps and delivered warm before the lunch bell strikes.

---

## 🌟 Key Highlights

* **Multi-Role Portals:** Unified authentication and dedicated role experiences for **Parents**, **Delivery Drivers**, and **Operations Admins**.
* **Live GPS Corridor Routing:** Automated doorstep-to-school-gate distance calculation with real-time road telematics (speed, traffic, ETA to bell).
* **Smart 3-km Corridor Pricing:** Standard 0–3.0 km base pricing included across 5-day, 20-day, and 60-day passes with transparent per-km incremental surcharges.
* **Dual-Sided RBI Escrow & Payment Engine:**
  * **Pay-In (YouPI):** 0% platform fee, dynamic UPI QR codes, 1-click mobile UPI intent (GPay, PhonePe, Paytm, BHIM), and instant 12-digit UTR reconciliation.
  * **Pay-Out (RazorpayX):** Automated driver escrow disbursement triggered exclusively after school gate arrival (< 100m) and authorized gate OTP verification.
* **Tamil Nadu School Registry & Unlisted School Workflow:** Pre-indexed schools across Chennai, Chengalpattu, Kanchipuram, and Coimbatore with support for custom unlisted schools via Google Maps navigation links subject to admin approval.
* **Fluid Responsive Architecture:** Dynamic layout scaling that adapts smoothly between minimized/split-screen views (< 640px) and ultra-wide desktop monitors (> 1600px).

---

## 📐 Architecture & Flow

```mermaid
flowchart TD
    subgraph Client ["Frontend (React + Vite)"]
        Parent["Parent Dashboard\n(Subscription & Live Tracking)"]
        Driver["Driver Logistics Portal\n(Acceptance & OTP Handshakes)"]
        Admin["Admin Console\n(School Approvals & Escrow Ops)"]
    end

    subgraph Backend ["Backend (Express 5 REST API)"]
        API["API Gateway / Controllers"]
        Auth["Role Authentication & JWT"]
        Router["OSRM / Haversine Road Engine"]
        EscrowEngine["Escrow & Settlement Manager"]
    end

    subgraph DataStore ["Storage & Cache"]
        DB[(PostgreSQL 15 via Prisma)]
        Cache[(Redis 7 Sessions & Telematics)]
    end

    subgraph Gateways ["Payment & Banking"]
        YouPI["YouPI (Parent Pay-In via UPI QR / UTR)"]
        RazorpayX["RazorpayX (Driver Payout via IMPS / UPI)"]
    end

    Parent -->|Subscribe / Pay-In| API
    Driver -->|Telemetry & Gate OTP| API
    Admin -->|Verify Custom Schools| API

    API --> Auth
    API --> Router
    API --> EscrowEngine

    API --> DB
    API --> Cache

    EscrowEngine -->|Generate Dynamic QR| YouPI
    EscrowEngine -->|Release Delivery Payment| RazorpayX
```

---

## 📋 The 8-Step Delivery Procedure (`PROCEDURE`)

LunchMate operates on a strict, tamper-proof 8-step delivery lifecycle:

| Step | Phase | Action & Verification |
| :--- | :--- | :--- |
| **1** | **Pack Tiffin & Mark Ready** | Parent marks food ready; dispatch broadcasts to nearest neighborhood driver. |
| **2** | **Driver Acceptance & Approach** | Driver accepts delivery; parent tracks live approach of driver and EV details. |
| **3** | **Proximity Alert (< 300m)** | High-priority notification sent to parent to have the warm lunchbox ready. |
| **4** | **Doorstep Arrival & Bell Chime** | Driver arrives; 30-second chime sounds; 10-minute waiting countdown starts. |
| **5** | **Pickup OTP Handshake** | Parent provides 4-digit pickup OTP to driver to secure lunchbox in thermal bag. |
| **6** | **Waiting Rule & Fee** | Overtime past 10m + 2m grace period triggers a compulsory ₹110 waiting fee. |
| **7** | **School Corridor Transit** | Driver navigates road corridor with live speed (18–32 km/h), traffic, and ETA. |
| **8** | **School Gate Arrival & Settlement** | Driver enters within 100m of gate; school security verifies Gate OTP; funds release to driver. |

---

## 🛠️ Tech Stack

### Frontend
* **Framework:** React 18, Vite 5
* **Routing & Maps:** Leaflet, OpenStreetMap, OSRM Road Distance Engine
* **Icons & UI:** Lucide React, Custom CSS Tokens (Warm Amber & Espresso theme)
* **Design:** Fluid Grid & Clamp Typography (100% responsive from mobile to 4K)

### Backend
* **Runtime:** Node.js 20+, Express 5
* **Database & ORM:** PostgreSQL 15, Prisma ORM
* **Caching & State:** Redis 7 (Alpine)
* **Containerization:** Docker & Docker Compose

### Payments & Escrow
* **Pay-In:** YouPI Dynamic UPI QR & 12-digit UTR reconciliation (0% fee)
* **Pay-Out:** RazorpayX Escrow API (Automated IMPS/UPI driver payouts)

---

## 📁 Repository Structure

```
LunchMate/
├── backend/
│   ├── prisma/
│   │   └── schema.prisma         # PostgreSQL data models (User, Driver, Order, Transaction)
│   ├── src/
│   │   ├── controllers/          # Payment, order, and school controllers
│   │   ├── routes/               # Express REST routes (/api/payments, /api/schools)
│   │   └── server.js             # Express application entrypoint
│   ├── .env.example              # Backend environment variables template
│   ├── Dockerfile                # Backend container definition
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/           # PaymentEscrowModal, DeliveryProcedureLifecycle, etc.
│   │   ├── context/              # AppStateContext, AuthContext
│   │   ├── data/                 # Tamil Nadu real schools database
│   │   ├── pages/                # ParentDashboard, LoginPage, DriverPortal, AdminPortal
│   │   ├── utils/                # roadRouting, haversineMeters, pricing logic
│   │   ├── App.jsx
│   │   ├── index.css             # Responsive breakpoints (<640px, >1600px)
│   │   └── main.jsx
│   ├── .env.example              # Frontend environment variables template
│   ├── Dockerfile                # Frontend container definition
│   └── package.json
├── docker-compose.yml            # Multi-container orchestration (App, DB, Redis)
├── PROCEDURE.md                  # Strict 8-step delivery procedure specification
├── .gitignore                    # Comprehensive secrets & build exclusion rules
└── README.md
```

---

## 🚀 Quickstart Guide

### Prerequisites
* [Node.js](https://nodejs.org/) (v18 or higher)
* [Docker Desktop](https://www.docker.com/) (optional, for full-stack containerization)
* [PostgreSQL 15+](https://www.postgresql.org/) (if running locally without Docker)

---

### Option 1: Run with Docker Compose (Recommended)

1. **Clone the repository:**
   ```bash
   git clone https://github.com/kowshik0504/LunchMate.git
   cd LunchMate
   ```

2. **Set up environment variables:**
   ```bash
   cp backend/.env.example backend/.env
   cp frontend/.env.example frontend/.env
   ```

3. **Spin up all services (Frontend, Backend, PostgreSQL, Redis):**
   ```bash
   docker-compose up --build
   ```

4. **Access the application:**
   * Frontend: `http://localhost:3000`
   * Backend API: `http://localhost:5000`

---

### Option 2: Run Locally (Manual Setup)

#### 1. Backend Setup
```bash
cd backend
npm install
cp .env.example .env

# Generate Prisma Client & Run Migrations
npx prisma generate
npx prisma db push

# Start Backend Server
npm run dev
# Server running at http://localhost:5000
```

#### 2. Frontend Setup
```bash
cd ../frontend
npm install
cp .env.example .env

# Start Vite Development Server
npm run dev
# Vite server running at http://localhost:3000
```

---

## 🔐 Environment Variables & Security Protocol

To maintain complete security, **no credentials, secret keys, or environment files (`.env`) are ever tracked in version control**.

Always configure your private values in local `.env` files using the provided templates:

### Backend (`backend/.env.example`)
```env
PORT=5000
NODE_ENV=development
DATABASE_URL="postgresql://postgres:lunchmate123@localhost:5432/lunchmate?schema=public"
REDIS_URL="redis://localhost:6379"
JWT_SECRET="your_jwt_secret_key_here_min_32_chars"
YOUPI_MERCHANT_VPA="lunchmate.escrow@icici"
RAZORPAY_KEY_ID="rzp_test_placeholder"
RAZORPAY_KEY_SECRET="placeholder_secret_key"
```

### Frontend (`frontend/.env.example`)
```env
VITE_API_URL="http://localhost:5000"
VITE_GROQ_API_KEY="your_groq_api_key_here"
```

> [!NOTE]
> All `.env`, `*.key`, `*.pem`, and internal developer workspace artifacts are strictly blocked in `.gitignore`.

---

## 📡 API Reference Summary

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/payments/youpi/create-charge` | Creates a zero-fee dynamic UPI payment charge with QR & UPI intent string. |
| `POST` | `/api/payments/youpi/verify-utr` | Reconciles parent 12-digit bank UTR for instant pass activation. |
| `POST` | `/api/payments/youpi/webhook` | Handles YouPI bank payment webhooks. |
| `POST` | `/api/payments/razorpayx/payout` | Releases driver payout upon verified school gate OTP handshake. |
| `GET`  | `/api/schools` | Fetches active approved Tamil Nadu schools. |
| `POST` | `/api/schools/suggest-unlisted` | Submits custom unlisted school with Google Maps link for admin approval. |

---

## 📄 License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.

## 👤 Author

**Kowshik Suresh**
* GitHub: [@kowshik0504](https://github.com/kowshik0504)
* Project: [LunchMate](https://github.com/kowshik0504/LunchMate)
