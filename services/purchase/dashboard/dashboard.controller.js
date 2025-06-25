const dashboardService = require('./dashboard.service');

const getDashboardStats = async (req, res) => {
    try {
      const { seasonId } = req.query;
      const result = await dashboardService.getDashboardStats(seasonId);
      res.status(200).json(result);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: err.message });
    }
  };

module.exports = {
    getDashboardStats,
};