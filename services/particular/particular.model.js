// services/particular/particular.model.js
const mongoose = require('mongoose');

const ParticularSchema = new mongoose.Schema({
  particularName: {
    type: String,
    required: true,
    unique: true
  },
  discountPercentage: {
    type: Number,
    required: true
  }
}, { timestamps: true });

module.exports = mongoose.model('Particular', ParticularSchema);
