import { eventBus } from '../../background/event-bus.js';

/**
 * Emits the processed Stage 1 output to the event bus.
 * @param {Array} sessionGroups - Array of grouped sessions.
 * @param {number} totalEvents - Total number of valid events processed.
 */
export function emitStage1Ready(sessionGroups, totalEvents) {
    const payload = {
        sessions: sessionGroups,
        totalEvents: totalEvents,
        batchTimestamp: new Date().toISOString()
    };
    
    try {
        eventBus.emit('module42-stage1-ready', payload);
    } catch (error) {
        console.error('Stage1Output: Failed to emit output', error);
    }
}
