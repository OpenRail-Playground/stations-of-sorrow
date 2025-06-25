const { pool } = require('../config/db');

/**
 * Calendar model for database operations related to holidays and events
 */
class Calendar {
  /**
   * Get holidays and events for a date range
   * @param {Date} startDate - Start date
   * @param {Date} endDate - End date
   * @returns {Promise<Array>} List of holidays and events
   */
  static async getInRange(startDate, endDate) {
    try {
      const result = await pool.query(`
        SELECT 
          date,
          is_holiday,
          is_school_holiday,
          state,
          event_name
        FROM calendar
        WHERE date BETWEEN $1 AND $2
        ORDER BY date
      `, [startDate, endDate]);

      return result.rows;
    } catch (error) {
      console.error('Database error in Calendar.getInRange:', error);
      throw error;
    }
  }

  /**
   * Check if a date is a holiday or school holiday
   * @param {Date} date - Date to check
   * @returns {Promise<Object>} Holiday info
   */
  static async isHoliday(date) {
    try {
      const result = await pool.query(`
        SELECT 
          is_holiday,
          is_school_holiday,
          state,
          event_name
        FROM calendar
        WHERE date = $1
      `, [date]);

      if (result.rows.length === 0) {
        return {
          isHoliday: false,
          isSchoolHoliday: false,
          event: null
        };
      }

      return {
        isHoliday: result.rows[0].is_holiday,
        isSchoolHoliday: result.rows[0].is_school_holiday,
        state: result.rows[0].state,
        event: result.rows[0].event_name
      };
    } catch (error) {
      console.error(`Database error in Calendar.isHoliday for ${date}:`, error);
      throw error;
    }
  }

  /**
   * Add a calendar entry
   * @param {Object} calendarData - Calendar data
   * @returns {Promise<Object>} Created calendar entry
   */
  static async addEntry(calendarData) {
    const { date, isHoliday, isSchoolHoliday, state, eventName } = calendarData;
    
    try {
      const result = await pool.query(`
        INSERT INTO calendar 
          (date, is_holiday, is_school_holiday, state, event_name)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING *
      `, [date, isHoliday, isSchoolHoliday, state, eventName]);

      return result.rows[0];
    } catch (error) {
      console.error(`Database error in Calendar.addEntry:`, error);
      throw error;
    }
  }
}

module.exports = Calendar;
