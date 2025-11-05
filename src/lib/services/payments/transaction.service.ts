import { TokenUtils } from '../../utils/token.utils';

export interface PaymentMethod {
  type: 'card' | 'bank_transfer' | 'paypal' | 'stripe' | 'wallet' | 'crypto' | 'other';
  brand?: string;
  last4?: string;
  expiryMonth?: number;
  expiryYear?: number;
  country?: string;
  fingerprint?: string;
}

export interface PSPData {
  provider: 'stripe' | 'paypal' | 'adyen' | 'square' | 'razorpay' | 'other';
  chargeId?: string;
  paymentIntentId?: string;
  transactionFee?: number;
  exchangeRate?: number;
  providerData?: any;
}

export interface PayoutData {
  status: 'not_paid' | 'pending' | 'in_transit' | 'paid' | 'failed' | 'canceled';
  expectedDate?: string;
  paidDate?: string;
  payoutId?: string;
  bankAccount?: string;
  failureReason?: string;
  amount?: number;
  currency?: string;
}

export interface RiskAssessment {
  score?: number;
  level?: 'low' | 'medium' | 'high' | 'blocked';
  factors?: string[];
  reviewRequired?: boolean;
}

export interface DisputeData {
  isDisputed: boolean;
  disputeDate?: string;
  reason?: string;
  status?: 'open' | 'under_review' | 'won' | 'lost' | 'accepted';
  evidence?: string[];
  disputeAmount?: number;
}

export interface LocationData {
  ipAddress?: string;
  country?: string;
  city?: string;
  region?: string;
  timezone?: string;
}

export interface CustomerSnapshot {
  name?: string;
  email?: string;
  phone?: string;
}

export interface TransactionEvent {
  event: string;
  timestamp: string;
  data?: any;
  triggeredBy?: string;
}

export interface Transaction {
  _id: string;
  transactionId: string;
  pspReference: string;
  userId: string;
  invoiceId?: string;
  subscriptionId?: string;
  type: 'payment' | 'refund' | 'chargeback' | 'fee' | 'payout' | 'adjustment';
  status: 'pending' | 'processing' | 'succeeded' | 'failed' | 'cancelled' | 'expired' | 'disputed';
  amount: number;
  currency: 'USD' | 'EUR' | 'GBP' | 'CAD' | 'AUD' | 'BDT';
  processingFee: number;
  platformFee: number;
  totalFees: number;
  netAmount: number;
  paymentMethod: PaymentMethod;
  psp: PSPData;
  payout: PayoutData;
  riskAssessment?: RiskAssessment;
  dispute: DisputeData;
  location?: LocationData;
  processedAt?: string;
  settledAt?: string;
  refundedAt?: string;
  customerSnapshot?: CustomerSnapshot;
  description?: string;
  internalNotes?: string;
  tags?: string[];
  metadata?: any;
  events?: TransactionEvent[];
  createdBy?: string;
  updatedBy?: string;
  createdAt: string;
  updatedAt: string;
  // Virtual fields
  formattedAmount?: string;
  formattedNetAmount?: string;
  isRefundable?: boolean;
  daysSinceTransaction?: number;
  // Populated fields
  user?: {
    _id: string;
    name: string;
    email: string;
    role: string;
  };
  invoice?: {
    _id: string;
    invoiceNumber: string;
    totalAmount: number;
    status: string;
  };
  subscription?: {
    _id: string;
    planName: string;
    status: string;
  };
}

export interface TransactionFilters {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  status?: string;
  type?: string;
  provider?: string;
  userId?: string;
  invoiceId?: string;
  subscriptionId?: string;
  payoutStatus?: string;
  dateFrom?: string;
  dateTo?: string;
  minAmount?: number;
  maxAmount?: number;
  currency?: string;
  isDisputed?: boolean;
  search?: string;
}

export interface TransactionSummary {
  totalAmount: number;
  totalFees: number;
  totalNetAmount: number;
  successfulCount: number;
  pendingCount: number;
  failedCount: number;
  disputedCount: number;
}

export interface TransactionAnalytics {
  dateRange: {
    startDate: string;
    endDate: string;
  };
  revenue: Array<{
    _id: { year: number; month: number; day: number };
    totalAmount: number;
    totalFees: number;
    netAmount: number;
    transactionCount: number;
  }>;
  providers: Array<{
    _id: string;
    totalAmount: number;
    totalFees: number;
    transactionCount: number;
    avgAmount: number;
  }>;
  statusBreakdown: Array<{
    _id: string;
    count: number;
    totalAmount: number;
  }>;
  typeBreakdown: Array<{
    _id: string;
    count: number;
    totalAmount: number;
  }>;
  payoutBreakdown: Array<{
    _id: string;
    count: number;
    totalAmount: number;
  }>;
  disputes: any;
  topCustomers: Array<{
    userId: string;
    name: string;
    email: string;
    totalAmount: number;
    transactionCount: number;
  }>;
  highRiskTransactions: Transaction[];
}

export interface CreateTransactionData {
  userId: string;
  pspReference: string;
  type: 'payment' | 'refund' | 'chargeback' | 'fee' | 'payout' | 'adjustment';
  amount: number;
  currency: 'USD' | 'EUR' | 'GBP' | 'CAD' | 'AUD' | 'BDT';
  processingFee?: number;
  platformFee?: number;
  paymentMethod: PaymentMethod;
  psp: PSPData;
  invoiceId?: string;
  subscriptionId?: string;
  description?: string;
  location?: LocationData;
  riskAssessment?: RiskAssessment;
  metadata?: any;
}

export interface RefundData {
  amount?: number;
  reason: string;
}

export interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalDocs: number;
  limit: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface TransactionsResponse {
  success: boolean;
  data: Transaction[];
  pagination: PaginationInfo;
  summary: TransactionSummary;
  filters: Partial<TransactionFilters>;
}

export interface SingleTransactionResponse {
  success: boolean;
  data: Transaction;
}

export interface AnalyticsResponse {
  success: boolean;
  data: TransactionAnalytics;
}

export interface PendingPayoutsResponse {
  success: boolean;
  data: Transaction[];
  pagination: PaginationInfo;
}

const BASE_URL = process.env.NODE_ENV === 'production' 
  ? process.env.NEXT_PUBLIC_API_URL || 'https://eagle-backend.vercel.app'
  : 'http://localhost:5000';

const BASE_PATH = '/api/transactions';

class TransactionService {
  private getAuthHeaders(): HeadersInit {
    // Get token from cookie or local storage - placeholder implementation
    const token = null; // TokenUtils.getToken();
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
  }

  // Get all transactions with filtering and pagination
  async getTransactions(filters: TransactionFilters = {}): Promise<TransactionsResponse> {
    try {
      const queryParams = new URLSearchParams();
      
      // Add all filters to query parameters
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          queryParams.append(key, String(value));
        }
      });

      const response = await fetch(`${BASE_URL}${BASE_PATH}?${queryParams}`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching transactions:', error);
      throw error;
    }
  }

  // Get single transaction by ID
  async getTransaction(id: string): Promise<SingleTransactionResponse> {
    try {
      const response = await fetch(`${BASE_URL}${BASE_PATH}/${id}`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching transaction:', error);
      throw error;
    }
  }

  // Create new transaction
  async createTransaction(data: CreateTransactionData): Promise<SingleTransactionResponse> {
    try {
      const response = await fetch(`${BASE_URL}${BASE_PATH}`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        credentials: 'include',
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error creating transaction:', error);
      throw error;
    }
  }

  // Update transaction
  async updateTransaction(id: string, data: Partial<Transaction>): Promise<SingleTransactionResponse> {
    try {
      const response = await fetch(`${BASE_URL}${BASE_PATH}/${id}`, {
        method: 'PUT',
        headers: this.getAuthHeaders(),
        credentials: 'include',
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error updating transaction:', error);
      throw error;
    }
  }

  // Process refund
  async processRefund(id: string, data: RefundData): Promise<SingleTransactionResponse> {
    try {
      const response = await fetch(`${BASE_URL}${BASE_PATH}/${id}/refund`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        credentials: 'include',
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error processing refund:', error);
      throw error;
    }
  }

  // Mark as disputed
  async markAsDisputed(id: string, data: Partial<DisputeData>): Promise<SingleTransactionResponse> {
    try {
      const response = await fetch(`${BASE_URL}${BASE_PATH}/${id}/dispute`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        credentials: 'include',
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error marking as disputed:', error);
      throw error;
    }
  }

  // Update payout status
  async updatePayoutStatus(id: string, data: Partial<PayoutData>): Promise<SingleTransactionResponse> {
    try {
      const response = await fetch(`${BASE_URL}${BASE_PATH}/${id}/payout`, {
        method: 'PUT',
        headers: this.getAuthHeaders(),
        credentials: 'include',
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error updating payout status:', error);
      throw error;
    }
  }

  // Get analytics
  async getAnalytics(params: {
    startDate?: string;
    endDate?: string;
    groupBy?: 'day' | 'week' | 'month';
  } = {}): Promise<AnalyticsResponse> {
    try {
      const queryParams = new URLSearchParams();
      
      Object.entries(params).forEach(([key, value]) => {
        if (value) {
          queryParams.append(key, String(value));
        }
      });

      const response = await fetch(`${BASE_URL}${BASE_PATH}/analytics?${queryParams}`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching analytics:', error);
      throw error;
    }
  }

  // Get pending payouts
  async getPendingPayouts(filters: Partial<TransactionFilters> = {}): Promise<PendingPayoutsResponse> {
    try {
      const queryParams = new URLSearchParams();
      
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          queryParams.append(key, String(value));
        }
      });

      const response = await fetch(`${BASE_URL}${BASE_PATH}/pending-payouts?${queryParams}`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching pending payouts:', error);
      throw error;
    }
  }

  // Search by PSP reference
  async searchByPspReference(pspReference: string): Promise<SingleTransactionResponse> {
    try {
      const response = await fetch(`${BASE_URL}${BASE_PATH}/psp/${encodeURIComponent(pspReference)}`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error searching by PSP reference:', error);
      throw error;
    }
  }

  // Delete/Cancel transaction
  async deleteTransaction(id: string): Promise<{ success: boolean; message: string }> {
    try {
      const response = await fetch(`${BASE_URL}${BASE_PATH}/${id}`, {
        method: 'DELETE',
        headers: this.getAuthHeaders(),
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error deleting transaction:', error);
      throw error;
    }
  }

  // Utility methods for formatting
  formatAmount(amount: number, currency: string): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
    }).format(amount);
  }

  getStatusColor(status: string): string {
    const statusColors: Record<string, string> = {
      pending: 'bg-yellow-100 text-yellow-800',
      processing: 'bg-blue-100 text-blue-800',
      succeeded: 'bg-green-100 text-green-800',
      failed: 'bg-red-100 text-red-800',
      cancelled: 'bg-gray-100 text-gray-800',
      expired: 'bg-orange-100 text-orange-800',
      disputed: 'bg-purple-100 text-purple-800',
    };
    return statusColors[status] || 'bg-gray-100 text-gray-800';
  }

  getTypeColor(type: string): string {
    const typeColors: Record<string, string> = {
      payment: 'bg-green-100 text-green-800',
      refund: 'bg-orange-100 text-orange-800',
      chargeback: 'bg-red-100 text-red-800',
      fee: 'bg-blue-100 text-blue-800',
      payout: 'bg-purple-100 text-purple-800',
      adjustment: 'bg-yellow-100 text-yellow-800',
    };
    return typeColors[type] || 'bg-gray-100 text-gray-800';
  }

  getPayoutStatusColor(status: string): string {
    const statusColors: Record<string, string> = {
      not_paid: 'bg-gray-100 text-gray-800',
      pending: 'bg-yellow-100 text-yellow-800',
      in_transit: 'bg-blue-100 text-blue-800',
      paid: 'bg-green-100 text-green-800',
      failed: 'bg-red-100 text-red-800',
      canceled: 'bg-gray-100 text-gray-800',
    };
    return statusColors[status] || 'bg-gray-100 text-gray-800';
  }

  getRiskLevelColor(level: string): string {
    const levelColors: Record<string, string> = {
      low: 'bg-green-100 text-green-800',
      medium: 'bg-yellow-100 text-yellow-800',
      high: 'bg-orange-100 text-orange-800',
      blocked: 'bg-red-100 text-red-800',
    };
    return levelColors[level] || 'bg-gray-100 text-gray-800';
  }
}

export const transactionService = new TransactionService();