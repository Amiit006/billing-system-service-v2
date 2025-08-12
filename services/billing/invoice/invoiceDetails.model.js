const mongoose = require("mongoose");

const invoiceDetailsSchema = new mongoose.Schema({
  invoiceDetailsId: {
    type: Number,
    required: true,
    unique: true,
  },
  slNo: Number,
  perticulars: String,
  amount: Number,
  quanity: Number,
  discountPercentage: Number,
  total: Number,
  discountTotal: Number,
  quantityType: String,
  verified: Boolean,
  invoiceId: Number,
  createdDate: { type: Date, default: Date.now },
  modifiedDate: { type: Date, default: Date.now },
  // Add these fields to existing schema
  productId: { type: Number, default: null },
  costPricePerUnit: { type: Number, default: 0 },
  totalCostPrice: { type: Number, default: 0 },
  profitAmount: { type: Number, default: 0 },
  profitPercentage: { type: Number, default: 0 },
});

module.exports = mongoose.model(
  "InvoiceDetails",
  invoiceDetailsSchema,
  "invoicedetails"
);
