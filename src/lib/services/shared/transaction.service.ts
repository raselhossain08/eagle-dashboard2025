import ApiService from '../shared/api.service';

export interface Transaction {
  id: string;
  _id: string; // MongoDB ID
  transactionId: string; // Human-readable transaction ID
  userId: string;
  subscriptionId?: string;
  planId?: string;
  type: 'payment' | 'refund' | 'chargeback' | 'adjustment' | 'credit';
  status: 'pending' | 'completed' | 'failed' | 'cancelled' | 'processing';
  amount: number;
  netAmount: number; // Amount after fees
  totalFees: number; // Total fees charged
  currency: string;
  description: string;
  paymentMethod: PaymentMethodDetails;
  paymentReference?: string;
  pspReference?: string; // Payment service provider reference
  invoiceId?: string;
  metadata?: Record<string, any>;
  processedAt?: string;
  createdAt: string;
  updatedAt: string;
  customerSnapshot?: CustomerSnapshot;
  payout?: PayoutInfo;
  psp?: PSPInfo;
}

export interface PaymentMethodDetails {
  type: 'credit_card' | 'debit_card' | 'paypal' | 'stripe' | 'bank_transfer' | 'wallet';
  last4?: string;
  brand?: string;
  expiryMonth?: number;
  expiryYear?: number;
}

export interface CustomerSnapshot {
  id: string;
  name: string;
  email: string;
  phone?: string;
}

export interface PayoutInfo {
  status: 'pending' | 'processing' | 'paid' | 'failed';
  expectedDate?: string;
  paidDate?: string;
  amount: number;
}

export interface PSPInfo {
  provider: string;
  transactionId?: string;
  fees?: number;
}

export interface TransactionFilters {
  userId?: string;
  type?: string;
  status?: string;
  paymentMethod?: string;
  dateFrom?: string;
  dateTo?: string;
  amountMin?: number;
  amountMax?: number;
  page?: number;
  limit?: number;
  sortBy?: 'createdAt' | 'amount' | 'status';
  sortOrder?: 'asc' | 'desc';
}

export interface TransactionAnalytics {
  totalTransactions: number;
  totalAmount: number;
  averageAmount: number;
  successRate: number;
  byStatus: Record<string, number>;
  byType: Record<string, number>;
  byPaymentMethod: Record<string, number>;
  monthlyTrends: Array<{
    month: string;
    totalAmount: number;
    transactionCount: number;
  }>;
  topCustomers?: Array<{
    id: string;
    name: string;
    email: string;
    totalAmount: number;
    transactionCount: number;
  }>;
}

export interface CreateTransactionData {
  userId: string;
  subscriptionId?: string;
  planId?: string;
  type: 'payment' | 'refund' | 'chargeback' | 'adjustment' | 'credit';
  amount: number;
  currency: string;
  description: string;
  paymentMethod: PaymentMethodDetails | string; // Allow both for backwards compatibility
  paymentReference?: string;
  invoiceId?: string;
  metadata?: Record<string, any>;
}

export interface RefundData {
  transactionId: string;
  amount?: number; // If not provided, full refund
  reason: string;
  metadata?: Record<string, any>;
}

export class TransactionService {
  private static readonly ENDPOINT = '/transactions';

  async getTransactions(filters?: TransactionFilters): Promise<{
    transactions: Transaction[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    const queryParams = new URLSearchParams();
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, value.toString());
        }
      });
    }
    
    const response = await ApiService.get<{
      transactions: Transaction[];
      total: number;
      page: number;
      totalPages: number;
    }>(`${TransactionService.ENDPOINT}?${queryParams}`);
    
    return response;
  }

  async getTransaction(id: string): Promise<Transaction> {
    const response = await ApiService.get<Transaction>(`${TransactionService.ENDPOINT}/${id}`);
    return response;
  }

  async createTransaction(data: CreateTransactionData): Promise<Transaction> {
    const response = await ApiService.post<Transaction>(`${TransactionService.ENDPOINT}`, data);
    return response;
  }

  async updateTransaction(id: string, data: Partial<CreateTransactionData>): Promise<Transaction> {
    const response = await ApiService.put<Transaction>(`${TransactionService.ENDPOINT}/${id}`, data);
    return response;
  }

  async processRefund(refundData: RefundData): Promise<Transaction> {
    const response = await ApiService.post<Transaction>(`${TransactionService.ENDPOINT}/refund`, refundData);
    return response;
  }

  async getTransactionAnalytics(
    dateFrom?: string,
    dateTo?: string
  ): Promise<TransactionAnalytics> {
    const queryParams = new URLSearchParams();
    
    if (dateFrom) queryParams.append('dateFrom', dateFrom);
    if (dateTo) queryParams.append('dateTo', dateTo);
    
    const response = await ApiService.get<TransactionAnalytics>(
      `${TransactionService.ENDPOINT}/analytics?${queryParams}`
    );
    
    return response;
  }

  async getUserTransactions(userId: string, filters?: Omit<TransactionFilters, 'userId'>): Promise<{
    transactions: Transaction[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    const queryParams = new URLSearchParams();
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, value.toString());
        }
      });
    }
    
    const response = await ApiService.get<{
      transactions: Transaction[];
      total: number;
      page: number;
      totalPages: number;
    }>(`${TransactionService.ENDPOINT}/user/${userId}?${queryParams}`);
    
    return response;
  }

  async getSubscriptionTransactions(subscriptionId: string): Promise<Transaction[]> {
    const response = await ApiService.get<Transaction[]>(`${TransactionService.ENDPOINT}/subscription/${subscriptionId}`);
    return response;
  }

  async exportTransactions(filters?: TransactionFilters): Promise<Blob> {
    const queryParams = new URLSearchParams();
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, value.toString());
        }
      });
    }
    
    // Get token from cookies
    const getTokenFromCookies = () => {
      if (typeof window === 'undefined') return null;
      try {
        const cookies = document.cookie.split(';');
        const tokenCookie = cookies.find(cookie => cookie.trim().startsWith('admin_token='));
        return tokenCookie ? tokenCookie.split('=')[1].trim() : null;
      } catch {
        return null;
      }
    };

    const token = getTokenFromCookies();
    const response = await fetch(`/api${TransactionService.ENDPOINT}/export?${queryParams}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    
    if (!response.ok) {
      throw new Error('Failed to export transactions');
    }
    
    return response.blob();
  }

  // Utility methods
  getStatusColor(status: Transaction['status']): string {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      completed: 'bg-green-100 text-green-800',
      failed: 'bg-red-100 text-red-800',
      cancelled: 'bg-gray-100 text-gray-800',
      processing: 'bg-blue-100 text-blue-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  }

  getTypeColor(type: Transaction['type']): string {
    const colors = {
      payment: 'bg-green-100 text-green-800',
      refund: 'bg-orange-100 text-orange-800',
      chargeback: 'bg-red-100 text-red-800',
      adjustment: 'bg-blue-100 text-blue-800',
      credit: 'bg-purple-100 text-purple-800',
    };
    return colors[type] || 'bg-gray-100 text-gray-800';
  }

  formatAmount(amount: number, currency: string = 'USD'): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  }

  formatTransactionType(type: Transaction['type']): string {
    return type.charAt(0).toUpperCase() + type.slice(1);
  }

  formatPaymentMethod(method: Transaction['paymentMethod']): string {
    const methodType = typeof method === 'string' ? method : method.type;
    return methodType.split('_').map((word: string) => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  }
}

export const transactionService = new TransactionService();
export default transactionService;