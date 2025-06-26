const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  clientId: String,
  amount: Number,
  paymentMode: String,
  paymentDate: Date,
  createdDate: { type: Date, default: Date.now },
  modifiedDate: { type: Date, default: Date.now },
  invoiceOverView: { type: mongoose.Schema.Types.ObjectId, ref: 'InvoiceOverview' }
});

module.exports = mongoose.model('Payment', paymentSchema);
