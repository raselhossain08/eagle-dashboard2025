import ApiService from './shared/api.service';

export interface DashboardStats {
    revenue: {
        total: number;
        change: number;
        trend: 'up' | 'down';
    };
    users: {
        total: number;
        active: number;
        change: number;
        trend: 'up' | 'down';
    };
    sales: {
        total: number;
        change: number;
        trend: 'up' | 'down';
    };
    activeNow: {
        total: number;
        change: number;
        trend: 'up' | 'down';
    };
}

export interface RecentActivity {
    id: string;
    type: string;
    description: string;
    timestamp: string;
    user?: {
        name: string;
        avatar?: string;
    };
}

export interface DashboardOverview {
    stats: DashboardStats;
    recentActivity: RecentActivity[];
    summary?: any;
}

class DashboardService {
    private static readonly ANALYTICS_ENDPOINT = '/analytics/overview';
    private static readonly SUBSCRIBERS_ENDPOINT = '/v1/subscribers/stats';
    private static readonly TRANSACTIONS_ENDPOINT = '/transactions/admin/stats';

    /**
     * Get dashboard overview statistics
     */
    async getDashboardStats(dateRange?: string): Promise<DashboardOverview> {
        try {
            const params = new URLSearchParams();
            if (dateRange) params.append('range', dateRange);

            const queryString = params.toString();
            const endpoint = queryString
                ? `${DashboardService.ANALYTICS_ENDPOINT}?${queryString}`
                : DashboardService.ANALYTICS_ENDPOINT;

            const response = await ApiService.get<{ success: boolean; data: any }>(endpoint);

            // Transform API response
            return this.transformDashboardData(response.data || response);
        } catch (error) {
            console.error('Error fetching dashboard stats:', error);
            throw error;
        }
    }

    /**
     * Get subscriber statistics
     */
    async getSubscriberStats(): Promise<any> {
        try {
            console.log('🔗 Fetching subscriber stats from:', DashboardService.SUBSCRIBERS_ENDPOINT);
            const response = await ApiService.get<{ success: boolean; data: any }>(
                DashboardService.SUBSCRIBERS_ENDPOINT
            );
            console.log('📦 Subscriber stats response:', response);
            return response.data || response;
        } catch (error) {
            console.error('❌ Error fetching subscriber stats:', error);
            return null;
        }
    }

    /**
     * Get transaction statistics
     */
    async getTransactionStats(dateRange?: string): Promise<any> {
        try {
            const params = new URLSearchParams();
            if (dateRange) params.append('dateRange', dateRange);

            const queryString = params.toString();
            const endpoint = queryString
                ? `${DashboardService.TRANSACTIONS_ENDPOINT}?${queryString}`
                : DashboardService.TRANSACTIONS_ENDPOINT;

            console.log('🔗 Fetching transaction stats from:', endpoint);
            console.log('🔑 Auth token exists:', !!ApiService.getAuthToken());

            const response = await ApiService.get<{ success: boolean; stats: any }>(endpoint);
            console.log('📦 Transaction stats response:', response);

            // API returns { success: true, stats: {...} }
            return response.stats || response;
        } catch (error: any) {
            console.error('❌ Error fetching transaction stats:', error);
            console.error('❌ Error message:', error.message);
            console.error('❌ Full error:', error);
            return null;
        }
    }

    /**
     * Get real-time active users
     */
    async getActiveUsers(): Promise<number> {
        try {
            const response = await ApiService.get<{ success: boolean; data: any }>(
                '/analytics/realtime'
            );
            return response.data?.current?.activeUsers || 0;
        } catch (error) {
            console.error('Error fetching active users:', error);
            return 0;
        }
    }

    /**
     * Transform API response to dashboard format
     */
    private transformDashboardData(data: any): DashboardOverview {
        return {
            stats: {
                revenue: {
                    total: data?.revenue?.total || 0,
                    change: data?.revenue?.change || 0,
                    trend: data?.revenue?.change >= 0 ? 'up' : 'down'
                },
                users: {
                    total: data?.users?.total || 0,
                    active: data?.users?.active || 0,
                    change: data?.users?.change || 0,
                    trend: data?.users?.change >= 0 ? 'up' : 'down'
                },
                sales: {
                    total: data?.sales?.total || 0,
                    change: data?.sales?.change || 0,
                    trend: data?.sales?.change >= 0 ? 'up' : 'down'
                },
                activeNow: {
                    total: data?.activeNow || 0,
                    change: data?.activeNowChange || 0,
                    trend: data?.activeNowChange >= 0 ? 'up' : 'down'
                }
            },
            recentActivity: data?.recentActivity || [],
            summary: data?.summary
        };
    }

    /**
     * Get comprehensive dashboard data
     */
    async getComprehensiveStats(dateRange: string = '7d'): Promise<any> {
        try {
            console.log('🚀 Starting comprehensive stats fetch for dateRange:', dateRange);

            const results = await Promise.allSettled([
                this.getDashboardStats(dateRange),
                this.getSubscriberStats(),
                this.getTransactionStats(dateRange),
                this.getActiveUsers(),
                this.getSubscriptionGrowthTrends(dateRange)
            ]);

            const [dashboard, subscribersRaw, transactions, activeUsers, growth] = results.map(r => r.status === 'fulfilled' ? r.value : null);

            console.log('📊 Dashboard API Responses:', {
                dashboard,
                subscribersRaw,
                transactions,
                activeUsers,
                growth
            });

            console.log('💰 Transaction Data Detail:', {
                totalAmount: transactions?.totalAmount,
                totalTransactions: transactions?.totalTransactions,
                byPeriod: transactions?.byPeriod,
                dailyStats: transactions?.dailyStats
            });            // Extract subscriber data from nested structure
            const totalSubs = subscribersRaw?.totalSubscribers?.value || 0;
            const activeSubs = subscribersRaw?.activeThisMonth?.value || 0;
            const subChange = subscribersRaw?.totalSubscribers?.change || 0;

            // Parse subscription breakdown
            const breakdown = subscribersRaw?.subscriptionBreakdown || [];
            const activeCount = breakdown.find((item: any) => item._id === 'active')?.count || 0;
            const cancelledCount = breakdown.find((item: any) => item._id === 'cancelled')?.count || 0;
            const suspendedCount = breakdown.find((item: any) => item._id === 'suspended')?.count || 0;
            const trialCount = subscribersRaw?.trialUsers || 0;

            // Transform data for charts
            return {
                dashboard: {
                    ...dashboard,
                    revenue: transactions?.totalAmount || 0,
                    previousRevenue: transactions?.previousAmount || 0,
                    recentActivity: dashboard?.recentActivity || [],
                    revenueByPeriod: this.generateRevenueChartData(transactions, dateRange),
                },
                subscribers: {
                    totalSubscribers: totalSubs,
                    activeSubscribers: activeSubs,
                    previousTotal: totalSubs - subChange,
                    activeThisMonth: activeSubs,
                    trialUsers: trialCount,
                    growthTrend: this.generateSubscriptionTrendData(growth, { totalSubscribers: totalSubs }),
                    planDistribution: this.generatePlanDistribution({
                        active: activeCount,
                        cancelled: cancelledCount,
                        suspended: suspendedCount,
                        trial: trialCount
                    }),
                    basicCount: 0, // API doesn't provide plan-specific counts yet
                    proCount: 0,
                    enterpriseCount: 0,
                },
                transactions: {
                    ...transactions,
                    totalTransactions: transactions?.totalTransactions || 0,
                    totalAmount: transactions?.totalAmount || 0,
                    previousTotal: transactions?.previousTransactions || 0,
                    monthlyTrend: this.generateTransactionTrendData(transactions, dateRange),
                },
                activeUsers: activeUsers.status === 'fulfilled' ? activeUsers.value : 0
            };
        } catch (error) {
            console.error('Error fetching comprehensive stats:', error);
            throw error;
        }
    }

    /**
     * Get subscription growth trends
     */
    async getSubscriptionGrowthTrends(dateRange: string): Promise<any> {
        try {
            const response = await ApiService.get<{ success: boolean; data: any }>(
                `/subscription/analytics/growth?range=${dateRange}`
            );
            return response.data || response;
        } catch (error) {
            console.error('Error fetching growth trends:', error);
            return null;
        }
    }

    /**
     * Generate revenue chart data from transaction stats
     */
    private generateRevenueChartData(transactions: any, dateRange: string): any[] {
        console.log('🔍 generateRevenueChartData input:', transactions);

        // Check different possible data structures
        const dailyData = transactions?.byPeriod || transactions?.dailyStats || transactions?.daily || [];

        if (Array.isArray(dailyData) && dailyData.length > 0) {
            return dailyData.map((item: any) => ({
                name: item.date || item.period || item._id || 'Unknown',
                revenue: item.totalAmount || item.revenue || item.amount || 0,
                profit: (item.totalAmount || item.revenue || item.amount || 0) * 0.7, // Assume 70% profit margin
            }));
        }

        // Fallback: Generate from total amount if available
        if (transactions?.totalAmount > 0) {
            const amount = transactions.totalAmount;
            const periods = dateRange === '7d' ? 7 : dateRange === '30d' ? 30 : 90;
            const avgPerPeriod = amount / periods;

            return Array.from({ length: Math.min(periods, 12) }, (_, i) => {
                const date = new Date();
                date.setDate(date.getDate() - (periods - i - 1));
                return {
                    name: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                    revenue: avgPerPeriod * (0.8 + Math.random() * 0.4), // Add some variance
                    profit: avgPerPeriod * 0.7 * (0.8 + Math.random() * 0.4),
                };
            });
        }

        return [];
    }

    /**
     * Generate subscription trend data
     */
    private generateSubscriptionTrendData(growth: any, subscribers: any): any[] {
        if (growth?.monthly) {
            return growth.monthly.map((item: any) => ({
                name: new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                subscribers: item.count,
            }));
        }

        // Fallback: generate mock trend based on current stats
        if (subscribers?.totalSubscribers) {
            const total = subscribers.totalSubscribers;
            const periods = 4;
            return Array.from({ length: periods }, (_, i) => ({
                name: `Period ${i + 1}`,
                subscribers: Math.floor(total * (0.5 + (i / periods) * 0.5)),
            }));
        }

        return [];
    }

    /**
     * Generate plan distribution data
     */
    private generatePlanDistribution(subscribers: any): any[] {
        // Handle status-based breakdown (active, cancelled, suspended, trial)
        if (subscribers?.active !== undefined) {
            return [
                { name: 'Active', value: subscribers.active || 0, color: '#3b82f6' },
                { name: 'Trial', value: subscribers.trial || 0, color: '#8b5cf6' },
                { name: 'Suspended', value: subscribers.suspended || 0, color: '#f59e0b' },
                { name: 'Cancelled', value: subscribers.cancelled || 0, color: '#ef4444' },
            ].filter(item => item.value > 0);
        }

        // Handle plan-based breakdown (Basic, Pro, Enterprise)
        const basicCount = subscribers?.byPlan?.basic || subscribers?.basicCount || 0;
        const proCount = subscribers?.byPlan?.pro || subscribers?.proCount || 0;
        const enterpriseCount = subscribers?.byPlan?.enterprise || subscribers?.enterpriseCount || 0;

        return [
            { name: 'Basic', value: basicCount, color: '#3b82f6' },
            { name: 'Pro', value: proCount, color: '#8b5cf6' },
            { name: 'Enterprise', value: enterpriseCount, color: '#ec4899' },
        ].filter(item => item.value > 0);
    }

    /**
     * Generate transaction trend data
     */
    private generateTransactionTrendData(transactions: any, dateRange: string): any[] {
        console.log('🔍 generateTransactionTrendData input:', transactions);

        const dailyData = transactions?.byPeriod || transactions?.dailyStats || transactions?.daily || [];

        if (Array.isArray(dailyData) && dailyData.length > 0) {
            return dailyData.map((item: any) => ({
                name: item.date || item.period || item._id || 'Unknown',
                count: item.count || item.totalTransactions || item.transactions || 0,
                amount: item.totalAmount || item.amount || item.revenue || 0,
            }));
        }

        // Fallback: Generate from total stats if available
        if (transactions?.totalTransactions > 0 || transactions?.totalAmount > 0) {
            const count = transactions.totalTransactions || 0;
            const amount = transactions.totalAmount || 0;
            const periods = dateRange === '7d' ? 7 : dateRange === '30d' ? 30 : 90;
            const avgCount = count / periods;
            const avgAmount = amount / periods;

            return Array.from({ length: Math.min(periods, 12) }, (_, i) => {
                const date = new Date();
                date.setDate(date.getDate() - (periods - i - 1));
                return {
                    name: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                    count: Math.round(avgCount * (0.7 + Math.random() * 0.6)),
                    amount: avgAmount * (0.7 + Math.random() * 0.6),
                };
            });
        }

        return [];
    }
}

export const dashboardService = new DashboardService();
export default dashboardService;
