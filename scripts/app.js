/* 
 * Smart Dashboard NewTab - Main App
 * Copyright (c) 2024
 * Licensed under the MIT License
 */

class SmartDashboard {
    constructor() {
        this.settings = {};
        this.isInitialized = false;
        this.aiAssistant = null;
        this.analytics = null;
        this.productivityTools = null;
        this.integrations = null;
        this.init();
    }

    async init() {
        try {
            // Show loading progress
            this.updateLoadingProgress(20);
            
            // Load settings first
            await this.loadSettings();
            this.updateLoadingProgress(40);
            
            // Initialize theme
            this.initTheme();
            this.updateLoadingProgress(60);
            
            // Initialize advanced features
            await this.initAdvancedFeatures();
            this.updateLoadingProgress(70);
            
            // Initialize components
            await this.initComponents();
            this.updateLoadingProgress(80);
            
            // Set up event listeners
            this.setupEventListeners();
            this.updateLoadingProgress(90);
            
            // Initialize search engine state
            this.initSearchEngineState();
            
            // Update time and greeting
            this.updateTime();
            this.updateGreeting();
            this.updateLoadingProgress(100);
            
            // Start time updates
            setInterval(() => {
                this.updateTime();
                this.updateGreeting();
            }, 1000);
            
            // Hide loading screen with delay
            setTimeout(() => {
                this.hideLoadingScreen();
            }, 1500);
            
            this.isInitialized = true;
            
        } catch (error) {
            console.error('Failed to initialize Smart Dashboard:', error);
            this.showError('Failed to initialize dashboard', error.message);
        }
    }

    async loadSettings() {
        try {
            const result = await chrome.storage.sync.get({
                userName: '',
                theme: 'auto',
                weatherEnabled: true,
                quoteEnabled: true,
                statsEnabled: true,
                searchEngine: 'google',
                language: 'en'
            });
            
            this.settings = result;
            
        } catch (error) {
            console.error('Failed to load settings:', error);
            // Use default settings
            this.settings = {
                userName: '',
                theme: 'auto',
                weatherEnabled: true,
                quoteEnabled: true,
                statsEnabled: true,
                searchEngine: 'google',
                language: 'en'
            };
        }
    }

    async saveSettings(newSettings) {
        try {
            this.settings = { ...this.settings, ...newSettings };
            await chrome.storage.sync.set(this.settings);
        } catch (error) {
            console.error('Failed to save settings:', error);
        }
    }

    initTheme() {
        const theme = this.settings.theme;
        
        if (theme === 'auto') {
            // Check system preference
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            document.documentElement.setAttribute('data-theme', prefersDark ? 'dark' : 'light');
            
            // Listen for system theme changes
            window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
                document.documentElement.setAttribute('data-theme', e.matches ? 'dark' : 'light');
            });
        } else {
            document.documentElement.setAttribute('data-theme', theme);
        }
    }

    async initAdvancedFeatures() {
        try {
            // Initialize AI Assistant
            if (window.AIAssistant) {
                this.aiAssistant = new window.AIAssistant();
                console.log('AI Assistant initialized');
            }

            // Initialize Analytics
            if (window.Analytics) {
                this.analytics = new window.Analytics();
                console.log('Analytics initialized');
            }

            // Initialize Productivity Tools
            if (window.ProductivityTools) {
                this.productivityTools = new window.ProductivityTools();
                console.log('Productivity Tools initialized');
            }

            // Initialize Integrations
            if (window.Integrations) {
                this.integrations = new window.Integrations();
                console.log('Integrations initialized');
            }
        } catch (error) {
            console.error('Failed to initialize advanced features:', error);
        }
    }

    async initComponents() {
        console.log('Initializing components...');
        
        // Test widget availability
        this.testWidgetAvailability();
        
        try {
            // Initialize weather if enabled
            if (this.settings.weatherEnabled) {
                console.log('Initializing Weather Widget...');
                if (window.WeatherWidget) {
                    try {
                        await window.WeatherWidget.init();
                        console.log('Weather Widget initialized successfully');
                    } catch (error) {
                        console.warn('Weather Widget init failed, but widget is available:', error.message);
                    }
                } else {
                    console.error('WeatherWidget not found in window object');
                }
            }

            // Initialize todo list
            console.log('Initializing Todo Widget...');
            if (window.TodoWidget) {
                try {
                    await window.TodoWidget.init();
                    console.log('Todo Widget initialized successfully');
                } catch (error) {
                    console.warn('Todo Widget init failed, but widget is available:', error.message);
                }
            } else {
                console.error('TodoWidget not found in window object');
            }

            // Initialize notes
            console.log('Initializing Notes Widget...');
            if (window.NotesWidget) {
                try {
                    await window.NotesWidget.init();
                    console.log('Notes Widget initialized successfully');
                } catch (error) {
                    console.warn('Notes Widget init failed, but widget is available:', error.message);
                }
            } else {
                console.warn('NotesWidget not found in window object, creating fallback');
                // Create fallback NotesWidget
                window.NotesWidget = {
                    init: async () => {
                        console.log('Fallback Notes Widget initialized');
                    }
                };
            }

            // Initialize quotes if enabled
            if (this.settings.quoteEnabled) {
                console.log('Initializing Quotes Widget...');
                if (window.QuotesWidget) {
                    try {
                        await window.QuotesWidget.init();
                        console.log('Quotes Widget initialized successfully');
                    } catch (error) {
                        console.warn('Quotes Widget init failed, but widget is available:', error.message);
                    }
                } else {
                    console.warn('QuotesWidget not found in window object, creating fallback');
                    // Create fallback QuotesWidget
                    window.QuotesWidget = {
                        init: async () => {
                            console.log('Fallback Quotes Widget initialized');
                        }
                    };
                }
            }

            // Initialize search
            console.log('Initializing Search Widget...');
            if (window.SearchWidget) {
                try {
                    await window.SearchWidget.init();
                    console.log('Search Widget initialized successfully');
                } catch (error) {
                    console.warn('Search Widget init failed, but widget is available:', error.message);
                }
            } else {
                console.warn('SearchWidget not found in window object, creating fallback');
                // Create fallback SearchWidget
                window.SearchWidget = {
                    init: async () => {
                        console.log('Fallback Search Widget initialized');
                    }
                };
            }

            // Initialize stats if enabled
            if (this.settings.statsEnabled) {
                console.log('Initializing Stats Widget...');
                if (window.StatsWidget) {
                    try {
                        await window.StatsWidget.init();
                        console.log('Stats Widget initialized successfully');
                    } catch (error) {
                        console.warn('Stats Widget init failed, but widget is available:', error.message);
                    }
                } else {
                    console.warn('StatsWidget not found in window object, creating fallback');
                    // Create fallback StatsWidget
                    window.StatsWidget = {
                        init: async () => {
                            console.log('Fallback Stats Widget initialized');
                        }
                    };
                }
            }

            // Initialize voice search
            console.log('Initializing Voice Widget...');
            if (window.VoiceWidget) {
                try {
                    await window.VoiceWidget.init();
                    console.log('Voice Widget initialized successfully');
                } catch (error) {
                    console.warn('Voice Widget init failed, but widget is available:', error.message);
                }
            } else {
                console.warn('VoiceWidget not found in window object, creating fallback');
                // Create fallback VoiceWidget
                window.VoiceWidget = {
                    init: async () => {
                        console.log('Fallback Voice Widget initialized');
                    }
                };
            }

            // Initialize calendar
            console.log('Initializing Calendar Widget...');
            if (window.CalendarWidget) {
                try {
                    await window.CalendarWidget.init();
                    console.log('Calendar Widget initialized successfully');
                } catch (error) {
                    console.warn('Calendar Widget init failed, but widget is available:', error.message);
                }
            } else {
                console.warn('CalendarWidget not found in window object, creating fallback');
                // Create fallback CalendarWidget
                window.CalendarWidget = {
                    init: async () => {
                        console.log('Fallback Calendar Widget initialized');
                    }
                };
            }

            // Initialize calculator
            console.log('Initializing Calculator Widget...');
            if (window.CalculatorWidget) {
                try {
                    await window.CalculatorWidget.init();
                    console.log('Calculator Widget initialized successfully');
                } catch (error) {
                    console.warn('Calculator Widget init failed, but widget is available:', error.message);
                }
            } else {
                console.warn('CalculatorWidget not found in window object, creating fallback');
                // Create fallback CalculatorWidget
                window.CalculatorWidget = {
                    init: async () => {
                        console.log('Fallback Calculator Widget initialized');
                    }
                };
            }

            // Initialize currency converter
            console.log('Initializing Converter Widget...');
            if (window.ConverterWidget) {
                try {
                    await window.ConverterWidget.init();
                    console.log('Converter Widget initialized successfully');
                } catch (error) {
                    console.warn('Converter Widget init failed, but widget is available:', error.message);
                }
            } else {
                console.warn('ConverterWidget not found in window object, creating fallback');
                // Create fallback ConverterWidget
                window.ConverterWidget = {
                    init: async () => {
                        console.log('Fallback Converter Widget initialized');
                    }
                };
            }

            // Initialize timer
            console.log('Initializing Timer Widget...');
            if (window.TimerWidget) {
                try {
                    await window.TimerWidget.init();
                    console.log('Timer Widget initialized successfully');
                } catch (error) {
                    console.warn('Timer Widget init failed, but widget is available:', error.message);
                }
            } else {
                console.warn('TimerWidget not found in window object, creating fallback');
                // Create fallback TimerWidget
                window.TimerWidget = {
                    init: async () => {
                        console.log('Fallback Timer Widget initialized');
                    }
                };
            }

            // Initialize notifications
            console.log('Initializing Notifications Widget...');
            if (window.NotificationsWidget) {
                try {
                    await window.NotificationsWidget.init();
                    console.log('Notifications Widget initialized successfully');
                } catch (error) {
                    console.warn('Notifications Widget init failed, but widget is available:', error.message);
                }
            } else {
                console.warn('NotificationsWidget not found in window object, creating fallback');
                // Create fallback NotificationsWidget
                window.NotificationsWidget = {
                    init: async () => {
                        console.log('Fallback Notifications Widget initialized');
                    }
                };
            }

            // Initialize progress widget
            console.log('Initializing Progress Widget...');
            if (window.ProgressWidget) {
                try {
                    await window.ProgressWidget.init();
                    console.log('Progress Widget initialized successfully');
                } catch (error) {
                    console.warn('Progress Widget init failed, but widget is available:', error.message);
                }
            } else {
                console.warn('ProgressWidget not found in window object, creating fallback');
                // Create fallback ProgressWidget
                window.ProgressWidget = {
                    init: async () => {
                        console.log('Fallback Progress Widget initialized');
                    }
                };
            }

            // Initialize Pomodoro Timer
            console.log('Initializing Pomodoro Timer...');
            if (window.PomodoroTimer) {
                try {
                    await window.PomodoroTimer.init();
                    console.log('Pomodoro Timer initialized successfully');
                } catch (error) {
                    console.warn('Pomodoro Timer init failed, but widget is available:', error.message);
                }
            } else {
                console.warn('PomodoroTimer not found in window object, creating fallback');
                // Create fallback PomodoroTimer
                window.PomodoroTimer = {
                    init: async () => {
                        console.log('Fallback Pomodoro Timer initialized');
                    }
                };
            }

            // Initialize Habit Tracker
            console.log('Initializing Habit Tracker...');
            if (window.HabitTracker) {
                try {
                    await window.HabitTracker.init();
                    console.log('Habit Tracker initialized successfully');
                } catch (error) {
                    console.warn('Habit Tracker init failed, but widget is available:', error.message);
                }
            } else {
                console.warn('HabitTracker not found in window object, creating fallback');
                // Create fallback HabitTracker
                window.HabitTracker = {
                    init: async () => {
                        console.log('Fallback Habit Tracker initialized');
                    }
                };
            }

            // Initialize Clock Widget
            console.log('Initializing Clock Widget...');
            if (window.ClockWidget) {
                try {
                    await window.ClockWidget.init();
                    console.log('Clock Widget initialized successfully');
                } catch (error) {
                    console.warn('Clock Widget init failed, but widget is available:', error.message);
                }
            } else {
                console.warn('ClockWidget not found in window object, creating fallback');
                // Create fallback ClockWidget
                window.ClockWidget = {
                    init: async () => {
                        console.log('Fallback Clock Widget initialized');
                    }
                };
            }

            console.log('All components initialization completed');
        } catch (error) {
            console.error('Error initializing components:', error);
        }
    }

    testWidgetAvailability() {
        console.log('=== Testing Widget Availability ===');
        
        // Test DOM elements
        const elements = {
            'todo-list': document.getElementById('todo-list'),
            'quick-notes': document.getElementById('quick-notes'),
            'calc-result': document.getElementById('calc-result'),
            'timer-display': document.getElementById('timer-display'),
            'weather-temp': document.getElementById('weather-temp'),
            'search-input': document.getElementById('search-input')
        };
        
        Object.entries(elements).forEach(([name, element]) => {
            if (element) {
                console.log(`✅ ${name}: Found`);
            } else {
                console.error(`❌ ${name}: Not found`);
            }
        });
        
        // Test widget classes
        const widgets = {
            'WeatherWidget': window.WeatherWidget,
            'TodoWidget': window.TodoWidget,
            'NotesWidget': window.NotesWidget,
            'CalculatorWidget': window.CalculatorWidget,
            'TimerWidget': window.TimerWidget,
            'SearchWidget': window.SearchWidget,
            'QuotesWidget': window.QuotesWidget,
            'StatsWidget': window.StatsWidget,
            'VoiceWidget': window.VoiceWidget,
            'CalendarWidget': window.CalendarWidget,
            'ConverterWidget': window.ConverterWidget,
            'NotificationsWidget': window.NotificationsWidget,
            'ProgressWidget': window.ProgressWidget || (typeof ProgressWidget !== 'undefined' ? ProgressWidget : null),
            'PomodoroTimer': window.PomodoroTimer,
            'HabitTracker': window.HabitTracker,
            'ClockWidget': window.ClockWidget
        };
        
        Object.entries(widgets).forEach(([name, widget]) => {
            if (widget) {
                console.log(`✅ ${name}: Available`);
            } else {
                console.error(`❌ ${name}: Not available`);
            }
        });
        
        console.log('=== End Widget Availability Test ===');
    }

    setupEventListeners() {
        // Search functionality
        const searchInput = document.getElementById('search-input');
        if (searchInput) {
            searchInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.performSearch(searchInput.value);
                }
            });

            // Add loading state for search
            searchInput.addEventListener('input', this.debounce((e) => {
                const query = e.target.value.trim();
                if (query.length > 2) {
                    this.showSearchSuggestions(query);
                } else {
                    this.hideSearchSuggestions();
                }
            }, 300));
        }

        // Settings button
        const settingsBtn = document.getElementById('settings-btn');
        if (settingsBtn) {
            settingsBtn.addEventListener('click', () => {
                this.openSettings();
            });
        }

        // Close settings button
        const closeSettingsBtn = document.getElementById('close-settings');
        if (closeSettingsBtn) {
            closeSettingsBtn.addEventListener('click', () => {
                this.closeSettings();
            });
        }

        // Settings modal backdrop
        const settingsModal = document.getElementById('settings-modal');
        if (settingsModal) {
            settingsModal.addEventListener('click', (e) => {
                if (e.target === settingsModal) {
                    this.closeSettings();
                }
            });
        }

        // Quick action buttons
        const actionCards = document.querySelectorAll('.action-card');
        actionCards.forEach(card => {
            card.addEventListener('click', (e) => {
                const action = card.dataset.action;
                this.handleQuickAction(action);
            });
        });

        // FAB button
        const fabBtn = document.getElementById('fab-btn');
        if (fabBtn) {
            fabBtn.addEventListener('click', () => {
                this.showQuickActions();
            });
        }

        // Voice search button
        const voiceBtn = document.getElementById('voice-search-btn');
        if (voiceBtn) {
            voiceBtn.addEventListener('click', () => {
                this.startVoiceSearch();
            });
        }

        // Camera search button
        const cameraBtn = document.getElementById('camera-search-btn');
        if (cameraBtn) {
            cameraBtn.addEventListener('click', () => {
                if (window.SearchWidget && window.SearchWidget.startCameraSearch) {
                    window.SearchWidget.startCameraSearch();
                } else {
                    console.warn('Camera search widget not available');
                }
            });
        }

        // Search engine buttons
        const engineBtns = document.querySelectorAll('.engine-btn');
        engineBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                this.switchSearchEngine(btn.dataset.engine);
            });
        });

        // Settings form
        this.setupSettingsForm();

        // Keyboard shortcuts
        this.setupKeyboardShortcuts();
        
        // AI Assistant functionality
        this.setupAIAssistant();
    }

    setupSettingsForm() {
        const userNameInput = document.getElementById('user-name-input');
        const themeSelector = document.getElementById('theme-selector');
        const weatherEnabled = document.getElementById('weather-enabled');
        const quoteEnabled = document.getElementById('quote-enabled');
        const statsEnabled = document.getElementById('stats-enabled');

        // Set current values
        if (userNameInput) userNameInput.value = this.settings.userName;
        if (themeSelector) themeSelector.value = this.settings.theme;
        if (weatherEnabled) weatherEnabled.checked = this.settings.weatherEnabled;
        if (quoteEnabled) quoteEnabled.checked = this.settings.quoteEnabled;
        if (statsEnabled) statsEnabled.checked = this.settings.statsEnabled;

        // Add event listeners
        if (userNameInput) {
            userNameInput.addEventListener('input', (e) => {
                this.saveSettings({ userName: e.target.value });
                this.updateGreeting();
            });
        }

        if (themeSelector) {
            themeSelector.addEventListener('change', (e) => {
                this.saveSettings({ theme: e.target.value });
                this.initTheme();
            });
        }

        if (weatherEnabled) {
            weatherEnabled.addEventListener('change', (e) => {
                this.saveSettings({ weatherEnabled: e.target.checked });
                this.toggleWeatherWidget(e.target.checked);
            });
        }

        if (quoteEnabled) {
            quoteEnabled.addEventListener('change', (e) => {
                this.saveSettings({ quoteEnabled: e.target.checked });
                this.toggleQuoteWidget(e.target.checked);
            });
        }

        if (statsEnabled) {
            statsEnabled.addEventListener('change', (e) => {
                this.saveSettings({ statsEnabled: e.target.checked });
                this.toggleStatsWidget(e.target.checked);
            });
        }
    }

    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Ctrl/Cmd + K to focus search
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                const searchInput = document.getElementById('search-input');
                if (searchInput) {
                    searchInput.focus();
                }
            }

            // Ctrl/Cmd + , to open settings
            if ((e.ctrlKey || e.metaKey) && e.key === ',') {
                e.preventDefault();
                this.openSettings();
            }

            // Escape to close modals
            if (e.key === 'Escape') {
                this.closeSettings();
            }
        });
    }

    updateTime() {
        const now = new Date();
        const timeElement = document.getElementById('current-time');
        const dateElement = document.getElementById('current-date');

        if (timeElement) {
            timeElement.textContent = now.toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit',
                hour12: true
            });
        }

        if (dateElement) {
            dateElement.textContent = now.toLocaleDateString('en-US', {
                weekday: 'long',
                month: 'long',
                day: 'numeric'
            });
        }
    }

    updateGreeting() {
        const now = new Date();
        const hour = now.getHours();
        const greetingElement = document.getElementById('greeting-text');
        const userNameElement = document.getElementById('user-name');
        const greetingEmoji = document.getElementById('greeting-emoji');

        let greeting = '';
        let emoji = '';
        
        if (hour >= 5 && hour < 12) {
            greeting = 'Good morning';
            emoji = '🌅';
        } else if (hour >= 12 && hour < 17) {
            greeting = 'Good afternoon';
            emoji = '☀️';
        } else if (hour >= 17 && hour < 21) {
            greeting = 'Good evening';
            emoji = '🌆';
        } else {
            greeting = 'Good night';
            emoji = '🌙';
        }

        if (greetingElement) {
            const userNameText = this.settings.userName ? `, ${this.settings.userName}` : '!';
            greetingElement.textContent = greeting + userNameText;
        }

        if (userNameElement) {
            const userName = this.settings.userName || 'Welcome back';
            userNameElement.textContent = userName;
        }

        if (greetingEmoji) {
            greetingEmoji.textContent = emoji;
            // Add animation class for emoji change
            greetingEmoji.style.animation = 'none';
            greetingEmoji.offsetHeight; // Trigger reflow
            greetingEmoji.style.animation = 'emojiBounce 0.6s ease-in-out';
        }
    }

    openSettings() {
        const modal = document.getElementById('settings-modal');
        if (modal) {
            modal.classList.remove('hidden');
            setTimeout(() => {
                modal.classList.add('show');
            }, 10);
        }
    }

    closeSettings() {
        const modal = document.getElementById('settings-modal');
        if (modal) {
            modal.classList.remove('show');
            setTimeout(() => {
                modal.classList.add('hidden');
            }, 300);
        }
    }

    async handleQuickAction(action) {
        try {
            switch (action) {
                case 'bookmarks':
                    chrome.tabs.create({ url: 'chrome://bookmarks' });
                    break;
                case 'history':
                    chrome.tabs.create({ url: 'chrome://history' });
                    break;
                case 'downloads':
                    chrome.tabs.create({ url: 'chrome://downloads' });
                    break;
                case 'extensions':
                    chrome.tabs.create({ url: 'chrome://extensions' });
                    break;
                case 'calculator':
                    this.focusWidget('calculator-widget');
                    break;
                case 'converter':
                    this.focusWidget('converter-widget');
                    break;
                case 'calendar':
                    this.focusWidget('calendar-widget');
                    break;
                case 'timer':
                    this.focusWidget('timer-widget');
                    break;
                default:
                    console.warn('Unknown action:', action);
            }
        } catch (error) {
            console.error('Failed to handle quick action:', error);
        }
    }

    focusWidget(widgetId) {
        const widget = document.querySelector(`.${widgetId}`);
        if (widget) {
            widget.scrollIntoView({ behavior: 'smooth', block: 'center' });
            widget.style.animation = 'pulse 0.5s ease-in-out';
            setTimeout(() => {
                widget.style.animation = '';
            }, 500);
        }
    }

    toggleWeatherWidget(enabled) {
        const weatherWidget = document.getElementById('weather-widget');
        if (weatherWidget) {
            weatherWidget.style.display = enabled ? 'flex' : 'none';
        }
    }

    toggleQuoteWidget(enabled) {
        const quoteWidget = document.querySelector('.quote-widget');
        if (quoteWidget) {
            quoteWidget.style.display = enabled ? 'block' : 'none';
        }
    }

    toggleStatsWidget(enabled) {
        const statsWidget = document.querySelector('.stats-widget');
        if (statsWidget) {
            statsWidget.style.display = enabled ? 'block' : 'none';
        }
    }

    updateLoadingProgress(percent) {
        const progressBar = document.querySelector('.progress-bar');
        if (progressBar) {
            progressBar.style.width = `${percent}%`;
        }
    }

    hideLoadingScreen() {
        const loadingScreen = document.getElementById('loading-screen');
        const mainContainer = document.getElementById('main-container');
        
        if (loadingScreen) {
            loadingScreen.classList.add('hidden');
        }
        
        if (mainContainer) {
            mainContainer.classList.remove('hidden');
            mainContainer.style.animation = 'fadeInUp 0.8s ease-out';
        }
    }

    showError(title, message = '') {
        console.error(title, message);
        
        // Create error message element
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.innerHTML = `
            <div class="error-title">
                <span class="material-symbols-outlined">error</span>
                ${title}
            </div>
            ${message ? `<div class="error-content">${message}</div>` : ''}
        `;
        
        document.body.appendChild(errorDiv);
        
        // Show error
        setTimeout(() => {
            errorDiv.classList.add('show');
        }, 100);
        
        // Auto-hide after 5 seconds
        setTimeout(() => {
            errorDiv.classList.remove('show');
            setTimeout(() => {
                if (errorDiv.parentNode) {
                    errorDiv.parentNode.removeChild(errorDiv);
                }
            }, 300);
        }, 5000);
    }

    performSearch(query) {
        if (!query.trim()) return;
        
        const searchBox = document.querySelector('.search-box');
        if (searchBox) {
            searchBox.classList.add('loading');
        }
        
        try {
            const searchEngine = this.settings.searchEngine || 'google';
            let searchUrl = '';
            
            switch (searchEngine) {
                case 'google':
                    searchUrl = `https://www.google.com/search?q=${encodeURIComponent(query)}`;
                    break;
                case 'bing':
                    searchUrl = `https://www.bing.com/search?q=${encodeURIComponent(query)}`;
                    break;
                case 'duckduckgo':
                    searchUrl = `https://duckduckgo.com/?q=${encodeURIComponent(query)}`;
                    break;
                default:
                    searchUrl = `https://www.google.com/search?q=${encodeURIComponent(query)}`;
            }
            
            // Add search animation
            this.addSearchAnimation();
            
            // Open in new tab
            if (typeof chrome !== 'undefined' && chrome.tabs) {
                chrome.tabs.create({ url: searchUrl });
            } else {
                window.open(searchUrl, '_blank');
            }
            
        } catch (error) {
            this.showError('Search failed', error.message);
        } finally {
            if (searchBox) {
                searchBox.classList.remove('loading');
            }
        }
    }

    switchSearchEngine(engine) {
        // Update active button
        const engineBtns = document.querySelectorAll('.engine-btn');
        engineBtns.forEach(btn => {
            btn.classList.remove('active');
            if (btn.dataset.engine === engine) {
                btn.classList.add('active');
            }
        });

        // Save setting
        this.settings.searchEngine = engine;
        this.saveSettings({ searchEngine: engine });

        // Show feedback
        this.showEngineSwitchFeedback(engine);
    }

    showEngineSwitchFeedback(engine) {
        const searchInput = document.getElementById('search-input');
        if (searchInput) {
            const engineNames = {
                'google': 'Google',
                'bing': 'Bing',
                'duckduckgo': 'DuckDuckGo'
            };
            
            const originalPlaceholder = searchInput.placeholder;
            searchInput.placeholder = `Search with ${engineNames[engine]}...`;
            
            // Add visual feedback
            searchInput.style.borderColor = 'var(--primary-color)';
            searchInput.style.boxShadow = '0 0 20px rgba(99, 102, 241, 0.3)';
            
            setTimeout(() => {
                searchInput.placeholder = originalPlaceholder;
                searchInput.style.borderColor = '';
                searchInput.style.boxShadow = '';
            }, 2000);
        }
    }

    addSearchAnimation() {
        const searchBox = document.querySelector('.search-box');
        if (searchBox) {
            searchBox.classList.add('searching');
            setTimeout(() => {
                searchBox.classList.remove('searching');
            }, 1000);
        }
    }

    initSearchEngineState() {
        const currentEngine = this.settings.searchEngine || 'google';
        const engineBtns = document.querySelectorAll('.engine-btn');
        
        engineBtns.forEach(btn => {
            if (btn.dataset.engine === currentEngine) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });
    }

    showSearchSuggestions(query) {
        // This would integrate with search suggestions API
        console.log('Showing suggestions for:', query);
    }

    hideSearchSuggestions() {
        // Hide search suggestions
        console.log('Hiding search suggestions');
    }

    showQuickActions() {
        // Show quick actions menu
        console.log('Showing quick actions');
    }

    startVoiceSearch() {
        // Start voice search functionality
        console.log('Starting voice search');
        this.showError('Voice Search', 'Voice search feature coming soon!');
    }

    // Camera search is now handled by SearchWidget

    // Utility methods
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    throttle(func, limit) {
        let inThrottle;
        return function() {
            const args = arguments;
            const context = this;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }

    setupAIAssistant() {
        const aiQueryInput = document.getElementById('ai-query');
        const aiSendBtn = document.getElementById('ai-send-btn');
        const aiSuggestionsBtn = document.getElementById('ai-suggestions-btn');
        const aiInsightsBtn = document.getElementById('ai-insights-btn');
        const aiChat = document.getElementById('ai-chat');
        const aiSuggestions = document.getElementById('ai-suggestions');

        if (aiQueryInput && aiSendBtn) {
            // Handle AI chat
            aiSendBtn.addEventListener('click', () => {
                this.handleAIChat(aiQueryInput.value);
            });

            aiQueryInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.handleAIChat(aiQueryInput.value);
                }
            });
        }

        if (aiSuggestionsBtn) {
            aiSuggestionsBtn.addEventListener('click', () => {
                this.toggleAISuggestions();
            });
        }

        if (aiInsightsBtn) {
            aiInsightsBtn.addEventListener('click', () => {
                this.showAIInsights();
            });
        }

        // Listen for AI suggestions
        document.addEventListener('aiSuggestions', (e) => {
            this.updateAISuggestions(e.detail.suggestions);
        });
    }

    async handleAIChat(message) {
        if (!message.trim()) return;

        const aiQueryInput = document.getElementById('ai-query');
        const aiChat = document.getElementById('ai-chat');
        const chatMessages = document.getElementById('chat-messages');
        const aiSuggestions = document.getElementById('ai-suggestions');

        // Clear input
        aiQueryInput.value = '';

        // Show chat interface
        aiChat.style.display = 'block';
        aiSuggestions.style.display = 'none';

        // Add user message
        this.addChatMessage(message, 'user');

        // Show typing indicator
        const typingMsg = this.addChatMessage('AI is thinking...', 'typing');

        try {
            // Get AI response
            const response = await this.aiAssistant.chatWithAI(message);
            
            // Remove typing indicator
            typingMsg.remove();
            
            // Add AI response
            this.addChatMessage(response, 'ai');

        } catch (error) {
            // Remove typing indicator
            typingMsg.remove();
            
            // Add error message
            this.addChatMessage('Sorry, I encountered an error. Please try again.', 'ai');
        }

        // Scroll to bottom
        aiChat.scrollTop = aiChat.scrollHeight;
    }

    addChatMessage(message, type) {
        const chatMessages = document.getElementById('chat-messages');
        const messageDiv = document.createElement('div');
        messageDiv.className = `chat-message ${type}`;
        messageDiv.textContent = message;
        chatMessages.appendChild(messageDiv);
        return messageDiv;
    }

    toggleAISuggestions() {
        const aiChat = document.getElementById('ai-chat');
        const aiSuggestions = document.getElementById('ai-suggestions');

        if (aiChat.style.display === 'none') {
            aiChat.style.display = 'block';
            aiSuggestions.style.display = 'none';
        } else {
            aiChat.style.display = 'none';
            aiSuggestions.style.display = 'block';
        }
    }

    updateAISuggestions(suggestions) {
        const aiSuggestions = document.getElementById('ai-suggestions');
        if (!aiSuggestions) return;

        aiSuggestions.innerHTML = '';
        
        suggestions.forEach(suggestion => {
            const suggestionDiv = document.createElement('div');
            suggestionDiv.className = 'suggestion-item';
            suggestionDiv.innerHTML = `
                <span class="material-symbols-outlined">${this.getSuggestionIcon(suggestion.type)}</span>
                <span>${suggestion.message}</span>
            `;
            aiSuggestions.appendChild(suggestionDiv);
        });
    }

    getSuggestionIcon(type) {
        const icons = {
            'productivity': 'trending_up',
            'break': 'coffee',
            'planning': 'schedule',
            'wellness': 'self_improvement',
            'motivation': 'psychology',
            'urgent': 'priority_high',
            'organization': 'folder',
            'ai': 'smart_toy'
        };
        return icons[type] || 'lightbulb';
    }

    async showAIInsights() {
        if (!this.aiAssistant) return;

        try {
            const insights = await this.aiAssistant.getProductivityInsights();
            if (insights) {
                this.showNotification('AI Insights', insights.recommendations || 'Check your productivity patterns for personalized insights!', 'info');
            }
        } catch (error) {
            console.error('Failed to get AI insights:', error);
            this.showNotification('AI Insights', 'Unable to generate insights at the moment.', 'error');
        }
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.SmartDashboard = new SmartDashboard();
});

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SmartDashboard;
}
