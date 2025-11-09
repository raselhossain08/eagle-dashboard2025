import {
    TaxRate,
    Invoice,
    Receipt,
    TaxCalculationResponse,
    BillingDashboard,
    Currency,
    ApiResponse
} from '@/lib/types/billing';
import { TaxCalculationRequest } from '@/lib/types/tax';
import ApiService from './shared/api.service';

class BillingService {
    private readonly basePath = '/billing';
    private cache = new Map<string, { data: any; timestamp: number }>();
    private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes cache

    // Helper method to generate cache key
    private getCacheKey(endpoint: string, params?: any): string {
        const paramString = params ? JSON.stringify(params) : '';
        return `${endpoint}${paramString}`;
    }

    // Helper method to check if cached data is still valid
    private isCacheValid(timestamp: number): boolean {
        return Date.now() - timestamp < this.CACHE_DURATION;
    }

    // Helper method to wrap API responses in consistent format with caching
    private async wrapResponse<T>(apiCall: Promise<T>, cacheKey?: string): Promise<ApiResponse<T>> {
        try {
            // Check cache first if cacheKey is provided
            if (cacheKey) {
                const cached = this.cache.get(cacheKey);
                if (cached && this.isCacheValid(cached.timestamp)) {
                    console.log(`🎯 Cache hit for ${cacheKey}`);
                    return {
                        success: true,
                        data: cached.data
                    };
                }
            }

            const data = await apiCall;
            
            // Store in cache if cacheKey is provided
            if (cacheKey) {
                this.cache.set(cacheKey, {
                    data,
                    timestamp: Date.now()
                });
                console.log(`💾 Cached result for ${cacheKey}`);
            }

            return {
                success: true,
                data
            };
        } catch (error) {
            console.error('Billing service error:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error occurred',
                message: error instanceof Error ? error.message : 'Unknown error occurred'
            };
        }
    }

    // Method to clear cache (useful for force refresh)
    public clearCache(): void {
        this.cache.clear();
        console.log('🗑️ Billing service cache cleared');
    }

    // Method to clear specific cache entry
    public clearCacheEntry(endpoint: string, params?: any): void {
        const cacheKey = this.getCacheKey(endpoint, params);
        this.cache.delete(cacheKey);
        console.log(`🗑️ Cleared cache for ${cacheKey}`);
    }

    // Tax Rates
    async getTaxRates(params: {
        page: number;
        limit: number;
        country?: string;
        taxType?: string;
        active?: boolean;
        search?: string;
    }): Promise<ApiResponse<TaxRate[]>> {
        const queryParams = new URLSearchParams();
        Object.entries(params).forEach(([key, value]) => {
            if (value !== undefined && value !== '') {
                queryParams.append(key, value.toString());
            }
        });

        return this.wrapResponse(
            ApiService.get<TaxRate[]>(`${this.basePath}/tax-rates?${queryParams}`)
        );
    }

    async createTaxRate(data: Partial<TaxRate>): Promise<ApiResponse<TaxRate>> {
        return this.wrapResponse(
            ApiService.post<TaxRate>(`${this.basePath}/tax-rates`, data)
        );
    }

    async updateTaxRate(id: string, data: Partial<TaxRate>): Promise<ApiResponse<TaxRate>> {
        return this.wrapResponse(
            ApiService.put<TaxRate>(`${this.basePath}/tax-rates/${id}`, data)
        );
    }

    async deleteTaxRate(id: string): Promise<ApiResponse<void>> {
        return this.wrapResponse(
            ApiService.delete<void>(`${this.basePath}/tax-rates/${id}`)
        );
    }

    async handlePayPalWebhook(data: any): Promise<ApiResponse<any>> {
        return this.wrapResponse(
            ApiService.post<any>(`${this.basePath}/webhooks/paypal`, data)
        );
    }

    // Bulk operations for invoices
    async bulkUpdateInvoices(ids: string[], updates: Partial<Invoice>): Promise<ApiResponse<void>> {
        return this.wrapResponse(
            ApiService.post<void>(`${this.basePath}/invoices/bulk-update`, { ids, updates })
        );
    }

    async validateTaxRate(data: Partial<TaxRate>): Promise<ApiResponse<{ valid: boolean; message?: string }>> {
        return this.wrapResponse(
            ApiService.post<{ valid: boolean; message?: string }>(`${this.basePath}/tax-rates/validate`, data)
        );
    }
    // Tax Calculation
    async calculateTax(data: TaxCalculationRequest): Promise<ApiResponse<TaxCalculationResponse>> {
        return this.wrapResponse(
            ApiService.post<TaxCalculationResponse>(`${this.basePath}/calculate-tax`, data)
        );
    }

    async getApplicableTaxRates(params: {
        country: string;
        state?: string;
        city?: string;
        customerType?: string;
        productType?: string;
        amount?: number;
    }): Promise<ApiResponse<TaxRate[]>> {
        const queryParams = new URLSearchParams();
        Object.entries(params).forEach(([key, value]) => {
            if (value) queryParams.append(key, value.toString());
        });

        return this.wrapResponse(
            ApiService.get<TaxRate[]>(`${this.basePath}/applicable-tax-rates?${queryParams}`)
        );
    }

    // Invoices (with caching for list views)
    async getInvoices(params: {
        page: number;
        limit: number;
        status?: string;
        currency?: string;
        dateFrom?: string;
        dateTo?: string;
    }): Promise<ApiResponse<Invoice[]>> {
        const queryParams = new URLSearchParams();
        Object.entries(params).forEach(([key, value]) => {
            if (value) queryParams.append(key, value.toString());
        });

        const cacheKey = this.getCacheKey('/invoices', params);
        return this.wrapResponse(
            ApiService.get<Invoice[]>(`${this.basePath}/invoices?${queryParams}`),
            cacheKey
        );
    }

    async getInvoice(id: string): Promise<ApiResponse<Invoice>> {
        return this.wrapResponse(
            ApiService.get<Invoice>(`${this.basePath}/invoices/${id}`)
        );
    }

    async createInvoice(data: Partial<Invoice>): Promise<ApiResponse<Invoice>> {
        return this.wrapResponse(
            ApiService.post<Invoice>(`${this.basePath}/invoices`, data)
        );
    }

    async updateInvoice(id: string, data: Partial<Invoice>): Promise<ApiResponse<Invoice>> {
        return this.wrapResponse(
            ApiService.put<Invoice>(`${this.basePath}/invoices/${id}`, data)
        );
    }

    async voidInvoice(id: string, reason: string): Promise<ApiResponse<Invoice>> {
        const result = await this.wrapResponse(
            ApiService.post<Invoice>(`${this.basePath}/invoices/${id}/void`, { reason })
        );
        
        // Clear invoice cache when invoice is modified
        if (result.success) {
            this.clearCacheEntry('/invoices');
            this.clearCacheEntry('/dashboard');
        }
        
        return result;
    }

    async markInvoicePaid(id: string, data: {
        paymentAmount: number;
        paymentDate: string;
        paymentMethod: string;
        transactionId: string;
    }): Promise<ApiResponse<Invoice>> {
        return this.wrapResponse(
            ApiService.post<Invoice>(`${this.basePath}/invoices/${id}/mark-paid`, data)
        );
    }

    async generateInvoicePdf(id: string, templateId?: string): Promise<ApiResponse<{ pdfUrl: string }>> {
        return this.wrapResponse(
            ApiService.post<{ pdfUrl: string }>(`${this.basePath}/invoices/${id}/generate-pdf`, { templateId })
        );
    }

    async sendInvoiceEmail(id: string, data: {
        to: string;
        cc?: string[];
        subject?: string;
    }): Promise<ApiResponse<void>> {
        return this.wrapResponse(
            ApiService.post<void>(`${this.basePath}/invoices/${id}/send-email`, data)
        );
    }

    async resendInvoiceEmail(id: string): Promise<ApiResponse<void>> {
        return this.wrapResponse(
            ApiService.post<void>(`${this.basePath}/invoices/${id}/resend-email`)
        );
    }

    // Receipts
    async getReceipts(params: {
        page: number;
        limit: number;
        customerId?: string;
        paymentMethod?: string;
    }): Promise<ApiResponse<Receipt[]>> {
        const queryParams = new URLSearchParams();
        Object.entries(params).forEach(([key, value]) => {
            if (value) queryParams.append(key, value.toString());
        });

        return this.wrapResponse(
            ApiService.get<Receipt[]>(`${this.basePath}/receipts?${queryParams}`)
        );
    }

    async resendReceiptEmail(id: string): Promise<ApiResponse<void>> {
        return this.wrapResponse(
            ApiService.post<void>(`${this.basePath}/receipts/${id}/resend-email`)
        );
    }

    // Dashboard & Analytics (with caching)
    async getDashboard(period: string = '30d', currency: string = 'USD'): Promise<ApiResponse<BillingDashboard>> {
        const cacheKey = this.getCacheKey('/dashboard', { period, currency });
        return this.wrapResponse(
            ApiService.get<BillingDashboard>(`${this.basePath}/dashboard?period=${period}&currency=${currency}`),
            cacheKey
        );
    }

    async exportData(params: {
        format: string;
        dataType: string;
        dateFrom: string;
        dateTo: string;
        currency?: string;
        status?: string;
    }): Promise<ApiResponse<any>> {
        const queryParams = new URLSearchParams();
        Object.entries(params).forEach(([key, value]) => {
            if (value) queryParams.append(key, value.toString());
        });

        return this.wrapResponse(
            ApiService.get<any>(`${this.basePath}/export?${queryParams}`)
        );
    }

    // Currencies
    async getCurrencies(): Promise<ApiResponse<Currency[]>> {
        return this.wrapResponse(
            ApiService.get<Currency[]>(`${this.basePath}/currencies`)
        );
    }

    async updateCurrencyStatus(currencyCode: string, enabled: boolean): Promise<ApiResponse> {
        return this.wrapResponse(
            ApiService.put(`${this.basePath}/currencies/${currencyCode}/status`, { enabled })
        );
    }

    async updateExchangeRate(currencyCode: string, rate: number): Promise<ApiResponse> {
        return this.wrapResponse(
            ApiService.put(`${this.basePath}/currencies/${currencyCode}/rate`, { rate })
        );
    }

    async refreshExchangeRates(): Promise<ApiResponse> {
        return this.wrapResponse(
            ApiService.post(`${this.basePath}/currencies/refresh-rates`)
        );
    }

    async getCurrencyConfiguration(): Promise<ApiResponse> {
        return this.wrapResponse(
            ApiService.get(`${this.basePath}/currencies/configuration`)
        );
    }

    async updateCurrencyConfiguration(config: {
        primaryCurrency: string;
        autoRefresh: boolean;
        refreshInterval: string;
    }): Promise<ApiResponse> {
        return this.wrapResponse(
            ApiService.put(`${this.basePath}/currencies/configuration`, config)
        );
    }
}

export const billingService = new BillingService();