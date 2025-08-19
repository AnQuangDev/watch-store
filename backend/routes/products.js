const express = require('express');
const router = express.Router();
const { 
  getAllProducts, 
  getProductById, 
  createProduct, 
  updateProduct, 
  deleteProduct, 
  productValidation 
} = require('../controllers/productController');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

// GET /api/products - Get all products (public)
router.get('/', getAllProducts);

// GET /api/products/:id - Get product by ID (public)
router.get('/:id', getProductById);

// POST /api/products - Create product (admin only)
router.post('/', authenticateToken, requireAdmin, productValidation, createProduct);

// PUT /api/products/:id - Update product (admin only)
router.put('/:id', authenticateToken, requireAdmin, productValidation, updateProduct);

// DELETE /api/products/:id - Delete product (admin only)
router.delete('/:id', authenticateToken, requireAdmin, deleteProduct);

module.exports = router;
