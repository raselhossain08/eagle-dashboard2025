'use client';

import React, { useState } from 'react';
import { usePermissions } from '@/lib/hooks/use-permissions';
import { useAdminUsers } from '@/lib/hooks/use-admin-users';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { AdminUsersTable } from '@/components/admin/admin-users-table';
import { AdminUserDialog } from '@/components/admin/admin-user-dialog';
import { 
  Users, 
  UserCheck, 
  UserX, 
  Shield, 
  Plus, 
  AlertCircle,
  TrendingUp,
  Activity
} from 'lucide-react';
import { AdminUser, CreateAdminUserRequest, UpdateAdminUserRequest } from '@/lib/types/admin';
import { toast } from 'sonner';

export default function AdminUserPage() {
  const { hasPermission, isLoading: permissionsLoading } = usePermissions();
  const {
    users,
    stats,
    currentPage,
    pageSize,
    totalUsers,
    filters,
    loading,
    refreshing,
    creating,
    updating,
    setPage,
    setFilters,
    refresh,
    createUser,
    updateUser,
    deleteUser,
    toggleUserStatus,
    exportUsers,
    error,
    clearError
  } = useAdminUsers({
    autoLoad: true,
    defaultPageSize: 10,
    defaultFilters: {}
  });

  // Dialog State
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<'create' | 'edit' | 'view'>('create');
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);

  // Permission check
  if (permissionsLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="space-y-2">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-96" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-8 w-16" />
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!hasPermission('users:read')) {
    return (
      <div className="p-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-red-500" />
              Access Denied
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              You don't have permission to view admin users. Contact your administrator for access.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Handle dialog actions
  const handleCreateUser = () => {
    setDialogMode('create');
    setSelectedUser(null);
    setDialogOpen(true);
  };

  const handleEditUser = (user: AdminUser) => {
    setDialogMode('edit');
    setSelectedUser(user);
    setDialogOpen(true);
  };

  const handleViewUser = (user: AdminUser) => {
    setDialogMode('view');
    setSelectedUser(user);
    setDialogOpen(true);
  };

  const handleDialogSubmit = async (data: CreateAdminUserRequest | UpdateAdminUserRequest) => {
    try {
      if (dialogMode === 'create') {
        await createUser(data as CreateAdminUserRequest);
      } else if (dialogMode === 'edit' && selectedUser) {
        await updateUser(selectedUser._id, data as UpdateAdminUserRequest);
      }
      setDialogOpen(false);
    } catch (error) {
      console.error('Dialog submit error:', error);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    await deleteUser(userId);
  };

  const handleToggleStatus = async (userId: string) => {
    await toggleUserStatus(userId);
  };

  const handleExport = async () => {
    await exportUsers('csv');
  };

  const handleUserAction = (user: AdminUser) => {
    // Default to edit if user has permission, otherwise view
    if (hasPermission('users:write')) {
      handleEditUser(user);
    } else {
      handleViewUser(user);
    }
  };

  // Calculate growth indicators
  const getGrowthIndicator = (current: number, previous: number) => {
    if (previous === 0) return { value: 0, positive: true };
    const growth = ((current - previous) / previous) * 100;
    return {
      value: Math.abs(growth),
      positive: growth >= 0
    };
  };

  return (
    <div className="p-6 space-y-6">
      {/* Error Display */}
      {error && (
        <Card className="border-destructive">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-destructive mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-destructive">Error</p>
                <p className="text-sm text-destructive/80">{error}</p>
              </div>
              <Button size="sm" variant="outline" onClick={clearError}>
                Dismiss
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Users className="h-8 w-8 text-blue-600" />
            Admin Users
          </h1>
          <p className="text-muted-foreground">
            Manage administrative users and their permissions
          </p>
        </div>
        
        {hasPermission('users:write') && (
          <Button onClick={handleCreateUser} disabled={creating} className="gap-2">
            <Plus className="h-4 w-4" />
            {creating ? 'Creating...' : 'Add Admin User'}
          </Button>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Admins</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats ? stats.adminUsers : totalUsers}
            </div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <TrendingUp className="h-3 w-3" />
              <span>+2 from last month</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {stats?.activeUsers || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Currently active
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Inactive</CardTitle>
            <UserX className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {stats?.inactiveUsers || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Temporarily disabled
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Super Admins</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {stats?.adminUsers || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Full system access
            </p>
          </CardContent>
        </Card>
      </div>

      {/* User Breakdown */}
      {stats && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              User Categories
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary" className="gap-1">
                Admin Users
                <span className="bg-primary/20 text-primary px-1.5 py-0.5 rounded text-xs">
                  {stats.adminUsers}
                </span>
              </Badge>
              <Badge variant="secondary" className="gap-1">
                Moderators
                <span className="bg-primary/20 text-primary px-1.5 py-0.5 rounded text-xs">
                  {stats.moderatorUsers}
                </span>
              </Badge>
              <Badge variant="secondary" className="gap-1">
                Regular Users
                <span className="bg-primary/20 text-primary px-1.5 py-0.5 rounded text-xs">
                  {stats.regularUsers}
                </span>
              </Badge>
              <Badge variant="secondary" className="gap-1">
                Subscribers
                <span className="bg-primary/20 text-primary px-1.5 py-0.5 rounded text-xs">
                  {stats.subscriberUsers}
                </span>
              </Badge>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Admin Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>Admin Users Management</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <AdminUsersTable
            users={users}
            totalUsers={totalUsers}
            currentPage={currentPage}
            pageSize={pageSize}
            filters={filters}
            loading={loading || refreshing}
            onPageChange={setPage}
            onFiltersChange={setFilters}
            onUserEdit={handleUserAction}
            onUserDelete={handleDeleteUser}
            onUserToggleStatus={handleToggleStatus}
            onUsersExport={handleExport}
            onRefresh={refresh}
          />
        </CardContent>
      </Card>

      {/* Admin User Dialog */}
      <AdminUserDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        user={selectedUser}
        mode={dialogMode}
        onSubmit={handleDialogSubmit}
        loading={creating || updating}
      />
    </div>
  );
}