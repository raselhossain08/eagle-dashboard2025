import { OrdersResponse, Order } from '@/wordpress/types/order';

export class OrdersService {
    private baseUrl = '/api/orders';

    async getOrders(): Promise<OrdersResponse> {
        try {
            const response = await fetch(this.baseUrl);

            if (!response.ok) {
                throw new Error('Failed to fetch orders data');
            }

            return await response.json();
        } catch (error) {
            console.error('Error fetching orders:', error);
            throw error;
        }
    }

    async getOrderById(id: number): Promise<Order> {
        try {
            const response = await fetch(`${this.baseUrl}/${id}`);

            if (!response.ok) {
                throw new Error('Failed to fetch order details');
            }

            return await response.json();
        } catch (error) {
            console.error('Error fetching order:', error);
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

    formatDate(dateString: string): string {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    }

    getStatusBadgeVariant(status: string): 'default' | 'secondary' | 'destructive' | 'outline' {
        const statusMap: { [key: string]: 'default' | 'secondary' | 'destructive' | 'outline' } = {
            processing: 'default',
            completed: 'secondary',
            failed: 'destructive',
            pending: 'outline',
            'on-hold': 'outline',
            cancelled: 'destructive',
        };
        return statusMap[status] || 'outline';
    }
}

export const ordersService = new OrdersService();

// Re-export types for convenience
export type { Order, OrdersResponse } from '@/wordpress/types/order';
