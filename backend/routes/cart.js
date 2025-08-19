const express = require('express');
const router = express.Router();
const { 
  getCart, 
  addToCart, 
  updateCartItem, 
  removeFromCart, 
  clearCart 
} = require('../controllers/cartController');
const { authenticateToken } = require('../middleware/auth');

// GET /api/cart - Get user's cart
router.get('/', authenticateToken, getCart);

// POST /api/cart/add - Add item to cart
router.post('/add', authenticateToken, addToCart);

// PUT /api/cart/update - Update cart item quantity
router.put('/update', authenticateToken, updateCartItem);

// DELETE /api/cart/remove/:productId - Remove item from cart
router.delete('/remove/:productId', authenticateToken, removeFromCart);

// DELETE /api/cart/clear - Clear cart
router.delete('/clear', authenticateToken, clearCart);

module.exports = router;
