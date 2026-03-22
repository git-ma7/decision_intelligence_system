/**
 * Module 4.2 - Stage 4: Signal Normalizer
 */

export function normalizeSignals(rawSignals) {
    if (!Array.isArray(rawSignals)) return [];

    const normalized = rawSignals
        .filter(s => typeof s === 'string' && s.trim() !== '')
        .map(s => s.trim().toLowerCase())
        .map(s => {
            // standardizing format spaces to underscores
            return s.replace(/\s+/g, '_');
        });

    // Remove duplicates
    return [...new Set(normalized)];
}
