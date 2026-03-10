/**
 * Batch Scheduler
 * Module 4.1 — Stage 6: Local Event Buffering
 * 
 * Periodically triggers batch checks to ensure time-based batching.
 */

import { checkBatchTrigger, clearBuffer } from './event-buffer.js';
import { eventBus } from '../event-bus.js';

const CHECK_INTERVAL_MS = 30 * 1000; // 30 seconds
let schedulerInterval = null;

/**
 * Start the periodic batch check timer.
 */
export function scheduleBatch() {
    if (schedulerInterval) return;

    schedulerInterval = setInterval(() => {
        console.log('BatchScheduler: Running periodic check...');
        checkBatchTrigger();
    }, CHECK_INTERVAL_MS);

    console.log(`BatchScheduler: Scheduled checks every ${CHECK_INTERVAL_MS / 1000}s`);

    // Listen for batch-ready to potentially clear buffer if needed
    // In this implementation, we assume the downstream consumer will handle clearing
    // but we can add a listener here if we want to force a clear after some event.
}

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
