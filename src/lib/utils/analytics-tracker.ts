import analyticsService from '../services/analytics.service';

// Type definitions
export interface PageViewData {
  sessionId: string;
  userId?: string;
  page: string;
  referrer?: string;
  userAgent?: string;
  deviceType: 'desktop' | 'mobile' | 'tablet';
  trafficSource: 'organic' | 'paid' | 'direct' | 'social' | 'referral';
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
  eventCategory: string;
  eventAction: string;
  eventLabel?: string;
  eventValue?: number;
  page?: string;
  properties?: Record<string, any>;
}

// =================== ANALYTICS TRACKER UTILITY ===================
class AnalyticsTracker {
  private sessionId: string;
  private userId?: string;
  private visitorId: string;
  private isInitialized: boolean = false;

  constructor() {
    this.sessionId = this.generateSessionId();
    this.userId = this.getUserId();
    this.visitorId = this.getVisitorId();
  }

  // =================== INITIALIZATION ===================

  /**
   * Initialize the analytics tracker
   */
  init(userId?: string): void {
    if (userId) {
      this.userId = userId;
      if (typeof window !== 'undefined') {
        localStorage.setItem('userId', userId);
      }
    }

    this.isInitialized = true;
    this.startSession();
    this.setupAutoTracking();

    console.log('Analytics Tracker initialized', {
      sessionId: this.sessionId,
      userId: this.userId,
      visitorId: this.visitorId
    });
  }

  /**
   * Check if tracker is initialized
   */
  isReady(): boolean {
    return this.isInitialized;
  }

  // =================== SESSION MANAGEMENT ===================

  /**
   * Generate a unique session ID
   */
  private generateSessionId(): string {
    return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  /**
   * Get stored user ID
   */
  private getUserId(): string | undefined {
    if (typeof window === 'undefined') return undefined;
    return localStorage.getItem('userId') || undefined;
  }

  /**
   * Get or create visitor ID
   */
  private getVisitorId(): string {
    if (typeof window === 'undefined') return 'visitor_' + Date.now();

    let visitorId = localStorage.getItem('visitorId');
    if (!visitorId) {
      visitorId = 'visitor_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
      localStorage.setItem('visitorId', visitorId);
    }
    return visitorId;
  }

  /**
   * Start tracking session
   */
  private startSession(): void {
    if (typeof window === 'undefined') return;

    // Track initial page view
    this.trackPageView({
      page: window.location.pathname,
      referrer: document.referrer,
      userAgent: navigator.userAgent,
      deviceType: this.getDeviceType(),
      trafficSource: this.getTrafficSource(),
      utm: this.getUTMParams()
    });

    // Set up session end tracking
    window.addEventListener('beforeunload', () => {
      this.endSession();
    });

    // Track session duration
    this.trackSessionDuration();
  }

  /**
   * End tracking session
   */
  private async endSession(): Promise<void> {
    try {
      // Note: Using simplified session end - adjust based on your analytics service API
      console.log('Session ended:', {
        sessionId: this.sessionId,
        endTime: new Date().toISOString(),
        exitPage: typeof window !== 'undefined' ? window.location.pathname : ''
      });
    } catch (error) {
      console.error('Failed to end session:', error);
    }
  }

  // =================== AUTO TRACKING SETUP ===================

  /**
   * Setup automatic tracking for common interactions
   */
  private setupAutoTracking(): void {
    if (typeof window === 'undefined') return;

    // Track page visibility changes
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.trackEvent('page_hidden', {
          eventCategory: 'engagement',
          eventAction: 'visibility_change'
        });
      } else {
        this.trackEvent('page_visible', {
          eventCategory: 'engagement',
          eventAction: 'visibility_change'
        });
      }
    });

    // Track clicks on important elements
    document.addEventListener('click', (event) => {
      const target = event.target as HTMLElement;

      // Track button clicks
      if (target.tagName === 'BUTTON' || target.closest('button')) {
        const button = (target.tagName === 'BUTTON' ? target : target.closest('button')!) as HTMLButtonElement;
        this.trackInteraction(
          button.textContent?.trim() || 'button',
          'click',
          {
            button_type: button.type || 'button',
            button_class: button.className,
            button_id: button.id
          }
        );
      }

      // Track link clicks
      if (target.tagName === 'A' || target.closest('a')) {
        const link = target.tagName === 'A' ? target : target.closest('a')!;
        this.trackInteraction(
          'link',
          'click',
          {
            url: (link as HTMLAnchorElement).href,
            text: link.textContent?.trim(),
            link_class: link.className,
            link_id: link.id
          }
        );
      }

      // Track form submissions
      const inputElement = target as HTMLInputElement;
      if (inputElement.type === 'submit' || (target.closest('form') && target.tagName === 'BUTTON')) {
        const form = target.closest('form')!;
        this.trackEvent('form_submit_attempt', {
          eventCategory: 'form',
          eventAction: 'submit_attempt',
          properties: {
            form_id: form.id,
            form_class: form.className,
            form_action: form.action
          }
        });
      }
    });

    // Track form submissions
    document.addEventListener('submit', (event) => {
      const form = event.target as HTMLFormElement;
      this.trackEvent('form_submit', {
        eventCategory: 'form',
        eventAction: 'submit',
        properties: {
          form_id: form.id,
          form_class: form.className,
          form_action: form.action,
          form_method: form.method
        }
      });
    });

    // Track scroll depth
    this.trackScrollDepth();

    // Track time on page
    this.trackTimeOnPage();

    // Auto-track page changes (for SPAs)
    this.trackPageChanges();
  }

  // =================== DEVICE & BROWSER DETECTION ===================

  /**
   * Get device type based on screen width
   */
  getDeviceType(): 'desktop' | 'mobile' | 'tablet' {
    if (typeof window === 'undefined') return 'desktop';

    const width = window.innerWidth;
    if (width < 768) return 'mobile';
    if (width < 1024) return 'tablet';
    return 'desktop';
  }

  /**
   * Determine traffic source
   */
  getTrafficSource(): 'organic' | 'paid' | 'direct' | 'social' | 'referral' {
    if (typeof window === 'undefined') return 'direct';

    const referrer = document.referrer;
    const utm = this.getUTMParams();

    if (utm.source) {
      return utm.medium === 'cpc' ? 'paid' : (utm.medium as any) || 'referral';
    }

    if (!referrer) return 'direct';

    // Check common search engines
    if (referrer.includes('google.com') || referrer.includes('bing.com') || referrer.includes('yahoo.com')) {
      return 'organic';
    }

    // Check social media platforms
    if (referrer.includes('facebook.com') || referrer.includes('twitter.com') ||
      referrer.includes('linkedin.com') || referrer.includes('instagram.com')) {
      return 'social';
    }

    return 'referral';
  }

  /**
   * Extract UTM parameters from URL
   */
  getUTMParams(): { source?: string; medium?: string; campaign?: string; term?: string; content?: string } {
    if (typeof window === 'undefined') return {};

    const params = new URLSearchParams(window.location.search);
    return {
      source: params.get('utm_source') || undefined,
      medium: params.get('utm_medium') || undefined,
      campaign: params.get('utm_campaign') || undefined,
      term: params.get('utm_term') || undefined,
      content: params.get('utm_content') || undefined
    };
  }

  // =================== CORE TRACKING METHODS ===================

  /**
   * Track page view
   */
  async trackPageView(additionalData?: Partial<PageViewData>): Promise<void> {
    if (!this.isInitialized || typeof window === 'undefined') return;

    try {
      const pageViewData: PageViewData = {
        sessionId: this.sessionId,
        userId: this.userId,
        page: window.location.pathname,
        referrer: document.referrer,
        userAgent: navigator.userAgent,
        deviceType: this.getDeviceType(),
        trafficSource: this.getTrafficSource(),
        utm: this.getUTMParams(),
        ...additionalData
      };

      await analyticsService.trackPageView(pageViewData.page, pageViewData.referrer);
    } catch (error) {
      console.error('Failed to track page view:', error);
    }
  }

  /**
   * Track custom event
   */
  async trackEvent(eventType: string, eventData?: Partial<EventData>): Promise<void> {
    if (!this.isInitialized || typeof window === 'undefined') return;

    try {
      const eventPayload: EventData = {
        sessionId: this.sessionId,
        userId: this.userId,
        eventType,
        eventCategory: eventData?.eventCategory || 'interaction',
        eventAction: eventData?.eventAction || 'action',
        eventLabel: eventData?.eventLabel || '',
        eventValue: eventData?.eventValue || 0,
        page: window.location.pathname,
        properties: eventData?.properties || {},
        ...eventData
      };

      await analyticsService.trackEvent(eventType, {
        category: eventPayload.eventCategory,
        action: eventPayload.eventAction,
        label: eventPayload.eventLabel,
        value: eventPayload.eventValue,
        page: eventPayload.page,
        ...eventPayload.properties
      });
    } catch (error) {
      console.error('Failed to track event:', error);
    }
  }  /**
   * Track user interaction
   */
  async trackInteraction(element: string, action: string, properties?: Record<string, any>): Promise<void> {
    await this.trackEvent('interaction', {
      eventCategory: 'engagement',
      eventAction: action,
      eventLabel: element,
      properties: {
        element,
        action,
        ...properties
      }
    });
  }

  /**
   * Track conversion
   */
  async trackConversion(conversionType: string, value?: number, properties?: Record<string, any>): Promise<void> {
    await this.trackEvent('conversion', {
      eventCategory: 'conversion',
      eventAction: conversionType,
      eventValue: value || 0,
      properties: {
        conversionType,
        conversionValue: value || 0,
        ...properties
      }
    });
  }

  // =================== ADVANCED TRACKING METHODS ===================

  /**
   * Track scroll depth
   */
  private trackScrollDepth(): void {
    if (typeof window === 'undefined') return;

    let maxScroll = 0;
    const milestones = [25, 50, 75, 90, 100];
    const reached = new Set<number>();

    const handleScroll = () => {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrollPercent = Math.round((scrollTop / docHeight) * 100);

      if (scrollPercent > maxScroll) {
        maxScroll = scrollPercent;

        // Track milestones
        milestones.forEach(milestone => {
          if (scrollPercent >= milestone && !reached.has(milestone)) {
            reached.add(milestone);
            this.trackEvent('scroll_depth', {
              eventCategory: 'engagement',
              eventAction: 'scroll',
              eventLabel: `${milestone}%`,
              eventValue: milestone,
              properties: { depth: milestone }
            });
          }
        });
      }
    };

    let ticking = false;
    window.addEventListener('scroll', () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          handleScroll();
          ticking = false;
        });
        ticking = true;
      }
    });
  }

  /**
   * Track time on page
   */
  private trackTimeOnPage(): void {
    if (typeof window === 'undefined') return;

    const startTime = Date.now();
    const intervals = [30, 60, 120, 300]; // 30s, 1m, 2m, 5m
    const tracked = new Set<number>();

    const checkTimeOnPage = () => {
      const timeSpent = Math.round((Date.now() - startTime) / 1000);

      intervals.forEach(interval => {
        if (timeSpent >= interval && !tracked.has(interval)) {
          tracked.add(interval);
          this.trackEvent('time_on_page', {
            eventCategory: 'engagement',
            eventAction: 'time_milestone',
            eventLabel: `${interval}s`,
            eventValue: interval,
            properties: { seconds: interval }
          });
        }
      });
    };

    // Check every 10 seconds
    const timer = setInterval(checkTimeOnPage, 10000);

    // Clear timer on page unload
    window.addEventListener('beforeunload', () => {
      clearInterval(timer);

      // Track final time on page
      const finalTime = Math.round((Date.now() - startTime) / 1000);
      this.trackEvent('page_exit', {
        eventCategory: 'engagement',
        eventAction: 'exit',
        eventValue: finalTime,
        properties: { timeOnPage: finalTime }
      });
    });
  }

  /**
   * Track page changes for SPAs
   */
  private trackPageChanges(): void {
    if (typeof window === 'undefined') return;

    let currentPath = window.location.pathname;

    const checkForRouteChange = () => {
      if (window.location.pathname !== currentPath) {
        const previousPath = currentPath;
        currentPath = window.location.pathname;

        this.trackPageView({
          page: currentPath,
          referrer: previousPath
        });
      }
    };

    // Check for route changes every second
    setInterval(checkForRouteChange, 1000);

    // Also listen for popstate events (back/forward button)
    window.addEventListener('popstate', checkForRouteChange);
  }

  /**
   * Track session duration
   */
  private trackSessionDuration(): void {
    if (typeof window === 'undefined') return;

    const sessionStart = Date.now();

    // Track session duration milestones
    const milestones = [60, 300, 900, 1800]; // 1m, 5m, 15m, 30m
    const tracked = new Set<number>();

    const checkSessionDuration = () => {
      const sessionTime = Math.round((Date.now() - sessionStart) / 1000);

      milestones.forEach(milestone => {
        if (sessionTime >= milestone && !tracked.has(milestone)) {
          tracked.add(milestone);
          this.trackEvent('session_duration', {
            eventCategory: 'engagement',
            eventAction: 'session_milestone',
            eventLabel: `${milestone}s`,
            eventValue: milestone,
            properties: { seconds: milestone }
          });
        }
      });
    };

    // Check every 30 seconds
    const timer = setInterval(checkSessionDuration, 30000);

    // Clear timer on page unload
    window.addEventListener('beforeunload', () => {
      clearInterval(timer);
    });
  }

  // =================== UTILITY METHODS ===================

  /**
   * Get current session information
   */
  getSessionInfo(): { sessionId: string; userId?: string; visitorId: string } {
    return {
      sessionId: this.sessionId,
      userId: this.userId,
      visitorId: this.visitorId
    };
  }

  /**
   * Set user ID (for when user logs in)
   */
  setUserId(userId: string): void {
    this.userId = userId;
    if (typeof window !== 'undefined') {
      localStorage.setItem('userId', userId);
    }
  }

  /**
   * Clear user ID (for when user logs out)
   */
  clearUserId(): void {
    this.userId = undefined;
    if (typeof window !== 'undefined') {
      localStorage.removeItem('userId');
    }
  }

  /**
   * Create a new session
   */
  newSession(): void {
    this.sessionId = this.generateSessionId();
    this.startSession();
  }
}

// Export singleton instance
export const tracker = new AnalyticsTracker();

// Export the class for custom instances
export default AnalyticsTracker;