/**
 * Storage Manager for Event Buffering
 * Module 4.1 — Stage 6: Local Event Buffering
 * 
 * Manages chrome.storage.local quota and event retention policies.
 */

const MAX_STORAGE_BYTES = 4 * 1024 * 1024; // 4MB (Chrome limit is 5MB for local storage)
const RETENTION_DAYS = 7;

/**
 * Check current storage usage and return summary.
 * @returns {Promise<Object>} Usage stats
 */
export async function monitorQuota() {
    const data = await chrome.storage.local.get(null);
    const bytesUsed = JSON.stringify(data).length; // Rough estimation
    const usagePercentage = (bytesUsed / MAX_STORAGE_BYTES) * 100;

    console.log(`StorageManager: Used ${bytesUsed} bytes (${usagePercentage.toFixed(2)}%)`);
    return { bytesUsed, usagePercentage };
}

/**
 * Evict oldest events if storage is near limit.
 * @param {number} count - Number of events to evict.
 */
export async function evictOldest(count = 50) {
    const { events } = await chrome.storage.local.get('events');
    if (!events || events.length === 0) return;

    if (events.length <= count) {
        await chrome.storage.local.set({ events: [] });
    } else {
        const remainingEvents = events.slice(count);
        await chrome.storage.local.set({ events: remainingEvents });
        console.log(`StorageManager: Evicted ${count} oldest events due to storage pressure.`);
    }
}

/**
 * Purge events older than the retention period.
 */
export async function purgeOld() {
    const { events } = await chrome.storage.local.get('events');
    if (!events || events.length === 0) return;

    const cutoff = Date.now() - (RETENTION_DAYS * 24 * 60 * 60 * 1000);
    const filteredEvents = events.filter(event => {
        const timestamp = new Date(event.timestamp).getTime();
        return timestamp >= cutoff;
    });

    if (filteredEvents.length < events.length) {
        await chrome.storage.local.set({ events: filteredEvents });
        console.log(`StorageManager: Purged ${events.length - filteredEvents.length} events older than ${RETENTION_DAYS} days.`);
    }
}
