const express = require('express');
const router = express.Router();
const Transaction = require('../models/Transaction');
const authMiddleware = require('../middleware/auth');

// Get fraud alerts
router.get('/alerts', authMiddleware, (req, res) => {
  try {
    const userId = req.userId;
    const allTransactions = Transaction.findByUserId(userId);

    const suspiciousTransactions = allTransactions.filter(t => t.status === 'SUSPICIOUS' || t.riskScore > 0.7);

    res.json({
      suspiciousCount: suspiciousTransactions.length,
      alerts: suspiciousTransactions.map(t => ({
        id: t.id,
        amount: t.amount,
        merchant: t.merchant,
        timestamp: t.timestamp,
        location: t.location,
        riskScore: t.riskScore,
        status: t.status
      }))
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch alerts', error: error.message });
  }
});

// Get fraud dashboard
router.get('/dashboard', authMiddleware, (req, res) => {
  try {
    const userId = req.userId;
    const allTransactions = Transaction.findByUserId(userId);

    const totalTransactions = allTransactions.length;
    const successfulTransactions = allTransactions.filter(t => t.status === 'SUCCESS').length;
    const suspiciousTransactions = allTransactions.filter(t => t.status === 'SUSPICIOUS').length;
    const totalAmount = allTransactions.reduce((sum, t) => sum + t.amount, 0);
    const avgRiskScore = allTransactions.length > 0
      ? allTransactions.reduce((sum, t) => sum + (t.riskScore || 0), 0) / allTransactions.length
      : 0;

    res.json({
      dashboard: {
        totalTransactions,
        successfulTransactions,
        suspiciousTransactions,
        totalAmount,
        avgRiskScore: (avgRiskScore * 100).toFixed(2) + '%',
        successRate: ((successfulTransactions / totalTransactions * 100) || 0).toFixed(2) + '%'
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch dashboard', error: error.message });
  }
});

module.exports = router;
