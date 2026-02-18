/**
 * ObserverManager: Central Event Bus for Content Script Observers.
 * Handles normalization, batching, and transmission to background.
 */

class ObserverManager {
    constructor() {
        this.observers = new Map();
        this.eventBuffer = [];
        this.batchSize = 10;
        this.flushInterval = 30000; // 30 seconds
        this.isInitialized = false;
        this.config = null;
    }

    /**
     * Initialize the manager with configuration.
     */
    async init() {
        if (this.isInitialized) return;

        try {
            // Load config from storage
            const { config } = await chrome.storage.local.get('config');
            this.config = config || { blacklistDomains: [], captureEnabled: true };

            // Check if current domain is blacklisted
            const currentHost = window.location.hostname;
            if (this.config.blacklistDomains.some(domain => currentHost.includes(domain))) {
                console.log(`ObserverManager: Domain ${currentHost} is blacklisted. Disabling observers.`);
                return;
            }

            if (!this.config.captureEnabled) {
                console.log('ObserverManager: Capture is globally disabled.');
                return;
            }

            this.isInitialized = true;
            this.setupFlushTimer();
            console.log('ObserverManager: Initialized on', currentHost);
        } catch (error) {
            console.error('ObserverManager: Init failed', error);
        }
    }

    /**
     * Register a new observer module.
     */
    register(name, observer) {
        if (this.observers.has(name)) return;
        this.observers.set(name, observer);
        if (this.isInitialized) {
            observer.start(this);
        }
    }

    /**
     * Notify the manager of a new event.
     */
    notify(eventType, payload) {
        if (!this.isInitialized) return;

        const event = {
            id: crypto.randomUUID(),
            timestamp: new Date().toISOString(),
            url: window.location.href,
            type: eventType,
            properties: payload
        };

        this.eventBuffer.push(event);
        console.log(`ObserverManager: Captured ${eventType}`, payload);

        if (this.eventBuffer.length >= this.batchSize) {
            this.flush();
        }
    }

    /**
     * Setup periodic flush timer.
     */
    setupFlushTimer() {
        setInterval(() => this.flush(), this.flushInterval);
    }

    /**
     * Send buffered events to background script.
     */
    async flush() {
        if (this.eventBuffer.length === 0) return;

        const eventsToSend = [...this.eventBuffer];
        this.eventBuffer = [];

        try {
            await chrome.runtime.sendMessage({
                type: 'EVENT_BATCH',
                payload: eventsToSend
            });
            console.log(`ObserverManager: Flushed ${eventsToSend.length} events`);
        } catch (error) {
            console.error('ObserverManager: Flush failed', error);
            // Put events back at the start of the buffer for retry
            this.eventBuffer = [...eventsToSend, ...this.eventBuffer];
        }
    }
}

// Export as singleton
export const observerManager = new ObserverManager();
