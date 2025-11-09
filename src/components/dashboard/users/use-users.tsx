"use client";

import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { UserService } from '@/lib/services';
import {
  UserProfile,
  UserFilters,
  UserStats,
  CreateUserRequest,
  UpdateUserRequest,
  BulkUserAction
} from '@/lib/types';

interface UseUsersReturn {
  users: UserProfile[] | null;
  userStats: UserStats | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
  createUser: (userData: CreateUserRequest) => Promise<void>;
  updateUser: (userId: string, userData: UpdateUserRequest) => Promise<void>;
  deleteUser: (userId: string) => Promise<void>;
  bulkAction: (action: BulkUserAction) => Promise<void>;
}

export function useUsers(filters?: UserFilters): UseUsersReturn {
  const [users, setUsers] = useState<UserProfile[] | null>(null);
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Stringify filters to prevent infinite loop from object reference changes
  const filtersString = JSON.stringify(filters);

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('🔍 Fetching users with filters:', filters);

      // Fetch users and stats in parallel
      const [usersResponse, statsResponse] = await Promise.all([
        UserService.getUsers(filters),
        UserService.getUserStats()
      ]);

      console.log('📦 Users API Response:', usersResponse);
      console.log('📊 Stats API Response:', statsResponse);

      if (usersResponse.success) {
        // Handle both response formats: { data: users[] } or { data: { users: [] } }
        const userData = Array.isArray(usersResponse.data)
          ? usersResponse.data
          : usersResponse.data?.users || [];

        console.log('✅ Setting users:', userData.length, 'users found');
        setUsers(userData);
      } else {
        throw new Error(usersResponse.message || 'Failed to fetch users');
      }

      if (statsResponse.success) {
        setUserStats(statsResponse.data);
      } else {
        console.warn('⚠️ Stats failed but continuing:', statsResponse.message);
        // Don't throw error for stats, just log it
        setUserStats(null);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      console.error('❌ Error fetching users:', err);
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filtersString]);

  const createUser = async (userData: CreateUserRequest) => {
    try {
      setLoading(true);
      const response = await UserService.createUser(userData);

      if (response.success) {
        toast.success('User created successfully');
        await fetchUsers(); // Refetch to get updated list
      } else {
        throw new Error(response.message || 'Failed to create user');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      toast.error(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateUser = async (userId: string, userData: UpdateUserRequest) => {
    try {
      setLoading(true);
      const response = await UserService.updateUser(userId, userData);

      if (response.success) {
        toast.success('User updated successfully');
        await fetchUsers(); // Refetch to get updated list
      } else {
        throw new Error(response.message || 'Failed to update user');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      toast.error(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteUser = async (userId: string) => {
    try {
      setLoading(true);
      const response = await UserService.deleteUser(userId);

      if (response.success) {
        toast.success('User deleted successfully');
        await fetchUsers(); // Refetch to get updated list
      } else {
        throw new Error(response.message || 'Failed to delete user');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      toast.error(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const bulkAction = async (action: BulkUserAction) => {
    try {
      setLoading(true);
      const response = await UserService.bulkAction(action);

      if (response.success) {
        toast.success(`Bulk action completed successfully. Processed ${response.data.processedCount} users.`);

        if (response.data.failedCount > 0) {
          toast.warning(`${response.data.failedCount} users failed to process.`);
        }

        await fetchUsers(); // Refetch to get updated list
      } else {
        throw new Error(response.message || 'Failed to perform bulk action');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      toast.error(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const refetch = useCallback(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Initial data fetch
  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  return {
    users,
    userStats,
    loading,
    error,
    refetch,
    createUser,
    updateUser,
    deleteUser,
    bulkAction
  };
}