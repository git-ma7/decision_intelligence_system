/**
 * Module 4.1: Decision Capture System - Auth Module
 * Handles mock authentication and token management.
 */

// Initialize auth on extension startup
export async function initAuth() {
    try {
        const { auth } = await chrome.storage.local.get('auth');
        if (auth && auth.token) {
            // Check if token is expired
            if (auth.expiresAt && Date.now() > auth.expiresAt) {
                console.log('Auth: Token expired, logging out');
                await logout();
                return false;
            }
            return true;
        }
    } catch (error) {
        console.error('Auth: Initialization error', error);
    }
    return false;
}

// Mock login (accepts any credentials for now)
export async function login(username, password) {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));

    if (!username || !password) {
        throw new Error('Username and password required');
    }

    // Generate mock JWT and User ID
    const token = `mock-pwb-token-${Date.now()}-${Math.random().toString(36).substr(2)}`;
    const userId = `user-${Math.random().toString(36).substr(2, 9)}`;
    const expiresAt = Date.now() + (24 * 60 * 60 * 1000); // 24 hours

    const authData = {
        token,
        userId,
        expiresAt
    };

    // Save to storage
    await chrome.storage.local.set({ auth: authData });

    // Also initialize session if not present
    const { session } = await chrome.storage.local.get('session');
    if (!session || !session.currentSessionId) {
        await chrome.storage.local.set({
            session: {
                currentSessionId: `sess-${Date.now()}`,
                sessionStart: new Date().toISOString(),
                tabCount: 0
            }
        });
    }

    return { success: true, ...authData };
}

// Mock token verification
export async function verifyToken(token) {
    if (!token) return { valid: false };

    const { auth } = await chrome.storage.local.get('auth');
    if (!auth || auth.token !== token) {
        return { valid: false };
    }

    const isValid = auth.expiresAt > Date.now();
    if (!isValid) {
        await logout(); // Auto-logout if expired
    }

    return { valid: isValid, userId: auth.userId };
}

// Logout
export async function logout() {
    await chrome.storage.local.set({
        auth: {
            token: null,
            userId: null,
            expiresAt: null
        }
    });
    console.log('Auth: Logged out');
}
