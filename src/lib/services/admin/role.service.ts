import ApiService from '../shared/api.service';

export interface Role {
  _id: string;
  name: string;
  displayName: string;
  description?: string;
  permissions: string[];
  hierarchy: number;
  color: string;
  icon: string;
  isActive: boolean;
  userCount?: number;
  email?: string;
  password?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateRoleRequest {
  name: string;
  displayName: string;
  description?: string;
  permissions?: string[];
  hierarchy: number;
  color?: string;
  icon?: string;
  isActive?: boolean;
  email?: string;
  password?: string;
}

export interface UpdateRoleDataRequest {
  displayName?: string;
  description?: string;
  permissions?: string[];
  color?: string;
  icon?: string;
  isActive?: boolean;
  email?: string;
  password?: string;
}

class RoleService {
  // NO CACHE - Direct API calls only

  /**
   * Get all available roles - NO CACHE
   */
  static async getRoles(forceRefresh = false): Promise<{ data: Role[] }> {
    try {
      const response = await ApiService.get<{ data: Role[] }>('/roles');

      return response;
    } catch (error: any) {
      // NO CACHE - just throw error
      throw new Error(`Failed to fetch roles: ${error.message}`);
    }
  }

  /**
   * Create a new role with validation
   */
  static async createRole(data: CreateRoleRequest): Promise<{ data: Role }> {
    try {
      console.log('📝 Creating new role:', data.name);
      
      // Validate required fields
      if (!data.name?.trim()) {
        throw new Error('Role name is required');
      }
      if (!data.displayName?.trim()) {
        throw new Error('Display name is required');
      }
      if (data.hierarchy < 1 || data.hierarchy > 7) {
        throw new Error('Role level must be between 1 and 7');
      }

      const response = await ApiService.post<{ data: Role }>('/roles', data);
      // NO CACHE - nothing to clear
      
      console.log('✅ Role created successfully:', data.name);
      return response;
    } catch (error: any) {
      console.error('❌ Failed to create role:', error);
      throw new Error(`Failed to create role: ${error.message}`);
    }
  }

  /**
   * Update a role with validation
   */
  static async updateRole(roleId: string, data: UpdateRoleDataRequest): Promise<{ data: Role }> {
    try {
      console.log('📝 Updating role:', roleId);
      
      if (!roleId) {
        throw new Error('Role ID is required');
      }

      const response = await ApiService.put<{ data: Role }>(`/roles/${roleId}`, data);
      // NO CACHE - nothing to clear
      
      console.log('✅ Role updated successfully:', roleId);
      return response;
    } catch (error: any) {
      console.error('❌ Failed to update role:', error);
      throw new Error(`Failed to update role: ${error.message}`);
    }
  }

  /**
   * Delete a role with validation
   */
  static async deleteRole(roleId: string): Promise<{ success: boolean; message: string }> {
    try {
      console.log('🗑️ Deleting role:', roleId);
      
      if (!roleId) {
        throw new Error('Role ID is required');
      }

      const response = await ApiService.delete<{ success: boolean; message: string }>(`/roles/${roleId}`);
      // NO CACHE - nothing to clear
      
      console.log('✅ Role deleted successfully:', roleId);
      return response;
    } catch (error: any) {
      console.error('❌ Failed to delete role:', error);
      throw new Error(`Failed to delete role: ${error.message}`);
    }
  }

  /**
   * Get role by ID
   */
  static async getRoleById(roleId: string): Promise<{ data: Role }> {
    try {
      if (!roleId) {
        throw new Error('Role ID is required');
      }

      return await ApiService.get<{ data: Role }>(`/roles/${roleId}`);
    } catch (error: any) {
      console.error('❌ Failed to fetch role:', error);
      throw new Error(`Failed to fetch role: ${error.message}`);
    }
  }
}

export default RoleService;