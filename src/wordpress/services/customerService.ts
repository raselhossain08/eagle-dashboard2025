import { CustomersResponse } from '@/wordpress/types/customer';

export class CustomerService {
    private baseUrl = '/api/customers';

    async getCustomers(page: number = 1, perPage: number = 10): Promise<CustomersResponse> {
        try {
            const response = await fetch(`${this.baseUrl}?page=${page}&per_page=${perPage}`);

            if (!response.ok) {
                throw new Error('Failed to fetch customers data');
            }

            return await response.json();
        } catch (error) {
            console.error('Error fetching customers:', error);
            throw error;
        }
    }

    async searchCustomers(query: string, page: number = 1, perPage: number = 10): Promise<CustomersResponse> {
        try {
            const response = await fetch(
                `${this.baseUrl}/search?q=${encodeURIComponent(query)}&page=${page}&per_page=${perPage}`
            );

            if (!response.ok) {
                throw new Error('Failed to search customers');
            }

            return await response.json();
        } catch (error) {
            console.error('Error searching customers:', error);
            throw error;
        }
    }

    async getCustomerById(id: number): Promise<any> {
        try {
            const response = await fetch(`${this.baseUrl}/${id}`);

            if (!response.ok) {
                throw new Error('Failed to fetch customer details');
            }

            return await response.json();
        } catch (error) {
            console.error('Error fetching customer:', error);
            throw error;
        }
    }

    // Helper methods
    formatCurrency(amount: string): string {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
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

    formatDateTime(dateString: string | undefined): string {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    }

    getCustomerStatus(customer: any): { variant: 'default' | 'secondary' | 'destructive' | 'outline'; label: string } {
        const status = customer.status || 'active';
        return {
            variant: status === 'active' ? 'default' : 'secondary',
            label: status === 'active' ? 'Active' : 'Inactive'
        };
    }

    hasCompleteProfile(customer: any): boolean {
        return !!(customer.first_name && customer.last_name && customer.email && customer.phone);
    }

    formatNumber(num: number): string {
        return new Intl.NumberFormat('en-US').format(num);
    }
}

export const customerService = new CustomerService();
