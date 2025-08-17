/* 
 * Smart Dashboard NewTab - Currency Converter Widget
 * Copyright (c) 2024
 * Licensed under the MIT License
 */

class ConverterWidget {
    constructor() {
        this.rates = {};
        this.favorites = [];
        this.lastUpdate = 0;
        this.updateInterval = 60 * 60 * 1000; // 1 hour
        
        this.fromCurrency = document.getElementById('from-currency');
        this.toCurrency = document.getElementById('to-currency');
        this.fromAmount = document.getElementById('from-amount');
        this.convertedAmount = document.getElementById('converted-amount');
        this.converterRate = document.getElementById('converter-rate');
        this.swapBtn = document.getElementById('converter-swap-btn');
        this.favoritesBtn = document.getElementById('converter-favorites-btn');
        
        this.storageKey = 'smartDashboard_converter';
        this.favoritesKey = 'smartDashboard_converter_favorites';
        
        this.currencies = {
            USD: { name: 'US Dollar', symbol: '$' },
            EUR: { name: 'Euro', symbol: '€' },
            GBP: { name: 'British Pound', symbol: '£' },
            JPY: { name: 'Japanese Yen', symbol: '¥' },
            INR: { name: 'Indian Rupee', symbol: '₹' },
            BDT: { name: 'Bangladeshi Taka', symbol: '৳' },
            CAD: { name: 'Canadian Dollar', symbol: 'C$' },
            AUD: { name: 'Australian Dollar', symbol: 'A$' },
            CHF: { name: 'Swiss Franc', symbol: 'CHF' },
            CNY: { name: 'Chinese Yuan', symbol: '¥' },
            KRW: { name: 'South Korean Won', symbol: '₩' },
            BRL: { name: 'Brazilian Real', symbol: 'R$' },
            RUB: { name: 'Russian Ruble', symbol: '₽' },
            ZAR: { name: 'South African Rand', symbol: 'R' },
            SEK: { name: 'Swedish Krona', symbol: 'kr' },
            NOK: { name: 'Norwegian Krone', symbol: 'kr' },
            DKK: { name: 'Danish Krone', symbol: 'kr' },
            PLN: { name: 'Polish Złoty', symbol: 'zł' },
            CZK: { name: 'Czech Koruna', symbol: 'Kč' },
            HUF: { name: 'Hungarian Forint', symbol: 'Ft' },
            TRY: { name: 'Turkish Lira', symbol: '₺' }
        };
    }

    async init() {
        await this.loadFavorites();
        this.setupEventListeners();
        this.populateCurrencySelects();
        
        try {
            await this.updateRates();
        } catch (error) {
            console.error('Failed to initialize exchange rates:', error);
            // Continue with fallback rates
        }
        
        this.convert();
        
        // Set up periodic updates
        setInterval(() => {
            this.updateRates().catch(error => {
                console.warn('Periodic rate update failed:', error);
            });
        }, this.updateInterval);
    }

    setupEventListeners() {
        if (this.fromCurrency) {
            this.fromCurrency.addEventListener('change', () => {
                this.convert();
            });
        }

        if (this.toCurrency) {
            this.toCurrency.addEventListener('change', () => {
                this.convert();
            });
        }

        if (this.fromAmount) {
            this.fromAmount.addEventListener('input', () => {
                this.convert();
            });
        }

        if (this.swapBtn) {
            this.swapBtn.addEventListener('click', () => {
                this.swapCurrencies();
            });
        }

        if (this.favoritesBtn) {
            this.favoritesBtn.addEventListener('click', () => {
                this.toggleFavorites();
            });
        }

        // Add refresh button event listener
        const refreshBtn = document.getElementById('converter-refresh-btn');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', async () => {
                refreshBtn.disabled = true;
                refreshBtn.innerHTML = '<span class="material-symbols-outlined rotating">refresh</span>';
                
                try {
                    await this.updateRates();
                    this.convert();
                } catch (error) {
                    console.error('Manual refresh failed:', error);
                } finally {
                    refreshBtn.disabled = false;
                    refreshBtn.innerHTML = '<span class="material-symbols-outlined">refresh</span>';
                }
            });
        }
    }

    populateCurrencySelects() {
        if (!this.fromCurrency || !this.toCurrency) return;

        // Clear existing options
        this.fromCurrency.innerHTML = '';
        this.toCurrency.innerHTML = '';

        // Add currencies to selects
        Object.entries(this.currencies).forEach(([code, currency]) => {
            const fromOption = document.createElement('option');
            fromOption.value = code;
            fromOption.textContent = `${code} - ${currency.name}`;
            this.fromCurrency.appendChild(fromOption);

            const toOption = document.createElement('option');
            toOption.value = code;
            toOption.textContent = `${code} - ${currency.name}`;
            this.toCurrency.appendChild(toOption);
        });

        // Set default values
        this.fromCurrency.value = 'USD';
        this.toCurrency.value = 'EUR';
    }

    async updateRates() {
        const now = Date.now();
        
        // Check if we need to update rates
        if (this.rates.USD && (now - this.lastUpdate) < this.updateInterval) {
            return;
        }

        // Try multiple API sources for better reliability
        const apiSources = [
            {
                name: 'Exchange Rate API',
                url: 'https://api.exchangerate-api.com/v4/latest/USD'
            },
            {
                name: 'Fixer.io',
                url: 'https://api.fixer.io/latest?base=USD'
            },
            {
                name: 'Open Exchange Rates',
                url: 'https://openexchangerates.org/api/latest.json?app_id=1ee4f244e7e54a46a3ef0e3f6b846140&base=USD'
            }
        ];

        for (const source of apiSources) {
            try {
                console.log(`Trying ${source.name} API...`);
                
                // Create AbortController for timeout
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
                
                const response = await fetch(source.url, {
                    method: 'GET',
                    headers: {
                        'Accept': 'application/json',
                        'User-Agent': 'SmartDashboard/1.0'
                    },
                    signal: controller.signal
                });
                
                clearTimeout(timeoutId);
                
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                
                const data = await response.json();
                
                // Handle different API response formats
                if (data.rates) {
                    // Open Exchange Rates format
                    this.rates = data.rates;
                } else if (data.conversion_rates) {
                    // Exchange Rate API format
                    this.rates = data.conversion_rates;
                } else if (data.rates && data.base) {
                    // Fixer.io format
                    this.rates = data.rates;
                } else {
                    throw new Error('Unexpected API response format');
                }
                
                this.rates.USD = 1; // Ensure USD is always 1 as base
                this.lastUpdate = now;
                await this.saveRates();
                
                console.log(`Successfully updated rates from ${source.name}`);
                
                // Show success notification if this was a manual refresh
                if (this.rates.USD && this.lastUpdate > 0) {
                    this.showNotification('Exchange rates updated successfully!', 'success');
                }
                
                return; // Success, exit the loop
                
            } catch (error) {
                console.warn(`Failed to fetch from ${source.name}:`, error.message);
                if (error.name === 'AbortError') {
                    console.warn(`${source.name} request timed out`);
                }
                continue; // Try next source
            }
        }

        // If all APIs fail, try one more free API as last resort
        try {
            console.log('Trying Currency Layer API as last resort...');
            const response = await fetch('https://api.currencylayer.com/live?access_key=free&currencies=EUR,GBP,JPY,INR,BDT,CAD,AUD,CHF,CNY,KRW,BRL,RUB,ZAR,SEK,NOK,DKK,PLN,CZK,HUF,TRY&source=USD&format=1', {
                method: 'GET',
                headers: {
                    'Accept': 'application/json'
                }
            });
            
            if (response.ok) {
                const data = await response.json();
                if (data.quotes) {
                    this.rates = {};
                    Object.keys(data.quotes).forEach(key => {
                        const currency = key.replace('USD', '');
                        this.rates[currency] = data.quotes[key];
                    });
                    this.rates.USD = 1;
                    this.lastUpdate = now;
                    await this.saveRates();
                    console.log('Successfully updated rates from Currency Layer API');
                    this.showNotification('Exchange rates updated successfully!', 'success');
                    return;
                }
            }
        } catch (error) {
            console.warn('Currency Layer API also failed:', error.message);
        }
        
        // If all APIs fail, use fallback rates
        console.warn('All exchange rate APIs failed, using fallback rates');
        
        // Show user notification about using fallback rates
        this.showNotification('Using offline exchange rates. Some rates may be outdated.', 'warning');
        
        this.rates = {
            USD: 1,
            EUR: 0.85,
            GBP: 0.73,
            JPY: 110.5,
            INR: 74.5,
            BDT: 109.5,
            CAD: 1.25,
            AUD: 1.35,
            CHF: 0.92,
            CNY: 6.45,
            KRW: 1150,
            BRL: 5.25,
            RUB: 75.5,
            ZAR: 14.8,
            SEK: 8.65,
            NOK: 8.45,
            DKK: 6.25,
            PLN: 3.85,
            CZK: 21.5,
            HUF: 305,
            TRY: 8.75
        };
        
        // Save fallback rates
        this.lastUpdate = now;
        await this.saveRates();
    }

    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `converter-notification ${type}`;
        notification.textContent = message;
        
        // Style the notification
        let bgColor, textColor, borderColor;
        switch (type) {
            case 'warning':
                bgColor = '#fff3cd';
                textColor = '#856404';
                borderColor = '#ffeaa7';
                break;
            case 'success':
                bgColor = '#d4edda';
                textColor = '#155724';
                borderColor = '#c3e6cb';
                break;
            default:
                bgColor = '#d1ecf1';
                textColor = '#0c5460';
                borderColor = '#bee5eb';
        }
        
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${bgColor};
            color: ${textColor};
            border: 1px solid ${borderColor};
            border-radius: 4px;
            padding: 12px 16px;
            font-size: 14px;
            z-index: 10000;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            animation: slideInRight 0.3s ease-out;
        `;
        
        // Add to page
        document.body.appendChild(notification);
        
        // Remove after 5 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                notification.style.animation = 'slideOutRight 0.3s ease-in';
                setTimeout(() => {
                    if (notification.parentNode) {
                        notification.parentNode.removeChild(notification);
                    }
                }, 300);
            }
        }, 5000);
    }

    convert() {
        if (!this.fromAmount || !this.convertedAmount || !this.converterRate) return;

        const amount = parseFloat(this.fromAmount.value) || 0;
        const fromCode = this.fromCurrency.value;
        const toCode = this.toCurrency.value;

        // Check if rates are available
        if (!this.rates || !this.rates[fromCode] || !this.rates[toCode]) {
            this.convertedAmount.textContent = 'Loading...';
            this.converterRate.textContent = 'Updating rates...';
            
            // Try to update rates if they're not available
            this.updateRates().then(() => {
                this.convert(); // Retry conversion after rates are loaded
            }).catch(() => {
                this.convertedAmount.textContent = 'Error';
                this.converterRate.textContent = 'Rates unavailable';
            });
            return;
        }

        // Convert using USD as base
        const usdAmount = amount / this.rates[fromCode];
        const convertedValue = usdAmount * this.rates[toCode];

        // Format the result
        this.convertedAmount.textContent = this.formatCurrency(convertedValue, toCode);
        
        // Update rate display
        const rate = this.rates[toCode] / this.rates[fromCode];
        this.converterRate.textContent = `Rate: 1 ${fromCode} = ${this.formatCurrency(rate, toCode)}`;
    }

    formatCurrency(amount, currencyCode) {
        const currency = this.currencies[currencyCode];
        if (!currency) return amount.toFixed(2);

        // Format based on currency
        switch (currencyCode) {
            case 'JPY':
            case 'KRW':
            case 'HUF':
                return `${currency.symbol}${Math.round(amount).toLocaleString()}`;
            case 'INR':
                return `${currency.symbol}${amount.toFixed(2)}`;
            default:
                return `${currency.symbol}${amount.toFixed(2)}`;
        }
    }

    swapCurrencies() {
        if (!this.fromCurrency || !this.toCurrency) return;

        const temp = this.fromCurrency.value;
        this.fromCurrency.value = this.toCurrency.value;
        this.toCurrency.value = temp;

        this.convert();
    }

    async toggleFavorites() {
        const fromCode = this.fromCurrency.value;
        const toCode = this.toCurrency.value;
        const pair = `${fromCode}-${toCode}`;

        const index = this.favorites.indexOf(pair);
        if (index > -1) {
            this.favorites.splice(index, 1);
        } else {
            this.favorites.unshift(pair);
            // Keep only last 5 favorites
            if (this.favorites.length > 5) {
                this.favorites = this.favorites.slice(0, 5);
            }
        }

        await this.saveFavorites();
        this.updateFavoritesButton();
    }

    updateFavoritesButton() {
        if (!this.favoritesBtn) return;

        const fromCode = this.fromCurrency.value;
        const toCode = this.toCurrency.value;
        const pair = `${fromCode}-${toCode}`;

        const isFavorite = this.favorites.includes(pair);
        
        if (isFavorite) {
            this.favoritesBtn.innerHTML = '<span class="material-symbols-outlined">favorite</span>';
            this.favoritesBtn.classList.add('favorite');
        } else {
            this.favoritesBtn.innerHTML = '<span class="material-symbols-outlined">favorite_border</span>';
            this.favoritesBtn.classList.remove('favorite');
        }
    }

    showFavoritesPanel() {
        const panel = document.createElement('div');
        panel.id = 'converter-favorites-panel';
        panel.className = 'converter-favorites-panel';
        
        panel.innerHTML = `
            <div class="favorites-header">
                <h4>Favorite Pairs</h4>
                <button class="close-btn" id="close-favorites">
                    <span class="material-symbols-outlined">close</span>
                </button>
            </div>
            <div class="favorites-list" id="favorites-list"></div>
        `;
        
        document.body.appendChild(panel);
        this.renderFavorites();
        
        // Close button
        const closeBtn = panel.querySelector('#close-favorites');
        closeBtn.addEventListener('click', () => {
            panel.remove();
        });
    }

    renderFavorites() {
        const favoritesList = document.getElementById('favorites-list');
        if (!favoritesList) return;
        
        favoritesList.innerHTML = '';
        
        if (this.favorites.length === 0) {
            favoritesList.innerHTML = '<div class="no-favorites">No favorite pairs yet</div>';
            return;
        }
        
        this.favorites.forEach(pair => {
            const [fromCode, toCode] = pair.split('-');
            const fromCurrency = this.currencies[fromCode];
            const toCurrency = this.currencies[toCode];
            
            if (!fromCurrency || !toCurrency) return;
            
            const favoriteItem = document.createElement('div');
            favoriteItem.className = 'favorite-item';
            favoriteItem.innerHTML = `
                <div class="favorite-pair">
                    <span class="from-currency">${fromCode}</span>
                    <span class="material-symbols-outlined">arrow_forward</span>
                    <span class="to-currency">${toCode}</span>
                </div>
                <div class="favorite-rate">${this.formatCurrency(1, fromCode)} = ${this.formatCurrency(this.rates[toCode] / this.rates[fromCode], toCode)}</div>
                <button class="favorite-use-btn" data-pair="${pair}">
                    <span class="material-symbols-outlined">swap_horiz</span>
                </button>
            `;
            
            const useBtn = favoriteItem.querySelector('.favorite-use-btn');
            useBtn.addEventListener('click', () => {
                this.useFavoritePair(pair);
            });
            
            favoritesList.appendChild(favoriteItem);
        });
    }

    useFavoritePair(pair) {
        const [fromCode, toCode] = pair.split('-');
        
        this.fromCurrency.value = fromCode;
        this.toCurrency.value = toCode;
        this.convert();
        this.updateFavoritesButton();
        
        // Close panel
        const panel = document.getElementById('converter-favorites-panel');
        if (panel) {
            panel.remove();
        }
    }

    async loadFavorites() {
        try {
            const result = await chrome.storage.sync.get(this.favoritesKey);
            this.favorites = result[this.favoritesKey] || [];
        } catch (error) {
            console.error('Failed to load converter favorites:', error);
            this.favorites = [];
        }
    }

    async saveFavorites() {
        try {
            await chrome.storage.sync.set({
                [this.favoritesKey]: this.favorites
            });
        } catch (error) {
            console.error('Failed to save converter favorites:', error);
        }
    }

    async saveRates() {
        try {
            await chrome.storage.sync.set({
                [this.storageKey]: {
                    rates: this.rates,
                    lastUpdate: this.lastUpdate
                }
            });
        } catch (error) {
            console.error('Failed to save exchange rates:', error);
        }
    }

    // Public methods
    getRate(fromCurrency, toCurrency) {
        if (!this.rates[fromCurrency] || !this.rates[toCurrency]) {
            return null;
        }
        return this.rates[toCurrency] / this.rates[fromCurrency];
    }

    convertAmount(amount, fromCurrency, toCurrency) {
        const rate = this.getRate(fromCurrency, toCurrency);
        if (rate === null) return null;
        return amount * rate;
    }

    getSupportedCurrencies() {
        return Object.keys(this.currencies);
    }

    // Real-time rate updates (for future enhancement)
    startRateUpdates() {
        setInterval(() => {
            this.updateRates();
        }, this.updateInterval);
    }
}

// Create widget instance when script loads
window.ConverterWidget = new ConverterWidget();

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ConverterWidget;
}
