/* 
 * Smart Dashboard NewTab - Background Service Worker
 * Copyright (c) 2024
 * Licensed under the MIT License
 */

// Handle extension installation
chrome.runtime.onInstalled.addListener((details) => {
    if (details.reason === 'install') {
        console.log('Smart Dashboard NewTab installed');
        
        // Set default settings
        chrome.storage.sync.set({
            userName: '',
            theme: 'auto',
            weatherEnabled: true,
            quoteEnabled: true,
            statsEnabled: true,
            searchEngine: 'google',
            language: 'en'
        });
        
        // Open welcome page
        chrome.tabs.create({
            url: chrome.runtime.getURL('index.html')
        });
    } else if (details.reason === 'update') {
        console.log('Smart Dashboard NewTab updated');
    }
});

// Handle extension startup
chrome.runtime.onStartup.addListener(() => {
    console.log('Smart Dashboard NewTab started');
});

// Handle messages from content scripts or popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    switch (request.action) {
        case 'getStats':
            getStats().then(sendResponse);
            return true; // Keep message channel open for async response
            
        case 'updateStats':
            updateStats(request.data).then(sendResponse);
            return true;
            
        case 'getWeather':
            getWeather().then(sendResponse);
            return true;
            
        case 'getQuotes':
            getQuotes().then(sendResponse);
            return true;
            
        default:
            console.warn('Unknown message action:', request.action);
            sendResponse({ error: 'Unknown action' });
    }
});

// Handle tab updates for stats tracking
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.status === 'complete' && tab.url) {
        updateTabStats(tab);
    }
});

// Handle tab removal for stats tracking
chrome.tabs.onRemoved.addListener((tabId, removeInfo) => {
    updateTabRemovalStats(tabId);
});

// Handle browser action click
chrome.action.onClicked.addListener((tab) => {
    // Open the dashboard in a new tab
    chrome.tabs.create({
        url: chrome.runtime.getURL('index.html')
    });
});

// Utility functions
async function getStats() {
    try {
        const result = await chrome.storage.local.get('dashboardStats');
        return result.dashboardStats || {
            tabsOpened: 0,
            timeOnline: 0,
            lastUpdate: Date.now()
        };
    } catch (error) {
        console.error('Failed to get stats:', error);
        return {
            tabsOpened: 0,
            timeOnline: 0,
            lastUpdate: Date.now()
        };
    }
}

async function updateStats(newStats) {
    try {
        const currentStats = await getStats();
        const updatedStats = { ...currentStats, ...newStats, lastUpdate: Date.now() };
        
        await chrome.storage.local.set({ dashboardStats: updatedStats });
        return { success: true };
    } catch (error) {
        console.error('Failed to update stats:', error);
        return { error: error.message };
    }
}

async function updateTabStats(tab) {
    try {
        const stats = await getStats();
        stats.tabsOpened += 1;
        await chrome.storage.local.set({ dashboardStats: stats });
    } catch (error) {
        console.error('Failed to update tab stats:', error);
    }
}

async function updateTabRemovalStats(tabId) {
    // This could be used to track tab usage patterns
    // For now, we'll just log it
    console.log('Tab removed:', tabId);
}

async function getWeather() {
    // This would integrate with a weather API
    // For now, return mock data
    return {
        temperature: Math.floor(Math.random() * 30) + 10,
        condition: 'Partly Cloudy',
        location: 'Your City'
    };
}

async function getQuotes() {
    try {
        const response = await fetch('https://api.quotable.io/random');
        if (response.ok) {
            return await response.json();
        } else {
            throw new Error('Failed to fetch quote');
        }
    } catch (error) {
        console.error('Failed to get quote:', error);
        // Return fallback quote
        return {
            content: "The only way to do great work is to love what you do.",
            author: "Steve Jobs"
        };
    }
}

// Periodic tasks
setInterval(async () => {
    try {
        const stats = await getStats();
        stats.timeOnline += 1; // Increment by 1 minute
        await chrome.storage.local.set({ dashboardStats: stats });
    } catch (error) {
        console.error('Failed to update online time:', error);
    }
}, 60000); // Update every minute

// Handle storage changes
chrome.storage.onChanged.addListener((changes, namespace) => {
    if (namespace === 'sync') {
        console.log('Settings changed:', changes);
    } else if (namespace === 'local') {
        console.log('Local data changed:', changes);
    }
});

// Handle alarms (for periodic tasks) - only if alarms API is available
if (typeof chrome.alarms !== 'undefined') {
    chrome.alarms.onAlarm.addListener((alarm) => {
        switch (alarm.name) {
            case 'updateStats':
                updatePeriodicStats();
                break;
            case 'updateWeather':
                updateWeatherData();
                break;
            default:
                console.log('Unknown alarm:', alarm.name);
        }
    });

    // Create alarms for periodic tasks
    try {
        chrome.alarms.create('updateStats', { periodInMinutes: 1 });
        chrome.alarms.create('updateWeather', { periodInMinutes: 30 });
    } catch (error) {
        console.log('Alarms not available:', error);
    }
}

async function updatePeriodicStats() {
    try {
        const stats = await getStats();
        stats.timeOnline += 1;
        await chrome.storage.local.set({ dashboardStats: stats });
    } catch (error) {
        console.error('Failed to update periodic stats:', error);
    }
}

async function updateWeatherData() {
    // This would update weather data periodically
    console.log('Updating weather data...');
}

// Handle context menu creation (only if contextMenus permission is available)
if (typeof chrome.contextMenus !== 'undefined') {
    chrome.runtime.onInstalled.addListener(() => {
        try {
            chrome.contextMenus.create({
                id: 'openDashboard',
                title: 'Open Smart Dashboard',
                contexts: ['action']
            });
            
            chrome.contextMenus.create({
                id: 'searchSelection',
                title: 'Search "%s"',
                contexts: ['selection']
            });
        } catch (error) {
            console.log('Context menus not available:', error);
        }
    });

    // Handle context menu clicks
    chrome.contextMenus.onClicked.addListener((info, tab) => {
        switch (info.menuItemId) {
            case 'openDashboard':
                chrome.tabs.create({
                    url: chrome.runtime.getURL('index.html')
                });
                break;
            case 'searchSelection':
                chrome.tabs.create({
                    url: `https://www.google.com/search?q=${encodeURIComponent(info.selectionText)}`
                });
                break;
        }
    });
}
