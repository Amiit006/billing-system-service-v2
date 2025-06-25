const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const paymentSchema = new Schema({
  amount: Number,
  paymentDate: Date,
  mode: String,
  chequeNo: String,
  remark: String,
  createdDate: Date,
  modifiedDate: Date,
  purchase: {
    type: Schema.Types.ObjectId,
    ref: 'Purchase',
  },
});

module.exports = mongoose.model('Payment', paymentSchema);
