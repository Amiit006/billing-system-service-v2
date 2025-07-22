const mongoose = require("mongoose");

const seasonSchema = new mongoose.Schema({
  seasonId: { type: Number, required: true, unique: true },
  seasonName: { type: String, required: true },
  startDate: Date,
  endDate: Date,
  createdDate: Date,
  modifiedDate: Date,
});

module.exports = mongoose.model("Season", seasonSchema, "season");
