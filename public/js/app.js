class FraudDetectionApp {
    constructor() {
        this.token = localStorage.getItem('token');
        this.userId = localStorage.getItem('userId');
        this.currentLocation = null;
        this.init();
    }

    init() {
        if (this.token) {
            this.showDashboard();
            this.getLocation();
            setInterval(() => this.getLocation(), 10000);
        } else {
            this.showLoginPage();
        }
    }

    showLoginPage() {
        const app = document.getElementById('app');
        app.innerHTML = `
            <div class="container" style="max-width: 400px; margin-top: 50px;">
                <div class="form-card">
                    <h1 style="text-align: center; margin-bottom: 30px; color: var(--primary-color);">🔒 Fraud Detection System</h1>
                    <div id="authTabs" style="display: flex; gap: 10px; margin-bottom: 20px;">
                        <button class="btn btn-primary" onclick="app.switchTab('login')" style="flex: 1;">Login</button>
                        <button class="btn" onclick="app.switchTab('register')" style="flex: 1; background: var(--border-color); color: var(--text-color);">Register</button>
                    </div>
                    
                    <div id="loginForm" class="auth-form">
                        <div class="form-group">
                            <label>Email</label>
                            <input type="email" id="loginEmail" placeholder="Enter your email">
                        </div>
                        <div class="form-group">
                            <label>Password</label>
                            <input type="password" id="loginPassword" placeholder="Enter your password">
                        </div>
                        <button class="btn btn-primary" onclick="app.login()" style="width: 100%;">Login</button>
                    </div>

                    <div id="registerForm" class="auth-form" style="display: none;">
                        <div class="form-group">
                            <label>Full Name</label>
                            <input type="text" id="registerName" placeholder="Enter your name">
                        </div>
                        <div class="form-group">
                            <label>Email</label>
                            <input type="email" id="registerEmail" placeholder="Enter your email">
                        </div>
                        <div class="form-group">
                            <label>Password</label>
                            <input type="password" id="registerPassword" placeholder="Enter your password">
                        </div>
                        <button class="btn btn-primary" onclick="app.register()" style="width: 100%;">Register</button>
                    </div>
                </div>
            </div>
        `;
    }

    switchTab(tab) {
        document.getElementById('loginForm').style.display = tab === 'login' ? 'block' : 'none';
        document.getElementById('registerForm').style.display = tab === 'register' ? 'block' : 'none';
    }

    async login() {
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;

        if (!email || !password) {
            this.showAlert('Please fill all fields', 'warning');
            return;
        }

        try {
            const response = await axios.post('http://localhost:5000/api/auth/login', {
                email,
                password
            });
            localStorage.setItem('token', response.data.token);
            localStorage.setItem('userId', response.data.user.id);
            this.token = response.data.token;
            this.userId = response.data.user.id;
            this.showAlert('✅ Login successful!', 'success');
            setTimeout(() => this.init(), 1000);
        } catch (error) {
            this.showAlert('❌ ' + (error.response?.data?.message || 'Login failed'), 'danger');
        }
    }

    async register() {
        const name = document.getElementById('registerName').value;
        const email = document.getElementById('registerEmail').value;
        const password = document.getElementById('registerPassword').value;

        if (!name || !email || !password) {
            this.showAlert('Please fill all fields', 'warning');
            return;
        }

        try {
            const response = await axios.post('http://localhost:5000/api/auth/register', {
                name,
                email,
                password,
                latitude: 40.7128,
                longitude: -74.0060
            });
            localStorage.setItem('token', response.data.token);
            localStorage.setItem('userId', response.data.user.id);
            this.token = response.data.token;
            this.userId = response.data.user.id;
            this.showAlert('✅ Registration successful!', 'success');
            setTimeout(() => this.init(), 1000);
        } catch (error) {
            this.showAlert('❌ ' + (error.response?.data?.message || 'Registration failed'), 'danger');
        }
    }

    showDashboard() {
        const app = document.getElementById('app');
        app.innerHTML = `
            <nav class="navbar">
                <div class="container">
                    <div class="logo">🔒 SecurePayments</div>
                    <ul class="nav-menu">
                        <li><a onclick="app.navigateTo('dashboard')" style="cursor: pointer;">📊 Dashboard</a></li>
                        <li><a onclick="app.navigateTo('cards')" style="cursor: pointer;">💳 Cards</a></li>
                        <li><a onclick="app.navigateTo('qr')" style="cursor: pointer;">📱 QR Payment</a></li>
                        <li><a onclick="app.navigateTo('transactions')" style="cursor: pointer;">📈 Transactions</a></li>
                        <li><a onclick="app.navigateTo('alerts')" style="cursor: pointer;">⚠️ Alerts</a></li>
                        <li><button class="logout-btn" onclick="app.logout()">Logout</button></li>
                    </ul>
                </div>
            </nav>
            <div id="alertContainer" style="position: fixed; top: 80px; right: 20px; width: 90%; max-width: 400px; z-index: 9999;"></div>
            <div id="pageContent"></div>
        `;
        this.showDashboardPage();
    }

    navigateTo(page) {
        switch(page) {
            case 'dashboard':
                this.showDashboardPage();
                break;
            case 'cards':
                this.showCardsPage();
                break;
            case 'qr':
                this.showQRPage();
                break;
            case 'transactions':
                this.showTransactionsPage();
                break;
            case 'alerts':
                this.showAlertsPage();
                break;
        }
    }

    async showDashboardPage() {
        const pageContent = document.getElementById('pageContent');
        pageContent.innerHTML = `<div class="container"><div class="loading"><div class="spinner"></div></div></div>`;
        
        try {
            const response = await axios.get('http://localhost:5000/api/fraud/dashboard', {
                headers: { Authorization: `Bearer ${this.token}` }
            });
            const data = response.data.dashboard;

            pageContent.innerHTML = `
                <div class="container">
                    <h1 style="margin-bottom: 30px;">📊 Dashboard</h1>
                    
                    <div class="stats-grid">
                        <div class="stat-box">
                            <div class="stat-label">Total Transactions</div>
                            <div class="stat-value">${data.totalTransactions}</div>
                        </div>
                        <div class="stat-box" style="border-left-color: var(--success-color);">
                            <div class="stat-label">Successful</div>
                            <div class="stat-value" style="color: var(--success-color);">${data.successfulTransactions}</div>
                        </div>
                        <div class="stat-box" style="border-left-color: var(--danger-color);">
                            <div class="stat-label">Suspicious</div>
                            <div class="stat-value" style="color: var(--danger-color);">${data.suspiciousTransactions}</div>
                        </div>
                        <div class="stat-box" style="border-left-color: var(--warning-color);">
                            <div class="stat-label">Total Amount</div>
                            <div class="stat-value" style="color: var(--warning-color);">₹${data.totalAmount}</div>
                        </div>
                        <div class="stat-box" style="border-left-color: var(--warning-color);">
                            <div class="stat-label">Avg Risk Score</div>
                            <div class="stat-value" style="color: var(--warning-color);">${data.avgRiskScore}</div>
                        </div>
                        <div class="stat-box" style="border-left-color: var(--success-color);">
                            <div class="stat-label">Success Rate</div>
                            <div class="stat-value" style="color: var(--success-color);">${data.successRate}</div>
                        </div>
                    </div>

                    <div class="card">
                        <h2 class="card-title">📍 Current Location Status</h2>
                        <div id="locationStatus" style="padding: 20px; text-align: center;">
                            <p style="color: #6b7280; font-size: 16px;">📡 Detecting location...</p>
                        </div>
                    </div>
                </div>
            `;
        } catch (error) {
            pageContent.innerHTML = `<div class="container"><div class="alert alert-danger">❌ Failed to load dashboard</div></div>`;
        }
    }

    async showCardsPage() {
        const pageContent = document.getElementById('pageContent');
        pageContent.innerHTML = `<div class="container"><div class="loading"><div class="spinner"></div></div></div>`;

        try {
            const response = await axios.get('http://localhost:5000/api/cards/my-cards', {
                headers: { Authorization: `Bearer ${this.token}` }
            });

            let cardsHTML = `
                <div class="container">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 30px;">
                        <h1>💳 My Cards</h1>
                        <button class="btn btn-primary" onclick="app.showAddCardModal()">+ Add Card</button>
                    </div>
            `;

            if (response.data.cards.length > 0) {
                cardsHTML += `<div class="grid">`;
                response.data.cards.forEach(card => {
                    cardsHTML += `
                        <div class="card" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white;">
                            <div class="card-title" style="color: white;">💳 Card</div>
                            <div class="card-number">${card.cardNumber}</div>
                            <div class="card-details" style="color: rgba(255,255,255,0.9);">
                                <div class="card-detail-item">
                                    <span class="card-detail-label" style="color: rgba(255,255,255,0.7);">Expiry</span>
                                    <span class="card-detail-value">${card.expiryDate}</span>
                                </div>
                                <div class="card-detail-item">
                                    <span class="card-detail-label" style="color: rgba(255,255,255,0.7);">Status</span>
                                    <span class="card-detail-value">${card.isLocked ? '🔒 Locked' : '🔓 Unlocked'}</span>
                                </div>
                            </div>
                            <div class="lock-status ${card.isLocked ? 'locked' : 'unlocked'}" style="background: rgba(255,255,255,0.2); border: 1px solid rgba(255,255,255,0.3); color: white;">
                                <span class="lock-icon">${card.isLocked ? '🔒' : '🔓'}</span>
                                <span>${card.isLocked ? 'Card Locked' : 'Card Unlocked'}</span>
                            </div>
                            <div class="btn-group" style="margin-top: 15px;">
                                <button class="btn btn-warning btn-small" onclick="app.toggleCardLock('${card.id}')">Toggle Lock</button>
                                <button class="btn btn-success btn-small" onclick="app.checkCardLocation('${card.id}')">Check Location</button>
                            </div>
                        </div>
                    `;
                });
                cardsHTML += `</div>`;
            } else {
                cardsHTML += `<div class="alert alert-info">ℹ️ No cards found. Add a new card to get started.</div>`;
            }

            cardsHTML += `</div>`;
            pageContent.innerHTML = cardsHTML;
        } catch (error) {
            pageContent.innerHTML = `<div class="container"><div class="alert alert-danger">❌ Failed to load cards</div></div>`;
        }
    }

    showAddCardModal() {
        const modal = document.createElement('div');
        modal.className = 'modal active';
        modal.innerHTML = `
            <div class="modal-content">
                <button class="modal-close" onclick="this.parentElement.parentElement.remove()">×</button>
                <div class="modal-header">💳 Add New Card</div>
                
                <div class="form-group">
                    <label>Card Number</label>
                    <input type="text" id="cardNumber" placeholder="1234 5678 9012 3456" maxlength="19">
                </div>
                <div class="form-group">
                    <label>CVV</label>
                    <input type="text" id="cardCVV" placeholder="123" maxlength="3">
                </div>
                <div class="form-group">
                    <label>Expiry Date (MM/YY)</label>
                    <input type="text" id="cardExpiry" placeholder="12/25">
                </div>
                <div class="form-group">
                    <label>Allowed Location Radius (km)</label>
                    <input type="number" id="cardRadius" placeholder="50" value="50">
                </div>
                
                <button class="btn btn-primary" onclick="app.addCard()" style="width: 100%;">Add Card</button>
            </div>
        `;
        document.body.appendChild(modal);
    }

    async addCard() {
        const cardNumber = document.getElementById('cardNumber').value;
        const cvv = document.getElementById('cardCVV').value;
        const expiryDate = document.getElementById('cardExpiry').value;
        const radius = document.getElementById('cardRadius').value;

        if (!cardNumber || !cvv || !expiryDate) {
            this.showAlert('⚠️ Please fill all fields', 'warning');
            return;
        }

        try {
            const response = await axios.post('http://localhost:5000/api/cards/add', {
                cardNumber,
                cvv,
                expiryDate,
                allowedLocations: [{
                    latitude: this.currentLocation?.latitude || 40.7128,
                    longitude: this.currentLocation?.longitude || -74.0060,
                    radiusKm: parseInt(radius)
                }]
            }, {
                headers: { Authorization: `Bearer ${this.token}` }
            });
            this.showAlert('✅ Card added successfully!', 'success');
            document.querySelector('.modal').remove();
            this.showCardsPage();
        } catch (error) {
            this.showAlert('❌ ' + (error.response?.data?.message || 'Failed to add card'), 'danger');
        }
    }

    async toggleCardLock(cardId) {
        try {
            const response = await axios.post(`http://localhost:5000/api/cards/${cardId}/toggle-lock`, {}, {
                headers: { Authorization: `Bearer ${this.token}` }
            });
            this.showAlert('✅ ' + response.data.message, 'success');
            this.showCardsPage();
        } catch (error) {
            this.showAlert('❌ ' + (error.response?.data?.message || 'Failed to toggle lock'), 'danger');
        }
    }

    async checkCardLocation(cardId) {
        if (!this.currentLocation) {
            this.showAlert('⚠️ Location not available', 'warning');
            return;
        }

        try {
            const response = await axios.post(`http://localhost:5000/api/cards/${cardId}/check-location`, 
            {
                latitude: this.currentLocation.latitude,
                longitude: this.currentLocation.longitude
            }, {
                headers: { Authorization: `Bearer ${this.token}` }
            });
            
            if (response.data.canTransact) {
                this.showAlert('✅ ' + response.data.message, 'success');
            } else {
                this.showAlert('❌ ' + response.data.message, 'danger');
            }
        } catch (error) {
            this.showAlert('❌ Location check failed', 'danger');
        }
    }

    async showQRPage() {
        const pageContent = document.getElementById('pageContent');
        pageContent.innerHTML = `
            <div class="container">
                <h1 style="margin-bottom: 30px;">📱 QR Code Payment</h1>
                
                <div class="grid">
                    <div class="form-card">
                        <div class="modal-header" style="text-align: left; margin-bottom: 20px;">Generate QR Code</div>
                        
                        <div class="form-group">
                            <label>Amount (₹)</label>
                            <input type="number" id="qrAmount" placeholder="Enter amount">
                        </div>
                        <div class="form-group">
                            <label>Merchant Name</label>
                            <input type="text" id="qrMerchant" placeholder="Enter merchant name">
                        </div>
                        
                        <button class="btn btn-primary" onclick="app.generateQRCode()" style="width: 100%;">Generate QR Code</button>
                    </div>

                    <div id="qrDisplay" class="form-card" style="display: none;">
                        <div class="modal-header" style="text-align: center; margin-bottom: 20px;">Scan & Pay</div>
                        <div id="qrCodeContainer" class="qr-container"></div>
                        <div class="form-group">
                            <label>UPI PIN (4 digits)</label>
                            <input type="password" id="upiPin" placeholder="Enter 4-digit PIN" maxlength="4">
                        </div>
                        <button class="btn btn-success" onclick="app.verifyUPI()" style="width: 100%;">Complete Payment</button>
                        <button class="btn btn-danger" onclick="app.cancelQR()" style="width: 100%; margin-top: 10px;">Cancel</button>
                    </div>
                </div>
            </div>
        `;
    }

    async generateQRCode() {
        const amount = document.getElementById('qrAmount').value;
        const merchant = document.getElementById('qrMerchant').value;

        if (!amount || !merchant) {
            this.showAlert('⚠️ Please enter amount and merchant name', 'warning');
            return;
        }

        try {
            const response = await axios.post('http://localhost:5000/api/qr/generate', 
            { amount, merchant }, {
                headers: { Authorization: `Bearer ${this.token}` }
            });
            
            this.qrTransactionId = response.data.qrTransaction.id;
            const qrContainer = document.getElementById('qrCodeContainer');
            qrContainer.innerHTML = `<img src="${response.data.qrTransaction.qrCode}" class="qr-code">`;
            document.getElementById('qrDisplay').style.display = 'block';
            this.showAlert('✅ QR code generated! Scan to pay ₹' + amount, 'success');
        } catch (error) {
            this.showAlert('❌ ' + (error.response?.data?.message || 'Failed to generate QR code'), 'danger');
        }
    }

    async verifyUPI() {
        const upiPin = document.getElementById('upiPin').value;

        if (!upiPin || upiPin.length !== 4) {
            this.showAlert('⚠️ Please enter a valid 4-digit UPI PIN', 'warning');
            return;
        }

        try {
            const response = await axios.post(`http://localhost:5000/api/qr/${this.qrTransactionId}/verify-upi`, 
            { upiPin }, {
                headers: { Authorization: `Bearer ${this.token}` }
            });
            
            this.showAlert('✅ Payment successful!', 'success');
            setTimeout(() => this.showQRPage(), 2000);
        } catch (error) {
            this.showAlert('❌ ' + (error.response?.data?.message || 'Payment failed'), 'danger');
        }
    }

    cancelQR() {
        document.getElementById('qrDisplay').style.display = 'none';
        document.getElementById('qrAmount').value = '';
        document.getElementById('qrMerchant').value = '';
        document.getElementById('upiPin').value = '';
    }

    async showTransactionsPage() {
        const pageContent = document.getElementById('pageContent');
        pageContent.innerHTML = `<div class="container"><div class="loading"><div class="spinner"></div></div></div>`;

        try {
            const response = await axios.get('http://localhost:5000/api/transactions/history', {
                headers: { Authorization: `Bearer ${this.token}` }
            });

            let html = `
                <div class="container">
                    <h1 style="margin-bottom: 30px;">📈 Transaction History</h1>
                    <div class="card">
                        <table class="table">
                            <thead>
                                <tr>
                                    <th>Date</th>
                                    <th>Merchant</th>
                                    <th>Amount</th>
                                    <th>Type</th>
                                    <th>Status</th>
                                    <th>Risk Score</th>
                                </tr>
                            </thead>
                            <tbody>
            `;

            if (response.data.transactions.length > 0) {
                response.data.transactions.forEach(txn => {
                    const statusBadge = `<span class="badge ${txn.status === 'SUCCESS' ? 'success' : txn.status === 'SUSPICIOUS' ? 'danger' : 'warning'}">${txn.status}</span>`;
                    const date = new Date(txn.timestamp).toLocaleString();
                    const riskPercent = (txn.riskScore * 100).toFixed(0);
                    
                    html += `
                        <tr>
                            <td>${date}</td>
                            <td>${txn.merchant}</td>
                            <td>₹${txn.amount}</td>
                            <td>${txn.type}</td>
                            <td>${statusBadge}</td>
                            <td><span class="badge ${txn.riskScore > 0.7 ? 'danger' : txn.riskScore > 0.4 ? 'warning' : 'success'}">${riskPercent}%</span></td>
                        </tr>
                    `;
                });
            } else {
                html += `<tr><td colspan="6" style="text-align: center; padding: 40px;">No transactions found</td></tr>`;
            }

            html += `
                            </tbody>
                        </table>
                    </div>
                </div>
            `;
            pageContent.innerHTML = html;
        } catch (error) {
            pageContent.innerHTML = `<div class="container"><div class="alert alert-danger">❌ Failed to load transactions</div></div>`;
        }
    }

    async showAlertsPage() {
        const pageContent = document.getElementById('pageContent');
        pageContent.innerHTML = `<div class="container"><div class="loading"><div class="spinner"></div></div></div>`;

        try {
            const response = await axios.get('http://localhost:5000/api/fraud/alerts', {
                headers: { Authorization: `Bearer ${this.token}` }
            });

            let html = `
                <div class="container">
                    <h1 style="margin-bottom: 30px;">⚠️ Security Alerts</h1>
                    <div class="alert alert-info">
                        🔔 You have <strong>${response.data.suspiciousCount}</strong> suspicious transaction(s)
                    </div>
            `;

            if (response.data.alerts.length > 0) {
                response.data.alerts.forEach(alert => {
                    const date = new Date(alert.timestamp).toLocaleString();
                    html += `
                        <div class="card" style="border-left: 4px solid var(--danger-color); margin-bottom: 20px;">
                            <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 15px;">
                                <div>
                                    <h3 style="color: var(--danger-color);">⚠️ Suspicious Activity Detected</h3>
                                    <p style="color: #6b7280; margin-top: 5px;">${date}</p>
                                </div>
                                <span class="badge danger">Risk: ${(alert.riskScore * 100).toFixed(0)}%</span>
                            </div>
                            <div style="background: #f3f4f6; padding: 15px; border-radius: 6px; margin: 15px 0;">
                                <p><strong>Merchant:</strong> ${alert.merchant}</p>
                                <p><strong>Amount:</strong> ₹${alert.amount}</p>
                                <p><strong>Location:</strong> ${alert.location ? `${alert.location.latitude.toFixed(4)}, ${alert.location.longitude.toFixed(4)}` : 'N/A'}</p>
                            </div>
                            <button class="btn btn-primary" onclick="app.showAlert('✅ Alert reviewed. Monitoring this transaction.', 'success')">Mark as Reviewed</button>
                        </div>
                    `;
                });
            } else {
                html += `<div class="alert alert-success">✅ No suspicious transactions detected. Your account is secure!</div>`;
            }

            html += `</div>`;
            pageContent.innerHTML = html;
        } catch (error) {
            pageContent.innerHTML = `<div class="container"><div class="alert alert-danger">❌ Failed to load alerts</div></div>`;
        }
    }

    getLocation() {
        if ('geolocation' in navigator) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    this.currentLocation = {
                        latitude: position.coords.latitude,
                        longitude: position.coords.longitude
                    };
                    this.updateLocationStatus();
                },
                (error) => {
                    console.log('Location access denied, using default');
                    this.currentLocation = {
                        latitude: 40.7128,
                        longitude: -74.0060
                    };
                }
            );
        }
    }

    updateLocationStatus() {
        const locationStatus = document.getElementById('locationStatus');
        if (locationStatus && this.currentLocation) {
            locationStatus.innerHTML = `
                <p style="font-size: 16px; margin-bottom: 10px;">📍 Current Location</p>
                <p style="font-size: 14px; color: var(--primary-color);">Latitude: ${this.currentLocation.latitude.toFixed(4)}</p>
                <p style="font-size: 14px; color: var(--primary-color);">Longitude: ${this.currentLocation.longitude.toFixed(4)}</p>
                <p style="color: var(--success-color); margin-top: 15px; font-weight: 600;">✅ Location tracking active</p>
            `;
        }
    }

    showAlert(message, type = 'info') {
        const alertContainer = document.getElementById('alertContainer');
        if (!alertContainer) return;

        const alert = document.createElement('div');
        alert.className = `alert alert-${type}`;
        alert.style.marginBottom = '10px';
        alert.innerHTML = `
            <div>${message}</div>
            <button onclick="this.parentElement.remove()" style="background: none; border: none; color: inherit; font-size: 20px; cursor: pointer; position: absolute; right: 10px; top: 5px;">&times;</button>
        `;
        alertContainer.appendChild(alert);

        setTimeout(() => alert.remove(), 4000);
    }

    logout() {
        localStorage.removeItem('token');
        localStorage.removeItem('userId');
        this.token = null;
        this.userId = null;
        this.showLoginPage();
    }
}

// Initialize app
const app = new FraudDetectionApp();
