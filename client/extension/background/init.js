/**
 * Module 4.1: Decision Capture System - Init Module
 * Handles extension initialization and storage schema setup.
 */

import { initAuth } from './auth.js';
import { initBuffer } from './buffer/event-buffer.js';

const DEFAULT_SCHEMA = {
    // Authentication State
    auth: {
        token: null,
        userId: null,
        expiresAt: null
    },

    // Remote Configuration
    config: {
        blacklistDomains: [],
        minDwellTime: 3000,
        captureEnabled: true
    },

    // Session Tracking
    session: {
        currentSessionId: null,
        sessionStart: null,
        tabCount: 0
    },

    // Event Buffer
    events: []
};

// First-time installation handler
export async function onInstalled(details) {
    if (details.reason === 'install') {
        console.log('Init: First install detected, setting up storage schema...');

        // Initialize storage with default schema
        // We use get first to avoid overwriting if for some reason data exists
        const current = await chrome.storage.local.get(null);
        if (Object.keys(current).length === 0) {
            await chrome.storage.local.set(DEFAULT_SCHEMA);
            console.log('Init: Storage schema initialized');
        }

        // Open popup to welcome user (optional, can be removed if too intrusive)
        // chrome.action.openPopup(); // Note: openPopup is only available in specific contexts
    } else if (details.reason === 'update') {
        console.log('Init: Extension updated');
        // Migration logic would go here if schema changes
    }
}

// Browser startup handler
export async function onStartup() {
    console.log('Init: Browser startup sequence initiated');

    // 1. Initialize Auth
    await initAuth();

    // 2. Initialize Buffer
    await initBuffer();

    // 3. Refresh Session
    await initSession();

    // 3. Load Config (Placeholder for now)
    await loadConfig();

    console.log('Init: Startup sequence complete');
}

// Initialize/Refresh Session
async function initSession() {
    const sessionId = `sess-${Date.now()}`;

    // We keep the old session stats? For now, let's reset session state for a new browser session
    await chrome.storage.local.set({
        session: {
            currentSessionId: sessionId,
            sessionStart: new Date().toISOString(),
            tabCount: 0
        }
    });

    console.log('Init: New session started:', sessionId);
}

// Load user config (mock)
async function loadConfig() {
    const { config } = await chrome.storage.local.get('config');
    if (!config) {
        // Restore defaults if missing
        await chrome.storage.local.set({ config: DEFAULT_SCHEMA.config });
    }
    return config || DEFAULT_SCHEMA.config;
}
