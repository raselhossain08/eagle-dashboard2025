/**
 * Audit Log Service for Frontend
 * Handles audit log data retrieval, filtering, real-time updates, and export
 */

export interface AuditLogEntry {
  id: string;
  timestamp: Date;
  
  // Actor information (who)
  actor: {
    userId?: string;
    userEmail?: string;
    userName?: string;
    userRole?: string;
    userType: 'user' | 'admin' | 'super_admin' | 'system' | 'api' | 'service';
    systemActor?: {
      service?: string;
      apiKey?: string;
      application?: string;
    };
    sessionId?: string;
    ipAddress?: string;
    userAgent?: string;
    location?: {
      country?: string;
      region?: string;
      city?: string;
      timezone?: string;
    };
  };

  // Action information (what)
  action: {
    type: string;
    category: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    description: string;
    method?: string;
    endpoint?: string;
    statusCode?: number;
    success: boolean;
    errorMessage?: string;
    errorCode?: string;
  };

  // Resource information (where)
  resource: {
    type: string;
    id: string | number;
    name?: string;
    collection?: string;
    parent?: {
      type: string;
      id: string | number;
      name?: string;
    };
  };

  // Changes information (before/after)
  changes?: {
    before?: any;
    after?: any;
    fields?: Array<{
      field: string;
      oldValue: any;
      newValue: any;
      dataType: string;
    }>;
    summary?: {
      fieldsChanged?: string[];
      fieldsAdded?: string[];
      fieldsRemoved?: string[];
      totalChanges: number;
    };
  };

  // Additional context
  context?: {
    request?: {
      headers?: Record<string, any>;
      query?: Record<string, any>;
      params?: Record<string, any>;
      body?: Record<string, any>;
    };
    business?: {
      workflowId?: string;
      processId?: string;
      campaignId?: string;
      contractId?: string;
      subscriptionId?: string;
      invoiceId?: string;
    };
    technical?: {
      version?: string;
      environment?: string;
      server?: string;
      correlationId?: string;
    };
  };

  // Compliance information
  compliance?: {
    dataClassification: 'public' | 'internal' | 'confidential' | 'restricted';
    retentionPolicy?: {
      retainUntil: Date;
      retentionReason?: string;
      autoDelete: boolean;
    };
    privacy?: {
      containsPII: boolean;
      containsPCI: boolean;
      containsPHI: boolean;
      gdprRelevant: boolean;
    };
  };

  // Virtual fields
  actorDisplay?: string;
  resourceDisplay?: string;
  changesSummary?: string;
  duration?: string;
  processingTime?: number;
}

export interface AuditLogFilters {
  page?: number;
  limit?: number;
  search?: string;
  userId?: string;
  actions?: string[];
  resources?: string[];
  severity?: 'low' | 'medium' | 'high' | 'critical';
  success?: boolean;
  startDate?: string;
  endDate?: string;
  ipAddress?: string;
  sortBy?: string;
  sortOrder?: 1 | -1;
  dataClassification?: 'public' | 'internal' | 'confidential' | 'restricted';
}

export interface AuditLogResponse {
  success: boolean;
  data: {
    logs: AuditLogEntry[];
    pagination: {
      total: number;
      page: number;
      limit: number;
      pages: number;
      hasNext: boolean;
      hasPrev: boolean;
    };
  };
}

export interface DashboardOverview {
  period: string;
  overview: {
    totalLogs: number;
    securityEvents: number;
    failedOperations: number;
    uniqueUsers: number;
    successRate: string;
  };
  trends: {
    totalLogs: string;
    securityEvents: string;
    failedOperations: string;
  };
  statistics: {
    actionTypes: Array<{
      type: string;
      count: number;
      percentage: string;
    }>;
    resourceTypes: Array<{
      type: string;
      count: number;
      percentage: string;
    }>;
    severity: Array<{
      level: string;
      count: number;
      percentage: string;
    }>;
  };
  recentActivity: Array<{
    id: string;
    action: string;
    description: string;
    actor: string;
    resource: string;
    timestamp: Date;
    changes: string;
  }>;
}

export interface TimelineData {
  period: string;
  interval: string;
  timeline: Array<{
    timestamp: any;
    total: number;
    success: number;
    errors: number;
    security: number;
    successRate: string;
  }>;
}

class AuditLogService {
  private apiBaseUrl: string;
  private eventSource: EventSource | null = null;
  private reconnectAttempts: number = 0;
  private maxReconnectAttempts: number = 5;
  private reconnectDelay: number = 5000;

  constructor(apiBaseUrl: string = '/api/audit') {
    this.apiBaseUrl = apiBaseUrl;
  }

  // ===================== BASIC RETRIEVAL =====================

  /**
   * Get audit logs with filtering and pagination
   */
  async getAuditLogs(filters: AuditLogFilters = {}): Promise<AuditLogResponse> {
    try {
      const params = new URLSearchParams();
      
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (Array.isArray(value)) {
            params.append(key, value.join(','));
          } else {
            params.append(key, value.toString());
          }
        }
      });

      const response = await fetch(`${this.apiBaseUrl}/logs?${params}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': this.getAuthHeader()
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch audit logs: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      
      // Convert timestamp strings to Date objects
      if (data.success && data.data.logs) {
        data.data.logs = data.data.logs.map((log: any) => ({
          ...log,
          timestamp: new Date(log.timestamp),
          compliance: log.compliance ? {
            ...log.compliance,
            retentionPolicy: log.compliance.retentionPolicy ? {
              ...log.compliance.retentionPolicy,
              retainUntil: new Date(log.compliance.retentionPolicy.retainUntil)
            } : undefined
          } : undefined
        }));
      }

      return data;
    } catch (error) {
      console.error('Error fetching audit logs:', error);
      throw error;
    }
  }

  /**
   * Get a specific audit log by ID
   */
  async getAuditLogById(id: string): Promise<{ success: boolean; data: AuditLogEntry }> {
    try {
      const response = await fetch(`${this.apiBaseUrl}/logs/${id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': this.getAuthHeader()
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch audit log: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      
      // Convert timestamp to Date object
      if (data.success && data.data) {
        data.data.timestamp = new Date(data.data.timestamp);
      }

      return data;
    } catch (error) {
      console.error('Error fetching audit log by ID:', error);
      throw error;
    }
  }

  // ===================== USER-SPECIFIC OPERATIONS =====================

  /**
   * Get audit logs for a specific user
   */
  async getUserAuditLogs(userId: string, filters: Omit<AuditLogFilters, 'userId'> = {}): Promise<AuditLogResponse> {
    return this.getAuditLogs({ ...filters, userId });
  }

  /**
   * Get audit logs for a specific resource
   */
  async getResourceAuditLogs(resourceType: string, resourceId: string, filters: Omit<AuditLogFilters, 'resources'> = {}): Promise<AuditLogResponse> {
    try {
      const params = new URLSearchParams();
      
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (Array.isArray(value)) {
            params.append(key, value.join(','));
          } else {
            params.append(key, value.toString());
          }
        }
      });

      const response = await fetch(`${this.apiBaseUrl}/resources/${resourceType}/${resourceId}/logs?${params}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': this.getAuthHeader()
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch resource audit logs: ${response.status} ${response.statusText}`);
      }

      return response.json();
    } catch (error) {
      console.error('Error fetching resource audit logs:', error);
      throw error;
    }
  }

  // ===================== SECURITY AND MONITORING =====================

  /**
   * Get security events
   */
  async getSecurityEvents(options: { 
    page?: number; 
    limit?: number; 
    severity?: string; 
    hours?: number; 
  } = {}): Promise<AuditLogResponse> {
    try {
      const params = new URLSearchParams();
      Object.entries(options).forEach(([key, value]) => {
        if (value !== undefined) {
          params.append(key, value.toString());
        }
      });

      const response = await fetch(`${this.apiBaseUrl}/security/events?${params}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': this.getAuthHeader()
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch security events: ${response.status} ${response.statusText}`);
      }

      return response.json();
    } catch (error) {
      console.error('Error fetching security events:', error);
      throw error;
    }
  }

  /**
   * Get failed operations
   */
  async getFailedOperations(options: { 
    page?: number; 
    limit?: number; 
    hours?: number; 
  } = {}): Promise<AuditLogResponse> {
    try {
      const params = new URLSearchParams();
      Object.entries(options).forEach(([key, value]) => {
        if (value !== undefined) {
          params.append(key, value.toString());
        }
      });

      const response = await fetch(`${this.apiBaseUrl}/operations/failed?${params}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': this.getAuthHeader()
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch failed operations: ${response.status} ${response.statusText}`);
      }

      return response.json();
    } catch (error) {
      console.error('Error fetching failed operations:', error);
      throw error;
    }
  }

  // ===================== DASHBOARD AND ANALYTICS =====================

  /**
   * Get dashboard overview data
   */
  async getDashboardOverview(period: string = '24h'): Promise<{ success: boolean; data: DashboardOverview }> {
    try {
      const response = await fetch(`${this.apiBaseUrl}/dashboard/overview?period=${period}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': this.getAuthHeader()
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch dashboard overview: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      
      // Convert timestamps in recent activity
      if (data.success && data.data.recentActivity) {
        data.data.recentActivity = data.data.recentActivity.map((activity: any) => ({
          ...activity,
          timestamp: new Date(activity.timestamp)
        }));
      }

      return data;
    } catch (error) {
      console.error('Error fetching dashboard overview:', error);
      throw error;
    }
  }

  /**
   * Get activity timeline data
   */
  async getActivityTimeline(options: {
    period?: string;
    interval?: string;
    userId?: string;
    actions?: string[];
    resources?: string[];
  } = {}): Promise<{ success: boolean; data: TimelineData }> {
    try {
      const params = new URLSearchParams();
      Object.entries(options).forEach(([key, value]) => {
        if (value !== undefined) {
          if (Array.isArray(value)) {
            params.append(key, value.join(','));
          } else {
            params.append(key, value.toString());
          }
        }
      });

      const response = await fetch(`${this.apiBaseUrl}/dashboard/timeline?${params}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': this.getAuthHeader()
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch activity timeline: ${response.status} ${response.statusText}`);
      }

      return response.json();
    } catch (error) {
      console.error('Error fetching activity timeline:', error);
      throw error;
    }
  }

  // ===================== DATA EXPORT =====================

  /**
   * Export audit logs
   */
  async exportAuditLogs(options: {
    format?: 'json' | 'csv';
    filters?: AuditLogFilters;
    maxRecords?: number;
  } = {}): Promise<Blob> {
    try {
      const { format = 'json', filters = {}, maxRecords = 10000 } = options;
      
      const params = new URLSearchParams({
        format,
        maxRecords: maxRecords.toString()
      });
      
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (Array.isArray(value)) {
            params.append(key, value.join(','));
          } else {
            params.append(key, value.toString());
          }
        }
      });

      const response = await fetch(`${this.apiBaseUrl}/export?${params}`, {
        method: 'GET',
        headers: {
          'Authorization': this.getAuthHeader()
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to export audit logs: ${response.status} ${response.statusText}`);
      }

      return response.blob();
    } catch (error) {
      console.error('Error exporting audit logs:', error);
      throw error;
    }
  }

  /**
   * Download exported audit logs
   */
  async downloadAuditLogs(options: {
    format?: 'json' | 'csv';
    filters?: AuditLogFilters;
    maxRecords?: number;
    filename?: string;
  } = {}): Promise<void> {
    try {
      const { format = 'json', filename } = options;
      const blob = await this.exportAuditLogs(options);
      
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = filename || `audit-logs-${new Date().toISOString().split('T')[0]}.${format}`;
      
      document.body.appendChild(a);
      a.click();
      
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error downloading audit logs:', error);
      throw error;
    }
  }

  // ===================== COMPLIANCE =====================

  /**
   * Get compliance report
   */
  async getComplianceReport(startDate: string, endDate: string): Promise<any> {
    try {
      const params = new URLSearchParams({ startDate, endDate });
      
      const response = await fetch(`${this.apiBaseUrl}/compliance/report?${params}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': this.getAuthHeader()
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch compliance report: ${response.status} ${response.statusText}`);
      }

      return response.json();
    } catch (error) {
      console.error('Error fetching compliance report:', error);
      throw error;
    }
  }

  // ===================== REAL-TIME UPDATES =====================

  /**
   * Subscribe to real-time audit log updates
   */
  subscribeToRealTimeUpdates(
    onEvent: (event: any) => void,
    onError?: (error: Event) => void,
    onOpen?: (event: Event) => void
  ): () => void {
    if (this.eventSource) {
      this.eventSource.close();
    }

    const url = `${this.apiBaseUrl}/realtime/events`;
    this.eventSource = new EventSource(url);

    this.eventSource.onopen = (event) => {
      console.log('Connected to audit log real-time stream');
      this.reconnectAttempts = 0;
      onOpen?.(event);
    };

    this.eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        onEvent(data);
      } catch (error) {
        console.error('Error parsing real-time event data:', error);
      }
    };

    this.eventSource.onerror = (event) => {
      console.error('Real-time audit log stream error:', event);
      
      if (onError) {
        onError(event);
      }

      // Attempt to reconnect
      if (this.reconnectAttempts < this.maxReconnectAttempts) {
        this.reconnectAttempts++;
        setTimeout(() => {
          console.log(`Attempting to reconnect to audit log stream (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
          this.subscribeToRealTimeUpdates(onEvent, onError, onOpen);
        }, this.reconnectDelay * this.reconnectAttempts);
      } else {
        console.error('Max reconnection attempts reached for audit log stream');
      }
    };

    // Return unsubscribe function
    return () => {
      if (this.eventSource) {
        this.eventSource.close();
        this.eventSource = null;
      }
    };
  }

  /**
   * Disconnect from real-time updates
   */
  disconnectRealTime(): void {
    if (this.eventSource) {
      this.eventSource.close();
      this.eventSource = null;
    }
  }

  // ===================== HEALTH CHECK =====================

  /**
   * Check audit log system health
   */
  async checkHealth(): Promise<any> {
    try {
      const response = await fetch(`${this.apiBaseUrl}/health`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': this.getAuthHeader()
        }
      });

      if (!response.ok) {
        throw new Error(`Health check failed: ${response.status} ${response.statusText}`);
      }

      return response.json();
    } catch (error) {
      console.error('Error checking audit log health:', error);
      throw error;
    }
  }

  // ===================== UTILITY METHODS =====================

  /**
   * Get authentication header
   */
  private getAuthHeader(): string {
    const token = this.getAuthToken();
    return token ? `Bearer ${token}` : '';
  }

  /**
   * Get authentication token
   */
  private getAuthToken(): string | null {
    // Try multiple sources for auth token
    const tokenFromStorage = localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token');
    const tokenFromCookie = this.getCookie('token');
    
    return tokenFromStorage || tokenFromCookie;
  }

  /**
   * Get cookie value by name
   */
  private getCookie(name: string): string | null {
    if (typeof document === 'undefined') {
      return null;
    }
    
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) {
      return parts.pop()?.split(';').shift() || null;
    }
    return null;
  }

  /**
   * Format date for API calls
   */
  static formatDate(date: Date): string {
    return date.toISOString();
  }

  /**
   * Parse date from API response
   */
  static parseDate(dateString: string): Date {
    return new Date(dateString);
  }

  /**
   * Get severity color for UI
   */
  static getSeverityColor(severity: string): string {
    const colors = {
      low: 'text-green-600',
      medium: 'text-yellow-600',
      high: 'text-orange-600',
      critical: 'text-red-600'
    };
    return colors[severity as keyof typeof colors] || 'text-gray-600';
  }

  /**
   * Format action type for display
   */
  static formatActionType(actionType: string): string {
    return actionType.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
    ).join(' ');
  }

  /**
   * Get action icon for UI
   */
  static getActionIcon(actionType: string): string {
    const icons = {
      CREATE: '➕',
      UPDATE: '✏️',
      DELETE: '🗑️',
      READ: '👀',
      LOGIN: '🔐',
      LOGOUT: '🚪',
      SECURITY_ALERT: '🚨',
      ERROR: '❌',
      API_CALL: '🔗',
      PAYMENT_PROCESS: '💳',
      CONTRACT_SIGN: '📝'
    };
    return icons[actionType as keyof typeof icons] || '📄';
  }
}

// Create global audit log service instance
let auditLogServiceInstance: AuditLogService | null = null;

/**
 * Initialize audit log service
 */
export function initializeAuditLogService(apiBaseUrl?: string): AuditLogService {
  if (!auditLogServiceInstance) {
    auditLogServiceInstance = new AuditLogService(apiBaseUrl);
  }
  return auditLogServiceInstance;
}

/**
 * Get audit log service instance
 */
export function getAuditLogService(): AuditLogService {
  if (!auditLogServiceInstance) {
    auditLogServiceInstance = new AuditLogService();
  }
  return auditLogServiceInstance;
}

export default AuditLogService;