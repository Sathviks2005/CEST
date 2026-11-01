const express = require('express');
const router = express.Router();
const { getDisorders, getDisorderBySlug } = require('../controllers/disorderController');

router.get('/', getDisorders);
router.get('/:slug', getDisorderBySlug);

module.exports = router;
