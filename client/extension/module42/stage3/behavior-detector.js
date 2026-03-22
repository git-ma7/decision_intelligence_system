/**
 * Module 4.2 - Stage 3: Behavior Detector
 * Detects behavioral patterns from enriched events.
 */

export function detectBehaviors(events, metrics) {
  const flags = new Set();
  if (!events || events.length === 0) return Array.from(flags);

  const locations = new Map();
  let accommodationEventsCount = 0;
  let hasSearch = false;

  events.forEach(e => {
    // 1. Collect locations
    if (e.classifiedEntities && Array.isArray(e.classifiedEntities.location)) {
      e.classifiedEntities.location.forEach(loc => {
        const lowerLoc = loc.toLowerCase();
        locations.set(lowerLoc, (locations.get(lowerLoc) || 0) + 1);
      });
    }

    if (e.domainInfo && e.domainInfo.category) {
      const category = e.domainInfo.category;
      
      // Track search
      if (category === 'search') {
        hasSearch = true;
      }

      // Check transitions and focus
      if (category.includes('accommodation')) {
        accommodationEventsCount++;
        if (hasSearch) {
          flags.add("search_to_detail_transition");
        }
      } else if (category === 'navigation') {
        if (hasSearch) {
          flags.add("search_to_detail_transition");
        }
      }
    }
  });

  // 1. repeated_location_focus
  for (const count of locations.values()) {
    if (count > 1) {
      flags.add("repeated_location_focus");
      break;
    }
  }

  // 2. multi_domain_navigation
  if (metrics.uniqueDomains > 1) {
    flags.add("multi_domain_navigation");
  }

  // 3. accommodation_focus
  if (events.length > 0 && (accommodationEventsCount / events.length) > 0.5) {
    flags.add("accommodation_focus");
  }

  // 4. high_engagement
  // deep session + low averageEventGap (<15000ms arbitrarily chosen as "low" for a browsing session)
  if (metrics.sessionDepth === "deep" && metrics.averageEventGap < 15000) {
    flags.add("high_engagement");
  }

  return Array.from(flags);
}
