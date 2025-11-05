import ApiService from '../shared/api.service';

// =================== ANALYTICS RESPONSE TYPES ===================
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

// =================== TRACKING DATA TYPES ===================
export interface PageViewData {
  sessionId: string;
  userId?: string;
  page: string;
  referrer?: string;
  userAgent?: string;
  deviceType?: 'desktop' | 'mobile' | 'tablet';
  trafficSource?: 'organic' | 'paid' | 'direct' | 'social' | 'referral';
  duration?: number;
  utm?: {
    source?: string;
    medium?: string;
    campaign?: string;
    term?: string;
    content?: string;
  };
}

export interface EventData {
  sessionId: string;
  userId?: string;
  eventType: string;
  eventCategory?: string;
  eventAction?: string;
  eventLabel?: string;
  eventValue?: number;
  page?: string;
  properties?: Record<string, any>;
}

export interface SessionUpdateData {
  sessionId: string;
  action: 'update' | 'end';
  data?: {
    endTime?: string;
    exitPage?: string;
    totalEvents?: number;
    conversions?: string[];
  };
}

// =================== ANALYTICS METRIC TYPES ===================
export interface AnalyticsMetric {
  title: string;
  value: string;
  change: string;
  trend: 'up' | 'down';
  icon: string;
  color: string;
}

export interface TrafficSource {
  name: string;
  visitors: number;
  sessions: number;
  bounceRate: number;
  avgSessionDuration: number;
  conversionRate: number;
  percentage: number;
}

export interface TopPage {
  page: string;
  title: string;
  views: number;
  uniqueViews: number;
  avgTimeOnPage: number;
  bounceRate: number;
  exitRate: number;
  entrances: number;
  conversionRate: number;
}

export interface DeviceBreakdown {
  devices: Array<{
    type: 'desktop' | 'mobile' | 'tablet';
    visitors: number;
    sessions: number;
    percentage: number;
    bounceRate: number;
    conversionRate: number;
  }>;
  browsers: Array<{
    name: string;
    percentage: number;
  }>;
  operatingSystems: Array<{
    name: string;
    percentage: number;
  }>;
}

export interface ConversionFunnel {
  funnel: {
    id: string;
    name: string;
    totalUsers: number;
    completions: number;
    conversionRate: number;
  };
  steps: Array<{
    id: string;
    name: string;
    users: number;
    completions: number;
    dropoffs: number;
    conversionRate: number;
    dropoffRate: number;
  }>;
}

export interface AnalyticsEvent {
  eventName: string;
  category: string;
  count: number;
  uniqueUsers: number;
  totalValue: number;
  avgValue: number;
  percentage: number;
}

export interface AnalyticsFilter {
  range?: '7d' | '30d' | '90d' | '1y';
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
  category?: string;
  funnelId?: string;
}

// =================== ANALYTICS API SERVICE CLASS ===================
class AnalyticsAPIService {
  private readonly baseEndpoint = '/analytics';

  // ===================== PUBLIC TRACKING APIs (No Authentication) =====================

  /**
   * Track page view (Public)
   */
  async trackPageView(pageViewData: PageViewData): Promise<ApiResponse> {
    try {
      const response = await ApiService.post<ApiResponse>(
        `${this.baseEndpoint}/track/pageview`,
        pageViewData,
        false // No auth required
      );
      return response;
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * Track custom event (Public)
   */
  async trackEvent(eventData: EventData): Promise<ApiResponse> {
    try {
      const response = await ApiService.post<ApiResponse>(
        `${this.baseEndpoint}/track/event`,
        eventData,
        false // No auth required
      );
      return response;
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * Update session (Public)
   */
  async updateSession(sessionData: SessionUpdateData): Promise<ApiResponse> {
    try {
      const response = await ApiService.post<ApiResponse>(
        `${this.baseEndpoint}/track/session`,
        sessionData,
        false // No auth required
      );
      return response;
    } catch (error) {
      return this.handleError(error);
    }
  }

  // ===================== PROTECTED ANALYTICS APIs (JWT Authentication Required) =====================

  /**
   * Get analytics metrics (Protected)
   */
  async getMetrics(params?: AnalyticsFilter): Promise<ApiResponse<AnalyticsMetric[]>> {
    try {
      const queryString = params ? this.buildQueryString(params) : '';
      const response = await ApiService.get<ApiResponse<AnalyticsMetric[]>>(
        `${this.baseEndpoint}/metrics${queryString}`
      );
      return response;
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * Get traffic sources (Protected)
   */
  async getTrafficSources(params?: AnalyticsFilter): Promise<ApiResponse<{ sources: TrafficSource[]; total: number }>> {
    try {
      const queryString = params ? this.buildQueryString(params) : '';
      const response = await ApiService.get<ApiResponse<{ sources: TrafficSource[]; total: number }>>(
        `${this.baseEndpoint}/traffic${queryString}`
      );
      return response;
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * Get top pages (Protected)
   */
  async getTopPages(params?: AnalyticsFilter): Promise<ApiResponse<{ pages: TopPage[]; total: number }>> {
    try {
      const queryString = params ? this.buildQueryString(params) : '';
      const response = await ApiService.get<ApiResponse<{ pages: TopPage[]; total: number }>>(
        `${this.baseEndpoint}/pages${queryString}`
      );
      return response;
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * Get device breakdown (Protected)
   */
  async getDeviceBreakdown(params?: AnalyticsFilter): Promise<ApiResponse<DeviceBreakdown>> {
    try {
      const queryString = params ? this.buildQueryString(params) : '';
      const response = await ApiService.get<ApiResponse<DeviceBreakdown>>(
        `${this.baseEndpoint}/devices${queryString}`
      );
      return response;
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * Get conversion funnel (Protected)
   */
  async getConversionFunnel(params?: AnalyticsFilter): Promise<ApiResponse<ConversionFunnel>> {
    try {
      const queryString = params ? this.buildQueryString(params) : '';
      const response = await ApiService.get<ApiResponse<ConversionFunnel>>(
        `${this.baseEndpoint}/conversion${queryString}`
      );
      return response;
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * Get events data (Protected)
   */
  async getEvents(params?: AnalyticsFilter): Promise<ApiResponse<{ events: AnalyticsEvent[]; summary: any }>> {
    try {
      const queryString = params ? this.buildQueryString(params) : '';
      const response = await ApiService.get<ApiResponse<{ events: AnalyticsEvent[]; summary: any }>>(
        `${this.baseEndpoint}/events${queryString}`
      );
      return response;
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * Get real-time analytics (Protected)
   */
  async getRealTimeAnalytics(): Promise<ApiResponse> {
    try {
      const response = await ApiService.get<ApiResponse>(
        `${this.baseEndpoint}/realtime`
      );
      return response;
    } catch (error) {
      return this.handleError(error);
    }
  }

  // ===================== ANALYTICS DASHBOARD METHODS =====================

  /**
   * Get complete analytics dashboard data (Protected)
   */
  async getAnalyticsDashboard(timeRange: string = '30d'): Promise<ApiResponse> {
    try {
      const [metrics, traffic, pages, devices, conversion, events] = await Promise.all([
        this.getMetrics({ range: timeRange as any }),
        this.getTrafficSources({ range: timeRange as any, limit: 10 }),
        this.getTopPages({ range: timeRange as any, limit: 20 }),
        this.getDeviceBreakdown({ range: timeRange as any }),
        this.getConversionFunnel({ range: timeRange as any }),
        this.getEvents({ range: timeRange as any, limit: 100 })
      ]);

      return {
        success: true,
        data: {
          metrics: metrics.data || [],
          traffic: traffic.data || { sources: [], total: 0 },
          pages: pages.data || { pages: [], total: 0 },
          devices: devices.data || { devices: [], browsers: [], operatingSystems: [] },
          conversion: conversion.data || { funnel: { id: '', name: '', totalUsers: 0, completions: 0, conversionRate: 0 }, steps: [] },
          events: events.data || { events: [], summary: {} }
        },
        message: 'Analytics dashboard data retrieved successfully'
      };
    } catch (error) {
      return this.handleError(error);
    }
  }

  // ===================== BATCH TRACKING METHODS =====================

  /**
   * Track multiple events in a batch (Public)
   */
  async trackBatchEvents(events: EventData[]): Promise<ApiResponse> {
    try {
      const response = await ApiService.post<ApiResponse>(
        `${this.baseEndpoint}/track/batch`,
        { events },
        false // No auth required
      );
      return response;
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * Track conversion (Public)
   */
  async trackConversion(conversionData: {
    sessionId: string;
    userId?: string;
    conversionType: string;
    value?: number;
    properties?: Record<string, any>;
  }): Promise<ApiResponse> {
    try {
      const eventData: EventData = {
        sessionId: conversionData.sessionId,
        userId: conversionData.userId,
        eventType: 'conversion',
        eventCategory: 'conversion',
        eventAction: conversionData.conversionType,
        eventValue: conversionData.value || 0,
        properties: {
          conversionType: conversionData.conversionType,
          conversionValue: conversionData.value || 0,
          ...conversionData.properties
        }
      };

      return this.trackEvent(eventData);
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * Track user interaction (Public)
   */
  async trackInteraction(interactionData: {
    sessionId: string;
    userId?: string;
    element: string;
    action: string;
    page: string;
    properties?: Record<string, any>;
  }): Promise<ApiResponse> {
    try {
      const eventData: EventData = {
        sessionId: interactionData.sessionId,
        userId: interactionData.userId,
        eventType: 'interaction',
        eventCategory: 'engagement',
        eventAction: interactionData.action,
        eventLabel: interactionData.element,
        page: interactionData.page,
        properties: {
          element: interactionData.element,
          ...interactionData.properties
        }
      };

      return this.trackEvent(eventData);
    } catch (error) {
      return this.handleError(error);
    }
  }

  // ===================== ANALYTICS EXPORT METHODS =====================

  /**
   * Export analytics data (Protected)
   */
  async exportAnalytics(params: {
    type: 'pageviews' | 'events' | 'conversions' | 'traffic' | 'all';
    format: 'csv' | 'json' | 'excel';
    dateRange: string;
    filters?: Record<string, any>;
  }): Promise<Blob> {
    try {
      const queryString = this.buildQueryString(params);
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}${this.baseEndpoint}/export${queryString}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${ApiService.getAuthToken()}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to export analytics data');
      }

      return await response.blob();
    } catch (error) {
      console.error('Export analytics error:', error);
      throw error;
    }
  }

  // ===================== ANALYTICS FILTERING AND SEARCH =====================

  /**
   * Search analytics data (Protected)
   */
  async searchAnalytics(query: string, filters?: Record<string, any>): Promise<ApiResponse> {
    try {
      const searchParams = { search: query, ...filters };
      const queryString = this.buildQueryString(searchParams);
      const response = await ApiService.get<ApiResponse>(
        `${this.baseEndpoint}/search${queryString}`
      );
      return response;
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * Get analytics insights (Protected)
   */
  async getAnalyticsInsights(params?: {
    period: 'today' | 'yesterday' | '7days' | '30days';
    compareWith?: 'previous_period' | 'previous_year';
  }): Promise<ApiResponse> {
    try {
      const queryString = params ? this.buildQueryString(params) : '';
      const response = await ApiService.get<ApiResponse>(
        `${this.baseEndpoint}/insights${queryString}`
      );
      return response;
    } catch (error) {
      return this.handleError(error);
    }
  }

  // ===================== HELPER METHODS =====================

  /**
   * Build query string from parameters
   */
  private buildQueryString(params: Record<string, any>): string {
    const searchParams = new URLSearchParams();
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        if (Array.isArray(value)) {
          value.forEach(v => searchParams.append(key, v.toString()));
        } else {
          searchParams.append(key, value.toString());
        }
      }
    });
    
    const queryString = searchParams.toString();
    return queryString ? `?${queryString}` : '';
  }

  /**
   * Handle API errors
   */
  private handleError(error: any): ApiResponse {
    console.error('Analytics API Error:', error);
    
    if (error instanceof Error) {
      return {
        success: false,
        error: error.message,
        message: 'Analytics operation failed'
      };
    }
    
    if (typeof error === 'string') {
      return {
        success: false,
        error: error,
        message: 'Analytics operation failed'
      };
    }
    
    if (error?.message) {
      return {
        success: false,
        error: error.message,
        message: 'Analytics operation failed'
      };
    }
    
    return {
      success: false,
      error: 'An unexpected error occurred',
      message: 'Analytics operation failed'
    };
  }
}

// Export singleton instance
export default new AnalyticsAPIService();