// lib/services/transactionService.ts
import ApiService from '@/lib/services/shared/api.service';

export interface Transaction {
    _id: string;
    transactionId: string;
    userId: string;
    type: 'charge' | 'refund' | 'payout';
    status: 'pending' | 'succeeded' | 'failed' | 'refunded' | 'partially_refunded' | 'disputed';
    amount: {
        gross: number;
        fee: number;
        net: number;
        tax: number;
        discount: number;
        refunded?: number;
    };
    currency: string;
    psp: {
        provider: 'stripe' | 'paypal';
        reference: {
            chargeId?: string;
            paymentIntentId?: string;
            transactionId?: string;
        };
    };
    timeline: {
        initiatedAt: string;
        capturedAt?: string;
        failedAt?: string;
    };
    billing?: {
        name?: string;
        email?: string;
    };
    description?: string;
}

export interface PaginationInfo {
    current: number;
    total: number;
    count: number;
    limit: number;
}

export interface TransactionsResponse {
    success: boolean;
    transactions: Transaction[];
    pagination: PaginationInfo;
}

export interface TransactionStats {
    totalTransactions: number;
    totalAmount: number;
    totalFees: number;
    totalNet: number;
    succeededCount: number;
    failedCount: number;
    refundedCount: number;
    disputedCount: number;
    successRate: number;
}

export interface SearchParams {
    page?: number;
    limit?: number;
    status?: string;
    type?: string;
    startDate?: string;
    endDate?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}

class TransactionService {
    private baseUrl = '/transactions';

    async getUserTransactions(params: SearchParams = {}): Promise<TransactionsResponse> {
        const queryParams = new URLSearchParams();

        Object.entries(params).forEach(([key, value]) => {
            if (value !== undefined && value !== null && value !== '') {
                queryParams.append(key, value.toString());
            }
        });

        const url = queryParams.toString()
            ? `${this.baseUrl}?${queryParams}`
            : this.baseUrl;

        return ApiService.get<TransactionsResponse>(url);
    }

    async getTransactionById(id: string): Promise<{ success: boolean; transaction: Transaction }> {
        return ApiService.get<{ success: boolean; transaction: Transaction }>(`${this.baseUrl}/${id}`);
    }

    async getTransactionStats(filters: {
        startDate?: string;
        endDate?: string;
        type?: string;
    } = {}): Promise<{ success: boolean; stats: TransactionStats }> {
        const queryParams = new URLSearchParams();

        Object.entries(filters).forEach(([key, value]) => {
            if (value) {
                queryParams.append(key, value);
            }
        });

        const url = queryParams.toString()
            ? `${this.baseUrl}/stats?${queryParams}`
            : `${this.baseUrl}/stats`;

        return ApiService.get<{ success: boolean; stats: TransactionStats }>(url);
    }

    async searchTransactions(query: string, params: SearchParams = {}): Promise<TransactionsResponse> {
        const queryParams = new URLSearchParams({ q: query });

        Object.entries(params).forEach(([key, value]) => {
            if (value !== undefined && value !== null && value !== '') {
                queryParams.append(key, value.toString());
            }
        });

        return ApiService.get<TransactionsResponse>(`${this.baseUrl}/search?${queryParams}`);
    }

    async requestRefund(transactionId: string, data: { amount: number; reason: string }) {
        return ApiService.post(`${this.baseUrl}/${transactionId}/refund`, data);
    }

    // Admin methods
    async getAllTransactions(params: SearchParams = {}): Promise<TransactionsResponse> {
        const queryParams = new URLSearchParams();

        Object.entries(params).forEach(([key, value]) => {
            if (value !== undefined && value !== null && value !== '') {
                queryParams.append(key, value.toString());
            }
        });

        const url = queryParams.toString()
            ? `${this.baseUrl}/admin/all?${queryParams}`
            : `${this.baseUrl}/admin/all`;

        return ApiService.get<TransactionsResponse>(url);
    }

    async getGlobalStats(filters: {
        startDate?: string;
        endDate?: string;
        type?: string;
    } = {}): Promise<{ success: boolean; stats: TransactionStats }> {
        const queryParams = new URLSearchParams();

        Object.entries(filters).forEach(([key, value]) => {
            if (value) {
                queryParams.append(key, value);
            }
        });

        const url = queryParams.toString()
            ? `${this.baseUrl}/admin/stats?${queryParams}`
            : `${this.baseUrl}/admin/stats`;

        return ApiService.get<{ success: boolean; stats: TransactionStats }>(url);
    }

    async updateTransactionStatus(transactionId: string, status: string, additionalData?: any) {
        return ApiService.patch(`${this.baseUrl}/admin/${transactionId}/status`, {
            status,
            additionalData
        });
    }

    async processRefund(transactionId: string, data: { amount: number; reason: string; pspRefundId?: string }) {
        return ApiService.post(`${this.baseUrl}/admin/${transactionId}/refund`, data);
    }
}

export const transactionService = new TransactionService();