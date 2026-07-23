const mongoose = require('mongoose');

const driverSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    licenseNumber: { type: String, required: true, unique: true },
    licenseExpiry: { type: Date, required: true },
    licenseImage: { type: String },
    aadhaarNumber: { type: String, required: true, unique: true },
    aadhaarImage: { type: String },
    experience: { type: Number, default: 0 }, // years
    assignedTruck: { type: mongoose.Schema.Types.ObjectId, ref: 'Truck', default: null },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    verificationStatus: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
    },
    verificationNote: { type: String },
    isAvailable: { type: Boolean, default: true },
    currentLocation: {
      lat: { type: Number },
      lng: { type: Number },
      updatedAt: { type: Date },
    },
    totalTrips: { type: Number, default: 0 },
    totalDistance: { type: Number, default: 0 }, // km
    rating: { type: Number, default: 0 },
    totalRatings: { type: Number, default: 0 },
    bankDetails: {
      accountNumber: String,
      ifscCode: String,
      accountHolder: String,
      bankName: String,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Driver', driverSchema);
