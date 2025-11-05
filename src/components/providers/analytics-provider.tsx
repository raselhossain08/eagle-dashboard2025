
"use client";

import React, { createContext, useContext, useEffect, ReactNode } from 'react';
import { initializeAnalytics, getAnalytics, AnalyticsService } from '@/services/analytics';

interface AnalyticsContextType {
  analytics: AnalyticsService;
  trackEvent: (eventData: any) => Promise<boolean>;
  trackPageView: (additionalData?: any) => Promise<boolean>;
  trackClick: (element: string, additionalData?: any) => Promise<boolean>;
  trackFormSubmission: (formName: string, success?: boolean, additionalData?: any) => Promise<boolean>;
  trackConversion: (conversionType: string, conversionValue?: number, currency?: string, additionalData?: any) => Promise<boolean>;
  trackCustomEvent: (eventName: string, eventCategory?: string, properties?: Record<string, any>, additionalData?: any) => Promise<boolean>;
  trackError: (error: Error | string, context?: string, additionalData?: any) => Promise<boolean>;
}

const AnalyticsContext = createContext<AnalyticsContextType | undefined>(undefined);

interface AnalyticsProviderProps {
  children: ReactNode;
  apiBaseUrl?: string;
  enabled?: boolean;
}

export function AnalyticsProvider({ 
  children, 
  apiBaseUrl = '/api/analytics',
  enabled = true 
}: AnalyticsProviderProps) {
  const analytics = initializeAnalytics(apiBaseUrl);
  
  useEffect(() => {
    // Set tracking state
    analytics.setTracking(enabled);
    
    // Track initial page load
    if (enabled) {
      analytics.trackPageView({
        properties: {
          initialLoad: true,
          timestamp: new Date().toISOString()
        }
      });
    }
  }, [analytics, enabled]);
  
  const contextValue: AnalyticsContextType = {
    analytics,
    trackEvent: analytics.track.bind(analytics),
    trackPageView: analytics.trackPageView.bind(analytics),
    trackClick: analytics.trackClick.bind(analytics),
    trackFormSubmission: analytics.trackFormSubmission.bind(analytics),
    trackConversion: analytics.trackConversion.bind(analytics),
    trackCustomEvent: analytics.trackCustomEvent.bind(analytics),
    trackError: analytics.trackError.bind(analytics)
  };
  
  return (
    <AnalyticsContext.Provider value={contextValue}>
      {children}
    </AnalyticsContext.Provider>
  );
}

export function useAnalytics(): AnalyticsContextType {
  const context = useContext(AnalyticsContext);
  if (context === undefined) {
    throw new Error('useAnalytics must be used within an AnalyticsProvider');
  }
  return context;
}

// Higher-order component for analytics tracking
export function withAnalytics<P extends object>(
  WrappedComponent: React.ComponentType<P>
) {
  return function AnalyticsEnhancedComponent(props: P) {
    const analytics = useAnalytics();
    
    return <WrappedComponent {...props} analytics={analytics} />;
  };
}

// Hook for tracking component lifecycle events
export function useAnalyticsLifecycle(componentName: string) {
  const { trackCustomEvent } = useAnalytics();
  
  useEffect(() => {
    // Track component mount
    trackCustomEvent('Component Mount', 'component_lifecycle', {
      componentName,
      action: 'mount'
    });
    
    return () => {
      // Track component unmount
      trackCustomEvent('Component Unmount', 'component_lifecycle', {
        componentName,
        action: 'unmount'
      });
    };
  }, [componentName, trackCustomEvent]);
}

// Hook for tracking page navigation
export function usePageTracking(pageName?: string) {
  const { trackPageView } = useAnalytics();
  
  useEffect(() => {
    trackPageView({
      properties: {
        pageName: pageName || document.title,
        navigationTimestamp: new Date().toISOString()
      }
    });
  }, [pageName, trackPageView]);
}