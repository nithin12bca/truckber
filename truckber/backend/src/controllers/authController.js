const jwt    = require('jsonwebtoken');
const crypto = require('crypto');
const User   = require('../models/User');
const { sendEmail }           = require('../services/emailService');
const { createNotification }  = require('../services/notificationService');

// ── helpers ───────────────────────────────────────────────────────────────────
const generateTokens = (id) => ({
  accessToken: jwt.sign({ id }, process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '15m' }),
  refreshToken: jwt.sign({ id }, process.env.JWT_REFRESH_SECRET,
    { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d' }),
});

const sendTokenResponse = async (user, statusCode, res) => {
  const { accessToken, refreshToken } = generateTokens(user._id);
  user.refreshToken = refreshToken;
  user.lastLogin    = new Date();
  await user.save({ validateBeforeSave: false });
  // toJSON() strips password / refreshToken automatically
  res.status(statusCode).json({
    success: true,
    data: { user, accessToken, refreshToken },
  });
};

// ── REGISTER ──────────────────────────────────────────────────────────────────
exports.register = async (req, res, next) => {
  try {
    const { name, email, phone, password, role, address } = req.body;

    const existing = await User.findOne({ $or: [{ email: email.toLowerCase() }, { phone }] });
    if (existing) {
      const field = existing.email === email.toLowerCase() ? 'Email' : 'Phone number';
      return res.status(400).json({ success: false, message: `${field} is already registered.` });
    }

    const allowedRoles = ['customer', 'truck_owner', 'driver'];
    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      phone: phone.trim(),
      password,
      role: allowedRoles.includes(role) ? role : 'customer',
      address,
    });

    sendEmail({ to: user.email, subject: 'Welcome to TruckBer! 🚛',
      template: 'welcome', data: { name: user.name } }).catch(console.error);

    await sendTokenResponse(user, 201, res);
  } catch (error) { next(error); }
};

// ── LOGIN ─────────────────────────────────────────────────────────────────────
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password)
      return res.status(400).json({ success: false, message: 'Email and password are required.' });

    // MUST use .select('+password') because password has select:false
    const user = await User.findOne({ email: email.toLowerCase().trim() })
      .select('+password +refreshToken');

    if (!user || !(await user.comparePassword(password)))
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });

    if (!user.isActive)
      return res.status(403).json({ success: false, message: 'Account deactivated. Contact support.' });

    await sendTokenResponse(user, 200, res);
  } catch (error) { next(error); }
};

// ── REFRESH TOKEN ─────────────────────────────────────────────────────────────
exports.refreshToken = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken)
      return res.status(400).json({ success: false, message: 'Refresh token required.' });

    let decoded;
    try { decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET); }
    catch { return res.status(401).json({ success: false, message: 'Invalid or expired refresh token.' }); }

    const user = await User.findById(decoded.id).select('+refreshToken');
    if (!user || user.refreshToken !== refreshToken)
      return res.status(401).json({ success: false, message: 'Refresh token mismatch. Please log in again.' });

    const tokens = generateTokens(user._id);
    user.refreshToken = tokens.refreshToken;
    await user.save({ validateBeforeSave: false });

    res.json({ success: true, data: tokens });
  } catch (error) { next(error); }
};

// ── LOGOUT ────────────────────────────────────────────────────────────────────
exports.logout = async (req, res, next) => {
  try {
    await User.findByIdAndUpdate(req.user._id, { $unset: { refreshToken: '' } });
    res.json({ success: true, message: 'Logged out successfully.' });
  } catch (error) { next(error); }
};

// ── FORGOT PASSWORD ───────────────────────────────────────────────────────────
exports.forgotPassword = async (req, res, next) => {
  try {
    const user = await User.findOne({ email: (req.body.email || '').toLowerCase().trim() });
    // always 200 to prevent email enumeration
    if (!user) return res.json({ success: true, message: 'If that email exists, a reset link was sent.' });

    const resetToken = crypto.randomBytes(32).toString('hex');
    user.passwordResetToken   = crypto.createHash('sha256').update(resetToken).digest('hex');
    user.passwordResetExpires = Date.now() + 30 * 60 * 1000;
    await user.save({ validateBeforeSave: false });

    const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;
    await sendEmail({ to: user.email, subject: 'TruckBer — Password Reset',
      template: 'resetPassword', data: { name: user.name, resetUrl } });

    res.json({ success: true, message: 'If that email exists, a reset link was sent.' });
  } catch (error) { next(error); }
};

// ── RESET PASSWORD ────────────────────────────────────────────────────────────
exports.resetPassword = async (req, res, next) => {
  try {
    const hashed = crypto.createHash('sha256').update(req.params.token).digest('hex');
    const user = await User.findOne({
      passwordResetToken:   hashed,
      passwordResetExpires: { $gt: Date.now() },
    }).select('+passwordResetToken +passwordResetExpires');

    if (!user)
      return res.status(400).json({ success: false, message: 'Reset link invalid or expired.' });

    if (!req.body.password || req.body.password.length < 6)
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters.' });

    user.password             = req.body.password;
    user.passwordResetToken   = undefined;
    user.passwordResetExpires = undefined;
    user.refreshToken         = undefined;
    await user.save();

    res.json({ success: true, message: 'Password reset. Please log in.' });
  } catch (error) { next(error); }
};

// ── GET ME ────────────────────────────────────────────────────────────────────
exports.getMe = (req, res) =>
  res.json({ success: true, data: req.user });

// ── UPDATE PROFILE ────────────────────────────────────────────────────────────
exports.updateProfile = async (req, res, next) => {
  try {
    const allowed = ['name', 'phone', 'address', 'avatar'];
    const updates = {};
    allowed.forEach(f => { if (req.body[f] !== undefined) updates[f] = req.body[f]; });
    const user = await User.findByIdAndUpdate(req.user._id, updates, { new: true, runValidators: true });
    res.json({ success: true, data: user });
  } catch (error) { next(error); }
};

// ── CHANGE PASSWORD ───────────────────────────────────────────────────────────
exports.changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword)
      return res.status(400).json({ success: false, message: 'Both passwords are required.' });
    if (newPassword.length < 6)
      return res.status(400).json({ success: false, message: 'New password min 6 characters.' });

    const user = await User.findById(req.user._id).select('+password');
    if (!(await user.comparePassword(currentPassword)))
      return res.status(400).json({ success: false, message: 'Current password is incorrect.' });

    user.password = newPassword;
    await user.save();
    res.json({ success: true, message: 'Password changed successfully.' });
  } catch (error) { next(error); }
};
