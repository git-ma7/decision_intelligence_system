/**
 * Module 4.2 Interface
 * Module 4.1 — Stage 8: Output Interface
 * 
 * Provides the interface that sends scrubbed batches to Module 4.2 (Classification Engine).
 */

import { eventBus } from '../event-bus.js';
import { mockModule42 } from '../mock/mock-module42.js';

/**
 * Sends a sanitized batch of events to Module 4.2.
 * @param {Object} batch - The scrubbed batch object.
 */
export function sendBatchToModule42(batch) {
    console.log("[Module4.1] Sending batch to Module 4.2", {
        batchId: batch.id,
        eventCount: batch.events?.length || 0
    });

    try {
        const response = mockModule42.process(batch);

        if (response.acknowledged) {
            console.log(`[Module4.1] Batch acknowledged: ${batch.id}`);
            eventBus.emit("module42-ack", batch.id);
        } else {
            console.warn(`[Module4.1] Module 4.2 processing failed for batch: ${batch.id}`);
            eventBus.emit("module42-failed", batch);
        }
    } catch (error) {
        console.error("[Module4.1] Error sending batch to Module 4.2", error);
        eventBus.emit("module42-failed", batch);
    }
}
