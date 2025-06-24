const Calendar = require('../models/Calendar');

/**
 * Controller for managing calendar data
 */
const calendarController = {
  /**
   * Get calendar data for a date range
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getCalendarData(req, res) {
    // Parse start and end dates from query params
    let { start, end } = req.query;
    
    // Default to current month if not provided
    if (!start) {
      const today = new Date();
      start = new Date(today.getFullYear(), today.getMonth(), 1);
    } else {
      start = new Date(start);
    }
    
    if (!end) {
      const nextMonth = new Date(start);
      nextMonth.setMonth(nextMonth.getMonth() + 1);
      end = new Date(nextMonth.getFullYear(), nextMonth.getMonth(), 0);
    } else {
      end = new Date(end);
    }
    
    try {
      const calendarData = await Calendar.getInRange(start, end);
      
      res.json({
        success: true,
        count: calendarData.length,
        data: calendarData,
        dateRange: { start, end }
      });
    } catch (error) {
      console.error('Error fetching calendar data:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching calendar data',
        error: error.message
      });
    }
  },

  /**
   * Add a calendar entry
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async addCalendarEntry(req, res) {
    const { date, isHoliday, isSchoolHoliday, state, eventName } = req.body;
    
    // Validate required data
    if (!date) {
      return res.status(400).json({
        success: false,
        message: 'Date is required for calendar entries'
      });
    }
    
    try {
      const calendarData = {
        date: new Date(date),
        isHoliday: isHoliday || false,
        isSchoolHoliday: isSchoolHoliday || false,
        state: state || null,
        eventName: eventName || null
      };
      
      const newEntry = await Calendar.addEntry(calendarData);
      
      res.status(201).json({
        success: true,
        data: newEntry
      });
    } catch (error) {
      console.error('Error adding calendar entry:', error);
      res.status(500).json({
        success: false,
        message: 'Error adding calendar entry',
        error: error.message
      });
    }
  }
};

module.exports = calendarController;
