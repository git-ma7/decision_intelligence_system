/**
 * MediaObserver: Tracks deep knowledge acquisition via video/audio.
 */

export const mediaObserver = {
    start(manager) {
        this.manager = manager;

        // Use event capture to detect media events on the page
        const mediaEvents = ['play', 'pause', 'seeked', 'ended'];

        mediaEvents.forEach(eventType => {
            document.addEventListener(eventType, (e) => {
                if (e.target.tagName === 'VIDEO' || e.target.tagName === 'AUDIO') {
                    this.capture('media_interaction', {
                        action: eventType,
                        mediaType: e.target.tagName.toLowerCase(),
                        currentTime: Math.round(e.target.currentTime),
                        duration: Math.round(e.target.duration),
                        src: e.target.currentSrc || 'blob/dynamic'
                    });
                }
            }, true); // Use capture phase
        });
    },

    capture(type, data) {
        this.manager.notify(type, data);
    }
};
