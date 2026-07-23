const User = require('../models/User');
const Booking = require('../models/Booking');
const Truck = require('../models/Truck');
const Driver = require('../models/Driver');
const { Payment, Notification } = require('../models/index');

// @desc    Admin dashboard stats
// @route   GET /api/admin/dashboard
exports.getDashboard = async (req, res, next) => {
  try {
    const [
      totalUsers, totalTrucks, totalDrivers,
      totalBookings, activeTrips, completedTrips,
    ] = await Promise.all([
      User.countDocuments(),
      Truck.countDocuments(),
      Driver.countDocuments(),
      Booking.countDocuments(),
      Booking.countDocuments({ status: 'in_transit' }),
      Booking.countDocuments({ status: 'delivered' }),
    ]);

    const revenueData = await Payment.aggregate([
      { $match: { status: 'success' } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]);
    const totalRevenue = revenueData[0]?.total || 0;

    // Monthly revenue (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const monthlyRevenue = await Payment.aggregate([
      { $match: { status: 'success', createdAt: { $gte: sixMonthsAgo } } },
      {
        $group: {
          _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } },
          revenue: { $sum: '$amount' },
          count: { $sum: 1 },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]);

    // Booking trends (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const bookingTrends = await Booking.aggregate([
      { $match: { createdAt: { $gte: sevenDaysAgo } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Status distribution
    const statusBreakdown = await Booking.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);

    // Top drivers
    const topDrivers = await Driver.find({ totalTrips: { $gt: 0 } })
      .populate('user', 'name')
      .sort({ totalTrips: -1, rating: -1 })
      .limit(5);

    res.json({
      success: true,
      data: {
        stats: { totalUsers, totalTrucks, totalDrivers, totalBookings, activeTrips, completedTrips, totalRevenue },
        charts: { monthlyRevenue, bookingTrends, statusBreakdown },
        topDrivers,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all users
// @route   GET /api/admin/users
exports.getUsers = async (req, res, next) => {
  try {
    const { role, isActive, page = 1, limit = 20, search } = req.query;
    const filter = {};
    if (role) filter.role = role;
    if (isActive !== undefined) filter.isActive = isActive === 'true';
    if (search) filter.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
      { phone: { $regex: search, $options: 'i' } },
    ];

    const total = await User.countDocuments(filter);
    const users = await User.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.json({ success: true, data: users, pagination: { total, page: Number(page), pages: Math.ceil(total / limit) } });
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle user active status
// @route   PUT /api/admin/users/:id/toggle-status
exports.toggleUserStatus = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    user.isActive = !user.isActive;
    await user.save();
    res.json({ success: true, data: user, message: `User ${user.isActive ? 'activated' : 'deactivated'}` });
  } catch (error) {
    next(error);
  }
};

// @desc    Verify/Reject driver
// @route   PUT /api/admin/drivers/:id/verify
exports.verifyDriver = async (req, res, next) => {
  try {
    const { status, note } = req.body;
    const driver = await Driver.findById(req.params.id).populate('user', 'name email');
    if (!driver) return res.status(404).json({ success: false, message: 'Driver not found' });

    driver.verificationStatus = status;
    driver.verificationNote = note;
    await driver.save();

    await Notification.create({
      recipient: driver.user._id,
      type: 'driver_verified',
      title: status === 'approved' ? 'Verification Approved!' : 'Verification Update',
      message: status === 'approved'
        ? 'Congratulations! Your driver account has been verified.'
        : `Your verification was ${status}. Reason: ${note}`,
    });

    res.json({ success: true, data: driver });
  } catch (error) {
    next(error);
  }
};

// @desc    Get analytics report
// @route   GET /api/admin/analytics
exports.getAnalytics = async (req, res, next) => {
  try {
    const { period = '30' } = req.query;
    const daysAgo = new Date();
    daysAgo.setDate(daysAgo.getDate() - Number(period));

    const [revenueByPeriod, bookingsByStatus, fleetUtilization, driverPerformance] = await Promise.all([
      Payment.aggregate([
        { $match: { status: 'success', createdAt: { $gte: daysAgo } } },
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
            revenue: { $sum: '$amount' }, count: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ]),
      Booking.aggregate([
        { $match: { createdAt: { $gte: daysAgo } } },
        { $group: { _id: '$status', count: { $sum: 1 } } },
      ]),
      Truck.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 } } },
      ]),
      Driver.aggregate([
        { $match: { totalTrips: { $gt: 0 } } },
        {
          $lookup: { from: 'users', localField: 'user', foreignField: '_id', as: 'userInfo' },
        },
        { $unwind: '$userInfo' },
        {
          $project: {
            name: '$userInfo.name', totalTrips: 1, rating: 1,
            totalDistance: 1, verificationStatus: 1,
          },
        },
        { $sort: { totalTrips: -1 } },
        { $limit: 10 },
      ]),
    ]);

    res.json({ success: true, data: { revenueByPeriod, bookingsByStatus, fleetUtilization, driverPerformance } });
  } catch (error) {
    next(error);
  }
};
