// ===================================
// 5. PROFIT TRACKING MODEL
// File: services/profit/profit.model.js
const mongoose = require('mongoose');

const saleProfitSchema = new mongoose.Schema({
  profitId: {
    type: Number,
    required: true,
    unique: true,
  },
  invoiceId: {
    type: Number,
    required: true,
  },
  invoiceDetailsId: {
    type: Number,
    required: true,
  },
  productId: {
    type: Number,
    required: true,
    ref: 'Product',
  },
  clientId: {
    type: Number,
    required: true,
  },
  quantitySold: {
    type: Number,
    required: true,
  },
  sellingPricePerUnit: {
    type: Number,
    required: true,
  },
  costPricePerUnit: {
    type: Number,
    required: true,
  },
  totalRevenue: {
    type: Number,
    required: true,
  },
  totalCost: {
    type: Number,
    required: true,
  },
  grossProfit: {
    type: Number,
    required: true,
  },
  profitPercentage: {
    type: Number,
    required: true,
  },
  saleDate: {
    type: Date,
    required: true,
  },
  createdDate: {
    type: Date,
    default: Date.now,
  },
});

// Index for reporting
saleProfitSchema.index({ productId: 1, saleDate: -1 });
saleProfitSchema.index({ invoiceId: 1 });
saleProfitSchema.index({ clientId: 1, saleDate: -1 });

module.exports = mongoose.model('SaleProfit', saleProfitSchema, 'saleprofits');