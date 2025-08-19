const { body, validationResult } = require('express-validator');
const Product = require('../models/Product');

// In-memory storage (replace with real database)
let products = [
  new Product(1, 'Rolex Submariner', 12000, 'Luxury diving watch with stainless steel case', 
    ['https://via.placeholder.com/400x400/000/fff?text=Rolex+1'], 'Rolex', 'luxury', 5),
  new Product(2, 'Omega Speedmaster', 8500, 'Professional chronograph watch', 
    ['https://via.placeholder.com/400x400/333/fff?text=Omega+1'], 'Omega', 'luxury', 8),
  new Product(3, 'Casio G-Shock', 150, 'Durable sports watch with shock resistance', 
    ['https://via.placeholder.com/400x400/666/fff?text=Casio+1'], 'Casio', 'sports', 20),
  new Product(4, 'Citizen Eco-Drive', 250, 'Solar powered watch with elegant design', 
    ['https://via.placeholder.com/400x400/999/000?text=Citizen+1'], 'Citizen', 'casual', 15),
  new Product(5, 'Seiko Automatic', 300, 'Mechanical watch with automatic movement', 
    ['https://via.placeholder.com/400x400/555/fff?text=Seiko+1'], 'Seiko', 'casual', 12)
];
let productIdCounter = 6;

const getAllProducts = (req, res) => {
  try {
    const { page = 1, limit = 10, search, brand, category, minPrice, maxPrice } = req.query;
    
    let filteredProducts = [...products];

    // Search filter
    if (search) {
      filteredProducts = filteredProducts.filter(product =>
        product.name.toLowerCase().includes(search.toLowerCase()) ||
        product.description.toLowerCase().includes(search.toLowerCase())
      );
    }

    // Brand filter
    if (brand) {
      filteredProducts = filteredProducts.filter(product =>
        product.brand.toLowerCase() === brand.toLowerCase()
      );
    }

    // Category filter
    if (category) {
      filteredProducts = filteredProducts.filter(product =>
        product.category.toLowerCase() === category.toLowerCase()
      );
    }

    // Price range filter
    if (minPrice) {
      filteredProducts = filteredProducts.filter(product =>
        product.price >= parseFloat(minPrice)
      );
    }
    if (maxPrice) {
      filteredProducts = filteredProducts.filter(product =>
        product.price <= parseFloat(maxPrice)
      );
    }

    // Pagination
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const paginatedProducts = filteredProducts.slice(startIndex, endIndex);

    res.json({
      products: paginatedProducts,
      totalProducts: filteredProducts.length,
      currentPage: parseInt(page),
      totalPages: Math.ceil(filteredProducts.length / limit)
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

const getProductById = (req, res) => {
  try {
    const { id } = req.params;
    const product = products.find(p => p.id === parseInt(id));
    
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.json(product);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

const createProduct = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, price, description, images, brand, category, stock } = req.body;

    const newProduct = new Product(
      productIdCounter++,
      name,
      parseFloat(price),
      description,
      images,
      brand,
      category,
      parseInt(stock)
    );

    products.push(newProduct);

    res.status(201).json({
      message: 'Product created successfully',
      product: newProduct
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const productIndex = products.findIndex(p => p.id === parseInt(id));
    
    if (productIndex === -1) {
      return res.status(404).json({ error: 'Product not found' });
    }

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, price, description, images, brand, category, stock } = req.body;

    products[productIndex] = {
      ...products[productIndex],
      name: name || products[productIndex].name,
      price: price ? parseFloat(price) : products[productIndex].price,
      description: description || products[productIndex].description,
      images: images || products[productIndex].images,
      brand: brand || products[productIndex].brand,
      category: category || products[productIndex].category,
      stock: stock ? parseInt(stock) : products[productIndex].stock
    };

    res.json({
      message: 'Product updated successfully',
      product: products[productIndex]
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

const deleteProduct = (req, res) => {
  try {
    const { id } = req.params;
    const productIndex = products.findIndex(p => p.id === parseInt(id));
    
    if (productIndex === -1) {
      return res.status(404).json({ error: 'Product not found' });
    }

    products.splice(productIndex, 1);

    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

// Validation rules
const productValidation = [
  body('name').isLength({ min: 2 }).withMessage('Product name must be at least 2 characters'),
  body('price').isFloat({ min: 0 }).withMessage('Price must be a positive number'),
  body('description').isLength({ min: 10 }).withMessage('Description must be at least 10 characters'),
  body('brand').notEmpty().withMessage('Brand is required'),
  body('category').notEmpty().withMessage('Category is required'),
  body('stock').isInt({ min: 0 }).withMessage('Stock must be a non-negative integer')
];

module.exports = {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  productValidation,
  products // Export for other controllers
};
