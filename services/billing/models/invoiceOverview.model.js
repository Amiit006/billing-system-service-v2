const mongoose = require('mongoose');

const invoiceOverviewSchema = new mongoose.Schema({
  clientId: String,
  payment: { type: mongoose.Schema.Types.ObjectId, ref: 'Payment' },
  invoiceDate: Date,
  subTotalAmount: Number,
  taxPercentage: Number,
  taxAmount: Number,
  discountPercentage: Number,
  discountAmount: Number,
  grandTotalAmount: Number,
  remarks: String,
  createdDate: { type: Date, default: Date.now },
  modifiedDate: { type: Date, default: Date.now },
  invoiceDetails: [{ type: mongoose.Schema.Types.ObjectId, ref: 'InvoiceDetails' }]
});

module.exports = mongoose.model('InvoiceOverview', invoiceOverviewSchema);
