/**
 * Batch Scheduler
 * Module 4.1 — Stage 6: Local Event Buffering
 * 
 * Periodically triggers batch checks to ensure time-based batching.
 */

import { checkBatchTrigger, clearBuffer, initBuffer } from './event-buffer.js';
import { eventBus } from '../event-bus.js';
import { purgeOld } from './storage-manager.js';

const CHECK_INTERVAL_MS = 30 * 1000; // 30 seconds
const PURGE_INTERVAL_MS = 24 * 60 * 60 * 1000; // 24 hours
let schedulerInterval = null;
let purgeInterval = null;

/**
 * Start the periodic batch check timer.
 */
export async function scheduleBatch() {
    if (schedulerInterval) return;

    // 1. Initialize buffer from storage
    await initBuffer();

    // 2. Initial purge of old events
    await purgeOld();

    // 3. Setup periodic batch checks
    schedulerInterval = setInterval(() => {
        console.log('BatchScheduler: Running periodic check...');
        checkBatchTrigger();
    }, CHECK_INTERVAL_MS);

    // 4. Setup periodic purge (every 24h)
    purgeInterval = setInterval(() => {
        console.log('BatchScheduler: Running periodic purge...');
        purgeOld();
    }, PURGE_INTERVAL_MS);

    console.log(`BatchScheduler: Scheduled checks every ${CHECK_INTERVAL_MS / 1000}s and purge every 24h`);
}

// Listen for batch-ready to potentially clear buffer if needed
// In this implementation, we assume the downstream consumer will handle clearing
// but we can add a listener here if we want to force a clear after some event.

/**
 * Force a batch trigger immediately.
 */
export function triggerBatch() {
    console.log('BatchScheduler: Manual trigger requested.');
    checkBatchTrigger();
}

/**
 * Stop the scheduler.
 */
export function stopScheduler() {
    if (schedulerInterval) {
        clearInterval(schedulerInterval);
        schedulerInterval = null;
    }
}
