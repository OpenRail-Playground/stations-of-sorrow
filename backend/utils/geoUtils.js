/**
 * Geospatial utility functions for station data
 */

/**
 * Calculate distance between two points using Haversine formula
 * @param {number} lat1 - Latitude of point 1
 * @param {number} lon1 - Longitude of point 1
 * @param {number} lat2 - Latitude of point 2
 * @param {number} lon2 - Longitude of point 2
 * @returns {number} Distance in kilometers
 */
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Radius of the earth in km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c; // Distance in km
  return distance;
}

/**
 * Convert degrees to radians
 * @param {number} deg - Degrees
 * @returns {number} Radians
 */
function deg2rad(deg) {
  return deg * (Math.PI / 180);
}

/**
 * Calculate recommendation score for a station
 * @param {Object} station - Station object with occupancy and facilities
 * @returns {number} Recommendation score
 */
function calculateRecommendationScore(station) {
  let score = 0;
  
  // Occupancy score (lower is better)
  if (station.current_occupancy < 40) {
    score += 30;
  } else if (station.current_occupancy < 70) {
    score += 20;
  } else if (station.current_occupancy < 85) {
    score += 10;
  }
  
  // Beach distance score (shorter is better)
  if (station.beach_distance < 500) {
    score += 25;
  } else if (station.beach_distance < 1000) {
    score += 20;
  } else {
    score += 10;
  }
  
  // Accessibility score
  if (station.accessible) {
    score += 15;
  }
  
  // Beach suitability score
  if (station.weather?.beach_suitability === 'sehr gut') {
    score += 20;
  } else if (station.weather?.beach_suitability === 'gut') {
    score += 15;
  } else {
    score += 5;
  }
  
  return score;
}

module.exports = {
  calculateDistance,
  calculateRecommendationScore
};
