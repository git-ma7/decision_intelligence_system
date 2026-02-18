/**
 * ClickObserver: Tracks micro-decisions and CTA engagements.
 */

export const clickObserver = {
    start(manager) {
        this.manager = manager;

        document.addEventListener('click', (e) => {
            const target = e.target;

            // Production Pattern: Identify significant elements
            const significantTags = ['BUTTON', 'A', 'INPUT', 'SELECT', 'SUMMARY'];
            const isSignificant = significantTags.includes(target.tagName) ||
                target.getAttribute('role') === 'button' ||
                target.closest('button, a');

            if (isSignificant) {
                const element = target.closest('button, a') || target;
                this.capture('click', {
                    tagName: element.tagName,
                    text: (element.innerText || element.value || '').substring(0, 50).trim(),
                    id: element.id || null,
                    classes: element.className || null,
                    href: element.href || null
                });
            }
        });
    },

    capture(type, data) {
        this.manager.notify(type, data);
    }
};
