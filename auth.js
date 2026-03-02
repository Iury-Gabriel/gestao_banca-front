const API_URL = 'http://localhost:3000/api';

// Toast utility
function showToast(message, type = 'success') {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `
        <span>${type === 'success' ? '✅' : '❌'}</span>
        <span>${message}</span>
    `;
    container.appendChild(toast);
    setTimeout(() => {
        toast.classList.add('fade-out');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// DOM Elements
const loginCard = document.getElementById('login-card');
const registerCard = document.getElementById('register-card');
const showRegister = document.getElementById('show-register');
const showLogin = document.getElementById('show-login');
const loginForm = document.getElementById('login-form');
const registerForm = document.getElementById('register-form');

if (showRegister) {
    showRegister.addEventListener('click', () => {
        loginCard.classList.add('hidden');
        registerCard.classList.remove('hidden');
    });
}

if (showLogin) {
    showLogin.addEventListener('click', () => {
        registerCard.classList.add('hidden');
        loginCard.classList.remove('hidden');
    });
}

// Check if user is already logged in
const token = localStorage.getItem('token');
if (token && window.location.pathname.includes('index.html')) {
    window.location.href = 'dashboard.html';
}

// Login Logic
if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;

        try {
            const response = await fetch(`${API_URL}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.error || 'Erro ao entrar');

            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));
            showToast('Login realizado com sucesso!', 'success');
            setTimeout(() => window.location.href = 'dashboard.html', 1000);
        } catch (error) {
            showToast(error.message, 'error');
        }
    });
}

// Register Logic
if (registerForm) {
    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const name = document.getElementById('reg-name')?.value || 'Usuário'; // Added check for name
        const email = document.getElementById('reg-email').value;
        const password = document.getElementById('reg-password').value;
        const initialBankroll = parseFloat(document.getElementById('reg-bankroll').value);

        if (isNaN(initialBankroll) || initialBankroll <= 0) {
            showToast('Por favor, insira uma banca inicial válida.', 'error');
            return;
        }

        try {
            const response = await fetch(`${API_URL}/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email, password, initialBankroll })
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.error || 'Erro ao cadastrar');

            showToast('Conta criada com sucesso! Faça login para continuar.', 'success');
            setTimeout(() => location.reload(), 1500);
        } catch (error) {
            showToast(error.message, 'error');
        }
    });
}
