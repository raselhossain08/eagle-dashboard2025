
'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { AuthService } from '@/lib/services';
import { CookieManager } from '@/lib/utils/cookie-manager';
import {
  User,
  AuthContextType,
  LoginRequest,
  RegisterRequest,
  ForgotPasswordRequest,
  ResetPasswordRequest,
  VerifyEmailRequest,
} from '@/lib/types';

const AuthContext = createContext<AuthContextType | null>(null);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Initialize auth state on mount
  useEffect(() => {
    initializeAuth();
  }, []);

  // Auto logout on token expiration
  useEffect(() => {
    if (token && CookieManager.isTokenExpired(token)) {
      handleTokenExpiration();
    }
  }, [token]);

  const initializeAuth = async () => {
    try {
      const storedToken = CookieManager.getToken();
      const storedUser = CookieManager.getUser();

      if (storedToken && !CookieManager.isTokenExpired(storedToken)) {
        setToken(storedToken);
        
        if (storedUser) {
          setUser(storedUser);
        } else {
          // Fetch user data if not in cookies
          await refreshUser();
        }
      } else {
        // Clear invalid/expired tokens
        CookieManager.clearAuth();
      }
    } catch (error) {
      console.error('Error initializing auth:', error);
      CookieManager.clearAuth();
    } finally {
      setLoading(false);
    }
  };

  const handleTokenExpiration = () => {
    toast.error('Your session has expired. Please login again.');
    logout();
  };

  const login = async (data: LoginRequest): Promise<void> => {
    try {
      setLoading(true);
      console.log('🔐 Auth context: Starting login API call');
      const response = await AuthService.login(data);
      console.log('📡 Auth context: Login response received:', { success: response.success, hasToken: !!response.token });
      
      if (response.success && response.token) {
        setToken(response.token);
        CookieManager.setToken(response.token);
        console.log('🍪 Auth context: Token stored in cookies');
        
        // Fetch user profile after login
        await refreshUser();
        console.log('👤 Auth context: User profile refreshed');
        
        toast.success('Login successful!');
        // Don't redirect here - let the calling component handle navigation
      } else {
        throw new Error('Login failed');
      }
    } catch (error) {
      console.error('💥 Auth context: Login error:', error);
      const message = error instanceof Error ? error.message : 'Login failed';
      toast.error(message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const register = async (data: RegisterRequest): Promise<void> => {
    try {
      setLoading(true);
      const response = await AuthService.register(data);
      
      if (response.success) {
        toast.success('Registration successful! Please check your email for activation instructions.');
        router.push('/login?message=registration-success');
      } else {
        throw new Error('Registration failed');
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Registration failed';
      toast.error(message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    CookieManager.clearAuth();
    
    // Call backend logout if available
    AuthService.logout().catch(console.error);
    
    toast.success('Logged out successfully');
    router.push('/login');
  };

  const forgotPassword = async (data: ForgotPasswordRequest): Promise<void> => {
    try {
      setLoading(true);
      const response = await AuthService.forgotPassword(data);
      
      if (response.success) {
        toast.success('Password reset instructions sent to your email!');
      } else {
        throw new Error(response.message || 'Failed to send reset email');
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to send reset email';
      toast.error(message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (resetToken: string, data: ResetPasswordRequest): Promise<void> => {
    try {
      setLoading(true);
      const response = await AuthService.resetPassword(resetToken, data);
      
      if (response.success) {
        toast.success('Password reset successful! Please login with your new password.');
        router.push('/login?message=password-reset-success');
      } else {
        throw new Error(response.message || 'Password reset failed');
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Password reset failed';
      toast.error(message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const verifyEmail = async (data: VerifyEmailRequest): Promise<void> => {
    try {
      setLoading(true);
      const response = await AuthService.verifyEmail(data);
      
      if (response.success) {
        toast.success('Email verified successfully!');
        await refreshUser(); // Refresh user data to update verification status
      } else {
        throw new Error(response.message || 'Email verification failed');
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Email verification failed';
      toast.error(message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const resendVerification = async (): Promise<void> => {
    try {
      if (!user?.email) {
        throw new Error('No user email found');
      }
      
      setLoading(true);
      const response = await AuthService.resendActivation(user.email);
      
      if (response.success) {
        toast.success('Verification email sent!');
      } else {
        throw new Error(response.message || 'Failed to resend verification email');
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to resend verification email';
      toast.error(message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const refreshUser = async (): Promise<void> => {
    try {
      const response = await AuthService.getProfile();
      
      if (response.success && response.user) {
        setUser(response.user);
        CookieManager.setUser(response.user);
      } else {
        throw new Error('Failed to fetch user profile');
      }
    } catch (error) {
      console.error('Error refreshing user:', error);
      // If profile fetch fails, user might be unauthorized
      logout();
    }
  };

  const value: AuthContextType = {
    user,
    token,
    loading,
    login,
    register,
    logout,
    forgotPassword,
    resetPassword,
    verifyEmail,
    resendVerification,
    refreshUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;