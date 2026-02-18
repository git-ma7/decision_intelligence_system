/**
 * TabObserver: Tracks attention shifts and visibility.
 * Crucial for detecting comparison behavior.
 */

export const tabObserver = {
    start(manager) {
        this.manager = manager;
        this.lastVisibilityChange = Date.now();

        document.addEventListener('visibilitychange', () => {
            const state = document.visibilityState;
            const durationSinceLast = Date.now() - this.lastVisibilityChange;
            this.lastVisibilityChange = Date.now();

            this.capture('tab_visibility', {
                state: state,
                duration_in_previous_state_ms: durationSinceLast
            });
        });

        window.addEventListener('focus', () => this.capture('window_focus', { focused: true }));
        window.addEventListener('blur', () => this.capture('window_focus', { focused: false }));
    },

    capture(type, data) {
        this.manager.notify(type, data);
    }
};
