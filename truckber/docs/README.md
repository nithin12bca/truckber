# 🚛 TruckBer — Logistics & Fleet Management Platform

> An Uber-like truck booking and fleet management system built with the MERN stack.
> Final Year BCA Project · Production-Ready · Startup Ready

---

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [API Documentation](#api-documentation)
- [Deployment](#deployment)
- [Database Schema](#database-schema)

---

## Overview

TruckBer connects **customers**, **truck owners**, **drivers**, and **administrators** on a single platform:

| Role | Key Capabilities |
|------|-----------------|
| 🛒 Customer | Book trucks, live tracking, download invoices, rate drivers |
| 🚛 Truck Owner | Register fleet, accept bookings, manage drivers, view earnings |
| 👤 Driver | Accept trips, share live GPS location, upload proof of delivery |
| ⚙️ Admin | Full platform control, verify drivers, analytics, reports |

**Special Extension:** 🐄 **Livestock Transport Module** — animal batch tracking, vaccination records, feed logs, mortality reports, and farm-to-market delivery for farmer use cases.

---

## Features

- ✅ Role-based authentication (JWT + Refresh Tokens)
- ✅ Full booking workflow (10 steps: book → deliver → invoice)
- ✅ Real-time GPS tracking with Socket.io + Leaflet/OpenStreetMap
- ✅ Fleet management with document expiry alerts
- ✅ Maintenance records for trucks
- ✅ Driver verification system
- ✅ PDF invoice auto-generation
- ✅ Admin dashboard with charts (Chart.js)
- ✅ Analytics & reports (PDF/Excel export)
- ✅ Email notifications (Nodemailer)
- ✅ Real-time push notifications via Socket.io
- ✅ Dark mode
- ✅ Mobile-responsive UI
- ✅ Livestock transport extension (🐄)
- ✅ Rate limiting, Helmet, CORS protection

---

## Tech Stack

### Frontend
| Tool | Purpose |
|------|---------|
| React 18 + Vite | UI framework + build tool |
| Tailwind CSS | Utility-first styling |
| Redux Toolkit | State management |
| React Router v6 | Client routing |
| Axios | HTTP client with interceptors |
| React Hook Form | Form management |
| Chart.js + React-Chartjs-2 | Analytics charts |
| React Leaflet | GPS maps (OpenStreetMap, free) |
| Socket.io Client | Real-time updates |
| React Hot Toast | Notifications |

### Backend
| Tool | Purpose |
|------|---------|
| Node.js + Express | REST API server |
| MongoDB + Mongoose | Database + ODM |
| Socket.io | WebSocket server |
| JWT | Auth tokens |
| Bcrypt | Password hashing |
| Cloudinary | File/image storage |
| PDFKit | Invoice PDF generation |
| Nodemailer | Email service |
| Helmet + Rate Limit | Security |

---

## Project Structure

```
truckber/
├── backend/
│   ├── src/
│   │   ├── config/           # DB, Cloudinary config
│   │   ├── controllers/      # Business logic
│   │   │   ├── authController.js
│   │   │   ├── bookingController.js
│   │   │   ├── adminController.js
│   │   │   └── fleetDriverPaymentController.js
│   │   ├── middleware/       # Auth, validation, errors
│   │   ├── models/           # Mongoose schemas
│   │   │   ├── User.js
│   │   │   ├── Driver.js
│   │   │   ├── Truck.js
│   │   │   ├── Booking.js
│   │   │   ├── Payment.js
│   │   │   └── index.js      # Notification, Review, Invoice, Maintenance, LivestockBatch, LocationHistory
│   │   ├── routes/           # Express routes
│   │   ├── services/         # Email, invoice, notification services
│   │   ├── socket/           # Socket.io handler
│   │   ├── utils/            # Distance calc, helpers
│   │   └── server.js         # Entry point
│   ├── tests/
│   └── .env.example
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   └── common/       # DashboardLayout, ProtectedRoute, UI components
│   │   ├── hooks/            # useSocket
│   │   ├── pages/
│   │   │   ├── auth/         # Login, Register, ForgotPassword, ResetPassword
│   │   │   ├── bookings/     # Bookings, BookingDetail, CreateBooking
│   │   │   ├── fleet/        # Fleet, TruckDetail
│   │   │   ├── drivers/      # Drivers, DriverProfile
│   │   │   ├── tracking/     # Tracking (Leaflet map)
│   │   │   ├── payments/     # Payments
│   │   │   ├── reports/      # Reports + charts
│   │   │   ├── admin/        # AdminPanel
│   │   │   ├── livestock/    # LivestockModule
│   │   │   ├── Landing.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Profile.jsx
│   │   │   ├── Settings.jsx
│   │   │   └── NotFound.jsx
│   │   ├── store/            # Redux slices
│   │   ├── styles/           # Tailwind CSS
│   │   └── utils/            # Axios instance
│   ├── index.html
│   └── .env.example
│
├── docs/
└── deployment/
```

---

## Getting Started

### Prerequisites
- Node.js 18+
- MongoDB Atlas account (free tier works)
- Cloudinary account (free tier)
- Gmail account for email (with App Password)

### 1. Clone & Install

```bash
git clone https://github.com/yourusername/truckber.git
cd truckber

# Backend
cd backend
npm install
cp .env.example .env
# Edit .env with your credentials

# Frontend
cd ../frontend
npm install
cp .env.example .env
```

### 2. Start Development

```bash
# Terminal 1 — Backend
cd backend
npm run dev
# → http://localhost:5000

# Terminal 2 — Frontend
cd frontend
npm run dev
# → http://localhost:5173
```

### 3. Create Admin User

After starting, use Postman or curl to register:
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Admin","email":"admin@truckber.com","phone":"9876543210","password":"admin123","role":"admin"}'
```

---

## Environment Variables

### Backend `.env`
```
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/truckber
JWT_SECRET=your_32_char_secret_key_here
JWT_REFRESH_SECRET=your_32_char_refresh_key_here
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=youremail@gmail.com
EMAIL_PASS=your_app_password
EMAIL_FROM=TruckBer <noreply@truckber.com>
FRONTEND_URL=http://localhost:5173
```

### Frontend `.env`
```
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
VITE_APP_NAME=TruckBer
```

---

## API Documentation

### Base URL: `http://localhost:5000/api`

#### Authentication
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/auth/register` | Register new user | No |
| POST | `/auth/login` | Login | No |
| POST | `/auth/refresh-token` | Refresh JWT | No |
| POST | `/auth/forgot-password` | Send reset email | No |
| PUT | `/auth/reset-password/:token` | Reset password | No |
| GET | `/auth/me` | Get current user | Yes |
| PUT | `/auth/me` | Update profile | Yes |
| POST | `/auth/logout` | Logout | Yes |

#### Bookings
| Method | Endpoint | Description | Roles |
|--------|----------|-------------|-------|
| POST | `/bookings` | Create booking | Customer |
| GET | `/bookings` | List bookings (role-filtered) | All |
| GET | `/bookings/:id` | Get booking detail | All |
| PUT | `/bookings/:id/accept` | Accept booking | Truck Owner |
| PUT | `/bookings/:id/assign-driver` | Assign driver | Truck Owner |
| PUT | `/bookings/:id/start-trip` | Start trip | Driver |
| PUT | `/bookings/:id/complete` | Complete delivery | Driver |
| PUT | `/bookings/:id/cancel` | Cancel booking | Customer/Admin |

#### Fleet
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/fleet` | Add truck |
| GET | `/fleet` | My trucks |
| PUT | `/fleet/:id` | Update truck |
| DELETE | `/fleet/:id` | Delete truck |
| POST | `/fleet/:id/maintenance` | Add maintenance record |
| GET | `/fleet/:id/maintenance` | Get maintenance history |

#### Admin
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/admin/dashboard` | Dashboard stats & charts |
| GET | `/admin/users` | All users (filterable) |
| PUT | `/admin/users/:id/toggle-status` | Activate/deactivate |
| PUT | `/admin/drivers/:id/verify` | Verify driver |
| GET | `/admin/analytics` | Analytics data |

---

## Database Schema

### Collections

**Users** — All platform users with role-based access  
**Drivers** — Driver profiles, license, Aadhaar, verification status  
**Trucks** — Fleet vehicles with documents and maintenance  
**Bookings** — Full booking lifecycle (10 statuses)  
**Payments** — Transaction records, platform fee  
**Notifications** — Real-time + stored notifications  
**Reviews** — Customer ratings for drivers  
**Maintenance** — Truck service records  
**LocationHistory** — GPS coordinate trail per trip  
**Invoices** — PDF invoice records  
**LivestockBatch** — Livestock transport with health/feed/mortality records  

---

## Deployment

### MongoDB Atlas
1. Create free cluster at [cloud.mongodb.com](https://cloud.mongodb.com)
2. Create database user
3. Whitelist `0.0.0.0/0` for Render
4. Copy connection string to `MONGODB_URI`

### Cloudinary
1. Sign up at [cloudinary.com](https://cloudinary.com) (free tier: 25GB)
2. Copy Cloud Name, API Key, API Secret

### Backend → Render
1. Push `backend/` to GitHub
2. Create new Web Service on [render.com](https://render.com)
3. Build: `npm install` | Start: `npm start`
4. Add all environment variables
5. Deploy → get URL like `https://truckber-api.onrender.com`

### Frontend → Vercel
1. Push `frontend/` to GitHub
2. Import to [vercel.com](https://vercel.com)
3. Set `VITE_API_URL=https://truckber-api.onrender.com/api`
4. Set `VITE_SOCKET_URL=https://truckber-api.onrender.com`
5. Deploy → get URL like `https://truckber.vercel.app`

---

## Running Tests

```bash
cd backend
npm test              # Run all tests
npm test -- --coverage  # With coverage report
```

---

## Screenshots

| Page | Description |
|------|-------------|
| Landing | Marketing page with role-based CTAs |
| Dashboard | Role-specific stats, charts, quick actions |
| Create Booking | 4-step wizard with livestock option |
| Live Tracking | Leaflet map with real-time driver location |
| Fleet | Truck cards with status, maintenance history |
| Admin Panel | User management with search/filter |
| Livestock | Batch tracking with vaccination & feed records |

---

## License

MIT License — Free for educational and startup use.

---

## Author

Built as a Final Year BCA Project.  
Stack: MERN (MongoDB · Express · React · Node.js)  
Deployment: MongoDB Atlas · Cloudinary · Render · Vercel

> *"From farm fields to city markets — TruckBer moves it."* 🚛
