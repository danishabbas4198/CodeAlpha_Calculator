const currentEl = document.getElementById('current');
const historyEl = document.getElementById('history');

const SYMBOLS = { '+': '+', '-': '−', '*': '×', '/': '÷' };

let current = '0';
let previous = null;
let operator = null;
let overwrite = false;
let hasError = false;

function updateDisplay() {
  currentEl.textContent = current;
  currentEl.classList.toggle('small', current.length > 10);
  historyEl.textContent =
    previous !== null && operator ? `${previous} ${SYMBOLS[operator]}` : historyEl.textContent;
}

function compute(a, b, op) {
  const x = parseFloat(a);
  const y = parseFloat(b);
  let result;
  switch (op) {
    case '+': result = x + y; break;
    case '-': result = x - y; break;
    case '*': result = x * y; break;
    case '/':
      if (y === 0) return null;
      result = x / y;
      break;
  }
  return String(parseFloat(result.toFixed(10)));
}

function showError(message) {
  current = message;
  previous = null;
  operator = null;
  hasError = true;
  historyEl.textContent = '';
  updateDisplay();
}

function clearAll() {
  current = '0';
  previous = null;
  operator = null;
  overwrite = false;
  hasError = false;
  historyEl.textContent = '';
  updateDisplay();
}

function guardError() {
  if (hasError) clearAll();
}

function appendDigit(d) {
  guardError();
  if (overwrite) {
    current = d;
    overwrite = false;
  } else if (current.replace(/[-.]/g, '').length < 15) {
    current = current === '0' ? d : current + d;
  }
  updateDisplay();
}

function appendDot() {
  guardError();
  if (overwrite) {
    current = '0.';
    overwrite = false;
  } else if (!current.includes('.')) {
    current += '.';
  }
  updateDisplay();
}

function chooseOperator(op) {
  guardError();
  // Pressing two operators in a row just swaps the operator
  if (operator && overwrite) {
    operator = op;
    historyEl.textContent = `${previous} ${SYMBOLS[op]}`;
    return;
  }
  // Chain calculations: 2 + 3 × ... computes 2 + 3 first
  if (operator && previous !== null) {
    const result = compute(previous, current, operator);
    if (result === null) return showError('Cannot divide by 0');
    current = result;
  }
  previous = current;
  operator = op;
  overwrite = true;
  historyEl.textContent = `${previous} ${SYMBOLS[op]}`;
  updateDisplay();
}

function equals() {
  if (hasError || !operator || previous === null) return;
  const result = compute(previous, current, operator);
  if (result === null) return showError('Cannot divide by 0');
  historyEl.textContent = `${previous} ${SYMBOLS[operator]} ${current} =`;
  current = result;
  previous = null;
  operator = null;
  overwrite = true;
  updateDisplay();
}

function deleteLast() {
  if (hasError) return clearAll();
  if (overwrite) return;
  current = current.length > 1 && current !== '-0' ? current.slice(0, -1) : '0';
  if (current === '-') current = '0';
  updateDisplay();
}

function percent() {
  if (hasError) return;
  current = String(parseFloat((parseFloat(current) / 100).toFixed(10)));
  updateDisplay();
}

function negate() {
  if (hasError || current === '0') return;
  current = current.startsWith('-') ? current.slice(1) : '-' + current;
  updateDisplay();
}

// Mouse / touch
document.querySelector('.keys').addEventListener('click', (e) => {
  const btn = e.target.closest('button');
  if (!btn) return;
  const { action, value } = btn.dataset;
  switch (action) {
    case 'digit': appendDigit(value); break;
    case 'dot': appendDot(); break;
    case 'operator': chooseOperator(value); break;
    case 'equals': equals(); break;
    case 'clear': clearAll(); break;
    case 'delete': deleteLast(); break;
    case 'percent': percent(); break;
    case 'negate': negate(); break;
  }
});

// Keyboard support
function flash(selector) {
  const btn = document.querySelector(selector);
  if (!btn) return;
  btn.classList.add('pressed');
  setTimeout(() => btn.classList.remove('pressed'), 120);
}

document.addEventListener('keydown', (e) => {
  const k = e.key;

  if (/^[0-9]$/.test(k)) {
    appendDigit(k);
    flash(`[data-action="digit"][data-value="${k}"]`);
  } else if (k === '.') {
    appendDot();
    flash('[data-action="dot"]');
  } else if (['+', '-', '*', '/'].includes(k)) {
    e.preventDefault(); // stops browser quick-find on "/"
    chooseOperator(k);
    flash(`[data-action="operator"][data-value="${k}"]`);
  } else if (k === 'Enter' || k === '=') {
    e.preventDefault();
    equals();
    flash('[data-action="equals"]');
  } else if (k === 'Backspace') {
    deleteLast();
    flash('[data-action="delete"]');
  } else if (k === 'Escape' || k === 'Delete') {
    clearAll();
    flash('[data-action="clear"]');
  } else if (k === '%') {
    percent();
    flash('[data-action="percent"]');
  }
});

updateDisplay();