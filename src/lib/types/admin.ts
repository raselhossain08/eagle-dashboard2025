/**
 * Admin-specific types for user management
 */

export interface AdminUser {
  _id: string;
  id: string;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  username: string;
  adminLevel: 'super_admin' | 'finance_admin' | 'growth_marketing' | 'support' | 'read_only';
  role: 'superadmin' | 'admin' | 'finance_admin' | 'support' | 'read_only';
  department?: string;
  employeeId?: string;
  isActive: boolean;
  isEmailVerified: boolean;
  isTwoFactorEnabled: boolean;
  isLocked: boolean;
  avatarUrl?: string;
  profilePicture?: string;
  phone?: string;
  bio?: string;
  permissions?: Array<{
    _id: string;
    id: string;
    module: string;
    actions: string[];
  }>;
  lastLogin?: string;
  lastLoginAt?: string;
  lastLoginIP?: string;
  loginAttempts: number;
  passwordResetExpires?: string | null;
  forcePasswordChange: boolean;
  activationTokenExpiry?: string | null;
  passwordChangedAt: string;
  createdAt: string;
  updatedAt: string;
  __v?: number;
}

export interface AdminUserFilters {
  search?: string;
  role?: 'admin' | 'user' | 'moderator' | 'subscriber' | 'all';
  status?: 'active' | 'inactive' | 'suspended' | 'pending' | 'all';
  isEmailVerified?: boolean;
  isOnline?: boolean;
  twoFactorEnabled?: boolean;
  dateRange?: {
    startDate: string;
    endDate: string;
  };
  sortBy?: 'name' | 'email' | 'role' | 'status' | 'createdAt' | 'lastLogin';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export interface AdminUserStats {
  totalUsers: number;
  activeUsers: number;
  inactiveUsers: number;
  suspendedUsers: number;
  pendingUsers: number;
  adminUsers: number;
  regularUsers: number;
  moderatorUsers: number;
  subscriberUsers: number;
  verifiedUsers: number;
  unverifiedUsers: number;
  onlineUsers: number;
  newUsersThisMonth: number;
  userGrowthPercentage: number;
  twoFactorEnabledUsers: number;
  lockedUsers: number;
}

export interface CreateAdminUserRequest {
  firstName: string;
  lastName: string;
  email: string;
  username: string;
  password: string;
  adminLevel: string;
  department: string;
  phone?: string;
  isActive?: boolean;
  permissions?: string[];
  sendWelcomeEmail?: boolean;
  requirePasswordChange?: boolean;
}

export interface UpdateAdminUserRequest {
  firstName?: string;
  lastName?: string;
  email?: string;
  adminLevel?: string;
  department?: string;
  phone?: string;
  isActive?: boolean;
  permissions?: string[];
  isEmailVerified?: boolean;
  twoFactorEnabled?: boolean;
}

export interface AdminUserActivity {
  _id: string;
  userId: string;
  action: string;
  description: string;
  ipAddress?: string;
  userAgent?: string;
  timestamp: string;
  adminId?: string;
  severity?: 'low' | 'medium' | 'high' | 'critical';
}

export interface BulkAdminUserAction {
  action: 'activate' | 'deactivate' | 'suspend' | 'delete' | 'verify' | 'changeRole' | 'resetPassword';
  userIds: string[];
  data?: {
    role?: 'admin' | 'user' | 'moderator' | 'subscriber';
    status?: 'active' | 'inactive' | 'suspended';
    reason?: string;
    notifyUsers?: boolean;
  };
}

export interface AdminUserSession {
  _id: string;
  userId: string;
  sessionId: string;
  ipAddress: string;
  userAgent: string;
  location?: string;
  isActive: boolean;
  createdAt: string;
  lastActivity: string;
  expiresAt: string;
}

export interface PasswordResetRequest {
  userId: string;
  temporaryPassword?: string;
  requirePasswordChange: boolean;
  notifyUser: boolean;
  expiresIn?: number; // hours
}

export interface UserImpersonationRequest {
  targetUserId: string;
  adminId: string;
  reason: string;
  duration?: number; // minutes
}