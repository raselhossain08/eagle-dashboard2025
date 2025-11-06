// lib/payment-service.ts
import ApiService from './shared/api.service';

// types/payment.ts
export interface PaymentMethod {
    _id: string;
    customer: string;
    type: 'card' | 'bank_account';
    status: 'active' | 'inactive';
    last4: string;
    brand: string;
    createdAt: string;
    isDefault?: boolean;
    expiryMonth?: string;
    expiryYear?: string;
}

export interface FailedPayment {
    _id: string;
    userId: {
        email: string;
        firstName: string;
        lastName: string;
    };
    amount: number;
    currency: string;
    status: string;
    errorMessage: string;
    createdAt: string;
}

export interface PaymentSummary {
    totalMethods: number;
    activeMethods: number;
    failedPayments: number;
    recoveredPayments: number;
    recoveryRate: string;
}

export interface PaymentProcessor {
    provider: string;
    isEnabled: boolean;
    isPrimary: boolean;
    environment: string;
    healthStatus: 'healthy' | 'degraded' | 'unhealthy';
    lastHealthCheck: string;
    usageStats?: {
        requestCount: number;
        lastUsed: string;
    };
    responseTime?: number;
    errorRate?: number;
}

export interface Pagination {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
}

export interface ApiResponse<T> {
    success: boolean;
    data: T;
    pagination?: Pagination;
}


class PaymentService {
    private baseUrl = '/payment';

    // Payment Methods
    async getPaymentMethods(page: number = 1, limit: number = 10): Promise<ApiResponse<PaymentMethod[]>> {
        return ApiService.get<ApiResponse<PaymentMethod[]>>(`${this.baseUrl}/methods?page=${page}&limit=${limit}`);
    }

    async createPaymentMethod(data: Partial<PaymentMethod>): Promise<ApiResponse<PaymentMethod>> {
        return ApiService.post<ApiResponse<PaymentMethod>>(`${this.baseUrl}/methods`, data);
    }

    async updatePaymentMethod(id: string, data: { status?: string; isDefault?: boolean }): Promise<ApiResponse<PaymentMethod>> {
        return ApiService.put<ApiResponse<PaymentMethod>>(`${this.baseUrl}/methods/${id}`, data);
    }

    async deletePaymentMethod(id: string): Promise<{ success: boolean; message: string }> {
        return ApiService.delete<{ success: boolean; message: string }>(`${this.baseUrl}/methods/${id}`);
    }

    // Failed Payments
    async getFailedPayments(page: number = 1, limit: number = 10): Promise<ApiResponse<FailedPayment[]>> {
        return ApiService.get<ApiResponse<FailedPayment[]>>(`${this.baseUrl}/failed?page=${page}&limit=${limit}`);
    }

    async retryFailedPayment(id: string): Promise<void> {
        const result = await ApiService.post<{ success: boolean; message?: string }>(`${this.baseUrl}/failed/${id}/retry`);

        if (!result.success) {
            throw new Error(result.message || 'Failed to retry payment');
        }
    }

    // Summary
    async getPaymentSummary(): Promise<ApiResponse<PaymentSummary>> {
        return ApiService.get<ApiResponse<PaymentSummary>>(`${this.baseUrl}/summary`);
    }

    // Processors
    async getPaymentProcessors(): Promise<ApiResponse<PaymentProcessor[]>> {
        return ApiService.get<ApiResponse<PaymentProcessor[]>>(`${this.baseUrl}/processors/providers`);
    }

    async getPaymentProcessor(provider: string): Promise<ApiResponse<PaymentProcessor>> {
        return ApiService.get<ApiResponse<PaymentProcessor>>(`${this.baseUrl}/processors/providers/${provider}`);
    }

    async testPaymentProcessor(provider: string): Promise<{ success: boolean; message: string; responseTime: number }> {
        return ApiService.post<{ success: boolean; message: string; responseTime: number }>(`${this.baseUrl}/processors/providers/${provider}/test`);
    }
}

export const paymentService = new PaymentService();