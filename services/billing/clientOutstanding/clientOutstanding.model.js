const mongoose = require('mongoose');

const clientOutstandingSchema = new mongoose.Schema({
  clientId: { type: Number, required: true, unique: true },
  purchasedAmount: { type: Number, default: 0 },
  paymentAmount: { type: Number, default: 0 },
  modifiedDate: { type: Date, default: Date.now }
});

module.exports = mongoose.model('ClientOutstanding', clientOutstandingSchema);