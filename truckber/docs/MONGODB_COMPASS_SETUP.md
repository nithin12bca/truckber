# MongoDB Local Setup with Compass

## Understanding the Tools

| Tool | Purpose |
|------|---------|
| **MongoDB Community Server** | The actual database engine running on your PC |
| **MongoDB Compass** | Desktop GUI app to view, edit, and query your data visually |
| **Your backend (`server.js`)** | Connects to MongoDB via `mongodb://localhost:27017/truckber` |

> Compass is like "pgAdmin for MongoDB" — it's a viewer, not the database itself.

---

## Step 1 — Install MongoDB Community Server

### Windows
1. Go to https://www.mongodb.com/try/download/community
2. Select **Windows** → **msi** → Download
3. Run the installer → choose "Complete"
4. ✅ Check **"Install MongoDB as a Service"** (runs automatically on startup)
5. Click Install → Finish

### macOS
```bash
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb-community
```

### Ubuntu/Linux
```bash
sudo apt-get install -y mongodb
sudo systemctl start mongodb
sudo systemctl enable mongodb
```

---

## Step 2 — Install MongoDB Compass (GUI)

1. Go to https://www.mongodb.com/products/tools/compass
2. Download for your OS → Install
3. Open Compass
4. In the connection field enter:
   ```
   mongodb://localhost:27017
   ```
5. Click **Connect**
6. You will see your databases listed on the left

---

## Step 3 — Configure TruckBer Backend

Copy the example env file and it's already set up for local MongoDB:

```bash
cd backend
cp .env.example .env
```

Your `.env` already has:
```
MONGODB_URI=mongodb://localhost:27017/truckber
```

No username or password needed for local development.

---

## Step 4 — Start the Project

```bash
# Terminal 1 — Backend
cd backend
npm install
npm run dev
# → Connected to MongoDB: localhost

# Terminal 2 — Frontend  
cd frontend
npm install
npm run dev
# → http://localhost:5173
```

---

## Step 5 — Seed Demo Data

```bash
cd backend
npm run seed
```

This creates the `truckber` database with demo users, trucks, and bookings.

---

## Step 6 — View Data in Compass

1. Open MongoDB Compass
2. Connect to `mongodb://localhost:27017`
3. Click the **truckber** database
4. You'll see all 11 collections:

```
truckber/
├── users           ← All accounts (admin, customer, owner, driver)
├── drivers         ← Driver profiles & verification
├── trucks          ← Fleet vehicles
├── bookings        ← Trip records
├── payments        ← Transaction records
├── invoices        ← PDF invoice records
├── notifications   ← Real-time alerts
├── reviews         ← Customer ratings
├── maintenances    ← Truck service logs
├── locationhistories ← GPS tracking data
└── livestockbatches  ← Animal transport records
```

---

## Compass Features You Can Use

| Feature | How to use |
|---------|-----------|
| **View all documents** | Click any collection → Documents tab |
| **Filter data** | Use the filter bar: `{ "role": "customer" }` |
| **Edit a document** | Click the pencil icon on any document |
| **Delete a document** | Click the trash icon |
| **Run aggregations** | Aggregations tab → build pipeline visually |
| **View indexes** | Indexes tab → see all indexes |
| **Import data** | Collection → Add Data → Import File (JSON/CSV) |
| **Export data** | Collection → Export Collection |

---

## Useful Compass Queries

### Find all pending bookings
```json
{ "status": "pending" }
```

### Find all admin users
```json
{ "role": "admin" }
```

### Find bookings in a city
```json
{ "pickup.city": "Coimbatore" }
```

### Find unread notifications
```json
{ "isRead": false }
```

### Find trucks available
```json
{ "status": "available" }
```

---

## For Production Deployment

When you are ready to go live, you have two options:

### Option A — Keep Local + Port Forward (not recommended for public)
Only accessible from your own computer.

### Option B — MongoDB Atlas (recommended for going live)
1. Sign up free at https://cloud.mongodb.com
2. Create M0 Free cluster
3. Change your `.env`:
   ```
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/truckber
   ```
4. Deploy backend to Render with Atlas URI

> **Compass still works with Atlas!**
> In Compass, you can connect to Atlas using the Atlas connection string — 
> so you get the same visual interface for your cloud database too.

---

## Troubleshooting

### "MongoServerError: connect ECONNREFUSED 127.0.0.1:27017"
MongoDB is not running. Start it:
- **Windows**: Open Services → Find "MongoDB" → Start
- **macOS**: `brew services start mongodb-community`
- **Linux**: `sudo systemctl start mongod`

### "Database truckber not found in Compass"
Run the seeder first: `cd backend && npm run seed`

### Compass shows empty collections
Make sure backend is running and you've made at least one API call or run the seeder.
