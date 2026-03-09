/**
 * enrichment.js
 * Module 4.1 — Stage 3: Event Enrichment Pipeline
 *
 * Runs in the service worker (background) context.
 * Transforms raw Stage 2 events into context-rich enriched events.
 *
 * Pipeline per event:
 *   attachMetadata → categorizeURL → extractEntities → addTemporalContext → addTabContext
 */

// ─── In-Memory Metadata Cache ─────────────────────────────────────────────────
// Keyed by tabId. Avoids repeated DOM scraping for the same tab.
const tabMetadataCache = {};

// Dwell time threshold (ms) above which we also fetch metadata for non-navigation events
const DWELL_THRESHOLD_MS = 5000;

// ─── Stopwords for Entity Extraction ─────────────────────────────────────────
const STOPWORDS = new Set([
    'the', 'and', 'for', 'are', 'but', 'not', 'you', 'all', 'can', 'had',
    'her', 'was', 'one', 'our', 'out', 'day', 'get', 'has', 'him', 'his',
    'how', 'its', 'may', 'now', 'old', 'see', 'two', 'who', 'did', 'own',
    'say', 'she', 'too', 'use', 'www', 'com', 'org', 'net', 'html', 'http',
    'https', 'php', 'asp', 'from', 'with', 'this', 'that', 'what', 'will',
    'your', 'they', 'been', 'have', 'more', 'when', 'than', 'then', 'into',
    'also', 'some', 'would', 'about', 'there', 'their', 'which', 'first',
    'other', 'these', 'those', 'page', 'home', 'site', 'link', 'read', 'view'
]);

// ─── 1. attachMetadata ────────────────────────────────────────────────────────

/**
 * Request page metadata from the content script running in the event's tab.
 * Uses an in-memory cache to avoid repeated DOM scraping.
 * Only fetches for navigation events or high-dwell events.
 *
 * @param {Object} event - Raw observer event
 * @returns {Object} event enriched with a `metadata` field
 */
async function attachMetadata(event) {
    const tabId = event.properties?.tabId ?? null;
    const isNavigation = event.type === 'navigation' || event.type === 'page_load' || event.type === 'spa_navigation';
    const isHighDwell = (event.properties?.dwell_time ?? 0) > DWELL_THRESHOLD_MS;

    // Only fetch metadata for qualifying events
    if (!isNavigation && !isHighDwell) {
        return { ...event, metadata: tabMetadataCache[tabId] ?? {} };
    }

    // Serve from cache if available
    if (tabId !== null && tabMetadataCache[tabId]) {
        return { ...event, metadata: tabMetadataCache[tabId] };
    }

    // Determine which tab to query for metadata
    let targetTabId = tabId;

    if (targetTabId === null) {
        try {
            const tabs = await chrome.tabs.query({ active: true, lastFocusedWindow: true });
            targetTabId = tabs.length > 0 ? tabs[0].id : null;
        } catch (_) {
            targetTabId = null;
        }
    }

    if (targetTabId === null) {
        return { ...event, metadata: {} };
    }

    // Request metadata from content script
    try {
        const response = await new Promise((resolve, reject) => {
            chrome.tabs.sendMessage(
                targetTabId,
                { type: 'REQUEST_METADATA' },
                (res) => {
                    if (chrome.runtime.lastError) {
                        reject(new Error(chrome.runtime.lastError.message));
                    } else {
                        resolve(res);
                    }
                }
            );
        });

        const meta = {
            ...(response?.metadata ?? {}),
            structuredData: response?.structuredData ?? []
        };

        // Cache result
        tabMetadataCache[targetTabId] = meta;

        return { ...event, metadata: meta };

    } catch (err) {
        // Graceful degradation — enrich with empty metadata rather than failing
        console.warn('Enrichment [attachMetadata]: could not fetch metadata', err.message);
        return { ...event, metadata: {} };
    }
}

// ─── 2. categorizeURL ─────────────────────────────────────────────────────────

/**
 * Heuristic URL → category mapping.
 *
 * @param {string} url
 * @returns {string} category label
 */
function categorizeURL(url) {
    if (!url) return 'general';

    try {
        const { hostname, pathname, search } = new URL(url);
        const host = hostname.toLowerCase();
        const path = pathname.toLowerCase();
        const query = search.toLowerCase();

        // Search engines
        if (
            (host.includes('google.') && (path.startsWith('/search') || query.includes('q='))) ||
            host.includes('bing.com') ||
            host.includes('duckduckgo.com') ||
            host.includes('search.yahoo.com') ||
            host.includes('ecosia.org')
        ) return 'search';

        // E-commerce
        if (
            host.includes('amazon.') ||
            host.includes('ebay.') ||
            host.includes('etsy.com') ||
            host.includes('shopify.com') ||
            host.includes('flipkart.com') ||
            host.includes('walmart.com') ||
            host.includes('aliexpress.com') ||
            host.includes('shop.')
        ) return 'ecommerce';

        // Video / streaming
        if (
            host.includes('youtube.com') ||
            host.includes('youtu.be') ||
            host.includes('vimeo.com') ||
            host.includes('twitch.tv') ||
            host.includes('netflix.com') ||
            host.includes('primevideo.com') ||
            host.includes('disneyplus.com') ||
            host.includes('hotstar.com')
        ) return 'video';

        // Social media
        if (
            host.includes('reddit.com') ||
            host.includes('twitter.com') ||
            host.includes('x.com') ||
            host.includes('facebook.com') ||
            host.includes('instagram.com') ||
            host.includes('linkedin.com') ||
            host.includes('threads.net') ||
            host.includes('mastodon.')
        ) return 'social';

        // Developer tools / code
        if (
            host.includes('github.com') ||
            host.includes('gitlab.com') ||
            host.includes('bitbucket.org') ||
            host.includes('stackoverflow.com') ||
            host.includes('codepen.io') ||
            host.includes('replit.com') ||
            host.includes('jsfiddle.net') ||
            host.includes('codesandbox.io')
        ) return 'developer_tools';

        // Documentation / reference
        if (
            host.startsWith('docs.') ||
            host.includes('developer.') ||
            host.includes('wiki.') ||
            host.includes('confluence.') ||
            host.includes('notion.so') ||
            host.includes('readthedocs.io') ||
            path.includes('/docs/') ||
            path.includes('/wiki/')
        ) return 'documentation';

        // News & media
        if (
            host.includes('news.') ||
            host.includes('medium.com') ||
            host.includes('substack.com') ||
            host.includes('techcrunch.com') ||
            host.includes('theverge.com') ||
            host.includes('bbc.') ||
            host.includes('cnn.com') ||
            host.includes('nytimes.com') ||
            host.includes('ycombinator.com')
        ) return 'news';

    } catch (_) {
        // Malformed URL
    }

    return 'general';
}

// ─── 3. extractEntities ───────────────────────────────────────────────────────

/**
 * Extract meaningful keywords from the page title and URL path.
 * Removes stopwords and tokens shorter than 3 characters.
 *
 * @param {string} title
 * @param {string} url
 * @returns {string[]} deduplicated keyword array
 */
function extractEntities(title = '', url = '') {
    const tokens = new Set();

    // Tokenize title
    const titleTokens = title
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, ' ')
        .split(/\s+/);

    // Tokenize URL path segments
    let pathTokens = [];
    try {
        const { pathname } = new URL(url);
        pathTokens = pathname
            .toLowerCase()
            .split(/[\/\-_\.\s]+/)
            .filter(Boolean);
    } catch (_) { }

    for (const token of [...titleTokens, ...pathTokens]) {
        if (token.length >= 3 && !STOPWORDS.has(token) && !/^\d+$/.test(token)) {
            tokens.add(token);
        }
    }

    return Array.from(tokens).slice(0, 20); // cap at 20 entities
}

// ─── 4. addTemporalContext ────────────────────────────────────────────────────

/**
 * Attach temporal fields derived from a timestamp.
 *
 * @param {string|number} timestamp - ISO string or epoch ms
 * @returns {Object} temporal context object
 */
function addTemporalContext(timestamp) {
    const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

    try {
        const date = new Date(timestamp);
        const hour = date.getHours();

        let time_of_day;
        if (hour >= 6 && hour < 12) time_of_day = 'morning';
        else if (hour >= 12 && hour < 18) time_of_day = 'afternoon';
        else if (hour >= 18 && hour < 22) time_of_day = 'evening';
        else time_of_day = 'night';

        return {
            day_of_week: DAYS[date.getDay()],
            hour: hour,
            time_of_day: time_of_day
        };

    } catch (_) {
        return { day_of_week: null, hour: null, time_of_day: null };
    }
}

// ─── 5. addTabContext ─────────────────────────────────────────────────────────

/**
 * Query the number of open tabs in the current window at the time of the event.
 *
 * @returns {Object} tabContext object
 */
async function addTabContext() {
    try {
        const tabs = await chrome.tabs.query({ currentWindow: true });
        return { tab_count_at_time_of_event: tabs.length };
    } catch (_) {
        // Fallback: query all tabs
        try {
            const allTabs = await chrome.tabs.query({});
            return { tab_count_at_time_of_event: allTabs.length };
        } catch (_) {
            return { tab_count_at_time_of_event: null };
        }
    }
}

// ─── Core Pipeline ────────────────────────────────────────────────────────────

/**
 * Enrich a single raw observer event with metadata, category, entities,
 * temporal context, and tab context.
 *
 * @param {Object} event - Raw event from Stage 2 observers
 * @returns {Promise<Object>} Enriched event
 */
async function enrichEvent(event) {
    try {
        // Step 1: Attach DOM metadata (may use cache)
        const withMeta = await attachMetadata(event);

        // Step 2: Categorize by URL
        const category = categorizeURL(event.url);

        // Step 3: Extract entities from title + URL
        const title = withMeta.metadata?.title ?? withMeta.metadata?.og_title ?? '';
        const entities = extractEntities(title, event.url ?? '');

        // Step 4: Temporal context from event timestamp
        const temporal = addTemporalContext(event.timestamp);

        // Step 5: Tab context
        const tabContext = await addTabContext();

        return {
            ...withMeta,
            category,
            entities,
            temporal,
            tabContext
        };

    } catch (err) {
        // Never block storage — return partially enriched event on failure
        console.error('Enrichment [enrichEvent]: pipeline error', err.message);
        return {
            ...event,
            metadata: {},
            category: categorizeURL(event.url),
            entities: [],
            temporal: addTemporalContext(event.timestamp),
            tabContext: { tab_count_at_time_of_event: null }
        };
    }
}

export { enrichEvent };
