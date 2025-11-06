import {
    PayPalTransaction,
    TransactionDetails,
    Refund,
    Subscription,
    AnalyticsData,
    ApiResponse
} from '@/types/paypal';

class PayPalService {
    private baseUrl = '/api/paypal/admin';
    private headers: HeadersInit = {
        'Content-Type': 'application/json',
    };

    private async request<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
        const response = await fetch(`${this.baseUrl}${endpoint}`, {
            ...options,
            headers: {
                ...this.headers,
                ...options.headers,
            },
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        return response.json();
    }

    // Transactions
    async getTransactions(params: {
        page: number;
        limit: number;
        status?: string;
        searchTerm?: string;
        startDate?: string;
        endDate?: string;
    }): Promise<ApiResponse<PayPalTransaction[]>> {
        const queryParams = new URLSearchParams();
        Object.entries(params).forEach(([key, value]) => {
            if (value) queryParams.append(key, value.toString());
        });

        return this.request<PayPalTransaction[]>(`/transactions?${queryParams}`);
    }

    async getTransactionDetails(id: string): Promise<ApiResponse<TransactionDetails>> {
        return this.request<TransactionDetails>(`/transactions/${id}`);
    }

    // Analytics
    async getAnalytics(startDate: string, endDate: string): Promise<ApiResponse<AnalyticsData>> {
        return this.request<AnalyticsData>(`/analytics?startDate=${startDate}&endDate=${endDate}`);
    }

    // Refunds
    async getRefunds(params: {
        page: number;
        limit: number;
        startDate?: string;
        endDate?: string;
    }): Promise<ApiResponse<Refund[]>> {
        const queryParams = new URLSearchParams();
        Object.entries(params).forEach(([key, value]) => {
            if (value) queryParams.append(key, value.toString());
        });

        return this.request<Refund[]>(`/refunds?${queryParams}`);
    }

    async processRefund(data: {
        transactionId: string;
        amount: number;
        reason: string;
    }): Promise<ApiResponse<{ refundId: string; amount: number; status: string; transactionId: string }>> {
        return this.request('/refunds', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }

    // Subscriptions
    async getSubscriptions(params: {
        page: number;
        limit: number;
        status?: string;
        searchTerm?: string;
    }): Promise<ApiResponse<Subscription[]>> {
        const queryParams = new URLSearchParams();
        Object.entries(params).forEach(([key, value]) => {
            if (value) queryParams.append(key, value.toString());
        });

        return this.request<Subscription[]>(`/subscriptions?${queryParams}`);
    }

    async cancelSubscription(contractId: string, reason: string): Promise<ApiResponse<{ contractId: string; status: string }>> {
        return this.request(`/subscriptions/${contractId}/cancel`, {
            method: 'POST',
            body: JSON.stringify({ reason }),
        });
    }
}

export const paypalService = new PayPalService();