/* 
 * Enhanced Weather Widget - Multi-API Weather Service
 * Features: Current weather, Forecast, Multiple APIs, Location detection
 * Copyright (c) 2024
 * Licensed under the MIT License
 */

class WeatherWidget {
    constructor() {
        this.currentWeather = null;
        this.forecast = [];
        this.location = null;
        this.isLoading = false;
        this.errorCount = 0;
        this.maxRetries = 3;
        this.retryDelay = 2000;
        
        // API configuration
        this.apiKey = window.API_KEYS?.WEATHER_API_KEY || '';
        this.apiEndpoints = [
            {
                name: 'Visual Crossing',
                url: 'https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/',
                keyParam: 'key',
                fallback: true
            },
            {
                name: 'OpenWeatherMap',
                url: 'https://api.openweathermap.org/data/2.5/',
                keyParam: 'appid',
                fallback: true
            }
        ];
        
        // DOM elements
        this.weatherContainer = document.getElementById('weather-container');
        this.weatherIcon = document.getElementById('weather-icon');
        this.weatherTemp = document.getElementById('weather-temp');
        this.weatherDesc = document.getElementById('weather-desc');
        this.weatherLocation = document.getElementById('weather-location');
        this.weatherDetails = document.getElementById('weather-details');
        this.weatherForecast = document.getElementById('weather-forecast');
        this.refreshBtn = document.getElementById('weather-refresh');
        this.locationBtn = document.getElementById('weather-location-btn');
        
        // Settings
        this.settings = {
            unit: 'celsius', // 'celsius' or 'fahrenheit'
            autoRefresh: true,
            refreshInterval: 30, // minutes
            showForecast: true,
            showDetails: true,
            location: null
        };
        
        this.refreshInterval = null;
        
        this.init();
    }

    async init() {
        try {
            await this.loadSettings();
            await this.loadLocation();
            this.setupEventListeners();
            this.startAutoRefresh();
            await this.fetchWeatherData();
            console.log('Weather Widget initialized successfully');
        } catch (error) {
            console.error('Failed to initialize Weather Widget:', error);
            this.showError('Failed to initialize weather service');
        }
    }

    setupEventListeners() {
        // Refresh button
        if (this.refreshBtn) {
            this.refreshBtn.addEventListener('click', () => {
                this.fetchWeatherData();
            });
        }

        // Location button
        if (this.locationBtn) {
            this.locationBtn.addEventListener('click', () => {
                this.detectLocation();
            });
        }

        // Unit toggle
        const unitToggle = document.getElementById('weather-unit-toggle');
        if (unitToggle) {
            unitToggle.addEventListener('change', (e) => {
                this.settings.unit = e.target.checked ? 'fahrenheit' : 'celsius';
                this.saveSettings();
                this.updateDisplay();
            });
        }

        // Auto refresh toggle
        const autoRefreshToggle = document.getElementById('weather-auto-refresh');
        if (autoRefreshToggle) {
            autoRefreshToggle.addEventListener('change', (e) => {
                this.settings.autoRefresh = e.target.checked;
                this.saveSettings();
                if (this.settings.autoRefresh) {
                    this.startAutoRefresh();
                } else {
                    this.stopAutoRefresh();
                }
            });
        }

        // Settings button
        const settingsBtn = document.getElementById('weather-settings');
        if (settingsBtn) {
            settingsBtn.addEventListener('click', () => {
                this.showSettings();
            });
        }

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.code === 'KeyW' && (e.ctrlKey || e.metaKey)) {
                e.preventDefault();
                this.fetchWeatherData();
            }
        });
    }

    async loadSettings() {
        try {
            const result = await chrome.storage.sync.get('weather_settings');
            this.settings = { ...this.settings, ...result.weather_settings };
        } catch (error) {
            console.error('Failed to load weather settings:', error);
        }
    }

    async saveSettings() {
        try {
            await chrome.storage.sync.set({
                weather_settings: this.settings
            });
        } catch (error) {
            console.error('Failed to save weather settings:', error);
        }
    }

    async loadLocation() {
        try {
            const result = await chrome.storage.sync.get('weather_location');
            this.location = result.weather_location || null;
        } catch (error) {
            console.error('Failed to load location:', error);
        }
    }

    async saveLocation() {
        try {
            await chrome.storage.sync.set({
                weather_location: this.location
            });
        } catch (error) {
            console.error('Failed to save location:', error);
        }
    }

    async detectLocation() {
        if (!navigator.geolocation) {
            this.showError('Geolocation is not supported by this browser');
                return;
            }

        this.showLoading('Detecting location...');

        try {
            const position = await this.getCurrentPosition();
            const { latitude, longitude } = position.coords;
            
            // Reverse geocoding to get location name
            const locationName = await this.reverseGeocode(latitude, longitude);
            
            this.location = {
                name: locationName,
                lat: latitude,
                lon: longitude
            };

            await this.saveLocation();
            await this.fetchWeatherData();
            this.showSuccess('Location updated successfully');
            
        } catch (error) {
            console.error('Location detection failed:', error);
            this.showError('Failed to detect location. Please try again.');
        }
    }

    getCurrentPosition() {
        return new Promise((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject, {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 300000 // 5 minutes
            });
        });
    }

    async reverseGeocode(lat, lon) {
        try {
            const response = await fetch(
                `https://api.openweathermap.org/geo/1.0/reverse?lat=${lat}&lon=${lon}&limit=1&appid=${this.apiKey}`
            );
            
            if (!response.ok) {
                throw new Error('Reverse geocoding failed');
            }
            
            const data = await response.json();
            if (data && data.length > 0) {
                const location = data[0];
                return `${location.name}, ${location.country}`;
            }
            
            return `${lat.toFixed(2)}, ${lon.toFixed(2)}`;
        } catch (error) {
            console.error('Reverse geocoding error:', error);
            return `${lat.toFixed(2)}, ${lon.toFixed(2)}`;
        }
    }

    async fetchWeatherData() {
        if (!this.location) {
            this.showError('No location set. Please set your location first.');
            return;
        }

        if (this.isLoading) return;

        this.isLoading = true;
        this.showLoading('Fetching weather data...');

        try {
            const weatherData = await this.fetchWeatherDataWithRetry();
            
            if (weatherData) {
                this.currentWeather = weatherData.current;
                this.forecast = weatherData.forecast || [];
                this.errorCount = 0;
                this.updateDisplay();
                this.showSuccess('Weather updated');
            } else {
                throw new Error('No weather data received');
            }
            
        } catch (error) {
            console.error('Weather fetch failed:', error);
            this.errorCount++;
            
            if (this.errorCount >= this.maxRetries) {
                this.showError('Failed to fetch weather data. Please try again later.');
            } else {
                setTimeout(() => {
                    this.fetchWeatherData();
                }, this.retryDelay);
            }
        } finally {
            this.isLoading = false;
            this.hideLoading();
        }
    }

    async fetchWeatherDataWithRetry() {
        for (const endpoint of this.apiEndpoints) {
            try {
                const data = await this.fetchFromAPI(endpoint);
                if (data) {
                    return this.parseWeatherData(data, endpoint.name);
                }
            } catch (error) {
                console.warn(`Failed to fetch from ${endpoint.name}:`, error);
                continue;
            }
        }
        
        throw new Error('All weather APIs failed');
    }

    async fetchFromAPI(endpoint) {
        const { lat, lon } = this.location;
        let url;
        let params;

        if (endpoint.name === 'Visual Crossing') {
            url = `${endpoint.url}${lat},${lon}`;
            params = new URLSearchParams({
                [endpoint.keyParam]: this.apiKey,
                unitGroup: 'metric',
                include: 'current,days',
                contentType: 'json'
            });
        } else if (endpoint.name === 'OpenWeatherMap') {
            url = `${endpoint.url}weather`;
            params = new URLSearchParams({
                lat: lat,
                lon: lon,
                [endpoint.keyParam]: this.apiKey,
                units: 'metric'
            });
        }

        const response = await fetch(`${url}?${params}`, {
            method: 'GET',
            headers: {
                'Accept': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        return await response.json();
    }

    parseWeatherData(data, apiName) {
        if (apiName === 'Visual Crossing') {
            return this.parseVisualCrossingData(data);
        } else if (apiName === 'OpenWeatherMap') {
            return this.parseOpenWeatherData(data);
        }
        
        throw new Error(`Unknown API: ${apiName}`);
    }

    parseVisualCrossingData(data) {
        const current = data.currentConditions;
        const days = data.days || [];

        return {
            current: {
                temp: current.temp,
                feels_like: current.feelslike,
                humidity: current.humidity,
                pressure: current.pressure,
                wind_speed: current.windspeed,
                wind_direction: current.winddir,
                description: current.conditions,
                icon: this.getWeatherIcon(current.icon),
                visibility: current.visibility,
                uv_index: current.uvindex,
                sunrise: current.sunrise,
                sunset: current.sunset
            },
            forecast: days.slice(1, 6).map(day => ({
                date: day.datetime,
                temp_max: day.tempmax,
                temp_min: day.tempmin,
                description: day.conditions,
                icon: this.getWeatherIcon(day.icon),
                humidity: day.humidity,
                wind_speed: day.windspeed,
                precipitation: day.precipprob
            }))
        };
    }

    parseOpenWeatherData(data) {
        return {
            current: {
                temp: data.main.temp,
                feels_like: data.main.feels_like,
                humidity: data.main.humidity,
                pressure: data.main.pressure,
                wind_speed: data.wind.speed,
                wind_direction: data.wind.deg,
                description: data.weather[0].description,
                icon: this.getWeatherIcon(data.weather[0].icon),
                visibility: data.visibility / 1000, // Convert to km
                sunrise: new Date(data.sys.sunrise * 1000).toLocaleTimeString(),
                sunset: new Date(data.sys.sunset * 1000).toLocaleTimeString()
            },
            forecast: [] // OpenWeatherMap current weather API doesn't include forecast
        };
    }

    getWeatherIcon(iconCode) {
        // Map weather icon codes to Material Symbols
        const iconMap = {
            'clear-day': 'wb_sunny',
            'clear-night': 'nightlight',
            'partly-cloudy-day': 'partly_cloudy_day',
            'partly-cloudy-night': 'partly_cloudy_night',
            'cloudy': 'cloud',
            'rain': 'rainy',
            'sleet': 'snowing',
            'snow': 'ac_unit',
            'wind': 'air',
            'fog': 'foggy',
            'thunder-rain': 'thunderstorm',
            '01d': 'wb_sunny',
            '01n': 'nightlight',
            '02d': 'partly_cloudy_day',
            '02n': 'partly_cloudy_night',
            '03d': 'cloud',
            '03n': 'cloud',
            '04d': 'cloud',
            '04n': 'cloud',
            '09d': 'rainy',
            '09n': 'rainy',
            '10d': 'rainy',
            '10n': 'rainy',
            '11d': 'thunderstorm',
            '11n': 'thunderstorm',
            '13d': 'ac_unit',
            '13n': 'ac_unit',
            '50d': 'foggy',
            '50n': 'foggy'
        };

        return iconMap[iconCode] || 'wb_sunny';
    }

    updateDisplay() {
        if (!this.currentWeather) return;

        // Update current weather
        if (this.weatherIcon) {
            this.weatherIcon.textContent = this.currentWeather.icon;
        }

        if (this.weatherTemp) {
            const temp = this.convertTemperature(this.currentWeather.temp);
            this.weatherTemp.textContent = `${temp}°${this.settings.unit === 'celsius' ? 'C' : 'F'}`;
        }

        if (this.weatherDesc) {
            this.weatherDesc.textContent = this.currentWeather.description;
        }

        if (this.weatherLocation) {
            this.weatherLocation.textContent = this.location.name;
        }

        // Update weather details
        if (this.weatherDetails && this.settings.showDetails) {
            this.weatherDetails.innerHTML = `
                <div class="weather-detail">
                    <span class="detail-label">Feels like</span>
                    <span class="detail-value">${this.convertTemperature(this.currentWeather.feels_like)}°${this.settings.unit === 'celsius' ? 'C' : 'F'}</span>
                </div>
                <div class="weather-detail">
                    <span class="detail-label">Humidity</span>
                    <span class="detail-value">${this.currentWeather.humidity}%</span>
                </div>
                <div class="weather-detail">
                    <span class="detail-label">Wind</span>
                    <span class="detail-value">${this.currentWeather.wind_speed} km/h</span>
                </div>
                <div class="weather-detail">
                    <span class="detail-label">Pressure</span>
                    <span class="detail-value">${this.currentWeather.pressure} hPa</span>
                </div>
                ${this.currentWeather.visibility ? `
                <div class="weather-detail">
                    <span class="detail-label">Visibility</span>
                    <span class="detail-value">${this.currentWeather.visibility} km</span>
                </div>
                ` : ''}
                ${this.currentWeather.uv_index ? `
                <div class="weather-detail">
                    <span class="detail-label">UV Index</span>
                    <span class="detail-value">${this.currentWeather.uv_index}</span>
                </div>
                ` : ''}
            `;
        }

        // Update forecast
        if (this.weatherForecast && this.settings.showForecast && this.forecast.length > 0) {
            this.weatherForecast.innerHTML = this.forecast.map(day => `
                <div class="forecast-day">
                    <div class="forecast-date">${this.formatDate(day.date)}</div>
                    <div class="forecast-icon">
                        <span class="material-symbols-outlined">${day.icon}</span>
                    </div>
                    <div class="forecast-temp">
                        <span class="temp-max">${this.convertTemperature(day.temp_max)}°</span>
                        <span class="temp-min">${this.convertTemperature(day.temp_min)}°</span>
                    </div>
                    <div class="forecast-desc">${day.description}</div>
                </div>
            `).join('');
        }

        // Update refresh button
        if (this.refreshBtn) {
            this.refreshBtn.disabled = this.isLoading;
            this.refreshBtn.innerHTML = this.isLoading ? 
                '<span class="material-symbols-outlined rotating">refresh</span>' : 
                '<span class="material-symbols-outlined">refresh</span>';
        }
    }

    convertTemperature(temp) {
        if (this.settings.unit === 'fahrenheit') {
            return Math.round((temp * 9/5) + 32);
        }
        return Math.round(temp);
    }

    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { 
            weekday: 'short',
            month: 'short',
            day: 'numeric'
        });
    }

    showSettings() {
        const dialog = document.createElement('div');
        dialog.className = 'modal-overlay';
        dialog.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>Weather Settings</h3>
                </div>
                <div class="modal-body">
                    <div class="form-group">
                        <label>Temperature Unit</label>
                        <select id="weather-unit" class="form-select">
                            <option value="celsius" ${this.settings.unit === 'celsius' ? 'selected' : ''}>Celsius (°C)</option>
                            <option value="fahrenheit" ${this.settings.unit === 'fahrenheit' ? 'selected' : ''}>Fahrenheit (°F)</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>
                            <input type="checkbox" id="weather-auto-refresh" ${this.settings.autoRefresh ? 'checked' : ''}>
                            Auto refresh weather
                        </label>
                    </div>
                    <div class="form-group">
                        <label>Refresh interval (minutes)</label>
                        <input type="number" id="weather-refresh-interval" value="${this.settings.refreshInterval}" min="5" max="120" class="form-input">
                    </div>
                    <div class="form-group">
                        <label>
                            <input type="checkbox" id="weather-show-forecast" ${this.settings.showForecast ? 'checked' : ''}>
                            Show 5-day forecast
                        </label>
                    </div>
                    <div class="form-group">
                        <label>
                            <input type="checkbox" id="weather-show-details" ${this.settings.showDetails ? 'checked' : ''}>
                            Show weather details
                        </label>
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-secondary" id="cancel-settings">Cancel</button>
                    <button class="btn btn-primary" id="save-settings">Save Settings</button>
                </div>
            </div>
        `;

        document.body.appendChild(dialog);

        dialog.querySelector('#cancel-settings').addEventListener('click', () => {
            document.body.removeChild(dialog);
        });

        dialog.querySelector('#save-settings').addEventListener('click', async () => {
            this.settings.unit = dialog.querySelector('#weather-unit').value;
            this.settings.autoRefresh = dialog.querySelector('#weather-auto-refresh').checked;
            this.settings.refreshInterval = parseInt(dialog.querySelector('#weather-refresh-interval').value);
            this.settings.showForecast = dialog.querySelector('#weather-show-forecast').checked;
            this.settings.showDetails = dialog.querySelector('#weather-show-details').checked;

            await this.saveSettings();
            
            if (this.settings.autoRefresh) {
                this.startAutoRefresh();
            } else {
                this.stopAutoRefresh();
            }

            this.updateDisplay();
            document.body.removeChild(dialog);
            this.showSuccess('Settings saved');
        });
    }

    startAutoRefresh() {
        if (!this.settings.autoRefresh) return;

        this.stopAutoRefresh();
        
        this.refreshInterval = setInterval(() => {
            this.fetchWeatherData();
        }, this.settings.refreshInterval * 60 * 1000);
    }

    stopAutoRefresh() {
        if (this.refreshInterval) {
            clearInterval(this.refreshInterval);
            this.refreshInterval = null;
        }
    }

    showLoading(message = 'Loading...') {
        if (this.weatherContainer) {
            this.weatherContainer.innerHTML = `
                <div class="weather-loading">
                    <span class="material-symbols-outlined rotating">refresh</span>
                    <p>${message}</p>
                </div>
            `;
        }
    }

    hideLoading() {
        // Loading is hidden when updateDisplay() is called
    }

    showSuccess(message) {
        this.showNotification(message, 'success');
    }

    showError(message) {
        this.showNotification(message, 'error');
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <div class="notification-message">${message}</div>
            <button class="notification-close">
                <span class="material-symbols-outlined">close</span>
            </button>
        `;

        document.body.appendChild(notification);

        setTimeout(() => {
            notification.classList.add('show');
        }, 100);

        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 3000);

        const closeBtn = notification.querySelector('.notification-close');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                notification.classList.remove('show');
                setTimeout(() => {
                    if (notification.parentNode) {
                        notification.parentNode.removeChild(notification);
                    }
                }, 300);
            });
        }
    }
}

// Initialize when DOM is loaded
if (document.readyState === 'loading') {
document.addEventListener('DOMContentLoaded', () => {
    window.WeatherWidget = new WeatherWidget();
});
} else {
    window.WeatherWidget = new WeatherWidget();
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = WeatherWidget;
}
