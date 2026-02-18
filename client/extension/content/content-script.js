/**
 * content-script.js: Proxy loader to enable ESM in content scripts.
 */
(async () => {
    try {
        const src = chrome.runtime.getURL('content/main-module.js');
        await import(src);
    } catch (error) {
        console.error('Decision Intelligence: Module Load Failed', error);
    }
})();
