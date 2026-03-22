/**
 * Event Bus for Background Script
 * Module 4.1 — Stage 6: Local Event Buffering
 * 
 * Provides a simple pub/sub mechanism for decoupled communication between
 * background modules.
 */

class EventBus {
    constructor() {
        this.listeners = new Map();
    }

    /**
     * Subscribe to an event.
     * @param {string} eventName - Name of the event to subscribe to.
     * @param {Function} callback - Function to execute when event is emitted.
     * @returns {Function} Unsubscribe function.
     */
    subscribe(eventName, callback) {
        if (!this.listeners.has(eventName)) {
            this.listeners.set(eventName, []);
        }
        this.listeners.get(eventName).push(callback);

        // Return unsubscribe function
        return () => {
            const callbacks = this.listeners.get(eventName);
            if (callbacks) {
                const index = callbacks.indexOf(callback);
                if (index > -1) {
                    callbacks.splice(index, 1);
                }
            }
        };
    }

    /**
     * Emit an event.
     * @param {string} eventName - Name of the event to emit.
     * @param {any} data - Data to pass to subscriptions.
     */
    emit(eventName, data) {
        const callbacks = this.listeners.get(eventName);
        if (callbacks) {
            callbacks.forEach(callback => {
                try {
                    callback(data);
                } catch (error) {
                    console.error(`EventBus: Error in callback for ${eventName}:`, error);
                }
            });
        }
    }
}

// Export as singleton
export const eventBus = new EventBus();

// Stage 6: Default Subscriptions
import { addEvent } from './buffer/event-buffer.js';
import { scrubBatch } from './privacy/privacy-pipeline.js';

eventBus.subscribe('filtered-event', (event) => {
    addEvent(event);
});

eventBus.subscribe('batch-ready', async (batch) => {

    try {
        const scrubbedBatch = await scrubBatch(batch);

        // Ensure batch has a unique ID for tracking (Stage 8)
        scrubbedBatch.id = scrubbedBatch.id || `batch-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

        eventBus.emit('scrubbed-batch-ready', scrubbedBatch);
    } catch (error) {
        console.error('EventBus: Privacy scrubbing failed', error);
    }
});


// Stage 8: Output Integration
import { sendBatchToModule42 } from './output/module42-interface.js';
import { handleAck } from './output/ack-handler.js';
import { retryBatch } from './output/retry-manager.js';

eventBus.subscribe('scrubbed-batch-ready', (batch) => {
    sendBatchToModule42(batch);
});

eventBus.subscribe('module42-ack', (batchId) => {
    handleAck(batchId);
});

eventBus.subscribe('module42-failed', (batch) => {
    retryBatch(batch);
});

