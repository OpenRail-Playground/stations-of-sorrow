const Alternative = require('../models/Alternative');

/**
 * Controller for finding alternative stations
 */
const alternativesController = {
  /**
   * Find alternative stations based on location and parameters
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async findAlternatives(req, res) {
    const { startLat, startLng, radius, maxOccupancy, requireAccessible } = req.body;

    // Validate required parameters
    if (!startLat || !startLng || !radius) {
      return res.status(400).json({
        success: false,
        message: 'startLat, startLng, and radius are required parameters'
      });
    }

    try {
      const options = {
        maxOccupancy,
        requireAccessible
      };

      const alternatives = await Alternative.findAlternatives(startLng, startLat, radius, options);

      res.json({
        success: true,
        count: alternatives.length,
        data: alternatives,
        searchParams: { startLat, startLng, radius, maxOccupancy, requireAccessible }
      });
    } catch (error) {
      console.error('Error finding alternative stations:', error);
      res.status(500).json({
        success: false,
        message: 'Error finding alternative stations',
        error: error.message
      });
    }
  }
};

module.exports = alternativesController;
