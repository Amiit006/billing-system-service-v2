const Season = require('./season.model');
const { isWithinRange } = require('../../../utils/dateUtils');

const getAllSeasons = async () => {
  return await Season.find().sort({ startDate: 1 });
};

const createSeason = async (input) => {
  const { seasonName, startDate, endDate } = input;

  if (new Date(startDate) > new Date(endDate)) {
    throw { status: 400, message: "End Date can't be before start Date" };
  }

  const existingByName = await Season.findOne({ seasonName });
  if (existingByName) {
    throw { status: 400, message: 'Season Name already exists' };
  }

  const existingSeasons = await getAllSeasons();
  for (let existing of existingSeasons) {
    if (
      isWithinRange(startDate, existing.startDate, existing.endDate) ||
      isWithinRange(endDate, existing.startDate, existing.endDate)
    ) {
      throw { status: 400, message: 'Season duration collides with other season' };
    }
  }

  const now = new Date();
  return await Season.create({
    seasonName,
    startDate,
    endDate,
    createdDate: now,
    modifiedDate: now,
  });
};

const updateSeason = async (seasonId, input) => {
  const { seasonName, startDate, endDate } = input;

  if (new Date(startDate) > new Date(endDate)) {
    throw { status: 400, message: "End Date can't be before start Date" };
  }

  const season = await Season.findById(seasonId);
  if (!season) {
    throw { status: 404, message: 'Season not present' };
  }

  if (season.seasonName === seasonName) {
    throw { status: 400, message: 'Season Name already exists' };
  }

  season.seasonName = seasonName;
  season.startDate = startDate;
  season.endDate = endDate;
  season.modifiedDate = new Date();

  return await season.save();
};

module.exports = {
  getAllSeasons,
  createSeason,
  updateSeason,
};
