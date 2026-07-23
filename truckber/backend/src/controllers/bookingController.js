const Booking = require('../models/Booking');
const Truck = require('../models/Truck');
const Driver = require('../models/Driver');
const { Payment } = require('../models/index');
const { Notification } = require('../models/index');
const { createNotification } = require('../services/notificationService');
const { calculateDistance } = require('../utils/distance');
const { generateInvoicePDF } = require('../services/invoiceService');

// @desc    Create booking
// @route   POST /api/bookings
exports.createBooking = async (req, res, next) => {
  try {
    const {
      pickup, drop, truckType, loadWeight, loadDescription,
      scheduledPickup, specialInstructions, isLivestockTransport, livestockDetails,
    } = req.body;

    // Calculate distance
    let distance = 0;
    if (pickup.coordinates?.lat && drop.coordinates?.lat) {
      distance = calculateDistance(
        pickup.coordinates.lat, pickup.coordinates.lng,
        drop.coordinates.lat, drop.coordinates.lng
      );
    }

    // Find available trucks
    const availableTrucks = await Truck.find({ truckType, status: 'available' })
      .populate('owner', 'name phone')
      .populate('assignedDriver');

    const estimatedCost = calculateCost(distance, truckType, loadWeight);

    const booking = await Booking.create({
      customer: req.user._id,
      pickup, drop, distance,
      truckType, loadWeight, loadDescription,
      scheduledPickup, specialInstructions,
      estimatedCost, isLivestockTransport, livestockDetails,
      status: 'pending',
    });

    await createNotification({
      recipient: req.user._id,
      type: 'booking_created',
      title: 'Booking Confirmed',
      message: `Your booking #${booking.bookingNumber} has been created and is awaiting acceptance.`,
      booking: booking._id,
    });

    // Notify all truck owners with matching trucks
    const ownerIds = [...new Set(availableTrucks.map(t => t.owner._id.toString()))];
    for (const ownerId of ownerIds) {
      await createNotification({
        recipient: ownerId,
        type: 'booking_created',
        title: 'New Booking Request',
        message: `A new ${truckType} booking is available for ${pickup.city} → ${drop.city}`,
        booking: booking._id,
      });
    }

    res.status(201).json({
      success: true,
      data: { booking, availableTrucks, estimatedCost, distance },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Accept booking (truck owner)
// @route   PUT /api/bookings/:id/accept
exports.acceptBooking = async (req, res, next) => {
  try {
    const { truckId } = req.body;
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });
    if (booking.status !== 'pending') {
      return res.status(400).json({ success: false, message: 'Booking is no longer pending' });
    }

    const truck = await Truck.findById(truckId);
    if (!truck || truck.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'You do not own this truck' });
    }

    booking.status = 'accepted';
    booking.truckOwner = req.user._id;
    booking.truck = truckId;
    await booking.save();

    truck.status = 'on_trip';
    await truck.save();

    await createNotification({
      recipient: booking.customer,
      type: 'booking_accepted',
      title: 'Booking Accepted!',
      message: `Your booking #${booking.bookingNumber} has been accepted. Driver will be assigned soon.`,
      booking: booking._id,
    });

    res.json({ success: true, data: booking });
  } catch (error) {
    next(error);
  }
};

// @desc    Assign driver to booking
// @route   PUT /api/bookings/:id/assign-driver
exports.assignDriver = async (req, res, next) => {
  try {
    const { driverId } = req.body;
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });
    if (booking.truckOwner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }

    const driver = await Driver.findById(driverId);
    if (!driver || !driver.isAvailable) {
      return res.status(400).json({ success: false, message: 'Driver not available' });
    }

    booking.driver = driverId;
    booking.status = 'driver_assigned';
    await booking.save();

    driver.isAvailable = false;
    await driver.save();

    await createNotification({
      recipient: booking.customer,
      type: 'driver_assigned',
      title: 'Driver Assigned',
      message: `A driver has been assigned to your booking #${booking.bookingNumber}.`,
      booking: booking._id,
    });

    await createNotification({
      recipient: driver.user,
      type: 'driver_assigned',
      title: 'New Trip Assigned',
      message: `You have been assigned a trip from ${booking.pickup.city} to ${booking.drop.city}.`,
      booking: booking._id,
    });

    res.json({ success: true, data: booking });
  } catch (error) {
    next(error);
  }
};

// @desc    Start trip (driver)
// @route   PUT /api/bookings/:id/start-trip
exports.startTrip = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id).populate('driver');
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });
    if (booking.driver.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }

    booking.status = 'in_transit';
    booking.actualPickup = new Date();
    await booking.save();

    await createNotification({
      recipient: booking.customer,
      type: 'trip_started',
      title: 'Trip Started!',
      message: `Your shipment is on its way! Track it live on the tracking page.`,
      booking: booking._id,
    });

    res.json({ success: true, data: booking });
  } catch (error) {
    next(error);
  }
};

// @desc    Complete delivery (driver)
// @route   PUT /api/bookings/:id/complete
exports.completeDelivery = async (req, res, next) => {
  try {
    const { notes, images } = req.body;
    const booking = await Booking.findById(req.params.id).populate('driver');
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });

    booking.status = 'delivered';
    booking.actualDelivery = new Date();
    booking.proofOfDelivery = { notes, images: images || [], deliveredAt: new Date() };
    await booking.save();

    // Update driver stats
    await Driver.findByIdAndUpdate(booking.driver._id, {
      $inc: { totalTrips: 1, totalDistance: booking.distance || 0 },
      isAvailable: true,
    });

    // Update truck stats
    await Truck.findByIdAndUpdate(booking.truck, {
      $inc: { totalTrips: 1, totalDistance: booking.distance || 0 },
      status: 'available',
    });

    // Create payment record
    const payment = await Payment.create({
      booking: booking._id,
      customer: booking.customer,
      truckOwner: booking.truckOwner,
      amount: booking.finalCost || booking.estimatedCost,
      platformFee: Math.round((booking.finalCost || booking.estimatedCost) * 0.1),
      ownerAmount: Math.round((booking.finalCost || booking.estimatedCost) * 0.9),
      status: 'pending',
    });

    // Generate invoice
    await generateInvoicePDF(booking._id);

    await createNotification({
      recipient: booking.customer,
      type: 'delivery_completed',
      title: 'Delivery Completed!',
      message: `Your shipment has been delivered. Please rate your experience.`,
      booking: booking._id,
    });

    res.json({ success: true, data: { booking, payment } });
  } catch (error) {
    next(error);
  }
};

// @desc    Cancel booking
// @route   PUT /api/bookings/:id/cancel
exports.cancelBooking = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });

    const isOwner =
      booking.customer.toString() === req.user._id.toString() ||
      req.user.role === 'admin';

    if (!isOwner) return res.status(403).json({ success: false, message: 'Unauthorized' });

    if (['delivered', 'in_transit'].includes(booking.status)) {
      return res.status(400).json({ success: false, message: 'Cannot cancel this booking' });
    }

    booking.status = 'cancelled';
    booking.cancellationReason = req.body.reason;
    await booking.save();

    // Release truck and driver
    if (booking.truck) await Truck.findByIdAndUpdate(booking.truck, { status: 'available' });
    if (booking.driver) await Driver.findByIdAndUpdate(booking.driver, { isAvailable: true });

    res.json({ success: true, data: booking });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all bookings (filtered by role)
// @route   GET /api/bookings
exports.getBookings = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    let filter = {};

    if (req.user.role === 'customer') filter.customer = req.user._id;
    else if (req.user.role === 'truck_owner') filter.truckOwner = req.user._id;
    else if (req.user.role === 'driver') {
      const driver = await Driver.findOne({ user: req.user._id });
      if (driver) filter.driver = driver._id;
    }

    if (status) filter.status = status;

    const total = await Booking.countDocuments(filter);
    const bookings = await Booking.find(filter)
      .populate('customer', 'name phone')
      .populate('truck', 'truckNumber truckType')
      .populate({ path: 'driver', populate: { path: 'user', select: 'name phone' } })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.json({
      success: true,
      data: bookings,
      pagination: { total, page: Number(page), pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single booking
// @route   GET /api/bookings/:id
exports.getBooking = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('customer', 'name phone email')
      .populate('truckOwner', 'name phone')
      .populate('truck')
      .populate({ path: 'driver', populate: { path: 'user', select: 'name phone' } });

    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });
    res.json({ success: true, data: booking });
  } catch (error) {
    next(error);
  }
};

// Helper: calculate cost
const calculateCost = (distance, truckType, loadWeight) => {
  const baseRates = {
    mini_truck: 15, pickup: 12, lorry: 20,
    trailer: 25, tanker: 22, container: 28, refrigerator: 30,
  };
  const rate = baseRates[truckType] || 18;
  const weightSurcharge = loadWeight > 5 ? (loadWeight - 5) * 100 : 0;
  return Math.max(500, Math.round(distance * rate + weightSurcharge));
};
