/**
 * User ID Hasher
 * Module 4.1 — Stage 7: Privacy Scrubbing & Anonymization
 * 
 * Hashes user identifiers using SHA-256 via Web Crypto API.
 */

/**
 * Hash a user ID consistently using SHA-256.
 * @param {string} userId - The user ID to hash.
 * @returns {Promise<string>} The hashed user ID.
 */
export async function hashUserId(userId) {
    if (!userId || typeof userId !== 'string') return userId;

    try {
        const encoder = new TextEncoder();
        const data = encoder.encode(userId);
        const hashBuffer = await crypto.subtle.digest('SHA-256', data);

        // Convert buffer to hex string
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

        return hashHex;
    } catch (error) {
        console.error('UserIdHasher: Hashing failed', error);
        return userId; // Fallback to original if hashing fails
    }
}
