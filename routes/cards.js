const express = require('express');
const router = express.Router();
const Card = require('../models/Card');
const User = require('../models/User');
const authMiddleware = require('../middleware/auth');

// Add card with location restrictions
router.post('/add', authMiddleware, (req, res) => {
  try {
    const { cardNumber, cvv, expiryDate, allowedLocations } = req.body;
    const userId = req.userId;

    if (!cardNumber || !cvv || !expiryDate || !allowedLocations) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const card = Card.create(userId, cardNumber, cvv, expiryDate, allowedLocations);

    res.status(201).json({
      message: 'Card added successfully',
      card: {
        id: card.id,
        cardNumber: card.cardNumber,
        expiryDate: card.expiryDate,
        isLocked: card.isLocked,
        allowedLocations: card.allowedLocations
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to add card', error: error.message });
  }
});

// Get user cards
router.get('/my-cards', authMiddleware, (req, res) => {
  try {
    const userId = req.userId;
    const userCards = Card.findByUserId(userId);

    res.json({
      cards: userCards.map(c => ({
        id: c.id,
        cardNumber: c.cardNumber,
        expiryDate: c.expiryDate,
        isLocked: c.isLocked,
        allowedLocations: c.allowedLocations,
        createdAt: c.createdAt
      }))
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch cards', error: error.message });
  }
});

// Lock/Unlock card
router.post('/:cardId/toggle-lock', authMiddleware, (req, res) => {
  try {
    const { cardId } = req.params;
    const card = Card.findById(cardId);

    if (!card || card.userId !== req.userId) {
      return res.status(404).json({ message: 'Card not found' });
    }

    card.isLocked = !card.isLocked;

    res.json({
      message: `Card ${card.isLocked ? 'locked' : 'unlocked'} successfully`,
      card: {
        id: card.id,
        isLocked: card.isLocked
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to toggle lock', error: error.message });
  }
});

// Check card validity at location
router.post('/:cardId/check-location', authMiddleware, (req, res) => {
  try {
    const { cardId } = req.params;
    const { latitude, longitude } = req.body;
    const card = Card.findById(cardId);

    if (!card || card.userId !== req.userId) {
      return res.status(404).json({ message: 'Card not found' });
    }

    const canTransact = card.canTransact({ latitude, longitude });

    res.json({
      canTransact,
      isLocked: card.isLocked,
      message: canTransact ? 'Card is valid at this location' : 'Card is locked or outside allowed locations'
    });
  } catch (error) {
    res.status(500).json({ message: 'Location check failed', error: error.message });
  }
});

module.exports = router;
