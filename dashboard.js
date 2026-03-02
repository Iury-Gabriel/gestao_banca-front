const API_URL = 'http://localhost:3000/api';
let userData = null;
let profitChart = null;

// Auth Check
const token = localStorage.getItem('token');
if (!token) {
    window.location.href = 'index.html';
}

// DOM Elements
const currentBankrollText = document.getElementById('current-bankroll');
const stakeValueText = document.getElementById('stake-value');
const stopWinValueText = document.getElementById('stop-win-value');
const stopLossValueText = document.getElementById('stop-loss-value');
const currentDayText = document.getElementById('current-day');
const dailyPercText = document.getElementById('daily-perc');
const historyBody = document.getElementById('history-body');

// Modals
const modalResult = document.getElementById('modal-result');
const modalSettings = document.getElementById('modal-settings');

// Headers for API
const getHeaders = () => ({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${localStorage.getItem('token')}`
});

// Toast utility
function showToast(message, type = 'success') {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `<span>${type === 'success' ? '✅' : '❌'}</span><span>${message}</span>`;
    container.appendChild(toast);
    setTimeout(() => {
        toast.classList.add('fade-out');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// Format Date Utility
function formatDate(isoString) {
    if (!isoString) return '-';
    const d = new Date(isoString);
    return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

// Initialize Dashboard
async function initDashboard() {
    await loadInitialData();
    initChart();
    await loadHistory();
}

async function loadInitialData() {
    try {
        const [settingsRes, bankrollRes] = await Promise.all([
            fetch(`${API_URL}/settings`, { headers: getHeaders() }),
            fetch(`${API_URL}/bankroll`, { headers: getHeaders() })
        ]);

        if (settingsRes.status === 401) {
            localStorage.clear();
            window.location.href = 'index.html';
            return;
        }

        const settings = await settingsRes.json();
        const bankroll = await bankrollRes.json();

        userData = {
            currentBankroll: bankroll.current_balance,
            dailyPercentage: settings.entry_percent,
            stopWinPercentage: settings.daily_goal_percent,
            stopLossPercentage: settings.stop_loss_percent,
            currentDay: '-' // We can calculate this or add a field if needed
        };

        updateUI();
    } catch (e) {
        console.error("Error loading dashboard data:", e);
    }
}

async function loadHistory() {
    try {
        const response = await fetch(`${API_URL}/bankroll/history`, { headers: getHeaders() });
        const history = await response.json();

        historyBody.innerHTML = '';
        history.forEach((item) => {
            const row = document.createElement('tr');
            const statusClass = item.amount >= 0 ? 'profit' : 'loss';
            row.innerHTML = `
                <td>#</td>
                <td>R$ ${item.balance_before.toFixed(2)}</td>
                <td class="${statusClass}">R$ ${item.amount.toFixed(2)}</td>
                <td class="${statusClass}">${item.type}</td>
                <td style="font-size: 0.75rem; color: var(--text-secondary);">${formatDate(item.created_at)}</td>
            `;
            historyBody.appendChild(row);
        });

        updateChart([...history].reverse());
    } catch (e) {
        console.error("Error loading history:", e);
    }
}

function updateUI() {
    if (!userData) return;

    const current = userData.currentBankroll;
    const stake = current * (userData.dailyPercentage / 100);
    const stopWin = current * (userData.stopWinPercentage / 100);
    const stopLoss = current * (userData.stopLossPercentage / 100);

    currentBankrollText.innerText = `R$ ${current.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
    stakeValueText.innerText = `R$ ${stake.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
    stopWinValueText.innerText = `R$ ${stopWin.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
    stopLossValueText.innerText = `R$ ${stopLoss.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
    dailyPercText.innerText = userData.dailyPercentage;

    document.getElementById('set-daily').value = userData.dailyPercentage;
    document.getElementById('set-win').value = userData.stopWinPercentage;
    document.getElementById('set-loss').value = userData.stopLossPercentage;
}

// Chart Logic
function initChart() {
    const ctx = document.getElementById('profitChart').getContext('2d');
    if (profitChart) profitChart.destroy();
    profitChart = new Chart(ctx, {
        type: 'line',
        data: { labels: [], datasets: [{ label: 'Banca (R$)', data: [], borderColor: '#3B82F6', backgroundColor: 'rgba(59, 130, 246, 0.1)', fill: true, tension: 0.4 }] },
        options: { responsive: true, maintainAspectRatio: false, scales: { y: { ticks: { callback: v => 'R$ ' + v } } } }
    });
}

function updateChart(historyData) {
    if (!profitChart) return;
    const labels = historyData.map((_, i) => `Op ${i + 1}`);
    const data = historyData.map(item => item.balance_after);
    if (historyData.length > 0) {
        labels.unshift('Início');
        data.unshift(historyData[0].balance_before);
    }
    profitChart.data.labels = labels;
    profitChart.data.datasets[0].data = data;
    profitChart.update();
}

async function saveResult(type, amount) {
    try {
        const response = await fetch(`${API_URL}/bankroll/event`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify({ type, amount })
        });
        if (!response.ok) throw new Error('Erro ao salvar resultado');
        showToast('Resultado salvo!', 'success');
        setTimeout(() => location.reload(), 1000);
    } catch (error) {
        showToast(error.message, 'error');
    }
}

// Event Listeners
document.getElementById('hit-stop-win').addEventListener('click', () => {
    const amount = userData.currentBankroll * (userData.stopWinPercentage / 100);
    saveResult('WIN', amount);
});

document.getElementById('hit-stop-loss').addEventListener('click', () => {
    const amount = -(userData.currentBankroll * (userData.stopLossPercentage / 100));
    saveResult('LOSS', amount);
});

document.getElementById('save-manual').addEventListener('click', () => {
    const val = parseFloat(document.getElementById('manual-value').value);
    if (isNaN(val)) return showToast("Insira um valor.", "error");
    saveResult('MANUAL', val);
});

document.getElementById('open-manual').addEventListener('click', () => {
    modalResult.classList.add('active');
});

document.getElementById('open-settings').addEventListener('click', () => {
    modalSettings.classList.add('active');
});

document.getElementById('save-settings').addEventListener('click', async () => {
    const daily = parseFloat(document.getElementById('set-daily').value);
    const win = parseFloat(document.getElementById('set-win').value);
    const loss = parseFloat(document.getElementById('set-loss').value);
    try {
        const response = await fetch(`${API_URL}/settings`, {
            method: 'PUT',
            headers: getHeaders(),
            body: JSON.stringify({ entry_percent: daily, daily_goal_percent: win, stop_loss_percent: loss })
        });
        if (!response.ok) throw new Error('Erro ao salvar');
        showToast("Configurações salvas!", "success");
        setTimeout(() => location.reload(), 1000);
    } catch (e) {
        showToast(e.message, "error");
    }
});

document.getElementById('logout-btn').addEventListener('click', () => {
    localStorage.clear();
    location.reload();
});

// Tab Switching
document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        const target = btn.getAttribute('data-target');
        document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        document.querySelectorAll('.view-section').forEach(s => {
            s.classList.remove('active');
            if (s.id === target) s.classList.add('active');
        });
    });
});

initDashboard();
