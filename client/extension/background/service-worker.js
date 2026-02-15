// Module 4.1: Decision Capture System - Service Worker
import { initAuth, login, logout, verifyToken } from './auth.js';
import { onInstalled, onStartup } from './init.js';

console.log('Decision Intelligence System - Module 4.1 initialized');

// Extension installation handler
chrome.runtime.onInstalled.addListener(async (details) => {
    console.log('Extension installed/updated:', details.reason);
    await onInstalled(details);
});

// Extension startup handler
chrome.runtime.onStartup.addListener(async () => {
    console.log('Browser started, initializing extension');
    await onStartup();
});

// Initialize on service worker activation (for dev reloading)
(async () => {
    await onStartup();
})();

// Message handler for popup communication
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === 'LOGIN') {
        login(message.username, message.password)
            .then(result => sendResponse(result))
            .catch(error => sendResponse({ success: false, error: error.message }));
        return true; // Keep channel open for async response
    }

    if (message.type === 'LOGOUT') {
        logout()
            .then(() => sendResponse({ success: true }))
            .catch(error => sendResponse({ success: false, error: error.message }));
        return true;
    }

    if (message.type === 'GET_AUTH_STATUS') {
        // Get both auth and session data to populate the UI
        chrome.storage.local.get(['auth', 'session'])
            .then((data) => {
                const auth = data.auth || {};
                const session = data.session || {};

                const isAuthenticated = auth.token && auth.expiresAt > Date.now();

                sendResponse({
                    authenticated: isAuthenticated,
                    userId: auth.userId,
                    sessionId: session.currentSessionId,
                    tabCount: session.tabCount
                });
            })
            .catch(err => {
                console.error('Error getting auth status:', err);
                sendResponse({ authenticated: false, error: err.message });
            });
        return true;
    }
});
