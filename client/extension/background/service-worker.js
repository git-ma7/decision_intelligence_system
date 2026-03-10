// Module 4.1: Decision Capture System - Service Worker
import { initAuth, login, logout, verifyToken } from './auth.js';
import { onInstalled, onStartup } from './init.js';
import { enrichEvent } from './enrichment.js'; // Stage 3: Event Enrichment
import { assignSession } from './session-manager.js'; // Stage 4: Session Management
import { eventBus } from './event-bus.js'; // Stage 6: Event Bus
import { scheduleBatch } from './buffer/batch-scheduler.js'; // Stage 6: Batch Scheduler

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
    await scheduleBatch(); // Start time-based batch checks
});

// Initialize on service worker activation (for dev reloading)
(async () => {
    await onStartup();
    await scheduleBatch();
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

        // Stage 3 & 4: Enrich and assign sessions to each event before transmission
        Promise.all(newEvents.map(event =>
            enrichEvent(event)
                .then(enriched => assignSession(enriched, sender.tab?.id, sender.tab?.windowId))
        ))
            .then(enrichedEvents => {
                // Stage 6: Instead of direct storage, emit to event bus
                enrichedEvents.forEach(event => {
                    eventBus.emit('filtered-event', event);
                });

                console.log(`Background: Processed ${enrichedEvents.length} events and emitted to filtered-event.`);
                sendResponse({ success: true });
            })
            .catch(err => {
                console.error('Background: Error enriching/processing events:', err);
                sendResponse({ success: false, error: err.message });
            });
        return true;
    }
});
