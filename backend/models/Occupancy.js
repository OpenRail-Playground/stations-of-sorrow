const { pool } = require('../config/db');

/**
 * Occupancy model for database operations related to passenger data
 */
class Occupancy {
  /**
   * Get current occupancy for all stations
   * @returns {Promise<Array>} Current occupancy data
   */
  static async getCurrentForAll() {
    try {
      const result = await pool.query(`
        SELECT
          pd.station_id,
          pm.name,
          pd.current_occupancy,
          pd.occupancy_level,
          pd.occupancy_icon,
          pd.timestamp
        FROM paxdata pd
        JOIN pax_masterdata pm ON pd.station_id = pm.id
        WHERE pd.timestamp > NOW() - INTERVAL '30 minutes'
        ORDER BY pd.timestamp DESC
      `);

      // Group by station_id to get only the latest record per station
      const latestOccupancies = {};
      result.rows.forEach(row => {
        if (!latestOccupancies[row.station_id] || 
            new Date(row.timestamp) > new Date(latestOccupancies[row.station_id].timestamp)) {
          latestOccupancies[row.station_id] = row;
        }
      });

      return Object.values(latestOccupancies);
    } catch (error) {
      console.error('Database error in Occupancy.getCurrentForAll:', error);
      throw error;
    }
  }

  /**
   * Get current occupancy for a specific station
   * @param {string} stationId - Station ID
   * @returns {Promise<Object>} Current occupancy data
   */
  static async getCurrentForStation(stationId) {
    try {
      const result = await pool.query(`
        SELECT 
          current_occupancy,
          occupancy_level,
          occupancy_icon,
          timestamp
        FROM paxdata
        WHERE station_id = $1
        ORDER BY timestamp DESC
        LIMIT 1
      `, [stationId]);

      if (result.rows.length === 0) {
        return null;
      }

      return result.rows[0];
    } catch (error) {
      console.error(`Database error in Occupancy.getCurrentForStation for ${stationId}:`, error);
      throw error;
    }
  }

  /**
   * Get historical occupancy data for a station
   * @param {string} stationId - Station ID
   * @param {number} hours - Number of hours to look back
   * @returns {Promise<Array>} Historical occupancy data
   */
  static async getHistoryForStation(stationId, hours = 24) {
    try {
      const result = await pool.query(`
        SELECT
          station_id,
          current_occupancy,
          occupancy_level,
          timestamp
        FROM paxdata
        WHERE station_id = $1
          AND timestamp > NOW() - INTERVAL '${hours} hours'
        ORDER BY timestamp
      `, [stationId]);

      return result.rows;
    } catch (error) {
      console.error(`Database error in Occupancy.getHistoryForStation for ${stationId}:`, error);
      throw error;
    }
  }

  /**
   * Record new occupancy data for a station
   * @param {string} stationId - Station ID
   * @param {number} occupancy - Current occupancy percentage
   * @returns {Promise<Object>} Created occupancy record
   */
  static async recordOccupancy(stationId, occupancy) {
    try {
      // Determine occupancy level based on percentage
      let occupancyLevel = 'niedrig';
      let occupancyIcon = '👤';
      
      if (occupancy >= 85) {
        occupancyLevel = 'sehr_hoch';
        occupancyIcon = '🚫👥👥👥';
      } else if (occupancy >= 70) {
        occupancyLevel = 'hoch';
        occupancyIcon = '👥👥👥';
      } else if (occupancy >= 40) {
        occupancyLevel = 'mittel';
        occupancyIcon = '👥';
      }

      const result = await pool.query(`
        INSERT INTO paxdata (station_id, current_occupancy, occupancy_level, occupancy_icon)
        VALUES ($1, $2, $3, $4)
        RETURNING *
      `, [stationId, occupancy, occupancyLevel, occupancyIcon]);

      return result.rows[0];
    } catch (error) {
      console.error(`Database error in Occupancy.recordOccupancy for ${stationId}:`, error);
      throw error;
    }
  }
}

module.exports = Occupancy;
