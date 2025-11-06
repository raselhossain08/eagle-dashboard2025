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