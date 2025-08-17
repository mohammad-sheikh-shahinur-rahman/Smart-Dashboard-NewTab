class Clock {
    constructor() {
        this.isDigital = true; // Default to digital
        this.timeFormat = '12'; // Default to 12-hour format
        this.showSeconds = true; // Default to show seconds
        this.updateInterval = null;
        this.init();
    }

    init() {
        this.loadPreferences();
        this.setupEventListeners();
        this.startClock();
    }

    async loadPreferences() {
        try {
            const result = await chrome.storage.sync.get(['clockDisplay', 'clockTimeFormat', 'clockShowSeconds']);
            this.isDigital = result.clockDisplay !== 'analog';
            this.timeFormat = result.clockTimeFormat || '12';
            this.showSeconds = result.clockShowSeconds !== false;
            
            this.updateDisplay();
            this.updateSettingsUI();
        } catch (error) {
            console.log('Using default clock settings');
        }
    }

    async savePreferences() {
        try {
            await chrome.storage.sync.set({
                clockDisplay: this.isDigital ? 'digital' : 'analog',
                clockTimeFormat: this.timeFormat,
                clockShowSeconds: this.showSeconds
            });
        } catch (error) {
            console.error('Failed to save clock preferences:', error);
        }
    }

    setupEventListeners() {
        // Clock display toggle
        const clockToggleBtn = document.getElementById('clock-toggle-btn');
        if (clockToggleBtn) {
            clockToggleBtn.addEventListener('click', () => {
                this.toggleDisplay();
            });
        }

        // Clock settings from main settings panel
        this.setupSettingsListeners();
    }

    setupSettingsListeners() {
        // Listen for display type changes
        const displayRadios = document.querySelectorAll('input[name="clock-display"]');
        displayRadios.forEach(radio => {
            radio.addEventListener('change', (e) => {
                this.isDigital = e.target.value === 'digital';
                this.updateDisplay();
                this.savePreferences();
                this.updateToggleButton();
            });
        });

        // Listen for time format changes
        const timeFormatRadios = document.querySelectorAll('input[name="clock-time-format"]');
        timeFormatRadios.forEach(radio => {
            radio.addEventListener('change', (e) => {
                this.timeFormat = e.target.value;
                this.savePreferences();
            });
        });

        // Listen for seconds toggle
        const secondsToggle = document.querySelector('[data-setting="clock-seconds"] .toggle-switch');
        if (secondsToggle) {
            secondsToggle.addEventListener('click', () => {
                const toggleGroup = secondsToggle.closest('.toggle-group');
                toggleGroup.classList.toggle('active');
                this.showSeconds = toggleGroup.classList.contains('active');
                this.savePreferences();
            });
        }
    }

    toggleDisplay() {
        this.isDigital = !this.isDigital;
        this.updateDisplay();
        this.savePreferences();
        this.updateToggleButton();
        this.updateSettingsUI();

        // Show notification
        this.showNotification(
            `Switched to ${this.isDigital ? 'digital' : 'analog'} clock`,
            'success'
        );
    }

    updateToggleButton() {
        const toggleBtn = document.getElementById('clock-toggle-btn');
        if (toggleBtn) {
            const icon = toggleBtn.querySelector('.material-symbols-outlined');
            if (icon) {
                icon.textContent = this.isDigital ? 'schedule' : 'schedule_send';
            }
        }
    }

    updateSettingsUI() {
        // Update display type radio buttons
        const displayRadios = document.querySelectorAll('input[name="clock-display"]');
        displayRadios.forEach(radio => {
            radio.checked = radio.value === (this.isDigital ? 'digital' : 'analog');
        });

        // Update time format radio buttons
        const timeFormatRadios = document.querySelectorAll('input[name="clock-time-format"]');
        timeFormatRadios.forEach(radio => {
            radio.checked = radio.value === this.timeFormat;
        });

        // Update seconds toggle
        const secondsToggle = document.querySelector('[data-setting="clock-seconds"] .toggle-switch');
        if (secondsToggle) {
            const toggleGroup = secondsToggle.closest('.toggle-group');
            if (this.showSeconds) {
                toggleGroup.classList.add('active');
            } else {
                toggleGroup.classList.remove('active');
            }
        }
    }

    updateDisplay() {
        const digitalClock = document.getElementById('digital-clock');
        const analogClock = document.getElementById('analog-clock');
        
        if (this.isDigital) {
            if (digitalClock) digitalClock.style.display = 'flex';
            if (analogClock) analogClock.style.display = 'none';
        } else {
            if (digitalClock) digitalClock.style.display = 'none';
            if (analogClock) analogClock.style.display = 'flex';
        }
    }

    startClock() {
        this.updateTime();
        this.updateInterval = setInterval(() => {
            this.updateTime();
        }, 1000);
    }

    updateTime() {
        const now = new Date();
        
        // Update digital clock
        this.updateDigitalClock(now);
        
        // Update analog clock
        this.updateAnalogClock(now);
        
        // Update date and day
        this.updateDate(now);
    }

    updateDigitalClock(date) {
        const timeElement = document.getElementById('digital-time');
        if (timeElement) {
            let hours = date.getHours();
            const minutes = date.getMinutes();
            const seconds = date.getSeconds();
            
            // Handle 12-hour format
            if (this.timeFormat === '12') {
                const ampm = hours >= 12 ? 'PM' : 'AM';
                hours = hours % 12;
                hours = hours ? hours : 12; // Convert 0 to 12
                
                if (this.showSeconds) {
                    timeElement.textContent = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')} ${ampm}`;
                } else {
                    timeElement.textContent = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')} ${ampm}`;
                }
            } else {
                // 24-hour format
                if (this.showSeconds) {
                    timeElement.textContent = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
                } else {
                    timeElement.textContent = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
                }
            }
        }
    }

    updateAnalogClock(date) {
        const hourHand = document.getElementById('hour-hand');
        const minuteHand = document.getElementById('minute-hand');
        const secondHand = document.getElementById('second-hand');
        
        if (hourHand && minuteHand && secondHand) {
            const hours = date.getHours() % 12;
            const minutes = date.getMinutes();
            const seconds = date.getSeconds();
            
            // Calculate angles
            const hourAngle = (hours * 30) + (minutes * 0.5); // 30 degrees per hour + 0.5 degrees per minute
            const minuteAngle = minutes * 6; // 6 degrees per minute
            const secondAngle = seconds * 6; // 6 degrees per second
            
            // Apply rotations
            hourHand.style.transform = `rotate(${hourAngle}deg)`;
            minuteHand.style.transform = `rotate(${minuteAngle}deg)`;
            secondHand.style.transform = `rotate(${secondAngle}deg)`;
        }
    }

    updateDate(date) {
        const dateElement = document.getElementById('clock-date');
        const dayElement = document.getElementById('clock-day');
        
        if (dateElement) {
            const options = { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
            };
            dateElement.textContent = date.toLocaleDateString(undefined, options);
        }
        
        if (dayElement) {
            const options = { weekday: 'long' };
            dayElement.textContent = date.toLocaleDateString(undefined, options);
        }
    }



    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <span class="notification-message">${message}</span>
            <button class="notification-close">
                <span class="material-symbols-outlined">close</span>
            </button>
        `;
        
        document.body.appendChild(notification);
        
        // Auto remove after 3 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 3000);
        
        // Close button
        const closeBtn = notification.querySelector('.notification-close');
        closeBtn.addEventListener('click', () => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        });
    }

    destroy() {
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
        }
    }
}

// Create clock instance when script loads
window.ClockWidget = new Clock();
