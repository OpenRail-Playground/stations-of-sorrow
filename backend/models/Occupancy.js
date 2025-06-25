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
      // For SQLite, let's simply get all records and handle the filtering in code
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
        ORDER BY pd.timestamp DESC
      `);

      // Debug output
      console.log(`Found ${result.rows.length} occupancy records`);
      
      // Get the most recent record for each station
      const latestOccupancies = {};
      if (result.rows && result.rows.length) {
        result.rows.forEach(row => {
          if (!latestOccupancies[row.station_id] || 
              (row.timestamp && latestOccupancies[row.station_id].timestamp && 
               new Date(row.timestamp) > new Date(latestOccupancies[row.station_id].timestamp))) {
            latestOccupancies[row.station_id] = row;
          }
        });
      }

      const occupancyData = Object.values(latestOccupancies);
      console.log(`Returning ${occupancyData.length} unique station occupancy records`);
      return occupancyData;
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
        WHERE station_id = ?
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
      // SQLite compatible time calculation
      const hoursAgo = new Date(Date.now() - hours * 60 * 60 * 1000).toISOString();
      
      const result = await pool.query(`
        SELECT
          station_id,
          current_occupancy,
          occupancy_level,
          timestamp
        FROM paxdata
        WHERE station_id = ?
          AND timestamp > ?
        ORDER BY timestamp
      `, [stationId, hoursAgo]);

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
        VALUES (?, ?, ?, ?)
      `, [stationId, occupancy, occupancyLevel, occupancyIcon]);
      
      // For SQLite we need to fetch the last inserted row manually
      const insertedId = await pool.query('SELECT last_insert_rowid() as id');
      const lastId = insertedId.rows[0].id;
      
      // Get the inserted record
      const insertedRow = await pool.query(`
        SELECT * FROM paxdata WHERE id = ?
      `, [lastId]);

      return insertedRow.rows[0];
    } catch (error) {
      console.error(`Database error in Occupancy.recordOccupancy for ${stationId}:`, error);
      throw error;
    }
  }
}

module.exports = Occupancy;
