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

class BillingService {
    private baseUrl = '/api/billing';
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

        return this.request<TaxRate[]>(`/tax-rates?${queryParams}`);
    }

    async createTaxRate(data: Partial<TaxRate>): Promise<ApiResponse<TaxRate>> {
        return this.request<TaxRate>('/tax-rates', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }

    async updateTaxRate(id: string, data: Partial<TaxRate>): Promise<ApiResponse<TaxRate>> {
        return this.request<TaxRate>(`/tax-rates/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data),
        });
    }

    async deleteTaxRate(id: string): Promise<ApiResponse<void>> {
        return this.request<void>(`/tax-rates/${id}`, {
            method: 'DELETE',
        });
    }
    async handlePayPalWebhook(data: any): Promise<ApiResponse<any>> {
        return this.request('/webhooks/paypal', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }
    // Bulk operations for invoices
    async bulkUpdateInvoices(ids: string[], updates: Partial<Invoice>): Promise<ApiResponse<void>> {
        return this.request('/invoices/bulk-update', {
            method: 'POST',
            body: JSON.stringify({ ids, updates }),
        });
    }
    async validateTaxRate(data: Partial<TaxRate>): Promise<ApiResponse<{ valid: boolean; message?: string }>> {
        return this.request('/tax-rates/validate', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }
    // Tax Calculation
    async calculateTax(data: TaxCalculationRequest): Promise<ApiResponse<TaxCalculationResponse>> {
        return this.request<TaxCalculationResponse>('/calculate-tax', {
            method: 'POST',
            body: JSON.stringify(data),
        });
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

        return this.request<TaxRate[]>(`/applicable-tax-rates?${queryParams}`);
    }

    // Invoices
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

        return this.request<Invoice[]>(`/invoices?${queryParams}`);
    }

    async getInvoice(id: string): Promise<ApiResponse<Invoice>> {
        return this.request<Invoice>(`/invoices/${id}`);
    }

    async createInvoice(data: Partial<Invoice>): Promise<ApiResponse<Invoice>> {
        return this.request<Invoice>('/invoices', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }

    async updateInvoice(id: string, data: Partial<Invoice>): Promise<ApiResponse<Invoice>> {
        return this.request<Invoice>(`/invoices/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data),
        });
    }

    async voidInvoice(id: string, reason: string): Promise<ApiResponse<Invoice>> {
        return this.request<Invoice>(`/invoices/${id}/void`, {
            method: 'POST',
            body: JSON.stringify({ reason }),
        });
    }

    async markInvoicePaid(id: string, data: {
        paymentAmount: number;
        paymentDate: string;
        paymentMethod: string;
        transactionId: string;
    }): Promise<ApiResponse<Invoice>> {
        return this.request<Invoice>(`/invoices/${id}/mark-paid`, {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }

    async generateInvoicePdf(id: string, templateId?: string): Promise<ApiResponse<{ pdfUrl: string }>> {
        return this.request<{ pdfUrl: string }>(`/invoices/${id}/generate-pdf`, {
            method: 'POST',
            body: JSON.stringify({ templateId }),
        });
    }

    async sendInvoiceEmail(id: string, data: {
        to: string;
        cc?: string[];
        subject?: string;
    }): Promise<ApiResponse<void>> {
        return this.request<void>(`/invoices/${id}/send-email`, {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }

    async resendInvoiceEmail(id: string): Promise<ApiResponse<void>> {
        return this.request<void>(`/invoices/${id}/resend-email`, {
            method: 'POST',
        });
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

        return this.request<Receipt[]>(`/receipts?${queryParams}`);
    }

    async resendReceiptEmail(id: string): Promise<ApiResponse<void>> {
        return this.request<void>(`/receipts/${id}/resend-email`, {
            method: 'POST',
        });
    }

    // Dashboard & Analytics
    async getDashboard(period: string = '30d', currency: string = 'USD'): Promise<ApiResponse<BillingDashboard>> {
        return this.request<BillingDashboard>(`/dashboard?period=${period}&currency=${currency}`);
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

        return this.request<any>(`/export?${queryParams}`);
    }

    // Currencies
    async getCurrencies(): Promise<ApiResponse<Currency[]>> {
        return this.request<Currency[]>('/currencies');
    }
}

export const billingService = new BillingService();