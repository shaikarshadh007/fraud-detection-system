const transactions = {};

class Transaction {
  constructor(id, userId, cardId, amount, merchant, location, type, status, timestamp) {
    this.id = id;
    this.userId = userId;
    this.cardId = cardId;
    this.amount = amount;
    this.merchant = merchant;
    this.location = location;
    this.type = type; // 'CARD' or 'QR'
    this.status = status; // 'SUCCESS', 'FAILED', 'PENDING', 'SUSPICIOUS'
    this.timestamp = timestamp || new Date();
    this.riskScore = 0;
  }

  static create(userId, cardId, amount, merchant, location, type, status) {
    const id = Date.now().toString();
    const transaction = new Transaction(id, userId, cardId, amount, merchant, location, type, status);
    transactions[id] = transaction;
    return transaction;
  }

  static findById(id) {
    return transactions[id];
  }

  static findByUserId(userId) {
    return Object.values(transactions).filter(t => t.userId === userId);
  }

  static findByCardId(cardId) {
    return Object.values(transactions).filter(t => t.cardId === cardId);
  }

  static all() {
    return Object.values(transactions);
  }

  static getRecentTransactions(userId, hours = 24) {
    const cutoffTime = new Date(Date.now() - hours * 60 * 60 * 1000);
    return Object.values(transactions).filter(
      t => t.userId === userId && t.timestamp > cutoffTime
    );
  }
}

module.exports = Transaction;
