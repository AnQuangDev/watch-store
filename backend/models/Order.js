class Order {
  constructor(id, userId, products, totalAmount) {
    this.id = id;
    this.userId = userId;
    this.products = products; // [{productId, quantity, price}]
    this.totalAmount = totalAmount;
    this.status = 'pending';
    this.createdAt = new Date().toISOString();
  }

  updateStatus(status) {
    this.status = status;
    this.updatedAt = new Date().toISOString();
  }
}

module.exports = Order;
