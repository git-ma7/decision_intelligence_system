/**
 * Query Parameter Scrubber
 * Module 4.1 — Stage 7: Privacy Scrubbing & Anonymization
 * 
 * Removes sensitive query parameters from URLs.
 */

import { sensitiveQueryParams } from '../../config/privacy-rules.js';

/**
 * Remove sensitive query parameters from a URL string.
 * @param {string} urlString - The URL to scrub.
 * @returns {string} The sanitized URL.
 */
export function scrubQueryParams(urlString) {
    if (typeof urlString !== 'string') return urlString;

    try {
        const url = new URL(urlString);
        const params = url.searchParams;
        let modified = false;

        sensitiveQueryParams.forEach(key => {
            if (params.has(key)) {
                params.delete(key);
                modified = true;
            }
        });

        return modified ? url.toString() : urlString;
    } catch (e) {
        // If it's not a valid URL, return as is
        return urlString;
    }
}
