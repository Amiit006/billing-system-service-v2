const mongoose = require("mongoose");

const invoiceOverviewSchema = new mongoose.Schema({
  invoiceId: {
    type: Number,
    required: true,
    unique: true,
  },
  clientId: Number,
  paymentId: Number, // Reference to Payment.paymentId
  invoiceDate: Date,
  subTotalAmount: Number,
  taxPercentage: Number,
  taxAmount: Number,
  discountPercentage: Number,
  discountAmount: Number,
  grandTotalAmount: Number,
  remarks: String,
  createdDate: { type: Date, default: Date.now },
  modifiedDate: { type: Date, default: Date.now }
});

module.exports = mongoose.model(
  "InvoiceOverview",
  invoiceOverviewSchema,
  "invoiceoverview"
);
