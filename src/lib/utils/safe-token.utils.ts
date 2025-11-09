/**
 * Safe Token Utilities
 * 
 * A wrapper around EagleTokenManager that provides safe token operations
 * without causing security errors in client-side environments.
 */

import EagleTokenManager, { type EagleToken } from '@/lib/auth/token-manager';

export class SafeTokenUtils {
    /**
     * Get the current authentication token
     */
    static getToken(): string | null {
        try {
            if (typeof window === 'undefined') return null;
            return EagleTokenManager.getToken();
        } catch (error) {
            console.error('Error getting token:', error);
            return null;
        }
    }

    /**
     * Set authentication token
     */
    static setToken(token: string, options?: { rememberMe?: boolean; maxAge?: number }): boolean {
        try {
            if (typeof window === 'undefined') return false;
            return EagleTokenManager.setToken(token, options);
        } catch (error) {
            console.error('Error setting token:', error);
            return false;
        }
    }

    /**
     * Remove authentication token
     */
    static removeToken(): void {
        try {
            if (typeof window === 'undefined') return;
            EagleTokenManager.clearToken();
        } catch (error) {
            console.error('Error removing token:', error);
        }
    }

    /**
     * Check if user is authenticated
     */
    static isAuthenticated(): boolean {
        try {
            if (typeof window === 'undefined') return false;
            const state = EagleTokenManager.getAuthState();
            return state.isAuthenticated;
        } catch (error) {
            console.error('Error checking authentication:', error);
            return false;
        }
    }

    /**
     * Get user information from token
     */
    static getUserInfo(): EagleToken | null {
        try {
            if (typeof window === 'undefined') return null;
            return EagleTokenManager.getUserInfo();
        } catch (error) {
            console.error('Error getting user info:', error);
            return null;
        }
    }

    /**
     * Check if token is expired
     */
    static isTokenExpired(token: string): boolean {
        try {
            if (typeof window === 'undefined') return true;
            const state = EagleTokenManager.getAuthState();
            if (!state.token || state.token !== token) return true;
            return !state.isAuthenticated;
        } catch (error) {
            console.error('Error checking token expiry:', error);
            return true;
        }
    }

    /**
     * Get auth headers for API requests
     */
    static getAuthHeaders(): Record<string, string> {
        try {
            if (typeof window === 'undefined') return {};
            return EagleTokenManager.getAuthHeaders();
        } catch (error) {
            console.error('Error getting auth headers:', error);
            return {};
        }
    }

    /**
     * Check if user has a specific role
     */
    static hasRole(role: string): boolean {
        try {
            if (typeof window === 'undefined') return false;
            return EagleTokenManager.hasRole(role);
        } catch (error) {
            console.error('Error checking role:', error);
            return false;
        }
    }

    /**
     * Check if user is admin
     */
    static isAdmin(): boolean {
        try {
            if (typeof window === 'undefined') return false;
            return EagleTokenManager.isAdmin();
        } catch (error) {
            console.error('Error checking admin status:', error);
            return false;
        }
    }

    /**
     * Check if user has permission
     */
    static hasPermission(permission: string): boolean {
        try {
            if (typeof window === 'undefined') return false;
            return EagleTokenManager.hasPermission(permission);
        } catch (error) {
            console.error('Error checking permission:', error);
            return false;
        }
    }

    /**
     * Listen to auth state changes
     */
    static onAuthChange(callback: (state: any) => void): () => void {
        try {
            if (typeof window === 'undefined') return () => { };
            return EagleTokenManager.onAuthChange(callback);
        } catch (error) {
            console.error('Error subscribing to auth changes:', error);
            return () => { };
        }
    }
}
