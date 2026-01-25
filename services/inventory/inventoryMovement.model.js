
// ===================================
// 4. INVENTORY MOVEMENT MODEL
// File: services/inventory/inventoryMovement.model.js
const mongoose = require('mongoose');

const inventoryMovementSchema = new mongoose.Schema({
  movementId: {
    type: Number,
    required: true,
    unique: true,
  },
  productId: {
    type: Number,
    required: true,
    ref: 'Product',
  },
  movementType: {
    type: String,
    required: true,
    enum: ['PURCHASE_IN', 'SALE_OUT', 'ADJUSTMENT'],
  },
  quantity: {
    type: Number,
    required: true, // +ve for in, -ve for out
  },
  costPerUnit: {
    type: Number,
    required: true,
  },
  totalValue: {
    type: Number,
    required: true,
  },
  referenceId: {
    type: Number, // purchaseId or invoiceId
  },
  referenceType: {
    type: String,
    enum: ['PURCHASE', 'INVOICE', 'ADJUSTMENT'],
  },
  balanceQuantity: {
    type: Number, // Quantity after this movement
  },
  balanceValue: {
    type: Number, // Value after this movement
  },
  remarks: {
    type: String,
  },
  movementDate: {
    type: Date,
    default: Date.now,
  },
  createdDate: {
    type: Date,
    default: Date.now,
  },
});

// Index for reporting
inventoryMovementSchema.index({ productId: 1, movementDate: -1 });
inventoryMovementSchema.index({ referenceId: 1, referenceType: 1 });

module.exports = mongoose.model('InventoryMovement', inventoryMovementSchema, 'inventorymovements');
