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
        this.display = document.getElementById('calc-display');
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
        this.setupEventListeners();
        this.updateDisplay();
        this.updateMemoryIndicator();
        console.log('Calculator Widget initialized successfully');
    }

    setupEventListeners() {
        // Number buttons
        for (let i = 0; i <= 9; i++) {
            const btn = document.getElementById(`calc-${i}`);
            if (btn) {
                btn.addEventListener('click', () => this.appendNumber(i.toString()));
            }
        }

        // Decimal point
        const decimalBtn = document.getElementById('calc-decimal');
        if (decimalBtn) {
            decimalBtn.addEventListener('click', () => this.appendDecimal());
        }

        // Basic operations
        const operations = {
            'calc-add': '+',
            'calc-subtract': '-',
            'calc-multiply': '*',
            'calc-divide': '/',
            'calc-modulo': '%'
        };

        Object.entries(operations).forEach(([id, operation]) => {
            const btn = document.getElementById(id);
            if (btn) {
                btn.addEventListener('click', () => this.chooseOperation(operation));
            }
        });

        // Equals
        const equalsBtn = document.getElementById('calc-equals');
        if (equalsBtn) {
            equalsBtn.addEventListener('click', () => this.compute());
        }

        // Clear
        const clearBtn = document.getElementById('calc-clear');
        if (clearBtn) {
            clearBtn.addEventListener('click', () => this.clear());
        }

        // Clear entry
        const clearEntryBtn = document.getElementById('calc-clear-entry');
        if (clearEntryBtn) {
            clearEntryBtn.addEventListener('click', () => this.clearEntry());
        }

        // Backspace
        const backspaceBtn = document.getElementById('calc-backspace');
        if (backspaceBtn) {
            backspaceBtn.addEventListener('click', () => this.backspace());
        }

        // Memory functions
        const memoryFunctions = {
            'calc-memory-clear': () => this.memoryClear(),
            'calc-memory-recall': () => this.memoryRecall(),
            'calc-memory-add': () => this.memoryAdd(),
            'calc-memory-subtract': () => this.memorySubtract(),
            'calc-memory-store': () => this.memoryStore()
        };

        Object.entries(memoryFunctions).forEach(([id, func]) => {
            const btn = document.getElementById(id);
            if (btn) {
                btn.addEventListener('click', func);
            }
        });

        // Scientific functions
        const scientificFunctions = {
            'calc-sin': () => this.scientificFunction('sin'),
            'calc-cos': () => this.scientificFunction('cos'),
            'calc-tan': () => this.scientificFunction('tan'),
            'calc-asin': () => this.scientificFunction('asin'),
            'calc-acos': () => this.scientificFunction('acos'),
            'calc-atan': () => this.scientificFunction('atan'),
            'calc-log': () => this.scientificFunction('log'),
            'calc-ln': () => this.scientificFunction('ln'),
            'calc-sqrt': () => this.scientificFunction('sqrt'),
            'calc-square': () => this.scientificFunction('square'),
            'calc-cube': () => this.scientificFunction('cube'),
            'calc-factorial': () => this.scientificFunction('factorial'),
            'calc-exp': () => this.scientificFunction('exp'),
            'calc-pi': () => this.scientificFunction('pi'),
            'calc-e': () => this.scientificFunction('e'),
            'calc-abs': () => this.scientificFunction('abs'),
            'calc-floor': () => this.scientificFunction('floor'),
            'calc-ceil': () => this.scientificFunction('ceil'),
            'calc-round': () => this.scientificFunction('round')
        };

        Object.entries(scientificFunctions).forEach(([id, func]) => {
            const btn = document.getElementById(id);
            if (btn) {
                btn.addEventListener('click', func);
            }
        });

        // Additional functions
        const additionalFunctions = {
            'calc-percent': () => this.percent(),
            'calc-plus-minus': () => this.plusMinus(),
            'calc-reciprocal': () => this.reciprocal(),
            'calc-power': () => this.power(),
            'calc-root': () => this.root()
        };

        Object.entries(additionalFunctions).forEach(([id, func]) => {
            const btn = document.getElementById(id);
            if (btn) {
                btn.addEventListener('click', func);
            }
        });

        // Keyboard support
        document.addEventListener('keydown', (e) => {
            this.handleKeyboardInput(e);
        });
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
        // Memory functions
        else if (key === 'm' || key === 'M') {
            e.preventDefault();
            if (e.ctrlKey) {
                this.memoryStore();
            } else {
                this.memoryRecall();
            }
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

    clearEntry() {
        this.currentInput = '';
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

    plusMinus() {
        if (this.currentInput === '') return;
        
        const current = parseFloat(this.currentInput);
        if (isNaN(current)) return;
        
        this.currentInput = (-current).toString();
        this.updateDisplay();
    }

    reciprocal() {
        const current = parseFloat(this.currentInput);
        if (isNaN(current) || current === 0) {
            this.showError('Cannot divide by zero');
            return;
        }
        
        const result = 1 / current;
        this.addToHistory(`1/${current} = ${result}`);
        this.currentInput = result.toString();
        this.shouldResetScreen = true;
        this.updateDisplay();
    }

    power() {
        const current = parseFloat(this.currentInput);
        if (isNaN(current)) return;
        
        const result = Math.pow(current, 2);
        this.addToHistory(`${current}² = ${result}`);
        this.currentInput = result.toString();
        this.shouldResetScreen = true;
        this.updateDisplay();
    }

    root() {
        const current = parseFloat(this.currentInput);
        if (isNaN(current) || current < 0) {
            this.showError('Cannot calculate square root of negative number');
            return;
        }
        
        const result = Math.sqrt(current);
        this.addToHistory(`√${current} = ${result}`);
        this.currentInput = result.toString();
        this.shouldResetScreen = true;
                this.updateDisplay();
    }

    scientificFunction(funcName) {
        const current = parseFloat(this.currentInput);
        if (isNaN(current)) return;
        
        try {
            let result;
            if (funcName === 'pi') {
                result = this.scientificFunctions.pi();
                this.addToHistory(`π = ${result}`);
            } else if (funcName === 'e') {
                result = this.scientificFunctions.e();
                this.addToHistory(`e = ${result}`);
            } else {
                result = this.scientificFunctions[funcName](current);
                this.addToHistory(`${funcName}(${current}) = ${result}`);
            }
            
            this.currentInput = result.toString();
            this.shouldResetScreen = true;
            this.updateDisplay();
        } catch (error) {
            this.showError(`Error calculating ${funcName}`);
        }
    }

    // Memory functions
    memoryClear() {
        this.memory = 0;
        this.isMemorySet = false;
        this.updateMemoryIndicator();
        this.showNotification('Memory cleared', 'info');
    }

    memoryRecall() {
        if (this.isMemorySet) {
            this.currentInput = this.memory.toString();
            this.shouldResetScreen = true;
            this.updateDisplay();
            this.showNotification('Memory recalled', 'info');
        }
    }

    memoryAdd() {
        const current = parseFloat(this.currentInput);
        if (isNaN(current)) return;
        
        this.memory += current;
        this.isMemorySet = true;
        this.updateMemoryIndicator();
        this.showNotification('Added to memory', 'info');
    }

    memorySubtract() {
        const current = parseFloat(this.currentInput);
        if (isNaN(current)) return;
        
        this.memory -= current;
        this.isMemorySet = true;
        this.updateMemoryIndicator();
        this.showNotification('Subtracted from memory', 'info');
    }

    memoryStore() {
        const current = parseFloat(this.currentInput);
        if (isNaN(current)) return;
        
        this.memory = current;
        this.isMemorySet = true;
        this.updateMemoryIndicator();
        this.showNotification('Stored in memory', 'info');
    }

    // Utility functions
    toRadians(degrees) {
        return degrees * (Math.PI / 180);
    }

    toDegrees(radians) {
        return radians * (180 / Math.PI);
    }

    factorial(n) {
        if (n < 0 || !Number.isInteger(n)) {
            throw new Error('Factorial is only defined for non-negative integers');
        }
        if (n === 0 || n === 1) return 1;
        let result = 1;
        for (let i = 2; i <= n; i++) {
            result *= i;
        }
        return result;
    }

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
        if (this.display) {
            this.display.textContent = this.currentInput || '0';
        }
        
        if (this.resultDisplay) {
            let displayValue = this.currentInput;
            if (this.operation !== null && this.previousInput !== '') {
                displayValue = `${this.previousInput} ${this.operation} ${this.currentInput || '0'}`;
            }
            this.resultDisplay.textContent = displayValue || '0';
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
