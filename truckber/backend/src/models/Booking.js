const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const bookingSchema = new mongoose.Schema(
  {
    bookingNumber: {
      type: String,
      unique: true,
      default: () => 'TRK' + Date.now().toString(36).toUpperCase(),
    },
    customer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    truckOwner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    driver: { type: mongoose.Schema.Types.ObjectId, ref: 'Driver' },
    truck: { type: mongoose.Schema.Types.ObjectId, ref: 'Truck' },

    pickup: {
      address: { type: String, required: true },
      city: { type: String, required: true },
      state: { type: String, required: true },
      pincode: { type: String },
      coordinates: {
        lat: { type: Number },
        lng: { type: Number },
      },
    },
    drop: {
      address: { type: String, required: true },
      city: { type: String, required: true },
      state: { type: String, required: true },
      pincode: { type: String },
      coordinates: {
        lat: { type: Number },
        lng: { type: Number },
      },
    },

    distance: { type: Number }, // km
    truckType: { type: String, required: true },
    loadWeight: { type: Number, required: true }, // tonnes
    loadDescription: { type: String },
    specialInstructions: { type: String },

    scheduledPickup: { type: Date, required: true },
    actualPickup: { type: Date },
    actualDelivery: { type: Date },

    estimatedCost: { type: Number },
    finalCost: { type: Number },

    status: {
      type: String,
      enum: [
        'pending',
        'accepted',
        'driver_assigned',
        'in_transit',
        'delivered',
        'cancelled',
        'rejected',
      ],
      default: 'pending',
    },

    cancellationReason: { type: String },
    rejectionReason: { type: String },

    proofOfDelivery: {
      images: [String],
      signature: String,
      notes: String,
      deliveredAt: Date,
    },

    isLivestockTransport: { type: Boolean, default: false },
    livestockDetails: {
      animalType: String,
      quantity: Number,
      breed: String,
      healthCertificate: String,
      feedRequired: Boolean,
      specialCare: String,
    },
  },
  { timestamps: true }
);

bookingSchema.index({ customer: 1, status: 1 });
bookingSchema.index({ driver: 1, status: 1 });
bookingSchema.index({ truckOwner: 1, status: 1 });
bookingSchema.index({ status: 1, createdAt: -1 });

module.exports = mongoose.model('Booking', bookingSchema);
