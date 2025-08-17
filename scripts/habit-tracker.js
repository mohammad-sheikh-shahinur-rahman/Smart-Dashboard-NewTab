/**
 * Habit Tracker Widget
 * Handles habit tracking with calendar view and statistics
 */

class HabitTracker {
    constructor() {
        this.habits = this.loadHabits();
        this.currentWeek = this.getCurrentWeek();
        this.selectedWeek = this.currentWeek;
        
        this.initializeTracker();
        this.bindEvents();
        this.renderHabits();
        this.renderCalendar();
        this.updateStats();
        console.log('Habit Tracker initialized successfully');
    }

    initializeTracker() {
        this.habitList = document.getElementById('habit-list');
        this.calendarGrid = document.getElementById('calendar-grid');
        this.weekLabel = document.getElementById('week-label');
        
        // Stats elements
        this.totalHabitsElement = document.getElementById('total-habits');
        this.completedTodayElement = document.getElementById('completed-today');
        this.completionRateElement = document.getElementById('completion-rate');

        // Create fallback elements if not found
        if (!this.habitList) {
            this.createFallbackElements();
        }
    }

    createFallbackElements() {
        const habitWidget = document.querySelector('.habit-tracker-widget');
        if (habitWidget) {
            const widgetContent = habitWidget.querySelector('.widget-content');
            if (widgetContent) {
                // Create habit list
                this.habitList = document.createElement('div');
                this.habitList.id = 'habit-list';
                this.habitList.className = 'habit-list';
                widgetContent.appendChild(this.habitList);

                // Create calendar grid
                this.calendarGrid = document.createElement('div');
                this.calendarGrid.id = 'calendar-grid';
                this.calendarGrid.className = 'calendar-grid';
                widgetContent.appendChild(this.calendarGrid);

                // Create week label
                this.weekLabel = document.createElement('div');
                this.weekLabel.id = 'week-label';
                this.weekLabel.className = 'week-label';
                widgetContent.appendChild(this.weekLabel);

                // Create stats elements
                this.totalHabitsElement = document.createElement('div');
                this.totalHabitsElement.id = 'total-habits';
                this.totalHabitsElement.className = 'total-habits';
                widgetContent.appendChild(this.totalHabitsElement);

                this.completedTodayElement = document.createElement('div');
                this.completedTodayElement.id = 'completed-today';
                this.completedTodayElement.className = 'completed-today';
                widgetContent.appendChild(this.completedTodayElement);

                this.completionRateElement = document.createElement('div');
                this.completionRateElement.id = 'completion-rate';
                this.completionRateElement.className = 'completion-rate';
                widgetContent.appendChild(this.completionRateElement);
            }
        }
    }

    bindEvents() {
        // Add habit button
        document.getElementById('habit-add-btn')?.addEventListener('click', () => this.addHabit());
        
        // Calendar navigation
        document.getElementById('prev-week')?.addEventListener('click', () => this.previousWeek());
        document.getElementById('next-week')?.addEventListener('click', () => this.nextWeek());
        
        // Calendar and stats buttons
        document.getElementById('habit-calendar-btn')?.addEventListener('click', () => this.toggleCalendarView());
        document.getElementById('habit-stats-btn')?.addEventListener('click', () => this.showStats());
    }

    loadHabits() {
        const defaultHabits = [
            {
                id: 1,
                name: 'Morning Exercise',
                icon: '💪',
                color: '#4CAF50',
                frequency: 'daily',
                streak: 0,
                completed: false,
                createdAt: new Date().toISOString()
            },
            {
                id: 2,
                name: 'Read 30 minutes',
                icon: '📚',
                color: '#2196F3',
                frequency: 'daily',
                streak: 0,
                completed: false,
                createdAt: new Date().toISOString()
            },
            {
                id: 3,
                name: 'Drink 8 glasses of water',
                icon: '💧',
                color: '#00BCD4',
                frequency: 'daily',
                streak: 0,
                completed: false,
                createdAt: new Date().toISOString()
            },
            {
                id: 4,
                name: 'Meditate',
                icon: '🧘',
                color: '#9C27B0',
                frequency: 'daily',
                streak: 0,
                completed: false,
                createdAt: new Date().toISOString()
            }
        ];
        
        const stored = localStorage.getItem('habits');
        return stored ? JSON.parse(stored) : defaultHabits;
    }

    saveHabits() {
        localStorage.setItem('habits', JSON.stringify(this.habits));
    }

    addHabit() {
        this.showAddHabitModal();
    }

    showAddHabitModal() {
        const modal = document.createElement('div');
        modal.className = 'habit-modal';
        modal.innerHTML = `
            <div class="habit-modal-content">
                <div class="modal-header">
                    <h3>Add New Habit</h3>
                    <button class="close-btn" data-action="close-modal">
                        <span class="material-symbols-outlined">close</span>
                    </button>
                </div>
                <div class="modal-body">
                    <div class="form-group">
                        <label>Habit Name *</label>
                        <input type="text" id="new-habit-name" placeholder="e.g., Morning Exercise, Read 30 minutes">
                    </div>
                    <div class="form-group">
                        <label>Icon (Emoji) *</label>
                        <div class="emoji-picker">
                            <input type="text" id="new-habit-icon" value="✨" placeholder="Choose emoji">
                            <div class="emoji-suggestions">
                                <button class="emoji-btn" data-emoji="💪">💪</button>
                                <button class="emoji-btn" data-emoji="📚">📚</button>
                                <button class="emoji-btn" data-emoji="💧">💧</button>
                                <button class="emoji-btn" data-emoji="🧘">🧘</button>
                                <button class="emoji-btn" data-emoji="🏃">🏃</button>
                                <button class="emoji-btn" data-emoji="☕">☕</button>
                                <button class="emoji-btn" data-emoji="🌅">🌅</button>
                                <button class="emoji-btn" data-emoji="📝">📝</button>
                                <button class="emoji-btn" data-emoji="🎯">🎯</button>
                                <button class="emoji-btn" data-emoji="🔒">🔒</button>
                                <button class="emoji-btn" data-emoji="✨">✨</button>
                            </div>
                        </div>
                    </div>
                    <div class="form-group">
                        <label>Color</label>
                        <div class="color-picker">
                            <input type="color" id="new-habit-color" value="#4CAF50">
                            <div class="color-presets">
                                <button class="color-btn" data-color="#4CAF50" style="background: #4CAF50;"></button>
                                <button class="color-btn" data-color="#2196F3" style="background: #2196F3;"></button>
                                <button class="color-btn" data-color="#FF9800" style="background: #FF9800;"></button>
                                <button class="color-btn" data-color="#9C27B0" style="background: #9C27B0;"></button>
                                <button class="color-btn" data-color="#F44336" style="background: #F44336;"></button>
                                <button class="color-btn" data-color="#00BCD4" style="background: #00BCD4;"></button>
                            </div>
                        </div>
                    </div>
                    <div class="form-group">
                        <label>Frequency</label>
                        <select id="new-habit-frequency">
                            <option value="daily" selected>Daily</option>
                            <option value="weekly">Weekly</option>
                            <option value="monthly">Monthly</option>
                        </select>
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn-secondary" data-action="close-modal">Cancel</button>
                    <button class="btn-primary" data-action="save-new-habit">Add Habit</button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        // Add event listeners for emoji and color pickers
        this.setupAddModalListeners();
        
        // Add event listeners for modal actions
        this.setupModalEventListeners(modal);
    }

    setupAddModalListeners() {
        // Emoji picker
        document.querySelectorAll('.emoji-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const emoji = btn.dataset.emoji;
                document.getElementById('new-habit-icon').value = emoji;
            });
        });

        // Color picker
        document.querySelectorAll('.color-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const color = btn.dataset.color;
                document.getElementById('new-habit-color').value = color;
            });
        });
    }

    setupModalEventListeners(modal) {
        // Close modal buttons
        modal.querySelectorAll('[data-action="close-modal"]').forEach(btn => {
            btn.addEventListener('click', () => {
                modal.remove();
            });
        });

        // Save new habit
        modal.querySelector('[data-action="save-new-habit"]')?.addEventListener('click', () => {
            this.saveNewHabit();
        });

        // Save edit habit
        modal.querySelector('[data-action="save-edit-habit"]')?.addEventListener('click', () => {
            const habitId = parseInt(modal.dataset.habitId);
            this.saveHabitEdit(habitId);
        });

        // Confirm delete habit
        modal.querySelector('[data-action="confirm-delete-habit"]')?.addEventListener('click', () => {
            const habitId = parseInt(modal.dataset.habitId);
            this.confirmDeleteHabit(habitId);
        });
    }

    setupHabitActionListeners() {
        // Toggle habit
        document.querySelectorAll('[data-action="toggle-habit"]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const habitId = parseInt(e.target.closest('[data-habit-id]').dataset.habitId);
                this.toggleHabit(habitId);
            });
        });

        // Edit habit
        document.querySelectorAll('[data-action="edit-habit"]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const habitId = parseInt(e.target.closest('[data-habit-id]').dataset.habitId);
                this.editHabit(habitId);
            });
        });

        // Delete habit
        document.querySelectorAll('[data-action="delete-habit"]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const habitId = parseInt(e.target.closest('[data-habit-id]').dataset.habitId);
                this.deleteHabit(habitId);
            });
        });
    }

    saveNewHabit() {
        const name = document.getElementById('new-habit-name').value.trim();
        const icon = document.getElementById('new-habit-icon').value.trim();
        const color = document.getElementById('new-habit-color').value;
        const frequency = document.getElementById('new-habit-frequency').value;

        if (!name || !icon) {
            this.showNotification('Please fill in all required fields', 'error');
            return;
        }

        const newHabit = {
            id: Date.now(),
            name: name,
            icon: icon,
            color: color,
            frequency: frequency,
            streak: 0,
            completed: false,
            createdAt: new Date().toISOString()
        };
        
        this.habits.push(newHabit);
        this.saveHabits();
        this.renderHabits();
        this.renderCalendar();
        this.updateStats();
        
        // Close modal
        document.querySelector('.habit-modal').remove();
        this.showNotification('New habit added successfully!', 'success');
    }

    toggleHabit(habitId) {
        const habit = this.habits.find(h => h.id === habitId);
        if (!habit) return;
        
        const today = new Date().toISOString().split('T')[0];
        const habitData = this.getHabitData(habitId);
        
        if (habitData[today]) {
            // Mark as incomplete
            delete habitData[today];
            habit.completed = false;
            habit.streak = Math.max(0, habit.streak - 1);
        } else {
            // Mark as complete
            habitData[today] = true;
            habit.completed = true;
            habit.streak++;
        }
        
        this.saveHabitData(habitId, habitData);
        this.saveHabits();
        this.renderHabits();
        this.renderCalendar();
        this.updateStats();
    }

    getHabitData(habitId) {
        const stored = localStorage.getItem(`habit-data-${habitId}`);
        return stored ? JSON.parse(stored) : {};
    }

    saveHabitData(habitId, data) {
        localStorage.setItem(`habit-data-${habitId}`, JSON.stringify(data));
    }

    renderHabits() {
        if (!this.habitList) return;
        
        this.habitList.innerHTML = this.habits.map(habit => {
            const today = new Date().toISOString().split('T')[0];
            const habitData = this.getHabitData(habit.id);
            const isCompletedToday = habitData[today] || false;
            
            return `
                <div class="habit-item ${isCompletedToday ? 'completed' : ''}" data-habit-id="${habit.id}">
                    <div class="habit-info">
                        <div class="habit-icon" style="color: ${habit.color}">${habit.icon}</div>
                        <div class="habit-details">
                            <div class="habit-name">${habit.name}</div>
                            <div class="habit-streak">${habit.streak} day streak</div>
                        </div>
                    </div>
                    <div class="habit-actions">
                        <button class="habit-toggle-btn ${isCompletedToday ? 'completed' : ''}" data-action="toggle-habit" data-habit-id="${habit.id}">
                            <span class="material-symbols-outlined">${isCompletedToday ? 'check_circle' : 'radio_button_unchecked'}</span>
                        </button>
                        <button class="habit-edit-btn" data-action="edit-habit" data-habit-id="${habit.id}">
                            <span class="material-symbols-outlined">edit</span>
                        </button>
                        <button class="habit-delete-btn" data-action="delete-habit" data-habit-id="${habit.id}">
                            <span class="material-symbols-outlined">delete</span>
                        </button>
                    </div>
                </div>
            `;
        }).join('');
        
        // Add event listeners for habit actions
        this.setupHabitActionListeners();
    }

    editHabit(habitId) {
        const habit = this.habits.find(h => h.id === habitId);
        if (!habit) return;
        
        this.showEditHabitModal(habit);
    }

    showEditHabitModal(habit) {
        const modal = document.createElement('div');
        modal.className = 'habit-modal';
        modal.dataset.habitId = habit.id;
        modal.innerHTML = `
            <div class="habit-modal-content">
                <div class="modal-header">
                    <h3>Edit Habit</h3>
                    <button class="close-btn" data-action="close-modal">
                        <span class="material-symbols-outlined">close</span>
                    </button>
                </div>
                <div class="modal-body">
                    <div class="form-group">
                        <label>Habit Name</label>
                        <input type="text" id="edit-habit-name" value="${habit.name}" placeholder="Enter habit name">
                    </div>
                    <div class="form-group">
                        <label>Icon (Emoji)</label>
                        <div class="emoji-picker">
                            <input type="text" id="edit-habit-icon" value="${habit.icon}" placeholder="Choose emoji">
                            <div class="emoji-suggestions">
                                <button class="emoji-btn" data-emoji="💪">💪</button>
                                <button class="emoji-btn" data-emoji="📚">📚</button>
                                <button class="emoji-btn" data-emoji="💧">💧</button>
                                <button class="emoji-btn" data-emoji="🧘">🧘</button>
                                <button class="emoji-btn" data-emoji="🏃">🏃</button>
                                <button class="emoji-btn" data-emoji="☕">☕</button>
                                <button class="emoji-btn" data-emoji="🌅">🌅</button>
                                <button class="emoji-btn" data-emoji="📝">📝</button>
                                <button class="emoji-btn" data-emoji="🎯">🎯</button>
                                <button class="emoji-btn" data-emoji="🔒">🔒</button>
                            </div>
                        </div>
                    </div>
                    <div class="form-group">
                        <label>Color</label>
                        <div class="color-picker">
                            <input type="color" id="edit-habit-color" value="${habit.color}">
                            <div class="color-presets">
                                <button class="color-btn" data-color="#4CAF50" style="background: #4CAF50;"></button>
                                <button class="color-btn" data-color="#2196F3" style="background: #2196F3;"></button>
                                <button class="color-btn" data-color="#FF9800" style="background: #FF9800;"></button>
                                <button class="color-btn" data-color="#9C27B0" style="background: #9C27B0;"></button>
                                <button class="color-btn" data-color="#F44336" style="background: #F44336;"></button>
                                <button class="color-btn" data-color="#00BCD4" style="background: #00BCD4;"></button>
                            </div>
                        </div>
                    </div>
                    <div class="form-group">
                        <label>Frequency</label>
                        <select id="edit-habit-frequency">
                            <option value="daily" ${habit.frequency === 'daily' ? 'selected' : ''}>Daily</option>
                            <option value="weekly" ${habit.frequency === 'weekly' ? 'selected' : ''}>Weekly</option>
                            <option value="monthly" ${habit.frequency === 'monthly' ? 'selected' : ''}>Monthly</option>
                        </select>
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn-secondary" data-action="close-modal">Cancel</button>
                    <button class="btn-primary" data-action="save-edit-habit">Save Changes</button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        // Add event listeners for emoji and color pickers
        this.setupEditModalListeners();
        
        // Add event listeners for modal actions
        this.setupModalEventListeners(modal);
    }

    setupEditModalListeners() {
        // Emoji picker
        document.querySelectorAll('.emoji-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const emoji = btn.dataset.emoji;
                document.getElementById('edit-habit-icon').value = emoji;
            });
        });

        // Color picker
        document.querySelectorAll('.color-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const color = btn.dataset.color;
                document.getElementById('edit-habit-color').value = color;
            });
        });
    }

    saveHabitEdit(habitId) {
        const habit = this.habits.find(h => h.id === habitId);
        if (!habit) return;

        const name = document.getElementById('edit-habit-name').value.trim();
        const icon = document.getElementById('edit-habit-icon').value.trim();
        const color = document.getElementById('edit-habit-color').value;
        const frequency = document.getElementById('edit-habit-frequency').value;

        if (!name || !icon) {
            this.showNotification('Please fill in all required fields', 'error');
            return;
        }

        habit.name = name;
        habit.icon = icon;
        habit.color = color;
        habit.frequency = frequency;

        this.saveHabits();
        this.renderHabits();
        this.renderCalendar();

        // Close modal
        document.querySelector('.habit-modal').remove();
        this.showNotification('Habit updated successfully!', 'success');
    }

    deleteHabit(habitId) {
        const habit = this.habits.find(h => h.id === habitId);
        if (!habit) return;
        
        this.showDeleteHabitModal(habit);
    }

    showDeleteHabitModal(habit) {
        const modal = document.createElement('div');
        modal.className = 'habit-modal';
        modal.dataset.habitId = habit.id;
        modal.innerHTML = `
            <div class="habit-modal-content delete-modal">
                <div class="modal-header">
                    <h3>Delete Habit</h3>
                    <button class="close-btn" data-action="close-modal">
                        <span class="material-symbols-outlined">close</span>
                    </button>
                </div>
                <div class="modal-body">
                    <div class="delete-warning">
                        <div class="warning-icon">⚠️</div>
                        <h4>Are you sure you want to delete this habit?</h4>
                        <div class="habit-preview">
                            <div class="habit-icon" style="color: ${habit.color}">${habit.icon}</div>
                            <div class="habit-info">
                                <div class="habit-name">${habit.name}</div>
                                <div class="habit-streak">${habit.streak} day streak</div>
                            </div>
                        </div>
                        <p>This action cannot be undone. All progress data for this habit will be permanently deleted.</p>
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn-secondary" data-action="close-modal">Cancel</button>
                    <button class="btn-danger" data-action="confirm-delete-habit">Delete Habit</button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
        
        // Add event listeners for modal actions
        this.setupModalEventListeners(modal);
    }

    confirmDeleteHabit(habitId) {
        this.habits = this.habits.filter(h => h.id !== habitId);
        localStorage.removeItem(`habit-data-${habitId}`);
        
        this.saveHabits();
        this.renderHabits();
        this.renderCalendar();
        this.updateStats();
        
        // Close modal
        document.querySelector('.habit-modal').remove();
        this.showNotification('Habit deleted successfully!', 'success');
    }

    getCurrentWeek() {
        const now = new Date();
        const startOfWeek = new Date(now);
        startOfWeek.setDate(now.getDate() - now.getDay());
        return startOfWeek.toISOString().split('T')[0];
    }

    previousWeek() {
        const currentDate = new Date(this.selectedWeek);
        currentDate.setDate(currentDate.getDate() - 7);
        this.selectedWeek = currentDate.toISOString().split('T')[0];
        this.renderCalendar();
    }

    nextWeek() {
        const currentDate = new Date(this.selectedWeek);
        currentDate.setDate(currentDate.getDate() + 7);
        this.selectedWeek = currentDate.toISOString().split('T')[0];
        this.renderCalendar();
    }

    renderCalendar() {
        if (!this.calendarGrid || !this.weekLabel) return;
        
        const weekStart = new Date(this.selectedWeek);
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 6);
        
        // Update week label
        const isCurrentWeek = this.selectedWeek === this.currentWeek;
        this.weekLabel.textContent = isCurrentWeek ? 'This Week' : 
            `${weekStart.toLocaleDateString()} - ${weekEnd.toLocaleDateString()}`;
        
        // Generate calendar grid
        const days = [];
        for (let i = 0; i < 7; i++) {
            const date = new Date(weekStart);
            date.setDate(weekStart.getDate() + i);
            days.push(date.toISOString().split('T')[0]);
        }
        
        const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        
        this.calendarGrid.innerHTML = `
            <div class="calendar-header-row">
                ${dayNames.map(day => `<div class="calendar-day-header">${day}</div>`).join('')}
            </div>
            <div class="calendar-days-row">
                ${days.map(day => {
                    const dayNumber = new Date(day).getDate();
                    const isToday = day === new Date().toISOString().split('T')[0];
                    const isSelectedWeek = this.selectedWeek === this.currentWeek;
                    
                    return `<div class="calendar-day ${isToday ? 'today' : ''} ${isSelectedWeek ? 'current-week' : ''}">
                        <div class="day-number">${dayNumber}</div>
                        <div class="day-habits">
                            ${this.habits.map(habit => {
                                const habitData = this.getHabitData(habit.id);
                                const isCompleted = habitData[day] || false;
                                
                                return `<div class="day-habit ${isCompleted ? 'completed' : ''}" 
                                    style="color: ${habit.color}" 
                                    title="${habit.name}">
                                    ${habit.icon}
                                </div>`;
                            }).join('')}
                        </div>
                    </div>`;
                }).join('')}
            </div>
        `;
    }

    updateStats() {
        const today = new Date().toISOString().split('T')[0];
        let completedToday = 0;
        
        this.habits.forEach(habit => {
            const habitData = this.getHabitData(habit.id);
            if (habitData[today]) {
                completedToday++;
            }
        });
        
        const totalHabits = this.habits.length;
        const completionRate = totalHabits > 0 ? Math.round((completedToday / totalHabits) * 100) : 0;
        
        if (this.totalHabitsElement) {
            this.totalHabitsElement.textContent = totalHabits;
        }
        
        if (this.completedTodayElement) {
            this.completedTodayElement.textContent = completedToday;
        }
        
        if (this.completionRateElement) {
            this.completionRateElement.textContent = `${completionRate}%`;
        }
    }

    toggleCalendarView() {
        const calendar = document.querySelector('.habit-calendar');
        if (calendar) {
            calendar.style.display = calendar.style.display === 'none' ? 'block' : 'none';
        }
    }

    showStats() {
        const stats = this.calculateStats();
        
        const message = `
Habit Tracker Statistics:
Total Habits: ${stats.totalHabits}
Average Completion Rate: ${stats.avgCompletionRate}%
Longest Streak: ${stats.longestStreak} days
Most Consistent Habit: ${stats.mostConsistentHabit}
Total Days Tracked: ${stats.totalDays}
        `;
        
        alert(message);
    }

    calculateStats() {
        const today = new Date().toISOString().split('T')[0];
        let totalCompleted = 0;
        let longestStreak = 0;
        let mostConsistentHabit = 'None';
        let mostConsistentCount = 0;
        
        this.habits.forEach(habit => {
            const habitData = this.getHabitData(habit.id);
            const completedDays = Object.keys(habitData).length;
            totalCompleted += completedDays;
            
            if (habit.streak > longestStreak) {
                longestStreak = habit.streak;
            }
            
            if (completedDays > mostConsistentCount) {
                mostConsistentCount = completedDays;
                mostConsistentHabit = habit.name;
            }
        });
        
        const totalDays = this.habits.length * 30; // Assuming 30 days of tracking
        const avgCompletionRate = totalDays > 0 ? Math.round((totalCompleted / totalDays) * 100) : 0;
        
        return {
            totalHabits: this.habits.length,
            avgCompletionRate,
            longestStreak,
            mostConsistentHabit,
            totalDays: 30
        };
    }

    showNotification(message) {
        const notification = document.createElement('div');
        notification.className = 'habit-notification';
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: var(--primary-gradient);
            color: white;
            padding: 12px 20px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(76, 175, 80, 0.3);
            z-index: 10001;
            transform: translateX(100%);
            transition: transform 0.3s ease;
        `;
        
        document.body.appendChild(notification);
        
        // Animate in
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 100);
        
        // Remove after 3 seconds
        setTimeout(() => {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, 3000);
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.habitTracker = new HabitTracker();
});

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = HabitTracker;
}
