const Order = require('../models/Order');
const { products } = require('./productController');
const { carts } = require('./cartController');

// In-memory storage (replace with real database)
let orders = [];
let orderIdCounter = 1;

const createOrder = (req, res) => {
  try {
    const userId = req.user.id;
    const { shippingAddress, paymentMethod } = req.body;

    // Get user's cart
    const cart = carts.find(c => c.userId === userId);
    if (!cart || cart.products.length === 0) {
      return res.status(400).json({ error: 'Cart is empty' });
    }

    // Calculate total and prepare order products
    let totalAmount = 0;
    const orderProducts = cart.products.map(item => {
      const product = products.find(p => p.id === item.productId);
      if (!product) {
        throw new Error(`Product with id ${item.productId} not found`);
      }
      
      // Check stock
      if (product.stock < item.quantity) {
        throw new Error(`Insufficient stock for ${product.name}`);
      }

      const subtotal = product.price * item.quantity;
      totalAmount += subtotal;

      return {
        productId: item.productId,
        name: product.name,
        price: product.price,
        quantity: item.quantity,
        subtotal: subtotal
      };
    });

    // Create new order
    const newOrder = new Order(orderIdCounter++, userId, orderProducts, totalAmount);
    newOrder.shippingAddress = shippingAddress;
    newOrder.paymentMethod = paymentMethod;
    
    orders.push(newOrder);

    // Update product stock
    orderProducts.forEach(item => {
      const product = products.find(p => p.id === item.productId);
      if (product) {
        product.stock -= item.quantity;
      }
    });

    // Clear user's cart
    const cartIndex = carts.findIndex(c => c.userId === userId);
    if (cartIndex !== -1) {
      carts[cartIndex].products = [];
    }

    res.status(201).json({
      message: 'Order created successfully',
      order: newOrder
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const getUserOrders = (req, res) => {
  try {
    const userId = req.user.id;
    const userOrders = orders.filter(order => order.userId === userId);
    
    res.json(userOrders);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

const getOrderById = (req, res) => {
  try {
    const userId = req.user.id;
    const { orderId } = req.params;
    
    const order = orders.find(o => o.id === parseInt(orderId) && o.userId === userId);
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    res.json(order);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

const getAllOrders = (req, res) => {
  try {
    // Admin only - get all orders
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

const updateOrderStatus = (req, res) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;

    const order = orders.find(o => o.id === parseInt(orderId));
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    order.updateStatus(status);

    res.json({
      message: 'Order status updated successfully',
      order: order
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

module.exports = {
  createOrder,
  getUserOrders,
  getOrderById,
  getAllOrders,
  updateOrderStatus
};
