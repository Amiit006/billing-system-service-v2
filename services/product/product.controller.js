// ===================================
// 2. PRODUCT CONTROLLER
// File: services/product/product.controller.js
const productService = require('./product.service');

class ProductController {
  
  // GET /products
  async getAllProducts(req, res) {
    try {
      const filters = {
        category: req.query.category,
        subCategory: req.query.subCategory,
        gender: req.query.gender,
        search: req.query.search
      };

      const products = await productService.getAllProducts(filters);
      res.status(200).json({
        success: true,
        data: products,
        count: products.length
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  // GET /products/:id
  async getProductById(req, res) {
    try {
      const productId = parseInt(req.params.id);
      const product = await productService.getProductById(productId);
      
      res.status(200).json({
        success: true,
        data: product
      });
    } catch (error) {
      res.status(error.status || 500).json({
        success: false,
        message: error.message
      });
    }
  }

  // POST /products
  async createProduct(req, res) {
    try {
      const product = await productService.createProduct(req.body);
      
      res.status(201).json({
        success: true,
        data: product,
        message: 'Product created successfully'
      });
    } catch (error) {
      res.status(error.status || 500).json({
        success: false,
        message: error.message
      });
    }
  }

  // PUT /products/:id
  async updateProduct(req, res) {
    try {
      const productId = parseInt(req.params.id);
      const product = await productService.updateProduct(productId, req.body);
      
      res.status(200).json({
        success: true,
        data: product,
        message: 'Product updated successfully'
      });
    } catch (error) {
      res.status(error.status || 500).json({
        success: false,
        message: error.message
      });
    }
  }

  // DELETE /products/:id
  async deleteProduct(req, res) {
    try {
      const productId = parseInt(req.params.id);
      await productService.deleteProduct(productId);
      
      res.status(200).json({
        success: true,
        message: 'Product deleted successfully'
      });
    } catch (error) {
      res.status(error.status || 500).json({
        success: false,
        message: error.message
      });
    }
  }

  // GET /products/categories
  async getAllCategories(req, res) {
    try {
      const categories = await productService.getAllCategories();
      res.status(200).json({
        success: true,
        data: categories
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  // GET /products/category/:category
  async getProductsByCategory(req, res) {
    try {
      const category = req.params.category;
      const products = await productService.getProductsByCategory(category);
      
      res.status(200).json({
        success: true,
        data: products,
        count: products.length
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  // GET /products/search/:term
  async searchProducts(req, res) {
    try {
      const searchTerm = req.params.term;
      const products = await productService.searchProducts(searchTerm);
      
      res.status(200).json({
        success: true,
        data: products
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }
}

module.exports = new ProductController();