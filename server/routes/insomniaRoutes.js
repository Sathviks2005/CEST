const express = require('express');
const router = express.Router();
const { submitInsomnia } = require('../controllers/insomniaController');
const { protect } = require('../middleware/authMiddleware');

router.post('/submit', protect, submitInsomnia);

module.exports = router;
