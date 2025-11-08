import ApiService from './shared/api.service';

// Types for visitor analytics page
export interface AnalyticsOverviewData {
  metrics: {
    uniqueUsers: { current: number; change: number };
    pageViews: { current: number; change: number };
    totalEvents: { current: number; change: number };
    conversions: { current: number; change: number };
  };
}

export interface TimelineData {
  timestamp: string;
  uniqueUsers: number;
  pageViews: number;
  events: number;
  conversions: number;
}

export interface RealtimeData {
  activeUsers: number;
  recentEvents: Array<{
    eventName: string;
    eventType: string;
    timestamp: string;
  }>;
  pageViewsTimeline: Array<{
    timestamp: string;
    count: number;
  }>;
}

export interface VisitorMetrics {
  totalVisitors: number;
  uniqueVisitors: number;
  pageViews: number;
  bounceRate: number;
  avgSessionDuration: number;
  conversionRate: number;
  topPages: Array<{
    path: string;
    views: number;
    uniqueViews: number;
  }>;
  topReferrers: Array<{
    domain: string;
    visits: number;
  }>;
}

export interface RealTimeMetrics {
  activeUsers: number;
  pageViewsLastHour: number;
  recentEvents: Array<{
    id: string;
    type: string;
    page: string;
    timestamp: string;
    userAgent?: string;
    location?: string;
  }>;
  pageViewsTimeline?: Array<{
    timestamp: string;
    count: number;
  }>;
}

export interface AnalyticsFilters {
  dateFrom?: string;
  dateTo?: string;
  page?: string;
  referrer?: string;
  country?: string;
  device?: string;
}

export class AnalyticsService {
  private static readonly ENDPOINT = '/analytics';

  async getVisitorMetrics(filters?: AnalyticsFilters): Promise<VisitorMetrics> {
    const queryParams = new URLSearchParams();

    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, value.toString());
        }
      });
    }

    const response = await ApiService.get<VisitorMetrics>(
      `${AnalyticsService.ENDPOINT}/visitors?${queryParams}`
    );

    return response;
  }

  async getRealTimeMetrics(): Promise<RealTimeMetrics> {
    const response = await ApiService.get<RealTimeMetrics>(
      `${AnalyticsService.ENDPOINT}/realtime`
    );

    return response;
  }

  async trackPageView(page: string, referrer?: string): Promise<void> {
    await ApiService.post(`${AnalyticsService.ENDPOINT}/pageview`, {
      page,
      referrer,
      timestamp: new Date().toISOString(),
    });
  }

  async trackEvent(eventType: string, data: Record<string, any>): Promise<void> {
    await ApiService.post(`${AnalyticsService.ENDPOINT}/event`, {
      type: eventType,
      data,
      timestamp: new Date().toISOString(),
    });
  }

  async getConversionFunnel(): Promise<Array<{
    step: string;
    users: number;
    conversionRate: number;
  }>> {
    const response = await ApiService.get<Array<{
      step: string;
      users: number;
      conversionRate: number;
    }>>(`${AnalyticsService.ENDPOINT}/funnel`);

    return response;
  }

  async getGeographicData(): Promise<Array<{
    country: string;
    users: number;
    sessions: number;
  }>> {
    const response = await ApiService.get<Array<{
      country: string;
      users: number;
      sessions: number;
    }>>(`${AnalyticsService.ENDPOINT}/geographic`);

    return response;
  }

  async getDeviceAnalytics(): Promise<{
    devices: Array<{ type: string; users: number; percentage: number }>;
    browsers: Array<{ name: string; users: number; percentage: number }>;
    operatingSystems: Array<{ name: string; users: number; percentage: number }>;
  }> {
    const response = await ApiService.get<{
      devices: Array<{ type: string; users: number; percentage: number }>;
      browsers: Array<{ name: string; users: number; percentage: number }>;
      operatingSystems: Array<{ name: string; users: number; percentage: number }>;
    }>(`${AnalyticsService.ENDPOINT}/devices`);

    return response;
  }

  // Utility methods
  formatPercentage(value: number): string {
    return `${(value * 100).toFixed(1)}%`;
  }

  formatDuration(seconds: number): string {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  }

  calculateGrowthRate(current: number, previous: number): number {
    if (previous === 0) return current > 0 ? 1 : 0;
    return (current - previous) / previous;
  }

  // Methods for visitor analytics page
  async getOverviewData(startDate?: string, endDate?: string, filters?: any): Promise<any> {
    const params = new URLSearchParams();

    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    if (filters) {
      Object.keys(filters).forEach(key => {
        if (filters[key] !== undefined && filters[key] !== null) {
          params.append(key, filters[key].toString());
        }
      });
    }

    const queryString = params.toString();
    const endpoint = queryString
      ? `${AnalyticsService.ENDPOINT}/overview?${queryString}`
      : `${AnalyticsService.ENDPOINT}/overview`;

    console.log('📊 Fetching overview data from:', endpoint);

    const response = await ApiService.get<{ success: boolean; data: any }>(endpoint);

    console.log('📈 Overview response:', response);

    return response.data || response;
  }

  async getTimelineData(dateRange: string): Promise<TimelineData[]> {
    const response = await ApiService.get<TimelineData[]>(
      `${AnalyticsService.ENDPOINT}/timeline?dateRange=${dateRange}`
    );

    return response;
  }

  async getRealtimeData(): Promise<any> {
    console.log('⏱️ Fetching realtime data from:', `${AnalyticsService.ENDPOINT}/realtime`);

    const response = await ApiService.get<{ success: boolean; data: any }>(
      `${AnalyticsService.ENDPOINT}/realtime`
    );

    console.log('📡 Realtime response:', response);

    return response.data || response;
  }

  async exportAnalyticsData(
    startDate: string,
    endDate: string,
    format: 'json' | 'csv' = 'json',
    dataTypes: string[] = ['sessions', 'events']
  ): Promise<any> {
    const params = new URLSearchParams({
      startDate,
      endDate,
      format,
      type: dataTypes.join(',')
    });

    const response = await ApiService.get<{ success: boolean; data: any }>(
      `${AnalyticsService.ENDPOINT}/export?${params.toString()}`
    );
    return response.data || response;
  }
}

export const analyticsService = new AnalyticsService();
export default analyticsService;