const express = require('express');
const router = express.Router();
const Transaction = require('../models/Transaction');
const Card = require('../models/Card');
const authMiddleware = require('../middleware/auth');
const FraudDetection = require('../utils/fraudDetection');

// Process transaction
router.post('/process', authMiddleware, (req, res) => {
  try {
    const { cardId, amount, merchant, latitude, longitude } = req.body;
    const userId = req.userId;

    if (!cardId || !amount || !merchant) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const card = Card.findById(cardId);
    if (!card || card.userId !== userId) {
      return res.status(404).json({ message: 'Card not found' });
    }

    // Check if card can transact at location
    const canTransact = card.canTransact({ latitude, longitude });
    if (!canTransact) {
      const txn = Transaction.create(userId, cardId, amount, merchant, { latitude, longitude }, 'CARD', 'FAILED');
      return res.status(403).json({
        message: 'Transaction blocked: Card locked or outside allowed locations',
        transaction: txn
      });
    }

    // Fraud detection
    const fraudDetection = new FraudDetection();
    const riskAnalysis = fraudDetection.analyzTransaction(userId, {
      amount,
      merchant,
      latitude,
      longitude,
      timestamp: new Date()
    });

    let status = 'SUCCESS';
    if (riskAnalysis.riskScore > 0.7) {
      status = 'SUSPICIOUS';
    } else if (riskAnalysis.riskScore > 0.4) {
      status = 'PENDING';
    }

    const txn = Transaction.create(userId, cardId, amount, merchant, { latitude, longitude }, 'CARD', status);
    txn.riskScore = riskAnalysis.riskScore;

    res.status(201).json({
      message: `Transaction ${status}`,
      transaction: txn,
      riskAnalysis: riskAnalysis.flags.length > 0 ? riskAnalysis : null
    });
  } catch (error) {
    res.status(500).json({ message: 'Transaction processing failed', error: error.message });
  }
});

// Get transaction history
router.get('/history', authMiddleware, (req, res) => {
  try {
    const userId = req.userId;
    const transactions = Transaction.findByUserId(userId);

    res.json({
      transactions: transactions.sort((a, b) => b.timestamp - a.timestamp)
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch history', error: error.message });
  }
});

// Get recent transactions
router.get('/recent', authMiddleware, (req, res) => {
  try {
    const userId = req.userId;
    const { hours = 24 } = req.query;
    const recent = Transaction.getRecentTransactions(userId, parseInt(hours));

    res.json({
      transactions: recent.sort((a, b) => b.timestamp - a.timestamp),
      count: recent.length
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch recent transactions', error: error.message });
  }
});

module.exports = router;
