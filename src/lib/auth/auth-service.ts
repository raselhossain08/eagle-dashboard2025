/**
 * 🔐 Eagle Auth Service - Complete Authentication Solution
 * 
 * Features:
 * ✅ Seamless login with automatic token storage
 * ✅ Smart logout with complete cleanup
 * ✅ Automatic token refresh and validation
 * ✅ Role-based access control
 * ✅ Protected route handling
 * ✅ Error handling and user feedback
 */

import EagleTokenManager, { AuthState, EagleToken } from './token-manager';
import apiClient from './api-client';

// Types for authentication
export interface LoginRequest {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface AuthResponse {
  success: boolean;
  token: string;
  user: EagleToken;
  message?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  adminLevel?: string;
  department?: string;
  permissions?: string[];
  createdAt: string;
  updatedAt: string;
}

class EagleAuthService {
  private static instance: EagleAuthService;
  private authState: AuthState | null = null;
  private authListeners: Set<(state: AuthState) => void> = new Set();

  constructor() {
    // Listen to token changes
    EagleTokenManager.onAuthChange((state) => {
      this.authState = state;
      this.notifyAuthListeners(state);
    });
  }

  /**
   * 🏭 Get singleton instance
   */
  static getInstance(): EagleAuthService {
    if (!EagleAuthService.instance) {
      EagleAuthService.instance = new EagleAuthService();
    }
    return EagleAuthService.instance;
  }

  // ============================================================================
  // 🔐 Authentication Methods
  // ============================================================================

  /**
   * 🚀 Login user
   */
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    try {
      console.log('🔐 Attempting login for:', credentials.email);

      const response = await apiClient.post<AuthResponse>('/auth/login', {
        email: credentials.email,
        password: credentials.password,
      }, { skipAuth: true });

      if (response.success && response.token) {
        // Store the token automatically
        const stored = EagleTokenManager.setToken(response.token, {
          rememberMe: credentials.rememberMe ?? true,
        });

        if (stored) {
          console.log('✅ Login successful');
          console.log('👤 User:', response.user?.email || 'Unknown');
          console.log('🎭 Role:', response.user?.role || 'Unknown');
          
          return response;
        } else {
          throw new Error('Failed to store authentication token');
        }
      } else {
        throw new Error(response.message || 'Login failed');
      }
    } catch (error) {
      console.error('❌ Login failed:', error);
      throw error;
    }
  }

  /**
   * 📝 Register user
   */
  async register(userData: RegisterRequest): Promise<AuthResponse> {
    try {
      console.log('📝 Attempting registration for:', userData.email);

      const response = await apiClient.post<AuthResponse>('/auth/register', userData, {
        skipAuth: true,
      });

      if (response.success && response.token) {
        // Auto-login after successful registration
        const stored = EagleTokenManager.setToken(response.token);

        if (stored) {
          console.log('✅ Registration and auto-login successful');
          return response;
        }
      }

      return response;
    } catch (error) {
      console.error('❌ Registration failed:', error);
      throw error;
    }
  }

  /**
   * 🚪 Logout user
   */
  async logout(): Promise<void> {
    try {
      console.log('🚪 Logging out...');

      // Try to notify backend about logout
      try {
        await apiClient.post('/auth/logout');
      } catch (error) {
        // Continue with logout even if backend call fails
        console.warn('⚠️ Backend logout call failed, continuing with local logout');
      }

      // Clear local token
      EagleTokenManager.clearToken();

      console.log('✅ Logout successful');

      // Redirect to login page if in browser
      if (typeof window !== 'undefined') {
        // Small delay to ensure state is updated
        setTimeout(() => {
          window.location.href = '/login';
        }, 100);
      }
    } catch (error) {
      console.error('❌ Logout error:', error);
      // Still clear token even if there's an error
      EagleTokenManager.clearToken();
    }
  }

  /**
   * 🔄 Refresh user profile
   */
  async refreshProfile(): Promise<User> {
    try {
      const response = await apiClient.get<{ success: boolean; user: User }>('/auth/profile');
      
      if (response.success && response.user) {
        return response.user;
      } else {
        throw new Error('Failed to fetch user profile');
      }
    } catch (error) {
      console.error('❌ Failed to refresh profile:', error);
      throw error;
    }
  }

  /**
   * 🔑 Validate current session
   */
  async validateSession(): Promise<boolean> {
    try {
      const state = this.getAuthState();
      
      if (!state.isAuthenticated) {
        return false;
      }

      // Check with backend
      const response = await apiClient.get<{ valid: boolean; user?: User }>('/auth/validate');
      return response.valid;
    } catch (error) {
      console.error('❌ Session validation failed:', error);
      return false;
    }
  }

  // ============================================================================
  // 🔍 State Management
  // ============================================================================

  /**
   * 📊 Get current authentication state
   */
  getAuthState(): AuthState {
    return EagleTokenManager.getAuthState();
  }

  /**
   * 👤 Get current user information
   */
  getCurrentUser(): EagleToken | null {
    return EagleTokenManager.getUserInfo();
  }

  /**
   * ✅ Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return this.getAuthState().isAuthenticated;
  }

  /**
   * 🎭 Get user role
   */
  getUserRole(): string | null {
    const user = this.getCurrentUser();
    return user?.role || null;
  }

  /**
   * 🏢 Get admin level
   */
  getAdminLevel(): string | null {
    const user = this.getCurrentUser();
    return user?.adminLevel || null;
  }

  // ============================================================================
  // 🛡️ Permission Checks
  // ============================================================================

  /**
   * 👮 Check if user is admin
   */
  isAdmin(): boolean {
    return EagleTokenManager.isAdmin();
  }

  /**
   * 👑 Check if user is super admin
   */
  isSuperAdmin(): boolean {
    return EagleTokenManager.hasRole('superadmin') || EagleTokenManager.hasRole('super_admin');
  }

  /**
   * 🔑 Check specific permission
   */
  hasPermission(permission: string): boolean {
    return EagleTokenManager.hasPermission(permission);
  }

  /**
   * 🎭 Check specific role
   */
  hasRole(role: string): boolean {
    return EagleTokenManager.hasRole(role);
  }

  /**
   * 🚧 Check multiple permissions (any)
   */
  hasAnyPermission(permissions: string[]): boolean {
    return permissions.some(permission => this.hasPermission(permission));
  }

  /**
   * 🔐 Check multiple permissions (all)
   */
  hasAllPermissions(permissions: string[]): boolean {
    return permissions.every(permission => this.hasPermission(permission));
  }

  /**
   * 👥 Check multiple roles (any)
   */
  hasAnyRole(roles: string[]): boolean {
    return roles.some(role => this.hasRole(role));
  }

  // ============================================================================
  // 🎯 Route Protection
  // ============================================================================

  /**
   * 🛡️ Check if user can access route
   */
  canAccessRoute(route: string): boolean {
    if (!this.isAuthenticated()) {
      return false;
    }

    // Define route permissions
    const routePermissions: Record<string, { roles?: string[]; permissions?: string[] }> = {
      '/admin': { roles: ['admin', 'superadmin'] },
      '/users': { roles: ['admin', 'superadmin'] },
      '/roles': { roles: ['superadmin'] },
      '/system-settings': { roles: ['superadmin'] },
      '/audit': { roles: ['admin', 'superadmin'] },
      '/analytics': { permissions: ['view_analytics'] },
      '/billing': { permissions: ['view_billing'] },
      '/transactions': { permissions: ['view_transactions'] },
    };

    const requirements = routePermissions[route];
    
    if (!requirements) {
      // Route not in restricted list, allow access
      return true;
    }

    // Check role requirements
    if (requirements.roles && !this.hasAnyRole(requirements.roles)) {
      return false;
    }

    // Check permission requirements
    if (requirements.permissions && !this.hasAnyPermission(requirements.permissions)) {
      return false;
    }

    return true;
  }

  /**
   * 🔄 Redirect if no access
   */
  redirectIfNoAccess(route: string): boolean {
    if (typeof window === 'undefined') return true;

    if (!this.isAuthenticated()) {
      window.location.href = `/login?redirect=${encodeURIComponent(route)}`;
      return false;
    }

    if (!this.canAccessRoute(route)) {
      // Redirect to dashboard with error
      window.location.href = `/?error=access_denied&route=${encodeURIComponent(route)}`;
      return false;
    }

    return true;
  }

  // ============================================================================
  // 📡 Event Handling
  // ============================================================================

  /**
   * 👂 Listen to auth state changes
   */
  onAuthChange(callback: (state: AuthState) => void): () => void {
    this.authListeners.add(callback);
    
    // Call immediately with current state
    callback(this.getAuthState());
    
    // Return unsubscribe function
    return () => {
      this.authListeners.delete(callback);
    };
  }

  /**
   * 📢 Notify auth listeners
   */
  private notifyAuthListeners(state: AuthState): void {
    this.authListeners.forEach(callback => {
      try {
        callback(state);
      } catch (error) {
        console.error('❌ Error in auth state listener:', error);
      }
    });
  }

  // ============================================================================
  // 🛠️ Utility Methods
  // ============================================================================

  /**
   * 🔍 Debug current auth status
   */
  debug(): void {
    console.group('🔐 Eagle Auth Service Debug');
    
    const state = this.getAuthState();
    const user = this.getCurrentUser();
    
    console.log('Authentication State:', state);
    console.log('Current User:', user);
    console.log('Is Authenticated:', this.isAuthenticated());
    console.log('Is Admin:', this.isAdmin());
    console.log('Is Super Admin:', this.isSuperAdmin());
    console.log('User Role:', this.getUserRole());
    console.log('Admin Level:', this.getAdminLevel());
    
    if (user?.permissions) {
      console.log('User Permissions:', user.permissions);
    }
    
    console.log('Auth Listeners Count:', this.authListeners.size);
    
    // Test common route access
    const testRoutes = ['/admin', '/users', '/analytics', '/billing'];
    console.log('Route Access:');
    testRoutes.forEach(route => {
      console.log(`  ${route}:`, this.canAccessRoute(route) ? '✅ Allowed' : '❌ Denied');
    });
    
    console.groupEnd();
  }

  /**
   * 🧪 Quick setup for development
   */
  quickDevSetup(): void {
    console.log('🧪 Setting up development authentication...');
    
    // This would typically set a development token
    // For production, remove or disable this method
    if (process.env.NODE_ENV === 'development') {
      console.log('Development setup complete - use login form for authentication');
    } else {
      console.warn('Quick dev setup is disabled in production');
    }
  }

  /**
   * ⚡ Initialize auth service
   */
  static initialize(): EagleAuthService {
    const service = EagleAuthService.getInstance();
    
    // Check for existing session on startup
    const state = service.getAuthState();
    if (state.isAuthenticated) {
      console.log('🔐 Existing session found');
      console.log('👤 Welcome back:', state.user?.email);
    }
    
    return service;
  }
}

// Export singleton instance and initialize
const authService = EagleAuthService.initialize();

export default authService;
export { EagleAuthService };