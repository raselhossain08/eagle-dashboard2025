import * as jwt from 'jsonwebtoken';

export class TokenUtils {
  private static readonly JWT_SECRET = process.env.NEXT_PUBLIC_JWT_SECRET || process.env.JWT_SECRET || 'JKJDhayyhnc';

  /**
   * Generate JWT token with payload
   */
  static generateToken(payload: Record<string, any>, expiresIn: string = '7d'): string {
    if (!this.JWT_SECRET) {
      throw new Error('JWT_SECRET is not configured');
    }
    return jwt.sign(payload, this.JWT_SECRET, { expiresIn } as any);
  }

  /**
   * Verify and decode JWT token
   */
  static verifyToken(token: string): any {
    try {
      return jwt.verify(token, this.JWT_SECRET);
    } catch (error) {
      throw new Error('Invalid or expired token');
    }
  }

  /**
   * Decode token without verification (for inspecting token content)
   */
  static decodeToken(token: string): any {
    return jwt.decode(token);
  }

  /**
   * Extract token from Authorization header
   */
  static extractTokenFromHeader(authHeader: string | null): string | null {
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null;
    }
    return authHeader.substring(7);
  }

  /**
   * Check if token is expired
   */
  static isTokenExpired(token: string): boolean {
    try {
      const decoded = this.decodeToken(token);
      if (!decoded || !decoded.exp) {
        return true;
      }
      return decoded.exp * 1000 < Date.now();
    } catch {
      return true;
    }
  }

  /**
   * Get token expiration date
   */
  static getTokenExpiration(token: string): Date | null {
    try {
      const decoded = this.decodeToken(token);
      if (!decoded || !decoded.exp) {
        return null;
      }
      return new Date(decoded.exp * 1000);
    } catch {
      return null;
    }
  }

  /**
   * Refresh token if it's about to expire
   */
  static shouldRefreshToken(token: string, bufferMinutes: number = 5): boolean {
    try {
      const expiration = this.getTokenExpiration(token);
      if (!expiration) {
        return true;
      }
      
      const bufferTime = bufferMinutes * 60 * 1000; // Convert to milliseconds
      return expiration.getTime() - Date.now() < bufferTime;
    } catch {
      return true;
    }
  }

  /**
   * Get token from cookies or localStorage
   */
  static getToken(): string | null {
    if (typeof window === 'undefined') {
      return null;
    }

    // First try cookies (priority) - check new AdminToken name first
    if (document.cookie) {
      const cookies = document.cookie.split(';');
      for (const cookie of cookies) {
        const [name, value] = cookie.trim().split('=');
        if (name === 'AdminToken' && value) {
          const token = decodeURIComponent(value);
          // Validate token format
          if (token && token.split('.').length === 3) {
            return token;
          }
        }
        // Backward compatibility - check old token name
        if (name === 'token' && value) {
          const token = decodeURIComponent(value);
          // Validate token format
          if (token && token.split('.').length === 3) {
            return token;
          }
        }
      }
    }

    // Fallback to localStorage (check both names for compatibility)
    let token = localStorage.getItem('AdminToken');
    if (!token) {
      token = localStorage.getItem('token'); // Backward compatibility
    }
    if (token && token.split('.').length === 3) {
      return token;
    }

    return null;
  }

  /**
   * Set token in cookies and localStorage
   */
  static setToken(token: string, options?: { maxAge?: number; secure?: boolean }): void {
    const { maxAge = 7 * 24 * 60 * 60, secure } = options || {};
    
    // Set in cookies with new AdminToken name
    if (typeof document !== 'undefined') {
      const cookieOptions = [
        `AdminToken=${encodeURIComponent(token)}`,
        `max-age=${maxAge}`,
        'path=/',
        'SameSite=Strict'
      ];
      
      if (secure || process.env.NODE_ENV === 'production') {
        cookieOptions.push('Secure');
      }
      
      document.cookie = cookieOptions.join('; ');
    }

    // Set in localStorage with new name
    if (typeof window !== 'undefined') {
      localStorage.setItem('AdminToken', token);
      localStorage.setItem('tokenTimestamp', Date.now().toString());
      // Remove old token names for cleanup
      localStorage.removeItem('token');
    }
  }

  /**
   * Remove token from cookies and localStorage
   */
  static removeToken(): void {
    // Remove from cookies (both new and old names)
    if (typeof document !== 'undefined') {
      document.cookie = 'AdminToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
      document.cookie = 'token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;'; // Backward compatibility
    }

    // Remove from localStorage (both new and old names)
    if (typeof window !== 'undefined') {
      localStorage.removeItem('AdminToken');
      localStorage.removeItem('token'); // Backward compatibility
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      localStorage.removeItem('tokenTimestamp');
    }
  }

  /**
   * Check if user is authenticated
   */
  static isAuthenticated(): boolean {
    const token = this.getToken();
    return token !== null && !this.isTokenExpired(token);
  }

  /**
   * Get user info from token
   */
  static getUserInfo(): any {
    const token = this.getToken();
    if (!token) return null;
    
    try {
      const decoded = this.decodeToken(token);
      return decoded;
    } catch {
      return null;
    }
  }

  /**
   * Check if user has specific permission
   */
  static hasPermission(permission: string): boolean {
    const userInfo = this.getUserInfo();
    if (!userInfo || !userInfo.permissions) return false;
    
    return Array.isArray(userInfo.permissions) && 
           userInfo.permissions.includes(permission);
  }

  /**
   * Check if user has admin role or higher
   */
  static hasAdminRole(): boolean {
    const userInfo = this.getUserInfo();
    if (!userInfo || !userInfo.role) return false;
    
    const adminRoles = ['admin', 'superadmin', 'support_admin'];
    return adminRoles.includes(userInfo.role);
  }

  /**
   * Get user role from token
   */
  static getUserRole(): string | null {
    const userInfo = this.getUserInfo();
    return userInfo?.role || null;
  }

  /**
   * Check if user is super admin
   */
  static isSuperAdmin(): boolean {
    const userRole = this.getUserRole();
    return userRole === 'superadmin';
  }

  /**
   * Debug token information and check admin access
   */
  static debugTokenInfo(): void {
    if (typeof window === 'undefined') {
      console.log('❌ Window not available');
      return;
    }

    console.log('🔍 Current Session Analysis');
    console.log('============================');
    
    const currentToken = this.getToken();
    const userInfo = this.getUserInfo();
    
    if (!currentToken) {
      console.log('❌ No authentication token found');
      console.log('💡 You need to login first');
      return;
    }
    
    console.log('✅ Token found');
    console.log('👤 Current User Info:');
    console.log(`   Name: ${userInfo?.name || 'Unknown'}`);
    console.log(`   Email: ${userInfo?.email || 'Unknown'}`);
    console.log(`   Role: ${userInfo?.role || 'Unknown'}`);
    console.log(`   Expires: ${new Date((userInfo?.exp || 0) * 1000)}`);
    
    // Check admin access
    const adminRoles = ['admin', 'superadmin', 'support_admin'];
    const hasAdminAccess = adminRoles.includes(userInfo?.role);
    
    if (hasAdminAccess) {
      console.log('✅ Admin access confirmed!');
    } else {
      console.log('❌ Current user does not have admin access');
      console.log(`💡 Current role: "${userInfo?.role}"`);
      console.log(`💡 Required roles: ${adminRoles.join(', ')}`);
      console.log('');
      console.log('🔧 To fix this issue:');
      console.log('   1. Logout from current account');
      console.log('   2. Login with super admin account:');
      console.log('      Email: raselhossain86666@gmail.com');
      console.log('      (Use the password for this account)');
    }
  }

  /**
   * Check if current user can access admin features
   */
  static checkAdminAccess(): { hasAccess: boolean; message: string; userRole?: string } {
    const userInfo = this.getUserInfo();
    const adminRoles = ['admin', 'superadmin', 'support_admin'];
    
    if (!userInfo) {
      return {
        hasAccess: false,
        message: 'Not authenticated. Please login.'
      };
    }
    
    const hasAccess = adminRoles.includes(userInfo.role);
    
    return {
      hasAccess,
      message: hasAccess 
        ? 'Admin access confirmed' 
        : `Access denied. Current role "${userInfo.role}" does not have admin permissions.`,
      userRole: userInfo.role
    };
  }

  /**
   * Set super admin token (for development/testing)
   */
  static setSuperAdminToken(): void {
    const superAdminToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY5MDNlZjdkYzIyM2EzNWUwNDc0OGVjNCIsImVtYWlsIjoicmFzZWxob3NzYWluODY2NjZAZ21haWwuY29tIiwicm9sZSI6InN1cGVyYWRtaW4iLCJuYW1lIjoiUmFzZWwgSG9zc2FpbiIsImlhdCI6MTc2MjAxOTMyMiwiZXhwIjoxNzYyNjI0MTIyfQ.tygIiXYNO0RHYsne2pLQaaJDJEH7jZ-Jmg8sqithf-I';
    
    // Clear any existing tokens first
    this.removeToken();
    
    // Set the super admin token in both cookies and localStorage
    this.setToken(superAdminToken, { maxAge: 7 * 24 * 60 * 60, secure: false });
    
    // Also clear any cached user data that might be conflicting
    if (typeof window !== 'undefined') {
      localStorage.removeItem('user_data');
    }
    
    console.log('Super admin token set successfully!');
    console.log('Current token:', superAdminToken.substring(0, 50) + '...');
    console.log('Decoded token:', this.decodeToken(superAdminToken));
  }

  /**
   * Clear all tokens and user data
   */
  static clearAllTokens(): void {
    this.removeToken();
  }
}