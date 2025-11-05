/**
 * 🔐 Eagle Auth Module - Complete Authentication System
 * 
 * Export all authentication-related utilities for easy import
 */

// Core authentication services
import EagleTokenManagerClass from './token-manager';
export { default as EagleTokenManager } from './token-manager';
export type { AuthState, EagleToken } from './token-manager';

import apiClientInstance, { EagleApiClient } from './api-client';
export { default as apiClient, EagleApiClient } from './api-client';
export type { ApiResponse, ApiError, RequestOptions } from './api-client';

import authServiceInstance, { EagleAuthService } from './auth-service';
export { default as authService, EagleAuthService } from './auth-service';
export type { 
  LoginRequest, 
  RegisterRequest, 
  AuthResponse, 
  User 
} from './auth-service';

// React hooks
export { 
  useAuth, 
  useProtectedRoute, 
  useRoleCheck, 
  usePermissionCheck, 
  useAdminAccess 
} from '../hooks/useAuth';
export type { UseAuthReturn } from '../hooks/useAuth';

// Utility functions for quick access
export const auth = {
  // Token management
  setToken: EagleTokenManagerClass.setToken.bind(EagleTokenManagerClass),
  getToken: EagleTokenManagerClass.getToken.bind(EagleTokenManagerClass),
  clearToken: EagleTokenManagerClass.clearToken.bind(EagleTokenManagerClass),
  getAuthState: EagleTokenManagerClass.getAuthState.bind(EagleTokenManagerClass),
  
  // User info
  getUserInfo: EagleTokenManagerClass.getUserInfo.bind(EagleTokenManagerClass),
  isAuthenticated: () => EagleTokenManagerClass.getAuthState().isAuthenticated,
  
  // Permissions
  isAdmin: EagleTokenManagerClass.isAdmin.bind(EagleTokenManagerClass),
  hasRole: EagleTokenManagerClass.hasRole.bind(EagleTokenManagerClass),
  hasPermission: EagleTokenManagerClass.hasPermission.bind(EagleTokenManagerClass),
  
  // Service methods
  login: authServiceInstance.login.bind(authServiceInstance),
  logout: authServiceInstance.logout.bind(authServiceInstance),
  register: authServiceInstance.register.bind(authServiceInstance),
  
  // Debug
  debug: () => {
    console.group('🔐 Eagle Auth System Debug');
    EagleTokenManagerClass.debug();
    authServiceInstance.debug();
    apiClientInstance.debug();
    console.groupEnd();
  },
};

// Quick setup for development
export const setupAuth = {
  /**
   * 🧪 Development helper - shows auth status
   */
  status: () => {
    const state = EagleTokenManagerClass.getAuthState();
    console.log('🔐 Auth Status:', {
      authenticated: state.isAuthenticated,
      user: state.user?.email,
      role: state.user?.role,
      adminLevel: state.user?.adminLevel,
      expires: state.expiresAt,
    });
    return state;
  },
  
  /**
   * 🔧 Development helper - quick login check
   */
  checkLogin: async () => {
    try {
      const isValid = await authService.validateSession();
      console.log('🔍 Session Valid:', isValid);
      return isValid;
    } catch (error) {
      console.error('❌ Session check failed:', error);
      return false;
    }
  },
  
  /**
   * 🛠️ Development helper - complete debug
   */
  debug: auth.debug,
};

// Global window helpers for development (only in development mode)
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  (window as any).eagleAuth = auth;
  (window as any).setupAuth = setupAuth;
  
  console.log('🔐 Eagle Auth System loaded');
  console.log('💡 Use window.eagleAuth or window.setupAuth for debugging');
}