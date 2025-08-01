const mongoose = require('mongoose');

const clientOutstandingHistorySchema = new mongoose.Schema({
  clientId: { type: Number, required: true },
  purchasedAmount: { type: Number, default: 0 },
  paymentAmount: { type: Number, default: 0 },
  createdDate: { type: Date, default: Date.now }
});

module.exports = mongoose.model('ClientOutstandingHistory', clientOutstandingHistorySchema, 'clientoutstandinghistory');
