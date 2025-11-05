
import { ApiService } from '../shared';
import {
  AuthResponse,
  LoginRequest,
  RegisterRequest,
  ForgotPasswordRequest,
  ResetPasswordRequest,
  VerifyEmailRequest,
  User,
} from '@/lib/types';

class AuthService {
  /**
   * Login user
   */
  static async login(data: LoginRequest): Promise<AuthResponse> {
    return ApiService.post<AuthResponse>('/auth/login', data);
  }

  /**
   * Register user
   */
  static async register(data: RegisterRequest): Promise<AuthResponse> {
    return ApiService.post<AuthResponse>('/auth/register', data);
  }

  /**
   * Forgot password
   */
  static async forgotPassword(data: ForgotPasswordRequest): Promise<{ success: boolean; message: string }> {
    return ApiService.post<{ success: boolean; message: string }>('/auth/forgot-password', data);
  }

  /**
   * Reset password
   */
  static async resetPassword(token: string, data: ResetPasswordRequest): Promise<{ success: boolean; message: string }> {
    return ApiService.post<{ success: boolean; message: string }>(`/auth/reset-password/${token}`, data);
  }

  /**
   * Activate account
   */
  static async activateAccount(token: string): Promise<{ success: boolean; message: string }> {
    return ApiService.get<{ success: boolean; message: string }>(`/auth/activate/${token}`);
  }

  /**
   * Set password after activation
   */
  static async setPassword(data: { token: string; password: string; confirmPassword: string }): Promise<AuthResponse> {
    return ApiService.post<AuthResponse>('/auth/set-password', data);
  }

  /**
   * Resend activation email
   */
  static async resendActivation(email: string): Promise<{ success: boolean; message: string }> {
    return ApiService.post<{ success: boolean; message: string }>('/auth/resend-activation', { email });
  }

  /**
   * Get user profile
   */
  static async getProfile(): Promise<{ success: boolean; user: User }> {
    return ApiService.get<{ success: boolean; user: User }>('/auth/profile');
  }

  /**
   * Refresh token (if backend supports it)
   */
  static async refreshToken(): Promise<AuthResponse> {
    return ApiService.post<AuthResponse>('/auth/refresh-token');
  }

  /**
   * Logout (if backend supports it)
   */
  static async logout(): Promise<{ success: boolean; message: string }> {
    return ApiService.post<{ success: boolean; message: string }>('/auth/logout');
  }

  /**
   * Verify email
   */
  static async verifyEmail(data: VerifyEmailRequest): Promise<{ success: boolean; message: string }> {
    return ApiService.post<{ success: boolean; message: string }>('/auth/verify-email', data);
  }

  /**
   * Check if user is authenticated by validating token
   */
  static async validateToken(): Promise<{ valid: boolean; user?: User }> {
    try {
      const response = await this.getProfile();
      return {
        valid: true,
        user: response.user,
      };
    } catch (error) {
      return { valid: false };
    }
  }
}

export default AuthService;