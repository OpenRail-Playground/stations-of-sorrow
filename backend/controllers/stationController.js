const Station = require('../models/Station');
const Occupancy = require('../models/Occupancy');
const Weather = require('../models/Weather');

/**
 * Controller for managing station data
 */
const stationController = {
  /**
   * Get all stations
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getAllStations(req, res) {
    try {
      const stations = await Station.getAll();

      res.json({
        success: true,
        count: stations.length,
        data: stations
      });
    } catch (error) {
      console.error('Error fetching stations:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching stations',
        error: error.message
      });
    }
  },

  /**
   * Get a single station by ID
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getStationById(req, res) {
    const { id } = req.params;

    try {
      // Get station basic info
      const station = await Station.getById(id);

      if (!station) {
        return res.status(404).json({
          success: false,
          message: `Station with ID ${id} not found`
        });
      }

      // Get latest occupancy data
      const occupancy = await Occupancy.getCurrentForStation(id);

      // Get weather data
      const weather = await Weather.getCurrentForStation(id);

      // Combine and return
      const stationData = {
        ...station,
        occupancy,
        weather
      };

      res.json({
        success: true,
        data: stationData
      });
    } catch (error) {
      console.error(`Error fetching station ${id}:`, error);
      res.status(500).json({
        success: false,
        message: `Error fetching station ${id}`,
        error: error.message
      });
    }
  }
};

module.exports = stationController;
