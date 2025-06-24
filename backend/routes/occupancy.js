const express = require('express');
const router = express.Router();
const occupancyController = require('../controllers/occupancyController');

// GET /api/v1/occupancy - Retrieve current occupancy for all stations
router.get('/', occupancyController.getCurrentOccupancy);

// GET /api/v1/occupancy/:id/history - Retrieve occupancy history for a specific station
router.get('/:id/history', occupancyController.getStationOccupancyHistory);

module.exports = router;
