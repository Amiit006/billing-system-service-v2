const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  paymentId: { 
    type: Number, 
    required: true, 
    unique: true 
  },
  clientId: Number,
  amount: Number,
  paymentMode: String,
  paymentDate: Date,
  createdDate: { type: Date, default: Date.now },
  modifiedDate: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Payment', paymentSchema, 'payment');