import { getCookie, setCookie, deleteCookie } from 'cookies-next';
import { User } from '@/lib/types';

export class CookieManager {
  private static readonly TOKEN_KEY = 'AdminToken';
  private static readonly USER_KEY = 'auth_user';

  /**
   * Set authentication token
   */
  static setToken(token: string): void {
    setCookie(this.TOKEN_KEY, token, {
      maxAge: 7 * 24 * 60 * 60, // 7 days
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict'
    });
  }

  /**
   * Get authentication token
   */
  static getToken(): string | null {
    const token = getCookie(this.TOKEN_KEY);
    return typeof token === 'string' ? token : null;
  }

  /**
   * Set user data
   */
  static setUser(user: User): void {
    setCookie(this.USER_KEY, JSON.stringify(user), {
      maxAge: 7 * 24 * 60 * 60, // 7 days
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict'
    });
  }

  /**
   * Get user data
   */
  static getUser(): User | null {
    try {
      const userStr = getCookie(this.USER_KEY);
      if (!userStr || typeof userStr !== 'string') return null;
      return JSON.parse(userStr);
    } catch {
      return null;
    }
  }

  /**
   * Check if user is authenticated
   */
  static isAuthenticated(): boolean {
    const token = this.getToken();
    return !!token && !this.isTokenExpired(token);
  }

  /**
   * Check if token is expired
   */
  static isTokenExpired(token: string): boolean {
    try {
      // Simple JWT decode (without verification)
      const payload = JSON.parse(atob(token.split('.')[1]));
      const now = Math.floor(Date.now() / 1000);
      return payload.exp < now;
    } catch {
      return true; // If we can't decode, consider it expired
    }
  }

  /**
   * Get user role
   */
  static getUserRole(): string | null {
    const user = this.getUser();
    return user?.role || null;
  }

  /**
   * Check if user has specific role
   */
  static hasRole(role: string): boolean {
    const userRole = this.getUserRole();
    return userRole === role;
  }

  /**
   * Check if user has any of the specified roles
   */
  static hasAnyRole(roles: string[]): boolean {
    const userRole = this.getUserRole();
    return userRole ? roles.includes(userRole) : false;
  }

  /**
   * Clear all authentication data
   */
  static clearAuth(): void {
    deleteCookie(this.TOKEN_KEY);
    deleteCookie(this.USER_KEY);
    // Also remove old token name for backward compatibility
    deleteCookie('auth_token');
  }
}