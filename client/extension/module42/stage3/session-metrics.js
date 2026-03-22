/**
 * Module 4.2 - Stage 3: Session Metrics
 * Computes session-level metrics from a list of enriched events.
 */

export function computeSessionMetrics(events) {
  if (!events || events.length === 0) {
    return {
      eventCount: 0,
      sessionDuration: 0,
      uniqueDomains: 0,
      averageEventGap: 0,
      sessionDepth: "shallow"
    };
  }

  const eventCount = events.length;
  
  // Create a copy and sort by timestamp
  const sortedEvents = [...events].sort((a, b) => {
    const timeA = a.enrichedAt || a.originalEvent?.timestamp || 0;
    const timeB = b.enrichedAt || b.originalEvent?.timestamp || 0;
    return timeA - timeB;
  });

  const firstEventTime = sortedEvents[0].enrichedAt || sortedEvents[0].originalEvent?.timestamp || 0;
  const lastEventTime = sortedEvents[eventCount - 1].enrichedAt || sortedEvents[eventCount - 1].originalEvent?.timestamp || 0;
  
  const sessionDuration = Math.max(0, lastEventTime - firstEventTime);

  const domains = new Set();
  sortedEvents.forEach(e => {
    if (e.domainInfo && e.domainInfo.domain) {
      domains.add(e.domainInfo.domain);
    }
  });
  const uniqueDomains = domains.size;

  let averageEventGap = 0;
  if (eventCount > 1) {
    averageEventGap = sessionDuration / (eventCount - 1);
  }

  let sessionDepth = "shallow";
  if (eventCount > 30) {
    sessionDepth = "deep";
  } else if (eventCount >= 10) {
    sessionDepth = "medium";
  }

  return {
    eventCount,
    sessionDuration,
    uniqueDomains,
    averageEventGap: Math.round(averageEventGap),
    sessionDepth
  };
}
