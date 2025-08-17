/* 
 * Smart Dashboard NewTab - Analytics Module
 * Copyright (c) 2024
 * Licensed under the MIT License
 */

class Analytics {
    constructor() {
        this.events = [];
        this.metrics = {
            pageViews: 0,
            searchQueries: 0,
            widgetInteractions: 0,
            todoItems: 0,
            notesCreated: 0,
            weatherChecks: 0,
            quoteRefreshes: 0,
            settingsChanges: 0,
            errors: 0,
            performance: {
                loadTime: 0,
                renderTime: 0,
                memoryUsage: 0
            }
        };
        this.sessionStart = Date.now();
        this.isEnabled = true;
        this.init();
    }

    async init() {
        try {
            // Load analytics settings
            const result = await chrome.storage.sync.get('analyticsEnabled');
            this.isEnabled = result.analyticsEnabled !== false; // Default to true
            
            // Load existing metrics
            await this.loadMetrics();
            
            // Start performance monitoring
            this.startPerformanceMonitoring();
            
            // Set up periodic saving
            setInterval(() => {
                this.saveMetrics();
            }, 30000); // Save every 30 seconds
            
            console.log('Analytics initialized');
        } catch (error) {
            console.error('Failed to initialize analytics:', error);
        }
    }

    async loadMetrics() {
        try {
            const result = await chrome.storage.local.get('analyticsMetrics');
            if (result.analyticsMetrics) {
                this.metrics = { ...this.metrics, ...result.analyticsMetrics };
            }
        } catch (error) {
            console.error('Failed to load analytics metrics:', error);
        }
    }

    async saveMetrics() {
        if (!this.isEnabled) return;
        
        try {
            await chrome.storage.local.set({
                analyticsMetrics: this.metrics
            });
        } catch (error) {
            console.error('Failed to save analytics metrics:', error);
        }
    }

    trackEvent(eventName, data = {}) {
        if (!this.isEnabled) return;
        
        const event = {
            name: eventName,
            data: data,
            timestamp: Date.now(),
            sessionId: this.sessionStart
        };
        
        this.events.push(event);
        
        // Update metrics based on event type
        this.updateMetrics(eventName, data);
        
        // Keep only last 1000 events to prevent memory issues
        if (this.events.length > 1000) {
            this.events = this.events.slice(-1000);
        }
    }

    updateMetrics(eventName, data) {
        switch (eventName) {
            case 'page_view':
                this.metrics.pageViews++;
                break;
            case 'search_query':
                this.metrics.searchQueries++;
                break;
            case 'widget_interaction':
                this.metrics.widgetInteractions++;
                break;
            case 'todo_added':
                this.metrics.todoItems++;
                break;
            case 'note_created':
                this.metrics.notesCreated++;
                break;
            case 'weather_check':
                this.metrics.weatherChecks++;
                break;
            case 'quote_refresh':
                this.metrics.quoteRefreshes++;
                break;
            case 'settings_change':
                this.metrics.settingsChanges++;
                break;
            case 'error':
                this.metrics.errors++;
                break;
        }
    }

    startPerformanceMonitoring() {
        // Track page load time
        if (performance && performance.timing) {
            window.addEventListener('load', () => {
                const loadTime = performance.timing.loadEventEnd - performance.timing.navigationStart;
                this.metrics.performance.loadTime = loadTime;
                this.trackEvent('performance_load', { loadTime });
            });
        }

        // Track memory usage if available
        if (performance && performance.memory) {
            setInterval(() => {
                this.metrics.performance.memoryUsage = performance.memory.usedJSHeapSize;
            }, 60000); // Check every minute
        }
    }

    getStats() {
        const sessionDuration = Date.now() - this.sessionStart;
        const eventsPerMinute = this.events.length / (sessionDuration / 60000);
        
        return {
            ...this.metrics,
            sessionDuration,
            eventsPerMinute,
            totalEvents: this.events.length,
            isEnabled: this.isEnabled
        };
    }

    getWidgetStats() {
        const widgetEvents = this.events.filter(e => e.name === 'widget_interaction');
        const widgetStats = {};
        
        widgetEvents.forEach(event => {
            const widgetName = event.data.widget || 'unknown';
            widgetStats[widgetName] = (widgetStats[widgetName] || 0) + 1;
        });
        
        return widgetStats;
    }

    getSearchStats() {
        const searchEvents = this.events.filter(e => e.name === 'search_query');
        const searchStats = {
            total: searchEvents.length,
            engines: {},
            popularQueries: {}
        };
        
        searchEvents.forEach(event => {
            const engine = event.data.engine || 'unknown';
            const query = event.data.query || '';
            
            searchStats.engines[engine] = (searchStats.engines[engine] || 0) + 1;
            
            if (query) {
                searchStats.popularQueries[query] = (searchStats.popularQueries[query] || 0) + 1;
            }
        });
        
        return searchStats;
    }

    getProductivityStats() {
        const todoEvents = this.events.filter(e => e.name === 'todo_added');
        const noteEvents = this.events.filter(e => e.name === 'note_created');
        
        return {
            todoItems: todoEvents.length,
            notesCreated: noteEvents.length,
            totalProductivity: todoEvents.length + noteEvents.length
        };
    }

    exportData() {
        return {
            metrics: this.metrics,
            events: this.events,
            stats: this.getStats(),
            widgetStats: this.getWidgetStats(),
            searchStats: this.getSearchStats(),
            productivityStats: this.getProductivityStats(),
            exportDate: new Date().toISOString()
        };
    }

    clearData() {
        this.events = [];
        this.metrics = {
            pageViews: 0,
            searchQueries: 0,
            widgetInteractions: 0,
            todoItems: 0,
            notesCreated: 0,
            weatherChecks: 0,
            quoteRefreshes: 0,
            settingsChanges: 0,
            errors: 0,
            performance: {
                loadTime: 0,
                renderTime: 0,
                memoryUsage: 0
            }
        };
        this.saveMetrics();
    }

    toggleAnalytics(enabled) {
        this.isEnabled = enabled;
        chrome.storage.sync.set({ analyticsEnabled: enabled });
    }

    // Convenience methods for common tracking
    trackPageView() {
        this.trackEvent('page_view');
    }

    trackSearch(query, engine = 'google') {
        this.trackEvent('search_query', { query, engine });
    }

    trackWidgetInteraction(widget, action) {
        this.trackEvent('widget_interaction', { widget, action });
    }

    trackTodoAdded() {
        this.trackEvent('todo_added');
    }

    trackNoteCreated() {
        this.trackEvent('note_created');
    }

    trackWeatherCheck() {
        this.trackEvent('weather_check');
    }

    trackQuoteRefresh() {
        this.trackEvent('quote_refresh');
    }

    trackSettingsChange(setting, value) {
        this.trackEvent('settings_change', { setting, value });
    }

    trackError(error, context) {
        this.trackEvent('error', { error: error.message, context });
    }
}

// Initialize analytics globally
window.analytics = new Analytics();

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Analytics;
}
