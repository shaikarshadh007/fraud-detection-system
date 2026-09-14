const Transaction = require('../models/Transaction');

class FraudDetection {
  analyzTransaction(userId, transaction) {
    let riskScore = 0;
    const flags = [];

    // Get user's transaction history
    const userTransactions = Transaction.findByUserId(userId);
    const recentTransactions = userTransactions.filter(
      t => new Date() - t.timestamp < 24 * 60 * 60 * 1000
    );

    // Check 1: Unusual amount
    if (userTransactions.length > 0) {
      const avgAmount = userTransactions.reduce((sum, t) => sum + t.amount, 0) / userTransactions.length;
      if (transaction.amount > avgAmount * 2) {
        riskScore += 0.25;
        flags.push('Amount significantly higher than usual');
      }
    }

    // Check 2: Rapid transactions (velocity check)
    const transactionsIn5Min = recentTransactions.filter(
      t => new Date() - t.timestamp < 5 * 60 * 1000
    );
    if (transactionsIn5Min.length > 2) {
      riskScore += 0.2;
      flags.push('Multiple transactions in short time');
    }

    // Check 3: New merchant
    const merchantSet = new Set(userTransactions.map(t => t.merchant));
    if (!merchantSet.has(transaction.merchant)) {
      riskScore += 0.15;
      flags.push('Transaction with new merchant');
    }

    // Check 4: Location change
    if (userTransactions.length > 0) {
      const lastLocation = userTransactions[userTransactions.length - 1].location;
      if (lastLocation) {
        const distance = this.calculateDistance(
          lastLocation.latitude,
          lastLocation.longitude,
          transaction.latitude,
          transaction.longitude
        );
        if (distance > 50) { // More than 50km in short time
          const timeDiff = (transaction.timestamp - userTransactions[userTransactions.length - 1].timestamp) / (1000 * 60); // minutes
          if (timeDiff < 60) {
            riskScore += 0.2;
            flags.push(`Large geographic distance (${distance.toFixed(2)}km) in ${timeDiff.toFixed(0)} minutes`);
          }
        }
      }
    }

    // Check 5: High-risk merchant categories
    const highRiskMerchants = ['casino', 'gambling', 'lottery', 'crypto', 'forex'];
    if (highRiskMerchants.some(keyword => transaction.merchant.toLowerCase().includes(keyword))) {
      riskScore += 0.15;
      flags.push('High-risk merchant category');
    }

    // Cap risk score at 1
    riskScore = Math.min(riskScore, 1);

    return {
      riskScore,
      flags,
      recommendation: riskScore > 0.7 ? 'BLOCK' : riskScore > 0.4 ? 'REVIEW' : 'ALLOW'
    };
  }

  calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }
}

module.exports = FraudDetection;
