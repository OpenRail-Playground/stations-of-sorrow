const { pool } = require('../config/db');

/**
 * Alternative model for finding alternative stations
 */
class Alternative {
  /**
   * Find alternative stations based on location and parameters
   * @param {number} lng - Longitude of start point
   * @param {number} lat - Latitude of start point
   * @param {number} radius - Search radius in kilometers
   * @param {Object} options - Additional search options
   * @returns {Promise<Array>} List of alternative stations
   */
  static async findAlternatives(lng, lat, radius, options = {}) {
    const { maxOccupancy, requireAccessible } = options;
    
    try {
      // Build query for alternatives with scoring
      let query = `
        SELECT 
          pm.id,
          pm.name,
          ST_X(pm.coordinates::geometry) as lng,
          ST_Y(pm.coordinates::geometry) as lat,
          ST_Distance(
            ST_Transform(pm.coordinates, 3857),
            ST_Transform(ST_SetSRID(ST_MakePoint($1, $2), 4326), 3857)
          ) / 1000 as distance_km,
          pm.beach_distance,
          pm.platforms,
          pm.accessible,
          pm.connections,
          pd.current_occupancy,
          pd.occupancy_level,
          w.temp,
          w.condition,
          w.beach_suitability,
          CASE 
            WHEN pd.current_occupancy < 40 THEN 30
            WHEN pd.current_occupancy < 70 THEN 20
            WHEN pd.current_occupancy < 85 THEN 10
            ELSE 0 
          END +
          CASE 
            WHEN pm.beach_distance < 500 THEN 25
            WHEN pm.beach_distance < 1000 THEN 20
            ELSE 10 
          END +
          CASE 
            WHEN pm.accessible THEN 15 
            ELSE 0 
          END +
          CASE 
            WHEN w.beach_suitability = 'sehr gut' THEN 20
            WHEN w.beach_suitability = 'gut' THEN 15
            ELSE 5 
          END as recommendation_score
        FROM pax_masterdata pm
        LEFT JOIN paxdata pd ON pm.id = pd.station_id
        LEFT JOIN weather w ON pm.id = w.station_id
        WHERE ST_DWithin(
          ST_Transform(pm.coordinates, 3857),
          ST_Transform(ST_SetSRID(ST_MakePoint($1, $2), 4326), 3857),
          $3 * 1000
        )
      `;

      // Add additional filters
      const params = [lng, lat, radius];
      
      if (maxOccupancy) {
        query += ` AND pd.current_occupancy <= $${params.length + 1}`;
        params.push(maxOccupancy);
      }
      
      if (requireAccessible) {
        query += ` AND pm.accessible = true`;
      }
      
      // Add order by and group by clauses for latest data
      query += `
        AND pd.timestamp = (
          SELECT MAX(timestamp) 
          FROM paxdata 
          WHERE station_id = pm.id
        )
        AND w.timestamp = (
          SELECT MAX(timestamp) 
          FROM weather 
          WHERE station_id = pm.id
        )
        ORDER BY recommendation_score DESC, distance_km ASC
      `;

      const result = await pool.query(query, params);
      return result.rows;
    } catch (error) {
      console.error('Database error in Alternative.findAlternatives:', error);
      throw error;
    }
  }
}

module.exports = Alternative;
