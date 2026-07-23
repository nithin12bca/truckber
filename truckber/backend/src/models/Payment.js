const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema(
  {
    booking: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking', required: true },
    customer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    truckOwner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    transactionId: { type: String, unique: true },
    amount: { type: Number, required: true },
    platformFee: { type: Number, default: 0 },
    ownerAmount: { type: Number }, // amount after platform fee
    currency: { type: String, default: 'INR' },
    paymentMethod: {
      type: String,
      enum: ['cash', 'upi', 'bank_transfer', 'card'],
      default: 'cash',
    },
    status: {
      type: String,
      enum: ['pending', 'success', 'failed', 'refunded'],
      default: 'pending',
    },
    paidAt: { type: Date },
    refundedAt: { type: Date },
    refundReason: { type: String },
    invoiceGenerated: { type: Boolean, default: false },
    invoiceUrl: { type: String },
    notes: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Payment', paymentSchema);
