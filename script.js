document.addEventListener('DOMContentLoaded', function() {
    const hamburgerMenu = document.querySelector('.hamburger-menu');
    const sidebar = document.querySelector('.sidebar');
    const addNewBtn = document.getElementById('add-transaction-btn');
    const transactionHistory = document.querySelector('#transaction-history');
    const graphContainer = document.querySelector('.graph');

    const expenses = {
        "Food & Drinks": 0,
        "Bills & Payments": 0,
        "Entertainment": 0,
        "Medical": 0,
        "Other": 0
    };

    let allTransactions = [];
    let expenseChart;

    const updateExpense = (category, amount) => {
        expenses[category] += amount;
        document.getElementById(category.toLowerCase().replace(/ & /g, '-')).textContent = `₹ ${expenses[category]}`;
    };

    const addTransaction = (category, amount, date) => {
        const li = document.createElement('li');
        li.textContent = `${date} - ${category}: ₹${amount}`;
        transactionHistory.appendChild(li);
        allTransactions.push({ category, amount, date: new Date(date) });
    };

    addNewBtn.addEventListener('click', function() {
        const category = document.getElementById('transaction-category').value;
        const amount = parseFloat(document.getElementById('transaction-amount').value);
        const date = document.getElementById('transaction-date').value || new Date().toLocaleDateString('en-CA');
        if (category && !isNaN(amount) && amount > 0 && date) {
            updateExpense(category, amount);
            addTransaction(category, amount, date);
            updateGraph();
        } else {
            alert("Invalid input. Please enter a valid category, amount, and date.");
        }
    });

    hamburgerMenu.addEventListener('click', function() {
        sidebar.classList.toggle('visible');
    });

    const updateGraph = (filteredTransactions = allTransactions, range = 'Today') => {
        const expenseData = {
            "Food & Drinks": 0,
            "Bills & Payments": 0,
            "Entertainment": 0,
            "Medical": 0,
            "Other": 0
        };

        filteredTransactions.forEach(transaction => {
            expenseData[transaction.category] += transaction.amount;
        });

        const categories = Object.keys(expenseData);
        const expenseValues = Object.values(expenseData);

        if (expenseChart) {
            expenseChart.destroy();
        }

        const ctx = document.getElementById('expense-chart').getContext('2d');
        
        let labels, datasets;
        
        switch(range) {
            case 'Week':
                labels = getLastNDays(7);
                datasets = getDatasetForWeek(labels, filteredTransactions);
                break;
            case '1 Month':
                labels = getDaysInCurrentMonth();
                datasets = getDatasetForDays(labels, filteredTransactions);
                break;
            case 'Year':
                labels = getLastNMonths(12);
                datasets = getDatasetForMonths(labels, filteredTransactions);
                break;
            default:
                labels = categories;
                datasets = [{
                    label: 'Expenses',
                    data: expenseValues,
                    backgroundColor: [
                        'rgba(255, 99, 132, 0.5)',
                        'rgba(54, 162, 235, 0.5)',
                        'rgba(255, 206, 86, 0.5)',
                        'rgba(75, 192, 192, 0.5)',
                        'rgba(153, 102, 255, 0.5)',
                    ],
                    borderColor: [
                        'rgba(255, 99, 132, 1)',
                        'rgba(54, 162, 235, 1)',
                        'rgba(255, 206, 86, 1)',
                        'rgba(75, 192, 192, 1)',
                        'rgba(153, 102, 255, 1)',
                    ],
                    borderWidth: 1
                }];
        }

        expenseChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: datasets
            },
            options: {
                plugins: {
                    legend: {
                        display: true
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
    };

    const dateRangeButtons = document.querySelectorAll('.date-range-selection button');

    dateRangeButtons.forEach(button => {
        button.addEventListener('click', function() {
            const range = this.textContent;
            filterTransactions(range);
        });
    });

    function filterTransactions(range) {
        const now = new Date();
        let startDate, endDate;

        switch (range) {
            case '1 Week':
                startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7);
                updateGraph(allTransactions.filter(transaction => transaction.date >= startDate), 'Week');
                break;
            case '1 Month':
                startDate = new Date(now.getFullYear(), now.getMonth(), 1);
                endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
                updateGraph(allTransactions.filter(transaction => transaction.date >= startDate && transaction.date <= endDate), '1 Month');
                break;
            case '1 Year':
                startDate = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
                updateGraph(allTransactions.filter(transaction => transaction.date >= startDate), 'Year');
                break;
            default:
                updateGraph();
        }
    }

    document.querySelector('.show-today-btn').addEventListener('click', function() {
        const today = new Date().toLocaleDateString('en-CA');
        const todaysTransactions = allTransactions.filter(transaction => transaction.date.toLocaleDateString('en-CA') === today);
        alert(todaysTransactions.length > 0 ? todaysTransactions.map(t => `${t.date.toLocaleDateString('en-CA')} - ${t.category}: ₹${t.amount}`).join('\n') : "No transactions for today.");
    });

    updateGraph();

    function getLastNDays(n) {
        const dates = [];
        for (let i = 0; i < n; i++) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            dates.unshift(date.toLocaleDateString('en-CA'));
        }
        return dates;
    }

    function getDaysInCurrentMonth() {
        const dates = [];
        const now = new Date();
        const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
        for (let i = 1; i <= daysInMonth; i++) {
            dates.push(new Date(now.getFullYear(), now.getMonth(), i).toLocaleDateString('en-CA'));
        }
        return dates;
    }

    function getLastNMonths(n, includeNextMonth = false) {
        const months = [];
        const now = new Date();
        for (let i = n - 1; i >= 0; i--) {
            const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
            months.push(date.toLocaleString('default', { month: 'short' }));
        }
        if (includeNextMonth) {
            const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
            months.push(nextMonth.toLocaleString('default', { month: 'short' }));
        }
        return months;
    }

    function getDatasetForWeek(dates, transactions) {
        const datasets = [];
        const categories = ["Food & Drinks", "Bills & Payments", "Entertainment", "Medical", "Other"];
        categories.forEach(category => {
            const data = dates.map(date => {
                const dailyTotal = transactions
                    .filter(t => t.category === category && t.date.toLocaleDateString('en-CA') === date)
                    .reduce((sum, t) => sum + t.amount, 0);
                return dailyTotal;
            });
            datasets.push({
                label: category,
                data: data,
                backgroundColor: getCategoryColor(category),
                borderColor: getCategoryBorderColor(category),
                borderWidth: 1
            });
        });
        return datasets;
    }

    function getDatasetForDays(dates, transactions) {
        const datasets = [];
        const categories = ["Food & Drinks", "Bills & Payments", "Entertainment", "Medical", "Other"];
        categories.forEach(category => {
            const data = dates.map(date => {
                const dailyTotal = transactions
                    .filter(t => t.category === category && t.date.toLocaleDateString('en-CA') === date)
                    .reduce((sum, t) => sum + t.amount, 0);
                return dailyTotal;
            });
            datasets.push({
                label: category,
                data: data,
                backgroundColor: getCategoryColor(category),
                borderColor: getCategoryBorderColor(category),
                borderWidth: 1
            });
        });
        return datasets;
    }

    function getDatasetForMonths(months, transactions) {
        const datasets = [];
        const categories = ["Food & Drinks", "Bills & Payments", "Entertainment", "Medical", "Other"];
        categories.forEach(category => {
            const data = months.map(month => {
                const monthlyTotal = transactions
                    .filter(t => t.category === category && t.date.toLocaleString('default', { month: 'short' }) === month)
                    .reduce((sum, t) => sum + t.amount, 0);
                return monthlyTotal;
            });
            datasets.push({
                label: category,
                data: data,
                backgroundColor: getCategoryColor(category),
                borderColor: getCategoryBorderColor(category),
                borderWidth: 1
            });
        });
        return datasets;
    }

    function getCategoryColor(category) {
        const colors = {
            "Food & Drinks": 'rgba(255, 99, 132, 0.5)',
            "Bills & Payments": 'rgba(54, 162, 235, 0.5)',
            "Entertainment": 'rgba(255, 206, 86, 0.5)',
            "Medical": 'rgba(75, 192, 192, 0.5)',
            "Other": 'rgba(153, 102, 255, 0.5)'
        };
        return colors[category];
    }

    function getCategoryBorderColor(category) {
        const colors = {
            "Food & Drinks": 'rgba(255, 99, 132, 1)',
            "Bills & Payments": 'rgba(54, 162, 235, 1)',
            "Entertainment": 'rgba(255, 206, 86, 1)',
            "Medical": 'rgba(75, 192, 192, 1)',
            "Other": 'rgba(153, 102, 255, 1)'
        };
        return colors[category];
    }
});
