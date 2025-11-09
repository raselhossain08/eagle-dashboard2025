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

  async exportAuditLogs(params: {
    format?: 'json' | 'csv';
    startDate?: string;
    endDate?: string;
    userId?: string;
    action?: string;
    resource?: string;
    limit?: number;
    twoFactorToken: string;
  }): Promise<Blob> {
    const { twoFactorToken, ...queryParams } = params;
    
    // We need to access the underlying axios instance for custom headers
    const client = (apiClient as any).client;
    const token = typeof window !== 'undefined' ? 
      document.cookie.split(';').find(c => c.trim().startsWith('admin_token='))?.split('=')[1] : 
      null;
    
    const response = await client.get('/rbac/audit/export', { 
      params: queryParams,
      responseType: 'blob',
      headers: {
        'Authorization': token ? `Bearer ${token}` : '',
        'X-Two-Factor-Token': twoFactorToken,
      }
    });
    return response.data as Blob;
  }

  async purgeAuditLogs(params: {
    olderThanDays?: number;
    dryRun?: boolean;
    keepCriticalEvents?: boolean;
    twoFactorToken: string;
  }): Promise<any> {
    const { twoFactorToken, ...requestData } = params;
    
    // We need to access the underlying axios instance for custom headers
    const client = (apiClient as any).client;
    const token = typeof window !== 'undefined' ? 
      document.cookie.split(';').find(c => c.trim().startsWith('admin_token='))?.split('=')[1] : 
      null;
    
    const response = await client.post('/rbac/audit/purge', requestData, {
      headers: {
        'Authorization': token ? `Bearer ${token}` : '',
        'X-Two-Factor-Token': twoFactorToken,
      }
    });
    return response.data;
  }
}

export const auditService = new AuditService()