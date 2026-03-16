/**
 * Retry Manager
 * Module 4.1 — Stage 8: Output Interface
 * 
 * Handles failed transmissions to Module 4.2 with a retry policy.
 */

import { eventBus } from '../event-bus.js';
import { sendBatchToModule42 } from './module42-interface.js';

const MAX_RETRIES = 3;
const RETRY_DELAYS = [
    5000,   // 5 seconds
    15000,  // 15 seconds
    30000   // 30 seconds
];

const retryCounts = new Map();

/**
 * Retries sending a batch to Module 4.2.
 * @param {Object} batch - The batch that failed to send.
 */
export function retryBatch(batch) {
    const batchId = batch.id;
    const currentAttempt = retryCounts.get(batchId) || 0;

    if (currentAttempt < MAX_RETRIES) {
        const nextAttempt = currentAttempt + 1;
        retryCounts.set(batchId, nextAttempt);

        const delay = RETRY_DELAYS[currentAttempt];

        console.log(`[Module4.1] Retry attempt ${nextAttempt} for batch ${batchId} in ${delay / 1000}s`);

        setTimeout(() => {
            console.log(`[Module4.1] Executing retry attempt ${nextAttempt} for batch ${batchId}`);
            sendBatchToModule42(batch);
        }, delay);
    } else {
        console.error(`[Module4.1] Batch dropped after ${MAX_RETRIES} failed retry attempts: ${batchId}`);
        retryCounts.delete(batchId);
        eventBus.emit("batch-dropped", batch);
    }
}
