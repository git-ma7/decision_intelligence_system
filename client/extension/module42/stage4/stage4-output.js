/**
 * Module 4.2 - Stage 4: Output Emitter
 * Listens for stage 3 and outputs session signals.
 */

import { eventBus } from '../../background/event-bus.js';
import { extractSignals } from './signal-extractor.js';
import { normalizeSignals } from './signal-normalizer.js';

export function initStage4() {
    eventBus.subscribe('module42-stage3-ready', (payload) => {
        if (!payload || !Array.isArray(payload.sessions)) return;

        const processedSessions = payload.sessions.map(session => {
            const rawSignals = extractSignals(session);
            const signals = normalizeSignals(rawSignals);

            return {
                sessionId: session.sessionId,
                signals: signals,
                signalCount: signals.length
            };
        });

        // ⚠️ ONLY 1 LOG PER SESSION (strictly enforced by requirements)
        processedSessions.forEach(session => {
            console.log("Stage4 Signals:", {
                sessionId: session.sessionId,
                signalCount: session.signalCount,
                signals: session.signals
            });
        });

        const stage4Payload = {
            sessions: processedSessions,
            totalSessions: processedSessions.length,
            batchTimestamp: payload.batchTimestamp || Date.now()
        };

        eventBus.emit('module42-stage4-ready', stage4Payload);
    });
}

// Auto-initialize when imported
initStage4();
