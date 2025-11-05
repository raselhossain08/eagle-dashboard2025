/**
 * Eagle Admin Users Data Table
 * Professional data table component for admin user management
 */

'use client';

import React, { useState, useCallback } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  MoreHorizontal,
  Edit,
  Trash2,
  UserX,
  UserCheck,
  Shield,
  Mail,
  Phone,
  Clock,
  Eye,
  Search,
  Filter,
  Download,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { AdminUser, AdminUserFilters } from '@/lib/services/admin/admin-users.service';
import { usePermissions } from '@/lib/hooks/use-permissions';
import { cn } from '@/lib/utils';

interface AdminUsersTableProps {
  users: AdminUser[];
  totalUsers: number;
  currentPage: number;
  pageSize: number;
  filters: AdminUserFilters;
  loading: boolean;
  onPageChange: (page: number) => void;
  onFiltersChange: (filters: AdminUserFilters) => void;
  onUserEdit: (user: AdminUser) => void;
  onUserDelete: (userId: string) => void;
  onUserToggleStatus: (userId: string) => void;
  onUsersExport: () => void;
  onRefresh: () => void;
}

export function AdminUsersTable({
  users = [],
  totalUsers = 0,
  currentPage = 1,
  pageSize = 10,
  filters = {},
  loading = false,
  onPageChange,
  onFiltersChange,
  onUserEdit,
  onUserDelete,
  onUserToggleStatus,
  onUsersExport,
  onRefresh,
}: AdminUsersTableProps) {
  const { hasPermission, canManageRole } = usePermissions();
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<string | null>(null);

  // Calculated values
  const totalPages = Math.ceil(totalUsers / pageSize);
  const startItem = (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalUsers);
  const hasNextPage = currentPage < totalPages;
  const hasPrevPage = currentPage > 1;

  // Handlers
  const handleSelectUser = useCallback((userId: string, checked: boolean) => {
    setSelectedUsers(prev => 
      checked 
        ? [...prev, userId]
        : prev.filter(id => id !== userId)
    );
  }, []);

  const handleSelectAll = useCallback((checked: boolean) => {
    setSelectedUsers(checked ? (users || []).map(user => user.id) : []);
  }, [users]);

  const handleDeleteClick = useCallback((userId: string) => {
    setUserToDelete(userId);
    setDeleteDialogOpen(true);
  }, []);

  const handleDeleteConfirm = useCallback(() => {
    if (userToDelete) {
      onUserDelete(userToDelete);
      setUserToDelete(null);
    }
    setDeleteDialogOpen(false);
  }, [userToDelete, onUserDelete]);

  const getRoleBadgeVariant = (adminLevel: string) => {
    switch (adminLevel) {
      case 'super_admin':
        return 'destructive';
      case 'finance_admin':
        return 'default';
      case 'growth_marketing':
        return 'secondary';
      case 'support':
        return 'outline';
      case 'read_only':
        return 'secondary';
      default:
        return 'secondary';
    }
  };

  const getStatusBadgeVariant = (isActive: boolean) => {
    return isActive ? 'default' : 'secondary';
  };

  const getUserInitials = (firstName: string, lastName: string) => {
    return `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase();
  };

  return (
    <div className="space-y-4">
      {/* Filters and Actions */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-1 flex-col gap-2 md:flex-row md:items-center md:gap-4">
          {/* Search */}
          <div className="relative flex-1 md:max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search users..."
              value={filters.search || ''}
              onChange={(e) => onFiltersChange({ ...filters, search: e.target.value })}
              className="pl-10"
            />
          </div>

          {/* Role Filter */}
          <Select
            value={filters.role || 'all'}
            onValueChange={(value) => 
              onFiltersChange({ 
                ...filters, 
                role: value === 'all' ? undefined : value as 'admin' | 'user' | 'moderator' | 'subscriber'
              })
            }
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Roles</SelectItem>
              <SelectItem value="super_admin">Super Admin</SelectItem>
              <SelectItem value="finance_admin">Finance Admin</SelectItem>
              <SelectItem value="growth_marketing">Growth Marketing</SelectItem>
              <SelectItem value="support">Support</SelectItem>
              <SelectItem value="read_only">Read Only</SelectItem>
            </SelectContent>
          </Select>

          {/* Status Filter */}
          <Select
            value={filters.status || 'all'}
            onValueChange={(value) => 
              onFiltersChange({ 
                ...filters, 
                status: value === 'all' ? undefined : value as 'active' | 'inactive' | 'suspended' | 'pending'
              })
            }
          >
            <SelectTrigger className="w-40">
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
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onRefresh}
            disabled={loading}
            className="gap-2"
          >
            <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
            Refresh
          </Button>
          
          {hasPermission('admin.users.export') && (
            <Button
              variant="outline"
              size="sm"
              onClick={onUsersExport}
              className="gap-2"
            >
              <Download className="h-4 w-4" />
              Export
            </Button>
          )}
        </div>
      </div>

      {/* Selected Items Actions */}
      {selectedUsers.length > 0 && (
        <div className="flex items-center gap-2 rounded-lg bg-muted p-3">
          <span className="text-sm font-medium">
            {selectedUsers.length} user(s) selected
          </span>
          <div className="flex gap-2">
            <Button size="sm" variant="outline">
              Bulk Edit
            </Button>
            <Button size="sm" variant="outline">
              Bulk Deactivate
            </Button>
          </div>
        </div>
      )}

      {/* Data Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px]">
                <Checkbox
                  checked={selectedUsers.length === (users?.length ?? 0) && (users?.length ?? 0) > 0}
                  onCheckedChange={handleSelectAll}
                />
              </TableHead>
              <TableHead>User</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Department</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Last Login</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              // Loading skeleton rows
              Array.from({ length: pageSize }, (_, i) => (
                <TableRow key={i}>
                  <TableCell>
                    <div className="h-4 w-4 animate-pulse rounded bg-muted" />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 animate-pulse rounded-full bg-muted" />
                      <div className="space-y-2">
                        <div className="h-4 w-32 animate-pulse rounded bg-muted" />
                        <div className="h-3 w-24 animate-pulse rounded bg-muted" />
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="h-6 w-16 animate-pulse rounded bg-muted" />
                  </TableCell>
                  <TableCell>
                    <div className="h-4 w-20 animate-pulse rounded bg-muted" />
                  </TableCell>
                  <TableCell>
                    <div className="h-6 w-16 animate-pulse rounded bg-muted" />
                  </TableCell>
                  <TableCell>
                    <div className="h-4 w-16 animate-pulse rounded bg-muted" />
                  </TableCell>
                  <TableCell>
                    <div className="h-4 w-16 animate-pulse rounded bg-muted" />
                  </TableCell>
                  <TableCell>
                    <div className="h-8 w-8 animate-pulse rounded bg-muted" />
                  </TableCell>
                </TableRow>
              ))
            ) : (users?.length ?? 0) === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8">
                  <div className="flex flex-col items-center gap-2">
                    <Shield className="h-8 w-8 text-muted-foreground" />
                    <p className="text-muted-foreground">No admin users found</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              (users || []).map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <Checkbox
                      checked={selectedUsers.includes(user.id)}
                      onCheckedChange={(checked) => 
                        handleSelectUser(user.id, checked as boolean)
                      }
                    />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={user.profilePicture || user.avatarUrl} alt={user.username} />
                        <AvatarFallback className="text-xs">
                          {getUserInitials(user.firstName, user.lastName)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="space-y-1">
                        <p className="font-medium">{user.firstName} {user.lastName}</p>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Mail className="h-3 w-3" />
                          {user.email}
                        </div>
                        {user.phone && (
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Phone className="h-3 w-3" />
                            {user.phone}
                          </div>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={getRoleBadgeVariant(user.adminLevel)}>
                      {user.adminLevel.replace('_', ' ').toUpperCase()}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-muted-foreground">
                      {user.department || 'Not assigned'}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Badge variant={getStatusBadgeVariant(user.isActive)}>
                      {user.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      {user.lastLoginAt || user.lastLogin ? 
                        formatDistanceToNow(new Date(user.lastLoginAt || user.lastLogin || ''), { addSuffix: true }) :
                        'Never'
                      }
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-muted-foreground">
                      {formatDistanceToNow(new Date(user.createdAt), { addSuffix: true })}
                    </span>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => onUserEdit(user)}>
                          <Eye className="mr-2 h-4 w-4" />
                          View Details
                        </DropdownMenuItem>
                        
                        {(hasPermission('admin.users.edit') && canManageRole(user.adminLevel)) && (
                          <DropdownMenuItem onClick={() => onUserEdit(user)}>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit User
                          </DropdownMenuItem>
                        )}
                        
                        {(hasPermission('admin.users.manage') && canManageRole(user.adminLevel)) && (
                          <DropdownMenuItem onClick={() => onUserToggleStatus(user.id)}>
                            {user.isActive ? (
                              <>
                                <UserX className="mr-2 h-4 w-4" />
                                Deactivate
                              </>
                            ) : (
                              <>
                                <UserCheck className="mr-2 h-4 w-4" />
                                Activate
                              </>
                            )}
                          </DropdownMenuItem>
                        )}
                        
                        {(hasPermission('admin.users.delete') && canManageRole(user.adminLevel)) && (
                          <>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              onClick={() => handleDeleteClick(user.id)}
                              className="text-destructive"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete User
                            </DropdownMenuItem>
                          </>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Showing {startItem}-{endItem} of {totalUsers} users
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(currentPage - 1)}
              disabled={!hasPrevPage || loading}
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>
            
            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const page = i + 1;
                return (
                  <Button
                    key={page}
                    variant={currentPage === page ? "default" : "outline"}
                    size="sm"
                    onClick={() => onPageChange(page)}
                    disabled={loading}
                    className="w-8 h-8 p-0"
                  >
                    {page}
                  </Button>
                );
              })}
            </div>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(currentPage + 1)}
              disabled={!hasNextPage || loading}
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Admin User</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the admin user
              and remove their access to the system.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm}>
              Delete User
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}