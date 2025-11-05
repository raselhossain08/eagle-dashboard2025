// Token Setter Utility
import { CookieManager } from './cookie-manager';
import { TokenUtils } from './token.utils';

export class TokenSetter {
  /**
   * Set authentication token with proper configuration
   */
  static setToken(token: string, options?: {
    maxAge?: number;
    secure?: boolean;
    persistent?: boolean;
  }): void {
    const { maxAge = 7 * 24 * 60 * 60, secure, persistent = true } = options || {};
    
    if (persistent) {
      CookieManager.setPersistent('token', token, maxAge / (24 * 60 * 60)); // Convert to days
    } else {
      CookieManager.setSession('token', token);
    }

    // Also set in localStorage for client-side access
    if (typeof window !== 'undefined') {
      localStorage.setItem('token', token);
      localStorage.setItem('tokenTimestamp', Date.now().toString());
    }
  }

  /**
   * Set refresh token
   */
  static setRefreshToken(refreshToken: string): void {
    CookieManager.setPersistent('refreshToken', refreshToken, 30); // 30 days
    
    if (typeof window !== 'undefined') {
      localStorage.setItem('refreshToken', refreshToken);
    }
  }

  /**
   * Set user information along with token
   */
  static setUserSession(token: string, user: any, refreshToken?: string): void {
    this.setToken(token);
    
    if (refreshToken) {
      this.setRefreshToken(refreshToken);
    }

    // Store user info
    CookieManager.setJSON('user', user);
    
    if (typeof window !== 'undefined') {
      localStorage.setItem('user', JSON.stringify(user));
    }
  }

  /**
   * Clear all authentication data
   */
  static clearSession(): void {
    CookieManager.remove('token');
    CookieManager.remove('refreshToken');
    CookieManager.remove('user');
    
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      localStorage.removeItem('tokenTimestamp');
    }
  }

  /**
   * Update token expiration
   */
  static refreshTokenExpiry(token?: string): void {
    const currentToken = token || TokenUtils.getToken();
    if (currentToken) {
      this.setToken(currentToken, { persistent: true });
    }
  }

  /**
   * Set temporary token (session only)
   */
  static setTemporaryToken(token: string): void {
    this.setToken(token, { persistent: false });
  }

  /**
   * Set secure production token
   */
  static setSecureToken(token: string, options?: {
    maxAge?: number;
    httpOnly?: boolean;
  }): void {
    const { maxAge = 7 * 24 * 60 * 60, httpOnly = false } = options || {};
    
    CookieManager.setSecure('token', token, {
      maxAge,
      httpOnly,
      path: '/',
      sameSite: 'strict'
    });

    if (!httpOnly && typeof window !== 'undefined') {
      localStorage.setItem('token', token);
      localStorage.setItem('tokenTimestamp', Date.now().toString());
    }
  }

  /**
   * Check if token needs refresh
   */
  static shouldRefreshToken(): boolean {
    const tokenTimestamp = typeof window !== 'undefined' ? 
      localStorage.getItem('tokenTimestamp') : null;
    
    if (!tokenTimestamp) return true;
    
    const tokenAge = Date.now() - parseInt(tokenTimestamp);
    const sixHours = 6 * 60 * 60 * 1000;
    
    return tokenAge > sixHours;
  }

  /**
   * Get token with automatic refresh check
   */
  static getTokenWithRefresh(): string | null {
    const token = TokenUtils.getToken();
    
    if (!token) return null;
    
    // If token is about to expire, trigger refresh
    if (this.shouldRefreshToken()) {
      // Emit event for token refresh
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('tokenRefreshNeeded'));
      }
    }
    
    return token;
  }
}

export default TokenSetter;