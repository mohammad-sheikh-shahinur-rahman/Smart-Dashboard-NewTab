// Settings Manager - Handles language, widgets, and settings panel
class SettingsManager {
    constructor() {
        this.currentLang = 'en';
        this.settings = {
            language: 'en',
            userName: '',
            location: '',
            theme: 'auto',
            animations: true,
            widgets: {
                weather: true,
                quotes: true,
                stats: true,
                calendar: true,
                calculator: true,
                converter: true,
                timer: true
            }
        };
        
        this.translations = {
            en: {
                // Greetings
                'good-morning': 'Good morning!',
                'good-afternoon': 'Good afternoon!',
                'good-evening': 'Good evening!',
                'good-night': 'Good night!',
                'welcome-back': 'Welcome back',
                
                // Search
                'search-placeholder': 'Search the web, apps, or ask anything...',
                'voice-search': 'Voice Search',
                'camera-search': 'Camera Search',
                
                // Quick Actions
                'bookmarks': 'Bookmarks',
                'history': 'History',
                'downloads': 'Downloads',
                'extensions': 'Extensions',
                
                // Widgets
                'today-tasks': "Today's Tasks",
                'quick-notes': 'Quick Notes',
                'daily-quote': 'Daily Quote',
                'productivity-stats': 'Productivity Stats',
                'calendar': 'Calendar',
                'calculator': 'Calculator',
                'currency-converter': 'Currency Converter',
                'timer': 'Timer',
                
                // Settings
                'settings': 'Settings',
                'language': 'Language',
                'personalization': 'Personalization',
                'widgets': 'Widgets',
                'appearance': 'Appearance',
                'your-name': 'Your Name',
                'location': 'Location',
                'theme': 'Theme',
                'auto-system': 'Auto (System)',
                'light': 'Light',
                'dark': 'Dark',
                'enable-animations': 'Enable Animations',
                
                // Widget Names
                'weather-widget': 'Weather Widget',
                'quotes-widget': 'Quotes Widget',
                'stats-widget': 'Stats Widget',
                'calendar-widget': 'Calendar Widget',
                'calculator-widget': 'Calculator Widget',
                'converter-widget': 'Converter Widget',
                'timer-widget': 'Timer Widget',
                
                // Common
                'add': 'Add',
                'save': 'Save',
                'cancel': 'Cancel',
                'close': 'Close',
                'refresh': 'Refresh',
                'delete': 'Delete',
                'edit': 'Edit'
            },
            bn: {
                // Greetings
                'good-morning': 'সুপ্রভাত!',
                'good-afternoon': 'শুভ অপরাহ্ন!',
                'good-evening': 'শুভ সন্ধ্যা!',
                'good-night': 'শুভ রাত্রি!',
                'welcome-back': 'ফিরে আসার জন্য স্বাগতম',
                
                // Search
                'search-placeholder': 'ওয়েব, অ্যাপস, বা যেকোনো কিছু খুঁজুন...',
                'voice-search': 'ভয়েস সার্চ',
                'camera-search': 'ক্যামেরা সার্চ',
                
                // Quick Actions
                'bookmarks': 'বুকমার্ক',
                'history': 'ইতিহাস',
                'downloads': 'ডাউনলোড',
                'extensions': 'এক্সটেনশন',
                
                // Widgets
                'today-tasks': 'আজকের কাজ',
                'quick-notes': 'দ্রুত নোট',
                'daily-quote': 'দৈনিক উক্তি',
                'productivity-stats': 'উৎপাদনশীলতা পরিসংখ্যান',
                'calendar': 'ক্যালেন্ডার',
                'calculator': 'ক্যালকুলেটর',
                'currency-converter': 'মুদ্রা রূপান্তরকারী',
                'timer': 'টাইমার',
                
                // Settings
                'settings': 'সেটিংস',
                'language': 'ভাষা',
                'personalization': 'ব্যক্তিগতকরণ',
                'widgets': 'উইজেট',
                'appearance': 'চেহারা',
                'your-name': 'আপনার নাম',
                'location': 'অবস্থান',
                'theme': 'থিম',
                'auto-system': 'স্বয়ংক্রিয় (সিস্টেম)',
                'light': 'হালকা',
                'dark': 'অন্ধকার',
                'enable-animations': 'অ্যানিমেশন সক্রিয় করুন',
                
                // Widget Names
                'weather-widget': 'আবহাওয়া উইজেট',
                'quotes-widget': 'উক্তি উইজেট',
                'stats-widget': 'পরিসংখ্যান উইজেট',
                'calendar-widget': 'ক্যালেন্ডার উইজেট',
                'calculator-widget': 'ক্যালকুলেটর উইজেট',
                'converter-widget': 'রূপান্তরকারী উইজেট',
                'timer-widget': 'টাইমার উইজেট',
                
                // Common
                'add': 'যোগ করুন',
                'save': 'সংরক্ষণ করুন',
                'cancel': 'বাতিল করুন',
                'close': 'বন্ধ করুন',
                'refresh': 'রিফ্রেশ করুন',
                'delete': 'মুছুন',
                'edit': 'সম্পাদনা করুন'
            }
        };
        
        this.init();
    }
    
    init() {
        this.loadSettings();
        this.setupEventListeners();
        this.applySettings();
        this.updateLanguage();
    }
    
    setupEventListeners() {
        // Settings panel toggle
        const settingsBtn = document.getElementById('settings-btn');
        const settingsPanel = document.getElementById('settings-panel');
        const settingsClose = document.getElementById('settings-close');
        
        if (settingsBtn) {
            settingsBtn.addEventListener('click', () => {
                settingsPanel.classList.add('show');
            });
        }
        
        if (settingsClose) {
            settingsClose.addEventListener('click', () => {
                settingsPanel.classList.remove('show');
            });
        }

        // Settings search functionality
        const settingsSearch = document.getElementById('settings-search');
        if (settingsSearch) {
            settingsSearch.addEventListener('input', (e) => {
                this.filterSettings(e.target.value);
            });
        }

        // Settings category tabs
        const categoryTabs = document.querySelectorAll('.category-tab');
        categoryTabs.forEach(tab => {
            tab.addEventListener('click', () => {
                this.switchCategory(tab.dataset.category);
            });
        });

        // Radio button functionality
        const radioOptions = document.querySelectorAll('.radio-option');
        radioOptions.forEach(option => {
            option.addEventListener('click', () => {
                this.handleRadioSelection(option);
            });
        });

        // Quick settings menu
        const quickMenuBtn = document.getElementById('settings-quick-menu');
        if (quickMenuBtn) {
            quickMenuBtn.addEventListener('click', () => {
                this.showQuickSettingsMenu();
            });
        }

        // Search suggestions
        const suggestionItems = document.querySelectorAll('.suggestion-item');
        suggestionItems.forEach(item => {
            item.addEventListener('click', () => {
                const searchTerm = item.dataset.search;
                const searchInput = document.getElementById('settings-search');
                if (searchInput) {
                    searchInput.value = searchTerm;
                    searchInput.focus();
                    this.filterSettings(searchTerm);
                }
            });
        });

        // Scroll indicators for settings categories
        this.setupScrollIndicators();
        
        // Language switching
        const langBtns = document.querySelectorAll('.lang-btn');
        langBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const lang = btn.dataset.lang;
                this.setLanguage(lang);
            });
        });
        
        // Widget toggles
        const toggleGroups = document.querySelectorAll('.toggle-group[data-widget]');
        toggleGroups.forEach(group => {
            const toggle = group.querySelector('.toggle-switch');
            const widget = group.dataset.widget;
            
            toggle.addEventListener('click', () => {
                toggle.classList.toggle('active');
                this.settings.widgets[widget] = toggle.classList.contains('active');
                this.saveSettings();
                this.toggleWidget(widget, this.settings.widgets[widget]);
            });
        });
        
        // Theme selector
        const themeSelector = document.getElementById('theme-selector');
        if (themeSelector) {
            themeSelector.addEventListener('change', (e) => {
                this.settings.theme = e.target.value;
                this.saveSettings();
                this.applyTheme();
            });
        }
        
        // Animation toggle
        const animationToggle = document.querySelector('.toggle-group[data-setting="animations"] .toggle-switch');
        if (animationToggle) {
            animationToggle.addEventListener('click', () => {
                animationToggle.classList.toggle('active');
                this.settings.animations = animationToggle.classList.contains('active');
                this.saveSettings();
                this.toggleAnimations();
            });
        }
        
        // Personalization inputs
        const userNameInput = document.getElementById('user-name-input');
        const locationInput = document.getElementById('location-input');
        
        if (userNameInput) {
            userNameInput.addEventListener('input', (e) => {
                this.settings.userName = e.target.value;
                this.saveSettings();
                this.updateGreeting();
            });
        }
        
        if (locationInput) {
            locationInput.addEventListener('input', (e) => {
                this.settings.location = e.target.value;
                this.saveSettings();
            });
        }
        
        // Close settings panel when clicking outside
        document.addEventListener('click', (e) => {
            if (settingsPanel && settingsPanel.classList.contains('show')) {
                if (!settingsPanel.contains(e.target) && e.target !== settingsBtn) {
                    settingsPanel.classList.remove('show');
                }
            }
        });
    }
    
    setLanguage(lang) {
        this.currentLang = lang;
        this.settings.language = lang;
        this.saveSettings();
        this.updateLanguage();
        
        // Update language buttons
        document.querySelectorAll('.lang-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.lang === lang);
        });
        
        // Update HTML lang attribute
        document.documentElement.setAttribute('data-lang', lang);
        document.documentElement.setAttribute('lang', lang);
    }
    
    updateLanguage() {
        const elements = document.querySelectorAll('[data-en][data-bn]');
        elements.forEach(element => {
            const key = element.dataset[this.currentLang];
            if (key) {
                element.textContent = key;
            }
        });
        
        // Update placeholders
        const searchInput = document.getElementById('search-input');
        if (searchInput) {
            searchInput.placeholder = this.translate('search-placeholder');
        }
        
        // Update greeting
        this.updateGreeting();
    }
    
    translate(key) {
        return this.translations[this.currentLang][key] || this.translations.en[key] || key;
    }
    
    updateGreeting() {
        const greetingText = document.getElementById('greeting-text');
        const userName = document.getElementById('user-name');
        
        if (greetingText) {
            const hour = new Date().getHours();
            let greeting;
            
            if (hour < 12) {
                greeting = this.translate('good-morning');
            } else if (hour < 17) {
                greeting = this.translate('good-afternoon');
            } else if (hour < 20) {
                greeting = this.translate('good-evening');
            } else {
                greeting = this.translate('good-night');
            }
            
            greetingText.textContent = greeting;
        }
        
        if (userName) {
            const name = this.settings.userName || this.translate('welcome-back');
            userName.textContent = name;
        }
    }
    
    toggleWidget(widgetName, show) {
        const widget = document.querySelector(`.widget[data-widget="${widgetName}"]`);
        if (widget) {
            if (show) {
                widget.style.display = 'block';
                widget.classList.add('fade-in');
            } else {
                widget.style.display = 'none';
            }
        }
    }
    
    applyTheme() {
        const theme = this.settings.theme;
        if (theme === 'auto') {
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            document.documentElement.setAttribute('data-theme', prefersDark ? 'dark' : 'light');
        } else {
            document.documentElement.setAttribute('data-theme', theme);
        }
    }
    
    toggleAnimations() {
        if (this.settings.animations) {
            document.body.classList.remove('no-animations');
        } else {
            document.body.classList.add('no-animations');
        }
    }
    
    loadSettings() {
        try {
            const saved = localStorage.getItem('dashboard-settings');
            if (saved) {
                const parsed = JSON.parse(saved);
                this.settings = { ...this.settings, ...parsed };
            }
        } catch (error) {
            console.error('Error loading settings:', error);
        }
    }
    
    saveSettings() {
        try {
            localStorage.setItem('dashboard-settings', JSON.stringify(this.settings));
        } catch (error) {
            console.error('Error saving settings:', error);
        }
    }
    
    applySettings() {
        // Apply theme
        this.applyTheme();
        
        // Apply language
        this.setLanguage(this.settings.language);
        
        // Apply animations
        this.toggleAnimations();
        
        // Apply widget states
        Object.entries(this.settings.widgets).forEach(([widget, enabled]) => {
            this.toggleWidget(widget, enabled);
        });
        
        // Update toggle states
        Object.entries(this.settings.widgets).forEach(([widget, enabled]) => {
            const toggle = document.querySelector(`.toggle-group[data-widget="${widget}"] .toggle-switch`);
            if (toggle) {
                toggle.classList.toggle('active', enabled);
            }
        });
        
        // Update animation toggle
        const animationToggle = document.querySelector('.toggle-group[data-setting="animations"] .toggle-switch');
        if (animationToggle) {
            animationToggle.classList.toggle('active', this.settings.animations);
        }
        
        // Update theme selector
        const themeSelector = document.getElementById('theme-selector');
        if (themeSelector) {
            themeSelector.value = this.settings.theme;
        }
        
        // Update input values
        const userNameInput = document.getElementById('user-name-input');
        const locationInput = document.getElementById('location-input');
        
        if (userNameInput) {
            userNameInput.value = this.settings.userName;
        }
        
        if (locationInput) {
            locationInput.value = this.settings.location;
        }
    }

    // Enhanced Settings UI Methods
    switchCategory(category) {
        // Update active tab
        const categoryTabs = document.querySelectorAll('.category-tab');
        categoryTabs.forEach(tab => {
            tab.classList.remove('active');
            if (tab.dataset.category === category) {
                tab.classList.add('active');
            }
        });

        // Show active category content
        const categories = document.querySelectorAll('.settings-category');
        categories.forEach(cat => {
            cat.classList.remove('active');
            if (cat.dataset.category === category) {
                cat.classList.add('active');
            }
        });
    }

    filterSettings(searchTerm) {
        const searchTermLower = searchTerm.toLowerCase();
        const settingItems = document.querySelectorAll('.setting-item, .toggle-group, .integration-item');
        
        settingItems.forEach(item => {
            const text = item.textContent.toLowerCase();
            const shouldShow = text.includes(searchTermLower);
            
            if (searchTerm === '') {
                item.style.display = '';
                item.style.opacity = '1';
            } else {
                item.style.display = shouldShow ? '' : 'none';
                item.style.opacity = shouldShow ? '1' : '0.3';
            }
        });

        // Highlight search term in visible items
        if (searchTerm) {
            this.highlightSearchTerm(searchTerm);
        }
    }

    highlightSearchTerm(searchTerm) {
        const labels = document.querySelectorAll('.toggle-label, .integration-name, .setting-item label');
        labels.forEach(label => {
            const text = label.textContent;
            const regex = new RegExp(`(${searchTerm})`, 'gi');
            label.innerHTML = text.replace(regex, '<mark style="background: var(--primary-gradient); color: var(--on-primary); padding: 2px 4px; border-radius: 4px;">$1</mark>');
        });
    }

    handleRadioSelection(selectedOption) {
        const radioGroup = selectedOption.closest('.radio-group');
        const radioOptions = radioGroup.querySelectorAll('.radio-option');
        
        radioOptions.forEach(option => {
            option.classList.remove('selected');
            const radio = option.querySelector('input[type="radio"]');
            if (radio) radio.checked = false;
        });
        
        selectedOption.classList.add('selected');
        const radio = selectedOption.querySelector('input[type="radio"]');
        if (radio) {
            radio.checked = true;
            this.handleSettingChange(radio.name, radio.value);
        }
    }

    handleSettingChange(settingName, value) {
        // Save setting to storage
        this.settings[settingName] = value;
        this.saveSettings();
        
        // Apply setting changes
        this.applySetting(settingName, value);
        
        // Show feedback
        this.showSettingFeedback(settingName, value);
    }

    applySetting(settingName, value) {
        switch (settingName) {
            case 'clock-display':
                // Update clock display
                if (window.clock) {
                    window.clock.updateDisplay();
                }
                break;
            case 'clock-time-format':
                // Update time format
                if (window.clock) {
                    window.clock.updateTimeFormat();
                }
                break;
            case 'clock-seconds':
                // Update seconds display
                if (window.clock) {
                    window.clock.updateSecondsDisplay();
                }
                break;
            case 'theme':
                // Apply theme
                this.applyTheme(value);
                break;
            default:
                console.log(`Setting ${settingName} changed to ${value}`);
        }
    }

    showSettingFeedback(settingName, value) {
        // Create a temporary notification
        const notification = document.createElement('div');
        notification.className = 'setting-feedback';
        notification.textContent = `${settingName} updated to ${value}`;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: var(--success-gradient);
            color: var(--on-success);
            padding: 12px 20px;
            border-radius: 8px;
            font-weight: 600;
            z-index: 10000;
            animation: slideInRight 0.3s ease-out;
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.animation = 'slideOutRight 0.3s ease-out';
            setTimeout(() => {
                notification.remove();
            }, 300);
        }, 2000);
    }

    showQuickSettingsMenu() {
        // Remove existing menu if any
        const existingMenu = document.querySelector('.quick-settings-menu');
        if (existingMenu) {
            existingMenu.remove();
        }

        // Create quick settings menu
        const menu = document.createElement('div');
        menu.className = 'quick-settings-menu';
        menu.innerHTML = `
            <div class="quick-menu-item" data-action="export">
                <span class="menu-icon">📤</span>
                <span class="menu-text">Export Settings</span>
            </div>
            <div class="quick-menu-item" data-action="import">
                <span class="menu-icon">📥</span>
                <span class="menu-text">Import Settings</span>
            </div>
            <div class="quick-menu-item" data-action="reset">
                <span class="menu-icon">🔄</span>
                <span class="menu-text">Reset All</span>
            </div>
            <div class="quick-menu-item" data-action="help">
                <span class="menu-icon">❓</span>
                <span class="menu-text">Help & Support</span>
            </div>
        `;

        // Position menu
        const quickMenuBtn = document.getElementById('settings-quick-menu');
        if (quickMenuBtn) {
            const rect = quickMenuBtn.getBoundingClientRect();
            menu.style.cssText = `
                position: fixed;
                top: ${rect.bottom + 10}px;
                right: ${rect.right - 200}px;
                background: rgba(255, 255, 255, 0.95);
                backdrop-filter: blur(20px);
                border: 1px solid rgba(76, 175, 80, 0.2);
                border-radius: var(--radius-lg);
                box-shadow: var(--elevation-4);
                z-index: 10000;
                min-width: 180px;
                padding: var(--spacing-sm);
                animation: slideInDown 0.3s ease-out;
            `;
        }

        document.body.appendChild(menu);

        // Add event listeners
        const menuItems = menu.querySelectorAll('.quick-menu-item');
        menuItems.forEach(item => {
            item.addEventListener('click', () => {
                this.handleQuickMenuAction(item.dataset.action);
                menu.remove();
            });
        });

        // Close menu when clicking outside
        document.addEventListener('click', function closeMenu(e) {
            if (!menu.contains(e.target) && !quickMenuBtn.contains(e.target)) {
                menu.remove();
                document.removeEventListener('click', closeMenu);
            }
        });
    }

    handleQuickMenuAction(action) {
        switch (action) {
            case 'export':
                this.exportSettings();
                break;
            case 'import':
                this.importSettings();
                break;
            case 'reset':
                this.resetAllSettings();
                break;
            case 'help':
                this.showHelp();
                break;
        }
    }

    exportSettings() {
        const dataStr = JSON.stringify(this.settings, null, 2);
        const dataBlob = new Blob([dataStr], {type: 'application/json'});
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'dashboard-settings.json';
        link.click();
        URL.revokeObjectURL(url);
        this.showSettingFeedback('Settings', 'exported successfully');
    }

    importSettings() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        input.onchange = (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    try {
                        const importedSettings = JSON.parse(e.target.result);
                        this.settings = { ...this.settings, ...importedSettings };
                        this.saveSettings();
                        this.applySettings();
                        this.showSettingFeedback('Settings', 'imported successfully');
                    } catch (error) {
                        this.showSettingFeedback('Import', 'failed - invalid file');
                    }
                };
                reader.readAsText(file);
            }
        };
        input.click();
    }

    resetAllSettings() {
        if (confirm('Are you sure you want to reset all settings to default?')) {
            this.settings = {
                language: 'en',
                userName: '',
                location: '',
                theme: 'auto',
                animations: true,
                widgets: {
                    weather: true,
                    quotes: true,
                    stats: true,
                    calendar: true,
                    calculator: true,
                    converter: true,
                    timer: true
                }
            };
            this.saveSettings();
            this.applySettings();
            this.showSettingFeedback('Settings', 'reset to default');
        }
    }

    showHelp() {
        // Create help modal
        const helpModal = document.createElement('div');
        helpModal.className = 'help-modal';
        helpModal.innerHTML = `
            <div class="help-content">
                <h3>Help & Support</h3>
                <p>Need help with the dashboard? Here are some quick tips:</p>
                <ul>
                    <li>Use the search bar to quickly find settings</li>
                    <li>Click category tabs to organize settings</li>
                    <li>Toggle widgets on/off to customize your dashboard</li>
                    <li>Export/import settings to backup your preferences</li>
                </ul>
                <button class="help-close">Got it!</button>
            </div>
        `;
        
        helpModal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.5);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 10001;
            animation: fadeIn 0.3s ease-out;
        `;

        document.body.appendChild(helpModal);

        const closeBtn = helpModal.querySelector('.help-close');
        closeBtn.addEventListener('click', () => {
            helpModal.remove();
        });

        helpModal.addEventListener('click', (e) => {
            if (e.target === helpModal) {
                helpModal.remove();
            }
        });
    }

    setupScrollIndicators() {
        const categoriesContainer = document.querySelector('.settings-categories');
        const leftIndicator = document.getElementById('scroll-left');
        const rightIndicator = document.getElementById('scroll-right');

        if (!categoriesContainer || !leftIndicator || !rightIndicator) return;

        const updateScrollIndicators = () => {
            const { scrollLeft, scrollWidth, clientWidth } = categoriesContainer;
            
            // Show/hide left indicator
            if (scrollLeft > 0) {
                leftIndicator.classList.add('visible');
            } else {
                leftIndicator.classList.remove('visible');
            }
            
            // Show/hide right indicator
            if (scrollLeft < scrollWidth - clientWidth - 1) {
                rightIndicator.classList.add('visible');
            } else {
                rightIndicator.classList.remove('visible');
            }
        };

        // Initial check
        updateScrollIndicators();

        // Update on scroll
        categoriesContainer.addEventListener('scroll', updateScrollIndicators);

        // Left scroll button
        leftIndicator.addEventListener('click', () => {
            categoriesContainer.scrollBy({
                left: -200,
                behavior: 'smooth'
            });
        });

        // Right scroll button
        rightIndicator.addEventListener('click', () => {
            categoriesContainer.scrollBy({
                left: 200,
                behavior: 'smooth'
            });
        });

        // Update on window resize
        window.addEventListener('resize', updateScrollIndicators);
    }
}

// Initialize settings manager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.settingsManager = new SettingsManager();
});

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SettingsManager;
}
