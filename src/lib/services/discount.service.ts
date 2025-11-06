// lib/services/discountService.ts
import ApiService from './shared/api.service';

export interface Discount {
  _id: string;
  code: string;
  name: string;
  description?: string;
  type: 'percentage' | 'fixed';
  value: number;
  applicableTo: {
    plans: string[];
    billingCycles: string[];
    userTypes: string[];
  };
  usageLimit: {
    total: number;
    perCustomer: number;
    used: number;
  };
  startDate: string;
  endDate: string;
  status: 'active' | 'expired' | 'disabled';
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  usageHistory?: Array<{
    userId: string;
    transactionId: string;
    usedAt: string;
    orderAmount: number;
    discountAmount: number;
  }>;
}

export interface DiscountStats {
  activeCodes: number;
  totalRedemptions: number;
  revenueImpact: number;
  conversionRate: number;
  percentageChanges: {
    activeCodes: number;
    redemptions: number;
    revenueImpact: number;
    conversionRate: number;
  };
}

export interface DiscountAnalytics {
  usageOverTime: Array<{
    date: string;
    redemptions: number;
    revenueImpact: number;
    conversionRate: number;
  }>;
  topPerforming: Discount[];
  summary: {
    totalDiscounts: number;
    totalRevenueImpact: number;
    averageConversionRate: number;
  };
}

export interface PaginationInfo {
  current: number;
  total: number;
  count: number;
  limit: number;
}

export interface DiscountsResponse {
  success: boolean;
  data: {
    discounts: Discount[];
    pagination: PaginationInfo;
  };
}

export interface SearchParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  type?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface BulkGenerateData {
  prefix: string;
  count: number;
  type: 'percentage' | 'fixed';
  value: number;
  applicableTo: any;
  validUntil: string;
  usageLimit: {
    perCustomer: number;
    total?: number;
  };
  name?: string;
  description?: string;
}

class DiscountService {
  private baseUrl = '/payment/discount';

  async getDiscountStats(): Promise<{ success: boolean; data: DiscountStats }> {
    return ApiService.get<{ success: boolean; data: DiscountStats }>(`${this.baseUrl}/stats`);
  }

  async getDiscountAnalytics(period: '7d' | '30d' | '90d' = '30d'): Promise<{ success: boolean; data: DiscountAnalytics }> {
    return ApiService.get<{ success: boolean; data: DiscountAnalytics }>(`${this.baseUrl}/analytics?period=${period}`);
  }

  async getAllDiscounts(params: SearchParams = {}): Promise<DiscountsResponse> {
    const queryParams = new URLSearchParams();

    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        queryParams.append(key, value.toString());
      }
    });

    return ApiService.get<DiscountsResponse>(`${this.baseUrl}?${queryParams}`);
  }

  async getDiscountById(id: string): Promise<{ success: boolean; data: { discount: Discount } }> {
    return ApiService.get<{ success: boolean; data: { discount: Discount } }>(`${this.baseUrl}/${id}`);
  }

  async createDiscount(data: Partial<Discount>): Promise<{ success: boolean; data: { discount: Discount } }> {
    return ApiService.post<{ success: boolean; data: { discount: Discount } }>(`${this.baseUrl}`, data);
  }

  async updateDiscount(id: string, data: Partial<Discount>): Promise<{ success: boolean; data: { discount: Discount } }> {
    return ApiService.put<{ success: boolean; data: { discount: Discount } }>(`${this.baseUrl}/${id}`, data);
  }

  async deleteDiscount(id: string): Promise<{ success: boolean }> {
    return ApiService.delete<{ success: boolean }>(`${this.baseUrl}/${id}`);
  }

  async bulkGenerateDiscounts(data: BulkGenerateData): Promise<{ success: boolean; data: { generated: number; codes: string[] } }> {
    return ApiService.post<{ success: boolean; data: { generated: number; codes: string[] } }>(`${this.baseUrl}/bulk-generate`, data);
  }

  async exportDiscounts(format: 'json' | 'csv' = 'json', filters: any = {}) {
    const queryParams = new URLSearchParams({ format, ...filters });

    const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
    const response = await fetch(`${API_BASE_URL}${this.baseUrl}/export?${queryParams}`, {
      credentials: 'include',
      headers: {
        'Authorization': `Bearer ${ApiService.getAuthToken()}`,
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    if (format === 'csv') {
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `discounts_export_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } else {
      return response.json();
    }
  }
}

export const discountService = new DiscountService();