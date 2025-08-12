// ===================================
// 7. DATA INITIALIZATION SCRIPT
// File: scripts/initializeProductData.js
const mongoose = require('mongoose');
const Product = require('../services/product/product.model');
const ProductCategory = require('../services/product/productCategory.model');
require('dotenv').config();

async function initializeProductData() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // 1. Initialize Categories
    const categories = [
      {
        categoryId: 1,
        categoryName: "Bottoms",
        subCategories: ["Jeans", "Formal Trousers", "Cotton Trousers"]
      },
      {
        categoryId: 2,
        categoryName: "Tops",
        subCategories: ["Shirts", "T-Shirts"]
      },
      {
        categoryId: 3,
        categoryName: "Winter Products",
        subCategories: ["Jackets", "Sweaters", "Hoodies"]
      }
    ];

    for (const category of categories) {
      const existing = await ProductCategory.findOne({ categoryId: category.categoryId });
      if (!existing) {
        await ProductCategory.create(category);
        console.log(`Created category: ${category.categoryName}`);
      }
    }

    // 2. Initialize Basic Products from existing particulars
    const basicProducts = [
      { productName: "Shirts", category: "Tops", subCategory: "Shirts" },
      { productName: "T-Shirts", category: "Tops", subCategory: "T-Shirts" },
      { productName: "Jeans", category: "Bottoms", subCategory: "Jeans" },
      { productName: "Formal Trousers", category: "Bottoms", subCategory: "Formal Trousers" },
      { productName: "Cotton Trousers", category: "Bottoms", subCategory: "Cotton Trousers" },
      { productName: "Jackets", category: "Winter Products", subCategory: "Jackets" },
      { productName: "Sweaters", category: "Winter Products", subCategory: "Sweaters" },
      { productName: "Hoodies", category: "Winter Products", subCategory: "Hoodies" },
    ];

    let productId = 1;
    for (const product of basicProducts) {
      const existing = await Product.findOne({ productName: product.productName });
      if (!existing) {
        await Product.create({
          productId: productId++,
          ...product,
          unit: "pieces",
          gender: "Men",
          isActive: true
        });
        console.log(`Created product: ${product.productName}`);
      }
    }

    console.log('Product data initialization completed!');
    process.exit(0);
  } catch (error) {
    console.error('Error initializing product data:', error);
    process.exit(1);
  }
}

// Run the initialization
initializeProductData();