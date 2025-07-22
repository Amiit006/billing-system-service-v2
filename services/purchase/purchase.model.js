const mongoose = require("mongoose");

const purchaseSchema = new mongoose.Schema({
  purchaseId: { type: Number, required: true, unique: true },
  partyName: { type: String, required: true },
  purchaseDate: { type: Date, required: true },
  purchaseAmount: { type: Number, required: true },
  packingCharge: { type: Number, default: 0.0 },
  taxPercent: { type: Number, required: true },
  taxAmount: { type: Number, required: true },
  discountPercent: { type: Number, required: true },
  discountAmount: { type: Number, required: true },
  extraDiscountAmount: { type: Number },
  seasonId: { type: Number, ref: "Season" },
  transportId: { type: Number, ref: "Transport" },
  createdDate: Date,
  modifiedDate: Date,
});

module.exports = mongoose.model("Purchase", purchaseSchema, "purchases");
