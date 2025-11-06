// types/analytics.ts
export interface AnalyticsPeriod {
    startDate: string;
    endDate: string;
    days?: number;
}

export interface OverviewMetrics {
    totalUsers: number;
    uniqueVisitors: number;
    totalSessions: number;
    totalPageViews: number;
    avgSessionDuration: number;
    bounceRate: number;
    conversionRate: number;
    totalConversions: number;
}

export interface MetricComparison {
    value: number;
    change: number;
    trend: 'up' | 'down';
}

export interface TopPage {
    path: string;
    title: string;
    views: number;
    uniqueVisitors: number;
    avgTimeOnPage: number;
    bounceRate: number;
    exitRate: number;
}

export interface TrafficSource {
    source: string;
    medium: string;
    sessions: number;
    users: number;
    bounceRate: number;
    avgSessionDuration: number;
}

export interface DeviceBreakdown {
    desktop: { count: number; percentage: number };
    mobile: { count: number; percentage: number };
    tablet: { count: number; percentage: number };
}

export interface CountryData {
    country: string;
    code: string;
    sessions: number;
    percentage: number;
}

// Funnel Types
export interface FunnelStep {
    step: number;
    name: string;
    description: string;
    count: number;
    percentage: number;
    dropOff: number;
    dropOffRate: number;
    conversionFromPrevious: number;
    avgTimeToNext: number | null;
}

export interface FunnelSegmentation {
    source: string;
    entered: number;
    completed: number;
    conversionRate: number;
    steps: number[];
}

// Growth Analytics Types
export interface ChannelPerformance {
    name: string;
    sessions: number;
    users: number;
    conversions: number;
    conversionRate: number;
    revenue: number;
    cost: number;
    roi: number | null;
    cac?: number;
    avgLTV: number;
    trend: Array<{
        date: string;
        sessions: number;
        conversions: number;
        cost?: number;
    }>;
}

export interface CohortData {
    cohortDate: string;
    cohortSize: number;
    week0: number;
    week1: number;
    week2: number;
    week3: number;
    week4: number | null;
    totalRevenue: number;
    avgLTV: number;
}

// Real-time Types
export interface ActiveUserTrend {
    time: string;
    count: number;
}

export interface RealTimePage {
    path: string;
    title: string;
    activeUsers: number;
    avgTimeOnPage: number;
    newVsReturning: { new: number; returning: number };
}

export interface RecentEvent {
    eventId: string;
    time: string;
    type: string;
    name: string;
    value?: number;
    page: string;
    country: string;
    device: string;
}

// Event Explorer Types
export interface EventCategory {
    category: string;
    count: number;
    percentage: number;
}

export interface EventData {
    eventName: string;
    eventCategory: string;
    count: number;
    uniqueUsers: number;
    avgValue: number;
    totalValue: number;
    topPages: Array<{ path: string; count: number }>;
    properties: Record<string, Record<string, number>>;
}

// Integration Types
export interface Integration {
    provider: string;
    name: string;
    enabled: boolean;
    connected: boolean;
    propertyId?: string;
    projectId?: string;
    lastSync?: string;
    status: 'active' | 'disabled' | 'error';
    eventsToday?: number;
    errorCount?: number;
}

// API Response Types
export interface ApiResponse<T> {
    success: boolean;
    data: T;
}

// Actual API Response Structure
export interface MetricCard {
    title: string;
    value: string;
    change: string;
    trend: 'up' | 'down';
    icon: string;
    color: string;
}

export interface PageInfo {
    url: string;
    path: string;
    title: string;
    referrer: string | null;
}

export interface TopPageData {
    page: PageInfo;
    views: number;
    uniqueViews: number;
    bounce: number;
    avgTime: string;
}

export interface DeviceData {
    name: string | null;
    value: number;
    color: string;
}

export interface ConversionFunnel {
    step: string;
    users: number;
    conversionRate: number;
}

export interface RecentEventData {
    type: string;
    action: string;
    label: PageInfo;
    timestamp: string;
    userId: string | null;
    sessionId: string;
}

export interface OverviewResponse {
    metrics: MetricCard[];
    trafficSources: {
        data: Array<{
            month: string;
            organic: number;
            paid: number;
            direct: number;
            social: number;
            referral: number;
        }>;
        total: number;
    };
    topPages: {
        data: TopPageData[];
        total: number;
    };
    devices: {
        data: DeviceData[];
        total: number;
    };
    conversion: {
        funnel: ConversionFunnel[];
        conversionRate: string;
    };
    recentEvents: {
        data: RecentEventData[];
        count: number;
    };
    stats: {
        totalSessions: number;
        newVisitors: number;
        returningVisitors: number;
        conversionRate: number;
        averagePageViewsPerSession: number;
    };
}

// Legacy types (kept for backward compatibility)
export interface AnalyticsPeriod {
    startDate: string;
    endDate: string;
    days?: number;
}

export interface OverviewMetrics {
    totalUsers: number;
    uniqueVisitors: number;
    totalSessions: number;
    totalPageViews: number;
    avgSessionDuration: number;
    bounceRate: number;
    conversionRate: number;
    totalConversions: number;
}

export interface MetricComparison {
    value: number;
    change: number;
    trend: 'up' | 'down';
}

export interface TopPage {
    path: string;
    title: string;
    views: number;
    uniqueVisitors: number;
    avgTimeOnPage: number;
    bounceRate: number;
    exitRate: number;
}

export interface TrafficSource {
    source: string;
    medium: string;
    sessions: number;
    users: number;
    bounceRate: number;
    avgSessionDuration: number;
}

export interface DeviceBreakdown {
    desktop: { count: number; percentage: number };
    mobile: { count: number; percentage: number };
    tablet: { count: number; percentage: number };
}

export interface CountryData {
    country: string;
    code: string;
    sessions: number;
    percentage: number;
}