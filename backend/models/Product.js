class Product {
  constructor(id, name, price, description, images, brand, category, stock) {
    this.id = id;
    this.name = name;
    this.price = price;
    this.description = description;
    this.images = images;
    this.brand = brand;
    this.category = category;
    this.stock = stock;
    this.createdAt = new Date().toISOString();
  }
}

module.exports = Product;
