/**
 * Module 4.2 - Stage 4: Signal Rules
 */

export const signalRules = [
    // 1. Location Interest
    (session) => {
        const signals = [];
        const locations = new Set();
        session.enrichedEvents?.forEach(e => {
            if (e.classifiedEntities && e.classifiedEntities.location) {
                locations.add(e.classifiedEntities.location.toLowerCase());
            }
        });
        locations.forEach(loc => signals.push(`location_interest:${loc}`));
        return signals;
    },

    // 2. Travel Research Active
    (session) => {
        if (session.metrics?.uniqueDomains > 1) {
            return ["travel_research_active"];
        }
        return [];
    },

    // 3. Accommodation Browsing
    (session) => {
        if (session.behavioralFlags?.includes('accommodation_focus')) {
            return ["accommodation_browsing"];
        }
        return [];
    },

    // 4. High Intent Depth
    (session) => {
        if (session.metrics?.sessionDepth === 'deep') {
            return ["high_intent_depth"];
        }
        return [];
    },

    // 5. Date Awareness
    (session) => {
        const hasDateSelection = session.enrichedEvents?.some(e => e.urlSignals?.hasDateSelection === true);
        if (hasDateSelection) {
            return ["date_selection_detected"];
        }
        return [];
    }
];
