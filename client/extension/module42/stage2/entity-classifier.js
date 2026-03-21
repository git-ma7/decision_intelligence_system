/**
 * Module 4.2 - Stage 2: Entity Classifier
 * Context-level classification of extracted entities into location, brand, category, or other.
 */

// Small keyword lists (no large datasets)
const KNOWN_BRANDS = new Set([
    'marriott', 'taj', 'oyo', 'hilton', 'hyatt', 'radisson', 'itc', 'lemon tree', 
    'indigo', 'air india', 'spicejet', 'vistara', 'goair', 'akasa'
]);

const KNOWN_CATEGORIES = new Set([
    'hotel', 'resort', 'flight', 'villa', 'apartment', 'hostel', 'homestay',
    'flights', 'hotels', 'resorts', 'villas', 'apartments', 'hostels', 'homestays',
    'cab', 'taxi', 'train', 'bus'
]);

/**
 * Classifies an array of entities based on context
 * @param {string[]} entities - List of extracted entities
 * @param {string} urlString - Original URL
 * @param {Object} domainInfo - Domain info object from Domain Mapper
 * @returns {Object} Classified entities object
 */
export function classifyEntities(entities, urlString, domainInfo) {
    const result = {
        location: [],
        brand: [],
        category: [],
        other: []
    };

    if (!Array.isArray(entities) || entities.length === 0) {
        return result;
    }

    let urlPathAndQuery = '';
    try {
        const urlObj = new URL(urlString);
        urlPathAndQuery = (urlObj.pathname + urlObj.search).toLowerCase();
    } catch(e) {
        urlPathAndQuery = urlString.toLowerCase();
    }

    const isTravelDomain = 
        domainInfo.category === 'accommodation' || 
        domainInfo.category === 'transport/accommodation' || 
        domainInfo.category === 'transport';

    for (const entity of entities) {
        if (!entity || typeof entity !== 'string') continue;
        
        const entityLower = entity.trim().toLowerCase();
        
        // 1. Check Brand Strategy
        if (KNOWN_BRANDS.has(entityLower)) {
            result.brand.push(entity);
            continue;
        }

        // 2. Check Category Strategy
        if (KNOWN_CATEGORIES.has(entityLower)) {
            result.category.push(entity);
            continue;
        }

        // 3. Check Context-Based Location Strategy
        // If it appears in URL path/query AND domain is travel related AND not a brand/category -> Location
        // E.g., agoda.com/.../goa-vagator... -> goa and vagator are locations
        
        // Sometimes entities in URL are separated by dashes or encoded spaces
        const entityInUrlFormat = encodeURIComponent(entityLower); // handles spaces
        const entityDashFormat = entityLower.replace(/\\s+/g, '-');
        const entityJoinedFormat = entityLower.replace(/\\s+/g, '');
        
        const appearsInUrl = 
            urlPathAndQuery.includes(entityLower) || 
            urlPathAndQuery.includes(entityDashFormat) || 
            urlPathAndQuery.includes(entityJoinedFormat) ||
            urlPathAndQuery.includes(entityInUrlFormat);

        if (appearsInUrl && isTravelDomain) {
            result.location.push(entity);
            continue;
        }

        // 4. Fallback
        result.other.push(entity);
    }

    return result;
}
