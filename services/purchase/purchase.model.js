const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const purchaseSchema = new Schema({
  partyName: String,
  purchaseDate: Date,
  purchaseAmount: Number,
  packingCharge: Number,
  taxPercent: Number,
  taxAmount: Number,
  discountPercent: Number,
  discountAmount: Number,
  extraDiscountAmount: Number,

  season: { type: Schema.Types.ObjectId, ref: 'Season' },
  transport: {
    transportName: String,
    amount: Number,
    consignmentNumber: String
  },
  payments: [{ type: Schema.Types.ObjectId, ref: 'Payment' }],

  createdDate: Date,
  modifiedDate: Date,
});

module.exports = mongoose.model('Purchase', purchaseSchema);
