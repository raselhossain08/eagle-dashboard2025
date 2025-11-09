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

    async createCalculation(data: {
        baseAmount: number;
        taxAmount: number;
        totalAmount: number;
        jurisdiction: string;
        taxRateId: string;
    }): Promise<ApiResponse<any>> {
        return this.fetchWithAuth('/tax/calculations', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }

    async getCalculationHistory(params: {
        page?: number;
        limit?: number;
        userId?: string;
        jurisdiction?: string;
        startDate?: string;
        endDate?: string;
    }): Promise<ApiResponse<any[]>> {
        const queryParams = new URLSearchParams();
        Object.entries(params).forEach(([key, value]) => {
            if (value !== undefined && value !== null) {
                queryParams.append(key, value.toString());
            }
        });

        return this.fetchWithAuth(`/tax/calculations?${queryParams}`);
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

    // System Validation
    async runSystemValidation(params?: {
        jurisdictions?: string[];
        validationTypes?: string[];
        severity?: string[];
    }): Promise<ApiResponse<any>> {
        return this.fetchWithAuth('/tax/validation/system', {
            method: 'POST',
            body: JSON.stringify(params || {}),
        });
    }

    async getValidationResults(params?: {
        page?: number;
        limit?: number;
        severity?: string;
        status?: string;
        startDate?: string;
        endDate?: string;
    }): Promise<ApiResponse<any[]>> {
        const queryParams = new URLSearchParams();
        if (params) {
            Object.entries(params).forEach(([key, value]) => {
                if (value !== undefined && value !== null) {
                    queryParams.append(key, value.toString());
                }
            });
        }

        return this.fetchWithAuth(`/tax/validation/results?${queryParams}`);
    }

    async getValidationRules(): Promise<ApiResponse<any[]>> {
        return this.fetchWithAuth('/tax/validation/rules');
    }

    async updateValidationRule(id: string, data: any): Promise<ApiResponse<any>> {
        return this.fetchWithAuth(`/tax/validation/rules/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data),
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
        reportType?: string;
    }): Promise<ApiResponse<TaxReport>> {
        const queryParams = new URLSearchParams();
        Object.entries(params).forEach(([key, value]) => {
            if (value) {
                queryParams.append(key, value);
            }
        });

        return this.fetchWithAuth(`/tax/reports?${queryParams}`);
    }

    async getTaxSummary(params?: {
        period?: '7d' | '30d' | '90d' | '1y';
        includeComparison?: boolean;
        jurisdictions?: string[];
    }): Promise<ApiResponse<TaxSummary>> {
        const queryParams = new URLSearchParams();
        if (params) {
            Object.entries(params).forEach(([key, value]) => {
                if (value !== undefined && value !== null) {
                    if (Array.isArray(value)) {
                        value.forEach(v => queryParams.append(key, v));
                    } else {
                        queryParams.append(key, value.toString());
                    }
                }
            });
        }

        return this.fetchWithAuth(`/tax/summary?${queryParams}`);
    }

    async getTaxAnalytics(params: {
        period: '7d' | '30d' | '90d' | '1y';
        metric: 'revenue' | 'transactions' | 'tax_collected' | 'compliance';
        groupBy: 'day' | 'week' | 'month';
        jurisdictions?: string[];
    }): Promise<ApiResponse<any>> {
        const queryParams = new URLSearchParams();
        Object.entries(params).forEach(([key, value]) => {
            if (value !== undefined && value !== null) {
                if (Array.isArray(value)) {
                    value.forEach(v => queryParams.append(key, v));
                } else {
                    queryParams.append(key, value.toString());
                }
            }
        });

        return this.fetchWithAuth(`/tax/analytics?${queryParams}`);
    }

    async getTopJurisdictions(params: {
        metric: 'revenue' | 'transactions' | 'tax_collected';
        limit: number;
        period: string;
    }): Promise<ApiResponse<any[]>> {
        const queryParams = new URLSearchParams();
        Object.entries(params).forEach(([key, value]) => {
            queryParams.append(key, value.toString());
        });

        return this.fetchWithAuth(`/tax/analytics/top-jurisdictions?${queryParams}`);
    }

    async getRecentCalculations(limit: number = 10): Promise<ApiResponse<any[]>> {
        return this.fetchWithAuth(`/tax/analytics/recent-calculations?limit=${limit}`);
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

    async getComplianceSummary(): Promise<ApiResponse<any>> {
        return this.fetchWithAuth('/tax/compliance/summary');
    }

    async getComplianceDeadlines(params?: {
        upcoming?: boolean;
        overdue?: boolean;
        priority?: string;
        limit?: number;
    }): Promise<ApiResponse<any[]>> {
        const queryParams = new URLSearchParams();
        if (params) {
            Object.entries(params).forEach(([key, value]) => {
                if (value !== undefined && value !== null) {
                    queryParams.append(key, value.toString());
                }
            });
        }

        return this.fetchWithAuth(`/tax/compliance/deadlines?${queryParams}`);
    }

    async updateDeadlineStatus(id: string, status: string): Promise<ApiResponse<any>> {
        return this.fetchWithAuth(`/tax/compliance/deadlines/${id}`, {
            method: 'PATCH',
            body: JSON.stringify({ status }),
        });
    }

    async getComplianceAlerts(): Promise<ApiResponse<any[]>> {
        return this.fetchWithAuth('/tax/compliance/alerts');
    }

    async markAlertAsRead(alertId: string): Promise<ApiResponse<any>> {
        return this.fetchWithAuth(`/tax/compliance/alerts/${alertId}/read`, {
            method: 'POST',
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

    async updateExemption(id: string, data: any): Promise<ApiResponse<any>> {
        return this.fetchWithAuth(`/tax/exemptions/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data),
        });
    }

    async deleteExemption(id: string): Promise<ApiResponse<null>> {
        return this.fetchWithAuth(`/tax/exemptions/${id}`, {
            method: 'DELETE',
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
        validationRules: string[];
        notificationSettings: {
            email: boolean;
            sms: boolean;
            inApp: boolean;
        };
    }>> {
        return this.fetchWithAuth('/tax/settings');
    }

    async updateTaxSettings(data: any): Promise<ApiResponse<any>> {
        return this.fetchWithAuth('/tax/settings', {
            method: 'PUT',
            body: JSON.stringify(data),
        });
    }

    // Audit & Logging
    async getTaxAuditLog(params?: {
        page?: number;
        limit?: number;
        action?: string;
        userId?: string;
        startDate?: string;
        endDate?: string;
    }): Promise<ApiResponse<any[]>> {
        const queryParams = new URLSearchParams();
        if (params) {
            Object.entries(params).forEach(([key, value]) => {
                if (value !== undefined && value !== null) {
                    queryParams.append(key, value.toString());
                }
            });
        }

        return this.fetchWithAuth(`/tax/audit?${queryParams}`);
    }

    async logTaxAction(action: string, details: any): Promise<ApiResponse<any>> {
        return this.fetchWithAuth('/tax/audit/log', {
            method: 'POST',
            body: JSON.stringify({ action, details, timestamp: new Date().toISOString() }),
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

        const token = localStorage.getItem('auth_token');
        const response = await fetch(`${API_BASE_URL}/tax/export/rates.${format}?${queryParams}`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        if (!response.ok) {
            throw new Error(`Export failed: ${response.status}`);
        }

        return response.blob();
    }

    async exportTaxReport(format: 'csv' | 'json' | 'pdf' | 'xlsx', params: any): Promise<Blob> {
        const queryParams = new URLSearchParams();
        Object.entries(params).forEach(([key, value]) => {
            if (value !== undefined && value !== null) {
                queryParams.append(key, value.toString());
            }
        });

        const token = localStorage.getItem('auth_token');
        const response = await fetch(`${API_BASE_URL}/tax/export/report.${format}?${queryParams}`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        if (!response.ok) {
            throw new Error(`Export failed: ${response.status}`);
        }

        return response.blob();
    }

    async exportComplianceReport(format: 'csv' | 'json' | 'pdf' | 'xlsx', params?: any): Promise<Blob> {
        const queryParams = new URLSearchParams();
        if (params) {
            Object.entries(params).forEach(([key, value]) => {
                if (value !== undefined && value !== null) {
                    queryParams.append(key, value.toString());
                }
            });
        }

        const token = localStorage.getItem('auth_token');
        const response = await fetch(`${API_BASE_URL}/tax/export/compliance.${format}?${queryParams}`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        if (!response.ok) {
            throw new Error(`Export failed: ${response.status}`);
        }

        return response.blob();
    }

    async exportValidationResults(format: 'csv' | 'json' | 'xlsx', params?: any): Promise<Blob> {
        const queryParams = new URLSearchParams();
        if (params) {
            Object.entries(params).forEach(([key, value]) => {
                if (value !== undefined && value !== null) {
                    queryParams.append(key, value.toString());
                }
            });
        }

        const token = localStorage.getItem('auth_token');
        const response = await fetch(`${API_BASE_URL}/tax/export/validation.${format}?${queryParams}`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        if (!response.ok) {
            throw new Error(`Export failed: ${response.status}`);
        }

        return response.blob();
    }

    // File Upload for bulk operations
    async uploadTaxRatesFile(file: File): Promise<ApiResponse<{ imported: number; errors: any[] }>> {
        const formData = new FormData();
        formData.append('file', file);

        const token = localStorage.getItem('auth_token');
        const response = await fetch(`${API_BASE_URL}/tax/import/rates`, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${token}`,
            },
            body: formData,
        });

        if (!response.ok) {
            throw new Error(`Upload failed: ${response.status}`);
        }

        return response.json();
    }

    async uploadExemptionsFile(file: File): Promise<ApiResponse<{ imported: number; errors: any[] }>> {
        const formData = new FormData();
        formData.append('file', file);

        const token = localStorage.getItem('auth_token');
        const response = await fetch(`${API_BASE_URL}/tax/import/exemptions`, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${token}`,
            },
            body: formData,
        });

        if (!response.ok) {
            throw new Error(`Upload failed: ${response.status}`);
        }

        return response.json();
    }

    // Health Check
    async healthCheck(): Promise<ApiResponse<{
        status: 'healthy' | 'degraded' | 'unhealthy';
        timestamp: string;
        services: {
            database: boolean;
            cache: boolean;
            externalTaxApi: boolean;
        };
    }>> {
        return this.fetchWithAuth('/tax/health');
    }
}

export const taxService = new TaxService();