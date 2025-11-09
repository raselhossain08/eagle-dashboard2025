export interface UserProfile {
  _id: string;
  name: string;
  email: string;
  role: 'subscriber' | 'user' | 'customer' | 'author' | 'contributor' | 'editor' | 'administrator' | 'shop_manager' | 'group_leader' | 'student' | 'web_designer' | 'seo_manager' | 'seo_editor';
  status: 'active' | 'inactive' | 'suspended' | 'pending';
  isEmailVerified: boolean;
  avatar?: string;
  phone?: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    country?: string;
    zipCode?: string;
  };
  subscription?: {
    planId: string;
    status: 'active' | 'inactive' | 'cancelled' | 'expired';
    startDate: string;
    endDate?: string;
  };
  permissions?: string[];
  lastLogin?: string;
  loginCount: number;
  isOnline?: boolean;
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
}

export interface CreateUserRequest {
  name: string;
  email: string;
  password: string;
  role: 'subscriber' | 'user' | 'customer' | 'author' | 'contributor' | 'editor' | 'administrator' | 'shop_manager' | 'group_leader' | 'student' | 'web_designer' | 'seo_manager' | 'seo_editor';
  status?: 'active' | 'inactive' | 'suspended' | 'pending';
  phone?: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    country?: string;
    zipCode?: string;
  };
  permissions?: string[];
  sendWelcomeEmail?: boolean;
}

export interface UpdateUserRequest {
  name?: string;
  email?: string;
  role?: 'subscriber' | 'user' | 'customer' | 'author' | 'contributor' | 'editor' | 'administrator' | 'shop_manager' | 'group_leader' | 'student' | 'web_designer' | 'seo_manager' | 'seo_editor';
  status?: 'active' | 'inactive' | 'suspended' | 'pending';
  phone?: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    country?: string;
    zipCode?: string;
  };
  permissions?: string[];
  isEmailVerified?: boolean;
}

export interface UserFilters {
  search?: string;
  role?: 'subscriber' | 'user' | 'customer' | 'author' | 'contributor' | 'editor' | 'administrator' | 'shop_manager' | 'group_leader' | 'student' | 'web_designer' | 'seo_manager' | 'seo_editor' | 'all';
  status?: 'active' | 'inactive' | 'suspended' | 'pending' | 'all';
  isEmailVerified?: boolean;
  dateRange?: {
    startDate: string;
    endDate: string;
  };
  sortBy?: 'name' | 'email' | 'role' | 'status' | 'createdAt' | 'lastLogin';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export interface UserStats {
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
}

export interface UserActivity {
  _id: string;
  userId: string;
  action: string;
  description: string;
  ipAddress?: string;
  userAgent?: string;
  timestamp: string;
}

export interface BulkUserAction {
  action: 'activate' | 'deactivate' | 'suspend' | 'delete' | 'verify' | 'changeRole';
  userIds: string[];
  data?: {
    role?: 'admin' | 'user' | 'moderator' | 'subscriber';
    status?: 'active' | 'inactive' | 'suspended';
    reason?: string;
  };
}

export interface UserExportOptions {
  format: 'csv' | 'excel' | 'pdf';
  fields?: string[];
  filters?: UserFilters;
  includeStats?: boolean;
}

export interface UsersResponse {
  success: boolean;
  data: {
    users: UserProfile[];
    pagination: {
      currentPage: number;
      totalPages: number;
      totalUsers: number;
      hasNextPage: boolean;
      hasPrevPage: boolean;
    };
    stats?: UserStats;
  };
  message?: string;
}

export interface UserResponse {
  success: boolean;
  data: UserProfile;
  message?: string;
}

export interface UserStatsResponse {
  success: boolean;
  data: UserStats;
  message?: string;
}

export interface UserActivityResponse {
  success: boolean;
  data: {
    activities: UserActivity[];
    pagination: {
      currentPage: number;
      totalPages: number;
      totalActivities: number;
    };
  };
  message?: string;
}

export interface BulkActionResponse {
  success: boolean;
  data: {
    processedCount: number;
    failedCount: number;
    errors?: string[];
  };
  message?: string;
}