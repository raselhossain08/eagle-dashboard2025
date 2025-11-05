import { useState, useEffect, useCallback, useMemo } from 'react';
import { toast } from 'sonner';
import AnalyticsAPIService from '../services/analytics/analytics-api.service';
import type {
  ApiResponse,
  PageViewData,
  EventData,
  SessionUpdateData,
  AnalyticsMetric,
  TrafficSource,
  TopPage,
  DeviceBreakdown,
  ConversionFunnel,
  AnalyticsEvent,
  AnalyticsFilter
} from '../services/analytics/analytics-api.service';

// =================== HOOK TYPES ===================
interface UseAnalyticsOptions {
  autoLoad?: boolean;
  initialTimeRange?: '7d' | '30d' | '90d' | '1y';
  refreshInterval?: number;
}

interface UseRealTimeAnalyticsOptions {
  autoStart?: boolean;
  updateInterval?: number;
}

interface UseAnalyticsTrackerOptions {
  sessionId?: string;
  userId?: string;
  autoTrackPageViews?: boolean;
}

// =================== useAnalytics Hook ===================
export function useAnalytics(options: UseAnalyticsOptions = {}) {
  const { autoLoad = true, initialTimeRange = '30d', refreshInterval } = options;

  const [metrics, setMetrics] = useState<AnalyticsMetric[]>([]);
  const [traffic, setTraffic] = useState<{ sources: TrafficSource[]; total: number }>({ sources: [], total: 0 });
  const [pages, setPages] = useState<{ pages: TopPage[]; total: number }>({ pages: [], total: 0 });
  const [devices, setDevices] = useState<DeviceBreakdown>({ devices: [], browsers: [], operatingSystems: [] });
  const [conversion, setConversion] = useState<ConversionFunnel | null>(null);
  const [events, setEvents] = useState<{ events: AnalyticsEvent[]; summary: any }>({ events: [], summary: {} });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState<string>(initialTimeRange);

  // Fetch analytics dashboard data
  const fetchAnalyticsDashboard = useCallback(async (range?: string) => {
    try {
      setLoading(true);
      setError(null);

      const targetRange = range || timeRange;
      const response = await AnalyticsAPIService.getAnalyticsDashboard(targetRange);

      if (response.success && response.data) {
        setMetrics(response.data.metrics || []);
        setTraffic(response.data.traffic || { sources: [], total: 0 });
        setPages(response.data.pages || { pages: [], total: 0 });
        setDevices(response.data.devices || { devices: [], browsers: [], operatingSystems: [] });
        setConversion(response.data.conversion || null);
        setEvents(response.data.events || { events: [], summary: {} });
      } else {
        throw new Error(response.error || 'Failed to fetch analytics dashboard');
      }
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to fetch analytics dashboard';
      setError(errorMessage);
      console.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [timeRange]);

  // Fetch individual data sections
  const fetchMetrics = useCallback(async (params?: AnalyticsFilter) => {
    try {
      const response = await AnalyticsAPIService.getMetrics({ range: timeRange as any, ...params });
      if (response.success) {
        setMetrics(response.data || []);
        return response.data;
      }
      throw new Error(response.error || 'Failed to fetch metrics');
    } catch (error: any) {
      console.error('Failed to fetch metrics:', error.message);
      return [];
    }
  }, [timeRange]);

  const fetchTrafficSources = useCallback(async (params?: AnalyticsFilter) => {
    try {
      const response = await AnalyticsAPIService.getTrafficSources({ range: timeRange as any, limit: 10, ...params });
      if (response.success) {
        setTraffic(response.data || { sources: [], total: 0 });
        return response.data;
      }
      throw new Error(response.error || 'Failed to fetch traffic sources');
    } catch (error: any) {
      console.error('Failed to fetch traffic sources:', error.message);
      return { sources: [], total: 0 };
    }
  }, [timeRange]);

  const fetchTopPages = useCallback(async (params?: AnalyticsFilter) => {
    try {
      const response = await AnalyticsAPIService.getTopPages({ range: timeRange as any, limit: 20, ...params });
      if (response.success) {
        setPages(response.data || { pages: [], total: 0 });
        return response.data;
      }
      throw new Error(response.error || 'Failed to fetch top pages');
    } catch (error: any) {
      console.error('Failed to fetch top pages:', error.message);
      return { pages: [], total: 0 };
    }
  }, [timeRange]);

  const fetchDeviceBreakdown = useCallback(async (params?: AnalyticsFilter) => {
    try {
      const response = await AnalyticsAPIService.getDeviceBreakdown({ range: timeRange as any, ...params });
      if (response.success) {
        setDevices(response.data || { devices: [], browsers: [], operatingSystems: [] });
        return response.data;
      }
      throw new Error(response.error || 'Failed to fetch device breakdown');
    } catch (error: any) {
      console.error('Failed to fetch device breakdown:', error.message);
      return { devices: [], browsers: [], operatingSystems: [] };
    }
  }, [timeRange]);

  const fetchConversionFunnel = useCallback(async (params?: AnalyticsFilter) => {
    try {
      const response = await AnalyticsAPIService.getConversionFunnel({ range: timeRange as any, ...params });
      if (response.success) {
        setConversion(response.data || null);
        return response.data;
      }
      throw new Error(response.error || 'Failed to fetch conversion funnel');
    } catch (error: any) {
      console.error('Failed to fetch conversion funnel:', error.message);
      return null;
    }
  }, [timeRange]);

  const fetchEvents = useCallback(async (params?: AnalyticsFilter) => {
    try {
      const response = await AnalyticsAPIService.getEvents({ range: timeRange as any, limit: 100, ...params });
      if (response.success) {
        setEvents(response.data || { events: [], summary: {} });
        return response.data;
      }
      throw new Error(response.error || 'Failed to fetch events');
    } catch (error: any) {
      console.error('Failed to fetch events:', error.message);
      return { events: [], summary: {} };
    }
  }, [timeRange]);

  // Search analytics data
  const searchAnalytics = useCallback(async (query: string, filters?: Record<string, any>) => {
    try {
      const response = await AnalyticsAPIService.searchAnalytics(query, filters);
      if (response.success) {
        return response.data;
      }
      throw new Error(response.error || 'Failed to search analytics');
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to search analytics';
      toast.error(errorMessage);
      throw error;
    }
  }, []);

  // Export analytics data
  const exportAnalytics = useCallback(async (params: {
    type: 'pageviews' | 'events' | 'conversions' | 'traffic' | 'all';
    format: 'csv' | 'json' | 'excel';
    dateRange?: string;
    filters?: Record<string, any>;
  }) => {
    try {
      const exportParams = {
        ...params,
        dateRange: params.dateRange || timeRange
      };
      
      const blob = await AnalyticsAPIService.exportAnalytics(exportParams);
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `analytics-${params.type}-${Date.now()}.${params.format}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success('Analytics data exported successfully');
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to export analytics data';
      toast.error(errorMessage);
      throw error;
    }
  }, [timeRange]);

  // Get analytics insights
  const getInsights = useCallback(async (params?: {
    period: 'today' | 'yesterday' | '7days' | '30days';
    compareWith?: 'previous_period' | 'previous_year';
  }) => {
    try {
      const response = await AnalyticsAPIService.getAnalyticsInsights(params);
      if (response.success) {
        return response.data;
      }
      throw new Error(response.error || 'Failed to get insights');
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to get insights';
      toast.error(errorMessage);
      return null;
    }
  }, []);

  // Change time range
  const changeTimeRange = useCallback((newRange: string) => {
    setTimeRange(newRange);
  }, []);

  // Refresh all data
  const refresh = useCallback(() => {
    fetchAnalyticsDashboard();
  }, [fetchAnalyticsDashboard]);

  // Auto-load on mount and time range changes
  useEffect(() => {
    if (autoLoad) {
      fetchAnalyticsDashboard();
    }
  }, [autoLoad, fetchAnalyticsDashboard, timeRange]);

  // Set up refresh interval
  useEffect(() => {
    if (refreshInterval && refreshInterval > 0) {
      const interval = setInterval(refresh, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [refreshInterval, refresh]);

  return {
    // Data
    metrics,
    traffic,
    pages,
    devices,
    conversion,
    events,
    loading,
    error,
    timeRange,

    // Individual fetch methods
    fetchMetrics,
    fetchTrafficSources,
    fetchTopPages,
    fetchDeviceBreakdown,
    fetchConversionFunnel,
    fetchEvents,

    // Actions
    fetchAnalyticsDashboard,
    searchAnalytics,
    exportAnalytics,
    getInsights,
    changeTimeRange,
    refresh
  };
}

// =================== useRealTimeAnalytics Hook ===================
export function useRealTimeAnalytics(options: UseRealTimeAnalyticsOptions = {}) {
  const { autoStart = true, updateInterval = 30000 } = options;

  const [data, setData] = useState<any>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isLive, setIsLive] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch real-time data
  const fetchRealTimeData = useCallback(async () => {
    try {
      setError(null);
      const response = await AnalyticsAPIService.getRealTimeAnalytics();

      if (response.success) {
        setData(response.data);
        setIsConnected(true);
      } else {
        throw new Error(response.error || 'Failed to fetch real-time data');
      }
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to fetch real-time data';
      setError(errorMessage);
      setIsConnected(false);
      console.error('Real-time analytics error:', errorMessage);
    }
  }, []);

  // Start live updates
  const startLive = useCallback(() => {
    setIsLive(true);
    fetchRealTimeData();
  }, [fetchRealTimeData]);

  // Stop live updates
  const stopLive = useCallback(() => {
    setIsLive(false);
  }, []);

  // Toggle live updates
  const toggleLive = useCallback(() => {
    if (isLive) {
      stopLive();
    } else {
      startLive();
    }
  }, [isLive, startLive, stopLive]);

  // Auto-start on mount
  useEffect(() => {
    if (autoStart) {
      startLive();
    }
  }, [autoStart, startLive]);

  // Set up update interval when live
  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isLive && updateInterval > 0) {
      // Initial fetch
      fetchRealTimeData();
      
      // Set up interval
      interval = setInterval(fetchRealTimeData, updateInterval);
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [isLive, updateInterval, fetchRealTimeData]);

  return {
    // Data
    data,
    isConnected,
    isLive,
    error,

    // Actions
    fetchRealTimeData,
    startLive,
    stopLive,
    toggleLive
  };
}

// =================== useAnalyticsTracker Hook ===================
export function useAnalyticsTracker(options: UseAnalyticsTrackerOptions = {}) {
  const { sessionId: providedSessionId, userId: providedUserId, autoTrackPageViews = true } = options;

  const [sessionId] = useState(() => providedSessionId || generateSessionId());
  const [userId] = useState(() => providedUserId || getStoredUserId());
  const [isTracking, setIsTracking] = useState(false);

  // Generate session ID
  function generateSessionId(): string {
    return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  // Get stored user ID
  function getStoredUserId(): string | undefined {
    if (typeof window === 'undefined') return undefined;
    return localStorage.getItem('userId') || undefined;
  }

  // Get device type
  const getDeviceType = useCallback((): 'desktop' | 'mobile' | 'tablet' => {
    if (typeof window === 'undefined') return 'desktop';
    const width = window.innerWidth;
    if (width < 768) return 'mobile';
    if (width < 1024) return 'tablet';
    return 'desktop';
  }, []);

  // Get traffic source
  const getTrafficSource = useCallback((): 'organic' | 'paid' | 'direct' | 'social' | 'referral' => {
    if (typeof window === 'undefined') return 'direct';
    
    const referrer = document.referrer;
    const utm = getUTMParams();
    
    if (utm.source) {
      return utm.medium === 'cpc' ? 'paid' : (utm.medium as any) || 'referral';
    }
    
    if (!referrer) return 'direct';
    
    if (referrer.includes('google.com')) return 'organic';
    if (referrer.includes('facebook.com') || referrer.includes('twitter.com')) return 'social';
    
    return 'referral';
  }, []);

  // Get UTM parameters
  const getUTMParams = useCallback(() => {
    if (typeof window === 'undefined') return {};
    
    const params = new URLSearchParams(window.location.search);
    return {
      source: params.get('utm_source') || undefined,
      medium: params.get('utm_medium') || undefined,
      campaign: params.get('utm_campaign') || undefined,
      term: params.get('utm_term') || undefined,
      content: params.get('utm_content') || undefined
    };
  }, []);

  // Track page view
  const trackPageView = useCallback(async (additionalData?: Partial<PageViewData>) => {
    try {
      const pageViewData: PageViewData = {
        sessionId,
        userId,
        page: window.location.pathname,
        referrer: document.referrer,
        userAgent: navigator.userAgent,
        deviceType: getDeviceType(),
        trafficSource: getTrafficSource(),
        utm: getUTMParams(),
        ...additionalData
      };

      await AnalyticsAPIService.trackPageView(pageViewData);
    } catch (error: any) {
      console.error('Failed to track page view:', error.message);
    }
  }, [sessionId, userId, getDeviceType, getTrafficSource, getUTMParams]);

  // Track event
  const trackEvent = useCallback(async (eventType: string, eventData?: Partial<EventData>) => {
    try {
      const eventPayload: EventData = {
        sessionId,
        userId,
        eventType,
        eventCategory: eventData?.eventCategory || 'interaction',
        eventAction: eventData?.eventAction || 'click',
        eventLabel: eventData?.eventLabel || '',
        eventValue: eventData?.eventValue || 0,
        page: window.location.pathname,
        properties: eventData?.properties || {},
        ...eventData
      };

      await AnalyticsAPIService.trackEvent(eventPayload);
    } catch (error: any) {
      console.error('Failed to track event:', error.message);
    }
  }, [sessionId, userId]);

  // Track conversion
  const trackConversion = useCallback(async (conversionType: string, value?: number, properties?: Record<string, any>) => {
    try {
      await AnalyticsAPIService.trackConversion({
        sessionId,
        userId,
        conversionType,
        value,
        properties
      });
    } catch (error: any) {
      console.error('Failed to track conversion:', error.message);
    }
  }, [sessionId, userId]);

  // Track interaction
  const trackInteraction = useCallback(async (element: string, action: string, properties?: Record<string, any>) => {
    try {
      await AnalyticsAPIService.trackInteraction({
        sessionId,
        userId,
        element,
        action,
        page: window.location.pathname,
        properties
      });
    } catch (error: any) {
      console.error('Failed to track interaction:', error.message);
    }
  }, [sessionId, userId]);

  // Update session
  const updateSession = useCallback(async (sessionData: Partial<SessionUpdateData['data']>) => {
    try {
      await AnalyticsAPIService.updateSession({
        sessionId,
        action: 'update',
        data: sessionData
      });
    } catch (error: any) {
      console.error('Failed to update session:', error.message);
    }
  }, [sessionId]);

  // End session
  const endSession = useCallback(async () => {
    try {
      await AnalyticsAPIService.updateSession({
        sessionId,
        action: 'end',
        data: {
          endTime: new Date().toISOString(),
          exitPage: window.location.pathname
        }
      });
    } catch (error: any) {
      console.error('Failed to end session:', error.message);
    }
  }, [sessionId]);

  // Start tracking
  const startTracking = useCallback(() => {
    setIsTracking(true);
    if (autoTrackPageViews) {
      trackPageView();
    }
  }, [autoTrackPageViews, trackPageView]);

  // Stop tracking
  const stopTracking = useCallback(() => {
    setIsTracking(false);
    endSession();
  }, [endSession]);

  // Auto-track page views on route changes
  useEffect(() => {
    if (!isTracking || !autoTrackPageViews) return;

    let currentPath = window.location.pathname;

    const checkForRouteChange = () => {
      if (window.location.pathname !== currentPath) {
        currentPath = window.location.pathname;
        trackPageView();
      }
    };

    // Check for route changes every second
    const interval = setInterval(checkForRouteChange, 1000);

    return () => clearInterval(interval);
  }, [isTracking, autoTrackPageViews, trackPageView]);

  // Auto-start tracking on mount
  useEffect(() => {
    startTracking();

    // End session on page unload
    const handleBeforeUnload = () => {
      endSession();
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      stopTracking();
    };
  }, [startTracking, stopTracking, endSession]);

  return {
    // State
    sessionId,
    userId,
    isTracking,

    // Actions
    trackPageView,
    trackEvent,
    trackConversion,
    trackInteraction,
    updateSession,
    endSession,
    startTracking,
    stopTracking
  };
}

// =================== useBatchAnalytics Hook ===================
export function useBatchAnalytics() {
  const [events, setEvents] = useState<EventData[]>([]);
  const [isBatching, setIsBatching] = useState(false);

  // Add event to batch
  const addEventToBatch = useCallback((eventData: EventData) => {
    setEvents(prev => [...prev, eventData]);
  }, []);

  // Send batch
  const sendBatch = useCallback(async () => {
    if (events.length === 0) return;

    try {
      setIsBatching(true);
      await AnalyticsAPIService.trackBatchEvents(events);
      setEvents([]);
    } catch (error: any) {
      console.error('Failed to send event batch:', error.message);
    } finally {
      setIsBatching(false);
    }
  }, [events]);

  // Clear batch
  const clearBatch = useCallback(() => {
    setEvents([]);
  }, []);

  // Auto-send batch when it reaches a certain size
  useEffect(() => {
    if (events.length >= 10) { // Send when we have 10 events
      sendBatch();
    }
  }, [events.length, sendBatch]);

  // Auto-send batch every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      if (events.length > 0) {
        sendBatch();
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [events.length, sendBatch]);

  return {
    events,
    isBatching,
    addEventToBatch,
    sendBatch,
    clearBatch
  };
}