# TruckBer — Database Design

## Overview

MongoDB with Mongoose ODM. 11 collections, optimized with indexes for role-based queries.

---

## Collections Summary

| Collection | Documents (est.) | Primary Use |
|---|---|---|
| users | All platform users | Auth, profile, role |
| drivers | Driver profiles | Verification, assignment |
| trucks | Fleet vehicles | Booking matching, tracking |
| bookings | Trip records | Core workflow |
| payments | Transactions | Revenue tracking |
| invoices | PDF records | Download, billing |
| notifications | Alerts | Real-time + stored |
| reviews | Ratings | Driver score |
| maintenance | Service logs | Fleet health |
| locationhistories | GPS trail | Trip replay |
| livestockbatches | Animal transport | Farm extension |

---

## Indexes

### bookings
```javascript
{ customer: 1, status: 1 }         // Customer booking list
{ driver: 1, status: 1 }           // Driver trip list
{ truckOwner: 1, status: 1 }       // Owner booking list
{ status: 1, createdAt: -1 }       // Admin/analytics queries
```

### notifications
```javascript
{ recipient: 1, isRead: 1, createdAt: -1 }  // Unread count + list
```

### users
```javascript
{ email: 1 }   // unique
{ phone: 1 }   // unique
```

### drivers
```javascript
{ licenseNumber: 1 }   // unique
{ aadhaarNumber: 1 }   // unique
{ user: 1 }            // one-to-one lookup
```

---

## Schema Relationships

```
USER (1) ──── (N) BOOKING         [customer places bookings]
USER (1) ──── (N) TRUCK           [owner registers trucks]
USER (1) ──── (1) DRIVER          [driver has one profile]
TRUCK (1) ──── (N) BOOKING        [truck assigned to trips]
DRIVER (1) ──── (N) BOOKING       [driver handles trips]
BOOKING (1) ──── (1) PAYMENT      [one payment per booking]
BOOKING (1) ──── (1) INVOICE      [one invoice per booking]
BOOKING (1) ──── (N) NOTIFICATION [booking events trigger alerts]
BOOKING (1) ──── (1) LOCATION_HISTORY  [GPS trail per trip]
BOOKING (1) ──── (1) REVIEW       [one review per delivered booking]
BOOKING (1) ──── (0|1) LIVESTOCK_BATCH  [optional livestock record]
TRUCK (1) ──── (N) MAINTENANCE    [service history]
```

---

## Enum Values

### User.role
`customer` | `truck_owner` | `driver` | `admin`

### Booking.status
`pending` → `accepted` → `driver_assigned` → `in_transit` → `delivered`
`pending` → `cancelled` | `rejected`

### Truck.status
`available` | `on_trip` | `maintenance` | `inactive`

### Truck.truckType
`mini_truck` | `pickup` | `lorry` | `trailer` | `tanker` | `container` | `refrigerator`

### Driver.verificationStatus
`pending` | `approved` | `rejected`

### Payment.status
`pending` | `success` | `failed` | `refunded`

### Payment.paymentMethod
`cash` | `upi` | `bank_transfer` | `card`

### LivestockBatch.status
`preparing` | `in_transit` | `delivered` | `at_market`

---

## Aggregation Pipelines Used

### Monthly Revenue (Admin Dashboard)
```javascript
Payment.aggregate([
  { $match: { status: 'success', createdAt: { $gte: sixMonthsAgo } } },
  {
    $group: {
      _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } },
      revenue: { $sum: '$amount' },
      count: { $sum: 1 },
    },
  },
  { $sort: { '_id.year': 1, '_id.month': 1 } },
])
```

### Booking Status Breakdown
```javascript
Booking.aggregate([
  { $group: { _id: '$status', count: { $sum: 1 } } },
])
```

### Driver Performance
```javascript
Driver.aggregate([
  { $match: { totalTrips: { $gt: 0 } } },
  { $lookup: { from: 'users', localField: 'user', foreignField: '_id', as: 'userInfo' } },
  { $unwind: '$userInfo' },
  { $project: { name: '$userInfo.name', totalTrips: 1, rating: 1, totalDistance: 1 } },
  { $sort: { totalTrips: -1 } },
  { $limit: 10 },
])
```

---

## Data Retention & Security

- **Passwords**: bcrypt hashed (cost factor 12), never stored plain
- **Aadhaar numbers**: stored as plain (masked in API responses)
- **Refresh tokens**: stored hashed in User document, rotated on each use
- **Password reset tokens**: SHA-256 hashed, expire in 30 minutes
- **Location data**: retained per trip in LocationHistory, accessible to customer + driver + admin
- **Soft deletes**: Users use `isActive: false` flag rather than deletion
- **Audit trail**: `createdAt` / `updatedAt` on all documents via Mongoose timestamps
