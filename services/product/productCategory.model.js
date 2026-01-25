// ===================================
// 2. PRODUCT CATEGORY MODEL (Helper)
// File: services/product/productCategory.model.js
const mongoose = require('mongoose');

const productCategorySchema = new mongoose.Schema({
  categoryId: {
    type: Number,
    required: true,
    unique: true,
  },
  categoryName: {
    type: String,
    required: true,
    unique: true,
  },
  subCategories: [{
    type: String,
  }],
  isActive: {
    type: Boolean,
    default: true,
  },
  createdDate: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('ProductCategory', productCategorySchema, 'productcategories');