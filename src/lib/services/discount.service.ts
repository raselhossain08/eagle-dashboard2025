import ApiService from './shared/api.service';

export interface Discount {
  id: string;
  _id: string;
  code: string;
  name: string;
  description?: string;
  type: 'percentage' | 'fixed_amount' | 'free_shipping';
  value: number;
  minimumAmount?: number;
  maximumDiscount?: number;
  usageLimit?: number;
  usageCount: number;
  userUsageLimit?: number;
  validFrom: string;
  validTo?: string;
  isActive: boolean;
  applicableProducts?: string[];
  applicableCategories?: string[];
  excludedProducts?: string[];
  excludedCategories?: string[];
  metadata?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface DiscountAnalytics {
  totalDiscounts: number;
  activeDiscounts: number;
  totalSavings: number;
  averageDiscount: number;
  usageByType: Record<string, number>;
  topPerformingDiscounts: Array<{
    id: string;
    code: string;
    name: string;
    usageCount: number;
    totalSavings: number;
  }>;
  channelPerformance: Array<{
    channel: string;
    discountUsage: number;
    revenue: number;
  }>;
  monthlyTrends: Array<{
    month: string;
    discountUsage: number;
    totalSavings: number;
  }>;
}

export interface CreateDiscountData {
  code: string;
  name: string;
  description?: string;
  type: 'percentage' | 'fixed_amount' | 'free_shipping';
  value: number;
  minimumAmount?: number;
  maximumDiscount?: number;
  usageLimit?: number;
  userUsageLimit?: number;
  validFrom: string;
  validTo?: string;
  isActive?: boolean;
  applicableProducts?: string[];
  applicableCategories?: string[];
  excludedProducts?: string[];
  excludedCategories?: string[];
  metadata?: Record<string, any>;
}

export interface DiscountFilters {
  type?: string;
  isActive?: boolean;
  validFrom?: string;
  validTo?: string;
  code?: string;
  name?: string;
  page?: number;
  limit?: number;
  sortBy?: 'createdAt' | 'name' | 'usageCount' | 'validFrom';
  sortOrder?: 'asc' | 'desc';
}

export class DiscountService {
  private static readonly ENDPOINT = '/discounts';

  async getDiscounts(filters?: DiscountFilters): Promise<{
    discounts: Discount[];
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
      discounts: Discount[];
      total: number;
      page: number;
      totalPages: number;
    }>(`${DiscountService.ENDPOINT}?${queryParams}`);
    
    return response;
  }

  async getDiscount(id: string): Promise<Discount> {
    const response = await ApiService.get<Discount>(`${DiscountService.ENDPOINT}/${id}`);
    return response;
  }

  async createDiscount(data: CreateDiscountData): Promise<Discount> {
    const response = await ApiService.post<Discount>(`${DiscountService.ENDPOINT}`, data);
    return response;
  }

  async updateDiscount(id: string, data: Partial<CreateDiscountData>): Promise<Discount> {
    const response = await ApiService.put<Discount>(`${DiscountService.ENDPOINT}/${id}`, data);
    return response;
  }

  async deleteDiscount(id: string): Promise<void> {
    await ApiService.delete(`${DiscountService.ENDPOINT}/${id}`);
  }

  async validateDiscountCode(code: string, orderAmount?: number): Promise<{
    valid: boolean;
    discount?: Discount;
    discountAmount?: number;
    error?: string;
  }> {
    const response = await ApiService.post<{
      valid: boolean;
      discount?: Discount;
      discountAmount?: number;
      error?: string;
    }>(`${DiscountService.ENDPOINT}/validate`, { code, orderAmount });
    
    return response;
  }

  async getDiscountAnalytics(
    dateFrom?: string,
    dateTo?: string
  ): Promise<DiscountAnalytics> {
    const queryParams = new URLSearchParams();
    
    if (dateFrom) queryParams.append('dateFrom', dateFrom);
    if (dateTo) queryParams.append('dateTo', dateTo);
    
    const response = await ApiService.get<DiscountAnalytics>(
      `${DiscountService.ENDPOINT}/analytics?${queryParams}`
    );
    
    return response;
  }

  async bulkUpdateDiscounts(ids: string[], updates: Partial<CreateDiscountData>): Promise<Discount[]> {
    const response = await ApiService.put<Discount[]>(`${DiscountService.ENDPOINT}/bulk`, {
      ids,
      updates,
    });
    
    return response;
  }

  async duplicateDiscount(id: string, newCode: string): Promise<Discount> {
    const response = await ApiService.post<Discount>(`${DiscountService.ENDPOINT}/${id}/duplicate`, {
      newCode,
    });
    
    return response;
  }

  // Utility methods
  calculateDiscountAmount(discount: Discount, orderAmount: number): number {
    switch (discount.type) {
      case 'percentage':
        const percentageDiscount = (orderAmount * discount.value) / 100;
        return discount.maximumDiscount 
          ? Math.min(percentageDiscount, discount.maximumDiscount)
          : percentageDiscount;
      
      case 'fixed_amount':
        return Math.min(discount.value, orderAmount);
      
      case 'free_shipping':
        // This would need to be calculated based on shipping costs
        return 0;
      
      default:
        return 0;
    }
  }

  isDiscountValid(discount: Discount, orderAmount?: number): boolean {
    if (!discount.isActive) return false;
    
    const now = new Date();
    const validFrom = new Date(discount.validFrom);
    const validTo = discount.validTo ? new Date(discount.validTo) : null;
    
    if (now < validFrom) return false;
    if (validTo && now > validTo) return false;
    
    if (discount.usageLimit && discount.usageCount >= discount.usageLimit) return false;
    
    if (orderAmount && discount.minimumAmount && orderAmount < discount.minimumAmount) return false;
    
    return true;
  }

  getDiscountTypeLabel(type: Discount['type']): string {
    switch (type) {
      case 'percentage':
        return 'Percentage';
      case 'fixed_amount':
        return 'Fixed Amount';
      case 'free_shipping':
        return 'Free Shipping';
      default:
        return 'Unknown';
    }
  }

  formatDiscountValue(discount: Discount): string {
    switch (discount.type) {
      case 'percentage':
        return `${discount.value}%`;
      case 'fixed_amount':
        return `$${discount.value.toFixed(2)}`;
      case 'free_shipping':
        return 'Free Shipping';
      default:
        return discount.value.toString();
    }
  }

  getStatusColor(discount: Discount): string {
    if (!discount.isActive) return 'bg-gray-100 text-gray-800';
    
    const now = new Date();
    const validFrom = new Date(discount.validFrom);
    const validTo = discount.validTo ? new Date(discount.validTo) : null;
    
    if (now < validFrom) return 'bg-yellow-100 text-yellow-800';
    if (validTo && now > validTo) return 'bg-red-100 text-red-800';
    
    return 'bg-green-100 text-green-800';
  }
}

// Type aliases for component imports
export type DiscountCode = Discount;
export type DiscountType = Discount['type'];
export type DiscountStatus = 'active' | 'inactive' | 'expired' | 'scheduled';
export type DiscountApplication = 'automatic' | 'manual';
export type DiscountRedemption = {
  id: string;
  userId: string;
  discountId: string;
  orderAmount: number;
  discountAmount: number;
  redeemedAt: string;
};

export const discountService = new DiscountService();
export default discountService;