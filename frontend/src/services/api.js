/**
 * API Service for frontend
 * Handles communication with backend API
 */
class ApiService {
  /**
   * Initialize the API Service
   * @param {string} baseUrl - Base URL for API
   */
  constructor(baseUrl = '/api/v1') {
    this.baseUrl = baseUrl;
    this.socket = null;
  }

  /**
   * Initialize WebSocket connection
   * @returns {Object} Socket.IO connection
   */
  initWebSocket() {
    if (!this.socket) {
      // Load Socket.IO client from CDN if needed
      if (!window.io) {
        console.error('Socket.IO client not loaded');
        return null;
      }
      
      this.socket = io();
      
      // Setup reconnection
      this.socket.on('disconnect', () => {
        console.log('Socket disconnected. Attempting to reconnect...');
      });
      
      this.socket.on('connect', () => {
        console.log('Socket connected successfully');
      });
    }
    
    return this.socket;
  }

  /**
   * Fetch all stations
   * @returns {Promise<Object>} Stations data
   */
  async getStations() {
    try {
      const response = await fetch(`${this.baseUrl}/stations`);
      
      if (!response.ok) {
        throw new Error(`API responded with status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching stations:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Fetch a single station by ID
   * @param {string} stationId - Station ID
   * @returns {Promise<Object>} Station data
   */
  async getStationById(stationId) {
    try {
      const response = await fetch(`${this.baseUrl}/stations/${stationId}`);
      
      if (!response.ok) {
        throw new Error(`API responded with status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error(`Error fetching station ${stationId}:`, error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get current occupancy data for all stations
   * @returns {Promise<Object>} Occupancy data
   */
  async getCurrentOccupancy() {
    try {
      const response = await fetch(`${this.baseUrl}/occupancy`);
      
      if (!response.ok) {
        throw new Error(`API responded with status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching occupancy data:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Find alternative stations based on location and parameters
   * @param {number} startLat - Starting latitude
   * @param {number} startLng - Starting longitude
   * @param {number} radius - Search radius in km
   * @param {Object} options - Additional search options
   * @returns {Promise<Object>} Alternative stations
   */
  async findAlternatives(startLat, startLng, radius, options = {}) {
    try {
      const response = await fetch(`${this.baseUrl}/alternatives`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          startLat,
          startLng,
          radius,
          ...options
        })
      });
      
      if (!response.ok) {
        throw new Error(`API responded with status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error finding alternative stations:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Subscribe to real-time station occupancy updates
   * @param {string} stationId - Station ID
   * @param {Function} callback - Callback function for updates
   */
  subscribeToStationUpdates(stationId, callback) {
    if (!this.socket) {
      this.initWebSocket();
    }
    
    // Join the station's room
    this.socket.emit('subscribe_station', stationId);
    
    // Listen for occupancy updates
    this.socket.on('occupancy_update', (data) => {
      if (data.stationId === stationId) {
        callback(data);
      }
    });
  }

  /**
   * Subscribe to alternative stations updates
   * @param {Object} searchParams - Search parameters
   * @param {Function} callback - Callback function for updates
   */
  subscribeToAlternativesUpdates(searchParams, callback) {
    if (!this.socket) {
      this.initWebSocket();
    }
    
    // Join the alternatives search room
    this.socket.emit('subscribe_alternatives', searchParams);
    
    // Listen for alternatives updates
    this.socket.on('alternatives_update', callback);
  }

  /**
   * Get calendar data for a date range
   * @param {string} start - Start date (YYYY-MM-DD)
   * @param {string} end - End date (YYYY-MM-DD)
   * @returns {Promise<Object>} Calendar data
   */
  async getCalendarData(start, end) {
    try {
      const url = new URL(`${this.baseUrl}/calendar`);
      
      if (start) url.searchParams.append('start', start);
      if (end) url.searchParams.append('end', end);
      
      const response = await fetch(url.toString());
      
      if (!response.ok) {
        throw new Error(`API responded with status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching calendar data:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Add a calendar entry
   * @param {Object} calendarData - Calendar entry data
   * @returns {Promise<Object>} Created calendar entry
   */
  async addCalendarEntry(calendarData) {
    try {
      const response = await fetch(`${this.baseUrl}/calendar`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(calendarData)
      });
      
      if (!response.ok) {
        throw new Error(`API responded with status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error adding calendar entry:', error);
      return { success: false, error: error.message };
    }
  }
}

// Export for use in app.js
window.ApiService = ApiService;
