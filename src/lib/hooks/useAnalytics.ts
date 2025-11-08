/**
 * Analytics Hooks
 * Custom React hooks for analytics functionality
 */

import { useState, useEffect, useCallback } from 'react';
import { analyticsService } from '../services/analytics.service';

// =================== useAnalyticsData Hook ===================
/**
 * Hook for fetching and managing analytics dashboard data
 */
export function useAnalyticsData(timeRange: '7d' | '30d' | '90d' = '30d') {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const endDate = new Date();
      const startDate = new Date();
      
      switch (timeRange) {
        case '7d':
          startDate.setDate(endDate.getDate() - 7);
          break;
        case '30d':
          startDate.setDate(endDate.getDate() - 30);
          break;
        case '90d':
          startDate.setDate(endDate.getDate() - 90);
          break;
      }

      const response = await analyticsService.getOverviewData(
        startDate.toISOString(),
        endDate.toISOString()
      );

      setData(response);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch analytics data');
      console.error('Analytics data fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, [timeRange]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    data,
    loading,
    error,
    refetch: fetchData
  };
}

// =================== useRealtimeAnalytics Hook ===================
/**
 * Hook for real-time analytics data with auto-refresh
 */
export function useRealtimeAnalytics(refreshInterval: number = 30000) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await analyticsService.getRealtimeData();
      setData(response);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch realtime data');
      console.error('Realtime data fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();

    const interval = setInterval(fetchData, refreshInterval);

    return () => clearInterval(interval);
  }, [fetchData, refreshInterval]);

  return {
    data,
    loading,
    error,
    refetch: fetchData
  };
}

// =================== useAnalyticsTracking Hook ===================
/**
 * Hook for tracking analytics events
 */
export function useAnalyticsTracking() {
  const trackPageView = useCallback(async (page: string, referrer?: string) => {
    try {
      await analyticsService.trackPageView(page, referrer);
    } catch (error) {
      console.error('Failed to track page view:', error);
    }
  }, []);

  const trackEvent = useCallback(async (
    eventType: string,
    data: Record<string, any>
  ) => {
    try {
      await analyticsService.trackEvent(eventType, data);
    } catch (error) {
      console.error('Failed to track event:', error);
    }
  }, []);

  const trackConversion = useCallback(async (
    conversionType: string,
    value?: number,
    properties?: Record<string, any>
  ) => {
    try {
      await analyticsService.trackEvent('conversion', {
        conversionType,
        value,
        ...properties
      });
    } catch (error) {
      console.error('Failed to track conversion:', error);
    }
  }, []);

  return {
    trackPageView,
    trackEvent,
    trackConversion
  };
}

// =================== useExportAnalytics Hook ===================
/**
 * Hook for exporting analytics data
 */
export function useExportAnalytics() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const exportData = useCallback(async (
    startDate: string,
    endDate: string,
    format: 'json' | 'csv' = 'json',
    dataTypes: string[] = ['sessions', 'events']
  ) => {
    try {
      setLoading(true);
      setError(null);

      const response = await analyticsService.exportAnalyticsData(
        startDate,
        endDate,
        format,
        dataTypes
      );

      // Handle download
      const blob = new Blob([JSON.stringify(response, null, 2)], {
        type: format === 'json' ? 'application/json' : 'text/csv'
      });
      
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `analytics-export-${new Date().toISOString().split('T')[0]}.${format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      return response;
    } catch (err: any) {
      setError(err.message || 'Failed to export analytics data');
      console.error('Analytics export error:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    exportData,
    loading,
    error
  };
}

// Default export with all hooks
export default {
  useAnalyticsData,
  useRealtimeAnalytics,
  useAnalyticsTracking,
  useExportAnalytics
};
