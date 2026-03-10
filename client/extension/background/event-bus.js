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
// We use dynamic imports to avoid circular dependencies if needed, 
// though event-buffer.js only needs the eventBus instance.
import('./buffer/event-buffer.js').then(({ addEvent }) => {
    eventBus.subscribe('filtered-event', (event) => {
        addEvent(event);
    });
});

eventBus.subscribe('batch-ready', (batch) => {
    console.log('EventBus: Batch ready received:', batch);
    // Future Stage: Handle transmission to Module 4.2
});
