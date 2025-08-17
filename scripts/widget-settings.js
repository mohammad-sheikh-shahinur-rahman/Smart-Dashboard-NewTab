/**
 * Widget Settings Manager
 * Handles popup settings for Todo and Quick Notes widgets
 * and Advanced Progress Tracker functionality
 */

class WidgetSettingsManager {
    constructor() {
        this.initializeSettings();
        this.bindEvents();
        this.loadSettings();
    }

    initializeSettings() {
        // Initialize popup elements
        this.todoSettingsPopup = document.getElementById('todo-settings-popup');
        this.notesSettingsPopup = document.getElementById('notes-settings-popup');
        
        // Initialize progress tracker elements
        this.progressTracker = {
            productivityScore: document.getElementById('productivity-score'),
            tasksCompleted: document.getElementById('tasks-completed-progress'),
            timeSpent: document.getElementById('time-spent'),
            streakDays: document.getElementById('streak-days-progress'),
            goalsGrid: document.getElementById('goals-grid'),
            habitsGrid: document.getElementById('habits-grid'),
            progressNotes: document.getElementById('progress-notes')
        };

        // Default settings
        this.defaultSettings = {
            todo: {
                autoSave: true,
                showCompleted: true,
                reminders: true,
                defaultPriority: 'medium',
                defaultDueDate: 'tomorrow',
                categories: ['Work', 'Personal', 'Shopping', 'Health'],
                sortOrder: 'date-desc',
                itemsPerPage: 10
            },
            notes: {
                autoSave: true,
                autoSaveInterval: 3000,
                richEditor: true,
                wordCount: true,
                charCount: false,
                spellCheck: true,
                autoTagging: false,
                categories: ['Work', 'Personal', 'Ideas', 'Important', 'Meeting'],
                fontSize: 14,
                lineHeight: 1.5,
                timestamps: true
            },
            progress: {
                goals: [
                    { id: 1, title: 'Complete 5 tasks', target: 5, current: 0, icon: '✅' },
                    { id: 2, title: 'Read 30 minutes', target: 30, current: 0, icon: '📚' },
                    { id: 3, title: 'Exercise', target: 1, current: 0, icon: '💪' },
                    { id: 4, title: 'Meditate', target: 1, current: 0, icon: '🧘' }
                ],
                habits: [
                    { id: 1, title: 'Morning Routine', icon: '🌅', streak: 0, completed: false },
                    { id: 2, title: 'Drink Water', icon: '💧', streak: 0, completed: false },
                    { id: 3, title: 'Take Breaks', icon: '☕', streak: 0, completed: false },
                    { id: 4, title: 'Evening Review', icon: '🌙', streak: 0, completed: false }
                ],
                mood: null,
                energy: null,
                notes: '',
                lastUpdated: null
            }
        };
    }

    bindEvents() {
        // Todo settings popup events
        document.getElementById('todo-settings-btn')?.addEventListener('click', () => this.openTodoSettings());
        document.getElementById('close-todo-settings')?.addEventListener('click', () => this.closeTodoSettings());
        document.getElementById('save-todo-settings')?.addEventListener('click', () => this.saveTodoSettings());
        document.getElementById('reset-todo-settings')?.addEventListener('click', () => this.resetTodoSettings());

        // Notes settings popup events
        document.getElementById('notes-settings-btn')?.addEventListener('click', () => this.openNotesSettings());
        document.getElementById('close-notes-settings')?.addEventListener('click', () => this.closeNotesSettings());
        document.getElementById('save-notes-settings')?.addEventListener('click', () => this.saveNotesSettings());
        document.getElementById('reset-notes-settings')?.addEventListener('click', () => this.resetNotesSettings());

                        // Progress tracker events
                this.bindProgressTrackerEvents();
                
                // Progress tabs
                document.querySelectorAll('.progress-tab').forEach(tab => {
                    tab.addEventListener('click', () => this.switchProgressTab(tab));
                });
                
                // Add goal/habit buttons
                document.getElementById('add-goal-btn')?.addEventListener('click', () => this.addNewGoal());
                document.getElementById('add-habit-btn')?.addEventListener('click', () => this.addNewHabit());
                
                // Progress tracker additional buttons
                document.getElementById('progress-calendar-btn')?.addEventListener('click', () => this.showProgressCalendar());
                document.getElementById('progress-export-btn')?.addEventListener('click', () => this.exportProgressData());

        // Close popups on overlay click
        document.querySelectorAll('.popup-overlay').forEach(overlay => {
            overlay.addEventListener('click', (e) => {
                if (e.target === overlay) {
                    this.closeAllPopups();
                }
            });
        });

        // Close popups on escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeAllPopups();
            }
        });
    }

    // Todo Settings Methods
    openTodoSettings() {
        this.todoSettingsPopup.classList.remove('hidden');
        this.todoSettingsPopup.classList.add('show');
        this.loadTodoSettings();
    }

    closeTodoSettings() {
        this.todoSettingsPopup.classList.remove('show');
        this.todoSettingsPopup.classList.add('hidden');
    }

    loadTodoSettings() {
        const settings = this.getSettings('todo');
        
        // Load toggle states
        this.setToggleState('todo-auto-save', settings.autoSave);
        this.setToggleState('todo-show-completed', settings.showCompleted);
        this.setToggleState('todo-reminders', settings.reminders);

        // Load select values
        document.getElementById('todo-default-priority').value = settings.defaultPriority;
        document.getElementById('todo-default-due').value = settings.defaultDueDate;
        document.getElementById('todo-sort-order').value = settings.sortOrder;
        document.getElementById('todo-items-per-page').value = settings.itemsPerPage;

        // Load categories
        this.loadCategories('todo-categories-popup', settings.categories);
    }

    saveTodoSettings() {
        const settings = {
            autoSave: this.getToggleState('todo-auto-save'),
            showCompleted: this.getToggleState('todo-show-completed'),
            reminders: this.getToggleState('todo-reminders'),
            defaultPriority: document.getElementById('todo-default-priority').value,
            defaultDueDate: document.getElementById('todo-default-due').value,
            sortOrder: document.getElementById('todo-sort-order').value,
            itemsPerPage: parseInt(document.getElementById('todo-items-per-page').value),
            categories: this.getCategories('todo-categories-popup')
        };

        this.saveSettings('todo', settings);
        this.closeTodoSettings();
        this.showNotification('Todo settings saved successfully!');
    }

    resetTodoSettings() {
        if (confirm('Are you sure you want to reset all todo settings to default?')) {
            this.saveSettings('todo', this.defaultSettings.todo);
            this.loadTodoSettings();
            this.showNotification('Todo settings reset to default!');
        }
    }

    // Notes Settings Methods
    openNotesSettings() {
        this.notesSettingsPopup.classList.remove('hidden');
        this.notesSettingsPopup.classList.add('show');
        this.loadNotesSettings();
    }

    closeNotesSettings() {
        this.notesSettingsPopup.classList.remove('show');
        this.notesSettingsPopup.classList.add('hidden');
    }

    loadNotesSettings() {
        const settings = this.getSettings('notes');
        
        // Load toggle states
        this.setToggleState('notes-auto-save', settings.autoSave);
        this.setToggleState('notes-rich-editor', settings.richEditor);
        this.setToggleState('notes-word-count', settings.wordCount);
        this.setToggleState('notes-char-count', settings.charCount);
        this.setToggleState('notes-spell-check', settings.spellCheck);
        this.setToggleState('notes-auto-tagging', settings.autoTagging);
        this.setToggleState('notes-timestamps', settings.timestamps);

        // Load select values
        document.getElementById('notes-auto-save-interval').value = settings.autoSaveInterval;
        document.getElementById('notes-font-size').value = settings.fontSize;
        document.getElementById('notes-line-height').value = settings.lineHeight;

        // Load categories
        this.loadCategories('notes-categories-popup', settings.categories);
    }

    saveNotesSettings() {
        const settings = {
            autoSave: this.getToggleState('notes-auto-save'),
            autoSaveInterval: parseInt(document.getElementById('notes-auto-save-interval').value),
            richEditor: this.getToggleState('notes-rich-editor'),
            wordCount: this.getToggleState('notes-word-count'),
            charCount: this.getToggleState('notes-char-count'),
            spellCheck: this.getToggleState('notes-spell-check'),
            autoTagging: this.getToggleState('notes-auto-tagging'),
            fontSize: parseInt(document.getElementById('notes-font-size').value),
            lineHeight: parseFloat(document.getElementById('notes-line-height').value),
            timestamps: this.getToggleState('notes-timestamps'),
            categories: this.getCategories('notes-categories-popup')
        };

        this.saveSettings('notes', settings);
        this.closeNotesSettings();
        this.showNotification('Notes settings saved successfully!');
    }

    resetNotesSettings() {
        if (confirm('Are you sure you want to reset all notes settings to default?')) {
            this.saveSettings('notes', this.defaultSettings.notes);
            this.loadNotesSettings();
            this.showNotification('Notes settings reset to default!');
        }
    }

    // Progress Tracker Methods
    bindProgressTrackerEvents() {
        // Mood buttons
        document.querySelectorAll('.mood-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.mood-btn').forEach(b => b.classList.remove('selected'));
                btn.classList.add('selected');
                this.updateProgressData('mood', btn.dataset.mood);
            });
        });

        // Energy buttons
        document.querySelectorAll('.energy-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.energy-btn').forEach(b => b.classList.remove('selected'));
                btn.classList.add('selected');
                this.updateProgressData('energy', btn.dataset.energy);
            });
        });

        // Progress notes
        this.progressTracker.progressNotes?.addEventListener('input', (e) => {
            this.updateProgressData('notes', e.target.value);
        });

        // Habit cards
        this.progressTracker.habitsGrid?.addEventListener('click', (e) => {
            const habitCard = e.target.closest('.habit-card');
            if (habitCard) {
                this.toggleHabit(habitCard);
            }
        });
    }

                    initializeProgressTracker() {
                    const progressData = this.getSettings('progress');
                    
                    // Update summary cards
                    this.updateProgressSummary(progressData);
                    
                    // Update trends
                    this.updateProgressTrends();
                    
                    // Render goals
                    this.renderGoals(progressData.goals);
                    
                    // Render habits
                    this.renderHabits(progressData.habits);
                    
                    // Set mood and energy
                    if (progressData.mood) {
                        const moodBtn = document.querySelector(`[data-mood="${progressData.mood}"]`);
                        if (moodBtn) {
                            document.querySelectorAll('.mood-btn').forEach(b => b.classList.remove('selected'));
                            moodBtn.classList.add('selected');
                        }
                    }
                    
                    if (progressData.energy) {
                        const energyBtn = document.querySelector(`[data-energy="${progressData.energy}"]`);
                        if (energyBtn) {
                            document.querySelectorAll('.energy-btn').forEach(b => b.classList.remove('selected'));
                            energyBtn.classList.add('selected');
                        }
                    }
                    
                    // Set notes
                    if (this.progressTracker.progressNotes) {
                        this.progressTracker.progressNotes.value = progressData.notes || '';
                    }
                }

    updateProgressSummary(data) {
        // Calculate productivity score based on completed tasks and goals
        const totalTasks = data.goals.reduce((sum, goal) => sum + goal.target, 0);
        const completedTasks = data.goals.reduce((sum, goal) => sum + goal.current, 0);
        const productivityScore = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

        // Update summary cards
        if (this.progressTracker.productivityScore) {
            this.progressTracker.productivityScore.textContent = `${productivityScore}%`;
        }
        
        if (this.progressTracker.tasksCompleted) {
            this.progressTracker.tasksCompleted.textContent = `${completedTasks}/${totalTasks}`;
        }
        
        if (this.progressTracker.timeSpent) {
            // Calculate time spent (placeholder - would integrate with timer)
            this.progressTracker.timeSpent.textContent = '2h';
        }
        
        if (this.progressTracker.streakDays) {
            // Calculate streak (placeholder - would track daily completion)
            this.progressTracker.streakDays.textContent = '5';
        }
    }

    renderGoals(goals) {
        if (!this.progressTracker.goalsGrid) return;

        this.progressTracker.goalsGrid.innerHTML = goals.map(goal => {
            const progress = goal.target > 0 ? (goal.current / goal.target) * 100 : 0;
            return `
                <div class="goal-card" data-goal-id="${goal.id}">
                    <div class="goal-header">
                        <h5 class="goal-title">${goal.icon} ${goal.title}</h5>
                        <span class="goal-percentage">${Math.round(progress)}%</span>
                    </div>
                    <div class="goal-progress">
                        <div class="goal-progress-bar" style="width: ${progress}%"></div>
                    </div>
                    <div class="goal-stats">
                        <span>${goal.current}/${goal.target}</span>
                        <span>${goal.target > 1 ? 'items' : 'item'}</span>
                    </div>
                </div>
            `;
        }).join('');
    }

    renderHabits(habits) {
        if (!this.progressTracker.habitsGrid) return;

        this.progressTracker.habitsGrid.innerHTML = habits.map(habit => {
            const completedClass = habit.completed ? 'completed' : '';
            return `
                <div class="habit-card ${completedClass}" data-habit-id="${habit.id}">
                    <div class="habit-icon">${habit.icon}</div>
                    <div class="habit-title">${habit.title}</div>
                    <div class="habit-streak">${habit.streak} day streak</div>
                </div>
            `;
        }).join('');
    }

    toggleHabit(habitCard) {
        const habitId = parseInt(habitCard.dataset.habitId);
        const progressData = this.getSettings('progress');
        const habit = progressData.habits.find(h => h.id === habitId);
        
        if (habit) {
            habit.completed = !habit.completed;
            if (habit.completed) {
                habit.streak++;
                habitCard.classList.add('completed');
            } else {
                habit.streak = Math.max(0, habit.streak - 1);
                habitCard.classList.remove('completed');
            }
            
            this.saveSettings('progress', progressData);
            this.updateProgressSummary(progressData);
        }
    }

    updateProgressData(key, value) {
        const progressData = this.getSettings('progress');
        progressData[key] = value;
        progressData.lastUpdated = new Date().toISOString();
        this.saveSettings('progress', progressData);
    }

    // Utility Methods
    getSettings(key) {
        const stored = localStorage.getItem(`widget-settings-${key}`);
        return stored ? JSON.parse(stored) : this.defaultSettings[key];
    }

    saveSettings(key, settings) {
        localStorage.setItem(`widget-settings-${key}`, JSON.stringify(settings));
    }

    loadSettings() {
        this.initializeProgressTracker();
    }

    setToggleState(settingId, state) {
        const toggle = document.querySelector(`[data-setting="${settingId}"] .toggle-switch`);
        if (toggle) {
            toggle.classList.toggle('active', state);
        }
    }

    getToggleState(settingId) {
        const toggle = document.querySelector(`[data-setting="${settingId}"] .toggle-switch`);
        return toggle ? toggle.classList.contains('active') : false;
    }

    loadCategories(containerId, categories) {
        const container = document.getElementById(containerId);
        if (!container) return;

        // Remove existing tags except input
        const input = container.querySelector('.tag-input');
        container.innerHTML = '';
        
        categories.forEach(category => {
            const tag = document.createElement('span');
            tag.className = 'tag';
            tag.textContent = category;
            tag.addEventListener('click', () => this.removeCategory(containerId, category));
            container.appendChild(tag);
        });
        
        if (input) {
            container.appendChild(input);
        }
    }

    getCategories(containerId) {
        const container = document.getElementById(containerId);
        if (!container) return [];
        
        return Array.from(container.querySelectorAll('.tag'))
            .map(tag => tag.textContent);
    }

    removeCategory(containerId, category) {
        const progressData = this.getSettings('progress');
        const categories = this.getCategories(containerId).filter(c => c !== category);
        this.loadCategories(containerId, categories);
    }

    closeAllPopups() {
        this.closeTodoSettings();
        this.closeNotesSettings();
    }

                    showNotification(message) {
                    // Create a simple notification
                    const notification = document.createElement('div');
                    notification.className = 'notification';
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

                // Advanced Progress Tracker Methods
                switchProgressTab(clickedTab) {
                    // Remove active class from all tabs and panels
                    document.querySelectorAll('.progress-tab').forEach(tab => tab.classList.remove('active'));
                    document.querySelectorAll('.tab-panel').forEach(panel => panel.classList.remove('active'));
                    
                    // Add active class to clicked tab
                    clickedTab.classList.add('active');
                    
                    // Show corresponding panel
                    const tabName = clickedTab.dataset.tab;
                    const panel = document.getElementById(`${tabName}-panel`);
                    if (panel) {
                        panel.classList.add('active');
                    }
                }

                addNewGoal() {
                    const goalName = prompt('Enter goal name:');
                    if (!goalName) return;
                    
                    const goalTarget = prompt('Enter target (number):');
                    if (!goalTarget || isNaN(goalTarget)) return;
                    
                    const progressData = this.getSettings('progress');
                    const newGoal = {
                        id: Date.now(),
                        title: goalName,
                        target: parseInt(goalTarget),
                        current: 0,
                        icon: '🎯'
                    };
                    
                    progressData.goals.push(newGoal);
                    this.saveSettings('progress', progressData);
                    this.renderGoals(progressData.goals);
                    this.updateProgressSummary(progressData);
                    this.showNotification('New goal added successfully!');
                }

                addNewHabit() {
                    const habitName = prompt('Enter habit name:');
                    if (!habitName) return;
                    
                    const progressData = this.getSettings('progress');
                    const newHabit = {
                        id: Date.now(),
                        title: habitName,
                        icon: '✨',
                        streak: 0,
                        completed: false
                    };
                    
                    progressData.habits.push(newHabit);
                    this.saveSettings('progress', progressData);
                    this.renderHabits(progressData.habits);
                    this.showNotification('New habit added successfully!');
                }

                showProgressCalendar() {
                    // Create calendar view for progress tracking
                    const calendarData = this.getSettings('progress');
                    this.showNotification('Calendar view coming soon!');
                }

                exportProgressData() {
                    const progressData = this.getSettings('progress');
                    const dataStr = JSON.stringify(progressData, null, 2);
                    const dataBlob = new Blob([dataStr], {type: 'application/json'});
                    const url = URL.createObjectURL(dataBlob);
                    
                    const link = document.createElement('a');
                    link.href = url;
                    link.download = `progress-data-${new Date().toISOString().split('T')[0]}.json`;
                    link.click();
                    
                    URL.revokeObjectURL(url);
                    this.showNotification('Progress data exported successfully!');
                }

                updateProgressTrends() {
                    // Update trend indicators
                    const trends = {
                        productivity: '↗️ +5%',
                        tasks: '↗️ +2',
                        time: '↗️ +30m',
                        streak: '🔥 Best!'
                    };
                    
                    Object.keys(trends).forEach(key => {
                        const element = document.getElementById(`${key}-trend`);
                        if (element) {
                            element.textContent = trends[key];
                        }
                    });
                }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.widgetSettingsManager = new WidgetSettingsManager();
});

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = WidgetSettingsManager;
}
