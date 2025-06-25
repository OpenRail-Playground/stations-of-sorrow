const { pool } = require('../config/db');

/**
 * Weather model for database operations related to weather data
 */
class Weather {
  /**
   * Get current weather for a specific station
   * @param {string} stationId - Station ID
   * @returns {Promise<Object>} Current weather data
   */
  static async getCurrentForStation(stationId) {
    try {
      const result = await pool.query(`
        SELECT 
          temp,
          condition,
          wind,
          beach_suitability,
          timestamp
        FROM weather
        WHERE station_id = $1
        ORDER BY timestamp DESC
        LIMIT 1
      `, [stationId]);

      if (result.rows.length === 0) {
        return null;
      }

      return result.rows[0];
    } catch (error) {
      console.error(`Database error in Weather.getCurrentForStation for ${stationId}:`, error);
      throw error;
    }
  }

  /**
   * Get weather forecast for a station
   * @param {string} stationId - Station ID
   * @param {number} days - Number of days to forecast
   * @returns {Promise<Array>} Weather forecast data
   */
  static async getForecast(stationId, days = 3) {
    try {
      // In a real implementation, this would fetch forecast data from a weather API
      // For now, we'll return null as we don't have forecast data yet
      return null;
    } catch (error) {
      console.error(`Database error in Weather.getForecast for ${stationId}:`, error);
      throw error;
    }
  }

  /**
   * Record new weather data for a station
   * @param {string} stationId - Station ID
   * @param {Object} weatherData - Weather data
   * @returns {Promise<Object>} Created weather record
   */
  static async recordWeather(stationId, weatherData) {
    try {
      const { temp, condition, wind } = weatherData;
      
      // Determine beach suitability based on weather conditions
      let beachSuitability = 'mäßig';
      
      if (temp >= 22 && wind < 15 && ['sonnig', 'heiter'].includes(condition)) {
        beachSuitability = 'sehr gut';
      } else if (temp >= 18 && wind < 20 && !['regnerisch', 'stürmisch'].includes(condition)) {
        beachSuitability = 'gut';
      } else if (wind > 25 || ['regnerisch', 'stürmisch'].includes(condition)) {
        beachSuitability = 'schlecht';
      }

      const result = await pool.query(`
        INSERT INTO weather (station_id, temp, condition, wind, beach_suitability)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING *
      `, [stationId, temp, condition, wind, beachSuitability]);

      return result.rows[0];
    } catch (error) {
      console.error(`Database error in Weather.recordWeather for ${stationId}:`, error);
      throw error;
    }
  }
}

module.exports = Weather;
