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
        // ... existing code ...
        return true;
    }

    // Handle incoming event batches from observers
    if (message.type === 'EVENT_BATCH') {
        const newEvents = message.payload;
        chrome.storage.local.get('events').then((data) => {
            const currentEvents = data.events || [];
            const updatedEvents = [...currentEvents, ...newEvents];

            // Production Pattern: Limit buffer size (e.g., 1000 events)
            const MAX_EVENTS = 1000;
            const cappedEvents = updatedEvents.slice(-MAX_EVENTS);

            chrome.storage.local.set({ events: cappedEvents }).then(() => {
                console.log(`Background: Stored batch of ${newEvents.length} events. Total buffer: ${cappedEvents.length}`);
                sendResponse({ success: true });
            });
        }).catch(err => {
            console.error('Background: Error storing events:', err);
            sendResponse({ success: false, error: err.message });
        });
        return true;
    }
});
