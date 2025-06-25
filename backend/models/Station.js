const { pool } = require('../config/db');

/**
 * Station model for database operations related to stations
 */
class Station {
  /**
   * Get all stations with basic information
   * @returns {Promise<Array>} List of stations
   */
  static async getAll() {
    try {
      console.log('Fetching all stations...');
      const result = await pool.query(`
        SELECT 
          pm.id,
          pm.name,
          pm.lng,
          pm.lat,
          pm.beach_distance,
          pm.platforms,
          pm.accessible,
          pm.connections,
          pm.facilities
        FROM pax_masterdata pm
        ORDER BY pm.name
      `);

      // Debug the results
      console.log('Station query result:', result);

      // Handle empty results
      if (!result.rows) {
        console.log('No station rows found');
        return [];
      }
      
      // Parse JSON fields
      const rows = result.rows.map(row => {
        if (row.connections && typeof row.connections === 'string') {
          try {
            row.connections = JSON.parse(row.connections);
          } catch (e) {
            console.error('Error parsing connections JSON:', e);
          }
        }
        if (row.facilities && typeof row.facilities === 'string') {
          try {
            row.facilities = JSON.parse(row.facilities);
          } catch (e) {
            console.error('Error parsing facilities JSON:', e);
          }
        }
        return row;
      });

      return rows;
    } catch (error) {
      console.error('Database error in Station.getAll:', error);
      throw error;
    }
  }

  /**
   * Get a station by ID
   * @param {string} id - Station ID
   * @returns {Promise<Object>} Station data
   */
  static async getById(id) {
    try {
      const stationResult = await pool.query(`
        SELECT 
          pm.id,
          pm.name,
          pm.lng,
          pm.lat,
          pm.beach_distance,
          pm.platforms,
          pm.accessible,
          pm.connections,
          pm.facilities
        FROM pax_masterdata pm
        WHERE pm.id = ?
      `, [id]);

      if (stationResult.rows.length === 0) {
        return null;
      }

      return stationResult.rows[0];
    } catch (error) {
      console.error(`Database error in Station.getById for ${id}:`, error);
      throw error;
    }
  }

  /**
   * Find stations near a location
   * @param {number} lng - Longitude
   * @param {number} lat - Latitude
   * @param {number} radiusKm - Search radius in kilometers
   * @param {Object} options - Additional search options
   * @returns {Promise<Array>} List of stations within radius
   */
  static async findNear(lng, lat, radiusKm, options = {}) {
    try {
      // Simplified distance calculation for SQLite
      // Using the Haversine formula approximation directly in SQL
      let query = `
        SELECT 
          pm.id,
          pm.name,
          pm.lng,
          pm.lat,
          (6371 * acos(cos(radians(?)) * cos(radians(pm.lat)) * cos(radians(pm.lng) - radians(?)) + sin(radians(?)) * sin(radians(pm.lat)))) AS distance_km,
          pm.beach_distance,
          pm.platforms,
          pm.accessible,
          pm.connections
        FROM pax_masterdata pm
        WHERE (6371 * acos(cos(radians(?)) * cos(radians(pm.lat)) * cos(radians(pm.lng) - radians(?)) + sin(radians(?)) * sin(radians(pm.lat)))) < ?
      `;

      // Add additional filters based on options
      const params = [lat, lng, lat, lat, lng, lat, radiusKm];
      
      if (options.requireAccessible) {
        query += ` AND pm.accessible = 1`; // SQLite uses 1/0 for boolean
      }
      
      // Order by distance
      query += ` ORDER BY distance_km ASC`;

      const result = await pool.query(query, params);
      return result.rows;
    } catch (error) {
      console.error('Database error in Station.findNear:', error);
      throw error;
    }
  }
}

module.exports = Station;
