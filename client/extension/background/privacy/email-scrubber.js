/**
 * Email Scrubber
 * Module 4.1 — Stage 7: Privacy Scrubbing & Anonymization
 * 
 * Replaces email addresses in text with [EMAIL].
 */

import { regexPatterns } from '../../config/privacy-rules.js';

/**
 * Scrub email addresses from a given text.
 * @param {string} text - The text to scrub.
 * @returns {string} The sanitized text.
 */
export function scrubEmails(text) {
    if (typeof text !== 'string') return text;
    return text.replace(regexPatterns.email, '[EMAIL]');
}
