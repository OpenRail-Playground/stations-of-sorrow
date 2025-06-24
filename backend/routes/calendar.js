const express = require('express');
const router = express.Router();
const calendarController = require('../controllers/calendarController');

// GET /api/v1/calendar - Get calendar data for a date range
router.get('/', calendarController.getCalendarData);

// POST /api/v1/calendar - Add a calendar entry
router.post('/', calendarController.addCalendarEntry);

module.exports = router;
