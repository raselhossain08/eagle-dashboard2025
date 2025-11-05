// Invoice Service
import ApiService from '../shared/api.service';

export interface Invoice {
  id: string;
  subscriptionId: string;
  amount: number;
  currency: string;
  status: InvoiceStatus;
  dueDate: Date;
  paidDate?: Date;
  description: string;
  lineItems: InvoiceLineItem[];
  tax: number;
  discount: number;
  total: number;
  paymentMethodId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface InvoiceLineItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  amount: number;
}

export enum InvoiceStatus {
  DRAFT = 'draft',
  PENDING = 'pending',
  PAID = 'paid',
  OVERDUE = 'overdue',
  CANCELLED = 'cancelled',
  REFUNDED = 'refunded'
}

export interface InvoiceFilters {
  status?: InvoiceStatus;
  subscriptionId?: string;
  startDate?: Date;
  endDate?: Date;
  minAmount?: number;
  maxAmount?: number;
  page?: number;
  limit?: number;
}

export interface CreateInvoiceRequest {
  subscriptionId: string;
  description: string;
  lineItems: Omit<InvoiceLineItem, 'id'>[];
  dueDate: Date;
  paymentMethodId?: string;
}

export interface RecordPaymentRequest {
  amount: number;
  paymentMethodId: string;
  paymentDate?: Date;
  notes?: string;
}

export interface InvoiceAnalytics {
  totalInvoices: number;
  totalRevenue: number;
  paidInvoices: number;
  pendingInvoices: number;
  overdueInvoices: number;
  averageInvoiceAmount: number;
  monthlyRevenue: Array<{
    month: string;
    revenue: number;
    count: number;
  }>;
  statusDistribution: Array<{
    status: InvoiceStatus;
    count: number;
    percentage: number;
  }>;
}

class InvoiceService {
  private readonly endpoint = '/invoices';

  async getInvoices(filters: InvoiceFilters = {}): Promise<{
    invoices: Invoice[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined) {
        params.append(key, value.toString());
      }
    });

    return ApiService.get(`${this.endpoint}?${params.toString()}`);
  }

  async getInvoiceById(id: string): Promise<Invoice> {
    return ApiService.get(`${this.endpoint}/${id}`);
  }

  async createInvoice(data: CreateInvoiceRequest): Promise<Invoice> {
    return ApiService.post(this.endpoint, data);
  }

  async updateInvoice(id: string, data: Partial<CreateInvoiceRequest>): Promise<Invoice> {
    return ApiService.put(`${this.endpoint}/${id}`, data);
  }

  async deleteInvoice(id: string): Promise<void> {
    return ApiService.delete(`${this.endpoint}/${id}`);
  }

  async recordPayment(id: string, data: RecordPaymentRequest): Promise<Invoice> {
    return ApiService.post(`${this.endpoint}/${id}/payments`, data);
  }

  async sendInvoice(id: string): Promise<void> {
    return ApiService.post(`${this.endpoint}/${id}/send`);
  }

  async downloadInvoice(id: string): Promise<Blob> {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}${this.endpoint}/${id}/download`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${ApiService.getToken()}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to download invoice');
    }

    return response.blob();
  }

  async getAnalytics(startDate?: Date, endDate?: Date): Promise<InvoiceAnalytics> {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate.toISOString());
    if (endDate) params.append('endDate', endDate.toISOString());

    return ApiService.get(`${this.endpoint}/analytics?${params.toString()}`);
  }

  async markAsPaid(id: string, paymentDate?: Date): Promise<Invoice> {
    return ApiService.post(`${this.endpoint}/${id}/mark-paid`, { paymentDate });
  }

  async markAsOverdue(id: string): Promise<Invoice> {
    return ApiService.post(`${this.endpoint}/${id}/mark-overdue`);
  }

  async cancelInvoice(id: string, reason?: string): Promise<Invoice> {
    return ApiService.post(`${this.endpoint}/${id}/cancel`, { reason });
  }
}

export const invoiceService = new InvoiceService();
export default invoiceService;