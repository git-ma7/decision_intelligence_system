/**
 * Module 4.2 - Stage 2: URL Intent Parser
 * Extracts useful signals from URL parameters without deep intent classification.
 */

/**
 * Extracts useful signals from URL
 * @param {string} urlString - URL to parse
 * @returns {Object} Extracted signals
 */
export function parseUrlIntent(urlString) {
    const result = {
        hasTravelIntent: false,
        hasDateSelection: false,
        metadata: {}
    };

    if (!urlString) {
        return result;
    }

    try {
        const urlObj = new URL(urlString);
        const searchParams = urlObj.searchParams;

        // Check for date selection
        const checkInParams = ['checkin', 'checkIn', 'ci', 'startDate', 'start'];
        for (const param of checkInParams) {
            if (searchParams.has(param)) {
                result.hasDateSelection = true;
                result.metadata.checkIn = searchParams.get(param);
                break;
            }
        }

        const checkOutParams = ['checkout', 'checkOut', 'co', 'endDate', 'end'];
        for (const param of checkOutParams) {
            if (searchParams.has(param)) {
                result.hasDateSelection = true; // Still counts as date selection
                result.metadata.checkOut = searchParams.get(param);
                break;
            }
        }

        // Length of stay
        if (searchParams.has('los')) {
            result.metadata.stayLength = parseInt(searchParams.get('los'), 10);
            result.hasDateSelection = true;
        }

        // Group size (adults, guests, rooms, children)
        const guestParams = ['adults', 'guests', 'pax', 'room1'];
        for (const param of guestParams) {
            if (searchParams.has(param)) {
                const val = searchParams.get(param);
                if (val && !isNaN(val)) {
                    result.metadata.guests = parseInt(val, 10);
                    break;
                }
            }
        }

        // Search intent
        const urlLower = urlString.toLowerCase();
        if (
            urlLower.includes('/search') || 
            searchParams.has('q') || 
            searchParams.has('query') || 
            searchParams.has('search')
        ) {
            result.metadata.hasSearchParam = true;
        }

        // Base travel intent presence (is it looking for dates + guests?)
        if (result.hasDateSelection || result.metadata.guests) {
            result.hasTravelIntent = true;
        }
    } catch(e) {
        console.warn(`URL Intent Parser: Invalid URL string - ${urlString}`);
    }

    return result;
}
