/**
 * Module 4.2 - Stage 2: Domain Mapper
 * Extracts domain from URL and maps to broad categories
 */

const DOMAIN_CATEGORY_MAP = {
    'agoda.com': 'accommodation',
    'booking.com': 'accommodation',
    'makemytrip.com': 'transport/accommodation',
    'google.com': 'search',
    'maps.google.com': 'navigation',
    'airbnb.com': 'accommodation',
    'expedia.com': 'transport/accommodation',
    'cleartrip.com': 'transport/accommodation',
    'flights.google.com': 'transport',
    'skyscanner.net': 'transport',
    'skyscanner.co.in': 'transport',
    'kayak.com': 'transport/accommodation'
};

/**
 * Extracts domain info and maps to category
 * @param {string} urlString - The URL to parse
 * @returns {Object} Domain info containing domain, subdomain, and category
 */
export function getDomainInfo(urlString) {
    if (!urlString) {
        return { domain: 'unknown', subdomain: 'unknown', category: 'unknown' };
    }

    try {
        const url = new URL(urlString);
        const hostname = url.hostname;
        
        // Extract domain and subdomain
        const parts = hostname.split('.');
        let domain = hostname;
        let subdomain = '';
        
        if (parts.length > 2) {
            // Check for ccTLDs like .co.uk, .com.au, .co.in
            const isCCTLD = parts[parts.length - 2].length <= 3 && parts[parts.length - 1].length <= 2;
            
            if (isCCTLD && parts.length > 3) {
                domain = parts.slice(-3).join('.');
                subdomain = parts.slice(0, -3).join('.');
            } else {
                domain = parts.slice(-2).join('.');
                subdomain = parts.slice(0, -2).join('.');
            }
        }

        // Exact match or partial match fallback for known maps
        let category = 'unknown';
        if (DOMAIN_CATEGORY_MAP[hostname]) {
            category = DOMAIN_CATEGORY_MAP[hostname];
        } else if (DOMAIN_CATEGORY_MAP[domain]) {
            category = DOMAIN_CATEGORY_MAP[domain];
        } else {
            // Basic inference if not in map
            if (hostname.includes('hotel') || hostname.includes('stay') || hostname.includes('accommodation')) {
                category = 'accommodation';
            } else if (hostname.includes('flight') || hostname.includes('airline') || hostname.includes('transport')) {
                category = 'transport';
            } else if (hostname.includes('search')) {
                category = 'search';
            } else if (hostname.includes('map')) {
                category = 'navigation';
            }
        }

        return {
            domain: hostname, // Full hostname used as domain for exactness
            baseDomain: domain,
            subdomain,
            category
        };
    } catch (error) {
        console.warn(`Domain Mapper: Invalid URL string - ${urlString}`);
        return { domain: 'invalid', subdomain: 'invalid', category: 'invalid' };
    }
}
