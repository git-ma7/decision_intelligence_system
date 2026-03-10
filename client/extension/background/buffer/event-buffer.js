/**
 * Event Buffer Logic
 * Module 4.1 — Stage 6: Local Event Buffering
 * 
 * Handles event persistence, in-memory buffering, and batch triggers.
 */

import { eventBus } from '../event-bus.js';
import { monitorQuota, evictOldest } from './storage-manager.js';

const BATCH_SIZE_THRESHOLD = 50;
const BATCH_TIME_THRESHOLD_MS = 5 * 60 * 1000; // 5 minutes

let inMemoryBuffer = [];

/**
 * Add an event to the buffer and persist to local storage.
 * @param {Object} event - The event object.
 */
export async function addEvent(event) {
    // 1. Add to in-memory buffer
    inMemoryBuffer.push(event);

    // 2. Persist to chrome.storage.local
    try {
        const { events = [] } = await chrome.storage.local.get('events');
        events.push(event);
        await chrome.storage.local.set({ events });

        console.log(`EventBuffer: Added event, total in-memory: ${inMemoryBuffer.length}, persisted: ${events.length}`);

        // 3. Monitor storage quota
        const { usagePercentage } = await monitorQuota();
        if (usagePercentage > 90) {
            await evictOldest(100);
        }

        // 4. Check for immediate triggers
        checkBatchTrigger();
    } catch (error) {
        console.error('EventBuffer: Failed to persist event', error);
    }
}

/**
 * Get the current in-memory buffer.
 * @returns {Array} List of events.
 */
export function getBuffer() {
    return inMemoryBuffer;
}

/**
 * Clear the buffer (memory + storage).
 */
export async function clearBuffer() {
    inMemoryBuffer = [];
    await chrome.storage.local.set({ events: [] });
    console.log('EventBuffer: Buffer cleared.');
}

/**
 * Check if the batching conditions are met.
 * Conditions:
 * 1. Buffer length >= 50
 * 2. Oldest event is >= 5 minutes old
 */
export function checkBatchTrigger() {
    if (inMemoryBuffer.length === 0) return;

    const now = Date.now();
    const oldestEvent = inMemoryBuffer[0];
    const oldestTimestamp = new Date(oldestEvent.timestamp).getTime();
    const timeElapsed = now - oldestTimestamp;

    const sizeTrigger = inMemoryBuffer.length >= BATCH_SIZE_THRESHOLD;
    const timeTrigger = timeElapsed >= BATCH_TIME_THRESHOLD_MS;

    if (sizeTrigger || timeTrigger) {
        console.log(`EventBuffer: Batch trigger met (${sizeTrigger ? 'size' : 'timeout'}). Emitting batch-ready.`);
        eventBus.emit('batch-ready', {
            events: [...inMemoryBuffer],
            trigger: sizeTrigger ? 'size' : 'timeout',
            count: inMemoryBuffer.length
        });

        // Note: We don't clear the buffer here. 
        // Typically, the subscriber to 'batch-ready' would handle transmission 
        // and then call clearBuffer once successful.
    }
}
