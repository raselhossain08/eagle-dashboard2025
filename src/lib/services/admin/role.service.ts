// services/role.service.ts

import { ListParams, PaginatedResponse, Role, UserRole } from "@/lib/types"
import { apiClient } from "../shared/api-client"

export class RoleService {
  async getRoles(params?: ListParams): Promise<PaginatedResponse<Role>> {
    try {
      console.log('🔍 RoleService: Attempting to fetch roles...')

      const response = await apiClient.get<any>('/rbac/roles', { params })
      console.log('✅ RoleService: Successfully fetched roles', response.data)
      
      // Handle the actual API response structure
      if (response.data?.success && response.data?.data) {
        const apiData = response.data.data;
        
        // Transform to expected PaginatedResponse structure
        return {
          items: apiData.roles || [],
          pagination: {
            page: apiData.pagination?.current || 1,
            limit: params?.limit || 10,
            total: apiData.pagination?.total || 0,
            pages: apiData.pagination?.pages || 1,
            hasNext: (apiData.pagination?.current || 1) < (apiData.pagination?.pages || 1),
            hasPrev: (apiData.pagination?.current || 1) > 1
          }
        };
      }
      
      // Fallback for direct response (if API changes structure)
      return response.data as PaginatedResponse<Role>;
    } catch (error: any) {
      console.error('❌ RoleService: Error fetching roles:', error)
      
      if (error.response?.status === 403) {
        console.error('🚫 Access denied. Debugging authentication...')
        throw new Error(`Access denied: ${error.response.data?.message || 'Insufficient permissions for role management'}`)
      }
      
      throw error
    }
  }

  async getRoleById(id: string): Promise<Role> {
    const response = await apiClient.get<any>(`/rbac/roles/${id}`)
    
    // Handle API response structure
    if (response.data?.success && response.data?.data) {
      return response.data.data;
    }
    
    return response.data as Role;
  }

  async createRole(roleData: Partial<Role>): Promise<Role> {
    const response = await apiClient.post<any>('/rbac/roles', roleData)
    
    // Handle API response structure
    if (response.data?.success && response.data?.data) {
      return response.data.data;
    }
    
    return response.data as Role;
  }

  async updateRole(id: string, roleData: Partial<Role>): Promise<Role> {
    const response = await apiClient.put<any>(`/rbac/roles/${id}`, roleData)
    
    // Handle API response structure
    if (response.data?.success && response.data?.data) {
      return response.data.data;
    }
    
    return response.data as Role;
  }

  async deleteRole(id: string): Promise<void> {
    await apiClient.delete(`/rbac/roles/${id}`)
  }

  async assignRole(userId: string, roleId: string, expiresAt?: string): Promise<UserRole> {
    const response = await apiClient.post<UserRole>('/rbac/roles/assign', {
      userId,
      roleId,
      expiresAt
    })
    return response.data
  }

  async removeUserRole(userRoleId: string): Promise<void> {
    await apiClient.delete(`/rbac/roles/user-role/${userRoleId}`)
  }
}

export const roleService = new RoleService()