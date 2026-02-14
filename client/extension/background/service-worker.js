// Module 4.1: Decision Capture System
// Background Service Worker - Main Entry Point

console.log('Decision Intelligence System - Module 4.1 initialized');

// Extension installation handler
chrome.runtime.onInstalled.addListener((details) => {
    if (details.reason === 'install') {
        console.log('Extension installed for the first time');
        // TODO: Initialize storage schema, show onboarding
    } else if (details.reason === 'update') {
        console.log('Extension updated to version:', chrome.runtime.getManifest().version);
    }
});

// Extension startup handler
chrome.runtime.onStartup.addListener(() => {
    console.log('Browser started, extension activated');
    // TODO: Initialize auth, load config, activate observers
});
