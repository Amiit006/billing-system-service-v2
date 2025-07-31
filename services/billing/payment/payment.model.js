const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  paymentId: {
    type: Number,
    required: true,
    unique: true, // Mirrors AUTO_INCREMENT
  },
  clientId: {
    type: Number,
  },
  amount: {
    type: Number,
  },
  paymentMode: {
    type: String,
    maxlength: 20,
  },
  paymentDate: {
    type: Date,
  },
  createdDate: {
    type: Date,
  },
  modifiedDate: {
    type: Date,
  }
}, {
  collection: 'payment'
});

module.exports = mongoose.model('Payment', paymentSchema);
