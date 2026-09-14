const express = require('express');
const router = express.Router();
const QRCode = require('qrcode');
const QRTransaction = require('../models/QRTransaction');
const authMiddleware = require('../middleware/auth');
const User = require('../models/User');

// Generate QR code
router.post('/generate', authMiddleware, (req, res) => {
  try {
    const { amount, merchant } = req.body;
    const userId = req.userId;

    if (!amount || !merchant) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const qrData = {
      userId,
      amount,
      merchant,
      timestamp: new Date().toISOString(),
      transactionId: Date.now().toString()
    };

    QRCode.toDataURL(JSON.stringify(qrData), (err, qrCodeUrl) => {
      if (err) {
        return res.status(500).json({ message: 'Failed to generate QR code', error: err.message });
      }

      const qrTxn = QRTransaction.create(userId, qrCodeUrl, amount, merchant);

      res.json({
        message: 'QR code generated successfully',
        qrTransaction: {
          id: qrTxn.id,
          qrCode: qrCodeUrl,
          amount: qrTxn.amount,
          merchant: qrTxn.merchant,
          status: qrTxn.status
        }
      });
    });
  } catch (error) {
    res.status(500).json({ message: 'QR generation failed', error: error.message });
  }
});

// Verify UPI PIN and complete transaction
router.post('/:qrTxnId/verify-upi', authMiddleware, (req, res) => {
  try {
    const { qrTxnId } = req.params;
    const { upiPin } = req.body;
    const userId = req.userId;

    if (!upiPin) {
      return res.status(400).json({ message: 'UPI PIN is required' });
    }

    const qrTxn = QRTransaction.findById(qrTxnId);
    if (!qrTxn || qrTxn.userId !== userId) {
      return res.status(404).json({ message: 'QR transaction not found' });
    }

    const user = User.findById(userId);
    if (!user || user.upiPin !== upiPin) {
      return res.status(401).json({ message: 'Invalid UPI PIN' });
    }

    qrTxn.upiVerified = true;
    qrTxn.status = 'COMPLETED';

    res.json({
      message: 'QR transaction completed successfully',
      qrTransaction: {
        id: qrTxn.id,
        amount: qrTxn.amount,
        merchant: qrTxn.merchant,
        status: qrTxn.status,
        upiVerified: qrTxn.upiVerified
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'UPI verification failed', error: error.message });
  }
});

// Set UPI PIN
router.post('/set-upi-pin', authMiddleware, (req, res) => {
  try {
    const { upiPin } = req.body;
    const userId = req.userId;

    if (!upiPin || upiPin.length !== 4) {
      return res.status(400).json({ message: 'UPI PIN must be 4 digits' });
    }

    const user = User.findById(userId);
    user.upiPin = upiPin;

    res.json({ message: 'UPI PIN set successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to set UPI PIN', error: error.message });
  }
});

module.exports = router;
