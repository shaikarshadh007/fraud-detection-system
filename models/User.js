const users = {};

class User {
  constructor(id, name, email, password, location) {
    this.id = id;
    this.name = name;
    this.email = email;
    this.password = password;
    this.location = location;
    this.cards = [];
    this.upiPin = null;
    this.createdAt = new Date();
  }

  static create(name, email, password, location) {
    const id = Date.now().toString();
    const user = new User(id, name, email, password, location);
    users[id] = user;
    return user;
  }

  static findById(id) {
    return users[id];
  }

  static findByEmail(email) {
    return Object.values(users).find(u => u.email === email);
  }

  static all() {
    return Object.values(users);
  }
}

module.exports = User;
