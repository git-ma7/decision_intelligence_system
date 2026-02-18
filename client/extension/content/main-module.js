/**
 * Module 4.1: Decision Capture System
 * Content Script Entry Point.
 */

import { observerManager } from './observer-manager.js';
import { navigationObserver } from './observers/navigation.js';
import { tabObserver } from './observers/tab.js';
import { inputObserver } from './observers/input.js';
import { scrollObserver } from './observers/scroll.js';
import { clickObserver } from './observers/click.js';
import { mediaObserver } from './observers/media.js';

async function main() {
    console.log('Decision Intelligence: Content Script Initializing...');

    // 1. Initialize Manager (Checks blacklist/config)
    await observerManager.init();

    // 2. Register Observers
    observerManager.register('navigation', navigationObserver);
    observerManager.register('tab', tabObserver);
    observerManager.register('input', inputObserver);
    observerManager.register('scroll', scrollObserver);
    observerManager.register('click', clickObserver);
    observerManager.register('media', mediaObserver);

    console.log('Decision Intelligence: All observers registered.');
}

// Start the engine
main().catch(err => console.error('Decision Intelligence: Initialization Error', err));
