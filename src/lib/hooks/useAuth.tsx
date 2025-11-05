/**
 * 🎣 useAuth Hook - Easy Authentication State Management
 * 
 * Features:
 * ✅ Real-time authentication state
 * ✅ Easy login/logout methods
 * ✅ Permission checking
 * ✅ Route protection helpers
 * ✅ Loading states
 * ✅ Error handling
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import authService, { AuthResponse, LoginRequest, RegisterRequest } from '../auth/auth-service';
import { AuthState, EagleToken } from '../auth/token-manager';

export interface UseAuthReturn {
  // State
  isAuthenticated: boolean;
  isLoading: boolean;
  user: EagleToken | null;
  authState: AuthState;
  error: string | null;

  // Methods
  login: (credentials: LoginRequest) => Promise<AuthResponse>;
  logout: () => Promise<void>;
  register: (userData: RegisterRequest) => Promise<AuthResponse>;
  refreshProfile: () => Promise<void>;
  clearError: () => void;

  // Permission helpers
  isAdmin: () => boolean;
  isSuperAdmin: () => boolean;
  hasRole: (role: string) => boolean;
  hasPermission: (permission: string) => boolean;
  hasAnyRole: (roles: string[]) => boolean;
  hasAnyPermission: (permissions: string[]) => boolean;
  canAccessRoute: (route: string) => boolean;

  // Utility
  getUserRole: () => string | null;
  getAdminLevel: () => string | null;
}

export function useAuth(): UseAuthReturn {
  // State management
  const [authState, setAuthState] = useState<AuthState>(authService.getAuthState());
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Listen to auth state changes
  useEffect(() => {
    const unsubscribe = authService.onAuthChange((state: AuthState) => {
      setAuthState(state);
    });

    return unsubscribe;
  }, []);

  // Clear error when auth state changes
  useEffect(() => {
    setError(null);
  }, [authState.isAuthenticated]);

  // ============================================================================
  // 🔐 Authentication Methods
  // ============================================================================

  const login = useCallback(async (credentials: LoginRequest): Promise<AuthResponse> => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await authService.login(credentials);
      
      return response;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Login failed';
      setError(errorMessage);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(async (): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);
      
      await authService.logout();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Logout failed';
      setError(errorMessage);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const register = useCallback(async (userData: RegisterRequest): Promise<AuthResponse> => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await authService.register(userData);
      
      return response;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Registration failed';
      setError(errorMessage);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const refreshProfile = useCallback(async (): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);
      
      await authService.refreshProfile();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to refresh profile';
      setError(errorMessage);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // ============================================================================
  // 🛡️ Permission Methods
  // ============================================================================

  const isAdmin = useCallback((): boolean => {
    return authService.isAdmin();
  }, [authState.user]);

  const isSuperAdmin = useCallback((): boolean => {
    return authService.isSuperAdmin();
  }, [authState.user]);

  const hasRole = useCallback((role: string): boolean => {
    return authService.hasRole(role);
  }, [authState.user]);

  const hasPermission = useCallback((permission: string): boolean => {
    return authService.hasPermission(permission);
  }, [authState.user]);

  const hasAnyRole = useCallback((roles: string[]): boolean => {
    return authService.hasAnyRole(roles);
  }, [authState.user]);

  const hasAnyPermission = useCallback((permissions: string[]): boolean => {
    return authService.hasAnyPermission(permissions);
  }, [authState.user]);

  const canAccessRoute = useCallback((route: string): boolean => {
    return authService.canAccessRoute(route);
  }, [authState.user]);

  // ============================================================================
  // 📊 Utility Methods
  // ============================================================================

  const getUserRole = useCallback((): string | null => {
    return authService.getUserRole();
  }, [authState.user]);

  const getAdminLevel = useCallback((): string | null => {
    return authService.getAdminLevel();
  }, [authState.user]);

  // ============================================================================
  // 📤 Return Hook Interface
  // ============================================================================

  return {
    // State
    isAuthenticated: authState.isAuthenticated,
    isLoading,
    user: authState.user,
    authState,
    error,

    // Methods
    login,
    logout,
    register,
    refreshProfile,
    clearError,

    // Permission helpers
    isAdmin,
    isSuperAdmin,
    hasRole,
    hasPermission,
    hasAnyRole,
    hasAnyPermission,
    canAccessRoute,

    // Utility
    getUserRole,
    getAdminLevel,
  };
}

// ============================================================================
// 🛡️ Additional Hooks for Specific Use Cases
// ============================================================================

/**
 * 🚧 Hook for protected routes
 */
export function useProtectedRoute(
  requiredRoles?: string[],
  requiredPermissions?: string[],
  redirectPath = '/login'
) {
  const auth = useAuth();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    if (!auth.isAuthenticated) {
      if (typeof window !== 'undefined') {
        window.location.href = `${redirectPath}?redirect=${encodeURIComponent(window.location.pathname)}`;
      }
      return;
    }

    if (requiredRoles && !auth.hasAnyRole(requiredRoles)) {
      if (typeof window !== 'undefined') {
        window.location.href = `/?error=access_denied&reason=insufficient_role`;
      }
      return;
    }

    if (requiredPermissions && !auth.hasAnyPermission(requiredPermissions)) {
      if (typeof window !== 'undefined') {
        window.location.href = `/?error=access_denied&reason=insufficient_permissions`;
      }
      return;
    }

    setIsChecking(false);
  }, [auth.isAuthenticated, auth.user, requiredRoles, requiredPermissions, redirectPath]);

  return {
    isChecking,
    hasAccess: !isChecking && auth.isAuthenticated,
    ...auth,
  };
}

/**
 * 👥 Hook for role-based rendering
 */
export function useRoleCheck(roles: string[]) {
  const auth = useAuth();
  
  return {
    hasRequiredRole: auth.hasAnyRole(roles),
    ...auth,
  };
}

/**
 * 🔑 Hook for permission-based rendering
 */
export function usePermissionCheck(permissions: string[]) {
  const auth = useAuth();
  
  return {
    hasRequiredPermission: auth.hasAnyPermission(permissions),
    ...auth,
  };
}

/**
 * 👮 Hook for admin access
 */
export function useAdminAccess() {
  const auth = useAuth();
  
  return {
    isAdminUser: auth.isAdmin(),
    isSuperAdminUser: auth.isSuperAdmin(),
    hasAdminAccess: auth.isAdmin() || auth.isSuperAdmin(),
    adminLevel: auth.getAdminLevel(),
    ...auth,
  };
}