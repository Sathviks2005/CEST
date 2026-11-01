/**
 * Chat Routes
 * Mounted at: /api/chat
 *
 * Protected: Requires valid JWT or offline mock token.
 * Rate limited: In-memory sliding window per user ID.
 * NOTE: For multi-instance horizontal scaling in production, this in-memory sliding window
 * should be replaced with express-rate-limit backed by Redis or Memcached.
 */

const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { handleChat } = require('../controllers/chatController');

// In-memory sliding window store: userId -> array of timestamps (epoch ms)
const rateLimitMap = new Map();

// Periodic cleanup of stale timestamps to prevent memory leaks
const WINDOW_MS = 60 * 1000; // 1 minute
const cleanupTimer = setInterval(() => {
  const now = Date.now();
  for (const [userId, timestamps] of rateLimitMap.entries()) {
    const validTimestamps = timestamps.filter((t) => now - t < WINDOW_MS);
    if (validTimestamps.length === 0) {
      rateLimitMap.delete(userId);
    } else {
      rateLimitMap.set(userId, validTimestamps);
    }
  }
}, 5 * 60 * 1000);
if (cleanupTimer.unref) {
  cleanupTimer.unref();
}

/**
 * Sliding window rate limiter middleware per user ID
 */
const chatRateLimiter = (req, res, next) => {
  const limitPerMinute = parseInt(process.env.CHAT_RATE_LIMIT_PER_MIN, 10) || 20;
  const userId = req.user?._id || req.user?.id || req.ip || 'anonymous';
  const now = Date.now();

  const timestamps = rateLimitMap.get(userId) || [];
  const recentTimestamps = timestamps.filter((time) => now - time < WINDOW_MS);

  if (recentTimestamps.length >= limitPerMinute) {
    return res.status(429).json({
      success: false,
      message: 'You have sent too many messages in a short time. Please wait a minute before sending another message.',
    });
  }

  recentTimestamps.push(now);
  rateLimitMap.set(userId, recentTimestamps);
  next();
};

// POST /api/chat
router.post('/', protect, chatRateLimiter, handleChat);

module.exports = router;
