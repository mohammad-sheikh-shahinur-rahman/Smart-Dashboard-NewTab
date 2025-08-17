/* 
 * Productivity Tools - Advanced Productivity Features
 * Features: Pomodoro Timer, Habit Tracker, Goal Setting, Focus Mode, Time Tracking
 * Copyright (c) 2024
 * Licensed under the MIT License
 */

class ProductivityTools {
    constructor() {
        this.storageKey = 'smartDashboard_productivity';
        this.isInitialized = false;
        
        // Pomodoro settings
        this.pomodoroSettings = {
            workDuration: 25,
            shortBreakDuration: 5,
            longBreakDuration: 15,
            longBreakInterval: 4,
            autoStartBreaks: false,
            autoStartPomodoros: false,
            soundEnabled: true,
            notificationEnabled: true
        };
        
        // Habit tracking
        this.habits = [];
        this.habitStreaks = {};
        
        // Goal tracking
        this.goals = {
            daily: [],
            weekly: [],
            monthly: [],
            yearly: []
        };
        
        // Focus mode
        this.focusMode = {
            enabled: false,
            startTime: null,
            endTime: null,
            duration: 0,
            distractions: []
        };
        
        // Time tracking
        this.timeTracking = {
            sessions: [],
            totalTime: 0,
            dailyGoal: 480, // 8 hours in minutes
            currentSession: null
        };
        
        // DOM elements
        this.pomodoroContainer = document.getElementById('pomodoro-container');
        this.habitContainer = document.getElementById('habit-container');
        this.goalContainer = document.getElementById('goal-container');
        this.focusContainer = document.getElementById('focus-container');
        
        this.init();
    }

    async init() {
        try {
            await this.loadSettings();
            this.setupEventListeners();
            this.renderHabits();
            this.renderGoals();
            this.updateFocusMode();
            this.isInitialized = true;
            console.log('Productivity Tools initialized successfully');
        } catch (error) {
            console.error('Failed to initialize Productivity Tools:', error);
        }
    }

    async loadSettings() {
        try {
            const result = await chrome.storage.sync.get(this.storageKey);
            const data = result[this.storageKey] || {};
            
            this.pomodoroSettings = { ...this.pomodoroSettings, ...data.pomodoroSettings };
            this.habits = data.habits || [];
            this.habitStreaks = data.habitStreaks || {};
            this.goals = { ...this.goals, ...data.goals };
            this.focusMode = { ...this.focusMode, ...data.focusMode };
            this.timeTracking = { ...this.timeTracking, ...data.timeTracking };
            
        } catch (error) {
            console.error('Failed to load productivity settings:', error);
        }
    }

    async saveSettings() {
        try {
            const data = {
                pomodoroSettings: this.pomodoroSettings,
                habits: this.habits,
                habitStreaks: this.habitStreaks,
                goals: this.goals,
                focusMode: this.focusMode,
                timeTracking: this.timeTracking
            };
            
            await chrome.storage.sync.set({ [this.storageKey]: data });
        } catch (error) {
            console.error('Failed to save productivity settings:', error);
        }
    }

    setupEventListeners() {
        // Pomodoro controls
        const startPomodoroBtn = document.getElementById('start-pomodoro');
        const pausePomodoroBtn = document.getElementById('pause-pomodoro');
        const resetPomodoroBtn = document.getElementById('reset-pomodoro');
        
        if (startPomodoroBtn) {
            startPomodoroBtn.addEventListener('click', () => this.startPomodoro());
        }
        if (pausePomodoroBtn) {
            pausePomodoroBtn.addEventListener('click', () => this.pausePomodoro());
        }
        if (resetPomodoroBtn) {
            resetPomodoroBtn.addEventListener('click', () => this.resetPomodoro());
        }

        // Habit tracking
        const addHabitBtn = document.getElementById('add-habit-btn');
        if (addHabitBtn) {
            addHabitBtn.addEventListener('click', () => this.showAddHabitModal());
        }

        // Goal tracking
        const addGoalBtn = document.getElementById('add-goal-btn');
        if (addGoalBtn) {
            addGoalBtn.addEventListener('click', () => this.showAddGoalModal());
        }

        // Focus mode
        const toggleFocusBtn = document.getElementById('toggle-focus');
        if (toggleFocusBtn) {
            toggleFocusBtn.addEventListener('click', () => this.toggleFocusMode());
        }
    }

    // Pomodoro Timer Methods
    startPomodoro() {
        if (!this.pomodoroTimer) {
            this.pomodoroTimer = {
                type: 'work',
                startTime: Date.now(),
                duration: this.pomodoroSettings.workDuration * 60 * 1000,
                isRunning: true
            };
            
            this.updatePomodoroDisplay();
            this.startPomodoroCountdown();
            
            if (this.pomodoroSettings.notificationEnabled) {
                this.showNotification('Pomodoro started', 'Focus time begins now!');
            }
        }
    }

    pausePomodoro() {
        if (this.pomodoroTimer && this.pomodoroTimer.isRunning) {
            this.pomodoroTimer.isRunning = false;
            clearTimeout(this.pomodoroTimeout);
        }
    }

    resetPomodoro() {
        if (this.pomodoroTimer) {
            clearTimeout(this.pomodoroTimeout);
            this.pomodoroTimer = null;
            this.updatePomodoroDisplay();
        }
    }

    startPomodoroCountdown() {
        if (!this.pomodoroTimer || !this.pomodoroTimer.isRunning) return;
        
        const remaining = this.pomodoroTimer.startTime + this.pomodoroTimer.duration - Date.now();
        
        if (remaining <= 0) {
            this.completePomodoro();
        } else {
            this.updatePomodoroDisplay();
            this.pomodoroTimeout = setTimeout(() => this.startPomodoroCountdown(), 1000);
        }
    }

    completePomodoro() {
        const isWorkSession = this.pomodoroTimer.type === 'work';
        
        if (isWorkSession) {
            this.timeTracking.totalTime += this.pomodoroSettings.workDuration;
            this.showNotification('Work session complete!', 'Time for a break.');
            
            if (this.pomodoroSettings.autoStartBreaks) {
                this.startBreak();
            }
        } else {
            this.showNotification('Break complete!', 'Ready for next work session?');
            
            if (this.pomodoroSettings.autoStartPomodoros) {
                this.startPomodoro();
            }
        }
        
        this.resetPomodoro();
    }

    startBreak() {
        const isLongBreak = (this.timeTracking.totalTime / this.pomodoroSettings.workDuration) % 
                           this.pomodoroSettings.longBreakInterval === 0;
        
        this.pomodoroTimer = {
            type: isLongBreak ? 'longBreak' : 'shortBreak',
            startTime: Date.now(),
            duration: (isLongBreak ? this.pomodoroSettings.longBreakDuration : 
                      this.pomodoroSettings.shortBreakDuration) * 60 * 1000,
            isRunning: true
        };
        
        this.startPomodoroCountdown();
    }

    updatePomodoroDisplay() {
        const pomodoroDisplay = document.getElementById('pomodoro-display');
        const pomodoroProgress = document.getElementById('pomodoro-progress');
        
        if (!pomodoroDisplay || !this.pomodoroTimer) return;
        
        const remaining = this.pomodoroTimer.startTime + this.pomodoroTimer.duration - Date.now();
        const minutes = Math.floor(remaining / 60000);
        const seconds = Math.floor((remaining % 60000) / 1000);
        
        pomodoroDisplay.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        
        if (pomodoroProgress) {
            const progress = ((this.pomodoroTimer.duration - remaining) / this.pomodoroTimer.duration) * 100;
            pomodoroProgress.style.width = `${progress}%`;
        }
    }

    // Habit Tracking Methods
    addHabit(name, frequency = 'daily', target = 1) {
        const habit = {
            id: Date.now().toString(),
            name,
            frequency,
            target,
            completed: 0,
            streak: 0,
            createdAt: Date.now()
        };
        
        this.habits.push(habit);
        this.saveSettings();
        this.renderHabits();
    }

    completeHabit(habitId) {
        const habit = this.habits.find(h => h.id === habitId);
        if (habit) {
            habit.completed++;
            
            // Update streak
            const today = new Date().toDateString();
            if (!this.habitStreaks[habitId]) {
                this.habitStreaks[habitId] = { lastCompleted: null, currentStreak: 0 };
            }
            
            const streak = this.habitStreaks[habitId];
            if (streak.lastCompleted === today) {
                // Already completed today
                return;
            }
            
            if (streak.lastCompleted === new Date(Date.now() - 86400000).toDateString()) {
                // Consecutive day
                streak.currentStreak++;
            } else {
                // Break in streak
                streak.currentStreak = 1;
            }
            
            streak.lastCompleted = today;
            habit.streak = streak.currentStreak;
            
            this.saveSettings();
            this.renderHabits();
        }
    }

    renderHabits() {
        if (!this.habitContainer) return;
        
        this.habitContainer.innerHTML = this.habits.map(habit => `
            <div class="habit-item" data-habit-id="${habit.id}">
                <div class="habit-info">
                    <h4>${habit.name}</h4>
                    <p>${habit.completed}/${habit.target} today • ${habit.streak} day streak</p>
                </div>
                <button class="habit-complete-btn" onclick="productivityTools.completeHabit('${habit.id}')">
                    <span class="material-symbols-outlined">check</span>
                </button>
            </div>
        `).join('');
    }

    showAddHabitModal() {
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content">
                <h3>Add New Habit</h3>
                <input type="text" id="habit-name" placeholder="Habit name">
                <select id="habit-frequency">
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                </select>
                <input type="number" id="habit-target" placeholder="Target count" min="1" value="1">
                <div class="modal-actions">
                    <button onclick="this.closest('.modal').remove()">Cancel</button>
                    <button onclick="productivityTools.saveHabit()">Add Habit</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
    }

    saveHabit() {
        const name = document.getElementById('habit-name').value;
        const frequency = document.getElementById('habit-frequency').value;
        const target = parseInt(document.getElementById('habit-target').value);
        
        if (name.trim()) {
            this.addHabit(name, frequency, target);
            document.querySelector('.modal').remove();
        }
    }

    // Goal Tracking Methods
    addGoal(title, description, type = 'daily', deadline = null) {
        const goal = {
            id: Date.now().toString(),
            title,
            description,
            type,
            deadline,
            completed: false,
            progress: 0,
            createdAt: Date.now()
        };
        
        this.goals[type].push(goal);
        this.saveSettings();
        this.renderGoals();
    }

    updateGoalProgress(goalId, progress) {
        for (const type in this.goals) {
            const goal = this.goals[type].find(g => g.id === goalId);
            if (goal) {
                goal.progress = Math.min(100, Math.max(0, progress));
                goal.completed = goal.progress >= 100;
                this.saveSettings();
                this.renderGoals();
                break;
            }
        }
    }

    renderGoals() {
        if (!this.goalContainer) return;
        
        const goalsHtml = Object.entries(this.goals).map(([type, goals]) => `
            <div class="goal-section">
                <h4>${type.charAt(0).toUpperCase() + type.slice(1)} Goals</h4>
                ${goals.map(goal => `
                    <div class="goal-item" data-goal-id="${goal.id}">
                        <div class="goal-info">
                            <h5>${goal.title}</h5>
                            <p>${goal.description}</p>
                            <div class="goal-progress">
                                <div class="progress-bar">
                                    <div class="progress-fill" style="width: ${goal.progress}%"></div>
                                </div>
                                <span>${goal.progress}%</span>
                            </div>
                        </div>
                        <button class="goal-complete-btn" onclick="productivityTools.completeGoal('${goal.id}')">
                            <span class="material-symbols-outlined">check</span>
                        </button>
                    </div>
                `).join('')}
            </div>
        `).join('');
        
        this.goalContainer.innerHTML = goalsHtml;
    }

    completeGoal(goalId) {
        this.updateGoalProgress(goalId, 100);
    }

    showAddGoalModal() {
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content">
                <h3>Add New Goal</h3>
                <input type="text" id="goal-title" placeholder="Goal title">
                <textarea id="goal-description" placeholder="Goal description"></textarea>
                <select id="goal-type">
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                    <option value="yearly">Yearly</option>
                </select>
                <input type="date" id="goal-deadline">
                <div class="modal-actions">
                    <button onclick="this.closest('.modal').remove()">Cancel</button>
                    <button onclick="productivityTools.saveGoal()">Add Goal</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
    }

    saveGoal() {
        const title = document.getElementById('goal-title').value;
        const description = document.getElementById('goal-description').value;
        const type = document.getElementById('goal-type').value;
        const deadline = document.getElementById('goal-deadline').value;
        
        if (title.trim()) {
            this.addGoal(title, description, type, deadline || null);
            document.querySelector('.modal').remove();
        }
    }

    // Focus Mode Methods
    toggleFocusMode() {
        if (this.focusMode.enabled) {
            this.endFocusMode();
        } else {
            this.startFocusMode();
        }
    }

    startFocusMode() {
        this.focusMode.enabled = true;
        this.focusMode.startTime = Date.now();
        this.focusMode.distractions = [];
        
        this.updateFocusMode();
        this.showNotification('Focus mode enabled', 'Stay focused and productive!');
        
        // Block distracting sites
        this.blockDistractions();
    }

    endFocusMode() {
        if (this.focusMode.startTime) {
            this.focusMode.endTime = Date.now();
            this.focusMode.duration = (this.focusMode.endTime - this.focusMode.startTime) / 60000; // in minutes
            
            // Save session
            this.timeTracking.sessions.push({
                startTime: this.focusMode.startTime,
                endTime: this.focusMode.endTime,
                duration: this.focusMode.duration,
                distractions: this.focusMode.distractions.length
            });
        }
        
        this.focusMode.enabled = false;
        this.focusMode.startTime = null;
        this.focusMode.endTime = null;
        this.focusMode.duration = 0;
        this.focusMode.distractions = [];
        
        this.updateFocusMode();
        this.unblockDistractions();
        this.saveSettings();
        
        this.showNotification('Focus session ended', `You focused for ${Math.round(this.focusMode.duration)} minutes`);
    }

    updateFocusMode() {
        const focusBtn = document.getElementById('toggle-focus');
        const focusStatus = document.getElementById('focus-status');
        
        if (focusBtn) {
            focusBtn.textContent = this.focusMode.enabled ? 'End Focus' : 'Start Focus';
            focusBtn.className = this.focusMode.enabled ? 'focus-btn active' : 'focus-btn';
        }
        
        if (focusStatus) {
            if (this.focusMode.enabled) {
                const elapsed = (Date.now() - this.focusMode.startTime) / 60000;
                focusStatus.textContent = `Focusing for ${Math.round(elapsed)} minutes`;
            } else {
                focusStatus.textContent = 'Focus mode disabled';
            }
        }
    }

    blockDistractions() {
        // This would integrate with browser extension APIs to block distracting sites
        console.log('Blocking distracting websites...');
    }

    unblockDistractions() {
        // This would restore access to previously blocked sites
        console.log('Unblocking distracting websites...');
    }

    // Utility Methods
    showNotification(title, message) {
        if (this.pomodoroSettings.notificationEnabled) {
            if ('Notification' in window && Notification.permission === 'granted') {
                new Notification(title, { body: message });
            } else {
                // Fallback to in-app notification
                this.showInAppNotification(title, message);
            }
        }
    }

    showInAppNotification(title, message) {
        const notification = document.createElement('div');
        notification.className = 'in-app-notification';
        notification.innerHTML = `
            <h4>${title}</h4>
            <p>${message}</p>
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 5000);
    }

    // Analytics and Reporting
    getProductivityStats() {
        const today = new Date().toDateString();
        const todaySessions = this.timeTracking.sessions.filter(session => 
            new Date(session.startTime).toDateString() === today
        );
        
        return {
            totalFocusTime: todaySessions.reduce((sum, session) => sum + session.duration, 0),
            sessionsCount: todaySessions.length,
            averageSessionLength: todaySessions.length > 0 ? 
                todaySessions.reduce((sum, session) => sum + session.duration, 0) / todaySessions.length : 0,
            habitsCompleted: this.habits.reduce((sum, habit) => sum + habit.completed, 0),
            goalsCompleted: Object.values(this.goals).flat().filter(goal => goal.completed).length,
            currentStreak: Math.max(...this.habits.map(habit => habit.streak), 0)
        };
    }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.productivityTools = new ProductivityTools();
    });
} else {
    window.productivityTools = new ProductivityTools();
}
