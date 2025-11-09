import { ApiService } from '../shared';
import {
  UserProfile,
  CreateUserRequest,
  UpdateUserRequest,
  UserFilters,
  UsersResponse,
  UserResponse,
  UserStats,
  UserStatsResponse,
  UserActivity,
  UserActivityResponse,
  BulkUserAction,
  BulkActionResponse,
  UserExportOptions
} from '@/lib/types';

interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

class UserService {
  /**
   * Get all users with filters and pagination
   */
  static async getUsers(filters?: UserFilters): Promise<UsersResponse> {
    const params = new URLSearchParams();

    if (filters) {
      if (filters.search) params.append('search', filters.search);
      if (filters.role && filters.role !== 'all') params.append('role', filters.role);
      if (filters.status && filters.status !== 'all') params.append('status', filters.status);
      if (filters.isEmailVerified !== undefined) params.append('isEmailVerified', filters.isEmailVerified.toString());
      if (filters.dateRange) {
        params.append('startDate', filters.dateRange.startDate);
        params.append('endDate', filters.dateRange.endDate);
      }
      if (filters.sortBy) params.append('sortBy', filters.sortBy);
      if (filters.sortOrder) params.append('sortOrder', filters.sortOrder);
      if (filters.page) params.append('page', filters.page.toString());
      if (filters.limit) params.append('limit', filters.limit.toString());
    }

    const queryString = params.toString();
    const url = queryString ? `/users?${queryString}` : '/users';

    return ApiService.get<UsersResponse>(url);
  }

  /**
   * Get user by ID
   */
  static async getUserById(userId: string): Promise<UserResponse> {
    return ApiService.get<UserResponse>(`/users/${userId}`);
  }

  /**
   * Create new user
   */
  static async createUser(data: CreateUserRequest): Promise<UserResponse> {
    return ApiService.post<UserResponse>('/users', data);
  }

  /**
   * Update user
   */
  static async updateUser(userId: string, data: UpdateUserRequest): Promise<UserResponse> {
    return ApiService.put<UserResponse>(`/users/${userId}`, data);
  }

  /**
   * Delete user
   */
  static async deleteUser(userId: string): Promise<ApiResponse> {
    return ApiService.delete<ApiResponse>(`/users/${userId}`);
  }

  /**
   * Get user statistics
   */
  static async getUserStats(): Promise<UserStatsResponse> {
    return ApiService.get<UserStatsResponse>('/users/stats');
  }

  /**
   * Get user activity logs
   */
  static async getUserActivity(
    userId: string,
    page: number = 1,
    limit: number = 20
  ): Promise<UserActivityResponse> {
    return ApiService.get<UserActivityResponse>(
      `/users/${userId}/activity?page=${page}&limit=${limit}`
    );
  }

  /**
   * Get all user activities (admin only)
   */
  static async getAllUserActivities(
    page: number = 1,
    limit: number = 20
  ): Promise<UserActivityResponse> {
    return ApiService.get<UserActivityResponse>(
      `/users/activities?page=${page}&limit=${limit}`
    );
  }

  /**
   * Bulk actions on users
   */
  static async bulkAction(action: BulkUserAction): Promise<BulkActionResponse> {
    return ApiService.post<BulkActionResponse>('/users/bulk-action', action);
  }

  /**
   * Export users data
   */
  static async exportUsers(options: UserExportOptions): Promise<Blob> {
    // For blob response, we need to handle it differently
    const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
    const token = ApiService.getAuthToken();
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    };

    const response = await fetch(`${API_BASE_URL}/users/export`, {
      method: 'POST',
      headers,
      credentials: 'include',
      body: JSON.stringify(options),
    });

    if (!response.ok) {
      throw new Error('Export failed');
    }

    return response.blob();
  }

  /**
   * Send password reset email to user
   */
  static async sendPasswordReset(userId: string): Promise<ApiResponse> {
    return ApiService.post<ApiResponse>(`/users/${userId}/send-password-reset`);
  }

  /**
   * Send email verification to user
   */
  static async sendEmailVerification(userId: string): Promise<ApiResponse> {
    return ApiService.post<ApiResponse>(`/users/${userId}/send-email-verification`);
  }

  /**
   * Verify user email (admin action)
   */
  static async verifyUserEmail(userId: string): Promise<ApiResponse> {
    return ApiService.post<ApiResponse>(`/users/${userId}/verify-email`);
  }

  /**
   * Change user role
   */
  static async changeUserRole(
    userId: string,
    role: 'subscriber' | 'user' | 'customer' | 'author' | 'contributor' | 'editor' | 'administrator' | 'shop_manager' | 'group_leader' | 'student' | 'web_designer' | 'seo_manager' | 'seo_editor'
  ): Promise<UserResponse> {
    return ApiService.put<UserResponse>(`/users/${userId}/role`, { role });
  }

  /**
   * Change user status
   */
  static async changeUserStatus(
    userId: string,
    status: 'active' | 'inactive' | 'suspended' | 'pending'
  ): Promise<UserResponse> {
    return ApiService.put<UserResponse>(`/users/${userId}/status`, { status });
  }

  /**
   * Upload user avatar
   */
  static async uploadAvatar(userId: string, file: File): Promise<UserResponse> {
    const formData = new FormData();
    formData.append('avatar', file);

    return ApiService.postFormData<UserResponse>(`/users/${userId}/avatar`, formData);
  }

  /**
   * Remove user avatar
   */
  static async removeAvatar(userId: string): Promise<UserResponse> {
    return ApiService.delete<UserResponse>(`/users/${userId}/avatar`);
  }

  /**
   * Get users by role
   */
  static async getUsersByRole(role: string): Promise<UsersResponse> {
    return ApiService.get<UsersResponse>(`/users?role=${role}`);
  }

  /**
   * Search users
   */
  static async searchUsers(query: string, limit: number = 10): Promise<UsersResponse> {
    return ApiService.get<UsersResponse>(`/users/search?q=${encodeURIComponent(query)}&limit=${limit}`);
  }

  /**
   * Get online users count
   */
  static async getOnlineUsersCount(): Promise<{ count: number }> {
    return ApiService.get<{ count: number }>('/users/online-count');
  }

  /**
   * Impersonate user (admin only)
   */
  static async impersonateUser(userId: string): Promise<{ token: string; user: UserProfile }> {
    return ApiService.post<{ token: string; user: UserProfile }>(`/users/${userId}/impersonate`);
  }

  /**
   * Get user permissions
   */
  static async getUserPermissions(userId: string): Promise<{ permissions: string[] }> {
    return ApiService.get<{ permissions: string[] }>(`/users/${userId}/permissions`);
  }

  /**
   * Update user permissions
   */
  static async updateUserPermissions(
    userId: string,
    permissions: string[]
  ): Promise<ApiResponse> {
    return ApiService.put<ApiResponse>(`/users/${userId}/permissions`, { permissions });
  }

  /**
   * Get user subscription details
   */
  static async getUserSubscription(userId: string): Promise<any> {
    return ApiService.get<any>(`/users/${userId}/subscription`);
  }

  /**
   * Update user subscription
   */
  static async updateUserSubscription(
    userId: string,
    subscriptionData: any
  ): Promise<ApiResponse> {
    return ApiService.put<ApiResponse>(`/users/${userId}/subscription`, subscriptionData);
  }

  /**
   * Get user login history
   */
  static async getUserLoginHistory(
    userId: string,
    page: number = 1,
    limit: number = 20
  ): Promise<any> {
    return ApiService.get<any>(
      `/users/${userId}/login-history?page=${page}&limit=${limit}`
    );
  }

  /**
   * Force user logout (admin only)
   */
  static async forceUserLogout(userId: string): Promise<ApiResponse> {
    return ApiService.post<ApiResponse>(`/users/${userId}/force-logout`);
  }
}

export default UserService;