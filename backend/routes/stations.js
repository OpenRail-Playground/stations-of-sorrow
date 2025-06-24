const express = require('express');
const router = express.Router();
const stationController = require('../controllers/stationController');

// GET /api/v1/stations - Retrieve all stations
router.get('/', stationController.getAllStations);

// GET /api/v1/stations/:id - Retrieve a specific station by ID
router.get('/:id', stationController.getStationById);

module.exports = router;
