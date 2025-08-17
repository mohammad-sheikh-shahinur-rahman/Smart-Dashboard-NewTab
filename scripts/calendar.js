/* 
 * Smart Dashboard NewTab - Calendar Widget
 * Copyright (c) 2024
 * Licensed under the MIT License
 */

class CalendarWidget {
    constructor() {
        this.currentDate = new Date();
        this.selectedDate = new Date();
        this.events = [];
        this.monthNames = [
            'January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'
        ];
        this.dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        
        this.calendarGrid = document.getElementById('calendar-grid');
        this.calendarMonth = document.getElementById('calendar-month');
        this.eventList = document.getElementById('event-list');
        this.prevBtn = document.getElementById('calendar-prev-btn');
        this.nextBtn = document.getElementById('calendar-next-btn');
        
        this.storageKey = 'smartDashboard_calendar';
    }

    async init() {
        await this.loadEvents();
        this.setupEventListeners();
        this.renderCalendar();
        this.renderEvents();
    }

    setupEventListeners() {
        if (this.prevBtn) {
            this.prevBtn.addEventListener('click', () => {
                this.previousMonth();
            });
        }

        if (this.nextBtn) {
            this.nextBtn.addEventListener('click', () => {
                this.nextMonth();
            });
        }
    }

    previousMonth() {
        this.currentDate.setMonth(this.currentDate.getMonth() - 1);
        this.renderCalendar();
    }

    nextMonth() {
        this.currentDate.setMonth(this.currentDate.getMonth() + 1);
        this.renderCalendar();
    }

    renderCalendar() {
        if (!this.calendarGrid || !this.calendarMonth) return;

        const year = this.currentDate.getFullYear();
        const month = this.currentDate.getMonth();
        
        // Update month display
        this.calendarMonth.textContent = `${this.monthNames[month]} ${year}`;

        // Get first day of month and number of days
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const startDate = new Date(firstDay);
        startDate.setDate(startDate.getDate() - firstDay.getDay());

        // Clear grid
        this.calendarGrid.innerHTML = '';

        // Add day headers
        this.dayNames.forEach(day => {
            const dayHeader = document.createElement('div');
            dayHeader.className = 'calendar-day-header';
            dayHeader.textContent = day;
            this.calendarGrid.appendChild(dayHeader);
        });

        // Add calendar days
        for (let i = 0; i < 42; i++) {
            const date = new Date(startDate);
            date.setDate(startDate.getDate() + i);

            const dayElement = document.createElement('div');
            dayElement.className = 'calendar-day';
            dayElement.textContent = date.getDate();

            // Check if it's today
            const today = new Date();
            if (date.toDateString() === today.toDateString()) {
                dayElement.classList.add('today');
            }

            // Check if it's current month
            if (date.getMonth() !== month) {
                dayElement.classList.add('other-month');
            }

            // Check if it has events
            if (this.hasEvents(date)) {
                dayElement.classList.add('has-events');
            }

            // Add click event
            dayElement.addEventListener('click', () => {
                this.selectDate(date);
            });

            this.calendarGrid.appendChild(dayElement);
        }
    }

    selectDate(date) {
        this.selectedDate = date;
        this.renderEvents();
        
        // Update visual selection
        const days = this.calendarGrid.querySelectorAll('.calendar-day');
        days.forEach(day => day.classList.remove('selected'));
        
        const selectedDay = Array.from(days).find(day => {
            const dayDate = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth(), parseInt(day.textContent));
            return dayDate.toDateString() === date.toDateString();
        });
        
        if (selectedDay) {
            selectedDay.classList.add('selected');
        }
    }

    hasEvents(date) {
        return this.events.some(event => {
            const eventDate = new Date(event.date);
            return eventDate.toDateString() === date.toDateString();
        });
    }

    renderEvents() {
        if (!this.eventList) return;

        const selectedDateStr = this.selectedDate.toDateString();
        const dayEvents = this.events.filter(event => {
            const eventDate = new Date(event.date);
            return eventDate.toDateString() === selectedDateStr;
        });

        this.eventList.innerHTML = '';

        if (dayEvents.length === 0) {
            const noEvents = document.createElement('div');
            noEvents.className = 'no-events';
            noEvents.textContent = 'No events for this date';
            this.eventList.appendChild(noEvents);
            return;
        }

        dayEvents.forEach(event => {
            const eventElement = document.createElement('div');
            eventElement.className = 'event-item';
            eventElement.innerHTML = `
                <div class="event-time">${event.time}</div>
                <div class="event-title">${event.title}</div>
                <div class="event-actions">
                    <button class="event-edit-btn" data-id="${event.id}">
                        <span class="material-symbols-outlined">edit</span>
                    </button>
                    <button class="event-delete-btn" data-id="${event.id}">
                        <span class="material-symbols-outlined">delete</span>
                    </button>
                </div>
            `;

            // Add event listeners
            const editBtn = eventElement.querySelector('.event-edit-btn');
            const deleteBtn = eventElement.querySelector('.event-delete-btn');

            editBtn.addEventListener('click', () => {
                this.editEvent(event.id);
            });

            deleteBtn.addEventListener('click', () => {
                this.deleteEvent(event.id);
            });

            this.eventList.appendChild(eventElement);
        });
    }

    async addEvent(title, date, time, description = '') {
        const event = {
            id: Date.now().toString(),
            title,
            date: date.toISOString(),
            time,
            description,
            created: new Date().toISOString()
        };

        this.events.push(event);
        await this.saveEvents();
        this.renderCalendar();
        this.renderEvents();
    }

    async editEvent(eventId) {
        const event = this.events.find(e => e.id === eventId);
        if (!event) return;

        // Simple prompt for now - could be enhanced with a modal
        const newTitle = prompt('Edit event title:', event.title);
        if (newTitle !== null) {
            event.title = newTitle;
            await this.saveEvents();
            this.renderEvents();
        }
    }

    async deleteEvent(eventId) {
        if (confirm('Are you sure you want to delete this event?')) {
            this.events = this.events.filter(e => e.id !== eventId);
            await this.saveEvents();
            this.renderCalendar();
            this.renderEvents();
        }
    }

    async loadEvents() {
        try {
            const result = await chrome.storage.sync.get(this.storageKey);
            this.events = result[this.storageKey] || [];
        } catch (error) {
            console.error('Failed to load calendar events:', error);
            this.events = [];
        }
    }

    async saveEvents() {
        try {
            await chrome.storage.sync.set({
                [this.storageKey]: this.events
            });
        } catch (error) {
            console.error('Failed to save calendar events:', error);
        }
    }

    // Public methods
    getEventsForDate(date) {
        return this.events.filter(event => {
            const eventDate = new Date(event.date);
            return eventDate.toDateString() === date.toDateString();
        });
    }

    getUpcomingEvents(days = 7) {
        const today = new Date();
        const future = new Date();
        future.setDate(today.getDate() + days);

        return this.events.filter(event => {
            const eventDate = new Date(event.date);
            return eventDate >= today && eventDate <= future;
        }).sort((a, b) => new Date(a.date) - new Date(b.date));
    }

    // Quick add event method
    async quickAddEvent(title) {
        await this.addEvent(title, this.selectedDate, '12:00');
    }
}

// Create widget instance when script loads
window.CalendarWidget = new CalendarWidget();

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CalendarWidget;
}
