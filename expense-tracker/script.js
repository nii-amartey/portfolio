const STORAGE_KEY = "expenseTrackerTransactions";

const form = document.getElementById("transaction-form");
const descriptionInput = document.getElementById("description");
const amountInput = document.getElementById("amount");
const typeInput = document.getElementById("type");
const categoryInput = document.getElementById("category");
const dateInput = document.getElementById("date");
const formMessage = document.getElementById("form-message");

const balanceEl = document.getElementById("balance");
const incomeEl = document.getElementById("income");
const expensesEl = document.getElementById("expenses");
const transactionList = document.getElementById("transaction-list");
const emptyState = document.getElementById("empty-state");
const clearAllButton = document.getElementById("clear-all");
const chart = document.getElementById("category-chart");

document.getElementById("year").textContent = new Date().getFullYear();

dateInput.value = new Date().toISOString().slice(0, 10);

function getTransactions() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    const transactions = saved ? JSON.parse(saved) : [];
    return Array.isArray(transactions) ? transactions : [];
  } catch {
    return [];
  }
}

function saveTransactions(transactions) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(transactions));
}

function formatCurrency(value) {
  return new Intl.NumberFormat("en-GH", {
    style: "currency",
    currency: "GHS",
    minimumFractionDigits: 2
  }).format(value);
}

function formatDate(dateString) {
  const date = new Date(`${dateString}T00:00:00`);
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  }).format(date);
}


function animateCurrency(element, target) {
  const start = Number(element.dataset.value || 0);
  const duration = 450;
  const startTime = performance.now();

  element.dataset.value = String(target);

  function tick(now) {
    const progress = Math.min((now - startTime) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    const value = start + (target - start) * eased;
    element.textContent = formatCurrency(value);

    if (progress < 1) {
      requestAnimationFrame(tick);
    } else {
      element.textContent = formatCurrency(target);
    }
  }

  requestAnimationFrame(tick);
}

function render() {
  const transactions = getTransactions();

  const income = transactions
    .filter(transaction => transaction.type === "income")
    .reduce((total, transaction) => total + transaction.amount, 0);

  const expenses = transactions
    .filter(transaction => transaction.type === "expense")
    .reduce((total, transaction) => total + transaction.amount, 0);

  const balance = income - expenses;
  animateCurrency(balanceEl, balance);
  animateCurrency(incomeEl, income);
  animateCurrency(expensesEl, expenses);

  transactionList.innerHTML = "";

  if (transactions.length === 0) {
    emptyState.hidden = false;
  } else {
    emptyState.hidden = true;
  }

  [...transactions].reverse().forEach(transaction => {
    const row = document.createElement("tr");

    const description = document.createElement("td");
    description.textContent = transaction.description;

    const category = document.createElement("td");
    category.textContent = transaction.category;

    const date = document.createElement("td");
    date.textContent = formatDate(transaction.date);

    const type = document.createElement("td");
    type.textContent = transaction.type === "income" ? "Income" : "Expense";

    const amount = document.createElement("td");
    amount.className = `amount ${transaction.type}`;
    amount.textContent = `${transaction.type === "income" ? "+" : "-"}${formatCurrency(transaction.amount)}`;

    const actionCell = document.createElement("td");
    const deleteButton = document.createElement("button");
    deleteButton.className = "delete-button";
    deleteButton.type = "button";
    deleteButton.textContent = "Delete";
    deleteButton.dataset.id = transaction.id;
    actionCell.appendChild(deleteButton);

    row.append(description, category, date, type, amount, actionCell);
    transactionList.appendChild(row);
  });

  renderChart(transactions);
}

function renderChart(transactions) {
  chart.innerHTML = "";

  const totals = {};

  transactions
    .filter(transaction => transaction.type === "expense")
    .forEach(transaction => {
      totals[transaction.category] = (totals[transaction.category] || 0) + transaction.amount;
    });

  const entries = Object.entries(totals).sort((a, b) => b[1] - a[1]);

  if (entries.length === 0) {
    const message = document.createElement("p");
    message.className = "no-chart-data";
    message.textContent = "Add an expense to see the category breakdown.";
    chart.appendChild(message);
    return;
  }

  const maximum = entries[0][1];

  entries.forEach(([category, total]) => {
    const row = document.createElement("div");
    row.className = "chart-row";

    const label = document.createElement("div");
    label.className = "chart-label";

    const categoryName = document.createElement("span");
    categoryName.textContent = category;

    const amount = document.createElement("span");
    amount.textContent = formatCurrency(total);

    label.append(categoryName, amount);

    const track = document.createElement("div");
    track.className = "chart-track";

    const bar = document.createElement("div");
    bar.className = "chart-bar";
    bar.style.width = `${(total / maximum) * 100}%`;

    track.appendChild(bar);
    row.append(label, track);
    chart.appendChild(row);
  });
}

form.addEventListener("submit", event => {
  event.preventDefault();

  const description = descriptionInput.value.trim();
  const amount = Number(amountInput.value);

  if (!description || !Number.isFinite(amount) || amount <= 0 || !dateInput.value) {
    formMessage.textContent = "Please enter a description, a valid amount, and a date.";
    return;
  }

  const transactions = getTransactions();

  transactions.push({
    id: crypto.randomUUID(),
    description,
    amount,
    type: typeInput.value,
    category: categoryInput.value,
    date: dateInput.value
  });

  saveTransactions(transactions);
  form.reset();
  dateInput.value = new Date().toISOString().slice(0, 10);
  typeInput.value = "expense";
  formMessage.textContent = "Transaction added.";
  render();
  form.classList.add("transaction-added");
  setTimeout(() => form.classList.remove("transaction-added"), 500);
  descriptionInput.focus();
});

transactionList.addEventListener("click", event => {
  const button = event.target.closest(".delete-button");
  if (!button) return;

  const id = button.dataset.id;
  const transactions = getTransactions().filter(transaction => transaction.id !== id);
  saveTransactions(transactions);
  render();
});

clearAllButton.addEventListener("click", () => {
  const transactions = getTransactions();

  if (transactions.length === 0) {
    formMessage.textContent = "There are no transactions to clear.";
    return;
  }

  const confirmed = window.confirm("Clear all transactions? This cannot be undone.");
  if (!confirmed) return;

  localStorage.removeItem(STORAGE_KEY);
  formMessage.textContent = "All transactions cleared.";
  render();
});

render();
