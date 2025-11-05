import { TokenUtils } from '../../utils/token.utils';

// Base API configuration
const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
const BASE_PATH = '/payment-methods';

// Payment method types
export type PaymentMethodType = 'card' | 'bank_account' | 'digital_wallet' | 'crypto' | 'ach' | 'sepa';
export type PaymentProvider = 'stripe' | 'paypal' | 'square' | 'braintree' | 'adyen';
export type PaymentMethodStatus = 'active' | 'inactive' | 'expired' | 'failed' | 'pending_verification';

// Payment method interface
export interface PaymentMethod {
  _id: string;
  userId: string;
  token: string;
  provider: PaymentProvider;
  providerCustomerId: string;
  providerPaymentMethodId: string;
  type: PaymentMethodType;
  status: PaymentMethodStatus;
  isDefault: boolean;
  
  // Type-specific details
  cardDetails?: {
    brand: string;
    last4: string;
    expiryMonth: number;
    expiryYear: number;
    fingerprint?: string;
    funding?: string;
    country?: string;
    issuer?: string;
  };
  
  bankDetails?: {
    accountType: string;
    bankName?: string;
    last4?: string;
    routingNumber?: string;
    country?: string;
    currency?: string;
  };
  
  walletDetails?: {
    walletProvider: string;
    email?: string;
    phoneNumber?: string;
    deviceId?: string;
  };
  
  cryptoDetails?: {
    currency: string;
    network?: string;
    addressFingerprint?: string;
  };
  
  // Address and verification
  billingAddress?: {
    line1?: string;
    line2?: string;
    city?: string;
    state?: string;
    postalCode?: string;
    country: string;
  };
  
  verification?: {
    status: string;
    verificationMethod?: string;
    verifiedAt?: string;
    failureReason?: string;
  };
  
  // Usage analytics
  usage?: {
    totalTransactions: number;
    totalAmount: number;
    lastUsed?: string;
    firstUsed?: string;
    successfulTransactions: number;
    failedTransactions: number;
    successRate: number;
  };
  
  // Security
  security?: {
    riskScore: number;
    fraudFlags: Array<{
      flag: string;
      severity: string;
      detectedAt: string;
      resolved: boolean;
      resolvedAt?: string;
    }>;
    lastValidated?: string;
    validationFailures: number;
  };
  
  // Virtual fields
  isExpired?: boolean;
  displayName?: string;
  isValid?: boolean;
  securityLevel?: string;
  
  // Audit fields
  createdAt: string;
  updatedAt: string;
  createdBy?: {
    _id: string;
    name: string;
    email: string;
  };
}

// Create payment method data interface
export interface CreatePaymentMethodData {
  provider: PaymentProvider;
  paymentData: {
    // Stripe
    payment_method_id?: string;
    source_id?: string;
    
    // PayPal
    vault_id?: string;
    setup_token?: string;
    
    // Square
    verification_token?: string;
  };
  billingAddress?: {
    line1?: string;
    line2?: string;
    city?: string;
    state?: string;
    postalCode?: string;
    country: string;
  };
  setAsDefault?: boolean;
}

// Update payment method data interface
export interface UpdatePaymentMethodData {
  billingAddress?: {
    line1?: string;
    line2?: string;
    city?: string;
    state?: string;
    postalCode?: string;
    country: string;
  };
  setAsDefault?: boolean;
}

// List options interface
export interface PaymentMethodListOptions {
  page?: number;
  limit?: number;
  type?: PaymentMethodType | 'all';
  provider?: PaymentProvider | 'all';
  status?: PaymentMethodStatus | 'all';
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// Analytics interface
export interface PaymentMethodAnalytics {
  overview: {
    totalMethods: number;
    methodsByType: Record<string, number>;
    methodsByProvider: Record<string, number>;
    methodsByStatus: Record<string, number>;
  };
  usage: {
    totalTransactions: number;
    totalAmount: number;
    avgSuccessRate: number;
    totalSuccessful: number;
    totalFailed: number;
  };
  security: {
    avgRiskScore: number;
    highRiskCount: number;
    fraudFlagsCount: number;
  };
}

// API response interfaces
export interface PaymentMethodListResponse {
  success: boolean;
  data: {
    paymentMethods: PaymentMethod[];
    pagination: {
      currentPage: number;
      totalPages: number;
      totalItems: number;
      itemsPerPage: number;
      hasNextPage: boolean;
      hasPrevPage: boolean;
    };
  };
}

export interface PaymentMethodResponse {
  success: boolean;
  data: {
    paymentMethod: PaymentMethod;
  };
  message?: string;
}

export interface PaymentMethodAnalyticsResponse {
  success: boolean;
  data: {
    analytics: PaymentMethodAnalytics;
  };
}

/**
 * Payment Method Service
 * Handles all payment method API operations with PSP tokenization support
 */
class PaymentMethodService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = `${BASE_URL}${BASE_PATH}`;
  }

  /**
   * Get authorization headers with JWT token
   */
  private getHeaders(): HeadersInit {
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

  /**
   * Handle API response and errors
   */
  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      let errorMessage = `HTTP error! status: ${response.status}`;
      
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorData.error || errorMessage;
        
        // Handle validation errors
        if (errorData.errors && Array.isArray(errorData.errors)) {
          errorMessage = errorData.errors.map((err: any) => err.msg || err.message).join(', ');
        }
      } catch (e) {
        // Fallback to status text if JSON parsing fails
        errorMessage = response.statusText || errorMessage;
      }

      throw new Error(errorMessage);
    }

    return response.json();
  }

  /**
   * Get all payment methods for the authenticated user
   */
  async getPaymentMethods(options: PaymentMethodListOptions = {}): Promise<PaymentMethodListResponse> {
    const params = new URLSearchParams();
    
    if (options.page) params.set('page', options.page.toString());
    if (options.limit) params.set('limit', options.limit.toString());
    if (options.type) params.set('type', options.type);
    if (options.provider) params.set('provider', options.provider);
    if (options.status) params.set('status', options.status);
    if (options.sortBy) params.set('sortBy', options.sortBy);
    if (options.sortOrder) params.set('sortOrder', options.sortOrder);

    const url = `${this.baseUrl}?${params.toString()}`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: this.getHeaders()
    });

    return this.handleResponse<PaymentMethodListResponse>(response);
  }

  /**
   * Get a specific payment method by ID
   */
  async getPaymentMethod(id: string): Promise<PaymentMethodResponse> {
    const response = await fetch(`${this.baseUrl}/${id}`, {
      method: 'GET',
      headers: this.getHeaders()
    });

    return this.handleResponse<PaymentMethodResponse>(response);
  }

  /**
   * Create a new payment method with PSP tokenization
   */
  async createPaymentMethod(data: CreatePaymentMethodData): Promise<PaymentMethodResponse> {
    const response = await fetch(this.baseUrl, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(data)
    });

    return this.handleResponse<PaymentMethodResponse>(response);
  }

  /**
   * Update a payment method
   */
  async updatePaymentMethod(id: string, data: UpdatePaymentMethodData): Promise<PaymentMethodResponse> {
    const response = await fetch(`${this.baseUrl}/${id}`, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify(data)
    });

    return this.handleResponse<PaymentMethodResponse>(response);
  }

  /**
   * Set a payment method as default
   */
  async setDefaultPaymentMethod(id: string): Promise<PaymentMethodResponse> {
    const response = await fetch(`${this.baseUrl}/${id}/default`, {
      method: 'PUT',
      headers: this.getHeaders()
    });

    return this.handleResponse<PaymentMethodResponse>(response);
  }

  /**
   * Verify a payment method
   */
  async verifyPaymentMethod(id: string, verificationCode: string, verificationMethod: string): Promise<PaymentMethodResponse> {
    const response = await fetch(`${this.baseUrl}/${id}/verify`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({
        verificationCode,
        verificationMethod
      })
    });

    return this.handleResponse<PaymentMethodResponse>(response);
  }

  /**
   * Delete a payment method (soft delete)
   */
  async deletePaymentMethod(id: string): Promise<{ success: boolean; message: string }> {
    const response = await fetch(`${this.baseUrl}/${id}`, {
      method: 'DELETE',
      headers: this.getHeaders()
    });

    return this.handleResponse<{ success: boolean; message: string }>(response);
  }

  /**
   * Get payment method analytics
   */
  async getAnalytics(startDate?: string, endDate?: string): Promise<PaymentMethodAnalyticsResponse> {
    const params = new URLSearchParams();
    if (startDate) params.set('startDate', startDate);
    if (endDate) params.set('endDate', endDate);

    const url = `${this.baseUrl}/analytics?${params.toString()}`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: this.getHeaders()
    });

    return this.handleResponse<PaymentMethodAnalyticsResponse>(response);
  }

  /**
   * Perform bulk operations on payment methods (admin only)
   */
  async bulkOperation(operation: 'delete' | 'activate' | 'deactivate', paymentMethodIds: string[]): Promise<{ success: boolean; message: string; data: { affected: number } }> {
    const response = await fetch(`${this.baseUrl}/bulk`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({
        operation,
        paymentMethodIds
      })
    });

    return this.handleResponse<{ success: boolean; message: string; data: { affected: number } }>(response);
  }

  // Utility methods for UI

  /**
   * Format payment method display name
   */
  formatDisplayName(paymentMethod: PaymentMethod): string {
    if (paymentMethod.displayName) {
      return paymentMethod.displayName;
    }

    switch (paymentMethod.type) {
      case 'card':
        return `${paymentMethod.cardDetails?.brand?.toUpperCase() || 'CARD'} ****${paymentMethod.cardDetails?.last4 || '0000'}`;
      case 'bank_account':
        return `${paymentMethod.bankDetails?.bankName || 'Bank'} ****${paymentMethod.bankDetails?.last4 || '0000'}`;
      case 'digital_wallet':
        return paymentMethod.walletDetails?.walletProvider?.replace('_', ' ').toUpperCase() || 'Digital Wallet';
      case 'crypto':
        return `${paymentMethod.cryptoDetails?.currency?.toUpperCase() || 'CRYPTO'} Wallet`;
      default:
        return 'Payment Method';
    }
  }

  /**
   * Get payment method icon class/name
   */
  getPaymentMethodIcon(paymentMethod: PaymentMethod): string {
    switch (paymentMethod.type) {
      case 'card':
        switch (paymentMethod.cardDetails?.brand) {
          case 'visa': return 'cc-visa';
          case 'mastercard': return 'cc-mastercard';
          case 'amex': return 'cc-amex';
          case 'discover': return 'cc-discover';
          default: return 'credit-card';
        }
      case 'bank_account':
        return 'university';
      case 'digital_wallet':
        switch (paymentMethod.walletDetails?.walletProvider) {
          case 'paypal': return 'cc-paypal';
          case 'apple_pay': return 'cc-apple-pay';
          case 'google_pay': return 'google';
          default: return 'wallet';
        }
      case 'crypto':
        return 'bitcoin';
      default:
        return 'credit-card';
    }
  }

  /**
   * Format expiry date for cards
   */
  formatExpiryDate(paymentMethod: PaymentMethod): string {
    if (paymentMethod.type === 'card' && paymentMethod.cardDetails) {
      const { expiryMonth, expiryYear } = paymentMethod.cardDetails;
      if (expiryMonth && expiryYear) {
        return `${expiryMonth.toString().padStart(2, '0')}/${expiryYear.toString().slice(-2)}`;
      }
    }
    return 'N/A';
  }

  /**
   * Check if payment method is expired
   */
  isExpired(paymentMethod: PaymentMethod): boolean {
    if (paymentMethod.isExpired !== undefined) {
      return paymentMethod.isExpired;
    }

    if (paymentMethod.type === 'card' && paymentMethod.cardDetails) {
      const { expiryMonth, expiryYear } = paymentMethod.cardDetails;
      if (expiryMonth && expiryYear) {
        const now = new Date();
        const expiry = new Date(expiryYear, expiryMonth - 1, 1);
        return now > expiry;
      }
    }

    return false;
  }

  /**
   * Get security level badge variant
   */
  getSecurityLevelVariant(paymentMethod: PaymentMethod): 'default' | 'secondary' | 'destructive' | 'outline' {
    const level = paymentMethod.securityLevel;
    switch (level) {
      case 'high_risk': return 'destructive';
      case 'medium_risk': return 'outline';
      case 'low_risk': return 'secondary';
      case 'secure': return 'default';
      default: return 'secondary';
    }
  }

  /**
   * Format currency amount
   */
  formatAmount(amount: number, currency: string = 'USD'): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.toUpperCase()
    }).format(amount);
  }

  /**
   * Format success rate percentage
   */
  formatSuccessRate(rate: number): string {
    return `${Math.round(rate)}%`;
  }
}

// Export singleton instance
export const paymentMethodService = new PaymentMethodService();
export default paymentMethodService;