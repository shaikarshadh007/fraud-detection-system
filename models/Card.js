const cards = {};

class Card {
  constructor(id, userId, cardNumber, cvv, expiryDate, allowedLocations, isLocked) {
    this.id = id;
    this.userId = userId;
    this.cardNumber = this.maskCardNumber(cardNumber);
    this.originalCardNumber = cardNumber;
    this.cvv = cvv;
    this.expiryDate = expiryDate;
    this.allowedLocations = allowedLocations; // Array of {lat, lng, radius}
    this.isLocked = isLocked || false;
    this.createdAt = new Date();
  }

  maskCardNumber(cardNumber) {
    return cardNumber.slice(-4).padStart(cardNumber.length, '*');
  }

  canTransact(currentLocation) {
    if (this.isLocked) return false;

    return this.allowedLocations.some(allowedLoc => {
      const distance = this.calculateDistance(
        currentLocation.latitude,
        currentLocation.longitude,
        allowedLoc.latitude,
        allowedLoc.longitude
      );
      return distance <= allowedLoc.radiusKm;
    });
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

  static create(userId, cardNumber, cvv, expiryDate, allowedLocations) {
    const id = Date.now().toString();
    const card = new Card(id, userId, cardNumber, cvv, expiryDate, allowedLocations, false);
    cards[id] = card;
    return card;
  }

  static findById(id) {
    return cards[id];
  }

  static findByUserId(userId) {
    return Object.values(cards).filter(c => c.userId === userId);
  }

  static all() {
    return Object.values(cards);
  }
}

module.exports = Card;
