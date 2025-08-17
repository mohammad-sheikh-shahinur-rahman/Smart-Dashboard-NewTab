/**
 * API Keys Configuration
 * Store your API keys here for external services
 * 
 * IMPORTANT: For production use, consider using environment variables
 * or a more secure key management system.
 */

const API_KEYS = {
    // Google Gemini AI API
    GEMINI_API_KEY: 'AIzaSyC81PcmFULHAoU0WzuRKqntFeq430iN-fU',
    
    // Weather API (OpenWeatherMap) - Get free key from https://openweathermap.org/api
    WEATHER_API_KEY: 'YOUR_WEATHER_API_KEY',
    
    // Currency Exchange API (Open Exchange Rates) - Get free key from https://openexchangerates.org/
    CURRENCY_API_KEY: 'YOUR_CURRENCY_API_KEY',
    
    // Alternative Currency APIs (fallback options)
    FIXER_API_KEY: 'YOUR_FIXER_API_KEY', // https://fixer.io/
    CURRENCYLAYER_API_KEY: 'YOUR_CURRENCYLAYER_API_KEY', // https://currencylayer.com/
    
    // Google OAuth (for Calendar integration)
    GOOGLE_CLIENT_ID: 'YOUR_GOOGLE_CLIENT_ID',
    GOOGLE_CLIENT_SECRET: 'YOUR_GOOGLE_CLIENT_SECRET',
    
    // GitHub OAuth (for GitHub integration)
    GITHUB_CLIENT_ID: 'YOUR_GITHUB_CLIENT_ID',
    GITHUB_CLIENT_SECRET: 'YOUR_GITHUB_CLIENT_SECRET',
    
    // Notion OAuth (for Notion integration)
    NOTION_CLIENT_ID: 'YOUR_NOTION_CLIENT_ID',
    NOTION_CLIENT_SECRET: 'YOUR_NOTION_CLIENT_SECRET',
    
    // Slack OAuth (for Slack integration)
    SLACK_CLIENT_ID: 'YOUR_SLACK_CLIENT_ID',
    SLACK_CLIENT_SECRET: 'YOUR_SLACK_CLIENT_SECRET'
};

// API Configuration with fallbacks and error handling
const API_CONFIG = {
    // Weather API configuration
    weather: {
        primary: {
            url: 'https://api.openweathermap.org/data/2.5/weather',
            key: API_KEYS.WEATHER_API_KEY,
            name: 'OpenWeatherMap'
        },
        fallback: {
            url: 'https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline',
            key: 'YOUR_VISUALCROSSING_API_KEY',
            name: 'Visual Crossing'
        }
    },
    
    // Currency API configuration
    currency: {
        primary: {
            url: 'https://openexchangerates.org/api/latest.json',
            key: API_KEYS.CURRENCY_API_KEY,
            name: 'Open Exchange Rates'
        },
        fallbacks: [
            {
                url: 'http://data.fixer.io/api/latest',
                key: API_KEYS.FIXER_API_KEY,
                name: 'Fixer.io'
            },
            {
                url: 'http://api.currencylayer.com/live',
                key: API_KEYS.CURRENCYLAYER_API_KEY,
                name: 'Currency Layer'
            }
        ]
    },
    
    // AI API configuration
    ai: {
        gemini: {
            url: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent',
            key: API_KEYS.GEMINI_API_KEY,
            name: 'Google Gemini'
        }
    }
};

// Utility functions for API key management
class APIKeyManager {
    constructor() {
        this.keys = API_KEYS;
        this.config = API_CONFIG;
    }

    // Get API key with validation
    getKey(service) {
        const key = this.keys[service];
        if (!key || key === `YOUR_${service}_API_KEY`) {
            console.warn(`API key for ${service} is not configured`);
            return null;
        }
        return key;
    }

    // Check if API key is configured
    isConfigured(service) {
        const key = this.getKey(service);
        return key !== null;
    }

    // Get API configuration
    getConfig(service) {
        return this.config[service] || null;
    }

    // Validate all API keys
    validateKeys() {
        const validation = {};
        
        Object.keys(this.keys).forEach(key => {
            validation[key] = this.isConfigured(key);
        });
        
        return validation;
    }

    // Get missing API keys
    getMissingKeys() {
        const validation = this.validateKeys();
        return Object.keys(validation).filter(key => !validation[key]);
    }

    // Update API key (for settings)
    updateKey(service, newKey) {
        if (this.keys.hasOwnProperty(service)) {
            this.keys[service] = newKey;
            return true;
        }
        return false;
    }

    // Get API status for all services
    getAPIStatus() {
        return {
            weather: this.isConfigured('WEATHER_API_KEY'),
            currency: this.isConfigured('CURRENCY_API_KEY'),
            ai: this.isConfigured('GEMINI_API_KEY'),
            google: this.isConfigured('GOOGLE_CLIENT_ID'),
            github: this.isConfigured('GITHUB_CLIENT_ID'),
            notion: this.isConfigured('NOTION_CLIENT_ID'),
            slack: this.isConfigured('SLACK_CLIENT_ID')
        };
    }
}

// Initialize API key manager
const apiKeyManager = new APIKeyManager();

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { API_KEYS, API_CONFIG, APIKeyManager };
} else {
    window.API_KEYS = API_KEYS;
    window.API_CONFIG = API_CONFIG;
    window.apiKeyManager = apiKeyManager;
}
