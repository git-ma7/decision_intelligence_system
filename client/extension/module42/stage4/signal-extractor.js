/**
 * Module 4.2 - Stage 4: Signal Extractor
 */
import { signalRules } from './signal-rules.js';

export function extractSignals(session) {
    if (!session || !session.behavioralFlags || !session.metrics || !session.enrichedEvents) {
        return [];
    }

    // TODO: Remove after verification
    console.log("Stage4 Input Debug:", {
        sessionId: session.sessionId,
        hasEnrichedEvents: !!session.enrichedEvents,
        enrichedEventCount: session.enrichedEvents?.length,
        behavioralFlags: session.behavioralFlags,
        sampleEvent: session.enrichedEvents?.[0]
    });

    const rawSignals = [];

    for (const rule of signalRules) {
        try {
            const result = rule(session);
            if (Array.isArray(result)) {
                rawSignals.push(...result);
            } else if (result) {
                rawSignals.push(result);
            }
        } catch (e) {
            // Ignore rule failures to prevent breaking the pipeline
        }
    }

    return rawSignals;
}
