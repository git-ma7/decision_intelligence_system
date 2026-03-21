/**
 * Groups a sorted array of events by sessionId.
 * @param {Array} sortedEvents - Array of valid, sorted events.
 * @returns {Array} Array of session objects.
 */
export function groupEventsBySession(sortedEvents) {
    const groups = new Map();

    for (const event of sortedEvents) {
        if (!groups.has(event.sessionId)) {
            groups.set(event.sessionId, {
                sessionId: event.sessionId,
                events: [],
                eventCount: 0,
                startTime: event.timestamp,
                endTime: event.timestamp
            });
        }
        
        const group = groups.get(event.sessionId);
        group.events.push(event);
        group.eventCount += 1;
        
        // Update startTime and endTime if needed
        const eventTime = new Date(event.timestamp).getTime();
        const startTime = new Date(group.startTime).getTime();
        const endTime = new Date(group.endTime).getTime();
        
        if (eventTime < startTime) group.startTime = event.timestamp;
        if (eventTime > endTime) group.endTime = event.timestamp;
    }

    return Array.from(groups.values());
}
