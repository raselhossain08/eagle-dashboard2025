/**
 * Safe Authentication Hook
 * 
 * This hook provides authentication state management without localStorage dependencies,
 * preventing security errors while maintaining full functionality.
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { SafeTokenUtils } from '@/lib/utils/safe-token.utils';

interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: any | null;
  token: string | null;
  error: string | null;
}

export function useSafeAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    isLoading: true,
    user: null,
    token: null,
    error: null
  });

  const checkAuthentication = useCallback(async () => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true, error: null }));

      const token = SafeTokenUtils.getToken();
      const isAuthenticated = SafeTokenUtils.isAuthenticated();
      const user = SafeTokenUtils.getUserInfo();

      setAuthState({
        isAuthenticated,
        isLoading: false,
        user,
        token,
        error: null
      });

      console.info('🔐 SAFE AUTH: Authentication state updated', {
        isAuthenticated,
        hasToken: !!token,
        userEmail: user?.email || 'Not found',
        userRole: user?.role || 'Not found'
      });

    } catch (error) {
      console.error('❌ SAFE AUTH: Authentication check error:', error);
      
      setAuthState({
        isAuthenticated: false,
        isLoading: false,
        user: null,
        token: null,
        error: error instanceof Error ? error.message : 'Authentication check failed'
      });
    }
  }, []);

  const login = useCallback((token: string, user?: any) => {
    try {
      SafeTokenUtils.setToken(token);
      
      setAuthState({
        isAuthenticated: true,
        isLoading: false,
        user: user || SafeTokenUtils.getUserInfo(),
        token,
        error: null
      });

      console.info('✅ SAFE AUTH: User logged in successfully');
    } catch (error) {
      console.error('❌ SAFE AUTH: Login error:', error);
      setAuthState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Login failed'
      }));
    }
  }, []);

  const logout = useCallback(() => {
    try {
      SafeTokenUtils.removeToken();
      
      setAuthState({
        isAuthenticated: false,
        isLoading: false,
        user: null,
        token: null,
        error: null
      });

      console.info('🚪 SAFE AUTH: User logged out successfully');
    } catch (error) {
      console.error('❌ SAFE AUTH: Logout error:', error);
    }
  }, []);

  const refreshAuth = useCallback(() => {
    checkAuthentication();
  }, [checkAuthentication]);

  // Initialize authentication state
  useEffect(() => {
    checkAuthentication();
  }, [checkAuthentication]);

  // Set up periodic token validation
  useEffect(() => {
    const interval = setInterval(() => {
      const token = SafeTokenUtils.getToken();
      if (token && SafeTokenUtils.isTokenExpired(token)) {
        console.warn('⚠️ SAFE AUTH: Token expired, logging out');
        logout();
      }
    }, 60000); // Check every minute

    return () => clearInterval(interval);
  }, [logout]);

  // Listen for token changes in other tabs
  useEffect(() => {
    const handleStorageChange = () => {
      console.info('🔄 SAFE AUTH: Storage change detected, refreshing auth state');
      checkAuthentication();
    };

    window.addEventListener('focus', handleStorageChange);
    return () => window.removeEventListener('focus', handleStorageChange);
  }, [checkAuthentication]);

  return {
    ...authState,
    login,
    logout,
    refreshAuth,
    // Helper methods
    hasRole: (role: string) => authState.user?.role === role || authState.user?.adminLevel === role,
    isAdmin: () => {
      const adminRoles = ['admin', 'superadmin', 'super_admin'];
      const adminLevels = ['super_admin', 'finance_admin', 'growth_marketing', 'support'];
      return adminRoles.includes(authState.user?.role) || adminLevels.includes(authState.user?.adminLevel);
    },
    hasPermission: (permission: string) => authState.user?.permissions?.includes(permission) || false
  };
}

export default useSafeAuth;