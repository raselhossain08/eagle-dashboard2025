// Cookie Manager Utility
import { getCookie, setCookie, deleteCookie } from 'cookies-next';

// Cookie options type
interface CookieOptions {
  maxAge?: number;
  expires?: Date;
  path?: string;
  domain?: string;
  secure?: boolean;
  httpOnly?: boolean;
  sameSite?: 'strict' | 'lax' | 'none';
}

export class CookieManager {
  /**
   * Get a cookie value
   */
  static get(name: string): string | undefined {
    return getCookie(name)?.toString();
  }

  /**
   * Set a cookie value with options
   */
  static set(name: string, value: string, options?: CookieOptions): void {
    setCookie(name, value, {
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
      ...options
    });
  }

  /**
   * Remove a cookie
   */
  static remove(name: string): void {
    deleteCookie(name);
  }

  /**
   * Check if a cookie exists
   */
  static exists(name: string): boolean {
    return getCookie(name) !== undefined;
  }

  /**
   * Get all cookies as an object
   */
  static getAll(): { [key: string]: string } {
    if (typeof document === 'undefined') {
      return {};
    }
    
    const cookies: { [key: string]: string } = {};
    document.cookie.split(';').forEach(cookie => {
      const [name, value] = cookie.trim().split('=');
      if (name && value) {
        cookies[name] = decodeURIComponent(value);
      }
    });
    return cookies;
  }

  /**
   * Clear all cookies
   */
  static clearAll(): void {
    const cookies = this.getAll();
    Object.keys(cookies).forEach(name => {
      this.remove(name);
    });
  }

  /**
   * Set cookie with JSON value
   */
  static setJSON(name: string, value: any, options?: CookieOptions): void {
    this.set(name, JSON.stringify(value), options);
  }

  /**
   * Get cookie value as JSON
   */
  static getJSON<T>(name: string): T | null {
    const value = this.get(name);
    if (!value) return null;
    
    try {
      return JSON.parse(value) as T;
    } catch {
      return null;
    }
  }

  /**
   * Set session cookie (expires when browser closes)
   */
  static setSession(name: string, value: string): void {
    this.set(name, value, { 
      maxAge: undefined, // Session cookie
      expires: undefined 
    });
  }

  /**
   * Set persistent cookie with expiration
   */
  static setPersistent(name: string, value: string, days: number = 30): void {
    this.set(name, value, {
      maxAge: days * 24 * 60 * 60 // Convert days to seconds
    });
  }

  /**
   * Set secure cookie for production
   */
  static setSecure(name: string, value: string, options?: CookieOptions): void {
    this.set(name, value, {
      ...options,
      secure: true,
      httpOnly: true,
      sameSite: 'strict'
    });
  }

  // Auth-specific methods
  /**
   * Get authentication token
   */
  static getToken(): string | null {
    return this.get('AdminToken') || null;
  }

  /**
   * Set authentication token
   */
  static setToken(token: string, persistent: boolean = false): void {
    if (persistent) {
      this.setPersistent('AdminToken', token, 30); // 30 days
    } else {
      this.setSession('AdminToken', token);
    }
  }

  /**
   * Check if user is authenticated (has valid token)
   */
  static isAuthenticated(): boolean {
    const token = this.getToken();
    if (!token) return false;
    
    // Check if token is expired
    return !this.isTokenExpired(token);
  }

  /**
   * Get user data from cookies
   */
  static getUser(): any | null {
    return this.getJSON('user_data');
  }

  /**
   * Set user data in cookies
   */
  static setUser(user: any): void {
    this.setJSON('user_data', user, { maxAge: 30 * 24 * 60 * 60 }); // 30 days
  }

  /**
   * Check if token is expired (basic JWT parsing)
   */
  static isTokenExpired(token: string): boolean {
    try {
      // Parse JWT without verification (just to check expiry)
      const payload = JSON.parse(atob(token.split('.')[1]));
      const now = Date.now() / 1000;
      return payload.exp && payload.exp < now;
    } catch {
      return true; // If can't parse, consider expired
    }
  }

  /**
   * Clear all authentication data
   */
  static clearAuth(): void {
    this.remove('AdminToken');
    this.remove('user_data');
    this.remove('refresh_token');
    // Also remove old token name for backward compatibility
    this.remove('auth_token');
  }

  /**
   * Get refresh token
   */
  static getRefreshToken(): string | null {
    return this.get('refresh_token') || null;
  }

  /**
   * Set refresh token
   */
  static setRefreshToken(token: string): void {
    this.setPersistent('refresh_token', token, 30); // 30 days
  }
}

export default CookieManager;