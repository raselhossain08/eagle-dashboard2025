/**
 * Analytics Configuration
 * Central configuration for analytics settings, event schemas, and tracking parameters
 */

// Event type definitions
export const EVENT_TYPES = {
  PAGE_VIEW: 'page_view',
  CLICK: 'click', 
  FORM_SUBMISSION: 'form_submission',
  USER_ACTION: 'user_action',
  API_CALL: 'api_call',
  ERROR: 'error',
  CUSTOM: 'custom',
  CONVERSION: 'conversion',
  ENGAGEMENT: 'engagement',
  NAVIGATION: 'navigation',
  SEARCH: 'search',
  DOWNLOAD: 'download',
  VIDEO_PLAY: 'video_play',
  VIDEO_PAUSE: 'video_pause',
  VIDEO_COMPLETE: 'video_complete',
  SCROLL: 'scroll',
  TIME_ON_PAGE: 'time_on_page',
  AUTH_LOGIN: 'auth_login',
  AUTH_LOGOUT: 'auth_logout',
  AUTH_REGISTER: 'auth_register',
  CONTRACT_CREATE: 'contract_create',
  CONTRACT_SIGN: 'contract_sign',
  CONTRACT_VIEW: 'contract_view',
  PAYMENT_INITIATE: 'payment_initiate',
  PAYMENT_COMPLETE: 'payment_complete',
  SUBSCRIPTION_START: 'subscription_start',
  SUBSCRIPTION_CANCEL: 'subscription_cancel'
} as const;

export const EVENT_CATEGORIES = {
  USER_INTERACTION: 'user_interaction',
  PAGE_NAVIGATION: 'page_navigation',
  FORM_ACTIVITY: 'form_activity',
  AUTHENTICATION: 'authentication',
  CONTRACT_MANAGEMENT: 'contract_management',
  PAYMENT_PROCESS: 'payment_process',
  SUBSCRIPTION_ACTIVITY: 'subscription_activity',
  SYSTEM_EVENT: 'system_event',
  ERROR_TRACKING: 'error_tracking',
  PERFORMANCE: 'performance',
  MARKETING: 'marketing',
  ENGAGEMENT: 'engagement',
  CONVERSION: 'conversion'
} as const;

// Analytics configuration object
export const ANALYTICS_CONFIG = {
  // API endpoints
  endpoints: {
    track: '/api/analytics/events/track',
    batch: '/api/analytics/events/batch',
    dashboard: '/api/analytics/dashboard',
    export: '/api/analytics/export'
  },

  // Tracking settings
  tracking: {
    enabled: process.env.NODE_ENV === 'production' || process.env.NEXT_PUBLIC_ANALYTICS_ENABLED === 'true',
    batchSize: 10,
    batchTimeout: 5000, // 5 seconds
    maxQueueSize: 100,
    sessionTimeout: 30 * 60 * 1000, // 30 minutes
    pageViewThrottle: 1000, // 1 second
    clickThrottle: 100, // 100ms
    scrollThrottle: 500, // 500ms
    resizeThrottle: 250 // 250ms
  },

  // Data collection settings
  collection: {
    automaticPageViews: true,
    automaticClicks: true,
    automaticFormSubmissions: true,
    automaticErrors: true,
    automaticPerformance: true,
    automaticScroll: true,
    automaticTimeTracking: true,
    geolocation: false, // Set to true if you have geolocation service
    userAgent: true,
    referrer: true,
    utm: true,
    deviceInfo: true,
    performanceMetrics: true
  },

  // Privacy settings
  privacy: {
    anonymizeIp: true,
    respectDoNotTrack: true,
    cookieConsent: false, // Set to true if cookie consent is required
    dataRetention: 365, // days
    allowPersonalData: false,
    maskSensitiveData: true
  },

  // Event validation rules
  validation: {
    required: ['eventType', 'eventCategory', 'eventName'],
    maxPropertySize: 1000, // characters
    maxEventSize: 10000, // characters
    allowedEventTypes: Object.values(EVENT_TYPES),
    allowedEventCategories: Object.values(EVENT_CATEGORIES)
  },

  // Dashboard settings
  dashboard: {
    refreshInterval: 30000, // 30 seconds for real-time data
    defaultPeriod: '7d',
    maxExportRecords: 10000,
    chartColors: ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'],
    timeZone: 'UTC'
  },

  // Performance monitoring
  performance: {
    trackPageLoad: true,
    trackApiCalls: true,
    trackMemoryUsage: false, // Set to true for detailed performance monitoring
    slowRequestThreshold: 1000, // ms
    errorThreshold: 100, // errors per hour
    alertThresholds: {
      errorRate: 5, // percentage
      avgResponseTime: 2000, // ms
      memoryUsage: 80 // percentage
    }
  }
} as const;

// Event schema definitions
export const EVENT_SCHEMAS = {
  [EVENT_TYPES.PAGE_VIEW]: {
    required: ['page.path'],
    optional: ['page.title', 'page.referrer', 'utm', 'performance'],
    validation: {
      'page.path': { type: 'string', maxLength: 500 }
    }
  },

  [EVENT_TYPES.CLICK]: {
    required: ['properties.element'],
    optional: ['properties.className', 'properties.id', 'properties.text'],
    validation: {
      'properties.element': { type: 'string', maxLength: 200 }
    }
  },

  [EVENT_TYPES.FORM_SUBMISSION]: {
    required: ['properties.formName'],
    optional: ['properties.success', 'properties.formId', 'properties.fields'],
    validation: {
      'properties.formName': { type: 'string', maxLength: 100 },
      'properties.success': { type: 'boolean' }
    }
  },

  [EVENT_TYPES.CONVERSION]: {
    required: ['conversion.conversionType'],
    optional: ['conversion.conversionValue', 'conversion.currency'],
    validation: {
      'conversion.conversionType': { type: 'string', maxLength: 50 },
      'conversion.conversionValue': { type: 'number', min: 0 },
      'conversion.currency': { type: 'string', length: 3 }
    }
  },

  [EVENT_TYPES.ERROR]: {
    required: ['properties.errorMessage'],
    optional: ['properties.errorStack', 'properties.errorName', 'properties.context'],
    validation: {
      'properties.errorMessage': { type: 'string', maxLength: 500 }
    }
  }
} as const;

// Conversion tracking configuration
export const CONVERSION_TYPES = {
  SUBSCRIPTION_PURCHASE: 'subscription_purchase',
  CONTRACT_SIGNED: 'contract_signed',
  USER_REGISTRATION: 'user_registration',
  PAYMENT_COMPLETED: 'payment_completed',
  TRIAL_STARTED: 'trial_started',
  UPGRADE: 'upgrade',
  DOWNLOAD: 'download',
  CONTACT_FORM: 'contact_form'
} as const;

// UTM parameter configuration
export const UTM_PARAMETERS = {
  SOURCE: 'utm_source',
  MEDIUM: 'utm_medium',
  CAMPAIGN: 'utm_campaign',
  TERM: 'utm_term',
  CONTENT: 'utm_content',
  ID: 'utm_id'
} as const;

// Device type mappings
export const DEVICE_TYPES = {
  DESKTOP: 'desktop',
  MOBILE: 'mobile',
  TABLET: 'tablet',
  UNKNOWN: 'unknown'
} as const;

// Browser detection patterns
export const BROWSER_PATTERNS = {
  CHROME: /Chrome\/([0-9.]+)/,
  FIREFOX: /Firefox\/([0-9.]+)/,
  SAFARI: /Version\/([0-9.]+).*Safari/,
  EDGE: /Edge\/([0-9.]+)/,
  IE: /Trident.*rv:([0-9.]+)/
} as const;

// OS detection patterns
export const OS_PATTERNS = {
  WINDOWS: /Windows NT ([0-9.]+)/,
  MACOS: /Mac OS X ([0-9_.]+)/,
  LINUX: /Linux/,
  ANDROID: /Android ([0-9.]+)/,
  IOS: /OS ([0-9_.]+)/
} as const;

// Export utility functions
export const getEventSchema = (eventType: string) => {
  return EVENT_SCHEMAS[eventType as keyof typeof EVENT_SCHEMAS] || null;
};

export const validateEvent = (eventData: any) => {
  const schema = getEventSchema(eventData.eventType);
  if (!schema) return { valid: true, errors: [] };

  const errors: string[] = [];

  // Check required fields
  schema.required.forEach(field => {
    if (!getNestedProperty(eventData, field)) {
      errors.push(`Required field missing: ${field}`);
    }
  });

  // Validate field types and constraints
  Object.entries(schema.validation || {}).forEach(([field, rules]) => {
    const value = getNestedProperty(eventData, field);
    if (value !== undefined) {
      if (rules.type === 'string' && typeof value !== 'string') {
        errors.push(`Field ${field} must be a string`);
      } else if (rules.type === 'number' && typeof value !== 'number') {
        errors.push(`Field ${field} must be a number`);
      } else if (rules.type === 'boolean' && typeof value !== 'boolean') {
        errors.push(`Field ${field} must be a boolean`);
      }

      if (rules.maxLength && typeof value === 'string' && value.length > rules.maxLength) {
        errors.push(`Field ${field} exceeds maximum length of ${rules.maxLength}`);
      }

      if (rules.min && typeof value === 'number' && value < rules.min) {
        errors.push(`Field ${field} must be at least ${rules.min}`);
      }

      if (rules.length && typeof value === 'string' && value.length !== rules.length) {
        errors.push(`Field ${field} must be exactly ${rules.length} characters`);
      }
    }
  });

  return {
    valid: errors.length === 0,
    errors
  };
};

// Utility function to get nested object property
const getNestedProperty = (obj: any, path: string): any => {
  return path.split('.').reduce((current, key) => current?.[key], obj);
};

// Export configuration as default
export default ANALYTICS_CONFIG;