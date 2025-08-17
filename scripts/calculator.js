/* 
 * Enhanced Calculator Widget - Scientific Calculator with Memory Functions
 * Features: Basic operations, Scientific functions, Memory storage, History
 * Copyright (c) 2024
 * Licensed under the MIT License
 */

class CalculatorWidget {
    constructor() {
        this.currentInput = '';
        this.previousInput = '';
        this.operation = null;
        this.shouldResetScreen = false;
        this.memory = 0;
        this.isMemorySet = false;
        this.history = [];
        this.maxHistory = 50;
        
        // DOM elements
        this.display = document.getElementById('calc-expression');
        this.resultDisplay = document.getElementById('calc-result');
        this.historyDisplay = document.getElementById('calc-history');
        this.memoryIndicator = document.getElementById('memory-indicator');
        
        // Scientific functions
        this.scientificFunctions = {
            sin: (x) => Math.sin(this.toRadians(x)),
            cos: (x) => Math.cos(this.toRadians(x)),
            tan: (x) => Math.tan(this.toRadians(x)),
            asin: (x) => this.toDegrees(Math.asin(x)),
            acos: (x) => this.toDegrees(Math.acos(x)),
            atan: (x) => this.toDegrees(Math.atan(x)),
            log: (x) => Math.log10(x),
            ln: (x) => Math.log(x),
            sqrt: (x) => Math.sqrt(x),
            square: (x) => Math.pow(x, 2),
            cube: (x) => Math.pow(x, 3),
            power: (x, y) => Math.pow(x, y),
            factorial: (x) => this.factorial(x),
            exp: (x) => Math.exp(x),
            pi: () => Math.PI,
            e: () => Math.E,
            abs: (x) => Math.abs(x),
            floor: (x) => Math.floor(x),
            ceil: (x) => Math.ceil(x),
            round: (x) => Math.round(x)
        };
        
        this.init();
    }

    init() {
        console.log('Calculator Widget: Starting initialization...');
        console.log('Calculator Widget: Looking for calculator elements...');
        
        // Check if elements exist
        console.log('Calculator Widget: calc-expression element:', !!this.display);
        console.log('Calculator Widget: calc-result element:', !!this.resultDisplay);
        console.log('Calculator Widget: calc-history element:', !!this.historyDisplay);
        
        this.setupEventListeners();
        this.updateDisplay();
        this.updateMemoryIndicator();
        console.log('Calculator Widget initialized successfully');
    }

    setupEventListeners() {
        console.log('Calculator Widget: Setting up event listeners...');
        
        // Get all calculator buttons with data-action
        const calcButtons = document.querySelectorAll('.calc-btn[data-action]');
        console.log('Calculator Widget: Found', calcButtons.length, 'calculator buttons');
        
        calcButtons.forEach(btn => {
            const action = btn.getAttribute('data-action');
            console.log('Calculator Widget: Adding listener for button with action:', action);
            btn.addEventListener('click', (e) => {
                console.log('Calculator Widget: Button clicked with action:', action);
                this.handleButtonClick(action);
            });
        });

        // Additional buttons
        const clearBtn = document.getElementById('calc-clear-btn');
        if (clearBtn) {
            console.log('Calculator Widget: Found clear button');
            clearBtn.addEventListener('click', () => this.clear());
        } else {
            console.log('Calculator Widget: Clear button not found');
        }

        const historyBtn = document.getElementById('calc-history-btn');
        if (historyBtn) {
            console.log('Calculator Widget: Found history button');
            historyBtn.addEventListener('click', () => this.toggleHistory());
        } else {
            console.log('Calculator Widget: History button not found');
        }

        // Keyboard support
        document.addEventListener('keydown', (e) => {
            this.handleKeyboardInput(e);
        });
        
        console.log('Calculator Widget: Event listeners setup complete');
    }

    handleButtonClick(action) {
        console.log('Calculator Widget: Handling button click for action:', action);
        
        // Numbers
        if (/[0-9]/.test(action)) {
            console.log('Calculator Widget: Processing number:', action);
            this.appendNumber(action);
        }
        // Decimal
        else if (action === 'decimal') {
            console.log('Calculator Widget: Processing decimal');
            this.appendDecimal();
        }
        // Operations
        else if (['add', 'subtract', 'multiply', 'divide'].includes(action)) {
            const operationMap = {
                'add': '+',
                'subtract': '-',
                'multiply': '*',
                'divide': '/'
            };
            console.log('Calculator Widget: Processing operation:', action, '->', operationMap[action]);
            this.chooseOperation(operationMap[action]);
        }
        // Equals
        else if (action === 'equals') {
            console.log('Calculator Widget: Processing equals');
            this.compute();
        }
        // Clear
        else if (action === 'clear') {
            console.log('Calculator Widget: Processing clear');
            this.clear();
        }
        // Backspace
        else if (action === 'backspace') {
            console.log('Calculator Widget: Processing backspace');
            this.backspace();
        }
        // Percent
        else if (action === 'percent') {
            console.log('Calculator Widget: Processing percent');
            this.percent();
        }
        else {
            console.log('Calculator Widget: Unknown action:', action);
        }
    }

    handleKeyboardInput(e) {
        const key = e.key;
        
        // Numbers
        if (/[0-9]/.test(key)) {
            this.appendNumber(key);
        }
        // Decimal
        else if (key === '.') {
            this.appendDecimal();
        }
        // Operations
        else if (['+', '-', '*', '/', '%'].includes(key)) {
            e.preventDefault();
            this.chooseOperation(key);
        }
        // Equals
        else if (key === 'Enter' || key === '=') {
            e.preventDefault();
            this.compute();
        }
        // Clear
        else if (key === 'Escape') {
            e.preventDefault();
            this.clear();
        }
        // Backspace
        else if (key === 'Backspace') {
            e.preventDefault();
            this.backspace();
        }
    }

    appendNumber(number) {
        if (this.shouldResetScreen) {
            this.currentInput = '';
            this.shouldResetScreen = false;
        }
        
        if (this.currentInput === '0' && number !== '.') {
            this.currentInput = number;
        } else {
            this.currentInput += number;
        }
        
        this.updateDisplay();
    }

    appendDecimal() {
        if (this.shouldResetScreen) {
            this.currentInput = '0';
            this.shouldResetScreen = false;
        }
        
        if (this.currentInput === '') {
            this.currentInput = '0';
        }
        
        if (!this.currentInput.includes('.')) {
            this.currentInput += '.';
        }
        
        this.updateDisplay();
    }

    chooseOperation(operation) {
        if (this.currentInput === '' && this.previousInput === '') {
            return;
        }
        
        if (this.currentInput === '') {
            this.operation = operation;
            return;
        }
        
        if (this.previousInput !== '') {
            this.compute();
        }
        
        this.operation = operation;
        this.previousInput = this.currentInput;
        this.currentInput = '';
        this.shouldResetScreen = false;
        
        this.updateDisplay();
    }

    compute() {
        if (this.operation === null || this.shouldResetScreen) {
            return;
        }
        
        if (this.currentInput === '') {
            this.currentInput = this.previousInput;
        }
        
        const prev = parseFloat(this.previousInput);
        const current = parseFloat(this.currentInput);
        let computation;
        
        switch (this.operation) {
            case '+':
                computation = prev + current;
                break;
            case '-':
                computation = prev - current;
                break;
            case '*':
                computation = prev * current;
                break;
            case '/':
                if (current === 0) {
                    this.showError('Cannot divide by zero');
                    return;
                }
                computation = prev / current;
                break;
            case '%':
                computation = prev % current;
                break;
            default:
                return;
        }
        
        // Add to history
        this.addToHistory(`${this.previousInput} ${this.operation} ${this.currentInput} = ${computation}`);
        
        this.currentInput = computation.toString();
        this.operation = null;
        this.previousInput = '';
        this.shouldResetScreen = true;
        
        this.updateDisplay();
    }

    clear() {
        this.currentInput = '';
        this.previousInput = '';
        this.operation = null;
        this.shouldResetScreen = false;
        this.updateDisplay();
    }

    backspace() {
        this.currentInput = this.currentInput.toString().slice(0, -1);
        this.updateDisplay();
    }

    percent() {
        const current = parseFloat(this.currentInput);
        if (isNaN(current)) return;
        
        const result = current / 100;
        this.addToHistory(`${current}% = ${result}`);
        this.currentInput = result.toString();
        this.shouldResetScreen = true;
        this.updateDisplay();
    }

    toggleHistory() {
        // Toggle history display if it exists
        if (this.historyDisplay) {
            this.historyDisplay.style.display = 
                this.historyDisplay.style.display === 'none' ? 'block' : 'none';
        }
    }

    // Utility functions
    addToHistory(entry) {
        this.history.unshift(entry);
        if (this.history.length > this.maxHistory) {
            this.history.pop();
        }
        this.updateHistoryDisplay();
    }

    updateHistoryDisplay() {
        if (!this.historyDisplay) return;
        
        this.historyDisplay.innerHTML = this.history.map(entry => 
            `<div class="history-entry">${entry}</div>`
        ).join('');
    }

    updateDisplay() {
        console.log('Calculator Widget: Updating display...');
        console.log('Calculator Widget: Current input:', this.currentInput);
        console.log('Calculator Widget: Previous input:', this.previousInput);
        console.log('Calculator Widget: Operation:', this.operation);
        
        if (this.display) {
            let displayValue = this.currentInput;
            if (this.operation !== null && this.previousInput !== '') {
                displayValue = `${this.previousInput} ${this.operation} ${this.currentInput || '0'}`;
            }
            this.display.textContent = displayValue || '0';
            console.log('Calculator Widget: Updated expression display to:', displayValue || '0');
        } else {
            console.log('Calculator Widget: Expression display element not found');
        }
        
        if (this.resultDisplay) {
            this.resultDisplay.textContent = this.currentInput || '0';
            console.log('Calculator Widget: Updated result display to:', this.currentInput || '0');
        } else {
            console.log('Calculator Widget: Result display element not found');
        }
    }

    updateMemoryIndicator() {
        if (!this.memoryIndicator) return;
        
        if (this.isMemorySet) {
            this.memoryIndicator.textContent = `M: ${this.memory}`;
            this.memoryIndicator.style.display = 'block';
        } else {
            this.memoryIndicator.style.display = 'none';
        }
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
}

// Initialize when DOM is loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.CalculatorWidget = new CalculatorWidget();
    });
} else {
    window.CalculatorWidget = new CalculatorWidget();
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CalculatorWidget;
}
