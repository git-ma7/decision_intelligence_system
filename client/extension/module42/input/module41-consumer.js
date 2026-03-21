import { eventBus } from '../../background/event-bus.js';
import { processBatch } from '../stage1/batch-processor.js';

/**
 * Initializes the consumer to listen for batches from Module 4.1.
 */
export function initializeModule41Consumer() {
    eventBus.subscribe('scrubbed-batch-ready', (batch) => {
        try {
            processBatch(batch);
        } catch (error) {
            console.error('Module41Consumer: Error processing batch', error);
        }
    });
    console.log('Module 4.1 Consumer initialized - listening for scrubbed-batch-ready');
}
