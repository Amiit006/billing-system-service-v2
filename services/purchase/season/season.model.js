const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const seasonSchema = new Schema({
  seasonName: String,
  startDate: Date,
  endDate: Date,
  createdDate: Date,
  modifiedDate: Date,
});

module.exports = mongoose.model('Season', seasonSchema);
