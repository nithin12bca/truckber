// routes/index.js - Central router (complete with livestock + reports)
const express = require('express');
const router = express.Router();

const authController = require('../controllers/authController');
const bookingController = require('../controllers/bookingController');
const adminController = require('../controllers/adminController');
const { fleet, driver, payment } = require('../controllers/fleetDriverPaymentController');
const livestockController = require('../controllers/livestockController');
const reportController = require('../controllers/reportController');
const { protect, authorize } = require('../middleware/auth');
const { validate } = require('../middleware/errorHandler');
const { body } = require('express-validator');
const { Notification, Review } = require('../models/index');
const Driver = require('../models/Driver');

// ─── Auth ────────────────────────────────────────────────────────────────────
const authRouter = express.Router();
authRouter.post('/register', [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Valid email required'),
  body('phone').isMobilePhone('en-IN').withMessage('Valid phone required'),
  body('password').isLength({ min: 6 }).withMessage('Password min 6 chars'),
  validate,
], authController.register);
authRouter.post('/login', [body('email').isEmail(), body('password').notEmpty(), validate], authController.login);
authRouter.post('/refresh-token', authController.refreshToken);
authRouter.post('/forgot-password', authController.forgotPassword);
authRouter.put('/reset-password/:token', authController.resetPassword);
authRouter.use(protect);
authRouter.post('/logout', authController.logout);
authRouter.get('/me', authController.getMe);
authRouter.put('/me', authController.updateProfile);
authRouter.put('/change-password', authController.changePassword);
router.use('/auth', authRouter);

// ─── Bookings ────────────────────────────────────────────────────────────────
const bookingRouter = express.Router();
bookingRouter.use(protect);
bookingRouter.post('/', authorize('customer'), bookingController.createBooking);
bookingRouter.get('/', bookingController.getBookings);
bookingRouter.get('/:id', bookingController.getBooking);
bookingRouter.put('/:id/accept', authorize('truck_owner'), bookingController.acceptBooking);
bookingRouter.put('/:id/assign-driver', authorize('truck_owner'), bookingController.assignDriver);
bookingRouter.put('/:id/start-trip', authorize('driver'), bookingController.startTrip);
bookingRouter.put('/:id/complete', authorize('driver'), bookingController.completeDelivery);
bookingRouter.put('/:id/cancel', bookingController.cancelBooking);
router.use('/bookings', bookingRouter);

// ─── Fleet ───────────────────────────────────────────────────────────────────
const fleetRouter = express.Router();
fleetRouter.use(protect);
fleetRouter.post('/', authorize('truck_owner'), fleet.addTruck);
fleetRouter.get('/', fleet.getMyTrucks);
fleetRouter.put('/:id', authorize('truck_owner'), fleet.updateTruck);
fleetRouter.delete('/:id', authorize('truck_owner'), fleet.deleteTruck);
fleetRouter.post('/:id/maintenance', authorize('truck_owner'), fleet.addMaintenance);
fleetRouter.get('/:id/maintenance', fleet.getMaintenanceHistory);
router.use('/fleet', fleetRouter);

// ─── Drivers ─────────────────────────────────────────────────────────────────
const driverRouter = express.Router();
driverRouter.use(protect);
driverRouter.post('/register', authorize('driver'), driver.registerDriver);
driverRouter.get('/me', authorize('driver'), driver.getMyProfile);
driverRouter.put('/me', authorize('driver'), driver.updateProfile);
driverRouter.put('/location', authorize('driver'), driver.updateLocation);
driverRouter.get('/pending', authorize('admin'), async (req, res) => {
  const drivers = await Driver.find({ verificationStatus: 'pending' }).populate('user', 'name phone email');
  res.json({ success: true, data: drivers });
});
driverRouter.get('/', driver.getAllDrivers);
router.use('/drivers', driverRouter);

// ─── Payments ────────────────────────────────────────────────────────────────
const paymentRouter = express.Router();
paymentRouter.use(protect);
paymentRouter.get('/', payment.getMyPayments);
paymentRouter.put('/:id/pay', payment.markPaid);
paymentRouter.get('/invoice/:bookingId', payment.downloadInvoice);
router.use('/payments', paymentRouter);

// ─── Notifications ───────────────────────────────────────────────────────────
const notifRouter = express.Router();
notifRouter.use(protect);
notifRouter.get('/', async (req, res) => {
  const notifications = await Notification.find({ recipient: req.user._id }).sort({ createdAt: -1 }).limit(50);
  const unread = await Notification.countDocuments({ recipient: req.user._id, isRead: false });
  res.json({ success: true, data: { notifications, unread } });
});
notifRouter.put('/read-all', async (req, res) => {
  await Notification.updateMany({ recipient: req.user._id, isRead: false }, { isRead: true });
  res.json({ success: true });
});
notifRouter.put('/:id/read', async (req, res) => {
  await Notification.findByIdAndUpdate(req.params.id, { isRead: true });
  res.json({ success: true });
});
router.use('/notifications', notifRouter);

// ─── Reviews ─────────────────────────────────────────────────────────────────
const reviewRouter = express.Router();
reviewRouter.use(protect);
reviewRouter.post('/', authorize('customer'), async (req, res, next) => {
  try {
    const review = await Review.create({ ...req.body, customer: req.user._id });
    const reviews = await Review.find({ driver: req.body.driver });
    const avg = reviews.reduce((s, r) => s + r.rating, 0) / reviews.length;
    await Driver.findByIdAndUpdate(req.body.driver, { rating: Math.round(avg * 10) / 10, totalRatings: reviews.length });
    res.status(201).json({ success: true, data: review });
  } catch (e) { next(e); }
});
router.use('/reviews', reviewRouter);

// ─── Livestock ───────────────────────────────────────────────────────────────
const livestockRouter = express.Router();
livestockRouter.use(protect);
livestockRouter.get('/report', livestockController.getReport);
livestockRouter.post('/', livestockController.createBatch);
livestockRouter.get('/', livestockController.getBatches);
livestockRouter.get('/:id', livestockController.getBatch);
livestockRouter.put('/:id', livestockController.updateBatch);
livestockRouter.delete('/:id', livestockController.deleteBatch);
livestockRouter.post('/:id/vaccination', livestockController.addVaccination);
livestockRouter.post('/:id/feed', livestockController.addFeedRecord);
livestockRouter.post('/:id/mortality', livestockController.addMortality);
livestockRouter.post('/:id/expense', livestockController.addExpense);
router.use('/livestock', livestockRouter);

// ─── Reports ─────────────────────────────────────────────────────────────────
const reportsRouter = express.Router();
reportsRouter.use(protect, authorize('admin', 'truck_owner'));
reportsRouter.get('/bookings', reportController.bookingReport);
reportsRouter.get('/revenue', reportController.revenueReport);
reportsRouter.get('/drivers', reportController.driverReport);
reportsRouter.get('/fleet', reportController.fleetReport);
router.use('/reports', reportsRouter);

// ─── Admin ───────────────────────────────────────────────────────────────────
const adminRouter = express.Router();
adminRouter.use(protect, authorize('admin'));
adminRouter.get('/dashboard', adminController.getDashboard);
adminRouter.get('/users', adminController.getUsers);
adminRouter.put('/users/:id/toggle-status', adminController.toggleUserStatus);
adminRouter.put('/drivers/:id/verify', adminController.verifyDriver);
adminRouter.get('/analytics', adminController.getAnalytics);
router.use('/admin', adminRouter);

module.exports = router;
