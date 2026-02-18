/**
 * ScrollObserver: Tracks consumption depth and intensity.
 */

export const scrollObserver = {
    start(manager) {
        this.manager = manager;
        this.maxDepth = 0;
        this.lastScrollTime = Date.now();
        this.isThrottled = false;

        window.addEventListener('scroll', () => {
            if (this.isThrottled) return;

            this.isThrottled = true;
            setTimeout(() => {
                const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
                const scrollTop = window.scrollY;
                const depth = scrollHeight > 0 ? (scrollTop / scrollHeight) * 100 : 0;

                if (depth > this.maxDepth) {
                    this.maxDepth = depth;
                    this.capture('scroll_depth', {
                        depth_percent: Math.round(depth),
                        max_depth_reached: Math.round(this.maxDepth)
                    });
                }

                this.isThrottled = false;
            }, 1000); // 1-second throttle for performance
        });
    },

    capture(type, data) {
        this.manager.notify(type, data);
    }
};
