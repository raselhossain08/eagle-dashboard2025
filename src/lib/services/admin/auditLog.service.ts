// Audit Log Service
import ApiService from '../shared/api.service';

export interface AuditLogEntry {
  id: string;
  userId: string;
  action: string;
  resource: string;
  resourceId?: string;
  details?: any;
  ipAddress?: string;
  userAgent?: string;
  timestamp: Date;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

export interface AuditLogFilters {
  userId?: string;
  action?: string;
  resource?: string;
  severity?: string;
  startDate?: Date;
  endDate?: Date;
  page?: number;
  limit?: number;
}

export interface DashboardOverview {
  totalEvents: number;
  recentEvents: number;
  criticalEvents: number;
  topActions: Array<{ action: string; count: number }>;
  topResources: Array<{ resource: string; count: number }>;
}

export interface TimelineData {
  date: string;
  events: number;
  criticalEvents: number;
}

class AuditLogService {
  private readonly endpoint = '/audit-logs';

  async getAuditLogs(filters: AuditLogFilters = {}): Promise<{
    logs: AuditLogEntry[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined) {
        params.append(key, value.toString());
      }
    });

    return ApiService.get(`${this.endpoint}?${params.toString()}`);
  }

  async getAuditLogById(id: string): Promise<AuditLogEntry> {
    return ApiService.get(`${this.endpoint}/${id}`);
  }

  async createAuditLog(data: Omit<AuditLogEntry, 'id' | 'timestamp'>): Promise<AuditLogEntry> {
    return ApiService.post(this.endpoint, data);
  }

  async getDashboardOverview(days: number = 30): Promise<DashboardOverview> {
    return ApiService.get(`${this.endpoint}/dashboard?days=${days}`);
  }

  async getTimelineData(days: number = 30): Promise<TimelineData[]> {
    return ApiService.get(`${this.endpoint}/timeline?days=${days}`);
  }

  async exportAuditLogs(filters: AuditLogFilters = {}): Promise<Blob> {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined) {
        params.append(key, value.toString());
      }
    });

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}${this.endpoint}/export?${params.toString()}`, {
      method: 'GET',
      headers: {
        'Accept': 'text/csv',
        Authorization: `Bearer ${ApiService.getToken()}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to export audit logs');
    }

    return response.blob();
  }
}

export const auditLogService = new AuditLogService();

// Initialize function for compatibility
export const initializeAuditLogService = () => {
  return auditLogService;
};

export default auditLogService;