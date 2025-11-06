// services/taxService.ts
import {
    TaxRate,
    TaxReport,
    TaxSummary,
    TaxCalculationRequest,
    TaxCalculationResponse,
    TaxValidationRequest,
    TaxValidationResponse,
    TaxCompliance,
    ApiResponse
} from '@/types/tax';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '/api';

class TaxService {
    private async fetchWithAuth(endpoint: string, options: RequestInit = {}) {
        const token = localStorage.getItem('auth_token');
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            ...options,
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
                ...options.headers,
            },
        });

        if (!response.ok) {
            throw new Error(`API Error: ${response.status}`);
        }

        return response.json();
    }

    // Tax Rates CRUD
    async getTaxRates(params: {
        page?: number;
        limit?: number;
        country?: string;
        state?: string;
        taxType?: string;
        active?: boolean;
        search?: string;
    }): Promise<ApiResponse<TaxRate[]>> {
        const queryParams = new URLSearchParams();
        Object.entries(params).forEach(([key, value]) => {
            if (value !== undefined && value !== null) {
                queryParams.append(key, value.toString());
            }
        });

        return this.fetchWithAuth(`/tax/rates?${queryParams}`);
    }

    async getTaxRateById(id: string): Promise<ApiResponse<TaxRate>> {
        return this.fetchWithAuth(`/tax/rates/${id}`);
    }

    async createTaxRate(data: Partial<TaxRate>): Promise<ApiResponse<TaxRate>> {
        return this.fetchWithAuth('/tax/rates', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }

    async updateTaxRate(id: string, data: Partial<TaxRate>): Promise<ApiResponse<TaxRate>> {
        return this.fetchWithAuth(`/tax/rates/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data),
        });
    }

    async deleteTaxRate(id: string): Promise<ApiResponse<null>> {
        return this.fetchWithAuth(`/tax/rates/${id}`, {
            method: 'DELETE',
        });
    }

    async bulkUpdateTaxRates(ids: string[], data: Partial<TaxRate>): Promise<ApiResponse<{ updated: number }>> {
        return this.fetchWithAuth('/tax/rates/bulk', {
            method: 'PATCH',
            body: JSON.stringify({ ids, data }),
        });
    }

    // Tax Calculation
    async calculateTax(data: TaxCalculationRequest): Promise<TaxCalculationResponse> {
        return this.fetchWithAuth('/tax/calculate', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }

    async bulkCalculateTax(requests: TaxCalculationRequest[]): Promise<ApiResponse<TaxCalculationResponse['data'][]>> {
        return this.fetchWithAuth('/tax/calculate/bulk', {
            method: 'POST',
            body: JSON.stringify({ transactions: requests }),
        });
    }

    // Tax Validation
    async validateTaxId(data: TaxValidationRequest): Promise<TaxValidationResponse> {
        return this.fetchWithAuth('/tax/validate', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }

    async bulkValidateTaxIds(requests: TaxValidationRequest[]): Promise<ApiResponse<TaxValidationResponse['data'][]>> {
        return this.fetchWithAuth('/tax/validate/bulk', {
            method: 'POST',
            body: JSON.stringify({ validations: requests }),
        });
    }

    // Reports & Analytics
    async getTaxReports(params: {
        startDate: string;
        endDate: string;
        country?: string;
        state?: string;
        groupBy?: string;
        taxType?: string;
    }): Promise<ApiResponse<TaxReport>> {
        const queryParams = new URLSearchParams();
        Object.entries(params).forEach(([key, value]) => {
            if (value) {
                queryParams.append(key, value);
            }
        });

        return this.fetchWithAuth(`/tax/reports?${queryParams}`);
    }

    async getTaxSummary(): Promise<ApiResponse<TaxSummary>> {
        return this.fetchWithAuth('/tax/summary');
    }

    async getTaxAnalytics(params: {
        period: '7d' | '30d' | '90d' | '1y';
        metric: 'revenue' | 'transactions' | 'tax_collected';
        groupBy: 'day' | 'week' | 'month';
    }): Promise<ApiResponse<any>> {
        const queryParams = new URLSearchParams();
        Object.entries(params).forEach(([key, value]) => {
            queryParams.append(key, value);
        });

        return this.fetchWithAuth(`/tax/analytics?${queryParams}`);
    }

    // Compliance
    async getComplianceStatus(params?: {
        country?: string;
        state?: string;
        status?: string;
    }): Promise<ApiResponse<TaxCompliance[]>> {
        const queryParams = new URLSearchParams();
        if (params) {
            Object.entries(params).forEach(([key, value]) => {
                if (value) {
                    queryParams.append(key, value);
                }
            });
        }

        return this.fetchWithAuth(`/tax/compliance?${queryParams}`);
    }

    async updateComplianceStatus(
        country: string,
        state: string,
        data: Partial<TaxCompliance>
    ): Promise<ApiResponse<TaxCompliance>> {
        return this.fetchWithAuth(`/tax/compliance/${country}/${state}`, {
            method: 'PUT',
            body: JSON.stringify(data),
        });
    }

    // Tax Jurisdictions
    async getJurisdictions(params?: {
        country?: string;
        type?: 'state' | 'county' | 'city';
    }): Promise<ApiResponse<Array<{
        code: string;
        name: string;
        type: string;
        country: string;
        parent?: string;
    }>>> {
        const queryParams = new URLSearchParams();
        if (params) {
            Object.entries(params).forEach(([key, value]) => {
                if (value) {
                    queryParams.append(key, value);
                }
            });
        }

        return this.fetchWithAuth(`/tax/jurisdictions?${queryParams}`);
    }

    // Tax Exemptions
    async getExemptions(params?: {
        customerId?: string;
        country?: string;
        state?: string;
    }): Promise<ApiResponse<Array<{
        id: string;
        customerId: string;
        country: string;
        state?: string;
        taxType: string;
        reason: string;
        certificateNumber?: string;
        effectiveFrom: string;
        effectiveTo?: string;
        active: boolean;
    }>>> {
        const queryParams = new URLSearchParams();
        if (params) {
            Object.entries(params).forEach(([key, value]) => {
                if (value) {
                    queryParams.append(key, value);
                }
            });
        }

        return this.fetchWithAuth(`/tax/exemptions?${queryParams}`);
    }

    async createExemption(data: any): Promise<ApiResponse<any>> {
        return this.fetchWithAuth('/tax/exemptions', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }

    // Tax Settings
    async getTaxSettings(): Promise<ApiResponse<{
        automaticCalculations: boolean;
        taxInclusivePricing: boolean;
        roundTax: boolean;
        defaultCountry: string;
        fallbackTaxRate: number;
        complianceAlerts: boolean;
    }>> {
        return this.fetchWithAuth('/tax/settings');
    }

    async updateTaxSettings(data: any): Promise<ApiResponse<any>> {
        return this.fetchWithAuth('/tax/settings', {
            method: 'PUT',
            body: JSON.stringify(data),
        });
    }

    // Export endpoints
    async exportTaxRates(format: 'csv' | 'json' | 'xlsx', params?: any): Promise<Blob> {
        const queryParams = new URLSearchParams();
        if (params) {
            Object.entries(params).forEach(([key, value]) => {
                if (value !== undefined && value !== null) {
                    queryParams.append(key, value.toString());
                }
            });
        }

        const response = await this.fetchWithAuth(`/tax/export/rates.${format}?${queryParams}`);
        return response.blob();
    }

    async exportTaxReport(format: 'csv' | 'json' | 'xlsx', params: any): Promise<Blob> {
        const queryParams = new URLSearchParams();
        Object.entries(params).forEach(([key, value]) => {
            if (value !== undefined && value !== null) {
                queryParams.append(key, value.toString());
            }
        });

        const response = await this.fetchWithAuth(`/tax/export/report.${format}?${queryParams}`);
        return response.blob();
    }
}

export const taxService = new TaxService();