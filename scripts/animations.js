/**
 * Animations Management for Smart Dashboard NewTab
 * Handles advanced UI animations, transitions, and interactive effects
 */

class AnimationManager {
    constructor() {
        this.animationsEnabled = true;
        this.intersectionObserver = null;
        this.init();
    }
    
    init() {
        this.setupIntersectionObserver();
        this.setupScrollAnimations();
        this.setupHoverEffects();
        this.setupLoadingAnimations();
        this.setupWidgetAnimations();
        this.setupNotificationAnimations();
        this.setupModalAnimations();
        this.setupKeyboardShortcuts();
    }
    
    setupIntersectionObserver() {
        // Create intersection observer for scroll-triggered animations
        this.intersectionObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate-in');
                }
            });
        }, {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        });
        
        // Observe elements that should animate on scroll
        const animatedElements = document.querySelectorAll('.widget, .action-card, .stat-item');
        animatedElements.forEach(el => {
            this.intersectionObserver.observe(el);
        });
    }
    
    setupScrollAnimations() {
        // Parallax effect for header
        const header = document.querySelector('.header');
        if (header) {
            window.addEventListener('scroll', () => {
                const scrolled = window.pageYOffset;
                const rate = scrolled * -0.5;
                header.style.transform = `translateY(${rate}px)`;
            });
        }
        
        // Smooth scroll for anchor links
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', (e) => {
                e.preventDefault();
                const target = document.querySelector(anchor.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            });
        });
    }
    
    setupHoverEffects() {
        // Widget hover effects
        document.querySelectorAll('.widget').forEach(widget => {
            widget.addEventListener('mouseenter', () => {
                this.addHoverEffect(widget);
            });
            
            widget.addEventListener('mouseleave', () => {
                this.removeHoverEffect(widget);
            });
        });
        
        // Action card hover effects
        document.querySelectorAll('.action-card').forEach(card => {
            card.addEventListener('mouseenter', () => {
                this.addCardHoverEffect(card);
            });
            
            card.addEventListener('mouseleave', () => {
                this.removeCardHoverEffect(card);
            });
        });
        
        // Button hover effects
        document.querySelectorAll('button').forEach(button => {
            button.addEventListener('mouseenter', () => {
                this.addButtonHoverEffect(button);
            });
            
            button.addEventListener('mouseleave', () => {
                this.removeButtonHoverEffect(button);
            });
        });
    }
    
    setupLoadingAnimations() {
        // Loading screen animations
        const loadingScreen = document.getElementById('loading-screen');
        const mainContainer = document.getElementById('main-container');
        
        if (loadingScreen && mainContainer) {
            // Simulate loading progress
            const progressBar = loadingScreen.querySelector('.progress-bar');
            const loadingText = loadingScreen.querySelector('.loading-text');
            
            let progress = 0;
            const loadingSteps = [
                'Initializing dashboard...',
                'Loading widgets...',
                'Connecting to services...',
                'Applying theme...',
                'Ready!'
            ];
            
            const loadingInterval = setInterval(() => {
                progress += 20;
                if (progressBar) {
                    progressBar.style.width = `${progress}%`;
                }
                
                if (loadingText && progress <= 100) {
                    const stepIndex = Math.floor(progress / 20) - 1;
                    if (stepIndex >= 0 && stepIndex < loadingSteps.length) {
                        loadingText.textContent = loadingSteps[stepIndex];
                    }
                }
                
                if (progress >= 100) {
                    clearInterval(loadingInterval);
                    setTimeout(() => {
                        this.hideLoadingScreen();
                    }, 500);
                }
            }, 200);
        }
    }
    
    hideLoadingScreen() {
        const loadingScreen = document.getElementById('loading-screen');
        const mainContainer = document.getElementById('main-container');
        
        if (loadingScreen && mainContainer) {
            loadingScreen.style.opacity = '0';
            loadingScreen.style.visibility = 'hidden';
            
            mainContainer.classList.remove('hidden');
            mainContainer.style.opacity = '0';
            
            setTimeout(() => {
                mainContainer.style.opacity = '1';
                this.animateWidgetsIn();
            }, 100);
        }
    }
    
    animateWidgetsIn() {
        const widgets = document.querySelectorAll('.widget');
        widgets.forEach((widget, index) => {
            setTimeout(() => {
                widget.classList.add('animate-in');
            }, index * 100);
        });
    }
    
    setupWidgetAnimations() {
        // Calculator button animations
        document.querySelectorAll('.calc-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                this.addClickEffect(btn);
            });
        });
        
        // Timer progress animation
        const timerProgress = document.querySelector('.timer-progress');
        if (timerProgress) {
            this.animateTimerProgress(timerProgress);
        }
        
        // Calendar day animations
        document.querySelectorAll('.calendar-day').forEach(day => {
            day.addEventListener('click', () => {
                this.addCalendarDayEffect(day);
            });
        });
        
        // Todo item animations
        this.setupTodoAnimations();
        
        // Quote refresh animation
        const refreshQuoteBtn = document.getElementById('refresh-quote-btn');
        if (refreshQuoteBtn) {
            refreshQuoteBtn.addEventListener('click', () => {
                this.addRefreshAnimation(refreshQuoteBtn);
            });
        }
    }
    
    setupTodoAnimations() {
        // Add new todo animation
        const addTodoBtn = document.getElementById('add-todo-btn');
        const newTodoInput = document.getElementById('new-todo');
        
        if (addTodoBtn && newTodoInput) {
            addTodoBtn.addEventListener('click', () => {
                if (newTodoInput.value.trim()) {
                    this.addTodoItemAnimation();
                }
            });
            
            newTodoInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter' && newTodoInput.value.trim()) {
                    this.addTodoItemAnimation();
                }
            });
        }
    }
    
    addTodoItemAnimation() {
        const todoList = document.getElementById('todo-list');
        if (todoList) {
            const newItem = document.createElement('div');
            newItem.className = 'todo-item new-todo';
            newItem.style.opacity = '0';
            newItem.style.transform = 'translateY(-20px)';
            
            todoList.appendChild(newItem);
            
            setTimeout(() => {
                newItem.style.transition = 'all 0.3s ease';
                newItem.style.opacity = '1';
                newItem.style.transform = 'translateY(0)';
            }, 10);
        }
    }
    
    setupNotificationAnimations() {
        // Notification panel slide animation
        const notificationsBtn = document.getElementById('notifications-btn');
        const notificationsPanel = document.getElementById('notifications-panel');
        const closeNotifications = document.getElementById('close-notifications');
        
        if (notificationsBtn && notificationsPanel) {
            notificationsBtn.addEventListener('click', () => {
                this.toggleNotificationsPanel(notificationsPanel, true);
            });
        }
        
        if (closeNotifications && notificationsPanel) {
            closeNotifications.addEventListener('click', () => {
                this.toggleNotificationsPanel(notificationsPanel, false);
            });
        }
    }
    
    toggleNotificationsPanel(panel, show) {
        if (show) {
            panel.classList.remove('hidden');
            setTimeout(() => {
                panel.classList.add('show');
            }, 10);
        } else {
            panel.classList.remove('show');
            setTimeout(() => {
                panel.classList.add('hidden');
            }, 300);
        }
    }
    
    setupModalAnimations() {
        // Settings modal animations
        const settingsBtn = document.getElementById('settings-btn');
        const settingsModal = document.getElementById('settings-modal');
        const closeSettings = document.getElementById('close-settings');
        
        if (settingsBtn && settingsModal) {
            settingsBtn.addEventListener('click', () => {
                this.openModal(settingsModal);
            });
        }
        
        if (closeSettings && settingsModal) {
            closeSettings.addEventListener('click', () => {
                this.closeModal(settingsModal);
            });
        }
        
        // Close modal on outside click
        if (settingsModal) {
            settingsModal.addEventListener('click', (e) => {
                if (e.target === settingsModal) {
                    this.closeModal(settingsModal);
                }
            });
        }
    }
    
    openModal(modal) {
        modal.classList.remove('hidden');
        setTimeout(() => {
            modal.classList.add('show');
        }, 10);
    }
    
    closeModal(modal) {
        modal.classList.remove('show');
        setTimeout(() => {
            modal.classList.add('hidden');
        }, 300);
    }
    
    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Ctrl/Cmd + , to open settings
            if ((e.ctrlKey || e.metaKey) && e.key === ',') {
                e.preventDefault();
                this.openModal(document.getElementById('settings-modal'));
            }
            
            // Escape to close modals
            if (e.key === 'Escape') {
                const openModal = document.querySelector('.modal.show');
                if (openModal) {
                    this.closeModal(openModal);
                }
                
                const openPanel = document.querySelector('.notifications-panel.show');
                if (openPanel) {
                    this.toggleNotificationsPanel(openPanel, false);
                }
            }
            
            // Ctrl/Cmd + K to focus search
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                const searchInput = document.getElementById('search-input');
                if (searchInput) {
                    searchInput.focus();
                }
            }
        });
    }
    
    // Hover effect methods
    addHoverEffect(element) {
        if (!this.animationsEnabled) return;
        
        element.style.transform = 'translateY(-2px)';
        element.style.boxShadow = '0 8px 25px rgba(0, 0, 0, 0.15)';
    }
    
    removeHoverEffect(element) {
        element.style.transform = 'translateY(0)';
        element.style.boxShadow = '';
    }
    
    addCardHoverEffect(card) {
        if (!this.animationsEnabled) return;
        
        card.style.transform = 'scale(1.05) translateY(-5px)';
        card.style.boxShadow = '0 10px 30px rgba(0, 0, 0, 0.2)';
    }
    
    removeCardHoverEffect(card) {
        card.style.transform = 'scale(1) translateY(0)';
        card.style.boxShadow = '';
    }
    
    addButtonHoverEffect(button) {
        if (!this.animationsEnabled) return;
        
        button.style.transform = 'scale(1.05)';
    }
    
    removeButtonHoverEffect(button) {
        button.style.transform = 'scale(1)';
    }
    
    // Click effect methods
    addClickEffect(element) {
        if (!this.animationsEnabled) return;
        
        element.style.transform = 'scale(0.95)';
        setTimeout(() => {
            element.style.transform = 'scale(1)';
        }, 150);
    }
    
    addRefreshAnimation(element) {
        if (!this.animationsEnabled) return;
        
        element.style.transform = 'rotate(360deg)';
        element.style.transition = 'transform 0.5s ease';
        
        setTimeout(() => {
            element.style.transform = 'rotate(0deg)';
        }, 500);
    }
    
    addCalendarDayEffect(day) {
        if (!this.animationsEnabled) return;
        
        day.style.transform = 'scale(0.9)';
        day.style.backgroundColor = 'var(--primary-container)';
        
        setTimeout(() => {
            day.style.transform = 'scale(1)';
            day.style.backgroundColor = '';
        }, 200);
    }
    
    // Timer progress animation
    animateTimerProgress(progressElement) {
        const circle = progressElement.querySelector('circle');
        if (!circle) return;
        
        const circumference = 2 * Math.PI * 45; // radius = 45
        circle.style.strokeDasharray = circumference;
        circle.style.strokeDashoffset = circumference;
        
        // Animate progress (example: 75% complete)
        const progress = 0.75;
        const offset = circumference - (progress * circumference);
        circle.style.strokeDashoffset = offset;
    }
    
    // Notification animations
    addNotification(notification) {
        if (!this.animationsEnabled) return;
        
        notification.style.transform = 'translateX(100%)';
        notification.style.opacity = '0';
        
        setTimeout(() => {
            notification.style.transition = 'all 0.3s ease';
            notification.style.transform = 'translateX(0)';
            notification.style.opacity = '1';
        }, 10);
    }
    
    removeNotification(notification) {
        if (!this.animationsEnabled) return;
        
        notification.style.transform = 'translateX(100%)';
        notification.style.opacity = '0';
        
        setTimeout(() => {
            notification.remove();
        }, 300);
    }
    
    // Utility methods
    enableAnimations() {
        this.animationsEnabled = true;
        document.documentElement.style.setProperty('--animation-duration', '0.3s');
    }
    
    disableAnimations() {
        this.animationsEnabled = false;
        document.documentElement.style.setProperty('--animation-duration', '0s');
    }
    
    // Particle effect for special occasions
    createParticleEffect(x, y, color = '#ff6b6b') {
        if (!this.animationsEnabled) return;
        
        for (let i = 0; i < 10; i++) {
            const particle = document.createElement('div');
            particle.className = 'particle';
            particle.style.cssText = `
                position: fixed;
                left: ${x}px;
                top: ${y}px;
                width: 4px;
                height: 4px;
                background-color: ${color};
                border-radius: 50%;
                pointer-events: none;
                z-index: 10000;
                animation: particle-animation 1s ease-out forwards;
            `;
            
            document.body.appendChild(particle);
            
            setTimeout(() => {
                particle.remove();
            }, 1000);
        }
    }
    
    // Success animation
    showSuccessAnimation(element) {
        if (!this.animationsEnabled) return;
        
        element.style.transform = 'scale(1.1)';
        element.style.backgroundColor = 'var(--success-container)';
        
        setTimeout(() => {
            element.style.transform = 'scale(1)';
            element.style.backgroundColor = '';
        }, 300);
    }
    
    // Error animation
    showErrorAnimation(element) {
        if (!this.animationsEnabled) return;
        
        element.style.animation = 'shake 0.5s ease-in-out';
        
        setTimeout(() => {
            element.style.animation = '';
        }, 500);
    }
}

// Add CSS animations
const animationStyles = `
    @keyframes particle-animation {
        0% {
            transform: translate(0, 0) scale(1);
            opacity: 1;
        }
        100% {
            transform: translate(${Math.random() * 200 - 100}px, ${Math.random() * 200 - 100}px) scale(0);
            opacity: 0;
        }
    }
    
    @keyframes shake {
        0%, 100% { transform: translateX(0); }
        25% { transform: translateX(-5px); }
        75% { transform: translateX(5px); }
    }
    
    .animate-in {
        animation: fadeInUp 0.6s ease-out forwards;
    }
    
    @keyframes fadeInUp {
        from {
            opacity: 0;
            transform: translateY(30px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
    
    .new-todo {
        animation: slideInRight 0.3s ease-out;
    }
    
    @keyframes slideInRight {
        from {
            opacity: 0;
            transform: translateX(30px);
        }
        to {
            opacity: 1;
            transform: translateX(0);
        }
    }
`;

// Inject animation styles
const styleSheet = document.createElement('style');
styleSheet.textContent = animationStyles;
document.head.appendChild(styleSheet);

// Initialize animation manager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.animationManager = new AnimationManager();
});
