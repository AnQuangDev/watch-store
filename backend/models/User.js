class User {
  constructor(id, name, email, password, role = 'user', avatar = '') {
    this.id = id;
    this.name = name;
    this.email = email;
    this.password = password;
    this.role = role;
    this.avatar = avatar;
    this.createdAt = new Date().toISOString();
  }
}

module.exports = User;
