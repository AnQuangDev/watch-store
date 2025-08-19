const express = require('express');
const router = express.Router();
const { 
  createOrder, 
  getUserOrders, 
  getOrderById, 
  getAllOrders, 
  updateOrderStatus 
} = require('../controllers/orderController');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

// POST /api/orders - Create new order
router.post('/', authenticateToken, createOrder);

// GET /api/orders - Get user's orders
router.get('/', authenticateToken, getUserOrders);

// GET /api/orders/:orderId - Get specific order
router.get('/:orderId', authenticateToken, getOrderById);

// GET /api/orders/admin/all - Get all orders (admin only)
router.get('/admin/all', authenticateToken, requireAdmin, getAllOrders);

// PUT /api/orders/:orderId/status - Update order status (admin only)
router.put('/:orderId/status', authenticateToken, requireAdmin, updateOrderStatus);

module.exports = router;
