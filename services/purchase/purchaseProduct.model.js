// ===================================
// 6. ENHANCED PURCHASE MODEL
// File: services/purchase/purchaseProduct.model.js
const mongoose = require('mongoose');

const purchaseProductSchema = new mongoose.Schema({
  purchaseProductId: {
    type: Number,
    required: true,
    unique: true,
  },
  purchaseId: {
    type: Number,
    required: true,
    ref: 'Purchase',
  },
  productId: {
    type: Number,
    required: true,
    ref: 'Product',
  },
  productName: {
    type: String,
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
  },
  ratePerUnit: {
    type: Number,
    required: true,
  },
  totalAmount: {
    type: Number,
    required: true,
  },
  percentageOfPurchase: {
    type: Number,
    required: true,
  },
  allocatedTax: {
    type: Number,
    default: 0,
  },
  allocatedTransport: {
    type: Number,
    default: 0,
  },
  allocatedPackingCharge: {
    type: Number,
    default: 0,
  },
  totalAllocatedOverhead: {
    type: Number,
    default: 0,
  },
  finalCostPerUnit: {
    type: Number,
    required: true,
  },
  createdDate: {
    type: Date,
    default: Date.now,
  },
  modifiedDate: {
    type: Date,
    default: Date.now,
  },
});

// Index for queries
purchaseProductSchema.index({ purchaseId: 1 });
purchaseProductSchema.index({ productId: 1 });

module.exports = mongoose.model('PurchaseProduct', purchaseProductSchema, 'purchaseproducts');