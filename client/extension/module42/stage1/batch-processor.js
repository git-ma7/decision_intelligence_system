import { filterValidEvents } from './event-validator.js';
import { groupEventsBySession } from './session-grouper.js';
import { emitStage1Ready } from '../output/stage1-output.js';

/**
 * Processes a batch of events (Stage 1).
 * @param {Array|Object} batch - The incoming batch.
 */
export function processBatch(batch) {
    // Extract events in case batch is an object with an events property
    const events = Array.isArray(batch) ? batch : (batch.events || batch.data || []);
    
    // 1. Validate
    const validEvents = filterValidEvents(events);
    
    if (validEvents.length === 0) {
        return;
    }

    // 2. Sort events
    validEvents.sort((a, b) => {
        // Sort by sessionId
        if (a.sessionId < b.sessionId) return -1;
        if (a.sessionId > b.sessionId) return 1;
        
        // Then by sessionSequence (if exists)
        const seqA = a.sessionSequence ?? Number.MAX_SAFE_INTEGER;
        const seqB = b.sessionSequence ?? Number.MAX_SAFE_INTEGER;
        if (seqA !== seqB) {
            return seqA - seqB;
        }
        
        // Then by timestamp
        const timeA = new Date(a.timestamp).getTime();
        const timeB = new Date(b.timestamp).getTime();
        return timeA - timeB;
    });

    // 3. Group by sessionId
    const sessionGroups = groupEventsBySession(validEvents);

    // 4. Emit output
    emitStage1Ready(sessionGroups, validEvents.length);
}
