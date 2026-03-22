/**
 * Module 4.2 - Stage 3: Output Emitter
 * Listens for stage 2 and outputs session intelligence.
 */

import { eventBus } from '../../background/event-bus.js';
import { analyzeSession } from './session-analyzer.js';

export function initStage3() {
    eventBus.subscribe('module42-stage2-ready', (payload) => {
        if (!payload || !Array.isArray(payload.sessions)) return;

        const analyzedSessions = payload.sessions.map(session => 
            analyzeSession(session.sessionId, session.enrichedEvents)
        );

        // Temp log for manual testing
        if (analyzedSessions.length > 0) {
            console.log("Stage3 Session Output:", analyzedSessions[0]);
        }

        const stage3Payload = {
            sessions: analyzedSessions,
            totalSessions: analyzedSessions.length,
            batchTimestamp: payload.batchTimestamp || Date.now()
        };

        eventBus.emit('module42-stage3-ready', stage3Payload);
    });
}

// Auto-initialize when imported
initStage3();
