/**
 * Acknowledgment Handler
 * Module 4.1 — Stage 8: Output Interface
 * 
 * Handles successful batch processing acknowledgments from Module 4.2.
 */

import { eventBus } from '../event-bus.js';
import { clearBuffer } from '../buffer/event-buffer.js';

/**
 * Handles a successful acknowledgment for a batch.
 * @param {string} batchId - The ID of the processed batch.
 */
export async function handleAck(batchId) {
    console.log(`[Module4.1] Batch successfully processed: ${batchId}`);

    try {
        // Clear the event buffer as the data has been reliably delivered
        await clearBuffer();

        console.log(`[Module4.1] Event buffer cleared after successful delivery.`);

        // Emit final success event
        eventBus.emit("batch-processed", {
            batchId,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error(`[Module4.1] Error clearing buffer after ack for batch ${batchId}`, error);
    }
}
