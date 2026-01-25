// ===================================
// 2. ENHANCED INVOICE DETAILS MODEL
// File: services/billing/invoice/enhancedInvoiceDetails.model.js
const mongoose = require("mongoose");

// Update existing InvoiceDetails model to add profit fields
const enhancedInvoiceDetailsSchema = new mongoose.Schema({
  invoiceDetailsId: {
    type: Number,
    required: true,
    unique: true,
  },
  slNo: Number,
  perticulars: String,
  productId: Number,                    // NEW: Link to Product Master
  amount: Number,
  quanity: Number,
  discountPercentage: Number,
  total: Number,
  discountTotal: Number,
  quantityType: String,
  verified: Boolean,
  invoiceId: Number,
  
  // NEW: Profit tracking fields
  costPricePerUnit: {
    type: Number,
    default: 0
  },
  totalCostPrice: {
    type: Number, 
    default: 0
  },
  profitAmount: {
    type: Number,
    default: 0
  },
  profitPercentage: {
    type: Number,
    default: 0
  },
  
  createdDate: { type: Date, default: Date.now },
  modifiedDate: { type: Date, default: Date.now },
});

// Add indexes for better performance
enhancedInvoiceDetailsSchema.index({ invoiceId: 1 });
enhancedInvoiceDetailsSchema.index({ productId: 1 });

// Note: This would be an update to your existing model
// For backward compatibility, we'll add these fields as optional
module.exports = mongoose.model(
  "EnhancedInvoiceDetails",
  enhancedInvoiceDetailsSchema,
  "invoicedetails"  // Same collection as existing
);