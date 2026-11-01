const express = require('express');
const router = express.Router();
const { submitGAD7 } = require('../controllers/gad7Controller');
const { protect } = require('../middleware/authMiddleware');

router.post('/submit', protect, submitGAD7);

module.exports = router;
