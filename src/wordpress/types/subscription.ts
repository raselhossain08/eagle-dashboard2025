export interface Subscription {
    id: number;
    status: 'active' | 'pending' | 'on-hold' | 'cancelled' | 'expired';
    customer: {
        id: number;
        first_name: string;
        last_name: string;
        email: string;
    };
    plan_name: string;
    billing_period: string;
    billing_interval: number;
    start_date: string;
    next_payment_date: string | null;
    end_date: string | null;
    total: string;
    currency: string;
    payment_method?: string;
    items?: Array<{ id: number; name: string; }>;
}export interface SubscriptionSummary {
    total_subscriptions: number;
    active_subscriptions: number;
    pending_subscriptions: number;
    cancelled_subscriptions: number;
    subscription_products: number;
    monthly_recurring_revenue: number;
    churn_rate: string;
}export interface SubscriptionsData {
    subscriptions: Subscription[];
    summary: SubscriptionSummary;
}

export interface SubscriptionsResponse {
    success: boolean;
    message: string;
    data: SubscriptionsData;
    timeframe: string;
    generated_at: string;
}
