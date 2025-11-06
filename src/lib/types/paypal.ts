export interface PayPalTransaction {
    _id: string;
    transactionId: string;
    amount: number;
    currency: string;
    status: 'completed' | 'pending' | 'failed' | 'refunded';
    paymentMethod: string;
    userId: {
        _id: string;
        email: string;
        firstName: string;
        lastName: string;
        phone?: string;
    };
    metadata?: {
        contractId: string;
        productType: string;
    };
    paypalDetails?: {
        id: string;
        status: string;
        amount: {
            value: string;
            currency_code: string;
        };
        seller_protection: {
            status: string;
        };
    };
    createdAt: string;
    updatedAt: string;
}

export interface TransactionDetails extends PayPalTransaction {
    metadata: {
        contractId: string;
        productType: string;
    };
    paypalDetails: {
        id: string;
        status: string;
        amount: {
            value: string;
            currency_code: string;
        };
        seller_protection: {
            status: string;
        };
    };
}

export interface Refund {
    _id: string;
    transactionId: string;
    refundId: string;
    amount: number;
    refundAmount: number;
    refundReason: string;
    status: string;
    refundDate: string;
    userId: {
        email: string;
        firstName: string;
        lastName: string;
    };
    createdAt: string;
}

export interface Subscription {
    _id: string;
    contractNumber: string;
    paypalOrderId: string;
    status: 'active' | 'cancelled' | 'suspended';
    productType: string;
    subscriptionType: string;
    amount: number;
    userId: {
        email: string;
        firstName: string;
        lastName: string;
    };
    createdAt: string;
}

export interface AnalyticsData {
    summary: {
        totalTransactions: number;
        successfulTransactions: number;
        failedTransactions: number;
        pendingTransactions: number;
        totalRevenue: number;
        averageTransaction: number;
        totalRefunded: number;
        successRate: string;
    };
    recentTransactions: Array<{
        _id: string;
        amount: number;
        status: string;
        transactionId: string;
        userId: {
            email: string;
            firstName: string;
            lastName: string;
        };
        createdAt: string;
    }>;
}

export interface PaginationData {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
}

export interface ApiResponse<T> {
    success: boolean;
    data: T;
    pagination?: PaginationData;
    message?: string;
}