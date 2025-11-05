import { ApiService } from '../shared';
import { TokenUtils } from '@/lib/utils/token.utils';

// Types for admin authentication
export interface AdminUser {
  id: string;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  username: string;
  adminLevel: 'super_admin' | 'finance_admin' | 'growth_marketing' | 'support' | 'read_only';
  department: string;
  permissions: Array<{
    module: string;
    actions: string[];
  }>;
  profilePicture?: string;
  forcePasswordChange: boolean;
  isTwoFactorEnabled: boolean;
  lastLoginAt?: string;
}

export interface AdminLoginRequest {
  email?: string;
  username?: string;
  password: string;
  twoFactorCode?: string;
}

export interface AdminLoginResponse {
  success: boolean;
  message: string;
  token?: string;
  user?: AdminUser;
  expiresIn?: number;
  requiresTwoFactor?: boolean;
  email?: string;
  usedBackupCode?: boolean;
}

export interface Admin2FARequest {
  email: string;
  token: string;
}

export interface AdminChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export interface AdminForgotPasswordRequest {
  email: string;
}

export interface AdminResetPasswordRequest {
  password: string;
}

export interface Setup2FAResponse {
  success: boolean;
  data: {
    secret: string;
    qrCodeUrl: string;
    manualEntryKey: string;
    backupCodes: string[];
  };
}

/**
 * Admin Authentication Service
 * Handles admin-specific authentication, 2FA, and security features
 */
class AdminAuthService {
  private static readonly BASE_URL = '/admin/auth';

  /**
   * Admin Login
   */
  static async login(data: AdminLoginRequest): Promise<AdminLoginResponse> {
    try {
      const response = await ApiService.post<AdminLoginResponse>(
        `${this.BASE_URL}/login`, 
        data
      );
      
      // If login successful and token provided, store it
      if (response.success && response.token && response.user) {
        TokenUtils.setToken(response.token);
        localStorage.setItem('adminUser', JSON.stringify(response.user));
        
        // Also store admin-specific info
        localStorage.setItem('adminLevel', response.user.adminLevel);
        localStorage.setItem('adminDepartment', response.user.department);
      }
      
      return response;
    } catch (error) {
      console.error('Admin login error:', error);
      throw error;
    }
  }

  /**
   * Complete 2FA Login
   */
  static async loginWith2FA(data: Admin2FARequest): Promise<AdminLoginResponse> {
    try {
      const response = await ApiService.post<AdminLoginResponse>(
        `${this.BASE_URL}/login-2fa`, 
        data
      );
      
      if (response.success && response.token && response.user) {
        TokenUtils.setToken(response.token);
        localStorage.setItem('adminUser', JSON.stringify(response.user));
        localStorage.setItem('adminLevel', response.user.adminLevel);
        localStorage.setItem('adminDepartment', response.user.department);
      }
      
      return response;
    } catch (error) {
      console.error('Admin 2FA login error:', error);
      throw error;
    }
  }

  /**
   * Get Admin Profile
   */
  static async getProfile(): Promise<{ success: boolean; user: AdminUser }> {
    try {
      return await ApiService.get<{ success: boolean; user: AdminUser }>(
        `${this.BASE_URL}/profile`
      );
    } catch (error) {
      console.error('Get admin profile error:', error);
      throw error;
    }
  }

  /**
   * Setup Two-Factor Authentication
   */
  static async setup2FA(): Promise<Setup2FAResponse> {
    try {
      return await ApiService.post<Setup2FAResponse>(
        `${this.BASE_URL}/setup-2fa`
      );
    } catch (error) {
      console.error('Setup 2FA error:', error);
      throw error;
    }
  }

  /**
   * Confirm 2FA Setup
   */
  static async confirm2FA(token: string): Promise<{ success: boolean; message: string }> {
    try {
      return await ApiService.post<{ success: boolean; message: string }>(
        `${this.BASE_URL}/confirm-2fa`, 
        { token }
      );
    } catch (error) {
      console.error('Confirm 2FA error:', error);
      throw error;
    }
  }

  /**
   * Disable Two-Factor Authentication
   */
  static async disable2FA(password: string, token: string): Promise<{ success: boolean; message: string }> {
    try {
      return await ApiService.post<{ success: boolean; message: string }>(
        `${this.BASE_URL}/disable-2fa`, 
        { password, token }
      );
    } catch (error) {
      console.error('Disable 2FA error:', error);
      throw error;
    }
  }

  /**
   * Change Password
   */
  static async changePassword(data: AdminChangePasswordRequest): Promise<{ success: boolean; message: string }> {
    try {
      return await ApiService.post<{ success: boolean; message: string }>(
        `${this.BASE_URL}/change-password`, 
        data
      );
    } catch (error) {
      console.error('Change password error:', error);
      throw error;
    }
  }

  /**
   * Forgot Password
   */
  static async forgotPassword(data: AdminForgotPasswordRequest): Promise<{ success: boolean; message: string }> {
    try {
      return await ApiService.post<{ success: boolean; message: string }>(
        `${this.BASE_URL}/forgot-password`, 
        data
      );
    } catch (error) {
      console.error('Forgot password error:', error);
      throw error;
    }
  }

  /**
   * Reset Password
   */
  static async resetPassword(token: string, data: AdminResetPasswordRequest): Promise<{ success: boolean; message: string }> {
    try {
      return await ApiService.post<{ success: boolean; message: string }>(
        `${this.BASE_URL}/reset-password/${token}`, 
        data
      );
    } catch (error) {
      console.error('Reset password error:', error);
      throw error;
    }
  }

  /**
   * Validate Token
   */
  static async validateToken(): Promise<{ valid: boolean; user?: AdminUser }> {
    try {
      return await ApiService.get<{ valid: boolean; user?: AdminUser }>(
        `${this.BASE_URL}/validate-token`
      );
    } catch (error) {
      return { valid: false };
    }
  }

  /**
   * Logout
   */
  static async logout(): Promise<{ success: boolean; message: string }> {
    try {
      const response = await ApiService.post<{ success: boolean; message: string }>(
        `${this.BASE_URL}/logout`
      );
      
      // Clear local storage
      this.clearLocalStorage();
      
      return response;
    } catch (error) {
      // Even if API call fails, clear local storage
      this.clearLocalStorage();
      console.error('Logout error:', error);
      throw error;
    }
  }

  /**
   * Check if user is admin authenticated
   */
  static isAuthenticated(): boolean {
    const token = TokenUtils.getToken();
    const adminUser = localStorage.getItem('adminUser');
    return !!(token && adminUser);
  }

  /**
   * Get current admin user from localStorage
   */
  static getCurrentAdminUser(): AdminUser | null {
    try {
      const adminUserStr = localStorage.getItem('adminUser');
      return adminUserStr ? JSON.parse(adminUserStr) : null;
    } catch (error) {
      console.error('Error parsing admin user from localStorage:', error);
      return null;
    }
  }

  /**
   * Get current admin level
   */
  static getCurrentAdminLevel(): string | null {
    return localStorage.getItem('adminLevel');
  }

  /**
   * Get current admin department
   */
  static getCurrentAdminDepartment(): string | null {
    return localStorage.getItem('adminDepartment');
  }

  /**
   * Check if current admin has specific level
   */
  static hasAdminLevel(requiredLevel: string): boolean {
    const currentLevel = this.getCurrentAdminLevel();
    const currentUser = this.getCurrentAdminUser();
    
    // Super admin has access to everything
    if (currentLevel === 'super_admin') return true;
    
    return currentLevel === requiredLevel;
  }

  /**
   * Check if current admin has specific permission
   */
  static hasPermission(module: string, action: string): boolean {
    const currentUser = this.getCurrentAdminUser();
    
    if (!currentUser) return false;
    
    // Super admin has all permissions
    if (currentUser.adminLevel === 'super_admin') return true;
    
    // Check specific permissions
    const permission = currentUser.permissions?.find(p => p.module === module);
    return permission?.actions.includes(action) || false;
  }

  /**
   * Get admin hierarchy information
   */
  static getAdminHierarchy() {
    return {
      'super_admin': { 
        level: 1, 
        name: 'Super Administrator',
        description: 'Full access including security settings and destructive actions',
        color: 'red'
      },
      'finance_admin': { 
        level: 2, 
        name: 'Finance Administrator',
        description: 'Billing, invoices, refunds, payouts, taxes, financial reports',
        color: 'green'
      },
      'growth_marketing': { 
        level: 3, 
        name: 'Growth/Marketing',
        description: 'Discounts, campaigns, announcements, analytics read',
        color: 'blue'
      },
      'support': { 
        level: 4, 
        name: 'Support Agent',
        description: 'Subscriber lookup, plan changes (non-financial), resend receipts',
        color: 'orange'
      },
      'read_only': { 
        level: 5, 
        name: 'Read-Only Access',
        description: 'All reports and dashboards, no writes',
        color: 'gray'
      }
    };
  }

  /**
   * Clear local storage
   */
  private static clearLocalStorage(): void {
    TokenUtils.removeToken();
    localStorage.removeItem('adminUser');
    localStorage.removeItem('adminLevel');
    localStorage.removeItem('adminDepartment');
  }
}

export default AdminAuthService;