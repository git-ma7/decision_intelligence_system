/**
 * Module 4.1: Popup Logic
 * Handles UI interactions and communication with Service Worker.
 */

// DOM Elements
const views = {
    loading: document.getElementById('loading-view'),
    login: document.getElementById('login-view'),
    authenticated: document.getElementById('authenticated-view')
};

const loginForm = document.getElementById('login-form');
const logoutBtn = document.getElementById('logout-btn');
const usernameInput = document.getElementById('username');
const passwordInput = document.getElementById('password');

const display = {
    user: document.getElementById('user-display'),
    session: document.getElementById('session-display')
};

// Initialize
document.addEventListener('DOMContentLoaded', async () => {
    await checkAuthStatus();
});

// Event Listeners
loginForm.addEventListener('submit', handleLogin);
logoutBtn.addEventListener('click', handleLogout);

/**
 * Check initial authentication status
 */
async function checkAuthStatus() {
    showView('loading');

    try {
        const response = await sendMessage('GET_AUTH_STATUS');

        if (response && response.authenticated) {
            updateAuthenticatedUI(response);
            showView('authenticated');
        } else {
            showView('login');
        }
    } catch (error) {
        console.error('Failed to get auth status:', error);
        showView('login'); // Default to login on error
    }
}

/**
 * Handle Login Form Submission
 */
async function handleLogin(e) {
    e.preventDefault();

    const username = usernameInput.value.trim();
    const password = passwordInput.value.trim();

    if (!username || !password) return;

    // Show loading state on button? For now just simple
    const btn = loginForm.querySelector('button');
    const originalText = btn.textContent;
    btn.textContent = 'Verifying... ⏳';
    btn.disabled = true;

    try {
        const response = await sendMessage('LOGIN', { username, password });

        if (response.success) {
            // Re-fetch status to get full session details
            await checkAuthStatus();
        } else {
            alert('Login Failed: ' + (response.error || 'Unknown error'));
        }
    } catch (error) {
        alert('System Error: ' + error.message);
    } finally {
        btn.textContent = originalText;
        btn.disabled = false;
    }
}

/**
 * Handle Logout
 */
async function handleLogout() {
    try {
        const response = await sendMessage('LOGOUT');
        if (response.success) {
            showView('login');
            // Clear form
            usernameInput.value = '';
            passwordInput.value = '';
        }
    } catch (error) {
        console.error('Logout failed:', error);
    }
}

/**
 * Update UI with user data
 */
function updateAuthenticatedUI(data) {
    display.user.textContent = data.userId || 'Unknown';
    // mess with session ID to make it shorter for display if needed
    const sessId = data.sessionId || 'None';
    display.session.textContent = sessId.replace('sess-', '#');
}

/**
 * Switch visible view
 */
function showView(viewName) {
    Object.values(views).forEach(el => el.classList.add('hidden'));
    if (views[viewName]) {
        views[viewName].classList.remove('hidden');
    }
}

/**
 * Wrapper for chrome.runtime.sendMessage
 */
function sendMessage(type, payload = {}) {
    return new Promise((resolve, reject) => {
        chrome.runtime.sendMessage({ type, ...payload }, (response) => {
            if (chrome.runtime.lastError) {
                reject(chrome.runtime.lastError);
            } else {
                resolve(response);
            }
        });
    });
}
