const Occupancy = require('../models/Occupancy');

/**
 * Controller for managing occupancy data
 */
const occupancyController = {
  /**
   * Get current occupancy for all stations
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getCurrentOccupancy(req, res) {
    try {
      const occupancies = await Occupancy.getCurrentForAll();

      res.json({
        success: true,
        count: occupancies.length,
        data: occupancies
      });
    } catch (error) {
      console.error('Error fetching current occupancy:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching current occupancy',
        error: error.message
      });
    }
  },

  /**
   * Get historical occupancy data for a station
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getStationOccupancyHistory(req, res) {
    const { id } = req.params;
    const { hours = 24 } = req.query;
    
    try {
      const history = await Occupancy.getHistoryForStation(id, hours);

      res.json({
        success: true,
        count: history.length,
        data: history
      });
    } catch (error) {
      console.error(`Error fetching occupancy history for station ${id}:`, error);
      res.status(500).json({
        success: false,
        message: `Error fetching occupancy history for station ${id}`,
        error: error.message
      });
    }
  }
};

module.exports = occupancyController;
