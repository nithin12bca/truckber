const mongoose = require('mongoose');

const truckSchema = new mongoose.Schema(
  {
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    truckNumber: { type: String, required: true, unique: true, uppercase: true },
    truckType: {
      type: String,
      enum: ['mini_truck', 'pickup', 'lorry', 'trailer', 'tanker', 'container', 'refrigerator'],
      required: true,
    },
    capacity: { type: Number, required: true }, // tonnes
    make: { type: String, required: true },
    model: { type: String, required: true },
    year: { type: Number, required: true },
    color: { type: String },
    images: [{ type: String }],

    // Documents
    registrationNumber: { type: String, required: true },
    registrationExpiry: { type: Date, required: true },
    registrationDoc: { type: String },

    insuranceNumber: { type: String, required: true },
    insuranceExpiry: { type: Date, required: true },
    insuranceDoc: { type: String },

    fitnessCertNumber: { type: String },
    fitnessCertExpiry: { type: Date },
    fitnessCertDoc: { type: String },

    permitNumber: { type: String },
    permitExpiry: { type: Date },

    status: {
      type: String,
      enum: ['available', 'on_trip', 'maintenance', 'inactive'],
      default: 'available',
    },
    assignedDriver: { type: mongoose.Schema.Types.ObjectId, ref: 'Driver', default: null },

    currentLocation: {
      lat: { type: Number },
      lng: { type: Number },
    },

    totalTrips: { type: Number, default: 0 },
    totalDistance: { type: Number, default: 0 },

    pricePerKm: { type: Number, required: true },
    minimumCharge: { type: Number, default: 500 },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Truck', truckSchema);
