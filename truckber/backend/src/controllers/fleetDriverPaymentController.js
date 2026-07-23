const Truck = require('../models/Truck');
const Driver = require('../models/Driver');
const { Payment, Invoice, Maintenance } = require('../models/index');
const { generateInvoicePDF } = require('../services/invoiceService');

// ═══════════════════════════════════════════════════════
// FLEET CONTROLLER
// ═══════════════════════════════════════════════════════

exports.fleet = {
  async addTruck(req, res, next) {
    try {
      const truck = await Truck.create({ ...req.body, owner: req.user._id });
      res.status(201).json({ success: true, data: truck });
    } catch (error) { next(error); }
  },

  async getMyTrucks(req, res, next) {
    try {
      const trucks = await Truck.find({ owner: req.user._id })
        .populate({ path: 'assignedDriver', populate: { path: 'user', select: 'name phone' } });
      res.json({ success: true, data: trucks });
    } catch (error) { next(error); }
  },

  async updateTruck(req, res, next) {
    try {
      const truck = await Truck.findOne({ _id: req.params.id, owner: req.user._id });
      if (!truck) return res.status(404).json({ success: false, message: 'Truck not found' });
      Object.assign(truck, req.body);
      await truck.save();
      res.json({ success: true, data: truck });
    } catch (error) { next(error); }
  },

  async deleteTruck(req, res, next) {
    try {
      const truck = await Truck.findOneAndDelete({ _id: req.params.id, owner: req.user._id });
      if (!truck) return res.status(404).json({ success: false, message: 'Truck not found' });
      res.json({ success: true, message: 'Truck removed' });
    } catch (error) { next(error); }
  },

  async addMaintenance(req, res, next) {
    try {
      const truck = await Truck.findOne({ _id: req.params.id, owner: req.user._id });
      if (!truck) return res.status(404).json({ success: false, message: 'Truck not found' });
      const record = await Maintenance.create({ ...req.body, truck: truck._id, owner: req.user._id });
      if (req.body.status === 'in_progress') {
        truck.status = 'maintenance';
        await truck.save();
      }
      res.status(201).json({ success: true, data: record });
    } catch (error) { next(error); }
  },

  async getMaintenanceHistory(req, res, next) {
    try {
      const records = await Maintenance.find({ truck: req.params.id })
        .sort({ serviceDate: -1 });
      res.json({ success: true, data: records });
    } catch (error) { next(error); }
  },
};

// ═══════════════════════════════════════════════════════
// DRIVER CONTROLLER
// ═══════════════════════════════════════════════════════

exports.driver = {
  async registerDriver(req, res, next) {
    try {
      const exists = await Driver.findOne({ user: req.user._id });
      if (exists) return res.status(400).json({ success: false, message: 'Driver profile already exists' });
      const driver = await Driver.create({ ...req.body, user: req.user._id });
      res.status(201).json({ success: true, data: driver });
    } catch (error) { next(error); }
  },

  async getMyProfile(req, res, next) {
    try {
      const driver = await Driver.findOne({ user: req.user._id })
        .populate('assignedTruck')
        .populate('user', 'name phone email');
      if (!driver) return res.status(404).json({ success: false, message: 'Driver profile not found' });
      res.json({ success: true, data: driver });
    } catch (error) { next(error); }
  },

  async updateProfile(req, res, next) {
    try {
      const driver = await Driver.findOneAndUpdate(
        { user: req.user._id },
        req.body,
        { new: true, runValidators: true }
      );
      res.json({ success: true, data: driver });
    } catch (error) { next(error); }
  },

  async getAllDrivers(req, res, next) {
    try {
      const filter = req.user.role === 'truck_owner' ? { owner: req.user._id } : {};
      if (req.query.status) filter.verificationStatus = req.query.status;
      const drivers = await Driver.find(filter)
        .populate('user', 'name phone email')
        .populate('assignedTruck', 'truckNumber truckType');
      res.json({ success: true, data: drivers });
    } catch (error) { next(error); }
  },

  async updateLocation(req, res, next) {
    try {
      const { lat, lng } = req.body;
      const driver = await Driver.findOneAndUpdate(
        { user: req.user._id },
        { currentLocation: { lat, lng, updatedAt: new Date() } },
        { new: true }
      );
      res.json({ success: true, data: driver?.currentLocation });
    } catch (error) { next(error); }
  },
};

// ═══════════════════════════════════════════════════════
// PAYMENT CONTROLLER
// ═══════════════════════════════════════════════════════

exports.payment = {
  async getMyPayments(req, res, next) {
    try {
      const filter = req.user.role === 'truck_owner'
        ? { truckOwner: req.user._id }
        : { customer: req.user._id };
      if (req.query.status) filter.status = req.query.status;
      const payments = await Payment.find(filter)
        .populate('booking', 'bookingNumber pickup drop')
        .sort({ createdAt: -1 });
      res.json({ success: true, data: payments });
    } catch (error) { next(error); }
  },

  async markPaid(req, res, next) {
    try {
      const payment = await Payment.findById(req.params.id);
      if (!payment) return res.status(404).json({ success: false, message: 'Payment not found' });
      payment.status = 'success';
      payment.paidAt = new Date();
      payment.transactionId = req.body.transactionId;
      payment.paymentMethod = req.body.paymentMethod;
      await payment.save();
      res.json({ success: true, data: payment });
    } catch (error) { next(error); }
  },

  async downloadInvoice(req, res, next) {
    try {
      const invoice = await Invoice.findOne({ booking: req.params.bookingId })
        .populate({ path: 'booking', populate: ['customer', 'truck'] });
      if (!invoice) return res.status(404).json({ success: false, message: 'Invoice not found' });
      res.json({ success: true, data: invoice });
    } catch (error) { next(error); }
  },
};
