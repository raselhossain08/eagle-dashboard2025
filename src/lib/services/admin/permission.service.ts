import { ListParams, PaginatedResponse, Permission } from "@/lib/types"
import { apiClient } from "../shared/api-client"


export class PermissionService {
  async getPermissions(params?: ListParams): Promise<PaginatedResponse<Permission>> {
    const response = await apiClient.get<any>('/rbac/permissions', { params })
    
    // Handle the actual API response structure
    if (response.data?.success && response.data?.data) {
      const apiData = response.data.data;
      
      // Transform to expected PaginatedResponse structure
      return {
        items: apiData.permissions || apiData.items || [],
        pagination: {
          page: apiData.pagination?.current || apiData.pagination?.page || 1,
          limit: params?.limit || 10,
          total: apiData.pagination?.total || 0,
          pages: apiData.pagination?.pages || 1,
          hasNext: (apiData.pagination?.current || 1) < (apiData.pagination?.pages || 1),
          hasPrev: (apiData.pagination?.current || 1) > 1
        }
      };
    }
    
    return response.data as PaginatedResponse<Permission>;
  }

  async getPermissionById(id: string): Promise<Permission> {
    const response = await apiClient.get<any>(`/rbac/permissions/${id}`)
    
    if (response.data?.success && response.data?.data) {
      return response.data.data;
    }
    
    return response.data as Permission;
  }

  async createPermission(permissionData: Partial<Permission>): Promise<Permission> {
    const response = await apiClient.post<any>('/rbac/permissions', permissionData)
    
    if (response.data?.success && response.data?.data) {
      return response.data.data;
    }
    
    return response.data as Permission;
  }

  async updatePermission(id: string, permissionData: Partial<Permission>): Promise<Permission> {
    const response = await apiClient.put<any>(`/rbac/permissions/${id}`, permissionData)
    
    if (response.data?.success && response.data?.data) {
      return response.data.data;
    }
    
    return response.data as Permission;
  }

  async deletePermission(id: string): Promise<void> {
    await apiClient.delete(`/rbac/permissions/${id}`)
  }

  async getPermissionsByCategory(category: string): Promise<Permission[]> {
    const response = await apiClient.get<any>(`/rbac/permissions/category/${category}`)
    
    if (response.data?.success && response.data?.data) {
      return response.data.data;
    }
    
    return response.data as Permission[];
  }

  async getPermissionCategories(): Promise<string[]> {
    const response = await apiClient.get<any>('/rbac/permissions/meta/categories')
    
    if (response.data?.success && response.data?.data) {
      return response.data.data;
    }
    
    return response.data as string[];
  }

  async createBulkPermissions(permissions: Partial<Permission>[]): Promise<Permission[]> {
    const response = await apiClient.post<any>('/rbac/permissions/bulk', { permissions })
    
    if (response.data?.success && response.data?.data) {
      return response.data.data;
    }
    
    return response.data as Permission[];
  }
}

export const permissionService = new PermissionService()