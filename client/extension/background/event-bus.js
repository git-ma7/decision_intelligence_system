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

eventBus.subscribe('filtered-event', (event) => {
    addEvent(event);
});

eventBus.subscribe('batch-ready', async (batch) => {
    console.log('EventBus: Batch ready received, applying privacy pipeline:', batch);

    try {
        const { scrubBatch } = await import('./privacy/privacy-pipeline.js');
        const scrubbedBatch = await scrubBatch(batch);

        console.log('EventBus: Batch scrubbed, emitting scrubbed-batch-ready');
        eventBus.emit('scrubbed-batch-ready', scrubbedBatch);
    } catch (error) {
        console.error('EventBus: Privacy scrubbing failed', error);
        // Fail-safe: Emit the batch even if scrubbing fails? 
        // Better to not emit it if privacy is a hard requirement.
        // For now, let's just log.
    }
});
