export interface Period {
    type: string;
    startDate: string;
    endDate: string;
}

export interface RevenueSummary {
    totalRevenue: number;
    grossRevenue: number;
    refunds: number;
    netRevenue: number;
    currency: string;
    transactionCount: number;
    averageTransactionValue: number;
}

export interface SubscriptionRevenue {
    revenue: number;
    count: number;
    percentage: number;
}

export interface RevenueData {
    period: Period;
    summary: RevenueSummary;
    bySubscriptionType: Record<string, SubscriptionRevenue>;
    trend: Array<{
        date: string;
        revenue: number;
        count: number;
    }>;
    growth: {
        previousPeriod: number;
        growth: number;
        growthAmount: number;
    };
}

export interface MRRData {
    current: {
        mrr: number;
        arr: number;
        subscribers: number;
        averageRevenuePerUser: number;
    };
    byType: Record<string, {
        mrr: number;
        subscribers: number;
        arpu: number;
    }>;
    growth: {
        mrrGrowth: number;
        newMRR: number;
        expansionMRR: number;
        contractionMRR: number;
        churnedMRR: number;
        netNewMRR: number;
    };
    historical: Array<{
        month: string;
        mrr: number;
        growth: number;
    }>;
}

export interface ChurnData {
    summary: {
        churnRate: number;
        totalChurned: number;
        totalActive: number;
        revenueChurn: number;
        revenueChurnRate: number;
    };
    breakdown: {
        voluntary: {
            count: number;
            percentage: number;
            revenue: number;
        };
        involuntary: {
            count: number;
            percentage: number;
            revenue: number;
        };
    };
    byType: Record<string, {
        churned: number;
        churnRate: number;
        revenue: number;
    }>;
    reasons: Array<{
        reason: string;
        count: number;
        percentage: number;
    }>;
}

export interface DashboardData {
    period: string;
    currentPeriod: {
        revenue: number;
        mrr: number;
        arr: number;
        activeSubscriptions: number;
        newSubscriptions: number;
        churnedSubscriptions: number;
        churnRate: number;
        avgRevenuePerUser: number;
    };
    previousPeriod: {
        revenue: number;
        mrr: number;
        churnRate: number;
    };
    growth: {
        revenue: number;
        mrr: number;
        subscribers: number;
    };
    quickStats: {
        todayRevenue: number;
        weekRevenue: number;
        monthRevenue: number;
        failedPayments: number;
        pendingRefunds: number;
    };
}