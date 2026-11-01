const express = require('express');
const router = express.Router();
const { submitOCD } = require('../controllers/ocdController');
const { protect } = require('../middleware/authMiddleware');

router.post('/submit', protect, submitOCD);

module.exports = router;
