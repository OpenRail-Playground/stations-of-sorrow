const Occupancy = require('../models/Occupancy');
const Weather = require('../models/Weather');

/**
 * Service for simulating data updates in development
 */
class DataUpdaterService {
  /**
   * Initialize the data updater service
   * @param {Object} realtimeService - Realtime service instance for emitting updates
   */
  constructor(realtimeService) {
    this.realtimeService = realtimeService;
    this.updateIntervals = {};
  }

  /**
   * Start periodic data updates for all stations
   * @param {Array} stations - List of station IDs
   */
  startPeriodicUpdates(stations) {
    // Stop any existing update intervals
    this.stopAllUpdates();
    
    // Set up new interval for each station
    stations.forEach(stationId => {
      // Update every 1-3 minutes with random variance
      const updateInterval = Math.floor(Math.random() * 2 * 60 * 1000) + 60 * 1000;
      
      this.updateIntervals[stationId] = setInterval(() => {
        this.updateStationData(stationId);
      }, updateInterval);
      
      // Initial update
      this.updateStationData(stationId);
    });
    
    console.log(`Started periodic updates for ${stations.length} stations`);
  }

  /**
   * Stop all periodic updates
   */
  stopAllUpdates() {
    Object.values(this.updateIntervals).forEach(interval => {
      clearInterval(interval);
    });
    
    this.updateIntervals = {};
  }

  /**
   * Update data for a specific station
   * @param {string} stationId - Station ID
   */
  async updateStationData(stationId) {
    try {
      // Generate simulated occupancy changes (fluctuating by ±10%)
      const occupancyChange = Math.floor(Math.random() * 20) - 10;
      let newOccupancy;
      
      // Get current occupancy
      const currentOccupancy = await Occupancy.getCurrentForStation(stationId);
      
      if (currentOccupancy) {
        newOccupancy = Math.max(5, Math.min(100, currentOccupancy.current_occupancy + occupancyChange));
      } else {
        // Default value if no current occupancy data
        newOccupancy = Math.floor(Math.random() * 80) + 10;
      }
      
      // Record new occupancy
      const occupancyData = await Occupancy.recordOccupancy(stationId, newOccupancy);
      
      // Emit real-time update
      if (this.realtimeService) {
        this.realtimeService.emitOccupancyUpdate(stationId, occupancyData);
      }
      
      // Randomly update weather data (less frequently)
      if (Math.random() < 0.3) {
        this.updateWeatherData(stationId);
      }
      
      console.log(`Updated data for station ${stationId} - Occupancy: ${newOccupancy}%`);
    } catch (error) {
      console.error(`Error updating data for station ${stationId}:`, error);
    }
  }

  /**
   * Update weather data for a station
   * @param {string} stationId - Station ID
   */
  async updateWeatherData(stationId) {
    try {
      const weatherConditions = ['sonnig', 'heiter', 'bewölkt', 'leicht bewölkt', 'regnerisch', 'windig'];
      const currentWeather = await Weather.getCurrentForStation(stationId);
      
      // Generate simulated weather changes
      let temp = currentWeather ? currentWeather.temp : 18;
      temp += Math.floor(Math.random() * 3) - 1; // Change by -1, 0, or +1 degree
      
      const wind = Math.floor(Math.random() * 20) + 5;
      const condition = weatherConditions[Math.floor(Math.random() * weatherConditions.length)];
      
      const weatherData = { temp, wind, condition };
      const updatedWeather = await Weather.recordWeather(stationId, weatherData);
      
      // Emit real-time update
      if (this.realtimeService) {
        this.realtimeService.emitWeatherUpdate(stationId, updatedWeather);
      }
      
      console.log(`Updated weather for station ${stationId} - Temp: ${temp}°C, Condition: ${condition}`);
    } catch (error) {
      console.error(`Error updating weather for station ${stationId}:`, error);
    }
  }
}

module.exports = DataUpdaterService;
