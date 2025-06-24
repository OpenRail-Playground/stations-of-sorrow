const express = require('express');
const router = express.Router();
const alternativesController = require('../controllers/alternativesController');

// POST /api/v1/alternatives - Find alternative stations based on parameters
router.post('/', alternativesController.findAlternatives);

module.exports = router;
