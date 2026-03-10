/**
 * Privacy Pipeline
 * Module 4.1 — Stage 7: Privacy Scrubbing & Anonymization
 * 
 * Orchestrates all privacy scrubbers to sanitize event batches.
 */

import { scrubEmails } from './email-scrubber.js';
import { scrubPII } from './pii-regex-scrubber.js';
import { scrubQueryParams } from './query-param-scrubber.js';
import { anonymizeIP } from './ip-anonymizer.js';
import { hashUserId } from './user-id-hasher.js';

/**
 * Scrub a batch of events before transmission.
 * @param {Object} batch - The event batch object.
 * @returns {Promise<Object>} The scrubbed batch.
 */
export async function scrubBatch(batch) {
    if (!batch || !batch.events || !Array.isArray(batch.events)) {
        return batch;
    }

    const scrubbedEvents = await Promise.all(batch.events.map(async (event) => {
        const scrubbedEvent = { ...event };

        // 1. Scrub emails in text fields (assuming 'text', 'content', 'value' might have PII)
        if (scrubbedEvent.content) scrubbedEvent.content = scrubEmails(scrubbedEvent.content);
        if (scrubbedEvent.text) scrubbedEvent.text = scrubEmails(scrubbedEvent.text);
        if (scrubbedEvent.value && typeof scrubbedEvent.value === 'string') {
            scrubbedEvent.value = scrubEmails(scrubbedEvent.value);
        }

        // 2. Scrub PII patterns (Aadhaar, PAN, Phone, CC)
        if (scrubbedEvent.content) scrubbedEvent.content = scrubPII(scrubbedEvent.content);
        if (scrubbedEvent.text) scrubbedEvent.text = scrubPII(scrubbedEvent.text);
        if (scrubbedEvent.value && typeof scrubbedEvent.value === 'string') {
            scrubbedEvent.value = scrubPII(scrubbedEvent.value);
        }

        // 3. Scrub URL query parameters
        if (scrubbedEvent.url) scrubbedEvent.url = scrubQueryParams(scrubbedEvent.url);
        if (scrubbedEvent.metadata && scrubbedEvent.metadata.url) {
            scrubbedEvent.metadata.url = scrubQueryParams(scrubbedEvent.metadata.url);
        }

        // 4. Anonymize IP in metadata
        if (scrubbedEvent.metadata) {
            scrubbedEvent.metadata = anonymizeIP(scrubbedEvent.metadata);
        }

        // 5. Hash userId if present
        if (scrubbedEvent.userId) {
            scrubbedEvent.userId = await hashUserId(scrubbedEvent.userId);
        }

        return scrubbedEvent;
    }));

    return {
        ...batch,
        events: scrubbedEvents,
        metadata: {
            ...(batch.metadata || {}),
            privacyScrubbed: true,
            scrubTimestamp: Date.now()
        }
    };
}
