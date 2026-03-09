/**
 * Session Manager
 * Module 4.1 — Stage 4: Session Management & Event Correlation
 *
 * Scopes events to per-window sessions with a 30-minute timeout.
 */

const SESSION_TIMEOUT_MS = 30 * 60 * 1000;
let sessions = null;

/**
 * Load session state from storage.
 */
async function loadSessions() {
    if (sessions !== null) return sessions;
    try {
        const data = await chrome.storage.local.get('sessions');
        sessions = data.sessions || {};
    } catch (err) {
        console.error('SessionManager: Failed to load sessions', err);
        sessions = {};
    }
    return sessions;
}

/**
 * Save current session state to storage.
 */
async function saveSessions() {
    try {
        await chrome.storage.local.set({ sessions });
    } catch (err) {
        console.error('SessionManager: Failed to save sessions', err);
    }
}

/**
 * Assign a session to an event.
 * Scoped per windowId.
 *
 * @param {Object} event - Enriched event from Stage 3
 * @param {number} tabId
 * @param {number} windowId
 * @returns {Promise<Object>} Event with sessionId, sessionSequence, and sessionAge
 */
export async function assignSession(event, tabId, windowId) {
    const now = Date.now();
    const winId = windowId?.toString() || 'unknown';

    await loadSessions();

    let session = sessions[winId];

    // Check for expiration or non-existence
    if (!session || (now - session.lastEventTimestamp > SESSION_TIMEOUT_MS)) {
        session = {
            sessionId: crypto.randomUUID(),
            sessionStartTimestamp: now,
            lastEventTimestamp: now,
            sequence: 0,
            lastEventCategory: null
        };
        sessions[winId] = session;
    }

    // Update session state
    session.sequence += 1;
    session.lastEventTimestamp = now;

    // Fire-and-forget save to storage
    saveSessions();

    // Enrich event
    const sessionAge = Math.floor((now - session.sessionStartTimestamp) / 1000);

    return {
        ...event,
        sessionId: session.sessionId,
        sessionSequence: session.sequence,
        sessionAge: sessionAge
    };
}
