const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  productId: {
    type: Number,
    required: true,
    unique: true,
  },
  productName: {
    type: String,
    required: true,
    trim: true,
  },
  category: {
    type: String,
    required: true,
    enum: ['Bottoms', 'Tops', 'Winter Products'],
  },
  subCategory: {
    type: String,
    required: true,
  },
  unit: {
    type: String,
    default: 'pieces',
  },
  // Future expansion fields
  gender: {
    type: String,
    enum: ['Men', 'Women', 'Unisex', 'Kids'],
    default: 'Men',
  },
  isActive: {
    type: Boolean,
    default: true,
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

// Index for better query performance
productSchema.index({ category: 1, subCategory: 1 });
productSchema.index({ productName: 1 });

module.exports = mongoose.model('Product', productSchema, 'products');
