# 🚛 TruckBer — Logistics & Fleet Management Platform

An Uber-like truck booking platform built with MERN Stack.
Connects customers, truck owners, drivers, and admins.
Includes a 🐄 Livestock Transport Extension for farmers.

---

## Quick Start (Local with MongoDB Compass)

### Requirements
- Node.js 18+
- MongoDB Community Server installed and running
- MongoDB Compass (for viewing your database visually)

### 1. Install & Configure

```bash
# Backend
cd backend
npm install
cp .env.example .env
# Open .env and fill in Cloudinary + Email keys
# MongoDB is already configured for local: mongodb://localhost:27017/truckber

# Frontend
cd ../frontend
npm install
cp .env.example .env
```

### 2. Seed Demo Data

```bash
cd backend
npm run seed
```

### 3. Start

```bash
# Terminal 1
cd backend && npm run dev       # API → http://localhost:5000

# Terminal 2
cd frontend && npm run dev      # UI  → http://localhost:5173
```

### 4. View Database in Compass

Open MongoDB Compass → Connect to `mongodb://localhost:27017` → Open **truckber**

---

## Demo Logins

| Role | Email | Password |
|------|-------|----------|
| 👑 Admin | admin@truckber.com | admin123 |
| 🛒 Customer | customer@truckber.com | pass123 |
| 🚛 Truck Owner | owner@truckber.com | pass123 |
| 👤 Driver | driver@truckber.com | pass123 |

---

## Roles & Features

| Role | Key Features |
|------|-------------|
| Customer | Book truck, live tracking, download invoice, rate driver |
| Truck Owner | Register fleet, accept bookings, assign drivers, earnings |
| Driver | View trips, share GPS location, upload proof of delivery |
| Admin | Dashboard stats, verify drivers, manage users, reports |

---

## Tech Stack

**Frontend:** React 18 · Vite · Tailwind CSS · Redux Toolkit · React Leaflet · Chart.js · Socket.io  
**Backend:** Node.js · Express · MongoDB · Mongoose · Socket.io · JWT · PDFKit · Nodemailer  
**Database:** MongoDB (local with Compass) → Atlas for production  
**Storage:** Cloudinary (images, documents, invoice PDFs)

---

## Documentation

| File | Contents |
|------|---------|
| `docs/README.md` | Full project documentation |
| `docs/API.md` | All 50+ API endpoints with examples |
| `docs/DATABASE.md` | Schema design, indexes, aggregations |
| `docs/ER_DIAGRAM.mermaid` | Entity-relationship diagram |
| `docs/MONGODB_COMPASS_SETUP.md` | Step-by-step Compass setup guide |
| `deployment/DEPLOY.md` | Local setup + production deployment guide |

---

## Run Tests

```bash
cd backend
npm test
# 39 tests across 3 suites — all passing
```

---

## Production Deployment

When ready to go live:
1. Create MongoDB Atlas free cluster → update `MONGODB_URI` in `.env`
2. Deploy backend to **Render** (free)
3. Deploy frontend to **Vercel** (free)

See `deployment/DEPLOY.md` for step-by-step instructions.

> MongoDB Compass also works with Atlas — connect using the Atlas URI
> to get the same visual database browser for your cloud data.

---

*Final Year BCA Project · MERN Stack · 75 files · 39 tests*
