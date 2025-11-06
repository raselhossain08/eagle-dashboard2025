import ApiService from './shared/api.service';
import {
    Invoice,
    InvoiceResponse,
    CreateInvoiceRequest,
    RefundRequest,
    RefundResponse,
    EmailRequest,
    ExportFilters,
} from '@/types/invoice';

export const invoiceService = {
    // Get invoices with filters
    async getInvoices(params: {
        subscriber_id?: string;
        page?: number;
        limit?: number;
        start_date?: string;
        end_date?: string;
        status?: string;
    }): Promise<InvoiceResponse> {
        const queryString = new URLSearchParams(params as any).toString();
        return ApiService.get<InvoiceResponse>(`/invoices${queryString ? `?${queryString}` : ''}`);
    },

    // Get single invoice
    async getInvoice(id: string): Promise<{ success: boolean; data: Invoice }> {
        return ApiService.get<{ success: boolean; data: Invoice }>(`/invoices/${id}`);
    },

    // Create invoice
    async createInvoice(data: CreateInvoiceRequest): Promise<{ success: boolean; data: Invoice }> {
        return ApiService.post<{ success: boolean; data: Invoice }>('/invoices', data);
    },

    // Process refund
    async processRefund(invoiceId: string, data: RefundRequest): Promise<RefundResponse> {
        return ApiService.post<RefundResponse>(`/invoices/${invoiceId}/refund`, data);
    },

    // Generate PDF
    async generatePDF(invoiceId: string): Promise<{ success: boolean; data: { pdfUrl: string } }> {
        return ApiService.get<{ success: boolean; data: { pdfUrl: string } }>(`/invoices/${invoiceId}/pdf`);
    },

    // Send invoice via email
    async sendEmail(invoiceId: string, data: EmailRequest): Promise<{ success: boolean; message: string }> {
        return ApiService.post<{ success: boolean; message: string }>(`/invoices/${invoiceId}/send`, data);
    },

    // Export financial data
    async exportFinancials(filters: ExportFilters): Promise<{ success: boolean; data: any }> {
        const queryString = new URLSearchParams(filters as any).toString();
        return ApiService.get<{ success: boolean; data: any }>(`/invoices/export/financials${queryString ? `?${queryString}` : ''}`);
    },

    // Download PDF
    async downloadPDF(url: string): Promise<Blob> {
        // For blob downloads, we need to use fetch directly
        const response = await fetch(url, {
            headers: {
                'Authorization': `Bearer ${ApiService.getAuthToken()}`,
            },
            credentials: 'include',
        });
        if (!response.ok) {
            throw new Error('Failed to download PDF');
        }
        return response.blob();
    },
};