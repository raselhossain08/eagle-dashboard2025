
'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { usePermissions } from '@/lib/hooks';
import { useRoles } from '@/lib/hooks';
import { useConnectionStatus } from '@/lib/hooks';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { 
  Plus, 
  Search, 
  Filter, 
  MoreHorizontal, 
  Eye, 
  Edit, 
  Trash2, 
  UserCheck, 
  Copy,
  Shield,
  Users,
  Crown,
  AlertCircle,
  CheckCircle,
  RefreshCw
} from 'lucide-react';
import { toast } from 'sonner';

import RoleService, { Role as ServiceRole, CreateRoleRequest, UpdateRoleDataRequest } from '@/lib/services/admin';
import { UserService, User, GetUsersParams, UpdateUserRequest } from '@/lib/services/admin';
import AuthService from '@/lib/services/auth';
import { RegisterRequest } from '@/lib/types';
import { DataTable } from '@/components/ui/data-table';
import { createUsersColumns } from './columns/users-columns';
import { createRolesColumns, Role as TableRole } from './columns/roles-columns';

interface Role extends ServiceRole {
  level: number; // For backward compatibility, we'll map hierarchy to level
}

const ALL_PERMISSIONS = [
  // System permissions
  'system:full_access', 'security:manage', 'users:delete', 'system:destroy', 'system:read',
  // User management
  'users:read', 'users:write', 'users:manage', 'users:impersonate',
  // Dashboard and reports
  'dashboard:access', 'reports:read', 'reports:write', 'analytics:read', 'analytics:write',
  // Financial permissions
  'billing:manage', 'invoices:manage', 'refunds:process', 'payouts:manage', 'taxes:manage',
  'financial_reports:view', 'financial_reports:export',
  // Marketing and campaigns
  'discounts:manage', 'campaigns:manage', 'announcements:manage',
  // Support permissions
  'subscribers:lookup', 'plans:change_non_financial', 'receipts:resend', 'cancellations:initiate'
];

const ROLE_LEVELS = [
  { value: 1, label: 'User', icon: Users },
  { value: 2, label: 'Read Only', icon: Eye },
  { value: 3, label: 'Support', icon: Shield },
  { value: 4, label: 'Growth Marketing', icon: Users },
  { value: 5, label: 'Finance Admin', icon: Shield },
  { value: 6, label: 'Admin', icon: Crown },
  { value: 7, label: 'Super Admin', icon: Crown }
];

export default function RolesPage() {
  const { hasPermission, userRole, isLoading } = usePermissions();
  const { isOnline, isApiReachable } = useConnectionStatus();
  
  // Direct roles state management - simple and working
  const [roles, setRoles] = useState<Role[]>([]);
  const [rolesLoading, setRolesLoading] = useState(false);
  const [rolesError, setRolesError] = useState<Error | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  // Direct fetch function
  const fetchRoles = useCallback(async () => {
    if (rolesLoading) return;
    
    setRolesLoading(true);
    setRolesError(null);
    setInitialLoad(false);
    
    try {
      console.log('🔄 Fetching roles...');
      const response = await RoleService.getRoles(true);
      
      if (response.data && Array.isArray(response.data)) {
        const mappedRoles = response.data.map((role: any) => ({
          ...role,
          level: role.hierarchy || 1,
          userCount: role.userCount || 0,
          permissions: role.permissions || [],
          isActive: role.isActive !== false,
          color: role.color || '#6B7280',
          icon: role.icon || 'Shield',
          description: role.description || ''
        }));
        setRoles(mappedRoles);
        setLastUpdated(new Date());
        console.log('✅ Roles loaded:', mappedRoles.length);
      }
    } catch (error: any) {
      console.error('❌ Failed to fetch roles:', error);
      setRolesError(error);
      toast.error(`Failed to load roles: ${error.message}`);
    } finally {
      setRolesLoading(false);
    }
  }, [rolesLoading]);
  const [users, setUsers] = useState<User[]>([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [usersError, setUsersError] = useState<Error | null>(null);
  const [selectedRows, setSelectedRows] = useState<User[] | Role[]>([]);
  const [viewMode, setViewMode] = useState<'roles' | 'users'>('roles');
  const [usersFetched, setUsersFetched] = useState(false);
  const [initialLoad, setInitialLoad] = useState(true);

  // Modal states
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  
  // User management modal states
  const [createUserModalOpen, setCreateUserModalOpen] = useState(false);
  const [editUserModalOpen, setEditUserModalOpen] = useState(false);
  const [viewUserModalOpen, setViewUserModalOpen] = useState(false);
  const [deleteUserModalOpen, setDeleteUserModalOpen] = useState(false);
  
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  
  // Individual loading states for better UX
  const [isCreatingRole, setIsCreatingRole] = useState(false);
  const [isUpdatingRole, setIsUpdatingRole] = useState(false);
  const [isDeletingRole, setIsDeletingRole] = useState(false);
  const [isCreatingUser, setIsCreatingUser] = useState(false);
  const [isUpdatingUser, setIsUpdatingUser] = useState(false);
  const [isDeletingUser, setIsDeletingUser] = useState(false);
  
  // Data freshness tracking
  const [dataLastUpdated, setDataLastUpdated] = useState<Date | null>(null);

  // Form states
  const [formData, setFormData] = useState({
    name: '',
    displayName: '',
    level: 1,
    description: '',
    permissions: [] as string[],
    isActive: true,
    color: '#6B7280',
    icon: 'User',
    email: '',
    password: ''
  });

  // User form states
  const [userFormData, setUserFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    discordUsername: '',
    isActive: true,
    isEmailVerified: false,
    address: {
      country: '',
      streetAddress: '',
      flatSuiteUnit: '',
      townCity: '',
      stateCounty: '',
      postcodeZip: ''
    }
  });

  // Initial data load
  useEffect(() => {
    fetchRoles();
  }, []);

  // Simple retry wrapper
  const fetchRolesWithRetry = useCallback(async (retries = 2) => {
    try {
      await fetchRoles();
    } catch (error) {
      if (retries > 0) {
        // Fast retry - only 300ms delay
        setTimeout(() => fetchRolesWithRetry(retries - 1), 300);
      }
    }
  }, [fetchRoles]);

  // Manual fetch functions with professional error handling
  const fetchUsersWithRetry = useCallback(async (retries = 3) => {
    if (usersLoading) {
      console.log('⚠️ Users already loading, skipping duplicate request');
      return;
    }

    setUsersLoading(true);
    setUsersError(null);
    
    try {
      console.log('🔄 Fetching users...');
      const response = await UserService.getUsers({ limit: 100 });
      
      // Validate response structure
      if (!response || !response.data || !Array.isArray(response.data)) {
        throw new Error('Invalid response format from server');
      }
      
      // Map users to ensure all required fields are present
      const mappedUsers = response.data
        .filter(user => user._id && user.email) // Filter out invalid users
        .map(user => ({
          ...user,
          firstName: user.firstName || '',
          lastName: user.lastName || '',
          role: user.role || 'user',
          isActive: user.isActive !== false, // Default to true if not specified
          isEmailVerified: user.isEmailVerified || false,
          permissions: Array.isArray(user.permissions) ? user.permissions : [],
          roleMetadata: user.roleMetadata || {
            roleInfo: {
              displayName: user.role || 'User',
              color: '#6B7280',
              hierarchy: 1
            }
          },
          createdAt: user.createdAt || new Date().toISOString(),
          updatedAt: user.updatedAt || new Date().toISOString()
        }));
      
      setUsers(mappedUsers);
      setUsersFetched(true);
      setDataLastUpdated(new Date());
      console.log(`✅ Users fetched successfully: ${mappedUsers.length} users with mapped data`);
      
    } catch (error) {
      console.error('❌ Failed to fetch users:', error);
      const err = error instanceof Error ? error : new Error('Failed to fetch users');
      setUsersError(err);
      
      // Only show toast for user-initiated actions, not automatic fetches
      if (retries > 0) {
        console.log(`🔄 Retrying user fetch... (${retries} attempts left)`);
        setTimeout(() => fetchUsersWithRetry(retries - 1), 2000);
      } else {
        toast.error(`Failed to load users: ${err.message}`);
      }
    } finally {
      setUsersLoading(false);
    }
  }, []);

  // Button handler wrappers - optimized for performance
  const handleRefreshData = useCallback(() => {
    if (viewMode === 'users') {
      fetchUsersWithRetry();
    } else {
      fetchRolesWithRetry();
    }
  }, [viewMode]);

  const handleRefreshUsers = useCallback(() => {
    fetchUsersWithRetry();
  }, []);

  const handleRefreshRoles = useCallback(() => {
    fetchRoles();
  }, [fetchRoles]);

  // Optimized: Fetch data when switching tabs - minimal operations
  useEffect(() => {
    if (viewMode === 'users' && !usersFetched && !usersLoading) {
      fetchUsersWithRetry();
    }
  }, [viewMode, usersFetched, usersLoading]);

  // The useRoles hook automatically fetches data on mount, so we don't need to do it manually
  // This effect is just for logging
  useEffect(() => {
    console.log('� Component mounted - useRoles hook will handle automatic role fetching');
  }, []);

  // Handle permission check
  useEffect(() => {
    if (!isLoading && userRole && !hasPermission('dashboard:access')) {
      toast.error('Access denied. You do not have permission to access the dashboard.');
    }
  }, [isLoading, hasPermission, userRole]);

  const handleCreateRole = async () => {
    // Comprehensive form validation
    if (!formData.name.trim()) {
      toast.error('Role name is required');
      return;
    }
    if (!formData.displayName.trim()) {
      toast.error('Display name is required');
      return;
    }
    if (formData.level < 1 || formData.level > 7) {
      toast.error('Role level must be between 1 and 7');
      return;
    }
    if (formData.name.includes(' ')) {
      toast.error('Role name cannot contain spaces. Use underscores instead.');
      return;
    }
    if (formData.name.length < 3) {
      toast.error('Role name must be at least 3 characters long');
      return;
    }

    try {
      setIsCreatingRole(true);
      const createData: CreateRoleRequest = {
        name: formData.name.toLowerCase().replace(/\s+/g, '_'), // Ensure proper formatting
        displayName: formData.displayName,
        description: formData.description,
        permissions: formData.permissions,
        hierarchy: formData.level,
        color: formData.color,
        icon: formData.icon,
        isActive: formData.isActive,
        email: formData.email,
        password: formData.password
      };

      await RoleService.createRole(createData);
      await fetchRoles();
      setCreateModalOpen(false);
      resetForm();
      toast.success(`Role "${formData.displayName}" created successfully with ${formData.permissions.length} permissions`);
    } catch (error: any) {
      console.error('❌ Role creation failed:', error);
      const errorMessage = error?.response?.data?.message || error?.message || 'Failed to create role';
      toast.error(errorMessage);
    } finally {
      setIsCreatingRole(false);
    }
  };

  const handleUpdateRole = async () => {
    if (!selectedRole) return;

    // Validate form before submission
    if (!formData.displayName.trim()) {
      toast.error('Display name is required');
      return;
    }

    try {
      setIsUpdatingRole(true);
      const updateData: UpdateRoleDataRequest = {
        displayName: formData.displayName,
        description: formData.description,
        permissions: formData.permissions,
        color: formData.color,
        icon: formData.icon,
        isActive: formData.isActive,
        email: formData.email,
        password: formData.password
      };

      await RoleService.updateRole(selectedRole._id, updateData);
      await fetchRoles();
      setEditModalOpen(false);
      resetForm();
      toast.success(`Role "${formData.displayName}" updated successfully`);
    } catch (error: any) {
      const errorMessage = error?.message || 'Failed to update role';
      toast.error(errorMessage);
    } finally {
      setIsUpdatingRole(false);
    }
  };

  const handleDeleteRole = async () => {
    if (!selectedRole || !selectedRole._id) {
      toast.error('Invalid role selected');
      return;
    }

    // Additional safety checks
    if (['superadmin', 'admin', 'user'].includes(selectedRole.name)) {
      toast.error('Cannot delete system roles');
      return;
    }

    if (selectedRole.userCount && selectedRole.userCount > 0) {
      toast.error('Cannot delete role with assigned users');
      return;
    }

    try {
      setIsDeletingRole(true);
      await RoleService.deleteRole(selectedRole._id);
      await fetchRoles();
      setDeleteModalOpen(false);
      setSelectedRole(null);
      toast.success(`Role "${selectedRole.displayName}" deleted successfully`);
    } catch (error: any) {
      console.error('❌ Role deletion failed:', error);
      const errorMessage = error?.response?.data?.message || error?.message || 'Failed to delete role';
      toast.error(errorMessage);
    } finally {
      setIsDeletingRole(false);
    }
  };

  const handleCopyRole = (role: Role) => {
    // Ensure all required fields are present and valid
    const copyName = role.name ? `${role.name}_copy` : 'copied_role';
    const copyDisplayName = role.displayName ? `${role.displayName} Copy` : 'Copied Role';
    
    setFormData({
      name: copyName,
      displayName: copyDisplayName,
      level: role.level || 1,
      description: role.description || '',
      permissions: Array.isArray(role.permissions) ? [...role.permissions] : [],
      isActive: true,
      color: role.color || '#6B7280',
      icon: role.icon || 'User',
      email: '',
      password: ''
    });
    setCreateModalOpen(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      displayName: '',
      level: 1,
      description: '',
      permissions: [],
      isActive: true,
      color: '#6B7280',
      icon: 'User',
      email: '',
      password: ''
    });
    setSelectedRole(null);
  };

  const openEditModal = (role: Role) => {
    if (!role || !role._id) {
      toast.error('Invalid role data');
      return;
    }
    
    setSelectedRole(role);
    setFormData({
      name: role.name || '',
      displayName: role.displayName || '',
      level: role.level || 1,
      description: role.description || '',
      permissions: Array.isArray(role.permissions) ? [...role.permissions] : [],
      isActive: role.isActive !== false,
      color: role.color || '#6B7280',
      icon: role.icon || 'User',
      email: role.email || '',
      password: ''
    });
    setEditModalOpen(true);
  };

  const getRoleIcon = (level: number) => {
    const roleLevel = ROLE_LEVELS.find(rl => rl.value === level);
    const Icon = roleLevel?.icon || Shield;
    return <Icon className="h-4 w-4" />;
  };

  const getRoleLabel = (level: number) => {
    const roleLevel = ROLE_LEVELS.find(rl => rl.value === level);
    return roleLevel?.label || 'Unknown';
  };

  const togglePermission = (permission: string) => {
    setFormData(prev => ({
      ...prev,
      permissions: prev.permissions.includes(permission)
        ? prev.permissions.filter(p => p !== permission)
        : [...prev.permissions, permission]
    }));
  };

  // Create stable callback functions for role actions
  const handleViewRole = useCallback((role: Role) => {
    console.log('👁️ View role clicked:', role.displayName);
    if (role && role._id) {
      setSelectedRole(role);
      setViewModalOpen(true);
    } else {
      console.error('Invalid role data for view:', role);
      toast.error('Cannot view role: Invalid role data');
    }
  }, []);

  const handleEditRole = useCallback((role: Role) => {
    console.log('✏️ Edit role clicked:', role.displayName);
    if (role && role._id) {
      openEditModal(role);
    } else {
      console.error('Invalid role data for edit:', role);
      toast.error('Cannot edit role: Invalid role data');
    }
  }, []);

  const handleDeleteRoleClick = useCallback((role: Role) => {
    console.log('🗑️ Delete role clicked:', role.displayName);
    if (role && role._id) {
      setSelectedRole(role);
      setDeleteModalOpen(true);
    } else {
      console.error('Invalid role data for delete:', role);
      toast.error('Cannot delete role: Invalid role data');
    }
  }, []);

  const handleCopyRoleClick = useCallback((role: Role) => {
    console.log('📋 Copy role clicked:', role.displayName);
    if (role && role._id) {
      handleCopyRole(role);
    } else {
      console.error('Invalid role data for copy:', role);
      toast.error('Cannot copy role: Invalid role data');
    }
  }, []);

  const handleAssignUsersClick = useCallback((role: Role) => {
    console.log('👥 Assign users clicked:', role.displayName);
    if (role && role._id) {
      setSelectedRole(role);
      setAssignModalOpen(true);
    } else {
      console.error('Invalid role data for assign users:', role);
      toast.error('Cannot assign users: Invalid role data');
    }
  }, []);

  // User management functions
  const handleCreateUser = async () => {
    // Comprehensive form validation
    if (!userFormData.firstName.trim()) {
      toast.error('First name is required');
      return;
    }
    if (!userFormData.lastName.trim()) {
      toast.error('Last name is required');
      return;
    }
    if (userFormData.firstName.trim().length < 2) {
      toast.error('First name must be at least 2 characters');
      return;
    }
    if (userFormData.lastName.trim().length < 2) {
      toast.error('Last name must be at least 2 characters');
      return;
    }
    if (!userFormData.email.trim()) {
      toast.error('Email is required');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(userFormData.email)) {
      toast.error('Please enter a valid email address');
      return;
    }
    if (!userFormData.password.trim()) {
      toast.error('Password is required');
      return;
    }
    if (userFormData.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    if (userFormData.password !== userFormData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    if (userFormData.phone && userFormData.phone.trim() && !/^[\+]?[(]?[\d\s\-\(\)]{10,}$/.test(userFormData.phone)) {
      toast.error('Please enter a valid phone number');
      return;
    }

    try {
      setIsCreatingUser(true);
      // Use AuthService register to create new users
      const registerData: RegisterRequest = {
        name: `${userFormData.firstName.trim()} ${userFormData.lastName.trim()}`,
        email: userFormData.email.toLowerCase().trim(),
        password: userFormData.password,
        confirmPassword: userFormData.confirmPassword
      };

      await AuthService.register(registerData);
      await fetchUsersWithRetry();
      setCreateUserModalOpen(false);
      resetUserForm();
      toast.success(`User "${userFormData.firstName} ${userFormData.lastName}" created successfully`);
    } catch (error: any) {
      console.error('❌ User creation failed:', error);
      const errorMessage = error?.response?.data?.message || error?.message || 'Failed to create user';
      toast.error(errorMessage);
    } finally {
      setIsCreatingUser(false);
    }
  };

  const handleUpdateUser = async () => {
    if (!selectedUser) return;

    // Validate form before submission
    if (!userFormData.firstName.trim()) {
      toast.error('First name is required');
      return;
    }
    if (!userFormData.lastName.trim()) {
      toast.error('Last name is required');
      return;
    }

    try {
      setIsUpdatingUser(true);
      const updateData: UpdateUserRequest = {
        firstName: userFormData.firstName,
        lastName: userFormData.lastName,
        phone: userFormData.phone,
        discordUsername: userFormData.discordUsername,
        address: userFormData.address,
        isActive: userFormData.isActive,
        isEmailVerified: userFormData.isEmailVerified
      };

      await UserService.updateUser(selectedUser._id, updateData);
      await fetchUsersWithRetry();
      setEditUserModalOpen(false);
      resetUserForm();
      toast.success('User updated successfully');
    } catch (error: any) {
      const errorMessage = error?.message || 'Failed to update user';
      toast.error(errorMessage);
    } finally {
      setIsUpdatingUser(false);
    }
  };

  const handleDeleteUser = async () => {
    if (!selectedUser || !selectedUser._id) {
      toast.error('Invalid user selected');
      return;
    }

    // Additional safety check for admin users
    if (['superadmin', 'admin'].includes(selectedUser.role)) {
      toast.error('Cannot delete admin users for security reasons');
      return;
    }

    try {
      setIsDeletingUser(true);
      await UserService.deleteUser(selectedUser._id);
      await fetchUsersWithRetry();
      setDeleteUserModalOpen(false);
      setSelectedUser(null);
      toast.success(`User "${selectedUser.firstName} ${selectedUser.lastName}" deleted successfully`);
    } catch (error: any) {
      console.error('❌ User deletion failed:', error);
      const errorMessage = error?.response?.data?.message || error?.message || 'Failed to delete user';
      toast.error(errorMessage);
    } finally {
      setIsDeletingUser(false);
    }
  };

  const resetUserForm = () => {
    setUserFormData({
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      confirmPassword: '',
      phone: '',
      discordUsername: '',
      isActive: true,
      isEmailVerified: false,
      address: {
        country: '',
        streetAddress: '',
        flatSuiteUnit: '',
        townCity: '',
        stateCounty: '',
        postcodeZip: ''
      }
    });
    setSelectedUser(null);
  };

  const openEditUserModal = (user: User) => {
    if (!user || !user._id) {
      toast.error('Invalid user data');
      return;
    }
    
    setSelectedUser(user);
    setUserFormData({
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      email: user.email || '',
      password: '',
      confirmPassword: '',
      phone: user.phone || '',
      discordUsername: '', // This field may not exist in the User type, default to empty
      isActive: user.isActive !== false,
      isEmailVerified: user.isEmailVerified || false,
      address: {
        country: '',
        streetAddress: '',
        flatSuiteUnit: '',
        townCity: '',
        stateCounty: '',
        postcodeZip: ''
      }
    });
    setEditUserModalOpen(true);
  };

  // User action callbacks
  const handleViewUser = useCallback((user: User) => {
    console.log('👁️ View user clicked:', user.firstName, user.lastName);
    if (user && user._id) {
      setSelectedUser(user);
      setViewUserModalOpen(true);
    } else {
      console.error('Invalid user data for view:', user);
      toast.error('Cannot view user: Invalid user data');
    }
  }, []);

  const handleEditUser = useCallback((user: User) => {
    console.log('✏️ Edit user clicked:', user.firstName, user.lastName);
    if (user && user._id) {
      openEditUserModal(user);
    } else {
      console.error('Invalid user data for edit:', user);
      toast.error('Cannot edit user: Invalid user data');
    }
  }, []);

  const handleDeleteUserClick = useCallback((user: User) => {
    console.log('🗑️ Delete user clicked:', user.firstName, user.lastName);
    if (user && user._id) {
      setSelectedUser(user);
      setDeleteUserModalOpen(true);
    } else {
      console.error('Invalid user data for delete:', user);
      toast.error('Cannot delete user: Invalid user data');
    }
  }, []);

  // Permission checks
  const canViewRoles = hasPermission('dashboard:access') || hasPermission('roles:view') || userRole === 'superadmin';
  const canCreateRoles = hasPermission('system:full_access') || hasPermission('roles:create');
  const canEditRoles = hasPermission('system:full_access') || hasPermission('roles:edit');
  const canDeleteRoles = hasPermission('system:full_access') || hasPermission('roles:delete');
  
  // User permissions
  const canViewUsers = hasPermission('dashboard:access') || hasPermission('users:read') || userRole === 'superadmin';
  const canCreateUsers = hasPermission('system:full_access') || hasPermission('users:write');
  const canEditUsers = hasPermission('system:full_access') || hasPermission('users:write');
  const canDeleteUsers = hasPermission('system:full_access') || hasPermission('users:delete');

  // Create columns for roles table
  const rolesColumns = useMemo(() => createRolesColumns(
    canEditRoles,
    canDeleteRoles,
    handleViewRole,
    handleEditRole,
    handleDeleteRoleClick,
    handleCopyRoleClick,
    handleAssignUsersClick
  ), [canEditRoles, canDeleteRoles, handleViewRole, handleEditRole, handleDeleteRoleClick, handleCopyRoleClick, handleAssignUsersClick]);

  // Create columns for users table
  const usersColumns = useMemo(() => createUsersColumns(
    canEditUsers,
    canDeleteUsers,
    handleViewUser,
    handleEditUser,
    handleDeleteUserClick
  ), [canEditUsers, canDeleteUsers, handleViewUser, handleEditUser, handleDeleteUserClick]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Loading Dashboard</h3>
          <p className="text-gray-600 dark:text-gray-400">Checking permissions and initializing...</p>
        </div>
      </div>
    );
  }

  if (!isLoading && userRole && !canViewRoles) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Access Denied</h3>
          <p className="text-gray-600 dark:text-gray-400">You do not have permission to view roles.</p>
        </div>
      </div>
    );
  }

  return (
    <div className=" space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Role Management</h1>
          <div className="flex items-center gap-4">
            <p className="text-gray-600 dark:text-gray-400">Manage user roles and permissions</p>
            
            {/* Connection Status Indicator */}
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${
                isOnline && isApiReachable 
                  ? 'bg-green-500' 
                  : !isOnline 
                    ? 'bg-red-500' 
                    : 'bg-yellow-500'
              }`} />
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {isOnline && isApiReachable 
                  ? 'Connected' 
                  : !isOnline 
                    ? 'Offline' 
                    : 'API Unreachable'
                }
              </span>
            </div>
            
            {/* Data Freshness Indicator */}
            {(dataLastUpdated || lastUpdated) && (
              <div className="text-xs text-gray-400 dark:text-gray-500">
                Last updated: {(dataLastUpdated || lastUpdated)?.toLocaleTimeString()}
              </div>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 p-1 bg-gray-100 dark:bg-gray-800 rounded-lg">
            <Button
              variant={viewMode === 'users' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('users')}
              className="flex items-center gap-2"
            >
              <Users className="h-4 w-4" />
              Users
            </Button>
            <Button
              variant={viewMode === 'roles' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('roles')}
              className="flex items-center gap-2"
            >
              <Shield className="h-4 w-4" />
              Roles
            </Button>
          </div>
          <Button 
            variant="outline" 
            size="sm"
            onClick={handleRefreshData}
            disabled={rolesLoading || usersLoading}
            className="flex items-center gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${(rolesLoading || usersLoading) ? 'animate-spin' : ''}`} />
            {(rolesLoading || usersLoading) ? 'Refreshing...' : `Refresh ${viewMode === 'users' ? 'Users' : 'Roles'}`}
          </Button>
          {canCreateRoles && viewMode === 'roles' && (
            <Button onClick={() => setCreateModalOpen(true)} className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Create Role
            </Button>
          )}
          {canCreateUsers && viewMode === 'users' && (
            <Button onClick={() => setCreateUserModalOpen(true)} className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Create User
            </Button>
          )}
        </div>
      </div>

      {/* Status and Error Indicators */}
      {(!isOnline || !isApiReachable) && (
        <Card className="border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-900/20">
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-yellow-500" />
              <div>
                <p className="text-sm font-medium text-yellow-700 dark:text-yellow-300">
                  {!isOnline ? 'No Internet Connection' : 'API Server Unreachable'}
                </p>
                <p className="text-xs text-yellow-600 dark:text-yellow-400">
                  {!isOnline 
                    ? 'Check your network connection and try again' 
                    : 'Unable to connect to the backend server. Some features may not work.'
                  }
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefreshData}
                className="ml-auto"
              >
                Retry
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {rolesError && viewMode === 'roles' && (
        <Card className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20">
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-red-500" />
              <div>
                <p className="text-sm font-medium text-red-700 dark:text-red-300">
                  Failed to load roles
                </p>
                <p className="text-xs text-red-600 dark:text-red-400">
                  {rolesError.message}
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefreshRoles}
                className="ml-auto"
              >
                Retry
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {usersError && viewMode === 'users' && (
        <Card className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20">
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-red-500" />
              <div>
                <p className="text-sm font-medium text-red-700 dark:text-red-300">
                  Failed to load users
                </p>
                <p className="text-xs text-red-600 dark:text-red-400">
                  {usersError.message}
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefreshUsers}
                className="ml-auto"
              >
                Retry
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Content based on view mode */}
      {viewMode === 'users' ? (
        /* Users Table */
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Users with Roles ({users.length})
                </CardTitle>
                <CardDescription>
                  View users and their assigned roles
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <Button 
                  onClick={handleRefreshUsers}
                  disabled={usersLoading}
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2"
                >
                  <RefreshCw className={`h-4 w-4 ${usersLoading ? 'animate-spin' : ''}`} />
                  {usersLoading ? 'Refreshing...' : usersFetched ? 'Refresh Users' : 'Load Users'}
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {usersError ? (
              <div className="text-center py-8">
                <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Failed to load users</h3>
                <p className="text-gray-500 dark:text-gray-400 mb-4">{usersError.message}</p>
                <Button 
                  onClick={handleRefreshUsers} 
                  variant="outline"
                >
                  Retry
                </Button>
              </div>
            ) : !usersFetched && !usersLoading ? (
              <div className="text-center py-12">
                <div className="mb-6">
                  <Users className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                    Users Not Loaded
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto">
                    Click "Load Users" to fetch user data and manage user accounts and their role assignments.
                  </p>
                </div>
                <div className="flex items-center justify-center gap-3">
                  <Button 
                    onClick={handleRefreshUsers} 
                    variant="outline"
                    className="flex items-center gap-2"
                  >
                    <Users className="h-4 w-4" />
                    Load Users
                  </Button>
                  {canCreateUsers && (
                    <Button onClick={() => setCreateUserModalOpen(true)} className="flex items-center gap-2">
                      <Plus className="h-4 w-4" />
                      Create User
                    </Button>
                  )}
                </div>
              </div>
            ) : usersLoading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Loading Users</h3>
                <p className="text-gray-600 dark:text-gray-400">Fetching user data...</p>
              </div>
            ) : users.length === 0 ? (
              <div className="text-center py-12">
                <div className="mb-6">
                  <Users className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                    No Users Found
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto">
                    No users are currently registered in the system. Create the first user to get started.
                  </p>
                </div>
                <div className="flex items-center justify-center gap-3">
                  <Button 
                    onClick={handleRefreshUsers} 
                    variant="outline"
                    disabled={usersLoading}
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Load Users
                  </Button>
                  {canCreateUsers && (
                    <Button 
                      onClick={() => setCreateUserModalOpen(true)}
                      variant="default"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Create First User
                    </Button>
                  )}
                </div>
              </div>
            ) : (
              <>
                {usersLoading && users.length === 0 ? (
                  <div className="space-y-4">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className="flex items-center space-x-4 p-4 border rounded-lg">
                        <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse" />
                        <div className="flex-1 space-y-2">
                          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                          <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-2/3 animate-pulse" />
                        </div>
                        <div className="w-20 h-8 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                      </div>
                    ))}
                  </div>
                ) : (
                  <DataTable
                    columns={usersColumns as any}
                    data={users}
                    searchKey="firstName"
                    searchPlaceholder="Search users..."
                    isLoading={usersLoading}
                    onRowSelect={setSelectedRows as (rows: User[]) => void}
                  />
                )}
              </>
            )}
          </CardContent>
        </Card>
      ) : (
        /* Roles Table */
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Roles ({roles.length})
                </CardTitle>
                <CardDescription>
                  Manage system roles and their permissions
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <Button 
                  onClick={handleRefreshRoles}
                  disabled={rolesLoading}
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2"
                >
                  <RefreshCw className={`h-4 w-4 ${rolesLoading ? 'animate-spin' : ''}`} />
                  {rolesLoading ? 'Refreshing...' : roles.length > 0 ? 'Refresh Roles' : 'Load Roles'}
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {(rolesLoading || initialLoad) ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-3"></div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Loading roles...</p>
              </div>
            ) : rolesError ? (
              <div className="text-center py-8">
                <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Failed to load roles</h3>
                <p className="text-gray-500 dark:text-gray-400 mb-4">{rolesError.message}</p>
                <Button 
                  onClick={handleRefreshRoles} 
                  variant="outline"
                >
                  Retry
                </Button>
              </div>
            ) : roles.length === 0 && !rolesLoading && !initialLoad ? (
              <div className="text-center py-12">
                <div className="mb-6">
                  <Shield className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                    No Roles Available
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto">
                    {rolesError 
                      ? 'Unable to load roles. Please check your connection and try again.' 
                      : 'No roles are currently configured in the system. Create your first role to get started with user permission management.'
                    }
                  </p>
                </div>
                <div className="flex items-center justify-center gap-3">
                  {rolesError && (
                    <Button 
                      onClick={handleRefreshRoles} 
                      variant="outline"
                      disabled={rolesLoading}
                    >
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Retry Loading
                    </Button>
                  )}
                  {canCreateRoles && (
                    <Button 
                      onClick={() => setCreateModalOpen(true)}
                      variant="default"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Create First Role
                    </Button>
                  )}
                </div>
              </div>
            ) : (
              <DataTable
                columns={rolesColumns}
                data={roles}
                searchKey="displayName"
                searchPlaceholder="Search roles..."
                isLoading={rolesLoading}
                onRowSelect={setSelectedRows as (rows: Role[]) => void}
              />
            )}
          </CardContent>
        </Card>
      )}

      {/* Create Role Modal */}
      <Dialog open={createModalOpen} onOpenChange={(open) => {
        setCreateModalOpen(open);
        if (!open) resetForm();
      }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5" />
              Create New Role
            </DialogTitle>
            <DialogDescription>
              Create a new role with specific permissions and access levels.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="role-name">Role Name (Internal)</Label>
                <Input
                  id="role-name"
                  placeholder="Enter role name (e.g., custom_role)..."
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="role-display-name">Display Name</Label>
                <Input
                  id="role-display-name"
                  placeholder="Enter display name (e.g., Custom Role)..."
                  value={formData.displayName}
                  onChange={(e) => setFormData(prev => ({ ...prev, displayName: e.target.value }))}
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="role-level">Role Level</Label>
                <Select 
                  value={formData.level.toString()} 
                  onValueChange={(value) => setFormData(prev => ({ ...prev, level: parseInt(value) }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select level" />
                  </SelectTrigger>
                  <SelectContent>
                    {ROLE_LEVELS.map((level) => (
                      <SelectItem key={level.value} value={level.value.toString()}>
                        <div className="flex items-center gap-2">
                          <level.icon className="h-4 w-4" />
                          {level.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="role-color">Role Color</Label>
                <Input
                  id="role-color"
                  type="color"
                  value={formData.color}
                  onChange={(e) => setFormData(prev => ({ ...prev, color: e.target.value }))}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="role-description">Description</Label>
              <Textarea
                id="role-description"
                placeholder="Enter role description..."
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="role-email">Email</Label>
              <Input
                id="role-email"
                type="email"
                placeholder="Enter email address..."
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              />
            </div>

            <div>
              <Label htmlFor="role-password">Password</Label>
              <Input
                id="role-password"
                type="password"
                placeholder="Enter password..."
                value={formData.password}
                onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
              />
            </div>

            <div>
              <Label>Permissions</Label>
              <div className="grid grid-cols-2 gap-2 mt-2 max-h-60 overflow-y-auto p-4 border rounded-lg">
                {ALL_PERMISSIONS.map((permission) => (
                  <div key={permission} className="flex items-center space-x-2">
                    <Checkbox
                      id={permission}
                      checked={formData.permissions.includes(permission)}
                      onCheckedChange={() => togglePermission(permission)}
                    />
                    <Label htmlFor={permission} className="text-sm font-normal">
                      {permission}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="is-active"
                checked={formData.isActive}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isActive: checked === true }))}
              />
              <Label htmlFor="is-active">Active Role</Label>
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => {
              setCreateModalOpen(false);
              resetForm();
            }}>
              Cancel
            </Button>
            <Button 
              onClick={handleCreateRole} 
              disabled={
                !formData.name.trim() || 
                !formData.displayName.trim() ||
                isCreatingRole
              }
              className="min-w-[120px]"
            >
              {isCreatingRole ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Creating...
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Role
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Role Modal */}
      <Dialog open={editModalOpen} onOpenChange={(open) => {
        setEditModalOpen(open);
        if (!open) resetForm();
      }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Edit className="h-5 w-5" />
              Edit Role: {selectedRole?.name}
            </DialogTitle>
            <DialogDescription>
              Update role permissions and settings.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-role-name">Role Name (Read-only)</Label>
                <Input
                  id="edit-role-name"
                  value={formData.name}
                  disabled
                  className="opacity-50"
                />
              </div>
              <div>
                <Label htmlFor="edit-role-display-name">Display Name</Label>
                <Input
                  id="edit-role-display-name"
                  placeholder="Enter display name..."
                  value={formData.displayName}
                  onChange={(e) => setFormData(prev => ({ ...prev, displayName: e.target.value }))}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-role-level">Role Level (Read-only)</Label>
                <Select 
                  value={formData.level.toString()} 
                  disabled
                >
                  <SelectTrigger className="opacity-50">
                    <SelectValue placeholder="Select level" />
                  </SelectTrigger>
                  <SelectContent>
                    {ROLE_LEVELS.map((level) => (
                      <SelectItem key={level.value} value={level.value.toString()}>
                        <div className="flex items-center gap-2">
                          <level.icon className="h-4 w-4" />
                          {level.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="edit-role-color">Role Color</Label>
                <Input
                  id="edit-role-color"
                  type="color"
                  value={formData.color}
                  onChange={(e) => setFormData(prev => ({ ...prev, color: e.target.value }))}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="edit-role-description">Description</Label>
              <Textarea
                id="edit-role-description"
                placeholder="Enter role description..."
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="edit-role-email">Email</Label>
              <Input
                id="edit-role-email"
                type="email"
                placeholder="Enter email address..."
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              />
            </div>

            <div>
              <Label htmlFor="edit-role-password">Password</Label>
              <Input
                id="edit-role-password"
                type="password"
                placeholder="Enter password..."
                value={formData.password}
                onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
              />
            </div>

            <div>
              <Label>Permissions</Label>
              <div className="grid grid-cols-2 gap-2 mt-2 max-h-60 overflow-y-auto p-4 border rounded-lg">
                {ALL_PERMISSIONS.map((permission) => (
                  <div key={permission} className="flex items-center space-x-2">
                    <Checkbox
                      id={`edit-${permission}`}
                      checked={formData.permissions.includes(permission)}
                      onCheckedChange={() => togglePermission(permission)}
                    />
                    <Label htmlFor={`edit-${permission}`} className="text-sm font-normal">
                      {permission}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="edit-is-active"
                checked={formData.isActive}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isActive: checked === true }))}
              />
              <Label htmlFor="edit-is-active">Active Role</Label>
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => {
              setEditModalOpen(false);
              resetForm();
            }}>
              Cancel
            </Button>
            <Button 
              onClick={handleUpdateRole} 
              disabled={
                !formData.displayName.trim() ||
                isUpdatingRole
              }
              className="min-w-[120px]"
            >
              {isUpdatingRole ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Updating...
                </>
              ) : (
                <>
                  <Edit className="h-4 w-4 mr-2" />
                  Update Role
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Role Modal */}
      <Dialog open={viewModalOpen} onOpenChange={setViewModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              Role Details: {selectedRole?.displayName}
            </DialogTitle>
          </DialogHeader>
          
          {selectedRole && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Display Name</Label>
                  <div className="p-2 bg-gray-50 dark:bg-gray-800 rounded border">
                    {selectedRole.displayName}
                  </div>
                </div>
                <div>
                  <Label>Internal Name</Label>
                  <div className="p-2 bg-gray-50 dark:bg-gray-800 rounded border text-sm text-gray-600">
                    {selectedRole.name}
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Role Level</Label>
                  <div className="p-2 bg-gray-50 dark:bg-gray-800 rounded border">
                    <Badge variant="secondary" className="flex items-center gap-1 w-fit">
                      {getRoleIcon(selectedRole.level)}
                      {getRoleLabel(selectedRole.level)}
                    </Badge>
                  </div>
                </div>
                <div>
                  <Label>Color</Label>
                  <div className="p-2 bg-gray-50 dark:bg-gray-800 rounded border">
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-4 h-4 rounded border" 
                        style={{ backgroundColor: selectedRole.color }}
                      />
                      <span className="text-sm">{selectedRole.color}</span>
                    </div>
                  </div>
                </div>
              </div>

              {selectedRole.description && (
                <div>
                  <Label>Description</Label>
                  <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded border">
                    {selectedRole.description}
                  </div>
                </div>
              )}

              <div>
                <Label>Permissions ({selectedRole.permissions.length})</Label>
                <div className="grid grid-cols-2 gap-2 mt-2 max-h-60 overflow-y-auto p-4 bg-gray-50 dark:bg-gray-800 rounded border">
                  {selectedRole.permissions.map((permission) => (
                    <div key={permission} className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="text-sm">{permission}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 pt-4 border-t">
                <div>
                  <Label>Status</Label>
                  <div className="mt-1">
                    <Badge variant={selectedRole.isActive ? "default" : "secondary"}>
                      {selectedRole.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                </div>
                <div>
                  <Label>Users</Label>
                  <div className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                    {selectedRole.userCount || 0} assigned
                  </div>
                </div>
                <div>
                  <Label>Created</Label>
                  <div className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                    {new Date(selectedRole.createdAt).toISOString().split('T')[0]}
                  </div>
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setViewModalOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Role Modal */}
      <Dialog open={deleteModalOpen} onOpenChange={setDeleteModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600 dark:text-red-400">
              <AlertCircle className="h-5 w-5" />
              Delete Role
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to delete the role "{selectedRole?.displayName}" ({selectedRole?.name})? This action cannot be undone.
              
              {/* Show warning if role has users */}
              {selectedRole?.userCount && selectedRole.userCount > 0 && (
                <div className="mt-2 p-2 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded">
                  <strong>Warning:</strong> This role is assigned to {selectedRole.userCount} user(s). 
                  You cannot delete a role that has users assigned to it.
                </div>
              )}

              {/* Show warning for protected roles */}
              {selectedRole && ['superadmin', 'admin', 'user'].includes(selectedRole.name) && (
                <div className="mt-2 p-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded">
                  <strong>Error:</strong> This is a core system role and cannot be deleted.
                </div>
              )}
            </DialogDescription>
          </DialogHeader>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteModalOpen(false)}>
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleDeleteRole}
              disabled={
                Boolean(selectedRole?.userCount && selectedRole.userCount > 0) ||
                Boolean(selectedRole && ['superadmin', 'admin', 'user'].includes(selectedRole.name)) ||
                isDeletingRole
              }
              className="min-w-[120px]"
            >
              {isDeletingRole ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Deleting...
                </>
              ) : (selectedRole?.userCount && selectedRole.userCount > 0) ||
                   (selectedRole && ['superadmin', 'admin', 'user'].includes(selectedRole.name)) ? (
                'Cannot Delete'
              ) : (
                <>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Role
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create User Modal */}
      <Dialog open={createUserModalOpen} onOpenChange={(open) => {
        setCreateUserModalOpen(open);
        if (!open) resetUserForm();
      }}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5" />
              Create New User
            </DialogTitle>
            <DialogDescription>
              Add a new user to the system with basic information and role assignment.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6">
            {/* Personal Information */}
            <div className="space-y-4">
              <div className="pb-2 border-b">
                <h4 className="font-medium text-gray-900 dark:text-white">Personal Information</h4>
                <p className="text-sm text-gray-500 dark:text-gray-400">Basic user details and contact information</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="user-firstName">First Name *</Label>
                  <Input
                    id="user-firstName"
                    placeholder="Enter first name..."
                    value={userFormData.firstName}
                    onChange={(e) => setUserFormData(prev => ({ ...prev, firstName: e.target.value }))}
                    className={!userFormData.firstName.trim() ? 'border-red-300 focus:border-red-500' : ''}
                  />
                  {!userFormData.firstName.trim() && (
                    <p className="text-xs text-red-500 mt-1">First name is required</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="user-lastName">Last Name *</Label>
                  <Input
                    id="user-lastName"
                    placeholder="Enter last name..."
                    value={userFormData.lastName}
                    onChange={(e) => setUserFormData(prev => ({ ...prev, lastName: e.target.value }))}
                    className={!userFormData.lastName.trim() ? 'border-red-300 focus:border-red-500' : ''}
                  />
                  {!userFormData.lastName.trim() && (
                    <p className="text-xs text-red-500 mt-1">Last name is required</p>
                  )}
                </div>
              </div>
              
              <div>
                <Label htmlFor="user-email">Email Address *</Label>
                <Input
                  id="user-email"
                  type="email"
                  placeholder="Enter email address..."
                  value={userFormData.email}
                  onChange={(e) => setUserFormData(prev => ({ ...prev, email: e.target.value }))}
                  className={!userFormData.email.trim() || !/\S+@\S+\.\S+/.test(userFormData.email) ? 'border-red-300 focus:border-red-500' : ''}
                />
                {!userFormData.email.trim() && (
                  <p className="text-xs text-red-500 mt-1">Email is required</p>
                )}
                {userFormData.email.trim() && !/\S+@\S+\.\S+/.test(userFormData.email) && (
                  <p className="text-xs text-red-500 mt-1">Please enter a valid email address</p>
                )}
              </div>
              
              <div>
                <Label htmlFor="user-phone">Phone Number</Label>
                <Input
                  id="user-phone"
                  type="tel"
                  placeholder="Enter phone number..."
                  value={userFormData.phone}
                  onChange={(e) => setUserFormData(prev => ({ ...prev, phone: e.target.value }))}
                />
              </div>
            </div>

            {/* Account Security */}
            <div className="space-y-4">
              <div className="pb-2 border-b">
                <h4 className="font-medium text-gray-900 dark:text-white">Account Security</h4>
                <p className="text-sm text-gray-500 dark:text-gray-400">Set up login credentials for the user</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="user-password">Password *</Label>
                  <Input
                    id="user-password"
                    type="password"
                    placeholder="Enter password..."
                    value={userFormData.password}
                    onChange={(e) => setUserFormData(prev => ({ ...prev, password: e.target.value }))}
                    className={userFormData.password.length > 0 && userFormData.password.length < 6 ? 'border-red-300 focus:border-red-500' : ''}
                  />
                  {userFormData.password.length > 0 && userFormData.password.length < 6 && (
                    <p className="text-xs text-red-500 mt-1">Password must be at least 6 characters</p>
                  )}
                  {!userFormData.password.trim() && (
                    <p className="text-xs text-red-500 mt-1">Password is required</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="user-confirmPassword">Confirm Password *</Label>
                  <Input
                    id="user-confirmPassword"
                    type="password"
                    placeholder="Confirm password..."
                    value={userFormData.confirmPassword}
                    onChange={(e) => setUserFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                    className={userFormData.confirmPassword && userFormData.password !== userFormData.confirmPassword ? 'border-red-300 focus:border-red-500' : ''}
                  />
                  {userFormData.confirmPassword && userFormData.password !== userFormData.confirmPassword && (
                    <p className="text-xs text-red-500 mt-1">Passwords do not match</p>
                  )}
                </div>
              </div>
            </div>

            {/* Account Status */}
            <div className="space-y-4">
              <div className="pb-2 border-b">
                <h4 className="font-medium text-gray-900 dark:text-white">Account Status</h4>
                <p className="text-sm text-gray-500 dark:text-gray-400">Configure account access and verification</p>
              </div>
              
              <div className="grid grid-cols-2 gap-6">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="user-isActive"
                    checked={userFormData.isActive}
                    onCheckedChange={(checked) => setUserFormData(prev => ({ ...prev, isActive: checked === true }))}
                  />
                  <div>
                    <Label htmlFor="user-isActive" className="font-medium">Account Active</Label>
                    <p className="text-xs text-gray-500 dark:text-gray-400">User can log in and access the system</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="user-isEmailVerified"
                    checked={userFormData.isEmailVerified}
                    onCheckedChange={(checked) => setUserFormData(prev => ({ ...prev, isEmailVerified: checked === true }))}
                  />
                  <div>
                    <Label htmlFor="user-isEmailVerified" className="font-medium">Email Verified</Label>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Mark email as verified</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Summary Preview */}
            {(userFormData.firstName.trim() || userFormData.lastName.trim() || userFormData.email.trim()) && (
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                <h4 className="font-medium text-blue-900 dark:text-blue-200 mb-2">Preview</h4>
                <div className="text-sm text-blue-800 dark:text-blue-300">
                  <p><span className="font-medium">Name:</span> {userFormData.firstName} {userFormData.lastName}</p>
                  <p><span className="font-medium">Email:</span> {userFormData.email}</p>
                  <p><span className="font-medium">Status:</span> {userFormData.isActive ? 'Active' : 'Inactive'} • {userFormData.isEmailVerified ? 'Verified' : 'Unverified'}</p>
                </div>
              </div>
            )}
          </div>

          <DialogFooter className="gap-2">
            <Button 
              variant="outline" 
              onClick={() => {
                setCreateUserModalOpen(false);
                resetUserForm();
              }}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleCreateUser} 
              disabled={
                !userFormData.firstName.trim() || 
                !userFormData.lastName.trim() || 
                !userFormData.email.trim() || 
                !/\S+@\S+\.\S+/.test(userFormData.email) ||
                !userFormData.password.trim() ||
                userFormData.password.length < 6 ||
                userFormData.password !== userFormData.confirmPassword ||
                isCreatingUser
              }
              className="min-w-[120px]"
            >
              {isCreatingUser ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Creating...
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4 mr-2" />
                  Create User
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit User Modal */}
      <Dialog open={editUserModalOpen} onOpenChange={(open) => {
        setEditUserModalOpen(open);
        if (!open) resetUserForm();
      }}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Edit className="h-5 w-5" />
              Edit User: {selectedUser?.firstName} {selectedUser?.lastName}
            </DialogTitle>
            <DialogDescription>
              Update user information and account settings.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6">
            {/* Personal Information */}
            <div className="space-y-4">
              <div className="pb-2 border-b">
                <h4 className="font-medium text-gray-900 dark:text-white">Personal Information</h4>
                <p className="text-sm text-gray-500 dark:text-gray-400">Update user details and contact information</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-user-firstName">First Name *</Label>
                  <Input
                    id="edit-user-firstName"
                    placeholder="Enter first name..."
                    value={userFormData.firstName}
                    onChange={(e) => setUserFormData(prev => ({ ...prev, firstName: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="edit-user-lastName">Last Name *</Label>
                  <Input
                    id="edit-user-lastName"
                    placeholder="Enter last name..."
                    value={userFormData.lastName}
                    onChange={(e) => setUserFormData(prev => ({ ...prev, lastName: e.target.value }))}
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="edit-user-email">Email Address (Read-only)</Label>
                <Input
                  id="edit-user-email"
                  type="email"
                  value={userFormData.email}
                  disabled
                  className="opacity-50"
                />
                <p className="text-xs text-gray-500 mt-1">Email cannot be changed after account creation</p>
              </div>
              
              <div>
                <Label htmlFor="edit-user-phone">Phone Number</Label>
                <Input
                  id="edit-user-phone"
                  type="tel"
                  placeholder="Enter phone number..."
                  value={userFormData.phone}
                  onChange={(e) => setUserFormData(prev => ({ ...prev, phone: e.target.value }))}
                />
              </div>
              
              <div>
                <Label htmlFor="edit-user-discord">Discord Username</Label>
                <Input
                  id="edit-user-discord"
                  placeholder="Enter Discord username..."
                  value={userFormData.discordUsername}
                  onChange={(e) => setUserFormData(prev => ({ ...prev, discordUsername: e.target.value }))}
                />
              </div>
            </div>

            {/* Account Status */}
            <div className="space-y-4">
              <div className="pb-2 border-b">
                <h4 className="font-medium text-gray-900 dark:text-white">Account Status</h4>
                <p className="text-sm text-gray-500 dark:text-gray-400">Configure account access and verification</p>
              </div>
              
              <div className="grid grid-cols-2 gap-6">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="edit-user-isActive"
                    checked={userFormData.isActive}
                    onCheckedChange={(checked) => setUserFormData(prev => ({ ...prev, isActive: checked === true }))}
                  />
                  <div>
                    <Label htmlFor="edit-user-isActive" className="font-medium">Account Active</Label>
                    <p className="text-xs text-gray-500 dark:text-gray-400">User can log in and access the system</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="edit-user-isEmailVerified"
                    checked={userFormData.isEmailVerified}
                    onCheckedChange={(checked) => setUserFormData(prev => ({ ...prev, isEmailVerified: checked === true }))}
                  />
                  <div>
                    <Label htmlFor="edit-user-isEmailVerified" className="font-medium">Email Verified</Label>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Mark email as verified</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button 
              variant="outline" 
              onClick={() => {
                setEditUserModalOpen(false);
                resetUserForm();
              }}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleUpdateUser} 
              disabled={
                !userFormData.firstName.trim() || 
                !userFormData.lastName.trim() ||
                isUpdatingUser
              }
              className="min-w-[120px]"
            >
              {isUpdatingUser ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Updating...
                </>
              ) : (
                <>
                  <Edit className="h-4 w-4 mr-2" />
                  Update User
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View User Modal */}
      <Dialog open={viewUserModalOpen} onOpenChange={setViewUserModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              User Details: {selectedUser?.firstName} {selectedUser?.lastName}
            </DialogTitle>
          </DialogHeader>
          
          {selectedUser && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Full Name</Label>
                  <div className="p-2 bg-gray-50 dark:bg-gray-800 rounded border">
                    {selectedUser.firstName} {selectedUser.lastName}
                  </div>
                </div>
                <div>
                  <Label>Email Address</Label>
                  <div className="p-2 bg-gray-50 dark:bg-gray-800 rounded border">
                    {selectedUser.email}
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Phone Number</Label>
                  <div className="p-2 bg-gray-50 dark:bg-gray-800 rounded border">
                    {selectedUser.phone || 'Not provided'}
                  </div>
                </div>
                <div>
                  <Label>Role</Label>
                  <div className="p-2 bg-gray-50 dark:bg-gray-800 rounded border">
                    <Badge variant="outline">{selectedUser.role || 'user'}</Badge>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 pt-4 border-t">
                <div>
                  <Label>Account Status</Label>
                  <div className="mt-1">
                    <Badge variant={selectedUser.isActive !== false ? "default" : "destructive"}>
                      {selectedUser.isActive !== false ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                </div>
                <div>
                  <Label>Email Status</Label>
                  <div className="mt-1">
                    <Badge variant={selectedUser.isEmailVerified ? "default" : "secondary"}>
                      {selectedUser.isEmailVerified ? 'Verified' : 'Unverified'}
                    </Badge>
                  </div>
                </div>
                <div>
                  <Label>Member Since</Label>
                  <div className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                    {new Date(selectedUser.createdAt).toLocaleDateString()}
                  </div>
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setViewUserModalOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete User Modal */}
      <Dialog open={deleteUserModalOpen} onOpenChange={setDeleteUserModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600 dark:text-red-400">
              <AlertCircle className="h-5 w-5" />
              Delete User
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to delete the user "{selectedUser?.firstName} {selectedUser?.lastName}" ({selectedUser?.email})? 
              This action cannot be undone and will permanently remove all user data.
            </DialogDescription>
          </DialogHeader>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteUserModalOpen(false)}>
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleDeleteUser}
              disabled={isDeletingUser}
              className="min-w-[120px]"
            >
              {isDeletingUser ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete User
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Assign Users Modal */}
      <Dialog open={assignModalOpen} onOpenChange={setAssignModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UserCheck className="h-5 w-5" />
              Assign Users: {selectedRole?.name}
            </DialogTitle>
            <DialogDescription>
              Select users to assign to this role.
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              User assignment functionality will be implemented here.
            </p>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setAssignModalOpen(false)}>
              Cancel
            </Button>
            <Button>
              Assign Users
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}