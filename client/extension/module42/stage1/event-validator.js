/**
 * Validates each event to ensure it has required properties.
 * @param {Object} event
 * @returns {boolean}
 */
export function validateEvent(event) {
    if (!event) return false;
    
    // Validate required fields
    if (!event.id || !event.timestamp || !event.sessionId) {
        return false;
    }
    
    return true;
}

/**
 * Filters out invalid events gracefully.
 * @param {Array} events 
 * @returns {Array} List of valid events.
 */
export function filterValidEvents(events) {
    if (!Array.isArray(events)) {
        console.warn('EventValidator: Input is not an array.');
        return [];
    }
    
    const validEvents = events.filter(validateEvent);
    
    if (validEvents.length < events.length) {
        console.warn(`EventValidator: Filtered out ${events.length - validEvents.length} invalid events.`);
    }
    
    return validEvents;
}
