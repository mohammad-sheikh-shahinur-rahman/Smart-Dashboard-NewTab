/* 
 * Enhanced Stats Widget - Productivity Analytics Dashboard
 * Features: Usage statistics, Productivity tracking, Data visualization
 * Copyright (c) 2024
 * Licensed under the MIT License
 */

class StatsWidget {
    constructor() {
        this.stats = {
            daily: {},
            weekly: {},
            monthly: {},
            yearly: {}
        };
        this.currentPeriod = 'daily';
        this.isLoading = false;
        
        // DOM elements
        this.statsContainer = document.getElementById('stats-container');
        this.statsPeriod = document.getElementById('stats-period');
        this.statsGrid = document.getElementById('stats-grid');
        this.statsChart = document.getElementById('stats-chart');
        this.refreshBtn = document.getElementById('stats-refresh');
        this.exportBtn = document.getElementById('stats-export');
        
        // Settings
        this.settings = {
            autoRefresh: true,
            refreshInterval: 5, // minutes
            showCharts: true,
            showDetails: true,
            trackProductivity: true,
            trackUsage: true
        };
        
        this.refreshInterval = null;
        this.lastUpdate = 0;
        
        this.init();
    }

    async init() {
        try {
            await this.loadSettings();
        await this.loadStats();
            this.setupEventListeners();
            this.startAutoRefresh();
            await this.updateStats();
            console.log('Stats Widget initialized successfully');
        } catch (error) {
            console.error('Failed to initialize Stats Widget:', error);
            this.showError('Failed to initialize stats service');
        }
    }

    setupEventListeners() {
        // Refresh button
        if (this.refreshBtn) {
            this.refreshBtn.addEventListener('click', () => {
                this.updateStats();
            });
        }

        // Export button
        if (this.exportBtn) {
            this.exportBtn.addEventListener('click', () => {
                this.exportStats();
            });
        }

        // Period selector
        if (this.statsPeriod) {
            this.statsPeriod.addEventListener('change', (e) => {
                this.currentPeriod = e.target.value;
        this.updateDisplay();
            });
        }

        // Settings button
        const settingsBtn = document.getElementById('stats-settings');
        if (settingsBtn) {
            settingsBtn.addEventListener('click', () => {
                this.showSettings();
            });
        }

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.code === 'KeyS' && (e.ctrlKey || e.metaKey)) {
                e.preventDefault();
                this.updateStats();
            }
        });
    }

    async loadSettings() {
        try {
            const result = await chrome.storage.sync.get('stats_settings');
            this.settings = { ...this.settings, ...result.stats_settings };
        } catch (error) {
            console.error('Failed to load stats settings:', error);
        }
    }

    async saveSettings() {
        try {
            await chrome.storage.sync.set({
                stats_settings: this.settings
            });
        } catch (error) {
            console.error('Failed to save stats settings:', error);
        }
    }

    async loadStats() {
        try {
            const result = await chrome.storage.local.get('stats_data');
            this.stats = result.stats_data || this.getDefaultStats();
        } catch (error) {
            console.error('Failed to load stats:', error);
            this.stats = this.getDefaultStats();
        }
    }

    async saveStats() {
        try {
            await chrome.storage.local.set({
                stats_data: this.stats
            });
        } catch (error) {
            console.error('Failed to save stats:', error);
        }
    }

    getDefaultStats() {
        return {
            daily: {
                tasksCompleted: 0,
                timeSpent: 0,
                productivityScore: 0,
                goalsAchieved: 0,
                notesCreated: 0,
                sessionsCompleted: 0
            },
            weekly: {
                tasksCompleted: 0,
                timeSpent: 0,
                productivityScore: 0,
                goalsAchieved: 0,
                notesCreated: 0,
                sessionsCompleted: 0
            },
            monthly: {
                tasksCompleted: 0,
                timeSpent: 0,
                productivityScore: 0,
                goalsAchieved: 0,
                notesCreated: 0,
                sessionsCompleted: 0
            },
            yearly: {
                tasksCompleted: 0,
                timeSpent: 0,
                productivityScore: 0,
                goalsAchieved: 0,
                notesCreated: 0,
                sessionsCompleted: 0
            }
        };
    }

    async updateStats() {
        if (this.isLoading) return;

        this.isLoading = true;
        this.showLoading();

        try {
            await this.collectStats();
            await this.saveStats();
            this.updateDisplay();
            this.lastUpdate = Date.now();
            this.showSuccess('Stats updated');
        } catch (error) {
            console.error('Failed to update stats:', error);
            this.showError('Failed to update statistics');
        } finally {
            this.isLoading = false;
            this.hideLoading();
        }
    }

    async collectStats() {
        // Collect data from other widgets
        const todoStats = await this.getTodoStats();
        const timerStats = await this.getTimerStats();
        const notesStats = await this.getNotesStats();
        const progressStats = await this.getProgressStats();

        // Calculate daily stats
        const today = new Date().toDateString();
        this.stats.daily = {
            tasksCompleted: todoStats.completedToday || 0,
            timeSpent: timerStats.totalTime || 0,
            productivityScore: progressStats.productivityScore || 0,
            goalsAchieved: progressStats.goalsCompleted || 0,
            notesCreated: notesStats.createdToday || 0,
            sessionsCompleted: timerStats.sessionsCompleted || 0,
            lastUpdated: new Date().toISOString()
        };

        // Calculate weekly stats
        this.stats.weekly = this.calculateWeeklyStats();
        
        // Calculate monthly stats
        this.stats.monthly = this.calculateMonthlyStats();
        
        // Calculate yearly stats
        this.stats.yearly = this.calculateYearlyStats();
    }

    async getTodoStats() {
        try {
            const result = await chrome.storage.sync.get('smartDashboard_todos');
            const todos = result.smartDashboard_todos || [];
            
            const today = new Date().toDateString();
            const completedToday = todos.filter(todo => 
                todo.completed && todo.completedAt && 
                new Date(todo.completedAt).toDateString() === today
            ).length;

            return {
                total: todos.length,
                completed: todos.filter(todo => todo.completed).length,
                completedToday: completedToday,
                pending: todos.filter(todo => !todo.completed).length
            };
        } catch (error) {
            console.error('Failed to get todo stats:', error);
            return { total: 0, completed: 0, completedToday: 0, pending: 0 };
        }
    }

    async getTimerStats() {
        try {
            const result = await chrome.storage.local.get('timer_sessions');
            const sessions = result.timer_sessions || [];
            
            const today = new Date().toDateString();
            const todaySessions = sessions.filter(session => 
                session.startTime && new Date(session.startTime).toDateString() === today
            );

            const totalTime = todaySessions.reduce((total, session) => {
                if (session.completed && session.duration) {
                    return total + session.duration;
                }
                return total;
            }, 0);

            return {
                totalSessions: sessions.length,
                sessionsCompleted: todaySessions.filter(s => s.completed).length,
                totalTime: totalTime,
                averageSessionTime: todaySessions.length > 0 ? totalTime / todaySessions.length : 0
            };
        } catch (error) {
            console.error('Failed to get timer stats:', error);
            return { totalSessions: 0, sessionsCompleted: 0, totalTime: 0, averageSessionTime: 0 };
        }
    }

    async getNotesStats() {
        try {
            const result = await chrome.storage.sync.get('smartDashboard_notes');
            const notes = result.smartDashboard_notes || [];
            
            const today = new Date().toDateString();
            const createdToday = notes.filter(note => 
                note.createdAt && new Date(note.createdAt).toDateString() === today
            ).length;

            return {
                total: notes.length,
                createdToday: createdToday,
                totalWords: notes.reduce((total, note) => {
                    const words = note.content ? note.content.split(/\s+/).length : 0;
                    return total + words;
                }, 0)
            };
        } catch (error) {
            console.error('Failed to get notes stats:', error);
            return { total: 0, createdToday: 0, totalWords: 0 };
        }
    }

    async getProgressStats() {
        try {
            const result = await chrome.storage.sync.get('progress_data');
            const progress = result.progress_data || {};
            
            const goalsCompleted = progress.goals ? 
                progress.goals.filter(goal => goal.completed > 0).length : 0;
            
            const habitsCompleted = progress.habits ? 
                progress.habits.filter(habit => habit.completed).length : 0;

            return {
                productivityScore: progress.productivityScore || 0,
                goalsCompleted: goalsCompleted,
                habitsCompleted: habitsCompleted,
                totalGoals: progress.goals ? progress.goals.length : 0,
                totalHabits: progress.habits ? progress.habits.length : 0
            };
        } catch (error) {
            console.error('Failed to get progress stats:', error);
            return { productivityScore: 0, goalsCompleted: 0, habitsCompleted: 0, totalGoals: 0, totalHabits: 0 };
        }
    }

    calculateWeeklyStats() {
        const weekStart = new Date();
        weekStart.setDate(weekStart.getDate() - weekStart.getDay());
        weekStart.setHours(0, 0, 0, 0);

        return {
            tasksCompleted: this.stats.daily.tasksCompleted * 7, // Simplified calculation
            timeSpent: this.stats.daily.timeSpent * 7,
            productivityScore: this.stats.daily.productivityScore,
            goalsAchieved: this.stats.daily.goalsAchieved * 7,
            notesCreated: this.stats.daily.notesCreated * 7,
            sessionsCompleted: this.stats.daily.sessionsCompleted * 7,
            lastUpdated: new Date().toISOString()
        };
    }

    calculateMonthlyStats() {
        return {
            tasksCompleted: this.stats.daily.tasksCompleted * 30,
            timeSpent: this.stats.daily.timeSpent * 30,
            productivityScore: this.stats.daily.productivityScore,
            goalsAchieved: this.stats.daily.goalsAchieved * 30,
            notesCreated: this.stats.daily.notesCreated * 30,
            sessionsCompleted: this.stats.daily.sessionsCompleted * 30,
            lastUpdated: new Date().toISOString()
        };
    }

    calculateYearlyStats() {
        return {
            tasksCompleted: this.stats.daily.tasksCompleted * 365,
            timeSpent: this.stats.daily.timeSpent * 365,
            productivityScore: this.stats.daily.productivityScore,
            goalsAchieved: this.stats.daily.goalsAchieved * 365,
            notesCreated: this.stats.daily.notesCreated * 365,
            sessionsCompleted: this.stats.daily.sessionsCompleted * 365,
            lastUpdated: new Date().toISOString()
        };
    }

    updateDisplay() {
        const currentStats = this.stats[this.currentPeriod];
        if (!currentStats) return;

        // Update stats grid
        if (this.statsGrid) {
            this.statsGrid.innerHTML = `
                <div class="stat-card">
                    <div class="stat-icon">
                        <span class="material-symbols-outlined">task_alt</span>
                    </div>
                    <div class="stat-content">
                        <div class="stat-value">${currentStats.tasksCompleted}</div>
                        <div class="stat-label">Tasks Completed</div>
                    </div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon">
                        <span class="material-symbols-outlined">timer</span>
                    </div>
                    <div class="stat-content">
                        <div class="stat-value">${this.formatTime(currentStats.timeSpent)}</div>
                        <div class="stat-label">Time Spent</div>
                    </div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon">
                        <span class="material-symbols-outlined">trending_up</span>
                    </div>
                    <div class="stat-content">
                        <div class="stat-value">${currentStats.productivityScore}%</div>
                        <div class="stat-label">Productivity Score</div>
                    </div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon">
                        <span class="material-symbols-outlined">flag</span>
                    </div>
                    <div class="stat-content">
                        <div class="stat-value">${currentStats.goalsAchieved}</div>
                        <div class="stat-label">Goals Achieved</div>
                    </div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon">
                        <span class="material-symbols-outlined">note</span>
                    </div>
                    <div class="stat-content">
                        <div class="stat-value">${currentStats.notesCreated}</div>
                        <div class="stat-label">Notes Created</div>
                    </div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon">
                        <span class="material-symbols-outlined">play_circle</span>
                    </div>
                    <div class="stat-content">
                        <div class="stat-value">${currentStats.sessionsCompleted}</div>
                        <div class="stat-label">Sessions Completed</div>
                    </div>
                </div>
            `;
        }

        // Update chart if enabled
        if (this.settings.showCharts && this.statsChart) {
            this.updateChart();
        }

        // Update refresh button
        if (this.refreshBtn) {
            this.refreshBtn.disabled = this.isLoading;
            this.refreshBtn.innerHTML = this.isLoading ? 
                '<span class="material-symbols-outlined rotating">refresh</span>' : 
                '<span class="material-symbols-outlined">refresh</span>';
        }

        // Update last updated time
        const lastUpdatedEl = document.getElementById('stats-last-updated');
        if (lastUpdatedEl) {
            const lastUpdated = new Date(currentStats.lastUpdated);
            lastUpdatedEl.textContent = `Last updated: ${lastUpdated.toLocaleTimeString()}`;
        }
    }

    updateChart() {
        if (!this.statsChart) return;

        const periods = ['daily', 'weekly', 'monthly', 'yearly'];
        const data = periods.map(period => ({
            period: period.charAt(0).toUpperCase() + period.slice(1),
            tasks: this.stats[period].tasksCompleted,
            time: this.stats[period].timeSpent / 60, // Convert to hours
            productivity: this.stats[period].productivityScore
        }));

        // Create a simple bar chart using CSS
        this.statsChart.innerHTML = `
            <div class="chart-container">
                <h4>Productivity Overview</h4>
                <div class="chart-bars">
                    ${data.map(item => `
                        <div class="chart-bar-group">
                            <div class="chart-bar" style="height: ${Math.min(100, item.productivity)}%">
                                <span class="chart-value">${item.productivity}%</span>
                            </div>
                            <div class="chart-label">${item.period}</div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }

    formatTime(seconds) {
        if (seconds < 60) {
            return `${seconds}s`;
        } else if (seconds < 3600) {
            const minutes = Math.floor(seconds / 60);
            return `${minutes}m`;
        } else {
            const hours = Math.floor(seconds / 3600);
            const minutes = Math.floor((seconds % 3600) / 60);
            return `${hours}h ${minutes}m`;
        }
    }

    exportStats() {
        const data = {
            stats: this.stats,
            exportDate: new Date().toISOString(),
            version: '1.0'
        };

        const blob = new Blob([JSON.stringify(data, null, 2)], {
            type: 'application/json'
        });

        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `productivity-stats-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        this.showSuccess('Statistics exported successfully');
    }

    showSettings() {
        const dialog = document.createElement('div');
        dialog.className = 'modal-overlay';
        dialog.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>Statistics Settings</h3>
                </div>
                <div class="modal-body">
                    <div class="form-group">
                        <label>
                            <input type="checkbox" id="stats-auto-refresh" ${this.settings.autoRefresh ? 'checked' : ''}>
                            Auto refresh statistics
                        </label>
                    </div>
                    <div class="form-group">
                        <label>Refresh interval (minutes)</label>
                        <input type="number" id="stats-refresh-interval" value="${this.settings.refreshInterval}" min="1" max="60" class="form-input">
                    </div>
                    <div class="form-group">
                        <label>
                            <input type="checkbox" id="stats-show-charts" ${this.settings.showCharts ? 'checked' : ''}>
                            Show charts and graphs
                        </label>
                    </div>
                    <div class="form-group">
                        <label>
                            <input type="checkbox" id="stats-show-details" ${this.settings.showDetails ? 'checked' : ''}>
                            Show detailed statistics
                        </label>
                    </div>
                    <div class="form-group">
                        <label>
                            <input type="checkbox" id="stats-track-productivity" ${this.settings.trackProductivity ? 'checked' : ''}>
                            Track productivity metrics
                        </label>
                    </div>
                    <div class="form-group">
                        <label>
                            <input type="checkbox" id="stats-track-usage" ${this.settings.trackUsage ? 'checked' : ''}>
                            Track usage statistics
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
            this.settings.autoRefresh = dialog.querySelector('#stats-auto-refresh').checked;
            this.settings.refreshInterval = parseInt(dialog.querySelector('#stats-refresh-interval').value);
            this.settings.showCharts = dialog.querySelector('#stats-show-charts').checked;
            this.settings.showDetails = dialog.querySelector('#stats-show-details').checked;
            this.settings.trackProductivity = dialog.querySelector('#stats-track-productivity').checked;
            this.settings.trackUsage = dialog.querySelector('#stats-track-usage').checked;

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
            this.updateStats();
        }, this.settings.refreshInterval * 60 * 1000);
    }

    stopAutoRefresh() {
        if (this.refreshInterval) {
            clearInterval(this.refreshInterval);
            this.refreshInterval = null;
        }
    }

    showLoading() {
        if (this.statsGrid) {
            this.statsGrid.innerHTML = `
                <div class="stats-loading">
                    <span class="material-symbols-outlined rotating">refresh</span>
                    <p>Updating statistics...</p>
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
    window.StatsWidget = new StatsWidget();
});
} else {
    window.StatsWidget = new StatsWidget();
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = StatsWidget;
}
