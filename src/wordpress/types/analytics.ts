export interface SiteInfo {
    site_url: string;
    site_name: string;
    wordpress_version: string;
    plugin_version: string;
}

export interface UsersByRole {
    [role: string]: number;
}

export interface UserAnalytics {
    total_users: number;
    users_by_role: UsersByRole;
    recent_registrations: number;
}

export interface ContentAnalytics {
    total_posts: string;
    total_pages: string;
    total_comments: number;
}

export interface ApiAnalytics {
    endpoint_url: string;
    api_key_configured: boolean;
    last_sync: string;
}

export interface WooCommerceAnalytics {
    orders_in_period: number;
    total_products: number;
    currency: string;
    store_enabled: boolean;
}

export interface AnalyticsData {
    site_info: SiteInfo;
    user_analytics: UserAnalytics;
    content_analytics: ContentAnalytics;
    api_analytics: ApiAnalytics;
    woocommerce_analytics: WooCommerceAnalytics;
}

export interface AnalyticsResponse {
    success: boolean;
    data: AnalyticsData;
    timeframe: string;
    generated_at: string;
}