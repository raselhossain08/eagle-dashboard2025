import { TokenUtils } from '@/lib/utils/token.utils';

export interface InvoiceLineItem {
  id?: string;
  description: string;
  quantity: number;
  unitPrice: number;
  discount?: number;
  taxRate?: number;
  total?: number;
}

export interface InvoiceCustomerInfo {
  name: string;
  email: string;
  phone?: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    country?: string;
  };
}

export interface InvoicePaymentInfo {
  totalPaid: number;
  paidAmount: number;
  remainingBalance: number;
  paidDate?: Date;
  paymentHistory: Array<{
    amount: number;
    method: 'card' | 'bank_transfer' | 'paypal' | 'stripe' | 'cash' | 'check' | 'other';
    transactionId?: string;
    date: Date;
    notes?: string;
  }>;
}

export interface InvoiceStatusHistory {
  status: InvoiceStatus;
  timestamp: Date;
  changedBy: string;
  notes?: string;
}

export type InvoiceStatus = 'draft' | 'sent' | 'viewed' | 'partially_paid' | 'paid' | 'overdue' | 'cancelled' | 'refunded';

export interface Invoice {
  _id: string;
  invoiceNumber: string;
  userId: string;
  subscriptionId?: string;
  status: InvoiceStatus;
  issueDate: Date;
  dueDate: Date;
  currency: 'USD' | 'EUR' | 'GBP' | 'CAD' | 'AUD' | 'BDT';
  lineItems: InvoiceLineItem[];
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  discountAmount: number;
  total: number;
  customerInfo: InvoiceCustomerInfo;
  paymentInfo: InvoicePaymentInfo;
  notes?: string;
  statusHistory: InvoiceStatusHistory[];
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface InvoiceAnalytics {
  period: string;
  dateRange: {
    startDate: Date;
    endDate: Date;
  };
  summary: {
    totalInvoices: number;
    totalAmount: number;
    paidInvoices: number;
    paidAmount: number;
    overdueInvoices: number;
    overdueAmount: number;
    newInvoices: number;
    newInvoicesAmount: number;
  };
  breakdown: {
    byStatus: Array<{ _id: InvoiceStatus; count: number; totalAmount: number }>;
    byCurrency: Array<{ _id: string; count: number; totalAmount: number }>;
  };
}

export interface CreateInvoiceRequest {
  userId: string;
  subscriptionId?: string;
  invoiceNumber?: string;
  issueDate: string;
  dueDate: string;
  currency: 'USD' | 'EUR' | 'GBP' | 'CAD' | 'AUD' | 'BDT';
  lineItems: Omit<InvoiceLineItem, 'id' | 'total'>[];
  taxRate?: number;
  discountAmount?: number;
  customerInfo?: InvoiceCustomerInfo;
  notes?: string;
}

export interface UpdateInvoiceRequest extends Partial<CreateInvoiceRequest> {}

export interface RecordPaymentRequest {
  amount: number;
  method: 'card' | 'bank_transfer' | 'paypal' | 'stripe' | 'cash' | 'check' | 'other';
  transactionId?: string;
  notes?: string;
}

export interface SendInvoiceRequest {
  email?: string;
  message?: string;
}

export interface InvoiceFilters {
  page?: number;
  limit?: number;
  status?: InvoiceStatus;
  userId?: string;
  currency?: string;
  dueDate?: string;
  issueDate?: string;
  overdue?: boolean;
  sortBy?: 'createdAt' | 'dueDate' | 'total' | 'invoiceNumber';
  sortOrder?: 'asc' | 'desc';
  search?: string;
}

export interface PaginationInfo {
  page: number;
  pages: number;
  total: number;
  limit: number;
}

export interface InvoiceResponse {
  success: boolean;
  data: Invoice;
  message?: string;
}

export interface InvoicesListResponse {
  success: boolean;
  data: Invoice[];
  pagination: PaginationInfo;
}

export interface InvoiceAnalyticsResponse {
  success: boolean;
  data: InvoiceAnalytics;
}

class InvoiceService {
  private readonly BASE_PATH = '/invoices';
  private readonly API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

  private getHeaders(): HeadersInit {
    const token = TokenUtils.getToken();
    return {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    };
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
      throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
    }
    return response.json();
  }

  // Get all invoices with filtering and pagination
  async getAllInvoices(filters: InvoiceFilters = {}): Promise<InvoicesListResponse> {
    const params = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        params.append(key, String(value));
      }
    });

    const response = await fetch(
      `${this.API_BASE_URL}${this.BASE_PATH}?${params}`,
      {
        method: 'GET',
        headers: this.getHeaders(),
      }
    );

    return this.handleResponse<InvoicesListResponse>(response);
  }

  // Get invoice by ID
  async getInvoiceById(id: string): Promise<InvoiceResponse> {
    const response = await fetch(
      `${this.API_BASE_URL}${this.BASE_PATH}/${id}`,
      {
        method: 'GET',
        headers: this.getHeaders(),
      }
    );

    return this.handleResponse<InvoiceResponse>(response);
  }

  // Create new invoice
  async createInvoice(invoiceData: CreateInvoiceRequest): Promise<InvoiceResponse> {
    const response = await fetch(
      `${this.API_BASE_URL}${this.BASE_PATH}`,
      {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(invoiceData),
      }
    );

    return this.handleResponse<InvoiceResponse>(response);
  }

  // Update invoice
  async updateInvoice(id: string, updates: UpdateInvoiceRequest): Promise<InvoiceResponse> {
    const response = await fetch(
      `${this.API_BASE_URL}${this.BASE_PATH}/${id}`,
      {
        method: 'PUT',
        headers: this.getHeaders(),
        body: JSON.stringify(updates),
      }
    );

    return this.handleResponse<InvoiceResponse>(response);
  }

  // Send invoice to customer
  async sendInvoice(id: string, sendData: SendInvoiceRequest = {}): Promise<InvoiceResponse> {
    const response = await fetch(
      `${this.API_BASE_URL}${this.BASE_PATH}/${id}/send`,
      {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(sendData),
      }
    );

    return this.handleResponse<InvoiceResponse>(response);
  }

  // Record payment for invoice
  async recordPayment(id: string, paymentData: RecordPaymentRequest): Promise<InvoiceResponse> {
    const response = await fetch(
      `${this.API_BASE_URL}${this.BASE_PATH}/${id}/payment`,
      {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(paymentData),
      }
    );

    return this.handleResponse<InvoiceResponse>(response);
  }

  // Cancel invoice
  async cancelInvoice(id: string, reason?: string): Promise<InvoiceResponse> {
    const response = await fetch(
      `${this.API_BASE_URL}${this.BASE_PATH}/${id}/cancel`,
      {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({ reason }),
      }
    );

    return this.handleResponse<InvoiceResponse>(response);
  }

  // Delete invoice
  async deleteInvoice(id: string): Promise<{ success: boolean; message: string }> {
    const response = await fetch(
      `${this.API_BASE_URL}${this.BASE_PATH}/${id}`,
      {
        method: 'DELETE',
        headers: this.getHeaders(),
      }
    );

    return this.handleResponse<{ success: boolean; message: string }>(response);
  }

  // Get user's invoices
  async getUserInvoices(userId: string, filters: Omit<InvoiceFilters, 'userId'> = {}): Promise<InvoicesListResponse> {
    const params = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        params.append(key, String(value));
      }
    });

    const response = await fetch(
      `${this.API_BASE_URL}${this.BASE_PATH}/user/${userId}?${params}`,
      {
        method: 'GET',
        headers: this.getHeaders(),
      }
    );

    return this.handleResponse<InvoicesListResponse>(response);
  }

  // Get invoice analytics
  async getInvoiceAnalytics(period: '7d' | '30d' | '90d' | '1y' = '30d'): Promise<InvoiceAnalyticsResponse> {
    const response = await fetch(
      `${this.API_BASE_URL}${this.BASE_PATH}/analytics?period=${period}`,
      {
        method: 'GET',
        headers: this.getHeaders(),
      }
    );

    return this.handleResponse<InvoiceAnalyticsResponse>(response);
  }

  // Get overdue invoices
  async getOverdueInvoices(): Promise<InvoicesListResponse> {
    const response = await fetch(
      `${this.API_BASE_URL}${this.BASE_PATH}/overdue`,
      {
        method: 'GET',
        headers: this.getHeaders(),
      }
    );

    return this.handleResponse<InvoicesListResponse>(response);
  }

  // Get invoices due soon
  async getInvoicesDueSoon(days: number = 7): Promise<InvoicesListResponse> {
    const response = await fetch(
      `${this.API_BASE_URL}${this.BASE_PATH}/due-soon?days=${days}`,
      {
        method: 'GET',
        headers: this.getHeaders(),
      }
    );

    return this.handleResponse<InvoicesListResponse>(response);
  }

  // Utility methods
  formatCurrency(amount: number, currency: string = 'USD'): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  }

  getStatusColor(status: InvoiceStatus): string {
    const statusColors: Record<InvoiceStatus, string> = {
      draft: 'bg-gray-100 text-gray-800',
      sent: 'bg-blue-100 text-blue-800',
      viewed: 'bg-yellow-100 text-yellow-800',
      partially_paid: 'bg-orange-100 text-orange-800',
      paid: 'bg-green-100 text-green-800',
      overdue: 'bg-red-100 text-red-800',
      cancelled: 'bg-gray-100 text-gray-800',
      refunded: 'bg-purple-100 text-purple-800',
    };
    
    return statusColors[status] || 'bg-gray-100 text-gray-800';
  }

  isOverdue(invoice: Invoice): boolean {
    return new Date(invoice.dueDate) < new Date() && 
           ['sent', 'viewed', 'partially_paid'].includes(invoice.status);
  }

  calculatePaymentProgress(invoice: Invoice): number {
    if (invoice.total === 0) return 0;
    return Math.round((invoice.paymentInfo.paidAmount / invoice.total) * 100);
  }

  getDaysUntilDue(invoice: Invoice): number {
    const today = new Date();
    const dueDate = new Date(invoice.dueDate);
    const diffTime = dueDate.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  generateInvoiceNumber(): string {
    const prefix = 'INV';
    const timestamp = Date.now().toString();
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `${prefix}-${timestamp.slice(-6)}-${random}`;
  }
}

export const invoiceService = new InvoiceService();