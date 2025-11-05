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

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch users and stats in parallel
      const [usersResponse, statsResponse] = await Promise.all([
        UserService.getUsers(filters),
        UserService.getUserStats()
      ]);

      if (usersResponse.success) {
        setUsers(usersResponse.data.users);
      } else {
        throw new Error(usersResponse.message || 'Failed to fetch users');
      }

      if (statsResponse.success) {
        setUserStats(statsResponse.data);
      } else {
        throw new Error(statsResponse.message || 'Failed to fetch user stats');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [filters]);

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