/**
 * Privacy Rules Configuration
 * Module 4.1 — Stage 7: Privacy Scrubbing & Anonymization
 * 
 * Defines sensitive data patterns and keys for the privacy pipeline,
 * following Indian privacy standards.
 */

export const sensitiveQueryParams = [
    'token',
    'password',
    'auth',
    'session',
    'key',
    'apikey',
    'email'
];

export const regexPatterns = {
    // Regex for standard email format
    email: /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g,

    // Indian Phone Numbers (Standard 10 digits, optionally starting with +91 or 0)
    // Matches: +91 9876543210, 09876543210, 9876543210, +91-98765-43210
    phone: /(\+91[\-\s]?)?[0]?[6-9]\d{9}|\b\d{5}[\-\s]?\d{5}\b/g,

    // Aadhaar Card (12 digits, often grouped as 4-4-4)
    // Pattern: 12 digits, first digit is not 0 or 1.
    aadhaar: /\b[2-9]\d{3}\s?\d{4}\s?\d{4}\b/g,

    // Permanent Account Number (PAN)
    // Pattern: 5 letters, 4 digits, 1 letter.
    pan: /\b[A-Z]{5}[0-9]{4}[A-Z]{1}\b/g,

    // Credit Card Numbers (13-19 digits)
    creditCard: /\b(?:\d{4}[-\s]?){3}\d{4,7}\b/g
};
