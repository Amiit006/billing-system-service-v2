const seasonService = require('./season.service');

const getAllSeasons = async (req, res) => {
  try {
    const seasons = await seasonService.getAllSeasons();
    res.status(200).json(seasons);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch seasons' });
  }
};

const createSeason = async (req, res) => {
  try {
    const result = await seasonService.createSeason(req.body);
    res.status(200).json(result);
  } catch (err) {
    res.status(err.status || 500).json({ message: err.message || 'Something went wrong' });
  }
};

const updateSeason = async (req, res) => {
  try {
    const { seasonId } = req.query;
    const result = await seasonService.updateSeason(seasonId, req.body);
    res.status(200).json(result);
  } catch (err) {
    res.status(err.status || 500).json({ message: err.message || 'Something went wrong' });
  }
};

module.exports = {
  getAllSeasons,
  createSeason,
  updateSeason,
};
