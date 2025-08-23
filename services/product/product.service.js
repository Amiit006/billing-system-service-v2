// ===================================
// DAYS 3-4: SERVICES IMPLEMENTATION
// ===================================

// ===================================
// 1. PRODUCT MASTER SERVICE
// File: services/product/product.service.js
const Product = require('./product.model');
const ProductCategory = require('./productCategory.model');

class ProductService {
  
  // Get all products with filtering
  async getAllProducts(filters = {}) {
    const query = { isActive: true };
    
    if (filters.category) query.category = filters.category;
    if (filters.subCategory) query.subCategory = filters.subCategory;
    if (filters.gender) query.gender = filters.gender;
    if (filters.search) {
      query.productName = { $regex: filters.search, $options: 'i' };
    }

    return await Product.find(query).sort({ productName: 1 });
  }

  // Get product by ID
  async getProductById(productId) {
    const product = await Product.findOne({ productId, isActive: true });
    if (!product) {
      const error = new Error('Product not found');
      error.status = 404;
      throw error;
    }
    return product;
  }

  // Create new product
  async createProduct(productData) {
    try {
      // Check if product already exists
      const existing = await Product.findOne({ 
        productName: productData.productName,
        isActive: true 
      });
      
      if (existing) {
        const error = new Error('Product already exists');
        error.status = 409;
        throw error;
      }

      // Validate category
      await this.validateCategory(productData.category, productData.subCategory);

      // Get next product ID
      const lastProduct = await Product.findOne().sort({ productId: -1 });
      const nextProductId = lastProduct ? lastProduct.productId + 1 : 1;

      const product = new Product({
        productId: nextProductId,
        ...productData,
        unit: productData.unit || 'pieces',
        gender: productData.gender || 'Men',
        createdDate: new Date(),
        modifiedDate: new Date()
      });

      return await product.save();
    } catch (error) {
      throw error;
    }
  }

  // Update product
  async updateProduct(productId, updateData) {
    try {
      const product = await Product.findOne({ productId, isActive: true });
      if (!product) {
        const error = new Error('Product not found');
        error.status = 404;
        throw error;
      }

      // Validate category if being updated
      if (updateData.category || updateData.subCategory) {
        await this.validateCategory(
          updateData.category || product.category,
          updateData.subCategory || product.subCategory
        );
      }

      // Check for duplicate name if updating name
      if (updateData.productName && updateData.productName !== product.productName) {
        const existing = await Product.findOne({ 
          productName: updateData.productName,
          productId: { $ne: productId },
          isActive: true 
        });
        
        if (existing) {
          const error = new Error('Product name already exists');
          error.status = 409;
          throw error;
        }
      }

      Object.assign(product, updateData, { modifiedDate: new Date() });
      return await product.save();
    } catch (error) {
      throw error;
    }
  }

  // Soft delete product
  async deleteProduct(productId) {
    const product = await Product.findOne({ productId, isActive: true });
    if (!product) {
      const error = new Error('Product not found');
      error.status = 404;
      throw error;
    }

    product.isActive = false;
    product.modifiedDate = new Date();
    await product.save();
    return true;
  }

  // Get all categories
  async getAllCategories() {
    return await ProductCategory.find({ isActive: true }).sort({ categoryName: 1 });
  }

  // Get products by category
  async getProductsByCategory(category) {
    return await Product.find({ category, isActive: true }).sort({ productName: 1 });
  }

  // Search products (for autocomplete)
  async searchProducts(searchTerm) {
    return await Product.find({
      productName: { $regex: searchTerm, $options: 'i' },
      isActive: true
    }).limit(10);
  }

  // Map particular name to product (for migration)
  async mapParticularToProduct(particularName) {
    // Try exact match first
    let product = await Product.findOne({ 
      productName: particularName,
      isActive: true 
    });

    if (product) return product;

    // Try fuzzy match
    product = await Product.findOne({
      productName: { $regex: particularName, $options: 'i' },
      isActive: true
    });

    if (product) return product;

    // Create generic product if not found
    return await this.createGenericProduct(particularName);
  }

  // Create generic product for unmapped particulars
  async createGenericProduct(particularName) {
    const lastProduct = await Product.findOne().sort({ productId: -1 });
    const nextProductId = lastProduct ? lastProduct.productId + 1 : 1;

    const product = new Product({
      productId: nextProductId,
      productName: particularName,
      category: "Tops", // Default category
      subCategory: "Shirts", // Default subcategory
      unit: "pieces",
      gender: "Men",
      isActive: true
    });

    return await product.save();
  }

  // Validate category and subcategory
  async validateCategory(category, subCategory) {
    const categoryDoc = await ProductCategory.findOne({ 
      categoryName: category,
      isActive: true 
    });

    if (!categoryDoc) {
      const error = new Error('Invalid category');
      error.status = 400;
      throw error;
    }

    if (!categoryDoc.subCategories.includes(subCategory)) {
      const error = new Error('Invalid subcategory for this category');
      error.status = 400;
      throw error;
    }

    return true;
  }
}

module.exports = new ProductService();