# TruckBer API Documentation

## Base URL
```
Development: http://localhost:5000/api
Production:  https://truckber-api.onrender.com/api
```

## Authentication
All protected routes require:
```
Authorization: Bearer <accessToken>
```

Access tokens expire in 15 minutes. Use `/auth/refresh-token` to get new ones.

---

## Auth Endpoints

### Register
```http
POST /auth/register
Content-Type: application/json

{
  "name": "Ravi Kumar",
  "email": "ravi@example.com",
  "phone": "9876543210",
  "password": "securepass123",
  "role": "customer"  // customer | truck_owner | driver | admin
}

Response 201:
{
  "success": true,
  "data": {
    "user": { "_id": "...", "name": "Ravi Kumar", "role": "customer" },
    "accessToken": "eyJ...",
    "refreshToken": "eyJ..."
  }
}
```

### Login
```http
POST /auth/login

{ "email": "ravi@example.com", "password": "securepass123" }

Response 200:
{ "success": true, "data": { "user": {...}, "accessToken": "...", "refreshToken": "..." } }
```

### Refresh Token
```http
POST /auth/refresh-token

{ "refreshToken": "eyJ..." }

Response 200:
{ "success": true, "data": { "accessToken": "...", "refreshToken": "..." } }
```

### Forgot Password
```http
POST /auth/forgot-password

{ "email": "ravi@example.com" }

Response 200 (always, for security):
{ "success": true, "message": "If that email exists, a reset link has been sent" }
```

---

## Booking Endpoints

### Create Booking (Customer)
```http
POST /bookings
Authorization: Bearer <token>

{
  "pickup": {
    "address": "23, Main Road, Anna Nagar",
    "city": "Coimbatore",
    "state": "Tamil Nadu",
    "pincode": "641001",
    "coordinates": { "lat": 11.0168, "lng": 76.9558 }
  },
  "drop": {
    "address": "45, Gandhi Street, T Nagar",
    "city": "Chennai",
    "state": "Tamil Nadu",
    "coordinates": { "lat": 13.0827, "lng": 80.2707 }
  },
  "truckType": "lorry",
  "loadWeight": 5,
  "loadDescription": "Textile goods",
  "scheduledPickup": "2024-06-15T10:00:00.000Z",
  "isLivestockTransport": false
}

Response 201:
{
  "success": true,
  "data": {
    "booking": { "bookingNumber": "TRK1ABC23", "status": "pending", ... },
    "availableTrucks": [...],
    "estimatedCost": 9500,
    "distance": 501.2
  }
}
```

### Get All Bookings
```http
GET /bookings?status=pending&page=1&limit=10
Authorization: Bearer <token>

// Returns role-filtered list:
// Customer → their bookings
// Truck Owner → their accepted bookings
// Driver → their assigned bookings
// Admin → all bookings
```

### Accept Booking (Truck Owner)
```http
PUT /bookings/:id/accept
Authorization: Bearer <truck_owner_token>

{ "truckId": "truck_mongodb_id" }
```

### Assign Driver (Truck Owner)
```http
PUT /bookings/:id/assign-driver
Authorization: Bearer <truck_owner_token>

{ "driverId": "driver_mongodb_id" }
```

### Start Trip (Driver)
```http
PUT /bookings/:id/start-trip
Authorization: Bearer <driver_token>
// No body required
```

### Complete Delivery (Driver)
```http
PUT /bookings/:id/complete
Authorization: Bearer <driver_token>

{
  "notes": "Delivered to reception",
  "images": ["https://cloudinary.com/proof1.jpg"]
}
```

---

## Fleet Endpoints

### Add Truck
```http
POST /fleet
Authorization: Bearer <truck_owner_token>

{
  "truckNumber": "TN01AB1234",
  "truckType": "lorry",
  "capacity": 10,
  "make": "Tata",
  "model": "LPT 1109",
  "year": 2020,
  "pricePerKm": 20,
  "minimumCharge": 1000,
  "registrationNumber": "TN01-2020-0001234",
  "registrationExpiry": "2025-12-31",
  "insuranceNumber": "INS-2024-TN01AB",
  "insuranceExpiry": "2024-12-31"
}
```

### Add Maintenance Record
```http
POST /fleet/:truckId/maintenance
Authorization: Bearer <truck_owner_token>

{
  "serviceType": "oil_change",
  "serviceDate": "2024-06-01",
  "serviceCost": 3500,
  "serviceCenter": "Tata Authorized Service",
  "odometer": 45000,
  "nextServiceDate": "2024-09-01",
  "notes": "Changed engine oil and filter"
}
```

---

## Driver Endpoints

### Register Driver Profile
```http
POST /drivers/register
Authorization: Bearer <driver_token>

{
  "licenseNumber": "TN0120190012345",
  "licenseExpiry": "2029-05-15",
  "aadhaarNumber": "123456789012",
  "experience": 5
}
```

### Update Driver Location (Real-time backup)
```http
PUT /drivers/location
Authorization: Bearer <driver_token>

{ "lat": 11.0168, "lng": 76.9558 }
```

---

## Admin Endpoints

### Dashboard Stats
```http
GET /admin/dashboard
Authorization: Bearer <admin_token>

Response:
{
  "success": true,
  "data": {
    "stats": {
      "totalUsers": 150, "totalTrucks": 45, "totalDrivers": 38,
      "totalBookings": 890, "activeTrips": 12,
      "completedTrips": 780, "totalRevenue": 4500000
    },
    "charts": {
      "monthlyRevenue": [...],
      "bookingTrends": [...],
      "statusBreakdown": [...]
    },
    "topDrivers": [...]
  }
}
```

### Verify Driver
```http
PUT /admin/drivers/:driverId/verify
Authorization: Bearer <admin_token>

{ "status": "approved", "note": "All documents verified" }
// status: approved | rejected
```

---

## Socket.io Events

### Client → Server
| Event | Payload | Description |
|-------|---------|-------------|
| `join_booking` | `{ bookingId }` | Join booking's tracking room |
| `leave_booking` | `{ bookingId }` | Leave tracking room |
| `driver_location` | `{ bookingId, lat, lng, speed }` | Send GPS coordinates |
| `send_message` | `{ to, message, bookingId }` | Send chat message |
| `mark_notifications_read` | — | Mark all notifications read |

### Server → Client
| Event | Payload | Description |
|-------|---------|-------------|
| `notification` | `{ title, message, type }` | New notification |
| `location_update` | `{ lat, lng, speed, timestamp }` | Driver location update |
| `booking_updated` | `{ bookingId, status }` | Booking status changed |
| `receive_message` | `{ from, message, bookingId }` | Incoming chat |

---

## Error Responses

```json
{
  "success": false,
  "message": "Error description",
  "errors": [
    { "field": "email", "message": "Valid email required" }
  ]
}
```

| Status | Meaning |
|--------|---------|
| 200 | Success |
| 201 | Created |
| 400 | Bad request / validation error |
| 401 | Unauthorized / token expired |
| 403 | Forbidden / wrong role |
| 404 | Not found |
| 429 | Rate limit exceeded |
| 500 | Server error |

---

## Rate Limits

- General API: 100 requests / 15 minutes
- Auth endpoints: 10 requests / 15 minutes
- Headers returned: `X-RateLimit-Limit`, `X-RateLimit-Remaining`
