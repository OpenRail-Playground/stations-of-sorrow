/**
 * Real-time service for WebSocket updates
 */
class RealtimeService {
  /**
   * Initialize the realtime service with socket.io
   * @param {Object} io - Socket.io server instance
   */
  constructor(io) {
    this.io = io;
  }

  /**
   * Emit occupancy update for a station
   * @param {string} stationId - Station ID
   * @param {Object} occupancyData - Updated occupancy data
   */
  emitOccupancyUpdate(stationId, occupancyData) {
    // Emit to all clients subscribed to this station's updates
    this.io.to(`station_${stationId}`).emit('occupancy_update', {
      stationId,
      ...occupancyData
    });
    
    // Also emit to all clients viewing the occupancy list
    this.io.emit('occupancy_list_update', {
      stationId,
      ...occupancyData
    });
  }

  /**
   * Emit weather update for a station
   * @param {string} stationId - Station ID
   * @param {Object} weatherData - Updated weather data
   */
  emitWeatherUpdate(stationId, weatherData) {
    this.io.to(`station_${stationId}`).emit('weather_update', {
      stationId,
      ...weatherData
    });
  }

  /**
   * Emit alternatives update for a search
   * @param {Object} searchParams - Search parameters
   * @param {Array} alternatives - Alternative stations
   */
  emitAlternativesUpdate(searchParams, alternatives) {
    const searchId = JSON.stringify(searchParams);
    this.io.to(`alternatives_${searchId}`).emit('alternatives_update', {
      searchParams,
      alternatives
    });
  }

  /**
   * Emit new congestion data
   * @param {string} stationId - Station ID
   * @param {Object} congestionData - Updated congestion data
   */
  emitCongestionUpdate(stationId, congestionData) {
    this.io.to(`station_${stationId}`).emit('congestion_update', {
      stationId,
      ...congestionData
    });
  }

  /**
   * Emit system notification to all clients
   * @param {Object} notification - Notification data
   */
  emitSystemNotification(notification) {
    this.io.emit('system_notification', notification);
  }
}

module.exports = RealtimeService;
