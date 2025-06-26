const mongoose = require('mongoose');

const invoiceDetailsSchema = new mongoose.Schema({
  slNo: Number,
  perticulars: String,
  amount: Number,
  quanity: Number,
  discountPercentage: Number,
  total: Number,
  discountTotal: Number,
  quantityType: String,
  verified: Boolean,
  invoiceId: { type: mongoose.Schema.Types.ObjectId, ref: 'InvoiceOverview' },
  createdDate: { type: Date, default: Date.now },
  modifiedDate: { type: Date, default: Date.now }
});

module.exports = mongoose.model('InvoiceDetails', invoiceDetailsSchema);
