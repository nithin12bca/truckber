# TruckBer — Deployment Guide

---

## Local Development (MongoDB Compass)

This is the default setup. Your database runs on your own PC and you
view it using MongoDB Compass.

### Prerequisites
- Node.js 18+ (https://nodejs.org)
- MongoDB Community Server (https://www.mongodb.com/try/download/community)
- MongoDB Compass (https://www.mongodb.com/products/tools/compass)

### Setup Steps

```bash
# 1. Clone / extract the project
cd truckber

# 2. Backend setup
cd backend
npm install
cp .env.example .env
# Edit .env — fill in Cloudinary + Email keys (MongoDB is pre-configured)

# 3. Seed demo data
npm run seed

# 4. Start backend
npm run dev
# Running on http://localhost:5000

# 5. Frontend setup (new terminal)
cd ../frontend
npm install
cp .env.example .env
npm run dev
# Running on http://localhost:5173
```

### Viewing your data in Compass
1. Open MongoDB Compass
2. Connect to: `mongodb://localhost:27017`
3. Click the **truckber** database
4. Browse all 11 collections

Full Compass guide: `docs/MONGODB_COMPASS_SETUP.md`

---

## Production Deployment (when ready to go live)

### Step 1 — Cloudinary (Free — required for file uploads)
1. Sign up at https://cloudinary.com
2. Dashboard → copy Cloud Name, API Key, API Secret
3. Add to backend `.env`

### Step 2 — Gmail App Password (for email)
1. Enable 2FA on Gmail
2. https://myaccount.google.com/apppasswords → create "TruckBer"
3. Copy 16-character password to `.env`

### Step 3 — MongoDB Atlas (for cloud hosting)
1. Sign up free at https://cloud.mongodb.com
2. Create M0 Free cluster (Mumbai region recommended for India)
3. Database Access → Add user with password
4. Network Access → Allow `0.0.0.0/0`
5. Connect → copy URI → update `MONGODB_URI` in `.env`

> You can also connect Compass to Atlas using the same URI to view
> your cloud database visually.

### Step 4 — Deploy Backend to Render
1. Push `backend/` folder to a GitHub repo
2. Go to https://render.com → New Web Service
3. Settings:
   - Root Directory: `backend`
   - Build: `npm install`
   - Start: `node src/server.js`
4. Add all environment variables from your `.env`
5. Deploy → get URL like `https://truckber-api.onrender.com`

### Step 5 — Deploy Frontend to Vercel
1. Push `frontend/` folder to GitHub
2. Go to https://vercel.com → New Project
3. Settings:
   - Root Directory: `frontend`
   - Framework: Vite
4. Add environment variables:
   ```
   VITE_API_URL=https://truckber-api.onrender.com/api
   VITE_SOCKET_URL=https://truckber-api.onrender.com
   ```
5. Deploy → get URL like `https://truckber.vercel.app`

### Step 6 — Update CORS
In backend `.env`:
```
FRONTEND_URL=https://truckber.vercel.app
```

---

## Environment Variables Reference

### Backend `.env`
```env
PORT=5000
NODE_ENV=development

# Local MongoDB (for development with Compass)
MONGODB_URI=mongodb://localhost:27017/truckber

# For production, replace with Atlas URI:
# MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/truckber

JWT_SECRET=minimum_32_character_random_string_here
JWT_REFRESH_SECRET=another_32_character_random_string
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=youremail@gmail.com
EMAIL_PASS=your_16_char_app_password
EMAIL_FROM=TruckBer <noreply@truckber.com>

FRONTEND_URL=http://localhost:5173
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX=100
```

### Frontend `.env`
```env
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
VITE_APP_NAME=TruckBer
```

---

## Demo Credentials (after running npm run seed)

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@truckber.com | admin123 |
| Customer | customer@truckber.com | pass123 |
| Truck Owner | owner@truckber.com | pass123 |
| Driver | driver@truckber.com | pass123 |

---

## Generate Secure JWT Secrets

Run in any terminal with Node.js:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```
Run twice — once for `JWT_SECRET`, once for `JWT_REFRESH_SECRET`.
