/**
 * PII Regex Scrubber
 * Module 4.1 — Stage 7: Privacy Scrubbing & Anonymization
 * 
 * Masks Indian-specific PII patterns: Aadhaar, PAN, Phone, and Credit Cards.
 */

import { regexPatterns } from '../../config/privacy-rules.js';

/**
 * Scrub PII patterns from a given text.
 * @param {string} text - The text to scrub.
 * @returns {string} The sanitized text.
 */
export function scrubPII(text) {
    if (typeof text !== 'string') return text;

    let sanitized = text;

    // Mask Aadhaar numbers
    sanitized = sanitized.replace(regexPatterns.aadhaar, '[AADHAAR]');

    // Mask PAN numbers
    sanitized = sanitized.replace(regexPatterns.pan, '[PAN]');

    // Mask phone numbers
    sanitized = sanitized.replace(regexPatterns.phone, '[PHONE]');

    // Mask credit card numbers
    sanitized = sanitized.replace(regexPatterns.creditCard, '[CREDIT_CARD]');

    return sanitized;
}
