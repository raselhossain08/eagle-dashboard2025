// types/tax.ts
export interface TaxRate {
    _id: string;
    name: string;
    description?: string;
    country: string;
    state: string;
    taxType: 'SALES_TAX' | 'VAT' | 'GST' | 'WITHHOLDING' | 'EXCISE' | 'OTHER';
    rate: number;
    active: boolean;
    effectiveFrom?: string;
    effectiveTo?: string;
    applicableToProducts?: string[];
    customerTypes?: string[];
    createdAt: string;
    updatedAt: string;
}

export interface TaxReport {
    reportPeriod: {
        startDate: string;
        endDate: string;
    };
    summary: {
        totalTaxCollected: number;
        totalTransactions: number;
        averageTaxPerTransaction: number;
        currency: string;
    };
    breakdown: Array<{
        state: string;
        country: string;
        taxType: string;
        totalTaxCollected: number;
        transactionCount: number;
        averageRate: number;
    }>;
    topStates: Array<{
        state: string;
        taxCollected: number;
        percentage: number;
    }>;
    taxByType: Record<string, number>;
}

export interface TaxSummary {
    overview: {
        totalTaxRates: number;
        activeTaxRates: number;
        inactiveTaxRates: number;
        countries: number;
        states: number;
    };
    taxByType: Record<string, number>;
    taxByCountry: Array<{
        country: string;
        count: number;
        averageRate: number;
    }>;
    recentActivity: {
        last30Days: {
            taxCollected: number;
            transactionCount: number;
            averageTaxPerTransaction: number;
        };
        last7Days: {
            taxCollected: number;
            transactionCount: number;
            averageTaxPerTransaction: number;
        };
    };
    topTaxRates: Array<{
        _id: string;
        name: string;
        rate: number;
        state: string;
        usageCount: number;
    }>;
}

export interface TaxCalculationRequest {
    amount: number;
    country: string;
    state?: string;
    taxType?: string;
    productType?: string;
    customerType?: string;
    date?: string;
}

export interface TaxCalculationResponse {
    success: boolean;
    data: {
        originalAmount: number;
        taxAmount: number;
        totalAmount: number;
        taxRate: number;
        taxRateId: string;
        taxRateName: string;
        jurisdiction: string;
        breakdown: Array<{
            name: string;
            rate: number;
            amount: number;
        }>;
    };
}

export interface TaxValidationRequest {
    taxId: string;
    country: string;
    state?: string;
}

export interface TaxValidationResponse {
    success: boolean;
    data: {
        valid: boolean;
        formattedTaxId?: string;
        jurisdiction?: string;
        type?: string;
        message?: string;
    };
}

export interface TaxCompliance {
    country: string;
    state: string;
    filingFrequency: 'MONTHLY' | 'QUARTERLY' | 'ANNUALLY';
    lastFiled: string;
    nextDue: string;
    status: 'COMPLIANT' | 'PENDING' | 'OVERDUE';
    totalLiabilities: number;
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
    message?: string;
    pagination?: Pagination;
}