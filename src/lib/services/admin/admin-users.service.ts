
import { 
  AdminUser, 
  AdminUserFilters, 
  AdminUserStats, 
  CreateAdminUserRequest, 
  UpdateAdminUserRequest,
  AdminUserActivity,
  BulkAdminUserAction,
  AdminUserSession,
  PasswordResetRequest,
  UserImpersonationRequest,
  PaginatedResponse,
  ApiResponse,
  BulkOperationResponse
} from '@/lib/types'
import { apiClient } from '../shared/api-client'

// Re-export types for easier importing
export type {
  AdminUser,
  AdminUserFilters,
  AdminUserStats,
  CreateAdminUserRequest,
  UpdateAdminUserRequest,
  AdminUserActivity,
  BulkAdminUserAction,
  AdminUserSession,
  PasswordResetRequest,
  UserImpersonationRequest,
  PaginatedResponse,
  ApiResponse,
  BulkOperationResponse
}

export class AdminUsersService {
  /**
   * Get paginated list of users with filters
   */
  async getUsers(filters?: AdminUserFilters): Promise<PaginatedResponse<AdminUser>> {
    const response = await apiClient.get<{
      success: boolean;
      data: {
        adminUsers: AdminUser[];
        pagination: {
          current: number;
          pages: number;
          total: number;
        }
      }
    }>('/rbac/users', { 
      params: filters 
    })
    
    // Transform the API response to match the expected PaginatedResponse format
    const { adminUsers, pagination } = response.data.data;
    const limit = filters?.limit || 10;
    return {
      items: adminUsers,
      pagination: {
        page: pagination.current,
        pages: pagination.pages,
        total: pagination.total,
        limit: limit,
        hasNext: pagination.current < pagination.pages,
        hasPrev: pagination.current > 1
      }
    }
  }

  /**
   * Get user by ID
   */
  async getUserById(id: string): Promise<AdminUser> {
    const response = await apiClient.get<ApiResponse<AdminUser>>(`/rbac/users/${id}`)
    return response.data.data
  }

  /**
   * Create new user
   */
  async createUser(userData: CreateAdminUserRequest): Promise<AdminUser> {
    const response = await apiClient.post<ApiResponse<AdminUser>>('/rbac/users', userData)
    return response.data.data
  }

  /**
   * Update existing user
   */
  async updateUser(id: string, userData: UpdateAdminUserRequest): Promise<AdminUser> {
    const response = await apiClient.put<ApiResponse<AdminUser>>(`/rbac/users/${id}`, userData)
    return response.data.data
  }

  /**
   * Delete user
   */
  async deleteUser(id: string): Promise<void> {
    await apiClient.delete(`/rbac/users/${id}`)
  }

  /**
   * Bulk actions on multiple users
   */
  async bulkAction(action: BulkAdminUserAction): Promise<BulkOperationResponse<AdminUser>> {
    const response = await apiClient.post<BulkOperationResponse<AdminUser>>('/rbac/users/bulk-action', action)
    return response.data
  }

  /**
   * Change user password
   */
  async changeUserPassword(id: string, newPassword: string): Promise<void> {
    await apiClient.post(`/rbac/users/${id}/change-password`, { newPassword })
  }

  /**
   * Reset user password
   */
  async resetUserPassword(id: string, options: PasswordResetRequest): Promise<void> {
    await apiClient.post(`/rbac/users/${id}/reset-password`, options)
  }

  /**
   * Get user statistics
   */
  async getUserStatistics(): Promise<AdminUserStats> {
    const response = await apiClient.get<ApiResponse<AdminUserStats>>('/rbac/users/statistics')
    return response.data.data
  }

  /**
   * Get user activity logs
   */
  async getUserActivity(userId: string, filters?: { page?: number; limit?: number }): Promise<PaginatedResponse<AdminUserActivity>> {
    const response = await apiClient.get<PaginatedResponse<AdminUserActivity>>(`/rbac/users/${userId}/activity`, {
      params: filters
    })
    return response.data
  }

  /**
   * Get user active sessions
   */
  async getUserSessions(userId: string): Promise<AdminUserSession[]> {
    const response = await apiClient.get<ApiResponse<AdminUserSession[]>>(`/rbac/users/${userId}/sessions`)
    return response.data.data
  }

  /**
   * Terminate user session
   */
  async terminateSession(userId: string, sessionId: string): Promise<void> {
    await apiClient.delete(`/rbac/users/${userId}/sessions/${sessionId}`)
  }

  /**
   * Terminate all user sessions
   */
  async terminateAllSessions(userId: string): Promise<void> {
    await apiClient.delete(`/rbac/users/${userId}/sessions`)
  }

  /**
   * Toggle user status (activate/deactivate)
   */
  async toggleUserStatus(id: string, status: 'active' | 'inactive' | 'suspended'): Promise<AdminUser> {
    const response = await apiClient.put<ApiResponse<AdminUser>>(`/rbac/users/${id}/status`, { status })
    return response.data.data
  }

  /**
   * Toggle two-factor authentication for user
   */
  async toggleTwoFactor(id: string, enabled: boolean): Promise<AdminUser> {
    const response = await apiClient.put<ApiResponse<AdminUser>>(`/rbac/users/${id}/two-factor`, { enabled })
    return response.data.data
  }

  /**
   * Unlock user account
   */
  async unlockUser(id: string): Promise<AdminUser> {
    const response = await apiClient.post<ApiResponse<AdminUser>>(`/rbac/users/${id}/unlock`)
    return response.data.data
  }

  /**
   * Verify user email
   */
  async verifyUserEmail(id: string): Promise<AdminUser> {
    const response = await apiClient.post<ApiResponse<AdminUser>>(`/rbac/users/${id}/verify-email`)
    return response.data.data
  }

  /**
   * Impersonate user (admin feature)
   */
  async impersonateUser(request: UserImpersonationRequest): Promise<{ token: string; expiresAt: string }> {
    const response = await apiClient.post<ApiResponse<{ token: string; expiresAt: string }>>('/rbac/users/impersonate', request)
    return response.data.data
  }

  /**
   * Export users data
   */
  async exportUsers(filters?: AdminUserFilters, format: 'csv' | 'excel' | 'pdf' = 'csv'): Promise<Blob> {
    const response = await apiClient.get('/rbac/users/export', {
      params: { ...filters, format },
      responseType: 'blob'
    })
    return response.data as Blob
  }

  /**
   * Send notification to users
   */
  async sendNotification(userIds: string[], notification: {
    title: string;
    message: string;
    type?: 'info' | 'warning' | 'error' | 'success';
    sendEmail?: boolean;
  }): Promise<void> {
    await apiClient.post('/rbac/users/notify', {
      userIds,
      notification
    })
  }
}

export const adminUsersService = new AdminUsersService()