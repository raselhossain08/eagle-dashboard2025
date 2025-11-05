import { TokenUtils } from '../../utils/token.utils';

// Base API configuration
const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
const BASE_PATH = '/discounts';

// Types and Interfaces
export interface Constraints {
  maxTotalUses?: number | null;
  maxUsesPerUser?: number | null;
  minimumOrderAmount?: number;
  maximumOrderAmount?: number | null;
  maximumDiscountAmount?: number | null;
  validFrom?: string;
  validUntil?: string | null;
  eligibleUserRoles?: string[];
  eligibleUserIds?: string[];
  excludedUserIds?: string[];
  applicableProducts?: {
    productType: 'subscription' | 'course' | 'mentorship' | 'all';
    productIds: string[];
  }[];
  allowedCountries?: string[];
  excludedCountries?: string[];
  firstTimeUsersOnly?: boolean;
  stackable?: boolean;
  validDaysOfWeek?: number[];
  validTimeRange?: {
    startTime?: string;
    endTime?: string;
  };
}

export interface BuyXGetY {
  buyQuantity: number;
  getQuantity: number;
  discountPercent?: number;
}

export interface UsageTracking {
  _id: string;
  userId: string;
  orderId?: string;
  usedAt: string;
  discountAmount: number;
  originalAmount: number;
  finalAmount: number;
  metadata?: any;
}

export interface Analytics {
  totalUses: number;
  totalDiscountAmount: number;
  totalOrderValue: number;
  uniqueUsers: number;
  averageDiscountAmount: number;
  conversionRate: number;
  lastUsedAt?: string;
  firstUsedAt?: string;
}

export interface Campaign {
  name?: string;
  channel?: 'email' | 'social' | 'affiliate' | 'referral' | 'organic' | 'paid_ads' | 'other';
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
}

export interface User {
  _id: string;
  name: string;
  email: string;
}

export interface Discount {
  _id?: string;
  code: string;
  name: string;
  description?: string;
  type: 'percentage' | 'fixed_amount' | 'buy_x_get_y' | 'free_shipping';
  value?: number;
  currency?: string;
  buyXGetY?: BuyXGetY;
  status: 'active' | 'inactive' | 'expired' | 'exhausted' | 'scheduled';
  isPublic?: boolean;
  constraints?: Constraints;
  usageTracking?: UsageTracking[];
  analytics: Analytics;
  campaign?: Campaign;
  createdBy?: string | User;
  updatedBy?: string | User;
  approvalStatus?: 'pending' | 'approved' | 'rejected';
  approvedBy?: string | User;
  approvedAt?: string;
  rejectionReason?: string;
  autoDeactivate?: {
    enabled: boolean;
    conditions: {
      maxUses?: number;
      maxAmount?: number;
      date?: string;
    };
  };
  createdAt?: string;
  updatedAt?: string;
  // Virtual fields
  isExpired?: boolean;
  isValid?: boolean;
  remainingUses?: number | null;
  usagePercentage?: number;
}

export interface CreateDiscountData {
  code: string;
  name: string;
  description?: string;
  type: 'percentage' | 'fixed_amount' | 'buy_x_get_y' | 'free_shipping';
  value?: number;
  currency?: string;
  buyXGetY?: BuyXGetY;
  status?: 'active' | 'inactive' | 'scheduled';
  isPublic?: boolean;
  constraints?: Constraints;
  campaign?: Campaign;
  autoDeactivate?: {
    enabled: boolean;
    conditions: {
      maxUses?: number;
      maxAmount?: number;
      date?: string;
    };
  };
}

export interface DiscountFilters {
  page?: number;
  limit?: number;
  search?: string;
  type?: string;
  status?: string;
  isPublic?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  startDate?: string;
  endDate?: string;
  campaign?: string;
}

export interface AnalyticsFilters {
  startDate?: string;
  endDate?: string;
  type?: string;
  campaign?: string;
}

export interface DiscountValidation {
  code: string;
  orderAmount?: number;
  quantity?: number;
}

export interface ApplyDiscountData {
  discountCode: string;
  orderId?: string;
  originalAmount: number;
  quantity?: number;
  metadata?: any;
}

export interface UpdateApprovalData {
  approvalStatus: 'pending' | 'approved' | 'rejected';
  rejectionReason?: string;
}

export interface BulkOperationData {
  discountIds: string[];
  operation: 'activate' | 'deactivate' | 'delete' | 'update';
  updateData?: Partial<Discount>;
}

export interface DiscountAnalytics {
  overall: {
    totalDiscounts: number;
    activeDiscounts: number;
    totalUses: number;
    totalDiscountAmount: number;
    totalOrderValue: number;
    averageDiscountValue: number;
    savings: number;
    utilizationRate: number;
  };
  byType: Array<{
    _id: string;
    count: number;
    totalUses: number;
    totalDiscountAmount: number;
    averageValue: number;
  }>;
  topPerforming: Discount[];
  usageTrends: Array<{
    _id: string;
    totalUses: number;
    totalDiscount: number;
    totalOrder: number;
  }>;
  campaigns: Array<{
    _id: string;
    count: number;
    totalUses: number;
    totalDiscountAmount: number;
    averageUsage: number;
  }>;
}

export interface APIResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

class DiscountService {
  private getAuthHeaders() {
    // Get token from cookie or local storage - placeholder implementation
    const token = null; // TokenUtils.getToken();
    const headers: any = {
      'Content-Type': 'application/json',
    };
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
    return headers;
  }

  private async makeRequest<T = any>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<APIResponse<T>> {
    try {
      const response = await fetch(`${BASE_URL}${BASE_PATH}${endpoint}`, {
        ...options,
        headers: {
          ...this.getAuthHeaders(),
          ...options.headers,
        },
        credentials: 'include',
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Request failed' }));
        throw new Error(errorData.message || `Request failed with status ${response.status}`);
      }

      const data = await response.json();
      return { success: true, data: data.data || data };
    } catch (error) {
      console.error(`API Error (${endpoint}):`, error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error occurred' 
      };
    }
  }

  // Get all discounts with filtering and pagination
  async getAllDiscounts(filters?: DiscountFilters): Promise<APIResponse<any>> {
    const queryParams = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== '' && value !== 'all') {
          queryParams.append(key, String(value));
        }
      });
    }

    return this.makeRequest(`?${queryParams}`);
  }

  // Get discount by ID
  async getDiscountById(id: string): Promise<APIResponse<Discount>> {
    return this.makeRequest(`/${id}`);
  }

  // Create new discount
  async createDiscount(data: CreateDiscountData): Promise<APIResponse<Discount>> {
    return this.makeRequest('', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Update discount
  async updateDiscount(id: string, data: Partial<CreateDiscountData>): Promise<APIResponse<Discount>> {
    return this.makeRequest(`/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // Delete discount
  async deleteDiscount(id: string): Promise<APIResponse<void>> {
    return this.makeRequest(`/${id}`, {
      method: 'DELETE',
    });
  }

  // Validate discount code
  async validateDiscountCode(data: DiscountValidation): Promise<APIResponse<any>> {
    return this.makeRequest('/validate', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Apply discount to order
  async applyDiscount(data: ApplyDiscountData): Promise<APIResponse<any>> {
    return this.makeRequest('/apply', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Get public discounts
  async getPublicDiscounts(filters?: { page?: number; limit?: number; type?: string; minOrderAmount?: number }): Promise<APIResponse<any>> {
    const queryParams = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== '' && value !== 'all') {
          queryParams.append(key, String(value));
        }
      });
    }

    return this.makeRequest(`/public?${queryParams}`);
  }

  // Get discount analytics
  async getAnalytics(filters?: AnalyticsFilters): Promise<APIResponse<DiscountAnalytics>> {
    const queryParams = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== '') {
          queryParams.append(key, String(value));
        }
      });
    }

    return this.makeRequest(`/analytics?${queryParams}`);
  }

  // Update approval status (superadmin only)
  async updateApprovalStatus(id: string, data: UpdateApprovalData): Promise<APIResponse<Discount>> {
    return this.makeRequest(`/${id}/approval`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // Bulk operations
  async bulkOperation(data: BulkOperationData): Promise<APIResponse<any>> {
    return this.makeRequest('/bulk', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Export discounts
  async exportDiscounts(options?: {
    format?: 'json' | 'csv';
    includeUsage?: boolean;
    startDate?: string;
    endDate?: string;
  }): Promise<APIResponse<any>> {
    const queryParams = new URLSearchParams();
    if (options) {
      Object.entries(options).forEach(([key, value]) => {
        if (value !== undefined && value !== '') {
          queryParams.append(key, String(value));
        }
      });
    }

    if (options?.format === 'csv') {
      // Handle CSV download differently
      const token = null; // TokenUtils.getToken();
      const url = `${BASE_URL}${BASE_PATH}/export?${queryParams}`;
      
      try {
        const headers: any = {};
        if (token) {
          headers.Authorization = `Bearer ${token}`;
        }
        const response = await fetch(url, {
          headers,
          credentials: 'include',
        });

        if (!response.ok) {
          throw new Error('Export failed');
        }

        const blob = await response.blob();
        const downloadUrl = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = downloadUrl;
        a.download = `discounts-export-${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(downloadUrl);
        document.body.removeChild(a);

        return { success: true, message: 'Export completed successfully' };
      } catch (error) {
        return { 
          success: false, 
          error: error instanceof Error ? error.message : 'Export failed' 
        };
      }
    }

    return this.makeRequest(`/export?${queryParams}`);
  }

  // Utility methods for UI formatting
  getDiscountTypeLabel(type: string): string {
    const typeLabels: Record<string, string> = {
      'percentage': 'Percentage Off',
      'fixed_amount': 'Fixed Amount',
      'buy_x_get_y': 'Buy X Get Y',
      'free_shipping': 'Free Shipping'
    };
    return typeLabels[type] || type;
  }

  getStatusColor(status: string): string {
    const statusColors: Record<string, string> = {
      'active': 'bg-green-100 text-green-800',
      'inactive': 'bg-gray-100 text-gray-800',
      'expired': 'bg-red-100 text-red-800',
      'exhausted': 'bg-orange-100 text-orange-800',
      'scheduled': 'bg-blue-100 text-blue-800'
    };
    return statusColors[status] || 'bg-gray-100 text-gray-800';
  }

  getApprovalStatusColor(status: string): string {
    const statusColors: Record<string, string> = {
      'pending': 'bg-yellow-100 text-yellow-800',
      'approved': 'bg-green-100 text-green-800',
      'rejected': 'bg-red-100 text-red-800'
    };
    return statusColors[status] || 'bg-gray-100 text-gray-800';
  }

  formatDiscountValue(discount: Discount): string {
    switch (discount.type) {
      case 'percentage':
        return `${discount.value}%`;
      case 'fixed_amount':
        return `${discount.currency || 'USD'} ${discount.value}`;
      case 'buy_x_get_y':
        return `Buy ${discount.buyXGetY?.buyQuantity} Get ${discount.buyXGetY?.getQuantity}`;
      case 'free_shipping':
        return 'Free Shipping';
      default:
        return 'N/A';
    }
  }

  formatCurrency(amount: number, currency: string = 'USD'): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  }

  formatDate(dateString: string): string {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  }

  formatDateTime(dateString: string): string {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  calculateUsageRate(discount: Discount): number {
    if (!discount.constraints?.maxTotalUses) return 0;
    return Math.round((discount.analytics.totalUses / discount.constraints.maxTotalUses) * 100);
  }

  isDiscountExpiringSoon(discount: Discount, days: number = 7): boolean {
    if (!discount.constraints?.validUntil) return false;
    const expiryDate = new Date(discount.constraints.validUntil);
    const warningDate = new Date();
    warningDate.setDate(warningDate.getDate() + days);
    return expiryDate <= warningDate && expiryDate > new Date();
  }

  getDiscountPerformanceLevel(discount: Discount): 'excellent' | 'good' | 'average' | 'poor' {
    const usageRate = this.calculateUsageRate(discount);
    const conversionRate = discount.analytics.conversionRate || 0;
    
    if (usageRate >= 80 || conversionRate >= 15) return 'excellent';
    if (usageRate >= 60 || conversionRate >= 10) return 'good';
    if (usageRate >= 40 || conversionRate >= 5) return 'average';
    return 'poor';
  }

  validateDiscountCodeFormat(code: string): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    if (!code || code.trim().length === 0) {
      errors.push('Discount code is required');
    } else {
      if (code.length < 3) {
        errors.push('Discount code must be at least 3 characters long');
      }
      if (code.length > 50) {
        errors.push('Discount code cannot exceed 50 characters');
      }
      if (!/^[A-Z0-9_-]+$/.test(code.toUpperCase())) {
        errors.push('Discount code can only contain letters, numbers, underscores, and hyphens');
      }
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }
}

export const discountService = new DiscountService();
export default discountService;