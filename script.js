class Calculator {
    constructor(historyElement, currentOperandElement) {
        this.historyElement = historyElement;
        this.currentOperandElement = currentOperandElement;
        this.clear();
    }

    // Resets all state variables
    clear() {
        // Now, currentOperand holds the full expression being built
        this.currentOperand = ''; 
        this.previousOperand = '';
        this.operation = undefined;
        this.updateDisplay();
    }

    // Removes the last character from the current operand/expression
    delete() {
        this.currentOperand = this.currentOperand.slice(0, -1);
        this.updateDisplay();
    }

    // Adds numbers, decimals, or parentheses to the current expression
    append(input) {
        // Prevent adding a decimal if the last character is already an operator/decimal
        const lastChar = this.currentOperand.slice(-1);

        // Simple validation for parentheses placement (can be complex, this is basic)
        if (input === '(' && !isNaN(parseFloat(lastChar))) return;
        if (input === ')' && isNaN(parseFloat(lastChar)) && lastChar !== ')') return;

        // Basic check to prevent multiple decimals without a number in between
        if (input === '.' && (lastChar === '.' || isNaN(parseFloat(lastChar)) && lastChar !== ')')) {
            // If the last character is an operator, prepend a '0' before the decimal
            if (lastChar !== '.') {
                this.currentOperand += '0';
            } else {
                return;
            }
        }
        
        this.currentOperand = this.currentOperand.toString() + input.toString();
        this.updateDisplay();
    }
    
    // Choose operation is simplified as operators are handled via append
    chooseOperation(operation) {
        const lastChar = this.currentOperand.slice(-1);
        
        // Prevent double operators
        if (['+', '−', '×', '/'].includes(lastChar)) {
             this.currentOperand = this.currentOperand.slice(0, -1);
        }
        
        // Prevent starting an expression with an operator (except maybe '-')
        if (this.currentOperand === '' && operation !== '−') return;

        this.append(operation);
    }

    // Performs the calculation using JavaScript's built-in evaluator
    compute() {
        let expression = this.currentOperand;
        
        // Replace display symbols with JavaScript-friendly operators
        expression = expression.replace(/×/g, '*').replace(/−/g, '-');

        try {
            // Using a safe Function constructor for evaluation (a simple eval alternative)
            const computation = Function('return ' + expression)();

            if (isNaN(computation) || !isFinite(computation)) {
                 this.currentOperand = 'Error';
            } else {
                // Set history to the full expression
                this.previousOperand = this.currentOperand + ' =';
                
                // Format the result: fix to a max of 4 decimal places and trim trailing zeros
                this.currentOperand = computation.toFixed(4).replace(/\.?0+$/, ''); 
            }
        } catch (e) {
            this.currentOperand = 'Error';
        }
        
        this.operation = undefined;
        this.updateDisplay();
        
        // If the result is 'Error', clear completely after a small delay 
        if (this.currentOperand === 'Error') {
            setTimeout(() => this.clear(), 1500);
        }
    }

    // Updates the DOM elements
    updateDisplay() {
        this.currentOperandElement.innerText = this.currentOperand || '0';
        this.historyElement.innerText = this.previousOperand;
    }
}

// --- Initialization and Event Listeners ---

const historyElement = document.querySelector('[data-testid="history"]');
const currentOperandElement = document.querySelector('[data-testid="current-operand"]');
const calculator = new Calculator(historyElement, currentOperandElement);

// Select all buttons
const numberButtons = document.querySelectorAll('.btn.number');
const operatorButtons = document.querySelectorAll('.btn.operator');
const equalsButton = document.querySelector('.btn.equals');
const clearButton = document.querySelector('.btn.clear');
const deleteButton = document.querySelector('.btn.delete');
const decimalButton = document.querySelector('.btn.decimal');
const parenthesesButtons = document.querySelectorAll('.btn.parentheses');


// 1. Button Click Handlers

// Numbers, Decimal, and Parentheses all use the simpler 'append' function
numberButtons.forEach(button => {
    button.addEventListener('click', () => calculator.append(button.innerText));
});

decimalButton.addEventListener('click', () => calculator.append('.'));

parenthesesButtons.forEach(button => {
    button.addEventListener('click', () => calculator.append(button.innerText));
});

operatorButtons.forEach(button => {
    button.addEventListener('click', () => calculator.chooseOperation(button.innerText));
});

equalsButton.addEventListener('click', () => calculator.compute());
clearButton.addEventListener('click', () => calculator.clear());
deleteButton.addEventListener('click', () => calculator.delete());


// 2. Keyboard Input Handler (UPDATED)
document.addEventListener('keydown', e => {
    const key = e.key;
    
    if (/\d/.test(key)) { // Numbers 0-9
        calculator.append(key);
    } else if (key === '.') { // Decimal
        calculator.append(key);
    } else if (key === '(' || key === ')') { // Parentheses
        calculator.append(key);
    } else if (key === '+' || key === '*' || key === '/') { // Standard Operators
        const displayOperation = {
            '+': '+',
            '*': '×', 
            '/': '/'
        }[key];
        calculator.chooseOperation(displayOperation);
    } else if (key === '-') { // Minus/Subtract
        calculator.chooseOperation('−'); // Use HTML minus symbol
    } else if (key === 'Enter' || key === '=') {
        e.preventDefault(); 
        calculator.compute();
    } else if (key === 'Backspace') { // Delete/Backspace
        calculator.delete();
    } else if (key === 'Escape') { // All Clear (AC)
        calculator.clear();
    }
});