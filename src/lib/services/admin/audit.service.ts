import { AuditLog, ListParams, PaginatedResponse } from "@/lib/types"
import { apiClient } from "../shared/api-client"


export class AuditService {
  async getAuditLogs(params?: ListParams): Promise<PaginatedResponse<AuditLog>> {
    const response = await apiClient.get<any>('/rbac/audit', { params })
    
    // Handle the actual API response structure
    if (response.data?.success && response.data?.data) {
      const apiData = response.data.data;
      
      // Transform to expected PaginatedResponse structure
      return {
        items: apiData.auditLogs || [],
        pagination: {
          page: apiData.pagination?.current || 1,
          limit: params?.limit || 20,
          total: apiData.pagination?.total || 0,
          pages: apiData.pagination?.pages || 1,
          hasNext: (apiData.pagination?.current || 1) < (apiData.pagination?.pages || 1),
          hasPrev: (apiData.pagination?.current || 1) > 1
        }
      };
    }
    
    return response.data as PaginatedResponse<AuditLog>;
  }

  async getAuditStatistics(): Promise<any> {
    const response = await apiClient.get<any>('/rbac/audit/statistics')
    
    if (response.data?.success && response.data?.data) {
      return response.data.data;
    }
    
    return response.data;
  }

  async getUserAuditLogs(userId: string, params?: ListParams): Promise<PaginatedResponse<AuditLog>> {
    const response = await apiClient.get<any>(`/rbac/audit/user/${userId}`, { params })
    
    if (response.data?.success && response.data?.data) {
      const apiData = response.data.data;
      return {
        items: apiData.auditLogs || apiData.items || [],
        pagination: {
          page: apiData.pagination?.current || 1,
          limit: params?.limit || 20,
          total: apiData.pagination?.total || 0,
          pages: apiData.pagination?.pages || 1,
          hasNext: (apiData.pagination?.current || 1) < (apiData.pagination?.pages || 1),
          hasPrev: (apiData.pagination?.current || 1) > 1
        }
      };
    }
    
    return response.data as PaginatedResponse<AuditLog>;
  }

  async getSecurityEvents(params?: ListParams): Promise<PaginatedResponse<AuditLog>> {
    const response = await apiClient.get<any>('/rbac/audit/security-events', { params })
    
    if (response.data?.success && response.data?.data) {
      const apiData = response.data.data;
      return {
        items: apiData.auditLogs || apiData.securityEvents || apiData.items || [],
        pagination: {
          page: apiData.pagination?.current || 1,
          limit: params?.limit || 20,
          total: apiData.pagination?.total || 0,
          pages: apiData.pagination?.pages || 1,
          hasNext: (apiData.pagination?.current || 1) < (apiData.pagination?.pages || 1),
          hasPrev: (apiData.pagination?.current || 1) > 1
        }
      };
    }
    
    return response.data as PaginatedResponse<AuditLog>;
  }
}

export const auditService = new AuditService()