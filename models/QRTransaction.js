const qrTransactions = {};

class QRTransaction {
  constructor(id, userId, qrCode, amount, merchant, upiVerified, timestamp) {
    this.id = id;
    this.userId = userId;
    this.qrCode = qrCode;
    this.amount = amount;
    this.merchant = merchant;
    this.upiVerified = upiVerified || false;
    this.status = 'PENDING'; // PENDING, COMPLETED, FAILED
    this.timestamp = timestamp || new Date();
  }

  static create(userId, qrCode, amount, merchant) {
    const id = Date.now().toString();
    const qrTxn = new QRTransaction(id, userId, qrCode, amount, merchant);
    qrTransactions[id] = qrTxn;
    return qrTxn;
  }

  static findById(id) {
    return qrTransactions[id];
  }

  static findByUserId(userId) {
    return Object.values(qrTransactions).filter(t => t.userId === userId);
  }

  static all() {
    return Object.values(qrTransactions);
  }
}

module.exports = QRTransaction;
