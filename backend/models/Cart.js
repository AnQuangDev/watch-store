class Cart {
  constructor(userId) {
    this.userId = userId;
    this.products = []; // [{productId, quantity}]
    this.updatedAt = new Date().toISOString();
  }

  addProduct(productId, quantity = 1) {
    const existingProduct = this.products.find(p => p.productId === productId);
    if (existingProduct) {
      existingProduct.quantity += quantity;
    } else {
      this.products.push({ productId, quantity });
    }
    this.updatedAt = new Date().toISOString();
  }

  updateQuantity(productId, quantity) {
    const product = this.products.find(p => p.productId === productId);
    if (product) {
      product.quantity = quantity;
      this.updatedAt = new Date().toISOString();
    }
  }

  removeProduct(productId) {
    this.products = this.products.filter(p => p.productId !== productId);
    this.updatedAt = new Date().toISOString();
  }
}

module.exports = Cart;
