
"use client";

import React, { createContext, useContext, useEffect, ReactNode } from 'react';
import { analyticsService, AnalyticsService } from '@/lib/services/analytics.service';

interface AnalyticsContextType {
  analytics: typeof analyticsService;
  trackPageView: (page: string, referrer?: string) => Promise<void>;
  trackEvent: (eventType: string, data: Record<string, any>) => Promise<void>;
  trackConversion: (conversionType: string, conversionValue?: number, currency?: string, additionalData?: any) => Promise<void>;
  trackCustomEvent: (eventName: string, eventCategory?: string, properties?: Record<string, any>, additionalData?: any) => Promise<void>;
}

const AnalyticsContext = createContext<AnalyticsContextType | undefined>(undefined);

interface AnalyticsProviderProps {
  children: ReactNode;
  enabled?: boolean;
}

export function AnalyticsProvider({
  children,
  enabled = true
}: AnalyticsProviderProps) {

  useEffect(() => {
    // Track initial page load
    if (enabled && typeof window !== 'undefined') {
      analyticsService.trackPageView(window.location.pathname);
    }
  }, [enabled]);

  const contextValue: AnalyticsContextType = {
    analytics: analyticsService,
    trackPageView: analyticsService.trackPageView.bind(analyticsService),
    trackEvent: analyticsService.trackEvent.bind(analyticsService),
    trackConversion: async (conversionType: string, conversionValue?: number, currency?: string) => {
      // Simplified conversion tracking
      await analyticsService.trackEvent('conversion', {
        conversionType,
        conversionValue,
        currency: currency || 'USD'
      });
    },
    trackCustomEvent: async (eventName: string, eventCategory?: string, properties?: Record<string, any>) => {
      await analyticsService.trackEvent(eventName, {
        category: eventCategory || 'custom',
        ...properties
      });
    }
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
    if (typeof window !== 'undefined') {
      trackPageView(
        window.location.pathname,
        pageName || document.title
      );
    }
  }, [pageName, trackPageView]);
}