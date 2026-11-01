const express = require('express');
const router = express.Router();
const { submitADHD } = require('../controllers/adhdController');
const { protect } = require('../middleware/authMiddleware');

router.post('/submit', protect, submitADHD);

module.exports = router;
