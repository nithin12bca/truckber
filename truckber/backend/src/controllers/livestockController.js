const { LivestockBatch } = require('../models/index');
const Booking = require('../models/Booking');

// @desc    Create livestock batch
// @route   POST /api/livestock
exports.createBatch = async (req, res, next) => {
  try {
    const batch = await LivestockBatch.create({ ...req.body, owner: req.user._id });
    res.status(201).json({ success: true, data: batch });
  } catch (error) { next(error); }
};

// @desc    Get all batches for current user
// @route   GET /api/livestock
exports.getBatches = async (req, res, next) => {
  try {
    const filter = req.user.role === 'admin' ? {} : { owner: req.user._id };
    const batches = await LivestockBatch.find(filter)
      .populate('booking', 'bookingNumber status pickup drop')
      .populate('owner', 'name phone')
      .sort({ createdAt: -1 });
    res.json({ success: true, data: batches });
  } catch (error) { next(error); }
};

// @desc    Get single batch
// @route   GET /api/livestock/:id
exports.getBatch = async (req, res, next) => {
  try {
    const batch = await LivestockBatch.findById(req.params.id)
      .populate('booking')
      .populate('owner', 'name phone');
    if (!batch) return res.status(404).json({ success: false, message: 'Batch not found' });
    res.json({ success: true, data: batch });
  } catch (error) { next(error); }
};

// @desc    Update batch (status, records push)
// @route   PUT /api/livestock/:id
exports.updateBatch = async (req, res, next) => {
  try {
    const batch = await LivestockBatch.findOneAndUpdate(
      { _id: req.params.id, owner: req.user._id },
      req.body,
      { new: true, runValidators: true }
    );
    if (!batch) return res.status(404).json({ success: false, message: 'Batch not found' });
    res.json({ success: true, data: batch });
  } catch (error) { next(error); }
};

// @desc    Add vaccination record
// @route   POST /api/livestock/:id/vaccination
exports.addVaccination = async (req, res, next) => {
  try {
    const batch = await LivestockBatch.findOneAndUpdate(
      { _id: req.params.id, owner: req.user._id },
      { $push: { vaccinationRecords: req.body } },
      { new: true }
    );
    if (!batch) return res.status(404).json({ success: false, message: 'Batch not found' });
    res.json({ success: true, data: batch });
  } catch (error) { next(error); }
};

// @desc    Add feed record
// @route   POST /api/livestock/:id/feed
exports.addFeedRecord = async (req, res, next) => {
  try {
    const batch = await LivestockBatch.findOneAndUpdate(
      { _id: req.params.id, owner: req.user._id },
      { $push: { feedRecords: { ...req.body, time: new Date() } } },
      { new: true }
    );
    if (!batch) return res.status(404).json({ success: false, message: 'Batch not found' });
    res.json({ success: true, data: batch });
  } catch (error) { next(error); }
};

// @desc    Add mortality record
// @route   POST /api/livestock/:id/mortality
exports.addMortality = async (req, res, next) => {
  try {
    const batch = await LivestockBatch.findOneAndUpdate(
      { _id: req.params.id, owner: req.user._id },
      {
        $push: { mortalityRecords: { ...req.body, recordedAt: new Date() } },
        $inc: { quantity: -(req.body.count || 0) },
      },
      { new: true }
    );
    if (!batch) return res.status(404).json({ success: false, message: 'Batch not found' });
    res.json({ success: true, data: batch });
  } catch (error) { next(error); }
};

// @desc    Add transport expense
// @route   POST /api/livestock/:id/expense
exports.addExpense = async (req, res, next) => {
  try {
    const batch = await LivestockBatch.findOneAndUpdate(
      { _id: req.params.id, owner: req.user._id },
      { $push: { transportExpenses: { ...req.body, date: new Date() } } },
      { new: true }
    );
    if (!batch) return res.status(404).json({ success: false, message: 'Batch not found' });
    res.json({ success: true, data: batch });
  } catch (error) { next(error); }
};

// @desc    Get livestock report (owner/admin)
// @route   GET /api/livestock/report
exports.getReport = async (req, res, next) => {
  try {
    const filter = req.user.role === 'admin' ? {} : { owner: req.user._id };
    const batches = await LivestockBatch.find(filter);

    const report = {
      totalBatches: batches.length,
      totalAnimals: batches.reduce((s, b) => s + (b.quantity || 0), 0),
      totalMortality: batches.reduce((s, b) =>
        s + b.mortalityRecords.reduce((ms, m) => ms + (m.count || 0), 0), 0),
      totalExpenses: batches.reduce((s, b) =>
        s + b.transportExpenses.reduce((es, e) => es + (e.amount || 0), 0), 0),
      byStatus: {
        preparing: batches.filter(b => b.status === 'preparing').length,
        in_transit: batches.filter(b => b.status === 'in_transit').length,
        delivered: batches.filter(b => b.status === 'delivered').length,
        at_market: batches.filter(b => b.status === 'at_market').length,
      },
      animalTypes: [...new Set(batches.map(b => b.animalType))],
    };

    res.json({ success: true, data: report });
  } catch (error) { next(error); }
};

// @desc    Delete batch
// @route   DELETE /api/livestock/:id
exports.deleteBatch = async (req, res, next) => {
  try {
    const batch = await LivestockBatch.findOneAndDelete({ _id: req.params.id, owner: req.user._id });
    if (!batch) return res.status(404).json({ success: false, message: 'Batch not found' });
    res.json({ success: true, message: 'Batch deleted' });
  } catch (error) { next(error); }
};
