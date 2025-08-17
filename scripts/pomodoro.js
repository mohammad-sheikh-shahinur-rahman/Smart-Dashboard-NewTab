/**
 * Pomodoro Timer Widget
 * Handles Pomodoro technique timer with focus sessions and breaks
 */

class PomodoroTimer {
    constructor() {
        this.currentTime = 1500; // 25 minutes in seconds
        this.originalTime = 1500;
        this.isRunning = false;
        this.isPaused = false;
        this.currentMode = 'focus';
        this.sessionCount = 0;
        this.totalSessions = 4;
        this.timer = null;
        this.settings = this.loadSettings();
        
        this.initializeTimer();
        this.bindEvents();
        this.updateDisplay();
        this.loadStats();
    }

    initializeTimer() {
        this.timerDisplay = document.getElementById('pomodoro-time');
        this.timerLabel = document.getElementById('pomodoro-label');
        this.sessionDisplay = document.getElementById('pomodoro-session');
        this.progressCircle = document.querySelector('.timer-progress');
        this.circumference = 2 * Math.PI * 54; // 2πr where r=54
        
        // Set initial stroke-dasharray
        if (this.progressCircle) {
            this.progressCircle.style.strokeDasharray = this.circumference;
            this.progressCircle.style.strokeDashoffset = this.circumference;
        }
    }

    bindEvents() {
        // Control buttons
        document.getElementById('pomodoro-start')?.addEventListener('click', () => this.startTimer());
        document.getElementById('pomodoro-pause')?.addEventListener('click', () => this.pauseTimer());
        document.getElementById('pomodoro-reset')?.addEventListener('click', () => this.resetTimer());
        document.getElementById('pomodoro-skip')?.addEventListener('click', () => this.skipTimer());

        // Mode buttons
        document.querySelectorAll('.mode-btn').forEach(btn => {
            btn.addEventListener('click', () => this.switchMode(btn));
        });

        // Settings and stats buttons
        document.getElementById('pomodoro-settings-btn')?.addEventListener('click', () => this.showSettings());
        document.getElementById('pomodoro-stats-btn')?.addEventListener('click', () => this.showStats());
    }

    startTimer() {
        if (this.isRunning) return;
        
        this.isRunning = true;
        this.isPaused = false;
        
        const startBtn = document.getElementById('pomodoro-start');
        const pauseBtn = document.getElementById('pomodoro-pause');
        
        if (startBtn) startBtn.textContent = 'Resume';
        if (pauseBtn) pauseBtn.style.display = 'inline-block';
        
        this.timer = setInterval(() => {
            this.currentTime--;
            this.updateDisplay();
            
            if (this.currentTime <= 0) {
                this.completeSession();
            }
        }, 1000);
    }

    pauseTimer() {
        if (!this.isRunning) return;
        
        this.isRunning = false;
        this.isPaused = true;
        clearInterval(this.timer);
        
        const startBtn = document.getElementById('pomodoro-start');
        if (startBtn) startBtn.textContent = 'Resume';
    }

    resetTimer() {
        this.stopTimer();
        this.currentTime = this.originalTime;
        this.updateDisplay();
        
        const startBtn = document.getElementById('pomodoro-start');
        if (startBtn) startBtn.textContent = 'Start';
    }

    skipTimer() {
        this.completeSession();
    }

    stopTimer() {
        this.isRunning = false;
        this.isPaused = false;
        clearInterval(this.timer);
    }

    switchMode(clickedBtn) {
        // Remove active class from all mode buttons
        document.querySelectorAll('.mode-btn').forEach(btn => btn.classList.remove('active'));
        
        // Add active class to clicked button
        clickedBtn.classList.add('active');
        
        // Update mode and time
        this.currentMode = clickedBtn.dataset.mode;
        this.originalTime = parseInt(clickedBtn.dataset.time);
        this.currentTime = this.originalTime;
        
        // Update labels
        this.updateLabels();
        this.updateDisplay();
        
        // Reset timer if running
        if (this.isRunning) {
            this.resetTimer();
        }
    }

    updateLabels() {
        const labels = {
            'focus': 'Focus Time',
            'short-break': 'Short Break',
            'long-break': 'Long Break'
        };
        
        if (this.timerLabel) {
            this.timerLabel.textContent = labels[this.currentMode] || 'Focus Time';
        }
    }

    updateDisplay() {
        const minutes = Math.floor(this.currentTime / 60);
        const seconds = this.currentTime % 60;
        
        if (this.timerDisplay) {
            this.timerDisplay.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        }
        
        // Update progress circle
        this.updateProgress();
        
        // Update session display
        if (this.sessionDisplay) {
            this.sessionDisplay.textContent = `Session ${this.sessionCount + 1}/${this.totalSessions}`;
        }
    }

    updateProgress() {
        if (!this.progressCircle) return;
        
        const progress = (this.originalTime - this.currentTime) / this.originalTime;
        const offset = this.circumference - (progress * this.circumference);
        
        this.progressCircle.style.strokeDashoffset = offset;
    }

    completeSession() {
        this.stopTimer();
        
        // Play notification sound
        this.playNotification();
        
        // Show notification
        this.showNotification();
        
        // Update session count
        if (this.currentMode === 'focus') {
            this.sessionCount++;
            this.saveStats();
        }
        
        // Auto-switch to next mode
        this.autoSwitchMode();
        
        // Reset timer
        this.resetTimer();
    }

    autoSwitchMode() {
        if (this.currentMode === 'focus') {
            // After focus session, switch to break
            if (this.sessionCount % 4 === 0) {
                // Long break after 4 focus sessions
                this.switchToMode('long-break');
            } else {
                // Short break
                this.switchToMode('short-break');
            }
        } else {
            // After break, switch back to focus
            this.switchToMode('focus');
        }
    }

    switchToMode(mode) {
        const modeBtn = document.querySelector(`[data-mode="${mode}"]`);
        if (modeBtn) {
            this.switchMode(modeBtn);
        }
    }

    playNotification() {
        // Create audio context for notification sound
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
            oscillator.frequency.setValueAtTime(600, audioContext.currentTime + 0.1);
            
            gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
            
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.5);
        } catch (error) {
            console.log('Audio notification not supported');
        }
    }

    showNotification() {
        const messages = {
            'focus': 'Focus session completed! Time for a break.',
            'short-break': 'Short break completed! Ready to focus?',
            'long-break': 'Long break completed! Great work!'
        };
        
        const message = messages[this.currentMode] || 'Session completed!';
        
        // Create notification element
        const notification = document.createElement('div');
        notification.className = 'pomodoro-notification';
        notification.innerHTML = `
            <div class="notification-content">
                <div class="notification-icon">🎯</div>
                <div class="notification-text">${message}</div>
            </div>
        `;
        notification.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: var(--primary-gradient);
            color: white;
            padding: 20px 30px;
            border-radius: 12px;
            box-shadow: 0 8px 32px rgba(76, 175, 80, 0.3);
            z-index: 10000;
            animation: pomodoroNotification 0.5s ease-out;
        `;
        
        document.body.appendChild(notification);
        
        // Remove after 3 seconds
        setTimeout(() => {
            notification.style.animation = 'pomodoroNotificationOut 0.3s ease-in';
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, 3000);
    }

    loadSettings() {
        const defaultSettings = {
            focusTime: 1500, // 25 minutes
            shortBreakTime: 300, // 5 minutes
            longBreakTime: 900, // 15 minutes
            autoStartBreaks: false,
            autoStartPomodoros: false,
            soundEnabled: true,
            notificationsEnabled: true
        };
        
        const stored = localStorage.getItem('pomodoro-settings');
        return stored ? { ...defaultSettings, ...JSON.parse(stored) } : defaultSettings;
    }

    saveSettings() {
        localStorage.setItem('pomodoro-settings', JSON.stringify(this.settings));
    }

    loadStats() {
        const stats = JSON.parse(localStorage.getItem('pomodoro-stats') || '{}');
        const today = new Date().toISOString().split('T')[0];
        
        if (!stats[today]) {
            stats[today] = {
                focusTime: 0,
                sessions: 0,
                date: today
            };
        }
        
        this.updateStatsDisplay(stats[today]);
    }

    saveStats() {
        const stats = JSON.parse(localStorage.getItem('pomodoro-stats') || '{}');
        const today = new Date().toISOString().split('T')[0];
        
        if (!stats[today]) {
            stats[today] = {
                focusTime: 0,
                sessions: 0,
                date: today
            };
        }
        
        if (this.currentMode === 'focus') {
            stats[today].focusTime += this.originalTime;
            stats[today].sessions += 1;
        }
        
        localStorage.setItem('pomodoro-stats', JSON.stringify(stats));
        this.updateStatsDisplay(stats[today]);
    }

    updateStatsDisplay(todayStats) {
        // Update today's focus time
        const focusElement = document.getElementById('today-focus');
        if (focusElement) {
            const hours = Math.floor(todayStats.focusTime / 3600);
            const minutes = Math.floor((todayStats.focusTime % 3600) / 60);
            focusElement.textContent = `${hours}h ${minutes}m`;
        }
        
        // Update sessions count
        const sessionsElement = document.getElementById('today-sessions');
        if (sessionsElement) {
            sessionsElement.textContent = todayStats.sessions;
        }
        
        // Update best streak (simplified)
        const streakElement = document.getElementById('best-streak');
        if (streakElement) {
            const allStats = Object.values(JSON.parse(localStorage.getItem('pomodoro-stats') || '{}'));
            const maxSessions = Math.max(...allStats.map(stat => stat.sessions), 0);
            streakElement.textContent = maxSessions;
        }
    }

    showSettings() {
        // Create settings modal
        const settings = prompt(`
Pomodoro Settings:
1. Focus Time (minutes): ${this.settings.focusTime / 60}
2. Short Break (minutes): ${this.settings.shortBreakTime / 60}
3. Long Break (minutes): ${this.settings.longBreakTime / 60}
4. Auto-start breaks: ${this.settings.autoStartBreaks}
5. Auto-start pomodoros: ${this.settings.autoStartPomodoros}
6. Sound enabled: ${this.settings.soundEnabled}
7. Notifications enabled: ${this.settings.notificationsEnabled}

Enter new values (comma-separated) or press Cancel to keep current settings:
        `);
        
        if (settings) {
            const values = settings.split(',').map(v => v.trim());
            if (values.length >= 7) {
                this.settings.focusTime = parseInt(values[0]) * 60;
                this.settings.shortBreakTime = parseInt(values[1]) * 60;
                this.settings.longBreakTime = parseInt(values[2]) * 60;
                this.settings.autoStartBreaks = values[3] === 'true';
                this.settings.autoStartPomodoros = values[4] === 'true';
                this.settings.soundEnabled = values[5] === 'true';
                this.settings.notificationsEnabled = values[6] === 'true';
                
                this.saveSettings();
                this.showNotification('Settings updated successfully!');
            }
        }
    }

    showStats() {
        const stats = JSON.parse(localStorage.getItem('pomodoro-stats') || '{}');
        const totalFocusTime = Object.values(stats).reduce((sum, day) => sum + day.focusTime, 0);
        const totalSessions = Object.values(stats).reduce((sum, day) => sum + day.sessions, 0);
        const totalDays = Object.keys(stats).length;
        
        const message = `
Pomodoro Statistics:
Total Focus Time: ${Math.floor(totalFocusTime / 3600)}h ${Math.floor((totalFocusTime % 3600) / 60)}m
Total Sessions: ${totalSessions}
Total Days: ${totalDays}
Average Sessions/Day: ${totalDays > 0 ? (totalSessions / totalDays).toFixed(1) : 0}
        `;
        
        alert(message);
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.pomodoroTimer = new PomodoroTimer();
});

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PomodoroTimer;
}
