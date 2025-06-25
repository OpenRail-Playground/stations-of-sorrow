/**
 * Deutsche Bahn API Service
 * Handles communication with Deutsche Bahn public APIs
 */
class DBApiService {
  /**
   * Initialize DB API Service
   * @param {string} clientId - DB API Client ID
   * @param {string} apiKey - DB API Key/Secret
   */
  constructor(clientId, apiKey) {
    this.clientId = clientId;
    this.apiKey = apiKey;
    this.baseURL = 'https://apis.deutschebahn.com/db-api-marketplace/apis';
  }

  /**
   * Format date and time for API requests
   * @param {Date} dateTime - Date object
   * @returns {string} Formatted date string YYMMDD/HH
   */
  formatDateTime(dateTime) {
    const year = dateTime.getFullYear().toString().slice(-2);
    const month = String(dateTime.getMonth() + 1).padStart(2, '0');
    const day = String(dateTime.getDate()).padStart(2, '0');
    const hour = String(dateTime.getHours()).padStart(2, '0');
    
    return `${year}${month}${day}/${hour}`;
  }

  /**
   * Get departures for a station
   * @param {string} evaNo - Station EVA number
   * @param {Date} dateTime - Date and time for departure
   * @returns {Promise<Object>} Station departures
   */
  async getStationDepartures(evaNo, dateTime = new Date()) {
    try {
      const response = await fetch(
        `${this.baseURL}/timetables/v1/plan/${evaNo}/${this.formatDateTime(dateTime)}`,
        {
          headers: {
            'DB-Client-Id': this.clientId,
            'DB-Api-Key': this.apiKey
          }
        }
      );

      if (!response.ok) {
        throw new Error(`DB API responded with status: ${response.status}`);
      }

      const data = await response.json();
      return {
        success: true,
        data
      };
    } catch (error) {
      console.error(`Error fetching departures for station ${evaNo}:`, error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Get real-time changes for a station
   * @param {string} evaNo - Station EVA number
   * @returns {Promise<Object>} Real-time changes
   */
  async getRealTimeChanges(evaNo) {
    try {
      const response = await fetch(
        `${this.baseURL}/timetables/v1/rchg/${evaNo}`,
        {
          headers: {
            'DB-Client-Id': this.clientId,
            'DB-Api-Key': this.apiKey
          }
        }
      );

      if (!response.ok) {
        throw new Error(`DB API responded with status: ${response.status}`);
      }

      const data = await response.json();
      return {
        success: true,
        data
      };
    } catch (error) {
      console.error(`Error fetching real-time changes for station ${evaNo}:`, error);
      return {
        success: false,
        error: error.message
      };
    }
  }
}

module.exports = DBApiService;
