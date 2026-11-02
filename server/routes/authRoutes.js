const express = require('express');
const router = express.Router();
const {
  sendRegistrationOtp,
  registerUser,
  loginUser,
  googleAuth,
  getMe,
  forgotPassword,
  resetPassword,
  verifyEmail,
} = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

router.post('/send-otp', sendRegistrationOtp);
router.post('/verify-otp', registerUser);
router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/google', googleAuth);
router.get('/me', protect, getMe);
router.post('/forgot-password', forgotPassword);
router.put('/reset-password/:token', resetPassword);
router.post('/verify-email', verifyEmail);

module.exports = router;
