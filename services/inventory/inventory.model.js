// ===================================
// 3. INVENTORY MODEL
// File: services/inventory/inventory.model.js
const mongoose = require('mongoose');

const inventorySchema = new mongoose.Schema({
  inventoryId: {
    type: Number,
    required: true,
    unique: true,
  },
  productId: {
    type: Number,
    required: true,
    ref: 'Product',
  },
  availableQuantity: {
    type: Number,
    default: 0,
  },
  weightedAverageCost: {
    type: Number,
    default: 0,
  },
  totalValue: {
    type: Number,
    default: 0,
  },
  lastUpdatedDate: {
    type: Date,
    default: Date.now,
  },
  createdDate: {
    type: Date,
    default: Date.now,
  },
});

// Index for better performance
inventorySchema.index({ productId: 1 });

module.exports = mongoose.model('Inventory', inventorySchema, 'inventory');