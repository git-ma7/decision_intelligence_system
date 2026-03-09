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

    // 2. Correlation detection
    const correlations = detectCorrelation(event, session);

    // Update last category for next correlation
    session.lastEventCategory = event.category || null;

    // Enrich event
    const sessionAge = Math.floor((now - session.sessionStartTimestamp) / 1000);

    const enrichedEvent = {
        ...event,
        sessionId: session.sessionId,
        sessionSequence: session.sequence,
        sessionAge: sessionAge
    };

    if (correlations.length > 0) {
        enrichedEvent.correlations = correlations;
    }

    return enrichedEvent;
}

/**
 * Detect correlations between current event and previous session state.
 *
 * @param {Object} event
 * @param {Object} session
 * @returns {string[]} Array of correlation tags
 */
function detectCorrelation(event, session) {
    const correlations = [];

    // search -> navigation correlation
    // If previous event was category 'search' and current event is NOT 'search' (and not null)
    if (session.lastEventCategory === 'search' && event.category && event.category !== 'search') {
        correlations.push('search_to_navigation');
    }

    return correlations;
}
