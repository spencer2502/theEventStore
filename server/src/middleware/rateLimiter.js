const rateLimit = require('express-rate-limit');

// Strict rate limiter for login attempts (5 attempts per 15 minutes)
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10, // 10 attempts to allow test typing while preventing brute force
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many login attempts from this IP. Please try again after 15 minutes.',
  },
});

// Rate limiter for guest checkout orders (prevent automated spam orders)
const orderLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30, // 30 orders per 15 minutes per IP
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many order requests from this IP. Please try again shortly.',
  },
});

module.exports = {
  loginLimiter,
  orderLimiter,
};
