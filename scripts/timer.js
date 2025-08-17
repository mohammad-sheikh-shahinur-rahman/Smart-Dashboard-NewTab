/* 
 * Enhanced Timer Widget - Pomodoro Timer with Session Tracking
 * Features: Timer, Stopwatch, Pomodoro Technique, Session Management
 * Copyright (c) 2024
 * Licensed under the MIT License
 */

class TimerWidget {
    constructor() {
        this.isRunning = false;
        this.isPaused = false;
        this.currentTime = 0;
        this.targetTime = 0;
        this.timerInterval = null;
        this.mode = 'timer'; // 'timer', 'stopwatch', 'pomodoro'
        
        // Pomodoro settings
        this.pomodoroSettings = {
            workDuration: 25 * 60, // 25 minutes in seconds
            breakDuration: 5 * 60, // 5 minutes in seconds
            longBreakDuration: 15 * 60, // 15 minutes in seconds
            sessionsBeforeLongBreak: 4,
            autoStartBreaks: true,
            autoStartWork: false,
            soundEnabled: true
        };
        
        // Session tracking
        this.sessions = [];
        this.currentSession = {
            type: 'work', // 'work', 'break', 'long-break'
            startTime: null,
            endTime: null,
            duration: 0,
            completed: false
        };
        this.sessionCount = 0;
        this.isPomodoroMode = false;
        
        // DOM elements
        this.timerDisplay = document.getElementById('timer-display');
        this.timerControls = document.getElementById('timer-controls');
        this.timerMode = document.getElementById('timer-mode');
        this.pomodoroStats = document.getElementById('pomodoro-stats');
        this.sessionList = document.getElementById('session-list');
        
        // Preset times (in seconds)
        this.presets = {
            '5min': 5 * 60,
            '10min': 10 * 60,
            '15min': 15 * 60,
            '25min': 25 * 60,
            '30min': 30 * 60,
            '45min': 45 * 60,
            '1hour': 60 * 60,
            '2hour': 2 * 60 * 60
        };
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadSessions();
        this.updateDisplay();
        this.updatePomodoroStats();
        console.log('Timer Widget initialized successfully');
    }

    setupEventListeners() {
        // Timer controls
        const startBtn = document.getElementById('timer-start');
        const pauseBtn = document.getElementById('timer-pause');
        const resetBtn = document.getElementById('timer-reset');
        const stopBtn = document.getElementById('timer-stop');

        if (startBtn) {
            startBtn.addEventListener('click', () => this.startTimer());
        }

        if (pauseBtn) {
            pauseBtn.addEventListener('click', () => this.pauseTimer());
        }

        if (resetBtn) {
            resetBtn.addEventListener('click', () => this.resetTimer());
        }

        if (stopBtn) {
            stopBtn.addEventListener('click', () => this.stopTimer());
        }

        // Mode switching
        const modeBtns = document.querySelectorAll('.timer-mode-btn');
        modeBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const mode = btn.dataset.mode;
                this.switchMode(mode);
            });
        });

        // Preset buttons
        const presetBtns = document.querySelectorAll('.timer-preset');
        presetBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const time = btn.dataset.time;
                this.setPresetTime(time);
            });
        });

        // Pomodoro controls
        const pomodoroStartBtn = document.getElementById('pomodoro-start');
        const pomodoroSettingsBtn = document.getElementById('pomodoro-settings');

        if (pomodoroStartBtn) {
            pomodoroStartBtn.addEventListener('click', () => this.startPomodoro());
        }

        if (pomodoroSettingsBtn) {
            pomodoroSettingsBtn.addEventListener('click', () => this.showPomodoroSettings());
        }

        // Custom time input
        const customTimeInput = document.getElementById('custom-time-input');
        if (customTimeInput) {
            customTimeInput.addEventListener('change', (e) => {
                const time = this.parseTimeInput(e.target.value);
                if (time > 0) {
                    this.setCustomTime(time);
                }
            });
        }

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            this.handleKeyboardShortcuts(e);
        });
    }

    handleKeyboardShortcuts(e) {
        // Space to start/pause timer
        if (e.code === 'Space' && this.mode === 'timer') {
                e.preventDefault();
            if (this.isRunning) {
                this.pauseTimer();
            } else {
                this.startTimer();
            }
        }

        // Escape to reset timer
        if (e.code === 'Escape') {
            e.preventDefault();
            this.resetTimer();
        }

        // R to reset timer
        if (e.code === 'KeyR' && (e.ctrlKey || e.metaKey)) {
            e.preventDefault();
            this.resetTimer();
        }

        // P to start pomodoro
        if (e.code === 'KeyP' && (e.ctrlKey || e.metaKey)) {
            e.preventDefault();
            this.startPomodoro();
        }
    }

    switchMode(mode) {
        if (this.isRunning) {
            this.stopTimer();
        }

        this.mode = mode;
        this.resetTimer();

        // Update UI
        const modeBtns = document.querySelectorAll('.timer-mode-btn');
        modeBtns.forEach(btn => {
            btn.classList.remove('active');
            if (btn.dataset.mode === mode) {
                btn.classList.add('active');
            }
        });

        // Show/hide pomodoro elements
        const pomodoroElements = document.querySelectorAll('.pomodoro-element');
        pomodoroElements.forEach(el => {
            el.style.display = mode === 'pomodoro' ? 'block' : 'none';
        });

        this.updateDisplay();
    }

    setPresetTime(preset) {
        const time = this.presets[preset];
        if (time) {
            this.targetTime = time;
            this.currentTime = time;
            this.updateDisplay();
            this.showNotification(`Timer set to ${preset}`, 'info');
        }
    }

    setCustomTime(seconds) {
        this.targetTime = seconds;
        this.currentTime = seconds;
        this.updateDisplay();
        this.showNotification(`Timer set to ${this.formatTime(seconds)}`, 'info');
    }

    parseTimeInput(input) {
        // Parse time input like "25:30" or "1:30:00"
        const parts = input.split(':').map(Number);
        if (parts.length === 2) {
            return parts[0] * 60 + parts[1];
        } else if (parts.length === 3) {
            return parts[0] * 3600 + parts[1] * 60 + parts[2];
        }
        return 0;
    }

    startTimer() {
        if (this.isRunning) return;

        if (this.mode === 'pomodoro') {
            this.startPomodoro();
            return;
        }

        if (this.currentTime <= 0) {
            this.showNotification('Please set a timer first', 'warning');
            return;
        }

        this.isRunning = true;
        this.isPaused = false;

        this.timerInterval = setInterval(() => {
            if (this.mode === 'stopwatch') {
                this.currentTime++;
            } else {
                this.currentTime--;
                if (this.currentTime <= 0) {
                    this.timerComplete();
                }
            }
            this.updateDisplay();
        }, 1000);

        this.updateControls();
        this.showNotification('Timer started', 'success');
    }

    pauseTimer() {
        if (!this.isRunning) return;

        this.isRunning = false;
        this.isPaused = true;
        clearInterval(this.timerInterval);
        this.timerInterval = null;

        this.updateControls();
        this.showNotification('Timer paused', 'info');
    }

    resumeTimer() {
        if (!this.isPaused) return;
        this.startTimer();
    }

    stopTimer() {
        this.isRunning = false;
        this.isPaused = false;
        clearInterval(this.timerInterval);
        this.timerInterval = null;

        if (this.mode === 'pomodoro') {
            this.endPomodoroSession();
        }

        this.updateControls();
        this.showNotification('Timer stopped', 'info');
    }

    resetTimer() {
        this.stopTimer();
        
        if (this.mode === 'pomodoro') {
            this.currentTime = this.pomodoroSettings.workDuration;
        } else {
            this.currentTime = this.targetTime;
        }

        this.updateDisplay();
        this.showNotification('Timer reset', 'info');
    }

    timerComplete() {
        this.stopTimer();
        
        if (this.mode === 'pomodoro') {
            this.completePomodoroSession();
        } else {
            this.playNotificationSound();
            this.showNotification('Timer completed!', 'success');
            this.showCompletionDialog();
        }
    }

    startPomodoro() {
        if (this.isRunning) return;

        this.isPomodoroMode = true;
        this.currentSession = {
            type: 'work',
            startTime: new Date(),
            endTime: null,
            duration: this.pomodoroSettings.workDuration,
            completed: false
        };

        this.currentTime = this.pomodoroSettings.workDuration;
        this.targetTime = this.pomodoroSettings.workDuration;
        this.startTimer();
        
        this.showNotification('Pomodoro work session started', 'success');
    }

    completePomodoroSession() {
        this.currentSession.endTime = new Date();
        this.currentSession.completed = true;
        this.currentSession.duration = this.pomodoroSettings.workDuration;

        this.sessions.push({ ...this.currentSession });
        this.sessionCount++;

        this.playNotificationSound();
        this.showNotification('Work session completed!', 'success');

        // Start break if auto-start is enabled
        if (this.pomodoroSettings.autoStartBreaks) {
            this.startBreak();
        } else {
            this.showBreakDialog();
        }

        this.updatePomodoroStats();
        this.saveSessions();
    }

    startBreak() {
        const isLongBreak = this.sessionCount % this.pomodoroSettings.sessionsBeforeLongBreak === 0;
        const breakDuration = isLongBreak ? 
            this.pomodoroSettings.longBreakDuration : 
            this.pomodoroSettings.breakDuration;

        this.currentSession = {
            type: isLongBreak ? 'long-break' : 'break',
            startTime: new Date(),
            endTime: null,
            duration: breakDuration,
            completed: false
        };

        this.currentTime = breakDuration;
        this.targetTime = breakDuration;
        this.startTimer();

        const breakType = isLongBreak ? 'long break' : 'break';
        this.showNotification(`${breakType} started`, 'info');
    }

    endPomodoroSession() {
        if (this.currentSession.startTime) {
            this.currentSession.endTime = new Date();
            this.currentSession.completed = false;
            this.sessions.push({ ...this.currentSession });
            this.saveSessions();
        }
    }

    showBreakDialog() {
        const dialog = document.createElement('div');
        dialog.className = 'modal-overlay';
        dialog.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>Work Session Complete!</h3>
                </div>
                <div class="modal-body">
                    <p>Great job! You've completed a work session.</p>
                    <p>Would you like to start a break now?</p>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-secondary" id="skip-break">Skip Break</button>
                    <button class="btn btn-primary" id="start-break">Start Break</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(dialog);

        dialog.querySelector('#skip-break').addEventListener('click', () => {
            document.body.removeChild(dialog);
            this.resetTimer();
        });

        dialog.querySelector('#start-break').addEventListener('click', () => {
            document.body.removeChild(dialog);
            this.startBreak();
        });
    }

    showCompletionDialog() {
        const dialog = document.createElement('div');
        dialog.className = 'modal-overlay';
        dialog.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>Timer Complete!</h3>
                </div>
                <div class="modal-body">
                    <p>Your timer has finished.</p>
                    <p>Time: ${this.formatTime(this.targetTime)}</p>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-primary" id="close-dialog">OK</button>
                </div>
            </div>
        `;

        document.body.appendChild(dialog);

        dialog.querySelector('#close-dialog').addEventListener('click', () => {
            document.body.removeChild(dialog);
        });
    }

    showPomodoroSettings() {
        const dialog = document.createElement('div');
        dialog.className = 'modal-overlay';
        dialog.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>Pomodoro Settings</h3>
                </div>
                <div class="modal-body">
                    <div class="form-group">
                        <label>Work Duration (minutes)</label>
                        <input type="number" id="work-duration" value="${this.pomodoroSettings.workDuration / 60}" min="1" max="120">
                    </div>
                    <div class="form-group">
                        <label>Break Duration (minutes)</label>
                        <input type="number" id="break-duration" value="${this.pomodoroSettings.breakDuration / 60}" min="1" max="60">
                    </div>
                    <div class="form-group">
                        <label>Long Break Duration (minutes)</label>
                        <input type="number" id="long-break-duration" value="${this.pomodoroSettings.longBreakDuration / 60}" min="1" max="120">
                    </div>
                    <div class="form-group">
                        <label>Sessions before Long Break</label>
                        <input type="number" id="sessions-before-long-break" value="${this.pomodoroSettings.sessionsBeforeLongBreak}" min="1" max="10">
                    </div>
                    <div class="form-group">
                        <label>
                            <input type="checkbox" id="auto-start-breaks" ${this.pomodoroSettings.autoStartBreaks ? 'checked' : ''}>
                            Auto-start breaks
                        </label>
                    </div>
                    <div class="form-group">
                        <label>
                            <input type="checkbox" id="auto-start-work" ${this.pomodoroSettings.autoStartWork ? 'checked' : ''}>
                            Auto-start work sessions
                        </label>
                    </div>
                    <div class="form-group">
                        <label>
                            <input type="checkbox" id="sound-enabled" ${this.pomodoroSettings.soundEnabled ? 'checked' : ''}>
                            Enable sound notifications
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

        dialog.querySelector('#save-settings').addEventListener('click', () => {
            this.pomodoroSettings.workDuration = parseInt(dialog.querySelector('#work-duration').value) * 60;
            this.pomodoroSettings.breakDuration = parseInt(dialog.querySelector('#break-duration').value) * 60;
            this.pomodoroSettings.longBreakDuration = parseInt(dialog.querySelector('#long-break-duration').value) * 60;
            this.pomodoroSettings.sessionsBeforeLongBreak = parseInt(dialog.querySelector('#sessions-before-long-break').value);
            this.pomodoroSettings.autoStartBreaks = dialog.querySelector('#auto-start-breaks').checked;
            this.pomodoroSettings.autoStartWork = dialog.querySelector('#auto-start-work').checked;
            this.pomodoroSettings.soundEnabled = dialog.querySelector('#sound-enabled').checked;

            this.saveSettings();
            document.body.removeChild(dialog);
            this.showNotification('Settings saved', 'success');
        });
    }

    updateDisplay() {
        if (this.timerDisplay) {
            this.timerDisplay.textContent = this.formatTime(this.currentTime);
        }

        // Update progress bar if exists
        const progressBar = document.querySelector('.timer-progress-bar');
        if (progressBar && this.targetTime > 0) {
            const progress = ((this.targetTime - this.currentTime) / this.targetTime) * 100;
            progressBar.style.width = `${Math.max(0, Math.min(100, progress))}%`;
        }

        // Update session info for pomodoro
        if (this.mode === 'pomodoro' && this.pomodoroStats) {
            this.updatePomodoroStats();
        }
    }

    updateControls() {
        const startBtn = document.getElementById('timer-start');
        const pauseBtn = document.getElementById('timer-pause');
        const resetBtn = document.getElementById('timer-reset');
        const stopBtn = document.getElementById('timer-stop');

        if (startBtn) {
            startBtn.style.display = this.isRunning ? 'none' : 'block';
        }

        if (pauseBtn) {
            pauseBtn.style.display = this.isRunning ? 'block' : 'none';
        }

        if (resetBtn) {
            resetBtn.disabled = this.isRunning;
        }

        if (stopBtn) {
            stopBtn.disabled = !this.isRunning;
        }
    }

    updatePomodoroStats() {
        if (!this.pomodoroStats) return;

        const completedSessions = this.sessions.filter(s => s.completed && s.type === 'work').length;
        const totalWorkTime = this.sessions
            .filter(s => s.completed && s.type === 'work')
            .reduce((total, s) => total + s.duration, 0);

        this.pomodoroStats.innerHTML = `
            <div class="stats-grid">
                <div class="stat-item">
                    <span class="stat-value">${completedSessions}</span>
                    <span class="stat-label">Sessions</span>
                </div>
                <div class="stat-item">
                    <span class="stat-value">${this.formatTime(totalWorkTime)}</span>
                    <span class="stat-label">Total Work</span>
                </div>
                <div class="stat-item">
                    <span class="stat-value">${this.sessionCount}</span>
                    <span class="stat-label">Today</span>
                </div>
            </div>
        `;
    }

    formatTime(seconds) {
        if (seconds < 0) seconds = 0;
        
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;
        
        if (hours > 0) {
            return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
        } else {
            return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
        }
    }

    playNotificationSound() {
        if (!this.pomodoroSettings.soundEnabled) return;

        try {
            const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIG2m98OScTgwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWT');
            audio.play();
        } catch (error) {
            console.warn('Could not play notification sound:', error);
        }
    }

    async loadSessions() {
        try {
            const result = await chrome.storage.local.get('timer_sessions');
            this.sessions = result.timer_sessions || [];
        } catch (error) {
            console.error('Failed to load sessions:', error);
            this.sessions = [];
        }
    }

    async saveSessions() {
        try {
            await chrome.storage.local.set({
                timer_sessions: this.sessions
            });
        } catch (error) {
            console.error('Failed to save sessions:', error);
        }
    }

    async saveSettings() {
        try {
            await chrome.storage.sync.set({
                pomodoro_settings: this.pomodoroSettings
            });
        } catch (error) {
            console.error('Failed to save settings:', error);
        }
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
    window.TimerWidget = new TimerWidget();
});
} else {
    window.TimerWidget = new TimerWidget();
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = TimerWidget;
}
