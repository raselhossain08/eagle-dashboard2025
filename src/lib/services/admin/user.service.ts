import ApiService from '../shared/api.service';

export interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  role: string;
  permissions: string[];
  subscription: string;
  isActive: boolean;
  isEmailVerified: boolean;
  lastLoginAt?: string;
  createdAt: string;
  updatedAt: string;
  roleMetadata: {
    assignedBy?: {
      firstName: string;
      lastName: string;
      email: string;
    };
    assignedAt: string;
    lastPermissionUpdate: string;
    roleInfo: {
      displayName: string;
      description: string;
      color: string;
      icon: string;
      hierarchy: number;
    };
    effectivePermissions: string[];
  };
  canManage?: boolean;
}

export interface GetUsersParams {
  page?: number;
  limit?: number;
  role?: string;
  search?: string;
  isActive?: boolean;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface UpdateUserRequest {
  firstName?: string;
  lastName?: string;
  phone?: string;
  discordUsername?: string;
  address?: {
    country?: string;
    streetAddress?: string;
    flatSuiteUnit?: string;
    townCity?: string;
    stateCounty?: string;
    postcodeZip?: string;
  };
  isActive?: boolean;
  isEmailVerified?: boolean;
}

class UserService {
  private static cache: { 
    data: User[]; 
    timestamp: number;
    params: GetUsersParams;
  } | null = null;
  
  private static readonly CACHE_DURATION = 30000; // 30 seconds

  /**
   * Get all users with caching and filtering
   */
  static async getUsers(params: GetUsersParams = {}): Promise<{ data: User[] }> {
    const now = Date.now();
    const cacheKey = JSON.stringify(params);
    
    // Return cached data if available and not expired
    if (this.cache && 
        (now - this.cache.timestamp) < this.CACHE_DURATION &&
        JSON.stringify(this.cache.params) === cacheKey) {
      console.log('🔄 Returning cached users data');
      return { data: this.cache.data };
    }

    try {
      console.log('🌐 Fetching users from API...');
      
      // Build query string
      const queryParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          queryParams.append(key, String(value));
        }
      });
      
      const queryString = queryParams.toString();
      const endpoint = `/user/all${queryString ? `?${queryString}` : ''}`;
      
      const response = await ApiService.get<{ data: User[] }>(endpoint);
      
      // Update cache
      this.cache = {
        data: response.data,
        timestamp: now,
        params
      };

      console.log(`✅ Users fetched successfully: ${response.data.length} users`);
      return response;
    } catch (error: any) {
      console.error('❌ Failed to fetch users:', error);
      
      // If we have cached data and it's a network error, return cached data
      if (this.cache && error.message.includes('Network')) {
        console.log('⚠️ Returning cached data due to API error');
        return { data: this.cache.data };
      }
      
      throw new Error(`Failed to fetch users: ${error.message}`);
    }
  }

  /**
   * Clear the users cache
   */
  static clearCache(): void {
    this.cache = null;
    console.log('🗑️ Users cache cleared');
  }

  /**
   * Update user with validation
   */
  static async updateUser(userId: string, data: UpdateUserRequest): Promise<{ data: User }> {
    try {
      console.log('📝 Updating user:', userId);
      
      if (!userId) {
        throw new Error('User ID is required');
      }

      const response = await ApiService.put<{ data: User }>(`/user/${userId}`, data);
      this.clearCache(); // Clear cache after modification
      
      console.log('✅ User updated successfully:', userId);
      return response;
    } catch (error: any) {
      console.error('❌ Failed to update user:', error);
      throw new Error(`Failed to update user: ${error.message}`);
    }
  }

  /**
   * Delete user
   */
  static async deleteUser(userId: string): Promise<any> {
    try {
      console.log('🗑️ Deleting user:', userId);
      
      if (!userId) {
        throw new Error('User ID is required');
      }

      const response = await ApiService.delete(`/user/${userId}`);
      this.clearCache(); // Clear cache after modification
      
      console.log('✅ User deleted successfully:', userId);
      return response;
    } catch (error: any) {
      console.error('❌ Failed to delete user:', error);
      throw new Error(`Failed to delete user: ${error.message}`);
    }
  }

  /**
   * Get user by ID
   */
  static async getUserById(userId: string): Promise<{ data: User }> {
    try {
      if (!userId) {
        throw new Error('User ID is required');
      }

      return await ApiService.get<{ data: User }>(`/user/${userId}`);
    } catch (error: any) {
      console.error('❌ Failed to fetch user:', error);
      throw new Error(`Failed to fetch user: ${error.message}`);
    }
  }
}

export default UserService;