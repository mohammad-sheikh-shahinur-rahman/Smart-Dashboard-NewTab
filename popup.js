/* 
 * Smart Dashboard NewTab - Popup
 * Copyright (c) 2024
 * Licensed under the MIT License
 */

document.addEventListener('DOMContentLoaded', () => {
    // Initialize theme
    initTheme();
    
    // Set up event listeners
    setupEventListeners();
});

function initTheme() {
    // Check system preference for theme
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    document.documentElement.setAttribute('data-theme', prefersDark ? 'dark' : 'light');
}

function setupEventListeners() {
    // Open dashboard
    const openDashboardBtn = document.getElementById('open-dashboard');
    if (openDashboardBtn) {
        openDashboardBtn.addEventListener('click', (e) => {
            e.preventDefault();
            chrome.tabs.create({ url: chrome.runtime.getURL('index.html') });
            window.close();
        });
    }

    // Open settings
    const openSettingsBtn = document.getElementById('open-settings');
    if (openSettingsBtn) {
        openSettingsBtn.addEventListener('click', (e) => {
            e.preventDefault();
            chrome.tabs.create({ url: chrome.runtime.getURL('index.html#settings') });
            window.close();
        });
    }

    // Refresh quote
    const refreshQuoteBtn = document.getElementById('refresh-quote');
    if (refreshQuoteBtn) {
        refreshQuoteBtn.addEventListener('click', (e) => {
            e.preventDefault();
            // Send message to background script to refresh quote
            chrome.runtime.sendMessage({ action: 'refreshQuote' });
            window.close();
        });
    }
}
