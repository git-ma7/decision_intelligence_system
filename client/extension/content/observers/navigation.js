/**
 * NavigationObserver: Captures page-level navigation events.
 * Focuses on SPA transitions and initial load metadata.
 */

export const navigationObserver = {
    start(manager) {
        this.manager = manager;

        // Capture SPA history changes
        window.addEventListener('popstate', () => this.capture('spa_navigation', { method: 'popstate' }));
        window.addEventListener('hashchange', () => this.capture('spa_navigation', { method: 'hashchange' }));

        // Capture initial page stats
        this.capture('page_load', {
            referrer: document.referrer,
            title: document.title,
            performance: window.performance ? window.performance.timing.navigationStart : null
        });
    },

    capture(type, data) {
        this.manager.notify(type, data);
    }
};
