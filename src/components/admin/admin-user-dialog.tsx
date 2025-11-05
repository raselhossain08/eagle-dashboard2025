/**
 * Eagle Admin User Form Dialog
 * Professional form dialog for creating and editing admin users
 */

'use client';

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import {
  User,
  Shield,
  Mail,
  Phone,
  Lock,
  Building2,
  Clock,
  Save,
  X,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';
import { toast } from 'sonner';
import { AdminUser, CreateAdminUserRequest, UpdateAdminUserRequest } from '@/lib/services/admin/admin-users.service';
import { usePermissions } from '@/lib/hooks/use-permissions';

// Validation Schema
const adminUserSchema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  username: z.string().min(3, 'Username must be at least 3 characters').regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters').optional(),
  role: z.string().min(1, 'Role is required'),
  department: z.string().optional(),
  phone: z.string().optional(),
  timezone: z.string().optional(),
  isActive: z.boolean(),
  customPermissions: z.array(z.string())
});

type AdminUserFormData = z.infer<typeof adminUserSchema>;

interface AdminUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user?: AdminUser | null;
  mode: 'create' | 'edit' | 'view';
  onSubmit: (data: CreateAdminUserRequest | UpdateAdminUserRequest) => Promise<void>;
  loading?: boolean;
}

// Available Roles
const AVAILABLE_ROLES = [
  { id: 'read_only', name: 'Read Only', description: 'View-only access to dashboard and reports' },
  { id: 'support', name: 'Support', description: 'Customer support and basic user management' },
  { id: 'finance_admin', name: 'Finance Admin', description: 'Billing, invoices, and financial management' },
  { id: 'growth_marketing', name: 'Growth Marketing', description: 'Marketing campaigns and analytics' },
  { id: 'admin', name: 'Admin', description: 'System administration and user management' },
  { id: 'superadmin', name: 'Super Admin', description: 'Full system access and control' }
];

// Available Departments
const AVAILABLE_DEPARTMENTS = [
  'Engineering',
  'Marketing',
  'Sales',
  'Support',
  'Finance',
  'Operations',
  'Security',
  'Legal'
];

// Available Permissions (these should come from API in real implementation)
const AVAILABLE_PERMISSIONS = [
  { id: 'users:read', name: 'View Users', category: 'User Management', description: 'View user information' },
  { id: 'users:write', name: 'Edit Users', category: 'User Management', description: 'Create and edit users' },
  { id: 'users:delete', name: 'Delete Users', category: 'User Management', description: 'Delete user accounts' },
  { id: 'billing:manage', name: 'Manage Billing', category: 'Financial', description: 'Manage billing and subscriptions' },
  { id: 'reports:read', name: 'View Reports', category: 'Analytics', description: 'Access reports and analytics' },
  { id: 'system:read', name: 'View System', category: 'System', description: 'View system information' },
  { id: 'security:manage', name: 'Manage Security', category: 'Security', description: 'Manage security settings' },
];

// Available Timezones
const AVAILABLE_TIMEZONES = [
  'UTC',
  'America/New_York',
  'America/Los_Angeles',
  'Europe/London',
  'Europe/Berlin',
  'Asia/Tokyo',
  'Asia/Shanghai',
  'Australia/Sydney',
];

export function AdminUserDialog({
  open,
  onOpenChange,
  user,
  mode,
  onSubmit,
  loading = false
}: AdminUserDialogProps) {
  const { hasPermission, canManageRole, userRole } = usePermissions();
  const [activeTab, setActiveTab] = useState('basic');
  
  const form = useForm<AdminUserFormData>({
    resolver: zodResolver(adminUserSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      username: '',
      email: '',
      password: '',
      role: 'read_only',
      department: '',
      phone: '',
      timezone: 'UTC',
      isActive: true,
      customPermissions: []
    }
  });

  // Update form when user data changes
  useEffect(() => {
    if (user && mode !== 'create') {
      form.reset({
        firstName: user.firstName,
        lastName: user.lastName,
        username: user.username,
        email: user.email,
        password: '', // Never pre-fill password
        role: user.role,
        department: user.department || '',
        phone: user.phone || '',
        timezone: user.timezone || 'UTC',
        isActive: user.isActive,
        customPermissions: user.customPermissions || []
      });
    } else if (mode === 'create') {
      form.reset({
        firstName: '',
        lastName: '',
        username: '',
        email: '',
        password: '',
        role: 'read_only',
        department: '',
        phone: '',
        timezone: 'UTC',
        isActive: true,
        customPermissions: []
      });
    }
  }, [user, mode, form]);

  const handleSubmit = async (data: AdminUserFormData) => {
    try {
      if (mode === 'create') {
        await onSubmit({
          ...data,
          password: data.password!
        } as CreateAdminUserRequest);
        toast.success('Admin user created successfully');
      } else if (mode === 'edit') {
        const { password, username, ...updateData } = data;
        await onSubmit(updateData as UpdateAdminUserRequest);
        toast.success('Admin user updated successfully');
      }
      onOpenChange(false);
    } catch (error) {
      toast.error(mode === 'create' ? 'Failed to create user' : 'Failed to update user');
    }
  };

  const watchedRole = form.watch('role');
  const watchedPermissions = form.watch('customPermissions');

  // Filter available roles based on user's permissions
  const availableRoles = AVAILABLE_ROLES.filter(role => {
    if (userRole === 'superadmin') return true;
    if (userRole === 'admin') return role.id !== 'superadmin';
    return false;
  });

  // Group permissions by category
  const permissionsByCategory = AVAILABLE_PERMISSIONS.reduce((acc, permission) => {
    if (!acc[permission.category]) {
      acc[permission.category] = [];
    }
    acc[permission.category].push(permission);
    return acc;
  }, {} as Record<string, typeof AVAILABLE_PERMISSIONS>);

  const isViewMode = mode === 'view';
  const isCreateMode = mode === 'create';
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {isCreateMode ? (
              <>
                <User className="h-5 w-5" />
                Create Admin User
              </>
            ) : isViewMode ? (
              <>
                <User className="h-5 w-5" />
                View Admin User
              </>
            ) : (
              <>
                <User className="h-5 w-5" />
                Edit Admin User
              </>
            )}
          </DialogTitle>
          <DialogDescription>
            {isCreateMode && 'Create a new admin user with appropriate roles and permissions.'}
            {isViewMode && 'View admin user details and permissions.'}
            {mode === 'edit' && 'Update admin user information, roles, and permissions.'}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="basic" className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Basic Info
                </TabsTrigger>
                <TabsTrigger value="permissions" className="flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  Permissions
                </TabsTrigger>
                <TabsTrigger value="settings" className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Settings
                </TabsTrigger>
              </TabsList>

              {/* Basic Information Tab */}
              <TabsContent value="basic" className="space-y-4">
                <ScrollArea className="h-[400px] pr-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* First Name */}
                    <FormField
                      control={form.control}
                      name="firstName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>First Name</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              placeholder="Enter first name"
                              disabled={isViewMode}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Last Name */}
                    <FormField
                      control={form.control}
                      name="lastName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Last Name</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              placeholder="Enter last name"
                              disabled={isViewMode}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Username */}
                    <FormField
                      control={form.control}
                      name="username"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Username</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              placeholder="Enter username"
                              disabled={isViewMode || mode === 'edit'}
                            />
                          </FormControl>
                          <FormDescription>
                            Username cannot be changed after creation
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Email */}
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email Address</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                              <Input
                                {...field}
                                type="email"
                                placeholder="Enter email address"
                                className="pl-10"
                                disabled={isViewMode}
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Password (only for create mode) */}
                    {isCreateMode && (
                      <FormField
                        control={form.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Password</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                  {...field}
                                  type="password"
                                  placeholder="Enter secure password"
                                  className="pl-10"
                                />
                              </div>
                            </FormControl>
                            <FormDescription>
                              Minimum 8 characters with mixed case, numbers, and symbols
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}

                    {/* Phone */}
                    <FormField
                      control={form.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Phone Number (Optional)</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                              <Input
                                {...field}
                                placeholder="Enter phone number"
                                className="pl-10"
                                disabled={isViewMode}
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Role */}
                    <FormField
                      control={form.control}
                      name="role"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Role</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                            disabled={isViewMode || !hasPermission('roles:edit')}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select a role" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {availableRoles.map((role) => (
                                <SelectItem 
                                  key={role.id} 
                                  value={role.id}
                                  disabled={!canManageRole(role.id)}
                                >
                                  <div className="flex flex-col">
                                    <span>{role.name}</span>
                                    <span className="text-xs text-muted-foreground">
                                      {role.description}
                                    </span>
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Department */}
                    <FormField
                      control={form.control}
                      name="department"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Department (Optional)</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                            disabled={isViewMode}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select department" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="">No Department</SelectItem>
                              {AVAILABLE_DEPARTMENTS.map((dept) => (
                                <SelectItem key={dept} value={dept}>
                                  {dept}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </ScrollArea>
              </TabsContent>

              {/* Permissions Tab */}
              <TabsContent value="permissions" className="space-y-4">
                <ScrollArea className="h-[400px] pr-4">
                  <div className="space-y-4">
                    {/* Role-based permissions info */}
                    <div className="p-4 bg-muted rounded-lg">
                      <div className="flex items-start gap-2">
                        <Shield className="h-5 w-5 text-blue-600 mt-0.5" />
                        <div>
                          <h4 className="font-medium">Role-Based Permissions</h4>
                          <p className="text-sm text-muted-foreground">
                            The selected role "{watchedRole?.replace('_', ' ')}" comes with default permissions.
                            You can add additional custom permissions below.
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Custom Permissions */}
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium">Additional Custom Permissions</h4>
                        <Badge variant="secondary">
                          {watchedPermissions.length} selected
                        </Badge>
                      </div>

                      {Object.entries(permissionsByCategory).map(([category, permissions]) => (
                        <div key={category} className="space-y-3">
                          <h5 className="text-sm font-medium text-muted-foreground">
                            {category}
                          </h5>
                          <div className="grid grid-cols-1 gap-3">
                            {permissions.map((permission) => (
                              <FormField
                                key={permission.id}
                                control={form.control}
                                name="customPermissions"
                                render={({ field }) => (
                                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                                    <FormControl>
                                      <Checkbox
                                        checked={field.value?.includes(permission.id)}
                                        onCheckedChange={(checked) => {
                                          const currentValue = field.value || [];
                                          if (checked) {
                                            field.onChange([...currentValue, permission.id]);
                                          } else {
                                            field.onChange(
                                              currentValue.filter((value) => value !== permission.id)
                                            );
                                          }
                                        }}
                                        disabled={isViewMode || !hasPermission('permissions:edit')}
                                      />
                                    </FormControl>
                                    <div className="space-y-1 leading-none">
                                      <FormLabel className="text-sm font-normal">
                                        {permission.name}
                                      </FormLabel>
                                      <p className="text-xs text-muted-foreground">
                                        {permission.description}
                                      </p>
                                    </div>
                                  </FormItem>
                                )}
                              />
                            ))}
                          </div>
                          <Separator />
                        </div>
                      ))}
                    </div>
                  </div>
                </ScrollArea>
              </TabsContent>

              {/* Settings Tab */}
              <TabsContent value="settings" className="space-y-4">
                <ScrollArea className="h-[400px] pr-4">
                  <div className="space-y-6">
                    {/* Account Status */}
                    <div className="space-y-4">
                      <h4 className="font-medium">Account Status</h4>
                      <FormField
                        control={form.control}
                        name="isActive"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                              <FormLabel className="text-base">Active Account</FormLabel>
                              <FormDescription>
                                When disabled, the user cannot log in or access the system
                              </FormDescription>
                            </div>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                                disabled={isViewMode || !hasPermission('admin.users.manage')}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </div>

                    {/* Timezone */}
                    <div className="space-y-4">
                      <h4 className="font-medium">Localization</h4>
                      <FormField
                        control={form.control}
                        name="timezone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Timezone</FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                              disabled={isViewMode}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select timezone" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {AVAILABLE_TIMEZONES.map((tz) => (
                                  <SelectItem key={tz} value={tz}>
                                    {tz}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormDescription>
                              All timestamps will be displayed in this timezone
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    {/* Additional Info for View Mode */}
                    {isViewMode && user && (
                      <div className="space-y-4">
                        <h4 className="font-medium">Account Information</h4>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="font-medium text-muted-foreground">Created:</span>
                            <p>{new Date(user.createdAt).toLocaleDateString()}</p>
                          </div>
                          <div>
                            <span className="font-medium text-muted-foreground">Last Updated:</span>
                            <p>{new Date(user.updatedAt).toLocaleDateString()}</p>
                          </div>
                          <div>
                            <span className="font-medium text-muted-foreground">Last Login:</span>
                            <p>{user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'Never'}</p>
                          </div>
                          <div>
                            <span className="font-medium text-muted-foreground">2FA Enabled:</span>
                            <div className="flex items-center gap-2">
                              {user.twoFactorEnabled ? (
                                <CheckCircle2 className="h-4 w-4 text-green-600" />
                              ) : (
                                <AlertCircle className="h-4 w-4 text-yellow-600" />
                              )}
                              <span>{user.twoFactorEnabled ? 'Yes' : 'No'}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </TabsContent>
            </Tabs>

            {/* Footer */}
            {!isViewMode && (
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                >
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
                <Button type="submit" disabled={loading}>
                  <Save className="h-4 w-4 mr-2" />
                  {loading ? 'Saving...' : isCreateMode ? 'Create User' : 'Update User'}
                </Button>
              </DialogFooter>
            )}
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}