const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const transportSchema = new Schema({
  transportName: String,
  amount: Number,
  consignmentNumber: String,
});

module.exports = mongoose.model('Transport', transportSchema);
