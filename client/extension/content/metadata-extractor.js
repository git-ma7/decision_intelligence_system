    /**
 * metadata-extractor.js
 * Module 4.1 — Stage 3: Event Enrichment
 *
 * Content script: runs in the page context where DOM is accessible.
 * Background scripts cannot read the DOM, so metadata extraction lives here.
 *
 * NOTE: This file is a plain (non-module) content script.
 * Chrome MV3 does not support "type: module" for manifest-registered
 * content scripts, so no import/export statements are used here.
 */

(function () {
    'use strict';

    // ─── Helpers ────────────────────────────────────────────────────────────

    /**
     * Read a <meta> element's content by name or property attribute.
     * @param {string} selector - CSS selector for the meta element
     * @returns {string}
     */
    function getMetaContent(selector) {
        const el = document.querySelector(selector);
        return el ? (el.getAttribute('content') || '').trim() : '';
    }

    // ─── Core Extraction ────────────────────────────────────────────────────

    /**
     * Extract standard page metadata from the current DOM.
     * @returns {Object}
     */
    function extractPageMetadata() {
        return {
            title: (document.title || '').trim(),
            description: getMetaContent('meta[name="description"]'),
            keywords: getMetaContent('meta[name="keywords"]'),
            og_title: getMetaContent('meta[property="og:title"]'),
            og_description: getMetaContent('meta[property="og:description"]'),
            language: (document.documentElement.lang || '').trim()
        };
    }

    /**
     * Extract all JSON-LD structured data from the page.
     * @returns {Array<Object>}
     */
    function extractStructuredData() {
        const results = [];
        const scripts = document.querySelectorAll('script[type="application/ld+json"]');

        scripts.forEach((script) => {
            try {
                const parsed = JSON.parse(script.textContent);
                results.push(parsed);
            } catch (e) {
                // Malformed JSON-LD — skip silently
            }
        });

        return results;
    }

    // ─── Message Interface ───────────────────────────────────────────────────

    /**
     * Listen for REQUEST_METADATA messages from the enrichment pipeline
     * (sent by chrome.tabs.sendMessage from the service worker context).
     * Respond with PAGE_METADATA containing extracted data.
     */
    chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
        if (message.type !== 'REQUEST_METADATA') return false;

        try {
            const metadata = extractPageMetadata();
            const structuredData = extractStructuredData();

            sendResponse({
                type: 'PAGE_METADATA',
                metadata: metadata,
                structuredData: structuredData
            });
        } catch (err) {
            // Graceful degradation: respond with empty metadata on failure
            console.warn('DecisionIntelligence [metadata-extractor]: extraction failed', err);
            sendResponse({
                type: 'PAGE_METADATA',
                metadata: { title: '', description: '', keywords: '', og_title: '', og_description: '', language: '' },
                structuredData: []
            });
        }

        return true; // Keep message channel open for async sendResponse
    });

    console.log('DecisionIntelligence [metadata-extractor]: ready on', window.location.hostname);

}());
