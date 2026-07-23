const mongoose = require('mongoose');

// ─── Notification ───────────────────────────────────────────────────────────
const notificationSchema = new mongoose.Schema(
  {
    recipient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    type: {
      type: String,
      enum: [
        'booking_created',
        'booking_accepted',
        'booking_rejected',
        'driver_assigned',
        'trip_started',
        'delivery_completed',
        'payment_received',
        'payment_pending',
        'driver_verified',
        'maintenance_due',
        'livestock_update',
        'general',
      ],
      required: true,
    },
    title: { type: String, required: true },
    message: { type: String, required: true },
    data: { type: mongoose.Schema.Types.Mixed },
    isRead: { type: Boolean, default: false },
    booking: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking' },
  },
  { timestamps: true }
);
notificationSchema.index({ recipient: 1, isRead: 1, createdAt: -1 });

// ─── Review ──────────────────────────────────────────────────────────────────
const reviewSchema = new mongoose.Schema(
  {
    booking: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking', required: true },
    customer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    driver: { type: mongoose.Schema.Types.ObjectId, ref: 'Driver', required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, trim: true },
    tags: [{ type: String }], // 'punctual', 'professional', 'careful_handling', etc.
  },
  { timestamps: true }
);

// ─── Maintenance ─────────────────────────────────────────────────────────────
const maintenanceSchema = new mongoose.Schema(
  {
    truck: { type: mongoose.Schema.Types.ObjectId, ref: 'Truck', required: true },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    serviceType: {
      type: String,
      enum: ['oil_change', 'tire_replacement', 'engine', 'brake', 'electrical', 'body', 'general', 'other'],
      required: true,
    },
    serviceDate: { type: Date, required: true },
    nextServiceDate: { type: Date },
    nextServiceKm: { type: Number },
    serviceCost: { type: Number, required: true },
    serviceCenter: { type: String },
    mechanicName: { type: String },
    odometer: { type: Number },
    notes: { type: String },
    invoiceDoc: { type: String },
    status: { type: String, enum: ['completed', 'pending', 'in_progress'], default: 'completed' },
  },
  { timestamps: true }
);

// ─── LocationHistory ──────────────────────────────────────────────────────────
const locationHistorySchema = new mongoose.Schema(
  {
    booking: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking', required: true },
    driver: { type: mongoose.Schema.Types.ObjectId, ref: 'Driver', required: true },
    truck: { type: mongoose.Schema.Types.ObjectId, ref: 'Truck' },
    coordinates: [
      {
        lat: { type: Number, required: true },
        lng: { type: Number, required: true },
        speed: { type: Number, default: 0 }, // km/h
        timestamp: { type: Date, default: Date.now },
      },
    ],
    totalDistance: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// ─── Invoice ──────────────────────────────────────────────────────────────────
const invoiceSchema = new mongoose.Schema(
  {
    invoiceNumber: {
      type: String,
      unique: true,
      default: () => 'INV-' + Date.now().toString(36).toUpperCase(),
    },
    booking: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking', required: true },
    payment: { type: mongoose.Schema.Types.ObjectId, ref: 'Payment' },
    customer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    truckOwner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    items: [
      {
        description: String,
        amount: Number,
      },
    ],
    subtotal: { type: Number, required: true },
    tax: { type: Number, default: 0 },
    discount: { type: Number, default: 0 },
    total: { type: Number, required: true },
    pdfUrl: { type: String },
    issuedAt: { type: Date, default: Date.now },
    dueDate: { type: Date },
    status: { type: String, enum: ['draft', 'sent', 'paid', 'overdue'], default: 'draft' },
  },
  { timestamps: true }
);

// ─── LivestockBatch ────────────────────────────────────────────────────────────
const livestockBatchSchema = new mongoose.Schema(
  {
    booking: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking', required: true },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    animalType: { type: String, required: true },
    breed: { type: String },
    quantity: { type: Number, required: true },
    totalWeight: { type: Number },
    origin: { type: String, required: true },
    destination: { type: String, required: true },
    healthCertificateNumber: { type: String },
    healthCertificateDoc: { type: String },
    vaccinationRecords: [
      {
        vaccine: String,
        date: Date,
        nextDue: Date,
        administeredBy: String,
      },
    ],
    feedRecords: [
      {
        feedType: String,
        quantity: Number,
        unit: String,
        time: Date,
        notes: String,
      },
    ],
    mortalityRecords: [
      {
        count: Number,
        cause: String,
        recordedAt: { type: Date, default: Date.now },
        notes: String,
      },
    ],
    transportExpenses: [
      {
        description: String,
        amount: Number,
        date: Date,
      },
    ],
    status: {
      type: String,
      enum: ['preparing', 'in_transit', 'delivered', 'at_market'],
      default: 'preparing',
    },
    deliveredAt: { type: Date },
    deliveryNotes: { type: String },
  },
  { timestamps: true }
);

module.exports = {
  Notification: mongoose.model('Notification', notificationSchema),
  Review: mongoose.model('Review', reviewSchema),
  Maintenance: mongoose.model('Maintenance', maintenanceSchema),
  LocationHistory: mongoose.model('LocationHistory', locationHistorySchema),
  Invoice: mongoose.model('Invoice', invoiceSchema),
  LivestockBatch: mongoose.model('LivestockBatch', livestockBatchSchema),
};
