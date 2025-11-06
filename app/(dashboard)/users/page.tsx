"use client";

import { useState, useEffect } from 'react';
import { ProtectedRoute } from '@/components/auth/protected-route';
import { Plus, Search, Filter, Download, MoreHorizontal, RefreshCw } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { UserDataTable } from '@/components/dashboard/users/user-data-table';
import { UserStatsCards } from '@/components/dashboard/users/user-stats-cards';
import { CreateUserDialog } from '@/components/dashboard/users/create-user-dialog';
import { EditUserDialog } from '@/components/dashboard/users/edit-user-dialog';
import { DeleteUserDialog } from '@/components/dashboard/users/delete-user-dialog';
import { BulkActionsDialog } from '@/components/dashboard/users/bulk-actions-dialog';
import { UserDetailsDialog } from '@/components/dashboard/users/user-details-dialog';
import { useUsers } from '@/components/dashboard/users/use-users';
import { UserProfile, UserFilters } from '@/lib/types';

function UsersPageContent() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRole, setSelectedRole] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [currentTab, setCurrentTab] = useState('all');
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showBulkActionsDialog, setShowBulkActionsDialog] = useState(false);
  const [showUserDetailsDialog, setShowUserDetailsDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Create filters object
  const filters: UserFilters = {
    search: searchQuery || undefined,
    role: selectedRole !== 'all' ? selectedRole as any : undefined,
    status: selectedStatus !== 'all' ? selectedStatus as any : undefined,
    page: currentPage,
    limit: pageSize,
    sortBy: 'createdAt',
    sortOrder: 'desc'
  };

  const {
    users,
    userStats,
    loading,
    error,
    refetch,
    createUser,
    updateUser,
    deleteUser,
    bulkAction
  } = useUsers(filters);

  const handleCreateUser = async (userData: any) => {
    await createUser(userData);
    setShowCreateDialog(false);
    refetch();
  };

  const handleEditUser = (user: UserProfile) => {
    setSelectedUser(user);
    setShowEditDialog(true);
  };

  const handleUpdateUser = async (userData: any) => {
    if (selectedUser) {
      await updateUser(selectedUser._id, userData);
      setShowEditDialog(false);
      setSelectedUser(null);
      refetch();
    }
  };

  const handleDeleteUser = (user: UserProfile) => {
    setSelectedUser(user);
    setShowDeleteDialog(true);
  };

  const handleConfirmDelete = async () => {
    if (selectedUser) {
      await deleteUser(selectedUser._id);
      setShowDeleteDialog(false);
      setSelectedUser(null);
      refetch();
    }
  };

  const handleViewUser = (user: UserProfile) => {
    setSelectedUser(user);
    setShowUserDetailsDialog(true);
  };

  const handleBulkAction = async (action: string, data?: any) => {
    if (selectedUsers.length > 0) {
      await bulkAction({
        action: action as any,
        userIds: selectedUsers,
        data
      });
      setSelectedUsers([]);
      setShowBulkActionsDialog(false);
      refetch();
    }
  };

  const handleExportUsers = () => {
    // TODO: Implement export functionality
    console.log('Export users');
  };

  const handleRefresh = () => {
    refetch();
  };

  const getTabUsers = (): UserProfile[] => {
    if (!users || !Array.isArray(users)) {
      console.warn('⚠️ Users is null or not an array:', users);
      return [];
    }

    console.log('🔍 Filtering users for tab:', currentTab, 'Total users:', users.length);

    switch (currentTab) {
      case 'active':
        return users.filter((user: UserProfile) => user.status === 'active');
      case 'inactive':
        return users.filter((user: UserProfile) => user.status === 'inactive');
      case 'suspended':
        return users.filter((user: UserProfile) => user.status === 'suspended');
      case 'pending':
        return users.filter((user: UserProfile) => user.status === 'pending');
      default:
        return users;
    }
  };

  const tabUsers = getTabUsers();

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
            User Management
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage users, roles, and permissions across your organization
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportUsers}
          >
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button
            size="sm"
            onClick={() => setShowCreateDialog(true)}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add User
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <UserStatsCards stats={userStats} loading={loading} />

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
          <CardDescription>
            Filter and search through your user base
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:space-x-4 sm:space-y-0">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder="Search users..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={selectedRole} onValueChange={setSelectedRole}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="user">User</SelectItem>
                <SelectItem value="moderator">Moderator</SelectItem>
                <SelectItem value="subscriber">Subscriber</SelectItem>
              </SelectContent>
            </Select>
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="suspended">Suspended</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
              </SelectContent>
            </Select>
            {selectedUsers.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowBulkActionsDialog(true)}
              >
                Bulk Actions ({selectedUsers.length})
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Users Table with Tabs */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Users</CardTitle>
              <CardDescription>
                A comprehensive list of all users in your system
              </CardDescription>
            </div>
            <div className="flex items-center space-x-2">
              <Select value={pageSize.toString()} onValueChange={(value) => setPageSize(Number(value))}>
                <SelectTrigger className="w-[100px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="25">25</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                  <SelectItem value="100">100</SelectItem>
                </SelectContent>
              </Select>
              <span className="text-sm text-gray-600">per page</span>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={currentTab} onValueChange={setCurrentTab}>
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="all">
                All Users
                {userStats && (
                  <Badge variant="secondary" className="ml-2">
                    {userStats.totalUsers}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="active">
                Active
                {userStats && (
                  <Badge variant="secondary" className="ml-2">
                    {userStats.activeUsers}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="inactive">
                Inactive
                {userStats && (
                  <Badge variant="secondary" className="ml-2">
                    {userStats.inactiveUsers}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="suspended">
                Suspended
                {userStats && (
                  <Badge variant="secondary" className="ml-2">
                    {userStats.suspendedUsers}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="pending">
                Pending
                {userStats && (
                  <Badge variant="secondary" className="ml-2">
                    {userStats.pendingUsers}
                  </Badge>
                )}
              </TabsTrigger>
            </TabsList>

            <div className="mt-6">
              <UserDataTable
                users={tabUsers}
                loading={loading}
                selectedUsers={selectedUsers}
                onSelectUsers={setSelectedUsers}
                onEditUser={handleEditUser}
                onDeleteUser={handleDeleteUser}
                onViewUser={handleViewUser}
                currentPage={currentPage}
                pageSize={pageSize}
                onPageChange={setCurrentPage}
                onPageSizeChange={setPageSize}
              />
            </div>
          </Tabs>
        </CardContent>
      </Card>

      {/* Dialogs */}
      <CreateUserDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        onCreateUser={handleCreateUser}
      />

      <EditUserDialog
        open={showEditDialog}
        onOpenChange={setShowEditDialog}
        user={selectedUser}
        onUpdateUser={handleUpdateUser}
      />

      <DeleteUserDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        user={selectedUser}
        onConfirmDelete={handleConfirmDelete}
      />

      <BulkActionsDialog
        open={showBulkActionsDialog}
        onOpenChange={setShowBulkActionsDialog}
        selectedUserIds={selectedUsers}
        onBulkAction={handleBulkAction}
      />

      <UserDetailsDialog
        open={showUserDetailsDialog}
        onOpenChange={setShowUserDetailsDialog}
        user={selectedUser}
      />
    </div>
  );
}

export default function UsersPage() {
  return (
    <ProtectedRoute requiredRole="admin">
      <UsersPageContent />
    </ProtectedRoute>
  );
}