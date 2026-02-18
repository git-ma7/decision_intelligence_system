/**
 * InputObserver: Tracks interaction with input fields (Intent Tokens).
 * Does NOT capture PII (field values).
 */

export const inputObserver = {
    start(manager) {
        this.manager = manager;

        // Use event delegation for dynamic inputs
        document.addEventListener('focusin', (e) => {
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.isContentEditable) {
                this.capture('input_interaction', {
                    action: 'focus',
                    fieldType: e.target.type || 'contenteditable',
                    fieldName: e.target.name || e.target.id || 'anonymous'
                });
            }
        });

        document.addEventListener('input', (e) => {
            // Throttled capture would be better here, but for now we just track "started typing"
            if (!this.typingStarted) {
                this.typingStarted = true;
                this.capture('input_interaction', {
                    action: 'started_typing',
                    fieldType: e.target.type || 'contenteditable'
                });
            }
        });

        document.addEventListener('focusout', () => {
            this.typingStarted = false;
        });
    },

    capture(type, data) {
        this.manager.notify(type, data);
    }
};
