const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name:  { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    phone: { type: String, required: true, unique: true, trim: true },
    password: {
      type: String,
      required: true,
      minlength: 6,
      select: false,   // never returned unless explicitly .select('+password')
    },
    role: {
      type: String,
      enum: ['customer', 'truck_owner', 'driver', 'admin'],
      default: 'customer',
    },
    avatar:          { type: String, default: '' },
    isActive:        { type: Boolean, default: true },
    isEmailVerified: { type: Boolean, default: false },
    refreshToken:       { type: String, select: false },
    passwordResetToken: { type: String, select: false },
    passwordResetExpires: { type: Date, select: false },
    lastLogin: { type: Date },
    address: {
      street: String,
      city:   String,
      state:  String,
      pincode: String,
    },
    fcmToken: { type: String, select: false },
  },
  { timestamps: true }
);

// Hash password before save
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Compare plain password with stored hash
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Strip sensitive fields from JSON output
userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  delete obj.refreshToken;
  delete obj.passwordResetToken;
  delete obj.passwordResetExpires;
  delete obj.fcmToken;
  delete obj.__v;
  return obj;
};

module.exports = mongoose.model('User', userSchema);
