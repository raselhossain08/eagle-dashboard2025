import { AnalyticsResponse } from '@/types/analytics';

export class AnalyticsService {
    private baseUrl = '/api/analytics';

    async getAnalytics(): Promise<AnalyticsResponse> {
        try {
            const response = await fetch(this.baseUrl);

            if (!response.ok) {
                throw new Error('Failed to fetch analytics data');
            }

            return await response.json();
        } catch (error) {
            console.error('Error fetching analytics:', error);
            throw error;
        }
    }

    // Helper methods for data transformation
    formatNumber(num: number): string {
        return new Intl.NumberFormat('en-US').format(num);
    }

    formatDate(dateString: string): string {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    }

    getTimeframeDisplay(timeframe: string): string {
        const timeframeMap: { [key: string]: string } = {
            '7d': 'Last 7 Days',
            '30d': 'Last 30 Days',
            '90d': 'Last 90 Days',
            '1y': 'Last Year',
        };
        return timeframeMap[timeframe] || timeframe;
    }

    calculateRolePercentage(roleCount: number, totalUsers: number): number {
        return totalUsers > 0 ? (roleCount / totalUsers) * 100 : 0;
    }
}

export const analyticsService = new AnalyticsService();