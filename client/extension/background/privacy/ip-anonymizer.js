/**
 * IP Anonymizer
 * Module 4.1 — Stage 7: Privacy Scrubbing & Anonymization
 * 
 * Replaces IP addresses in metadata with [IP_REDACTED].
 */

/**
 * Anonymize IP addresses within metadata.
 * @param {Object} metadata - The metadata object.
 * @returns {Object} The anonymized metadata.
 */
export function anonymizeIP(metadata) {
    if (!metadata || typeof metadata !== 'object') return metadata;

    const redactor = (obj) => {
        for (const key in obj) {
            if (typeof obj[key] === 'string') {
                // Regex for IPv4 and simple IPv6 (optional, but requested for metadata)
                const ipPattern = /\b(?:\d{1,3}\.){3}\d{1,3}\b/g;
                if (key.toLowerCase().includes('ip') || ipPattern.test(obj[key])) {
                    obj[key] = '[IP_REDACTED]';
                }
            } else if (typeof obj[key] === 'object' && obj[key] !== null) {
                redactor(obj[key]);
            }
        }
    };

    const scrubbedMetadata = JSON.parse(JSON.stringify(metadata));
    redactor(scrubbedMetadata);
    return scrubbedMetadata;
}
