// client.model.js
const mongoose = require('mongoose');

const ClientAddressSchema = new mongoose.Schema({
  storeName: String,
  addressLine1: String,
  addressLine2: String,
  city: String,
  state: String,
  country: String,
  zip: String
}, { _id: false });

const ClientSchema = new mongoose.Schema({
  clientName: { type: String, required: true },
  mobile: { type: String },
  email: { type: String },
  gstNumber: { type: String },
  isActive: { type: Boolean, default: true },
  address: ClientAddressSchema
}, {
  timestamps: { createdAt: 'createdDate', updatedAt: 'modifiedDate' }
});

const Client = mongoose.model('Client', ClientSchema);

module.exports = Client;
