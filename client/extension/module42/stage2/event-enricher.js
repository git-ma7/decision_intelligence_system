/**
 * Module 4.2 - Stage 2: Event Enricher
 * Combines parsed domain, entities, and URL intent, then emits the enriched batch.
 */

import { eventBus } from '../../background/event-bus.js';
import { getDomainInfo } from './domain-mapper.js';
import { classifyEntities } from './entity-classifier.js';
import { parseUrlIntent } from './url-intent-parser.js';

/**
 * Initializes Stage 2 event enrichment subscription.
 */
export function initStage2Enricher() {
    eventBus.subscribe('module42-stage1-ready', (batch) => {
        try {
            console.log(`[Stage 2] Starting enrichment for batch ${batch.batchTimestamp || Date.now()}`);
            const enrichedBatch = enrichBatch(batch);
            
            console.log(`[Stage 2] Submitting enriched batch containing ${enrichedBatch.totalEvents} events`);
            eventBus.emit('module42-stage2-ready', enrichedBatch);
        } catch (error) {
            console.error('[Stage 2] Enrichment failed', error);
        }
    });
}

/**
 * Processes a batch from Stage 1 into a semantically enriched batch
 * @param {Object} batch - Stage 1 ready payload
 * @returns {Object} Stage 2 output payload
 */
export function enrichBatch(batch) {
    if (!batch || !Array.isArray(batch.sessions)) {
        throw new Error('Invalid batch format for stage 2 enrichment');
    }

    const output = {
        sessions: [],
        totalEvents: batch.totalEvents || 0,
        batchTimestamp: batch.batchTimestamp || new Date().toISOString()
    };

    let processedCount = 0;

    for (const session of batch.sessions) {
        if (!session.events || !Array.isArray(session.events)) continue;

        const enrichedEvents = [];

        for (const event of session.events) {
            const url = event.url || '';
            const entities = event.entities || [];

            // 1. Domain Mapping
            const domainInfo = getDomainInfo(url);

            // 2. Context-based Entity Classification
            const classifiedEntities = classifyEntities(entities, url, domainInfo);

            // 3. URL Intent extraction
            const urlSignals = parseUrlIntent(url);

            // Construct enriched event
            const enrichedEvent = {
                originalEvent: event,
                domainInfo,
                classifiedEntities,
                urlSignals,
                enrichedAt: new Date().toISOString()
            };

            enrichedEvents.push(enrichedEvent);
            processedCount++;
        }

        output.sessions.push({
            sessionId: session.sessionId,
            enrichedEvents: enrichedEvents,
            eventCount: enrichedEvents.length,
            startTime: session.startTime,
            endTime: session.endTime
        });
    }

    // Fix total event count if missing
    if (output.totalEvents === 0 && processedCount > 0) {
        output.totalEvents = processedCount;
    }

    return output;
}

// Auto-initialize when imported if needed
initStage2Enricher();
