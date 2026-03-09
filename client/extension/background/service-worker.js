// Module 4.1: Decision Capture System - Service Worker
import { initAuth, login, logout, verifyToken } from './auth.js';
import { onInstalled, onStartup } from './init.js';
import { enrichEvent } from './enrichment.js'; // Stage 3: Event Enrichment

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

        // Stage 3: Enrich each event before storage
        Promise.all(newEvents.map(event => enrichEvent(event)))
            .then(enrichedEvents => chrome.storage.local.get('events').then((data) => {
                const currentEvents = data.events || [];
                const updatedEvents = [...currentEvents, ...enrichedEvents];

                // Production Pattern: Limit buffer size (FIFO eviction at 1000 events)
                const MAX_EVENTS = 1000;
                const cappedEvents = updatedEvents.slice(-MAX_EVENTS);

                return chrome.storage.local.set({ events: cappedEvents }).then(() => {
                    console.log(`Background: Stored ${enrichedEvents.length} enriched events. Total buffer: ${cappedEvents.length}`);
                    sendResponse({ success: true });
                });
            }))
            .catch(err => {
                console.error('Background: Error enriching/storing events:', err);
                sendResponse({ success: false, error: err.message });
            });
        return true;
    }
});
