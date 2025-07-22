// services/purchase/season/season.service.js

const Season = require('./season.model');
const { isWithinRange } = require('../../../utils/dateUtils');

// Get all seasons sorted by startDate
const getAllSeasons = async () => {
  return await Season.find().sort({ startDate: 1 });
};

// Create a new season with manual seasonId
const createSeason = async (input) => {
  const { seasonName, startDate, endDate } = input;

  if (new Date(startDate) > new Date(endDate)) {
    throw { status: 400, message: "End Date can't be before start Date" };
  }

  // Check for duplicate season name
  const existingByName = await Season.findOne({ seasonName });
  if (existingByName) {
    throw { status: 400, message: 'Season Name already exists' };
  }

  // Check for overlapping dates
  const existingSeasons = await getAllSeasons();
  for (let existing of existingSeasons) {
    if (
      isWithinRange(startDate, existing.startDate, existing.endDate) ||
      isWithinRange(endDate, existing.startDate, existing.endDate)
    ) {
      throw { status: 400, message: 'Season duration collides with other season' };
    }
  }

  const lastSeason = await Season.findOne().sort({ seasonId: -1 }).lean();
  const nextSeasonId = lastSeason ? lastSeason.seasonId + 1 : 1;

  const now = new Date();

  return await Season.create({
    seasonId: nextSeasonId,
    seasonName,
    startDate,
    endDate,
    createdDate: now,
    modifiedDate: now,
  });
};

// Update an existing season by seasonId
const updateSeason = async (seasonId, input) => {
  const { seasonName, startDate, endDate } = input;

  if (new Date(startDate) > new Date(endDate)) {
    throw { status: 400, message: "End Date can't be before start Date" };
  }

  const season = await Season.findOne({ seasonId: parseInt(seasonId) });
  if (!season) {
    throw { status: 404, message: 'Season not present' };
  }

  // Prevent updating with duplicate season name
  const existingWithSameName = await Season.findOne({ seasonName });
  if (existingWithSameName && existingWithSameName.seasonId !== parseInt(seasonId)) {
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
