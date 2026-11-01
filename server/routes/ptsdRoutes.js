const express = require('express');
const router = express.Router();
const { submitPTSD } = require('../controllers/ptsdController');
const { protect } = require('../middleware/authMiddleware');

router.post('/submit', protect, submitPTSD);

module.exports = router;
