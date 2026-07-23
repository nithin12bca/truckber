/**
 * TruckBer Database Seeder
 * Usage: npm run seed
 * Safe to run multiple times - clears all data first.
 */
require('dotenv').config();
const mongoose = require('mongoose');
const User     = require('./models/User');
const Driver   = require('./models/Driver');
const Truck    = require('./models/Truck');
const Booking  = require('./models/Booking');
const { Notification, Payment } = require('./models/index');

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB connected\n');

    // Wipe everything cleanly
    console.log('🗑️  Clearing all collections...');
    await Promise.all([
      User.deleteMany({}),
      Driver.deleteMany({}),
      Truck.deleteMany({}),
      Booking.deleteMany({}),
      Payment.deleteMany({}),
      Notification.deleteMany({}),
    ]);
    console.log('   Done.\n');

    // Users — passwords hashed automatically by pre-save hook
    console.log('👥 Creating users...');
    const [admin, customer, owner, driverUser] = await User.create([
      { name: 'Admin User',        email: 'admin@truckber.com',    phone: '9000000001', password: 'admin123', role: 'admin',       isActive: true, isEmailVerified: true },
      { name: 'Ravi Kumar',        email: 'customer@truckber.com', phone: '9000000002', password: 'pass123',  role: 'customer',    isActive: true, isEmailVerified: true, address: { city: 'Tiruppur', state: 'Tamil Nadu' } },
      { name: 'Murugan Transports',email: 'owner@truckber.com',    phone: '9000000003', password: 'pass123',  role: 'truck_owner', isActive: true, isEmailVerified: true, address: { city: 'Coimbatore', state: 'Tamil Nadu' } },
      { name: 'Selvam Driver',     email: 'driver@truckber.com',   phone: '9000000004', password: 'pass123',  role: 'driver',      isActive: true, isEmailVerified: true, address: { city: 'Erode', state: 'Tamil Nadu' } },
    ]);
    console.log('   4 users created.\n');

    // Trucks
    console.log('🚛 Creating trucks...');
    const [truck1, truck2] = await Truck.create([
      {
        owner: owner._id, truckNumber: 'TN33AB1234', truckType: 'lorry',
        capacity: 10, make: 'Tata', model: 'LPT 1109', year: 2021, color: 'White',
        registrationNumber: 'TN33-2021-001234', registrationExpiry: new Date('2026-12-31'),
        insuranceNumber: 'INS-2024-TN33AB',     insuranceExpiry:   new Date('2025-12-31'),
        fitnessCertNumber: 'FC-TN33-2024',      fitnessCertExpiry: new Date('2025-12-31'),
        status: 'available', pricePerKm: 20, minimumCharge: 1000,
        totalTrips: 45, totalDistance: 12500,
      },
      {
        owner: owner._id, truckNumber: 'TN33CD5678', truckType: 'mini_truck',
        capacity: 1.5, make: 'Mahindra', model: 'Bolero Pickup', year: 2022, color: 'Blue',
        registrationNumber: 'TN33-2022-005678', registrationExpiry: new Date('2027-06-30'),
        insuranceNumber: 'INS-2024-TN33CD',     insuranceExpiry:   new Date('2026-06-30'),
        status: 'available', pricePerKm: 12, minimumCharge: 500,
        totalTrips: 28, totalDistance: 4800,
      },
    ]);
    console.log('   2 trucks created.\n');

    // Driver profile
    console.log('👤 Creating driver profile...');
    const driver = await Driver.create({
      user: driverUser._id, owner: owner._id,
      licenseNumber: 'TN0120190001234', licenseExpiry: new Date('2029-05-15'),
      aadhaarNumber: '123456789012', experience: 7,
      assignedTruck: truck1._id, verificationStatus: 'approved',
      isAvailable: true, totalTrips: 45, totalDistance: 12500,
      rating: 4.8, totalRatings: 32,
    });
    await Truck.findByIdAndUpdate(truck1._id, { assignedDriver: driver._id });
    console.log('   Done.\n');

    // Bookings
    console.log('📦 Creating bookings...');
    const bookings = await Booking.create([
      {
        bookingNumber: 'TRK001DEMO', customer: customer._id,
        truckOwner: owner._id, driver: driver._id, truck: truck1._id,
        pickup: { address: '23 Nehru St, RS Puram', city: 'Coimbatore', state: 'Tamil Nadu', pincode: '641002', coordinates: { lat: 11.0168, lng: 76.9558 } },
        drop:   { address: '45 Anna Salai, T Nagar', city: 'Chennai',    state: 'Tamil Nadu', pincode: '600017', coordinates: { lat: 13.0827, lng: 80.2707 } },
        distance: 497, truckType: 'lorry', loadWeight: 8,
        loadDescription: 'Textile goods', estimatedCost: 10940, finalCost: 10940,
        scheduledPickup: new Date(Date.now() - 2*864e5),
        actualPickup:    new Date(Date.now() - 2*864e5),
        actualDelivery:  new Date(Date.now() - 864e5),
        status: 'delivered',
        proofOfDelivery: { notes: 'Delivered to warehouse', deliveredAt: new Date(Date.now() - 864e5) },
      },
      {
        bookingNumber: 'TRK002DEMO', customer: customer._id,
        truckOwner: owner._id, truck: truck2._id,
        pickup: { address: '12 Mill Road', city: 'Tiruppur', state: 'Tamil Nadu', pincode: '641601', coordinates: { lat: 11.1085, lng: 77.3411 } },
        drop:   { address: '78 Industrial Area', city: 'Erode', state: 'Tamil Nadu', pincode: '638001', coordinates: { lat: 11.3410, lng: 77.7172 } },
        distance: 51, truckType: 'mini_truck', loadWeight: 1,
        loadDescription: 'Machine parts', estimatedCost: 1112,
        scheduledPickup: new Date(Date.now() + 864e5),
        status: 'accepted',
      },
      {
        bookingNumber: 'TRK003DEMO', customer: customer._id,
        pickup: { address: '5 Farm Road', city: 'Pollachi', state: 'Tamil Nadu', pincode: '642001', coordinates: { lat: 10.6579, lng: 77.0073 } },
        drop:   { address: 'Uzhavar Santhai', city: 'Salem', state: 'Tamil Nadu', pincode: '636001', coordinates: { lat: 11.6643, lng: 78.1460 } },
        distance: 138, truckType: 'pickup', loadWeight: 1.5,
        loadDescription: 'Coconuts', estimatedCost: 2256,
        scheduledPickup: new Date(Date.now() + 2*864e5),
        status: 'pending',
      },
    ]);
    console.log('   3 bookings created.\n');

    // Payment for delivered booking
    await Payment.create({
      booking: bookings[0]._id, customer: customer._id, truckOwner: owner._id,
      amount: 10940, platformFee: 1094, ownerAmount: 9846,
      paymentMethod: 'upi', status: 'success',
      transactionId: 'UPI20240601001',
      paidAt: new Date(Date.now() - 864e5),
    });
    console.log('💰 Sample payment created.\n');

    // Notifications
    await Notification.insertMany([
      { recipient: customer._id,  type: 'general',         title: 'Welcome to TruckBer! 🚛',  message: 'Book your first truck now.',                          isRead: false },
      { recipient: owner._id,     type: 'general',         title: 'Fleet registered!',          message: '2 trucks are ready to accept bookings.',             isRead: false },
      { recipient: driverUser._id,type: 'driver_verified', title: 'Account Verified ✅',        message: 'Your driver account is approved. Ready for trips.',  isRead: false },
    ]);
    console.log('🔔 Notifications created.\n');

    // Summary
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🎉 Database seeded successfully!\n');
    console.log('  Role         Email                      Password');
    console.log('  ─────────────────────────────────────────────────');
    console.log('  Admin        admin@truckber.com          admin123');
    console.log('  Customer     customer@truckber.com       pass123');
    console.log('  Truck Owner  owner@truckber.com          pass123');
    console.log('  Driver       driver@truckber.com         pass123');
    console.log('\n  Open: http://localhost:5173');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    process.exit(0);
  } catch (err) {
    console.error('\n❌ Seed failed:', err.message);
    process.exit(1);
  }
};
seed();
