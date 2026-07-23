const jwt  = require('jsonwebtoken');
const User = require('../models/User');

// Verify JWT and attach user to req
const protect = async (req, res, next) => {
  try {
    let token;
    if (req.headers.authorization?.startsWith('Bearer '))
      token = req.headers.authorization.split(' ')[1];

    if (!token)
      return res.status(401).json({ success: false, message: 'Not authorized. Please log in.' });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // password is select:false — won't be included automatically
    const user = await User.findById(decoded.id);
    if (!user)
      return res.status(401).json({ success: false, message: 'User no longer exists.' });

    if (!user.isActive)
      return res.status(403).json({ success: false, message: 'Account deactivated. Contact support.' });

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError')
      return res.status(401).json({ success: false, message: 'Session expired. Please log in again.', code: 'TOKEN_EXPIRED' });
    return res.status(401).json({ success: false, message: 'Invalid token. Please log in again.' });
  }
};

// Restrict to specific roles
const authorize = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user.role))
    return res.status(403).json({
      success: false,
      message: `Access denied. Required: ${roles.join(' or ')}. Your role: ${req.user.role}.`,
    });
  next();
};

// Optional auth — attach user if valid token, never blocks
const optionalAuth = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.id);
    }
  } catch { /* silent */ }
  next();
};

module.exports = { protect, authorize, optionalAuth };
