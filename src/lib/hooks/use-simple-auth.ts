'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getCookie } from 'cookies-next';

interface TokenInfo {
  id?: string;
  email?: string;
  role?: string;
  adminLevel?: string;
  exp?: number;
}

interface AuthState {
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  user: TokenInfo | null;
  error: string | null;
}

/**
 * Decode JWT token without verification (client-side only)
 */
function decodeJWT(token: string): TokenInfo | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    
    const payload = parts[1];
    const decoded = JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')));
    return decoded;
  } catch (error) {
    console.error('Error decoding token:', error);
    return null;
  }
}

/**
 * Check if token is expired
 */
function isTokenExpired(token: string): boolean {
  try {
    const decoded = decodeJWT(token);
    if (!decoded?.exp) return true;
    
    const currentTime = Date.now() / 1000;
    return decoded.exp < (currentTime + 60); // 1 minute buffer
  } catch {
    return true;
  }
}

/**
 * Get token from cookies and localStorage
 */
function getStoredToken(): string | null {
  // Try cookies first (server-side compatible)
  const cookieToken = getCookie('AdminToken') || getCookie('token');
  if (cookieToken && typeof cookieToken === 'string') {
    return cookieToken;
  }
  
  // Fallback to localStorage (client-side only)
  if (typeof window !== 'undefined') {
    return localStorage.getItem('AdminToken') || localStorage.getItem('token');
  }
  
  return null;
}

/**
 * Simple authentication hook that works with backend tokens
 */
export function useSimpleAuth() {
  const [state, setState] = useState<AuthState>({
    token: null,
    isAuthenticated: false,
    isLoading: true,
    user: null,
    error: null
  });
  
  const router = useRouter();

  // Check token on mount
  useEffect(() => {
    checkAuthentication();
  }, []);

  const checkAuthentication = () => {
    try {
      const token = getStoredToken();
      
      if (!token) {
        setState({
          token: null,
          isAuthenticated: false,
          isLoading: false,
          user: null,
          error: null
        });
        return;
      }

      // Check if token is expired
      if (isTokenExpired(token)) {
        setState({
          token: null,
          isAuthenticated: false,
          isLoading: false,
          user: null,
          error: 'Token expired'
        });
        return;
      }

      // Decode token to get user info
      const userInfo = decodeJWT(token);
      
      setState({
        token,
        isAuthenticated: true,
        isLoading: false,
        user: userInfo,
        error: null
      });

    } catch (error) {
      console.error('Token check error:', error);
      setState({
        token: null,
        isAuthenticated: false,
        isLoading: false,
        user: null,
        error: 'Authentication error'
      });
    }
  };

  const logout = () => {
    // Clear cookies
    if (typeof document !== 'undefined') {
      document.cookie = 'AdminToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
      document.cookie = 'token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    }
    
    // Clear localStorage
    if (typeof window !== 'undefined') {
      localStorage.removeItem('AdminToken');
      localStorage.removeItem('token');
      localStorage.removeItem('userSession');
    }
    
    setState({
      token: null,
      isAuthenticated: false,
      isLoading: false,
      user: null,
      error: null
    });
    
    router.push('/login');
  };

  const hasRole = (requiredRole: string): boolean => {
    if (!state.user) return false;
    
    // Check direct role
    if (state.user.role === requiredRole) return true;
    
    // Check admin level mapping
    if (requiredRole === 'admin' && state.user.adminLevel) {
      const adminLevels = ['super_admin', 'finance_admin', 'growth_marketing', 'support'];
      return adminLevels.includes(state.user.adminLevel);
    }
    
    if (requiredRole === 'superadmin' && state.user.adminLevel === 'super_admin') {
      return true;
    }
    
    return false;
  };

  const isAdmin = (): boolean => {
    return hasRole('admin') || hasRole('superadmin');
  };

  return {
    ...state,
    checkAuthentication,
    logout,
    hasRole,
    isAdmin
  };
}

export default useSimpleAuth;