import { SubscriptionsResponse } from '@/wordpress/types/subscription';

export class SubscriptionService {
    private baseUrl = '/api/subscriptions';

    async getSubscriptions(): Promise<SubscriptionsResponse> {
        try {
            const response = await fetch(this.baseUrl);

            if (!response.ok) {
                throw new Error('Failed to fetch subscriptions data');
            }

            return await response.json();
        } catch (error) {
            console.error('Error fetching subscriptions:', error);
            throw error;
        }
    }

    async getSubscriptionById(id: number): Promise<any> {
        try {
            const response = await fetch(`${this.baseUrl}/${id}`);

            if (!response.ok) {
                throw new Error('Failed to fetch subscription details');
            }

            return await response.json();
        } catch (error) {
            console.error('Error fetching subscription:', error);
            throw error;
        }
    }

    async cancelSubscription(id: number): Promise<any> {
        try {
            const response = await fetch(`${this.baseUrl}/${id}/cancel`, {
                method: 'POST',
            });

            if (!response.ok) {
                throw new Error('Failed to cancel subscription');
            }

            return await response.json();
        } catch (error) {
            console.error('Error cancelling subscription:', error);
            throw error;
        }
    }

    // Helper methods
    formatCurrency(amount: string, currency: string = 'USD'): string {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: currency,
        }).format(parseFloat(amount));
    }

    formatDate(dateString: string | null): string {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    }

    getStatusColor(status: string): string {
        const statusColors: { [key: string]: string } = {
            active: 'green',
            pending: 'yellow',
            'on-hold': 'orange',
            cancelled: 'red',
            expired: 'gray',
        };
        return statusColors[status] || 'gray';
    }

    getStatusBadgeVariant(status: string): 'default' | 'secondary' | 'destructive' | 'outline' {
        const statusMap: { [key: string]: 'default' | 'secondary' | 'destructive' | 'outline' } = {
            active: 'default',
            pending: 'outline',
            'on-hold': 'secondary',
            cancelled: 'destructive',
            expired: 'outline',
        };
        return statusMap[status] || 'outline';
    }
}

export const subscriptionService = new SubscriptionService();
