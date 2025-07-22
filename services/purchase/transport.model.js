const mongoose = require("mongoose");

const transportSchema = new mongoose.Schema({
  transportId: { type: Number, required: true, unique: true },
  transportName: { type: String, required: true },
  amount: { type: Number, required: true },
  consignmentNumber: { type: String },
});

module.exports = mongoose.model("Transport", transportSchema, "transport");
