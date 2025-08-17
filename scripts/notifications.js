/* 
 * Smart Dashboard NewTab - Notifications Widget
 * Copyright (c) 2024
 * Licensed under the MIT License
 */

class NotificationsWidget {
    constructor() {
        this.notifications = [];
        this.maxNotifications = 50;
        this.notificationCount = 0;
        
        this.notificationsBtn = document.getElementById('notifications-btn');
        this.notificationCountEl = document.getElementById('notification-count');
        this.notificationsPanel = document.getElementById('notifications-panel');
        this.notificationsList = document.getElementById('notifications-list');
        this.closeNotificationsBtn = document.getElementById('close-notifications');
        
        this.storageKey = 'smartDashboard_notifications';
    }

    async init() {
        await this.loadNotifications();
        this.setupEventListeners();
        this.updateNotificationCount();
        this.renderNotifications();
    }

    setupEventListeners() {
        if (this.notificationsBtn) {
            this.notificationsBtn.addEventListener('click', () => {
                this.toggleNotificationsPanel();
            });
        }

        if (this.closeNotificationsBtn) {
            this.closeNotificationsBtn.addEventListener('click', () => {
                this.hideNotificationsPanel();
            });
        }

        // Close panel when clicking outside
        document.addEventListener('click', (e) => {
            if (this.notificationsPanel && !this.notificationsPanel.contains(e.target) && 
                !this.notificationsBtn.contains(e.target)) {
                this.hideNotificationsPanel();
            }
        });
    }

    addNotification(type, title, message, data = {}) {
        const notification = {
            id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
            type: type, // 'info', 'success', 'warning', 'error'
            title: title,
            message: message,
            data: data,
            timestamp: new Date().toISOString(),
            read: false
        };

        this.notifications.unshift(notification);
        
        // Keep only max notifications
        if (this.notifications.length > this.maxNotifications) {
            this.notifications = this.notifications.slice(0, this.maxNotifications);
        }

        this.updateNotificationCount();
        this.renderNotifications();
        this.saveNotifications();
        this.showToast(notification);
    }

    showToast(notification) {
        const toast = document.createElement('div');
        toast.className = `notification-toast notification-${notification.type}`;
        toast.innerHTML = `
            <div class="toast-header">
                <span class="toast-icon">
                    ${this.getNotificationIcon(notification.type)}
                </span>
                <span class="toast-title">${notification.title}</span>
                <button class="toast-close">
                    <span class="material-symbols-outlined">close</span>
                </button>
            </div>
            <div class="toast-message">${notification.message}</div>
        `;

        document.body.appendChild(toast);

        // Auto remove after 5 seconds
        setTimeout(() => {
            if (toast.parentNode) {
                toast.classList.add('removing');
                setTimeout(() => {
                    if (toast.parentNode) {
                        toast.remove();
                    }
                }, 300);
            }
        }, 5000);

        // Close button
        const closeBtn = toast.querySelector('.toast-close');
        closeBtn.addEventListener('click', () => {
            toast.classList.add('removing');
            setTimeout(() => {
                if (toast.parentNode) {
                    toast.remove();
                }
            }, 300);
        });

        // Click to mark as read
        toast.addEventListener('click', () => {
            this.markAsRead(notification.id);
        });
    }

    getNotificationIcon(type) {
        switch (type) {
            case 'success':
                return '<span class="material-symbols-outlined">check_circle</span>';
            case 'warning':
                return '<span class="material-symbols-outlined">warning</span>';
            case 'error':
                return '<span class="material-symbols-outlined">error</span>';
            case 'info':
            default:
                return '<span class="material-symbols-outlined">info</span>';
        }
    }

    markAsRead(notificationId) {
        const notification = this.notifications.find(n => n.id === notificationId);
        if (notification) {
            notification.read = true;
            this.updateNotificationCount();
            this.renderNotifications();
            this.saveNotifications();
        }
    }

    markAllAsRead() {
        this.notifications.forEach(notification => {
            notification.read = true;
        });
        this.updateNotificationCount();
        this.renderNotifications();
        this.saveNotifications();
    }

    deleteNotification(notificationId) {
        this.notifications = this.notifications.filter(n => n.id !== notificationId);
        this.updateNotificationCount();
        this.renderNotifications();
        this.saveNotifications();
    }

    clearAllNotifications() {
        this.notifications = [];
        this.updateNotificationCount();
        this.renderNotifications();
        this.saveNotifications();
    }

    updateNotificationCount() {
        const unreadCount = this.notifications.filter(n => !n.read).length;
        this.notificationCount = unreadCount;

        if (this.notificationCountEl) {
            this.notificationCountEl.textContent = unreadCount;
            this.notificationCountEl.style.display = unreadCount > 0 ? 'block' : 'none';
        }
    }

    renderNotifications() {
        if (!this.notificationsList) return;

        this.notificationsList.innerHTML = '';

        if (this.notifications.length === 0) {
            this.notificationsList.innerHTML = `
                <div class="no-notifications">
                    <span class="material-symbols-outlined">notifications_off</span>
                    <p>No notifications yet</p>
                </div>
            `;
            return;
        }

        this.notifications.forEach(notification => {
            const notificationEl = document.createElement('div');
            notificationEl.className = `notification-item ${notification.read ? 'read' : 'unread'} notification-${notification.type}`;
            notificationEl.innerHTML = `
                <div class="notification-icon">
                    ${this.getNotificationIcon(notification.type)}
                </div>
                <div class="notification-content">
                    <div class="notification-header">
                        <h4 class="notification-title">${notification.title}</h4>
                        <span class="notification-time">${this.formatTime(notification.timestamp)}</span>
                    </div>
                    <p class="notification-message">${notification.message}</p>
                    ${notification.data.action ? `
                        <div class="notification-actions">
                            <button class="notification-action-btn" data-action="${notification.data.action}">
                                ${notification.data.actionText || 'View'}
                            </button>
                        </div>
                    ` : ''}
                </div>
                <div class="notification-actions-menu">
                    <button class="notification-menu-btn" data-id="${notification.id}">
                        <span class="material-symbols-outlined">more_vert</span>
                    </button>
                </div>
            `;

            // Event listeners
            const menuBtn = notificationEl.querySelector('.notification-menu-btn');
            const actionBtn = notificationEl.querySelector('.notification-action-btn');

            menuBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.showNotificationMenu(notification.id, menuBtn);
            });

            if (actionBtn) {
                actionBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    this.handleNotificationAction(notification);
                });
            }

            notificationEl.addEventListener('click', () => {
                this.markAsRead(notification.id);
            });

            this.notificationsList.appendChild(notificationEl);
        });

        // Add clear all button if there are notifications
        if (this.notifications.length > 0) {
            const clearAllBtn = document.createElement('div');
            clearAllBtn.className = 'clear-all-notifications';
            clearAllBtn.innerHTML = `
                <button class="clear-all-btn">
                    <span class="material-symbols-outlined">clear_all</span>
                    Clear All
                </button>
            `;
            
            clearAllBtn.addEventListener('click', () => {
                this.clearAllNotifications();
            });
            
            this.notificationsList.appendChild(clearAllBtn);
        }
    }

    showNotificationMenu(notificationId, button) {
        // Remove existing menus
        const existingMenus = document.querySelectorAll('.notification-menu');
        existingMenus.forEach(menu => menu.remove());

        const menu = document.createElement('div');
        menu.className = 'notification-menu';
        menu.innerHTML = `
            <button class="menu-item mark-read" data-id="${notificationId}">
                <span class="material-symbols-outlined">mark_email_read</span>
                Mark as Read
            </button>
            <button class="menu-item delete" data-id="${notificationId}">
                <span class="material-symbols-outlined">delete</span>
                Delete
            </button>
        `;

        // Position menu
        const rect = button.getBoundingClientRect();
        menu.style.position = 'absolute';
        menu.style.top = `${rect.bottom + 5}px`;
        menu.style.right = '10px';
        menu.style.zIndex = '1000';

        button.parentNode.appendChild(menu);

        // Event listeners
        const markReadBtn = menu.querySelector('.mark-read');
        const deleteBtn = menu.querySelector('.delete');

        markReadBtn.addEventListener('click', () => {
            this.markAsRead(notificationId);
            menu.remove();
        });

        deleteBtn.addEventListener('click', () => {
            this.deleteNotification(notificationId);
            menu.remove();
        });

        // Close menu when clicking outside
        setTimeout(() => {
            document.addEventListener('click', function closeMenu(e) {
                if (!menu.contains(e.target) && !button.contains(e.target)) {
                    menu.remove();
                    document.removeEventListener('click', closeMenu);
                }
            });
        }, 0);
    }

    handleNotificationAction(notification) {
        switch (notification.data.action) {
            case 'open_settings':
                // Trigger settings modal
                const settingsBtn = document.getElementById('settings-btn');
                if (settingsBtn) {
                    settingsBtn.click();
                }
                break;
            case 'open_calendar':
                // Scroll to calendar widget
                const calendarWidget = document.querySelector('.calendar-widget');
                if (calendarWidget) {
                    calendarWidget.scrollIntoView({ behavior: 'smooth' });
                }
                break;
            case 'open_timer':
                // Scroll to timer widget
                const timerWidget = document.querySelector('.timer-widget');
                if (timerWidget) {
                    timerWidget.scrollIntoView({ behavior: 'smooth' });
                }
                break;
            case 'refresh_quote':
                // Refresh quote
                if (window.QuotesWidget) {
                    window.QuotesWidget.refresh();
                }
                break;
            default:
                console.log('Unknown notification action:', notification.data.action);
        }

        this.markAsRead(notification.id);
    }

    toggleNotificationsPanel() {
        if (!this.notificationsPanel) return;

        if (this.notificationsPanel.classList.contains('hidden')) {
            this.showNotificationsPanel();
        } else {
            this.hideNotificationsPanel();
        }
    }

    showNotificationsPanel() {
        if (!this.notificationsPanel) return;

        this.notificationsPanel.classList.remove('hidden');
        this.renderNotifications();
    }

    hideNotificationsPanel() {
        if (!this.notificationsPanel) return;

        this.notificationsPanel.classList.add('hidden');
    }

    formatTime(timestamp) {
        const date = new Date(timestamp);
        const now = new Date();
        const diff = now - date;

        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);

        if (minutes < 1) {
            return 'Just now';
        } else if (minutes < 60) {
            return `${minutes}m ago`;
        } else if (hours < 24) {
            return `${hours}h ago`;
        } else if (days < 7) {
            return `${days}d ago`;
        } else {
            return date.toLocaleDateString();
        }
    }

    async loadNotifications() {
        try {
            const result = await chrome.storage.sync.get(this.storageKey);
            this.notifications = result[this.storageKey] || [];
        } catch (error) {
            console.error('Failed to load notifications:', error);
            this.notifications = [];
        }
    }

    async saveNotifications() {
        try {
            await chrome.storage.sync.set({
                [this.storageKey]: this.notifications
            });
        } catch (error) {
            console.error('Failed to save notifications:', error);
        }
    }

    // Public methods for other widgets to use
    showInfo(title, message, data = {}) {
        this.addNotification('info', title, message, data);
    }

    showSuccess(title, message, data = {}) {
        this.addNotification('success', title, message, data);
    }

    showWarning(title, message, data = {}) {
        this.addNotification('warning', title, message, data);
    }

    showError(title, message, data = {}) {
        this.addNotification('error', title, message, data);
    }

    // System notifications
    showSystemNotification(title, message) {
        if ('Notification' in window && Notification.permission === 'granted') {
            new Notification(title, {
                body: message,
                icon: '/icons/icon-128.png',
                badge: '/icons/icon-48.png'
            });
        }
    }

    // Request notification permission
    requestPermission() {
        if ('Notification' in window && Notification.permission === 'default') {
            Notification.requestPermission();
        }
    }

    // Get notification statistics
    getNotificationStats() {
        const total = this.notifications.length;
        const unread = this.notifications.filter(n => !n.read).length;
        const byType = {
            info: this.notifications.filter(n => n.type === 'info').length,
            success: this.notifications.filter(n => n.type === 'success').length,
            warning: this.notifications.filter(n => n.type === 'warning').length,
            error: this.notifications.filter(n => n.type === 'error').length
        };

        return { total, unread, byType };
    }
}

// Create widget instance when script loads
window.NotificationsWidget = new NotificationsWidget();

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = NotificationsWidget;
}
