const Cart = require('../models/Cart');
const { products } = require('./productController');

// In-memory storage (replace with real database)
let carts = [];

const getCart = (req, res) => {
  try {
    const userId = req.user.id;
    let cart = carts.find(c => c.userId === userId);
    
    if (!cart) {
      cart = new Cart(userId);
      carts.push(cart);
    }

    // Populate cart with product details
    const cartWithDetails = {
      ...cart,
      products: cart.products.map(item => {
        const product = products.find(p => p.id === item.productId);
        return {
          ...item,
          product: product || null
        };
      }).filter(item => item.product !== null) // Remove items with deleted products
    };

    res.json(cartWithDetails);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

const addToCart = (req, res) => {
  try {
    const userId = req.user.id;
    const { productId, quantity = 1 } = req.body;

    // Check if product exists
    const product = products.find(p => p.id === parseInt(productId));
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    // Check stock availability
    if (product.stock < quantity) {
      return res.status(400).json({ error: 'Insufficient stock' });
    }

    let cart = carts.find(c => c.userId === userId);
    if (!cart) {
      cart = new Cart(userId);
      carts.push(cart);
    }

    cart.addProduct(parseInt(productId), parseInt(quantity));

    res.json({
      message: 'Product added to cart successfully',
      cart: cart
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

const updateCartItem = (req, res) => {
  try {
    const userId = req.user.id;
    const { productId, quantity } = req.body;

    const cart = carts.find(c => c.userId === userId);
    if (!cart) {
      return res.status(404).json({ error: 'Cart not found' });
    }

    // Check if product exists in cart
    const cartItem = cart.products.find(p => p.productId === parseInt(productId));
    if (!cartItem) {
      return res.status(404).json({ error: 'Product not found in cart' });
    }

    // Check stock availability
    const product = products.find(p => p.id === parseInt(productId));
    if (product && product.stock < quantity) {
      return res.status(400).json({ error: 'Insufficient stock' });
    }

    if (quantity <= 0) {
      cart.removeProduct(parseInt(productId));
    } else {
      cart.updateQuantity(parseInt(productId), parseInt(quantity));
    }

    res.json({
      message: 'Cart updated successfully',
      cart: cart
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

const removeFromCart = (req, res) => {
  try {
    const userId = req.user.id;
    const { productId } = req.params;

    const cart = carts.find(c => c.userId === userId);
    if (!cart) {
      return res.status(404).json({ error: 'Cart not found' });
    }

    cart.removeProduct(parseInt(productId));

    res.json({
      message: 'Product removed from cart successfully',
      cart: cart
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

const clearCart = (req, res) => {
  try {
    const userId = req.user.id;
    const cartIndex = carts.findIndex(c => c.userId === userId);
    
    if (cartIndex !== -1) {
      carts[cartIndex].products = [];
      carts[cartIndex].updatedAt = new Date().toISOString();
    }

    res.json({ message: 'Cart cleared successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

module.exports = {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
  carts // Export for other controllers
};
