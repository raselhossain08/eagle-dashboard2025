// Analytics Service for Frontend Event Tracking
// Handles event tracking, UTM parameter capture, and device detection

interface AnalyticsEventData {
  eventType: string;
  eventCategory: string;
  eventName: string;
  eventDescription?: string;
  properties?: Record<string, any>;
  page?: {
    url?: string;
    path?: string;
    title?: string;
    referrer?: string;
    search?: string;
  };
  utm?: {
    source?: string;
    medium?: string;
    campaign?: string;
    term?: string;
    content?: string;
    id?: string;
  };
  device?: {
    type?: string;
    browser?: {
      name?: string;
      version?: string;
    };
    os?: {
      name?: string;
      version?: string;
    };
    screen?: {
      width?: number;
      height?: number;
      pixelRatio?: number;
    };
    viewport?: {
      width?: number;
      height?: number;
    };
    userAgent?: string;
    language?: string;
    timezone?: string;
    cookieEnabled?: boolean;
  };
  session?: {
    sessionId?: string;
    isNewSession?: boolean;
  };
  conversion?: {
    isConversion?: boolean;
    conversionType?: string;
    conversionValue?: number;
    currency?: string;
  };
  performance?: {
    pageLoadTime?: number;
    domContentLoaded?: number;
    firstPaint?: number;
    firstContentfulPaint?: number;
  };
}

class AnalyticsService {
  private sessionId: string;
  private isNewSession: boolean;
  private apiBaseUrl: string;
  private batchQueue: AnalyticsEventData[] = [];
  private batchSize: number = 10;
  private batchTimeout: number = 5000; // 5 seconds
  private batchTimer: NodeJS.Timeout | null = null;
  private isTracking: boolean = true;
  
  constructor(apiBaseUrl: string = '/api/analytics') {
    this.apiBaseUrl = apiBaseUrl;
    this.sessionId = this.getOrCreateSessionId();
    this.isNewSession = this.checkIfNewSession();
    
    // Initialize performance tracking
    this.initializePerformanceTracking();
    
    // Initialize automatic tracking
    this.initializeAutoTracking();
    
    // Track page view on initialization (only in browser)
    if (typeof window !== 'undefined') {
      this.trackPageView();
    }
  }
  
  // ===================== CORE TRACKING METHODS =====================
  
  /**
   * Track a single event
   */
  async track(eventData: Partial<AnalyticsEventData>): Promise<boolean> {
    if (!this.isTracking) return false;
    
    try {
      const enrichedEvent = this.enrichEventData(eventData);
      
      // Add to batch queue
      this.batchQueue.push(enrichedEvent);
      
      // Process batch if queue is full or force immediate send for important events
      if (this.batchQueue.length >= this.batchSize || eventData.eventType === 'conversion') {
        await this.processBatch();
      } else {
        this.scheduleBatchProcess();
      }
      
      return true;
    } catch (error) {
      console.error('Analytics tracking error:', error);
      return false;
    }
  }
  
  /**
   * Track page view
   */
  async trackPageView(additionalData?: Partial<AnalyticsEventData>): Promise<boolean> {
    const pathname = typeof window !== 'undefined' ? window.location.pathname : '/';
    return this.track({
      eventType: 'page_view',
      eventCategory: 'page_navigation',
      eventName: 'Page View',
      eventDescription: `Page view for ${pathname}`,
      ...additionalData
    });
  }
  
  /**
   * Track click events
   */
  async trackClick(element: string, additionalData?: Partial<AnalyticsEventData>): Promise<boolean> {
    return this.track({
      eventType: 'click',
      eventCategory: 'user_interaction',
      eventName: 'Click',
      eventDescription: `Click on ${element}`,
      properties: {
        element,
        ...additionalData?.properties
      },
      ...additionalData
    });
  }
  
  /**
   * Track form submissions
   */
  async trackFormSubmission(formName: string, success: boolean = true, additionalData?: Partial<AnalyticsEventData>): Promise<boolean> {
    return this.track({
      eventType: 'form_submission',
      eventCategory: 'form_activity',
      eventName: 'Form Submission',
      eventDescription: `Form submission: ${formName}`,
      properties: {
        formName,
        success,
        ...additionalData?.properties
      },
      ...additionalData
    });
  }
  
  /**
   * Track conversions
   */
  async trackConversion(
    conversionType: string, 
    conversionValue: number = 0, 
    currency: string = 'USD',
    additionalData?: Partial<AnalyticsEventData>
  ): Promise<boolean> {
    return this.track({
      eventType: 'conversion',
      eventCategory: 'conversion',
      eventName: 'Conversion',
      eventDescription: `Conversion: ${conversionType}`,
      conversion: {
        isConversion: true,
        conversionType,
        conversionValue,
        currency
      },
      ...additionalData
    });
  }
  
  /**
   * Track custom events
   */
  async trackCustomEvent(
    eventName: string, 
    eventCategory: string = 'custom',
    properties?: Record<string, any>,
    additionalData?: Partial<AnalyticsEventData>
  ): Promise<boolean> {
    return this.track({
      eventType: 'custom',
      eventCategory,
      eventName,
      eventDescription: `Custom event: ${eventName}`,
      properties,
      ...additionalData
    });
  }
  
  /**
   * Track errors
   */
  async trackError(
    error: Error | string, 
    context?: string,
    additionalData?: Partial<AnalyticsEventData>
  ): Promise<boolean> {
    const errorMessage = typeof error === 'string' ? error : error.message;
    const errorStack = typeof error === 'object' ? error.stack : undefined;
    
    return this.track({
      eventType: 'error',
      eventCategory: 'error_tracking',
      eventName: 'Client Error',
      eventDescription: errorMessage,
      properties: {
        errorMessage,
        errorStack,
        context,
        ...additionalData?.properties
      },
      ...additionalData
    });
  }
  
  // ===================== BATCH PROCESSING =====================
  
  /**
   * Process queued events in batch
   */
  private async processBatch(): Promise<void> {
    if (this.batchQueue.length === 0) return;
    
    const eventsToSend = [...this.batchQueue];
    this.batchQueue = [];
    
    if (this.batchTimer) {
      clearTimeout(this.batchTimer);
      this.batchTimer = null;
    }
    
    try {
      const response = await fetch(`${this.apiBaseUrl}/events/batch`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': this.getAuthToken() || ''
        },
        body: JSON.stringify({ events: eventsToSend })
      });
      
      if (!response.ok) {
        throw new Error(`Batch tracking failed: ${response.status}`);
      }
    } catch (error) {
      console.error('Batch analytics error:', error);
      // Re-queue events on failure (with limit to prevent infinite growth)
      if (this.batchQueue.length < 50) {
        this.batchQueue.unshift(...eventsToSend);
      }
    }
  }
  
  /**
   * Schedule batch processing
   */
  private scheduleBatchProcess(): void {
    if (this.batchTimer) return;
    
    this.batchTimer = setTimeout(() => {
      this.processBatch();
    }, this.batchTimeout);
  }
  
  // ===================== DATA ENRICHMENT =====================
  
  /**
   * Enrich event data with automatic context
   */
  private enrichEventData(eventData: Partial<AnalyticsEventData>): AnalyticsEventData {
    const enriched: AnalyticsEventData = {
      eventType: eventData.eventType || 'custom',
      eventCategory: eventData.eventCategory || 'user_interaction',
      eventName: eventData.eventName || 'Unknown Event',
      eventDescription: eventData.eventDescription,
      properties: eventData.properties || {},
      page: {
        ...this.getPageInfo(),
        ...eventData.page
      },
      utm: {
        ...this.getUTMParameters(),
        ...eventData.utm
      },
      device: {
        ...this.getDeviceInfo(),
        ...eventData.device
      },
      session: {
        sessionId: this.sessionId,
        isNewSession: this.isNewSession,
        ...eventData.session
      },
      conversion: eventData.conversion,
      performance: {
        ...this.getPerformanceMetrics(),
        ...eventData.performance
      }
    };
    
    return enriched;
  }
  
  /**
   * Get page information
   */
  private getPageInfo() {
    if (typeof window === 'undefined' || typeof document === 'undefined') {
      return {
        url: '',
        path: '/',
        title: '',
        referrer: undefined,
        search: undefined
      };
    }
    
    return {
      url: window.location.href,
      path: window.location.pathname,
      title: document.title,
      referrer: document.referrer || undefined,
      search: window.location.search || undefined
    };
  }
  
  /**
   * Extract UTM parameters from URL
   */
  private getUTMParameters() {
    if (typeof window === 'undefined') {
      return {
        source: undefined,
        medium: undefined,
        campaign: undefined,
        term: undefined,
        content: undefined
      };
    }
    
    const urlParams = new URLSearchParams(window.location.search);
    const utm = {
      source: urlParams.get('utm_source') || undefined,
      medium: urlParams.get('utm_medium') || undefined,
      campaign: urlParams.get('utm_campaign') || undefined,
      term: urlParams.get('utm_term') || undefined,
      content: urlParams.get('utm_content') || undefined,
      id: urlParams.get('utm_id') || undefined
    };
    
    // Only return if at least one UTM parameter exists
    return Object.values(utm).some(value => value !== undefined) ? utm : undefined;
  }
  
  /**
   * Get device and browser information
   */
  private getDeviceInfo() {
    if (typeof window === 'undefined' || typeof navigator === 'undefined') {
      return {
        type: 'unknown',
        browser: { name: 'unknown', version: '' },
        os: { name: 'unknown', version: '' },
        screen: { width: 0, height: 0, pixelRatio: 1 },
        viewport: { width: 0, height: 0 },
        userAgent: '',
        language: 'en',
        timezone: 'UTC',
        cookieEnabled: false
      };
    }
    
    const userAgent = navigator.userAgent;
    
    return {
      type: this.detectDeviceType(),
      browser: this.getBrowserInfo(),
      os: this.getOSInfo(),
      screen: {
        width: screen.width,
        height: screen.height,
        pixelRatio: window.devicePixelRatio
      },
      viewport: {
        width: window.innerWidth,
        height: window.innerHeight
      },
      userAgent,
      language: navigator.language,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      cookieEnabled: navigator.cookieEnabled
    };
  }
  
  /**
   * Detect device type
   */
  private detectDeviceType(): string {
    if (typeof navigator === 'undefined') {
      return 'unknown';
    }
    
    const userAgent = navigator.userAgent.toLowerCase();
    
    if (/(tablet|ipad|playbook|silk)|(android(?!.*mobile))/i.test(userAgent)) {
      return 'tablet';
    }
    
    if (/mobile|iphone|ipod|android|blackberry|opera|mini|windows\sce|palm|smartphone|iemobile/i.test(userAgent)) {
      return 'mobile';
    }
    
    return 'desktop';
  }
  
  /**
   * Get browser information
   */
  private getBrowserInfo() {
    if (typeof navigator === 'undefined') {
      return { name: 'unknown', version: '' };
    }
    
    const userAgent = navigator.userAgent;
    let browserName = 'Unknown';
    let browserVersion = 'Unknown';
    
    if (userAgent.includes('Chrome')) {
      browserName = 'Chrome';
      const match = userAgent.match(/Chrome\/([0-9.]+)/);
      browserVersion = match ? match[1] : 'Unknown';
    } else if (userAgent.includes('Firefox')) {
      browserName = 'Firefox';
      const match = userAgent.match(/Firefox\/([0-9.]+)/);
      browserVersion = match ? match[1] : 'Unknown';
    } else if (userAgent.includes('Safari') && !userAgent.includes('Chrome')) {
      browserName = 'Safari';
      const match = userAgent.match(/Version\/([0-9.]+)/);
      browserVersion = match ? match[1] : 'Unknown';
    } else if (userAgent.includes('Edge')) {
      browserName = 'Edge';
      const match = userAgent.match(/Edge\/([0-9.]+)/);
      browserVersion = match ? match[1] : 'Unknown';
    }
    
    return { name: browserName, version: browserVersion };
  }
  
  /**
   * Get OS information
   */
  private getOSInfo() {
    if (typeof navigator === 'undefined') {
      return { name: 'unknown', version: '' };
    }
    
    const userAgent = navigator.userAgent;
    let osName = 'Unknown';
    let osVersion = 'Unknown';
    
    if (userAgent.includes('Windows')) {
      osName = 'Windows';
      const match = userAgent.match(/Windows NT ([0-9.]+)/);
      osVersion = match ? match[1] : 'Unknown';
    } else if (userAgent.includes('Mac')) {
      osName = 'macOS';
      const match = userAgent.match(/Mac OS X ([0-9_.]+)/);
      osVersion = match ? match[1].replace(/_/g, '.') : 'Unknown';
    } else if (userAgent.includes('Linux')) {
      osName = 'Linux';
    } else if (userAgent.includes('Android')) {
      osName = 'Android';
      const match = userAgent.match(/Android ([0-9.]+)/);
      osVersion = match ? match[1] : 'Unknown';
    } else if (userAgent.includes('iPhone') || userAgent.includes('iPad')) {
      osName = 'iOS';
      const match = userAgent.match(/OS ([0-9_.]+)/);
      osVersion = match ? match[1].replace(/_/g, '.') : 'Unknown';
    }
    
    return { name: osName, version: osVersion };
  }
  
  /**
   * Get performance metrics
   */
  private getPerformanceMetrics() {
    if (typeof window === 'undefined' || !window.performance || !window.performance.timing) {
      return undefined;
    }
    
    const timing = window.performance.timing;
    const navigation = timing.loadEventEnd - timing.navigationStart;
    const domContentLoaded = timing.domContentLoadedEventEnd - timing.navigationStart;
    
    const metrics: any = {
      pageLoadTime: navigation > 0 ? navigation : undefined,
      domContentLoaded: domContentLoaded > 0 ? domContentLoaded : undefined
    };
    
    // Add Paint API metrics if available
    if (window.performance.getEntriesByType) {
      const paintEntries = window.performance.getEntriesByType('paint');
      paintEntries.forEach((entry: any) => {
        if (entry.name === 'first-paint') {
          metrics.firstPaint = entry.startTime;
        } else if (entry.name === 'first-contentful-paint') {
          metrics.firstContentfulPaint = entry.startTime;
        }
      });
    }
    
    return Object.keys(metrics).length > 0 ? metrics : undefined;
  }
  
  // ===================== SESSION MANAGEMENT =====================
  
  /**
   * Get or create session ID
   */
  private getOrCreateSessionId(): string {
    if (typeof window === 'undefined') {
      // Server-side fallback - generate temporary session ID
      return `sess_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
    
    const existingSessionId = sessionStorage.getItem('analytics_session_id');
    if (existingSessionId) {
      return existingSessionId;
    }
    
    const newSessionId = `sess_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    sessionStorage.setItem('analytics_session_id', newSessionId);
    return newSessionId;
  }
  
  /**
   * Check if this is a new session
   */
  private checkIfNewSession(): boolean {
    if (typeof window === 'undefined') {
      // Server-side fallback - consider it a new session
      return true;
    }
    
    const lastActivity = localStorage.getItem('analytics_last_activity');
    const now = Date.now();
    
    if (!lastActivity || (now - parseInt(lastActivity)) > 30 * 60 * 1000) { // 30 minutes
      localStorage.setItem('analytics_last_activity', now.toString());
      return true;
    }
    
    localStorage.setItem('analytics_last_activity', now.toString());
    return false;
  }
  
  /**
   * Get authentication token if available
   */
  private getAuthToken(): string | null {
    if (typeof window === 'undefined') {
      // Server-side fallback - no token available
      return null;
    }
    
    // Try to get token from various sources
    const tokenFromStorage = localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token');
    const tokenFromCookie = this.getCookie('token');
    
    return tokenFromStorage || tokenFromCookie;
  }
  
  /**
   * Get cookie value by name
   */
  private getCookie(name: string): string | null {
    if (typeof window === 'undefined' || typeof document === 'undefined') {
      // Server-side fallback - no cookies available
      return null;
    }
    
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) {
      return parts.pop()?.split(';').shift() || null;
    }
    return null;
  }
  
  // ===================== AUTOMATIC TRACKING =====================
  
  /**
   * Initialize automatic event tracking
   */
  private initializeAutoTracking(): void {
    if (typeof window === 'undefined' || typeof document === 'undefined') {
      return; // Skip auto tracking on server-side
    }
    
    // Track clicks on buttons and links
    document.addEventListener('click', (event) => {
      const target = event.target as HTMLElement;
      if (target.tagName === 'BUTTON' || target.tagName === 'A') {
        const elementText = target.textContent?.trim() || target.getAttribute('aria-label') || 'Unknown';
        this.trackClick(elementText, {
          properties: {
            tagName: target.tagName,
            className: target.className,
            id: target.id
          }
        });
      }
    });
    
    // Track form submissions
    document.addEventListener('submit', (event) => {
      const form = event.target as HTMLFormElement;
      const formName = form.name || form.id || form.className || 'Unknown Form';
      this.trackFormSubmission(formName, true, {
        properties: {
          action: form.action,
          method: form.method
        }
      });
    });
    
    // Track scroll depth
    this.initializeScrollTracking();
    
    // Track time on page
    this.initializeTimeTracking();
    
    // Track before page unload
    window.addEventListener('beforeunload', () => {
      this.processBatch();
    });
  }
  
  /**
   * Initialize performance tracking
   */
  private initializePerformanceTracking(): void {
    if (typeof window === 'undefined' || typeof document === 'undefined') {
      return; // Skip performance tracking on server-side
    }
    
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => {
        this.trackCustomEvent('DOM Content Loaded', 'performance');
      });
    }
    
    window.addEventListener('load', () => {
      setTimeout(() => {
        const performanceMetrics = this.getPerformanceMetrics();
        if (performanceMetrics) {
          this.trackCustomEvent('Page Load Complete', 'performance', performanceMetrics);
        }
      }, 0);
    });
  }
  
  /**
   * Initialize scroll depth tracking
   */
  private initializeScrollTracking(): void {
    let maxScroll = 0;
    let scrollTimer: NodeJS.Timeout;
    
    window.addEventListener('scroll', () => {
      clearTimeout(scrollTimer);
      scrollTimer = setTimeout(() => {
        const scrollPercent = Math.round(
          (window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100
        );
        
        if (scrollPercent > maxScroll && scrollPercent % 25 === 0) {
          maxScroll = scrollPercent;
          this.trackCustomEvent('Scroll Depth', 'engagement', {
            scrollPercent,
            scrollDepth: `${scrollPercent}%`
          });
        }
      }, 500);
    });
  }
  
  /**
   * Initialize time tracking
   */
  private initializeTimeTracking(): void {
    const startTime = Date.now();
    
    // Track time intervals
    const timeIntervals = [30, 60, 120, 300]; // 30s, 1m, 2m, 5m
    
    timeIntervals.forEach(interval => {
      setTimeout(() => {
        this.trackCustomEvent('Time on Page', 'engagement', {
          timeOnPage: interval,
          timeOnPageFormatted: `${interval}s`
        });
      }, interval * 1000);
    });
    
    // Track total time on page unload
    window.addEventListener('beforeunload', () => {
      const totalTime = Math.round((Date.now() - startTime) / 1000);
      this.trackCustomEvent('Page Exit', 'engagement', {
        totalTimeOnPage: totalTime,
        totalTimeFormatted: `${totalTime}s`
      });
    });
  }
  
  // ===================== UTILITY METHODS =====================
  
  /**
   * Enable/disable tracking
   */
  public setTracking(enabled: boolean): void {
    this.isTracking = enabled;
  }
  
  /**
   * Get current session ID
   */
  public getSessionId(): string {
    return this.sessionId;
  }
  
  /**
   * Force process all queued events
   */
  public async flush(): Promise<void> {
    await this.processBatch();
  }
  
  /**
   * Clear all queued events
   */
  public clearQueue(): void {
    this.batchQueue = [];
    if (this.batchTimer) {
      clearTimeout(this.batchTimer);
      this.batchTimer = null;
    }
  }
}

// Create global analytics instance
let analyticsInstance: AnalyticsService | null = null;

/**
 * Initialize analytics service
 */
export function initializeAnalytics(apiBaseUrl?: string): AnalyticsService {
  if (!analyticsInstance) {
    analyticsInstance = new AnalyticsService(apiBaseUrl);
  }
  return analyticsInstance;
}

/**
 * Get analytics instance
 */
export function getAnalytics(): AnalyticsService {
  if (!analyticsInstance) {
    analyticsInstance = new AnalyticsService();
  }
  return analyticsInstance;
}

// Export analytics service class and convenience functions
export { AnalyticsService };
export default AnalyticsService;