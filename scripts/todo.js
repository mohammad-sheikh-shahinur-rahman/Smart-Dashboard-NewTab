/* 
 * Enhanced Todo Widget - Advanced Task Management
 * Features: Categories, Priorities, Due Dates, Time Tracking, Pomodoro Integration
 * Copyright (c) 2024
 * Licensed under the MIT License
 */

class TodoWidget {
    constructor() {
        this.storageKey = 'smartDashboard_todos';
        this.todos = [];
        this.maxTodos = 200;
        this.currentFilter = 'all';
        this.currentSort = 'date-desc';
        
        // DOM elements
        this.todoList = document.getElementById('todo-list');
        this.newTodoInput = document.getElementById('new-todo-input');
        this.addTodoBtn = document.getElementById('add-todo-btn');
        this.todoFilters = document.getElementById('todo-filters');
        this.todoSort = document.getElementById('todo-sort');
        this.todoStats = document.getElementById('todo-stats');
        
        // Productivity tracking
        this.productivityStats = {
            tasksCompletedToday: 0,
            totalTasksCompleted: 0,
            averageCompletionTime: 0,
            longestStreak: 0,
            currentStreak: 0,
            completionRate: 0
        };
        
        // Time tracking
        this.timeTracking = {
            startTime: null,
            endTime: null,
            duration: 0
        };
        
        // Pomodoro integration
        this.pomodoroIntegration = {
            pomodoroEnabled: false,
            workDuration: 25,
            breakDuration: 5,
            currentSession: null
        };
        
        // Goal tracking
        this.goalTracking = {
            dailyGoals: [],
            weeklyGoals: [],
            completedToday: 0
        };
        
        // Habit tracking
        this.habitTracking = {
            dailyHabits: [],
            completedHabits: []
        };
        
        // Analytics
        this.analytics = {
            completionRate: 0,
            overdueTasks: 0,
            averagePriority: 0
        };
        
        // Notifications
        this.notifications = {
            reminderEnabled: true,
            reminderTime: '09:00',
            soundEnabled: true
        };
        
        this.init();
    }

    async init() {
        try {
            await this.loadTodos();
            this.setupEventListeners();
            this.renderTodos();
            this.updateProductivityStats();
            this.startDailyReset();
            console.log('Todo Widget initialized successfully');
        } catch (error) {
            console.error('Failed to initialize Todo Widget:', error);
        }
    }

    setupEventListeners() {
        // Add todo button
        if (this.addTodoBtn) {
            this.addTodoBtn.addEventListener('click', () => {
                console.log('Add todo button clicked');
                this.addTodo();
            });
        }

        // New todo input - click to focus
        if (this.newTodoInput) {
            this.newTodoInput.addEventListener('click', () => {
                this.newTodoInput.focus();
            });
            
            // Enter key to add todo
            this.newTodoInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.addTodo();
                }
            });
        }

        // Filter buttons
        const filterButtons = document.querySelectorAll('.todo-filter-btn');
        filterButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const filter = e.target.dataset.filter;
                this.setFilter(filter);
            });
        });

        // Sort dropdown
        if (this.todoSort) {
            this.todoSort.addEventListener('change', (e) => {
                this.setSort(e.target.value);
            });
        }

        // Clear completed button
        const clearCompletedBtn = document.getElementById('clear-completed-btn');
        if (clearCompletedBtn) {
            clearCompletedBtn.addEventListener('click', () => {
                this.clearCompleted();
            });
        }

        // Export button
        const exportBtn = document.getElementById('export-todos-btn');
        if (exportBtn) {
            exportBtn.addEventListener('click', () => {
                this.exportTodos();
            });
        }

        // Import button
        const importBtn = document.getElementById('import-todos-btn');
        if (importBtn) {
            importBtn.addEventListener('click', () => {
                this.importTodos();
            });
        }

        // Settings button
        const settingsBtn = document.getElementById('todo-settings-btn');
        if (settingsBtn) {
            settingsBtn.addEventListener('click', () => {
                this.showSettings();
            });
        }

        // Enter key in input
        if (this.newTodoInput) {
            this.newTodoInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    console.log('Enter key pressed in todo input');
                    this.addTodo();
                }
            });

            // Click event for better UX
            this.newTodoInput.addEventListener('click', () => {
                this.newTodoInput.focus();
            });
        }

        // Filters
        if (this.todoFilters) {
            this.todoFilters.addEventListener('change', (e) => {
                this.currentFilter = e.target.value;
                this.renderTodos();
            });
        }

        // Sort
        if (this.todoSort) {
            this.todoSort.addEventListener('change', (e) => {
                this.currentSort = e.target.value;
                this.renderTodos();
            });
        }

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            // Ctrl+Shift+T to focus todo input
            if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'T') {
                e.preventDefault();
                if (this.newTodoInput) {
                    this.newTodoInput.focus();
                }
            }
        });
    }

    async loadTodos() {
        try {
            const result = await chrome.storage.sync.get(this.storageKey);
            this.todos = result[this.storageKey] || [];
            
            // Ensure todos have required properties
            this.todos = this.todos.map(todo => ({
                id: todo.id || this.generateId(),
                text: todo.text || '',
                completed: todo.completed || false,
                createdAt: todo.createdAt || new Date().toISOString(),
                completedAt: todo.completedAt || null,
                category: todo.category || 'general',
                priority: todo.priority || 'medium',
                dueDate: todo.dueDate || null,
                notes: todo.notes || '',
                tags: todo.tags || [],
                timeSpent: todo.timeSpent || 0,
                estimatedTime: todo.estimatedTime || null
            }));
            
        } catch (error) {
            console.error('Failed to load todos:', error);
            this.todos = [];
        }
    }

    async saveTodos() {
        try {
            await chrome.storage.sync.set({
                [this.storageKey]: this.todos
            });
        } catch (error) {
            console.error('Failed to save todos:', error);
            this.showError('Failed to save tasks');
        }
    }

    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    async addTodo() {
        console.log('addTodo method called');
        if (!this.newTodoInput) {
            console.error('newTodoInput not found');
            this.showError('Task input not found');
            return;
        }

        const text = this.newTodoInput.value.trim();
        console.log('Todo text:', text);
        
        if (!text) {
            console.log('Empty todo text, returning');
            this.showError('Please enter a task');
            return;
        }

        if (this.todos.length >= this.maxTodos) {
            this.showError(`Maximum ${this.maxTodos} tasks allowed. Please complete some tasks first.`);
            return;
        }

        try {
            const newTodo = {
                id: this.generateId(),
                text,
                completed: false,
                createdAt: new Date().toISOString(),
                completedAt: null,
                category: 'general',
                priority: 'medium',
                dueDate: null,
                notes: '',
                tags: [],
                timeSpent: 0,
                estimatedTime: null
            };

            this.todos.unshift(newTodo);
            await this.saveTodos();
            this.renderTodos();
            this.updateProductivityStats();
            this.showSuccess('Task added successfully!');
            
            // Clear input and focus
            this.newTodoInput.value = '';
            this.newTodoInput.focus();
            console.log('Todo added successfully');
            
        } catch (error) {
            console.error('Error adding todo:', error);
            this.showError('Failed to add task. Please try again.');
        }
    }

    async toggleTodo(todoId) {
        const todo = this.todos.find(t => t.id === todoId);
        if (todo) {
            todo.completed = !todo.completed;
            
            if (todo.completed) {
                todo.completedAt = new Date().toISOString();
                this.productivityStats.tasksCompletedToday++;
                this.productivityStats.totalTasksCompleted++;
                
                // Update streak
                this.updateStreak();
                
                // Check if it's overdue
                if (todo.dueDate && new Date(todo.dueDate) < new Date()) {
                    this.analytics.overdueTasks = Math.max(0, this.analytics.overdueTasks - 1);
                }
            } else {
                todo.completedAt = null;
                this.productivityStats.tasksCompletedToday = Math.max(0, this.productivityStats.tasksCompletedToday - 1);
            }

            await this.saveTodos();
            this.renderTodos();
            this.updateProductivityStats();
            
            const status = todo.completed ? 'completed' : 'uncompleted';
            this.showSuccess(`Task ${status}!`);
        }
    }

    async deleteTodo(todoId) {
        if (confirm('Are you sure you want to delete this task?')) {
            this.todos = this.todos.filter(t => t.id !== todoId);
            await this.saveTodos();
            this.renderTodos();
            this.updateProductivityStats();
            this.showSuccess('Task deleted successfully!');
        }
    }

    async editTodo(todoId) {
        const todo = this.todos.find(t => t.id === todoId);
        if (todo) {
            this.showEditModal(todo);
        }
    }

    showEditModal(todo) {
        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>Edit Task</h3>
                    <button class="modal-close">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="form-group">
                        <label>Task Title</label>
                        <input type="text" id="edit-todo-text" value="${todo.text}" class="form-input">
                    </div>
                    <div class="form-row">
                        <div class="form-group">
                            <label>Category</label>
                            <select id="edit-todo-category" class="form-select">
                                <option value="general" ${todo.category === 'general' ? 'selected' : ''}>General</option>
                                <option value="work" ${todo.category === 'work' ? 'selected' : ''}>Work</option>
                                <option value="personal" ${todo.category === 'personal' ? 'selected' : ''}>Personal</option>
                                <option value="health" ${todo.category === 'health' ? 'selected' : ''}>Health</option>
                                <option value="learning" ${todo.category === 'learning' ? 'selected' : ''}>Learning</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label>Priority</label>
                            <select id="edit-todo-priority" class="form-select">
                                <option value="low" ${todo.priority === 'low' ? 'selected' : ''}>Low</option>
                                <option value="medium" ${todo.priority === 'medium' ? 'selected' : ''}>Medium</option>
                                <option value="high" ${todo.priority === 'high' ? 'selected' : ''}>High</option>
                                <option value="urgent" ${todo.priority === 'urgent' ? 'selected' : ''}>Urgent</option>
                            </select>
                        </div>
                    </div>
                    <div class="form-group">
                        <label>Due Date</label>
                        <input type="datetime-local" id="edit-todo-due-date" value="${todo.dueDate || ''}" class="form-input">
                    </div>
                    <div class="form-group">
                        <label>Notes</label>
                        <textarea id="edit-todo-notes" class="form-textarea">${todo.notes}</textarea>
                    </div>
                    <div class="form-group">
                        <label>Tags (comma separated)</label>
                        <input type="text" id="edit-todo-tags" value="${todo.tags.join(', ')}" class="form-input">
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-secondary" id="cancel-edit">Cancel</button>
                    <button class="btn btn-primary" id="save-edit">Save Changes</button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        // Event listeners
        modal.querySelector('.modal-close').addEventListener('click', () => {
            document.body.removeChild(modal);
        });

        modal.querySelector('#cancel-edit').addEventListener('click', () => {
            document.body.removeChild(modal);
        });

        modal.querySelector('#save-edit').addEventListener('click', async () => {
            const updatedTodo = {
                ...todo,
                text: modal.querySelector('#edit-todo-text').value.trim(),
                category: modal.querySelector('#edit-todo-category').value,
                priority: modal.querySelector('#edit-todo-priority').value,
                dueDate: modal.querySelector('#edit-todo-due-date').value || null,
                notes: modal.querySelector('#edit-todo-notes').value.trim(),
                tags: modal.querySelector('#edit-todo-tags').value.split(',').map(tag => tag.trim()).filter(tag => tag)
            };

            if (!updatedTodo.text) {
                this.showError('Task title cannot be empty');
                return;
            }

            const todoIndex = this.todos.findIndex(t => t.id === todoId);
            if (todoIndex !== -1) {
                this.todos[todoIndex] = updatedTodo;
                await this.saveTodos();
                this.renderTodos();
                this.showSuccess('Task updated successfully!');
            }

            document.body.removeChild(modal);
        });

        // Close on backdrop click
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                document.body.removeChild(modal);
            }
        });
    }

    renderTodos() {
        if (!this.todoList) return;

        let filteredTodos = this.getFilteredTodos();
        filteredTodos = this.getSortedTodos(filteredTodos);

        // Update filter buttons
        const filterButtons = document.querySelectorAll('.todo-filter-btn');
        filterButtons.forEach(btn => {
            btn.classList.remove('active');
            if (btn.dataset.filter === this.currentFilter) {
                btn.classList.add('active');
            }
        });

        if (filteredTodos.length === 0) {
            this.todoList.innerHTML = `
                <div class="todo-empty">
                    <span class="material-symbols-outlined">task_alt</span>
                    <p>${this.currentFilter === 'all' ? 'No tasks yet' : 'No tasks in this category'}</p>
                    <p>Add a new task to get started!</p>
                </div>
            `;
            return;
        }

        this.todoList.innerHTML = filteredTodos.map(todo => {
            const isOverdue = todo.dueDate && new Date(todo.dueDate) < new Date() && !todo.completed;
            const priorityColor = this.getPriorityColor(todo.priority);
            const categoryIcon = this.getCategoryIcon(todo.category);
            
            return `
                <div class="todo-item ${todo.completed ? 'completed' : ''} ${isOverdue ? 'overdue' : ''}" data-todo-id="${todo.id}">
                    <div class="todo-content">
                        <div class="todo-checkbox">
                            <input type="checkbox" ${todo.completed ? 'checked' : ''} onchange="window.TodoWidget.toggleTodo('${todo.id}')">
                            <span class="checkmark"></span>
                        </div>
                        <div class="todo-text">
                            <span class="todo-title">${todo.text}</span>
                            ${todo.notes ? `<div class="todo-notes">${todo.notes}</div>` : ''}
                            ${todo.tags.length > 0 ? `<div class="todo-tags">${todo.tags.map(tag => `<span class="todo-tag">${tag}</span>`).join('')}</div>` : ''}
                        </div>
                        <div class="todo-meta">
                            <span class="todo-category" style="color: ${priorityColor}">
                                <span class="material-symbols-outlined">${categoryIcon}</span>
                                ${todo.category}
                            </span>
                            <span class="todo-priority priority-${todo.priority}">${todo.priority}</span>
                            ${todo.dueDate ? `<span class="todo-due-date ${isOverdue ? 'overdue' : ''}">${this.formatDate(todo.dueDate)}</span>` : ''}
                        </div>
                    </div>
                    <div class="todo-actions">
                        <button class="todo-action-btn" onclick="window.TodoWidget.editTodo('${todo.id}')" title="Edit">
                            <span class="material-symbols-outlined">edit</span>
                        </button>
                        <button class="todo-action-btn" onclick="window.TodoWidget.deleteTodo('${todo.id}')" title="Delete">
                            <span class="material-symbols-outlined">delete</span>
                        </button>
                    </div>
                </div>
            `;
        }).join('');

        this.updateStats();
    }

    getFilteredTodos() {
        let filtered = this.todos;

        switch (this.currentFilter) {
            case 'completed':
                filtered = filtered.filter(todo => todo.completed);
                break;
            case 'pending':
                filtered = filtered.filter(todo => !todo.completed);
                break;
            case 'overdue':
                filtered = filtered.filter(todo => 
                    todo.dueDate && new Date(todo.dueDate) < new Date() && !todo.completed
                );
                break;
            case 'today':
                const today = new Date().toDateString();
                filtered = filtered.filter(todo => 
                    todo.dueDate && new Date(todo.dueDate).toDateString() === today
                );
                break;
            case 'high-priority':
                filtered = filtered.filter(todo => 
                    todo.priority === 'high' || todo.priority === 'urgent'
                );
                break;
        }

        return filtered;
    }

    getSortedTodos(todos) {
        return todos.sort((a, b) => {
            switch (this.currentSort) {
                case 'date-asc':
                    return new Date(a.createdAt) - new Date(b.createdAt);
                case 'date-desc':
                    return new Date(b.createdAt) - new Date(a.createdAt);
                case 'priority':
                    const priorityOrder = { urgent: 4, high: 3, medium: 2, low: 1 };
                    return priorityOrder[b.priority] - priorityOrder[a.priority];
                case 'due-date':
                    if (!a.dueDate && !b.dueDate) return 0;
                    if (!a.dueDate) return 1;
                    if (!b.dueDate) return -1;
                    return new Date(a.dueDate) - new Date(b.dueDate);
                case 'alphabetical':
                    return a.text.localeCompare(b.text);
                default:
                    return new Date(b.createdAt) - new Date(a.createdAt);
            }
        });
    }

    getPriorityColor(priority) {
        const colors = {
            low: '#4caf50',
            medium: '#ff9800',
            high: '#f44336',
            urgent: '#9c27b0'
        };
        return colors[priority] || colors.medium;
    }

    getCategoryIcon(category) {
        const icons = {
            general: 'task',
            work: 'work',
            personal: 'person',
            health: 'favorite',
            learning: 'school'
        };
        return icons[category] || 'task';
    }

    formatDate(dateString) {
        const date = new Date(dateString);
        const now = new Date();
        const diffTime = Math.abs(now - date);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays === 0) {
            return 'Today';
        } else if (diffDays === 1) {
            return 'Tomorrow';
        } else if (diffDays <= 7) {
            return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
        } else {
            return date.toLocaleDateString();
        }
    }

    updateProductivityStats() {
        const today = new Date().toDateString();
        const todayTodos = this.todos.filter(todo => 
            todo.completed && todo.completedAt && new Date(todo.completedAt).toDateString() === today
        );

        this.productivityStats.tasksCompletedToday = todayTodos.length;
        this.productivityStats.totalTasksCompleted = this.todos.filter(todo => todo.completed).length;
        
        // Calculate completion rate
        const totalTodos = this.todos.length;
        this.productivityStats.completionRate = totalTodos > 0 ? 
            (this.productivityStats.totalTasksCompleted / totalTodos) * 100 : 0;

        // Calculate overdue tasks
        this.analytics.overdueTasks = this.todos.filter(todo => 
            todo.dueDate && new Date(todo.dueDate) < new Date() && !todo.completed
        ).length;

        // Calculate average priority
        const priorityValues = { low: 1, medium: 2, high: 3, urgent: 4 };
        const totalPriority = this.todos.reduce((sum, todo) => sum + priorityValues[todo.priority], 0);
        this.analytics.averagePriority = this.todos.length > 0 ? totalPriority / this.todos.length : 0;

        this.updateStats();
    }

    updateStreak() {
        // Simple streak calculation - can be enhanced
        const today = new Date().toDateString();
        const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toDateString();
        
        // This is a simplified version - in a real app you'd track daily completion
        this.productivityStats.currentStreak++;
        if (this.productivityStats.currentStreak > this.productivityStats.longestStreak) {
            this.productivityStats.longestStreak = this.productivityStats.currentStreak;
        }
    }

    updateStats() {
        if (!this.todoStats) return;

        const totalTodos = this.todos.length;
        const completedTodos = this.todos.filter(todo => todo.completed).length;
        const pendingTodos = totalTodos - completedTodos;

        this.todoStats.innerHTML = `
            <div class="stats-grid">
                <div class="stat-item">
                    <span class="stat-value">${totalTodos}</span>
                    <span class="stat-label">Total</span>
                </div>
                <div class="stat-item">
                    <span class="stat-value">${completedTodos}</span>
                    <span class="stat-label">Completed</span>
                </div>
                <div class="stat-item">
                    <span class="stat-value">${pendingTodos}</span>
                    <span class="stat-label">Pending</span>
                </div>
                <div class="stat-item">
                    <span class="stat-value">${this.analytics.overdueTasks}</span>
                    <span class="stat-label">Overdue</span>
                </div>
            </div>
            <div class="progress-bar">
                <div class="progress-fill" style="width: ${this.productivityStats.completionRate}%"></div>
            </div>
            <div class="completion-rate">${this.productivityStats.completionRate.toFixed(1)}% Complete</div>
        `;
    }

    startDailyReset() {
        // Reset daily stats at midnight
        const now = new Date();
        const tomorrow = new Date(now);
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setHours(0, 0, 0, 0);
        
        const timeUntilMidnight = tomorrow - now;
        
        setTimeout(() => {
            this.productivityStats.tasksCompletedToday = 0;
            this.updateProductivityStats();
            this.startDailyReset(); // Schedule next reset
        }, timeUntilMidnight);
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

    // Additional functional methods
    setFilter(filter) {
        this.currentFilter = filter;
        this.renderTodos();
        this.showSuccess(`Filtered by: ${filter}`);
    }

    setSort(sortBy) {
        this.currentSort = sortBy;
        this.renderTodos();
        this.showSuccess(`Sorted by: ${sortBy}`);
    }

    clearCompleted() {
        if (confirm('Are you sure you want to clear all completed tasks?')) {
            this.todos = this.todos.filter(todo => !todo.completed);
            this.saveTodos();
            this.renderTodos();
            this.updateProductivityStats();
            this.showSuccess('Completed tasks cleared');
        }
    }

    exportTodos() {
        const data = {
            todos: this.todos,
            exportDate: new Date().toISOString(),
            version: '1.0'
        };

        const blob = new Blob([JSON.stringify(data, null, 2)], {
            type: 'application/json'
        });

        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `todos-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        this.showSuccess('Tasks exported successfully');
    }

    importTodos() {
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
                        if (data.todos && Array.isArray(data.todos)) {
                            this.todos = [...this.todos, ...data.todos];
                            this.saveTodos();
                            this.renderTodos();
                            this.updateProductivityStats();
                            this.showSuccess('Tasks imported successfully');
                        } else {
                            this.showError('Invalid file format');
                        }
                    } catch (error) {
                        this.showError('Failed to import tasks');
                    }
                };
                reader.readAsText(file);
            }
        };
        input.click();
    }

    showSettings() {
        const dialog = document.createElement('div');
        dialog.className = 'modal-overlay';
        dialog.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>Task Settings</h3>
                </div>
                <div class="modal-body">
                    <div class="form-group">
                        <label>Maximum tasks</label>
                        <input type="number" id="max-todos" value="${this.maxTodos}" min="10" max="500" class="form-input">
                    </div>
                    <div class="form-group">
                        <label>
                            <input type="checkbox" id="auto-save" checked>
                            Auto-save tasks
                        </label>
                    </div>
                    <div class="form-group">
                        <label>
                            <input type="checkbox" id="notifications" ${this.notifications.reminderEnabled ? 'checked' : ''}>
                            Enable notifications
                        </label>
                    </div>
                    <div class="form-group">
                        <label>Reminder time</label>
                        <input type="time" id="reminder-time" value="${this.notifications.reminderTime}" class="form-input">
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
            this.maxTodos = parseInt(dialog.querySelector('#max-todos').value);
            this.notifications.reminderEnabled = dialog.querySelector('#notifications').checked;
            this.notifications.reminderTime = dialog.querySelector('#reminder-time').value;
            
            document.body.removeChild(dialog);
            this.showSuccess('Settings saved');
        });
    }
}

// Initialize when DOM is loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.TodoWidget = new TodoWidget();
    });
} else {
    window.TodoWidget = new TodoWidget();
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = TodoWidget;
}
