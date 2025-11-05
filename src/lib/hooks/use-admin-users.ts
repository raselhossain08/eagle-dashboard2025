/**
 * Eagle Admin Users Hook
 * Professional React hook for admin user management operations
 */

'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { toast } from 'sonner';
import {
  AdminUser,
  AdminUserFilters,
  AdminUserStats,
  CreateAdminUserRequest,
  UpdateAdminUserRequest
} from '@/lib/types/admin';
import { PaginatedResponse } from '@/lib/types';
import { adminUsersService } from '@/lib/services/admin';

export interface UseAdminUsersOptions {
  autoLoad?: boolean;
  defaultPageSize?: number;
  defaultFilters?: AdminUserFilters;
}

export interface UseAdminUsersReturn {
  // Data
  users: AdminUser[];
  stats: AdminUserStats | null;
  
  // Pagination
  currentPage: number;
  pageSize: number;
  totalPages: number;
  totalUsers: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
  
  // Filters
  filters: AdminUserFilters;
  
  // Loading States
  loading: boolean;
  refreshing: boolean;
  creating: boolean;
  updating: boolean;
  deleting: boolean;
  
  // Actions
  loadUsers: () => Promise<void>;
  loadStats: () => Promise<void>;
  refresh: () => Promise<void>;
  setPage: (page: number) => void;
  setPageSize: (size: number) => void;
  setFilters: (filters: AdminUserFilters) => void;
  resetFilters: () => void;
  
  // CRUD Operations
  createUser: (data: CreateAdminUserRequest) => Promise<AdminUser | null>;
  updateUser: (userId: string, data: UpdateAdminUserRequest) => Promise<AdminUser | null>;
  deleteUser: (userId: string) => Promise<boolean>;
  toggleUserStatus: (userId: string) => Promise<boolean>;
  resetUserPassword: (userId: string, newPassword: string) => Promise<boolean>;
  updateUserPermissions: (userId: string, permissions: string[]) => Promise<AdminUser | null>;
  bulkUpdateUsers: (userIds: string[], data: Partial<UpdateAdminUserRequest>) => Promise<AdminUser[]>;
  
  // Export
  exportUsers: (format?: 'csv' | 'excel') => Promise<void>;
  
  // Error State
  error: string | null;
  clearError: () => void;
}

export function useAdminUsers(options: UseAdminUsersOptions = {}): UseAdminUsersReturn {
  const {
    autoLoad = true,
    defaultPageSize = 10,
    defaultFilters = {}
  } = options;

  // State
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [stats, setStats] = useState<AdminUserStats | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSizeState] = useState(defaultPageSize);
  const [totalPages, setTotalPages] = useState(0);
  const [totalUsers, setTotalUsers] = useState(0);
  const [filters, setFiltersState] = useState<AdminUserFilters>(defaultFilters);
  
  // Loading States
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [creating, setCreating] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [deleting, setDeleting] = useState(false);
  
  // Error State
  const [error, setError] = useState<string | null>(null);

  // Computed Values
  const hasNextPage = useMemo(() => currentPage < totalPages, [currentPage, totalPages]);
  const hasPrevPage = useMemo(() => currentPage > 1, [currentPage]);

  // Clear Error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Load Users
  const loadUsers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const filtersWithPagination = {
        ...filters,
        page: currentPage,
        limit: pageSize
      };

      const response = await adminUsersService.getUsers(filtersWithPagination);
      
      setUsers(response.items);
      setTotalPages(response.pagination.pages);
      setTotalUsers(response.pagination.total);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load users';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [currentPage, pageSize, filters]);

  // Load Stats
  const loadStats = useCallback(async () => {
    try {
      const response = await adminUsersService.getUserStatistics();
      setStats(response);
    } catch (err) {
      console.error('Failed to load admin user stats:', err);
    }
  }, []);

  // Refresh
  const refresh = useCallback(async () => {
    try {
      setRefreshing(true);
      await Promise.all([loadUsers(), loadStats()]);
    } finally {
      setRefreshing(false);
    }
  }, [loadUsers, loadStats]);

  // Set Page
  const setPage = useCallback((page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  }, [totalPages]);

  // Set Page Size
  const setPageSize = useCallback((size: number) => {
    setPageSizeState(size);
    setCurrentPage(1); // Reset to first page when changing page size
  }, []);

  // Set Filters
  const setFilters = useCallback((newFilters: AdminUserFilters) => {
    setFiltersState(newFilters);
    setCurrentPage(1); // Reset to first page when changing filters
  }, []);

  // Reset Filters
  const resetFilters = useCallback(() => {
    setFiltersState(defaultFilters);
    setCurrentPage(1);
  }, [defaultFilters]);

  // Create User
  const createUser = useCallback(async (data: CreateAdminUserRequest): Promise<AdminUser | null> => {
    try {
      setCreating(true);
      setError(null);

      const response = await adminUsersService.createUser(data);
      
      toast.success('Admin user created successfully');
      // Refresh the list to show the new user
      await loadUsers();
      await loadStats();
      return response;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create user';
      setError(errorMessage);
      toast.error(errorMessage);
      return null;
    } finally {
      setCreating(false);
    }
  }, [loadUsers, loadStats]);

  // Update User
  const updateUser = useCallback(async (
    userId: string, 
    data: UpdateAdminUserRequest
  ): Promise<AdminUser | null> => {
    try {
      setUpdating(true);
      setError(null);

      const response = await adminUsersService.updateUser(userId, data);

      toast.success('Admin user updated successfully');
      // Update the user in the current list
      setUsers(prevUsers => 
        prevUsers.map(user => 
          (user as any)._id === userId ? { ...user, ...response } : user
        )
      );
      await loadStats();
      return response;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update user';
      setError(errorMessage);
      toast.error(errorMessage);
      return null;
    } finally {
      setUpdating(false);
    }
  }, [loadStats]);

  // Delete User
  const deleteUser = useCallback(async (userId: string): Promise<boolean> => {
    try {
      setDeleting(true);
      setError(null);

      await adminUsersService.deleteUser(userId);

      toast.success('Admin user deleted successfully');
      // Remove user from current list
      setUsers(prevUsers => prevUsers.filter(user => (user as any)._id !== userId));
      await loadStats();
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete user';
      setError(errorMessage);
      toast.error(errorMessage);
      return false;
    } finally {
      setDeleting(false);
    }
  }, [loadStats]);

  // Toggle User Status
  const toggleUserStatus = useCallback(async (userId: string): Promise<boolean> => {
    try {
      setUpdating(true);
      setError(null);

      // First get current user to determine new status
      const currentUser = users.find(user => (user as any)._id === userId);
      if (!currentUser) {
        throw new Error('User not found');
      }

      const newActiveStatus = !currentUser.isActive;
      const newStatus = newActiveStatus ? 'active' : 'inactive';
      const response = await adminUsersService.toggleUserStatus(userId, newStatus);

      const statusText = newActiveStatus ? 'activated' : 'deactivated';
      toast.success(`User ${statusText} successfully`);
      
      // Update user in current list
      setUsers(prevUsers => 
        prevUsers.map(user => 
          (user as any)._id === userId ? { ...user, isActive: newActiveStatus } : user
        )
      );
      await loadStats();
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to toggle user status';
      setError(errorMessage);
      toast.error(errorMessage);
      return false;
    } finally {
      setUpdating(false);
    }
  }, [users, loadStats]);

  // Reset User Password
  const resetUserPassword = useCallback(async (
    userId: string, 
    newPassword: string
  ): Promise<boolean> => {
    try {
      setUpdating(true);
      setError(null);

      await adminUsersService.resetUserPassword(userId, {
        userId,
        requirePasswordChange: true,
        notifyUser: true
      });

      toast.success('Password reset successfully');
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to reset password';
      setError(errorMessage);
      toast.error(errorMessage);
      return false;
    } finally {
      setUpdating(false);
    }
  }, []);

  // Update User Permissions
  const updateUserPermissions = useCallback(async (
    userId: string, 
    permissions: string[]
  ): Promise<AdminUser | null> => {
    try {
      setUpdating(true);
      setError(null);

      const response = await adminUsersService.updateUser(userId, { permissions });

      toast.success('User permissions updated successfully');
      
      // Refresh users list to get updated data
      await loadUsers();
      return response;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update permissions';
      setError(errorMessage);
      toast.error(errorMessage);
      return null;
    } finally {
      setUpdating(false);
    }
  }, [loadUsers]);

  // Bulk Update Users
  const bulkUpdateUsers = useCallback(async (
    userIds: string[], 
    data: Partial<UpdateAdminUserRequest>
  ): Promise<AdminUser[]> => {
    try {
      setUpdating(true);
      setError(null);

      const response = await adminUsersService.bulkAction({
        action: 'changeRole',
        userIds,
        data: data as any
      });

      toast.success(`Successfully updated ${response.success.length} users`);
      await loadUsers();
      await loadStats();
      return response.success;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to bulk update users';
      setError(errorMessage);
      toast.error(errorMessage);
      return [];
    } finally {
      setUpdating(false);
    }
  }, [loadUsers, loadStats]);

  // Export Users
  const exportUsers = useCallback(async (format: 'csv' | 'excel' = 'csv'): Promise<void> => {
    try {
      setLoading(true);
      setError(null);

      const exportFormat = format === 'excel' ? 'excel' : 'csv';
      const blob = await adminUsersService.exportUsers(filters, exportFormat);
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      const extension = format === 'excel' ? 'xlsx' : 'csv';
      link.download = `admin-users-${new Date().toISOString().split('T')[0]}.${extension}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success('Export completed successfully');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to export users';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  // Auto-load on mount and dependency changes
  useEffect(() => {
    if (autoLoad) {
      loadUsers();
    }
  }, [loadUsers, autoLoad]);

  // Load stats on mount
  useEffect(() => {
    if (autoLoad) {
      loadStats();
    }
  }, [loadStats, autoLoad]);

  return {
    // Data
    users,
    stats,
    
    // Pagination
    currentPage,
    pageSize,
    totalPages,
    totalUsers,
    hasNextPage,
    hasPrevPage,
    
    // Filters
    filters,
    
    // Loading States
    loading,
    refreshing,
    creating,
    updating,
    deleting,
    
    // Actions
    loadUsers,
    loadStats,
    refresh,
    setPage,
    setPageSize,
    setFilters,
    resetFilters,
    
    // CRUD Operations
    createUser,
    updateUser,
    deleteUser,
    toggleUserStatus,
    resetUserPassword,
    updateUserPermissions,
    bulkUpdateUsers,
    
    // Export
    exportUsers,
    
    // Error State
    error,
    clearError
  };
}