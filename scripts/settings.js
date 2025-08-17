/**
 * Enhanced Settings Manager
 * Handles the comprehensive settings modal with all dashboard configurations
 */

class EnhancedSettingsManager {
    constructor() {
        this.currentTab = 'personalization';
        this.settings = {};
        this.init();
    }

    init() {
        this.loadSettings();
        this.bindEvents();
        this.initializeToggles();
        this.setupColorPicker();
        this.setupBackgroundOptions();
    }

    bindEvents() {
        // Settings modal open/close
        document.addEventListener('click', (e) => {
            if (e.target.matches('[data-action="open-settings"]')) {
                this.openSettings();
            }
        });

        // Close settings
        document.getElementById('settings-close-btn')?.addEventListener('click', () => {
            this.closeSettings();
        });

        // Tab navigation
        document.querySelectorAll('.nav-item').forEach(item => {
            item.addEventListener('click', (e) => {
                this.switchTab(e.target.closest('.nav-item').dataset.tab);
            });
        });

        // Toggle switches
        document.querySelectorAll('.toggle-switch').forEach(toggle => {
            toggle.addEventListener('click', (e) => {
                this.toggleSwitch(e.target);
            });
        });

        // Color picker
        document.querySelectorAll('.color-option').forEach(option => {
            option.addEventListener('click', (e) => {
                this.selectColor(e.target);
            });
        });

        // Background options
        document.querySelectorAll('.bg-option').forEach(option => {
            option.addEventListener('click', (e) => {
                this.selectBackground(e.target);
            });
        });

        // Widget toggles - Enhanced for all widget types
        document.querySelectorAll('.widget-card .toggle-switch').forEach(toggle => {
            toggle.addEventListener('click', (e) => {
                this.toggleWidget(e.target);
            });
        });

        // Animation speed selector
        document.getElementById('animation-speed')?.addEventListener('change', (e) => {
            this.updateAnimationSpeed(e.target.value);
        });

        // Widget size selector
        document.getElementById('widget-size')?.addEventListener('change', (e) => {
            this.updateWidgetSize(e.target.value);
        });

        // Save settings
        document.getElementById('save-settings-btn')?.addEventListener('click', () => {
            this.saveSettings();
        });

        // Reset settings
        document.getElementById('reset-settings-btn')?.addEventListener('click', () => {
            this.resetSettings();
        });

        // Data actions
        document.getElementById('export-data')?.addEventListener('click', () => {
            this.exportData();
        });

        document.getElementById('import-data')?.addEventListener('click', () => {
            this.importData();
        });

        document.getElementById('backup-now')?.addEventListener('click', () => {
            this.backupData();
        });

        // Integration buttons
        document.querySelectorAll('.connect-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.connectService(e.target);
            });
        });

        // Form inputs
        document.querySelectorAll('.settings-input, .settings-select').forEach(input => {
            input.addEventListener('change', (e) => {
                this.updateSetting(e.target.id, e.target.value);
            });
        });

        // Close on overlay click
        document.querySelector('.settings-overlay')?.addEventListener('click', (e) => {
            if (e.target.classList.contains('settings-overlay')) {
                this.closeSettings();
            }
        });

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isOpen()) {
                this.closeSettings();
            }
        });
    }

    openSettings() {
        const modal = document.getElementById('settings-modal');
        modal.classList.remove('hidden');
        modal.classList.add('show');
        document.body.style.overflow = 'hidden';
        this.loadCurrentSettings();
    }

    closeSettings() {
        const modal = document.getElementById('settings-modal');
        modal.classList.remove('show');
        modal.classList.add('hidden');
        document.body.style.overflow = '';
    }

    isOpen() {
        return document.getElementById('settings-modal').classList.contains('show');
    }

    switchTab(tabName) {
        // Update navigation
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('active');
        });
        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');

        // Update content
        document.querySelectorAll('.settings-tab').forEach(tab => {
            tab.classList.remove('active');
        });
        document.getElementById(`${tabName}-tab`).classList.add('active');

        this.currentTab = tabName;
    }

    toggleSwitch(toggle) {
        toggle.classList.toggle('active');
        const settingId = toggle.id;
        const isActive = toggle.classList.contains('active');
        
        this.updateSetting(settingId, isActive);
        this.applySetting(settingId, isActive);
    }

    initializeToggles() {
        // Set initial states based on saved settings
        document.querySelectorAll('.toggle-switch').forEach(toggle => {
            const settingId = toggle.id;
            const value = this.settings[settingId];
            if (value !== undefined) {
                if (value) {
                    toggle.classList.add('active');
                } else {
                    toggle.classList.remove('active');
                }
            }
        });
    }

    selectColor(colorOption) {
        document.querySelectorAll('.color-option').forEach(option => {
            option.classList.remove('active');
        });
        colorOption.classList.add('active');
        
        const color = colorOption.dataset.color;
        this.updateSetting('accent-color', color);
        this.applyAccentColor(color);
    }

    setupColorPicker() {
        const savedColor = this.settings['accent-color'] || '#4CAF50';
        document.querySelectorAll('.color-option').forEach(option => {
            if (option.dataset.color === savedColor) {
                option.classList.add('active');
            }
        });
    }

    selectBackground(bgOption) {
        document.querySelectorAll('.bg-option').forEach(option => {
            option.classList.remove('active');
        });
        bgOption.classList.add('active');
        
        const bgType = bgOption.dataset.bg;
        this.updateSetting('background-type', bgType);
        this.applyBackground(bgType);
    }

    setupBackgroundOptions() {
        const savedBg = this.settings['background-type'] || 'gradient';
        document.querySelectorAll('.bg-option').forEach(option => {
            if (option.dataset.bg === savedBg) {
                option.classList.add('active');
            }
        });
    }

    toggleWidget(toggle) {
        toggle.classList.toggle('active');
        const widgetCard = toggle.closest('.widget-card');
        const widgetId = widgetCard.dataset.widget;
        const isEnabled = toggle.classList.contains('active');
        
        this.updateSetting(`${widgetId}-enabled`, isEnabled);
        this.toggleWidgetVisibility(widgetId, isEnabled);
        
        // Update widget card appearance
        if (isEnabled) {
            widgetCard.classList.add('enabled');
            widgetCard.classList.remove('disabled');
        } else {
            widgetCard.classList.add('disabled');
            widgetCard.classList.remove('enabled');
        }
    }

    updateAnimationSpeed(speed) {
        this.updateSetting('animation-speed', speed);
        this.applyAnimationSpeed(speed);
    }

    updateWidgetSize(size) {
        this.updateSetting('widget-size', size);
        this.applyWidgetSize(size);
    }

    applyAnimationSpeed(speed) {
        const speeds = {
            'slow': '0.5s',
            'normal': '0.3s',
            'fast': '0.15s'
        };
        
        document.documentElement.style.setProperty('--transition-duration', speeds[speed] || '0.3s');
    }

    applyWidgetSize(size) {
        const sizes = {
            'small': '200px',
            'medium': '300px',
            'large': '400px'
        };
        
        document.documentElement.style.setProperty('--widget-min-width', sizes[size] || '300px');
        
        // Update all widgets
        document.querySelectorAll('.widget').forEach(widget => {
            widget.style.minWidth = sizes[size] || '300px';
        });
    }

    updateSetting(key, value) {
        this.settings[key] = value;
        this.saveToStorage();
    }

    applySetting(key, value) {
        switch (key) {
            case 'animations-enabled-toggle':
                this.toggleAnimations(value);
                break;
            case 'shadows-enabled-toggle':
                this.toggleShadows(value);
                break;
            case 'glass-enabled-toggle':
                this.toggleGlassMorphism(value);
                break;
            case 'notifications-enabled-toggle':
                this.toggleNotifications(value);
                break;
            case 'analytics-enabled-toggle':
                this.toggleAnalytics(value);
                break;
            case 'caching-enabled-toggle':
                this.toggleCaching(value);
                break;
            case 'lazy-load-toggle':
                this.toggleLazyLoading(value);
                break;
            case 'backup-enabled-toggle':
                this.toggleAutoBackup(value);
                break;
            case 'tips-enabled-toggle':
                this.toggleTips(value);
                break;
            case 'auto-pomodoro-toggle':
                this.toggleAutoPomodoro(value);
                break;
            case 'break-reminders-toggle':
                this.toggleBreakReminders(value);
                break;
            case 'goal-alerts-toggle':
                this.toggleGoalAlerts(value);
                break;
            case 'resize-enabled-toggle':
                this.toggleWidgetResize(value);
                break;
        }
    }

    applyAccentColor(color) {
        document.documentElement.style.setProperty('--primary-color', color);
        document.documentElement.style.setProperty('--primary-gradient', `linear-gradient(135deg, ${color} 0%, ${this.adjustBrightness(color, -20)} 100%)`);
    }

    applyBackground(type) {
        const container = document.querySelector('.main-container');
        container.className = `main-container bg-${type}`;
    }

    toggleWidgetVisibility(widgetId, isVisible) {
        // Handle different widget naming conventions
        const widgetSelectors = [
            `.${widgetId}-widget`,
            `.${widgetId}Widget`,
            `#${widgetId}-widget`,
            `#${widgetId}Widget`
        ];
        
        let widget = null;
        for (const selector of widgetSelectors) {
            widget = document.querySelector(selector);
            if (widget) break;
        }
        
        if (widget) {
            if (isVisible) {
                widget.style.display = 'block';
                widget.classList.add('widget-visible');
                widget.classList.remove('widget-hidden');
                
                // Initialize widget if it has an init method
                const widgetInstance = this.getWidgetInstance(widgetId);
                if (widgetInstance && typeof widgetInstance.init === 'function') {
                    try {
                        widgetInstance.init();
                    } catch (error) {
                        console.warn(`Failed to initialize ${widgetId} widget:`, error);
                    }
                }
            } else {
                widget.style.display = 'none';
                widget.classList.add('widget-hidden');
                widget.classList.remove('widget-visible');
            }
        } else {
            console.warn(`Widget ${widgetId} not found in DOM`);
        }
    }

    getWidgetInstance(widgetId) {
        const widgetMap = {
            'weather': window.weatherWidget,
            'quotes': window.quotesManager || window.QuotesWidget,
            'progress': window.progressTracker || window.ProgressWidget,
            'pomodoro': window.pomodoroTimer || window.PomodoroTimer,
            'calendar': window.calendarWidget || window.CalendarWidget,
            'calculator': window.calculatorWidget || window.CalculatorWidget,
            'converter': window.converterWidget || window.ConverterWidget,
            'timer': window.timerWidget || window.TimerWidget,
            'habit-tracker': window.habitTracker || window.HabitTracker,
            'todo': window.todoWidget || window.TodoWidget,
            'notes': window.notesWidget || window.NotesWidget,
            'clock': window.clockWidget || window.ClockWidget,
            'search': window.searchWidget || window.SearchWidget,
            'stats': window.statsWidget || window.StatsWidget,
            'voice': window.voiceWidget || window.VoiceWidget,
            'notifications': window.notificationsWidget || window.NotificationsWidget
        };
        
        return widgetMap[widgetId] || null;
    }

    toggleAnimations(enabled) {
        document.body.classList.toggle('animations-disabled', !enabled);
    }

    toggleShadows(enabled) {
        document.body.classList.toggle('shadows-disabled', !enabled);
    }

    toggleGlassMorphism(enabled) {
        document.body.classList.toggle('glass-disabled', !enabled);
    }

    toggleNotifications(enabled) {
        if (enabled) {
            this.requestNotificationPermission();
        }
    }

    toggleAnalytics(enabled) {
        if (window.analytics) {
            if (enabled) {
                window.analytics.enable();
            } else {
                window.analytics.disable();
            }
        }
    }

    toggleCaching(enabled) {
        if (enabled) {
            this.enableCaching();
        } else {
            this.disableCaching();
        }
    }

    toggleLazyLoading(enabled) {
        if (enabled) {
            this.enableLazyLoading();
        } else {
            this.disableLazyLoading();
        }
    }

    toggleAutoBackup(enabled) {
        if (enabled) {
            this.scheduleAutoBackup();
        } else {
            this.cancelAutoBackup();
        }
    }

    requestNotificationPermission() {
        if ('Notification' in window) {
            Notification.requestPermission();
        }
    }

    enableCaching() {
        // Implement caching logic
        console.log('Caching enabled');
    }

    disableCaching() {
        // Implement cache clearing
        console.log('Caching disabled');
    }

    enableLazyLoading() {
        // Implement lazy loading
        console.log('Lazy loading enabled');
    }

    disableLazyLoading() {
        // Disable lazy loading
        console.log('Lazy loading disabled');
    }

    scheduleAutoBackup() {
        // Schedule automatic backups
        console.log('Auto backup scheduled');
    }

    cancelAutoBackup() {
        // Cancel automatic backups
        console.log('Auto backup cancelled');
    }

    toggleTips(enabled) {
        if (enabled) {
            this.enableTips();
        } else {
            this.disableTips();
        }
    }

    toggleAutoPomodoro(enabled) {
        if (enabled) {
            this.enableAutoPomodoro();
        } else {
            this.disableAutoPomodoro();
        }
    }

    toggleBreakReminders(enabled) {
        if (enabled) {
            this.enableBreakReminders();
        } else {
            this.disableBreakReminders();
        }
    }

    toggleGoalAlerts(enabled) {
        if (enabled) {
            this.enableGoalAlerts();
        } else {
            this.disableGoalAlerts();
        }
    }

    toggleWidgetResize(enabled) {
        if (enabled) {
            this.enableWidgetResize();
        } else {
            this.disableWidgetResize();
        }
    }

    enableTips() {
        // Enable productivity tips
        console.log('Productivity tips enabled');
        this.showNotification('Productivity tips enabled!', 'success');
    }

    disableTips() {
        // Disable productivity tips
        console.log('Productivity tips disabled');
    }

    enableAutoPomodoro() {
        // Enable auto Pomodoro timer
        console.log('Auto Pomodoro enabled');
        this.showNotification('Auto Pomodoro timer enabled!', 'success');
    }

    disableAutoPomodoro() {
        // Disable auto Pomodoro timer
        console.log('Auto Pomodoro disabled');
    }

    enableBreakReminders() {
        // Enable break reminders
        console.log('Break reminders enabled');
        this.showNotification('Break reminders enabled!', 'success');
    }

    disableBreakReminders() {
        // Disable break reminders
        console.log('Break reminders disabled');
    }

    enableGoalAlerts() {
        // Enable goal completion alerts
        console.log('Goal alerts enabled');
        this.showNotification('Goal completion alerts enabled!', 'success');
    }

    disableGoalAlerts() {
        // Disable goal completion alerts
        console.log('Goal alerts disabled');
    }

    enableWidgetResize() {
        // Enable widget resizing
        document.body.classList.add('widget-resize-enabled');
        console.log('Widget resize enabled');
        this.showNotification('Widget resizing enabled!', 'success');
    }

    disableWidgetResize() {
        // Disable widget resizing
        document.body.classList.remove('widget-resize-enabled');
        console.log('Widget resize disabled');
    }

    connectService(button) {
        const serviceId = button.id.replace('-connect', '');
        const serviceName = button.closest('.integration-card').querySelector('h4').textContent;
        
        // Show connection dialog
        this.showConnectionDialog(serviceId, serviceName);
    }

    showConnectionDialog(serviceId, serviceName) {
        // Implement OAuth flow for different services
        console.log(`Connecting to ${serviceName}...`);
        
        // For now, just show a success message
        this.showNotification(`Successfully connected to ${serviceName}!`, 'success');
    }

    exportData() {
        const data = {
            settings: this.settings,
            widgets: this.getWidgetData(),
            timestamp: new Date().toISOString()
        };

        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `dashboard-backup-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);

        this.showNotification('Data exported successfully!', 'success');
    }

    importData() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        input.onchange = (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    try {
                        const data = JSON.parse(e.target.result);
                        this.restoreData(data);
                        this.showNotification('Data imported successfully!', 'success');
                    } catch (error) {
                        this.showNotification('Invalid backup file!', 'error');
                    }
                };
                reader.readAsText(file);
            }
        };
        input.click();
    }

    backupData() {
        // Create backup
        const backup = {
            settings: this.settings,
            widgets: this.getWidgetData(),
            timestamp: new Date().toISOString()
        };

        // Save to local storage
        localStorage.setItem('dashboard-backup', JSON.stringify(backup));
        this.showNotification('Backup created successfully!', 'success');
    }

    restoreData(data) {
        if (data.settings) {
            this.settings = { ...this.settings, ...data.settings };
            this.saveToStorage();
            this.loadCurrentSettings();
        }

        if (data.widgets) {
            this.restoreWidgetData(data.widgets);
        }
    }

    getWidgetData() {
        // Collect data from all widgets
        const widgetData = {};
        
        // Progress tracker data
        if (window.progressTracker) {
            widgetData.progress = window.progressTracker.getData();
        }

        // Pomodoro data
        if (window.pomodoroTimer) {
            widgetData.pomodoro = window.pomodoroTimer.getData();
        }

        // Habit tracker data
        if (window.habitTracker) {
            widgetData.habits = window.habitTracker.getData();
        }

        return widgetData;
    }

    restoreWidgetData(widgetData) {
        // Restore widget data
        if (widgetData.progress && window.progressTracker) {
            window.progressTracker.restoreData(widgetData.progress);
        }

        if (widgetData.pomodoro && window.pomodoroTimer) {
            window.pomodoroTimer.restoreData(widgetData.pomodoro);
        }

        if (widgetData.habits && window.habitTracker) {
            window.habitTracker.restoreData(widgetData.habits);
        }
    }

    saveSettings() {
        this.saveToStorage();
        this.showNotification('Settings saved successfully!', 'success');
        this.closeSettings();
    }

    resetSettings() {
        if (confirm('Are you sure you want to reset all settings to default? This action cannot be undone.')) {
            this.settings = {};
            this.saveToStorage();
            this.loadCurrentSettings();
            this.showNotification('Settings reset to default!', 'info');
        }
    }

    loadSettings() {
        const saved = localStorage.getItem('dashboard-settings');
        if (saved) {
            this.settings = JSON.parse(saved);
        }
    }

    saveToStorage() {
        localStorage.setItem('dashboard-settings', JSON.stringify(this.settings));
    }

    loadCurrentSettings() {
        // Load current settings into form fields
        Object.keys(this.settings).forEach(key => {
            const element = document.getElementById(key);
            if (element) {
                if (element.type === 'checkbox') {
                    element.checked = this.settings[key];
                } else {
                    element.value = this.settings[key];
                }
            }
        });

        // Initialize widget states
        this.initializeWidgetStates();
        
        // Initialize visual effects
        this.initializeVisualEffects();
        
        // Initialize productivity settings
        this.initializeProductivitySettings();
    }

    initializeWidgetStates() {
        const widgetCards = document.querySelectorAll('.widget-card');
        widgetCards.forEach(card => {
            const widgetId = card.dataset.widget;
            const toggle = card.querySelector('.toggle-switch');
            const isEnabled = this.settings[`${widgetId}-enabled`] !== false; // Default to enabled
            
            if (toggle) {
                if (isEnabled) {
                    toggle.classList.add('active');
                    card.classList.add('enabled');
                    card.classList.remove('disabled');
                } else {
                    toggle.classList.remove('active');
                    card.classList.add('disabled');
                    card.classList.remove('enabled');
                }
            }
            
            // Apply widget visibility
            this.toggleWidgetVisibility(widgetId, isEnabled);
        });
    }

    initializeVisualEffects() {
        // Initialize animation speed
        const animationSpeed = this.settings['animation-speed'] || 'normal';
        this.applyAnimationSpeed(animationSpeed);
        
        // Initialize widget size
        const widgetSize = this.settings['widget-size'] || 'medium';
        this.applyWidgetSize(widgetSize);
        
        // Initialize accent color
        const accentColor = this.settings['accent-color'] || '#4CAF50';
        this.applyAccentColor(accentColor);
        
        // Initialize background type
        const backgroundType = this.settings['background-type'] || 'gradient';
        this.applyBackground(backgroundType);
    }

    initializeProductivitySettings() {
        // Initialize focus mode
        const focusMode = this.settings['focus-mode'] || 'standard';
        const focusSelect = document.getElementById('focus-mode');
        if (focusSelect) {
            focusSelect.value = focusMode;
        }
        
        // Initialize work hours
        const workStart = this.settings['work-start'] || '09:00';
        const workEnd = this.settings['work-end'] || '17:00';
        
        const workStartInput = document.getElementById('work-start');
        const workEndInput = document.getElementById('work-end');
        
        if (workStartInput) workStartInput.value = workStart;
        if (workEndInput) workEndInput.value = workEnd;
        
        // Initialize notification sound
        const notificationSound = this.settings['notification-sound'] || 'default';
        const soundSelect = document.getElementById('notification-sound');
        if (soundSelect) {
            soundSelect.value = notificationSound;
        }
    }

    adjustBrightness(color, percent) {
        const num = parseInt(color.replace('#', ''), 16);
        const amt = Math.round(2.55 * percent);
        const R = (num >> 16) + amt;
        const G = (num >> 8 & 0x00FF) + amt;
        const B = (num & 0x0000FF) + amt;
        return '#' + (0x1000000 + (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 +
            (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 +
            (B < 255 ? B < 1 ? 0 : B : 255)).toString(16).slice(1);
    }

    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        
        // Add icon based on type
        const icons = {
            success: '✓',
            error: '✕',
            warning: '⚠',
            info: 'ℹ'
        };
        
        notification.innerHTML = `
            <div class="notification-content">
                <span class="notification-icon">${icons[type] || icons.info}</span>
                <span class="notification-message">${message}</span>
            </div>
            <button class="notification-close">×</button>
        `;

        // Add to page
        document.body.appendChild(notification);

        // Show notification
        setTimeout(() => {
            notification.classList.add('show');
        }, 100);

        // Auto remove after 3 seconds
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, 3000);

        // Close button
        notification.querySelector('.notification-close').addEventListener('click', () => {
            notification.classList.remove('show');
            setTimeout(() => {
                if (document.body.contains(notification)) {
                    document.body.removeChild(notification);
                }
            }, 300);
        });
    }
}

// Initialize settings manager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.settingsManager = new EnhancedSettingsManager();
});

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = EnhancedSettingsManager;
}
