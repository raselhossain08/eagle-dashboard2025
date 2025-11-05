import ApiService from '../shared/api.service';

export interface Plan {
  _id: string;
  name: string;
  displayName: string;
  description: string;
  planType: 'subscription' | 'mentorship' | 'script' | 'addon';
  category: 'basic' | 'diamond' | 'infinity' | 'ultimate' | 'script' | 'custom';
  pricing: {
    monthly?: {
      price: number;
      originalPrice?: number;
      discount?: string;
      savings?: number;
    };
    annual?: {
      price: number;
      originalPrice?: number;
      discount?: string;
      savings?: number;
    };
    oneTime?: {
      price: number;
      originalPrice?: number;
      memberPrice?: number;
      savings?: number;
    };
  };
  features: string[];
  advancedFeatures?: Array<{
    name: string;
    description?: string;
    isExclusive: boolean;
  }>;
  ui: {
    icon: string;
    gradient: string;
    color: string;
    badgeText?: string;
    badgeColor: string;
  };
  isActive: boolean;
  isPopular: boolean;
  isRecommended: boolean;
  isFeatured: boolean;
  sortOrder: number;
  accessLevel: number;
  stripe?: {
    priceId: {
      monthly?: string;
      annual?: string;
    };
    productId?: string;
  };
  paypal?: {
    planId: {
      monthly?: string;
      annual?: string;
    };
  };
  contractTemplate?: string;
  termsOfService?: string;
  analytics: {
    totalSubscribers: number;
    totalRevenue: number;
    conversionRate: number;
    lastUpdatedStats: string;
  };
  tags: string[];
  metadata?: Record<string, any>;
  createdBy?: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  updatedBy?: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  startDate?: string;
  endDate?: string;
  prerequisites?: Array<{
    planId: {
      _id: string;
      name: string;
      displayName: string;
    };
    required: boolean;
  }>;
  upgradePath?: Array<{
    _id: string;
    name: string;
    displayName: string;
  }>;
  downgradePath?: Array<{
    _id: string;
    name: string;
    displayName: string;
  }>;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePlanRequest {
  name: string;
  displayName: string;
  description: string;
  planType: 'subscription' | 'mentorship' | 'script' | 'addon';
  category: 'basic' | 'diamond' | 'infinity' | 'ultimate' | 'script' | 'custom';
  pricing: Plan['pricing'];
  features: string[];
  advancedFeatures?: Plan['advancedFeatures'];
  ui?: Partial<Plan['ui']>;
  isActive?: boolean;
  isPopular?: boolean;
  isRecommended?: boolean;
  isFeatured?: boolean;
  sortOrder?: number;
  accessLevel?: number;
  tags?: string[];
  startDate?: string;
  endDate?: string;
  contractTemplate?: string;
  termsOfService?: string;
}

export interface UpdatePlanRequest extends Partial<CreatePlanRequest> {
  // All fields are optional for updates
}

export interface GetPlansParams {
  planType?: 'subscription' | 'mentorship' | 'script' | 'addon';
  category?: 'basic' | 'diamond' | 'infinity' | 'ultimate' | 'script' | 'custom';
  isActive?: boolean;
  isFeatured?: boolean;
  isPopular?: boolean;
  page?: number;
  limit?: number;
  sortBy?: 'name' | 'displayName' | 'createdAt' | 'updatedAt' | 'sortOrder' | 'category' | 'planType';
  sortOrder?: 'asc' | 'desc';
}

export interface PlanStats {
  overview: {
    totalPlans: number;
    activePlans: number;
    subscriptionPlans: number;
    mentorshipPlans: number;
    scriptPlans: number;
    totalSubscribers: number;
    totalRevenue: number;
  };
  categoryBreakdown: Array<{
    _id: string;
    count: number;
    totalSubscribers: number;
  }>;
}

export interface BulkUpdateRequest {
  planIds: string[];
  updateData: {
    isActive?: boolean;
    sortOrder?: number;
    isPopular?: boolean;
    isFeatured?: boolean;
    tags?: string[];
  };
}

export interface DuplicatePlanRequest {
  name: string;
  displayName?: string;
}

export interface ReorderPlansRequest {
  planOrders: Array<{
    id: string;
    sortOrder: number;
  }>;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

class PlanService {
  private readonly endpoint = '/plans';

  /**
   * Get all plans with optional filtering and pagination
   */
  async getPlans(params?: GetPlansParams): Promise<ApiResponse<Plan[]>> {
    try {
      const queryString = params ? this.buildQueryString(params) : '';
      const response = await ApiService.get<ApiResponse<Plan[]>>(`${this.endpoint}${queryString}`);
      return response;
    } catch (error) {
      console.error('Get plans error:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Get active plans for public display (no auth required)
   */
  async getPublicPlans(planType?: string): Promise<ApiResponse<Record<string, Plan[]>>> {
    try {
      const queryString = planType ? `?planType=${planType}` : '';
      const response = await ApiService.get<ApiResponse<Record<string, Plan[]>>>(`${this.endpoint}/public${queryString}`);
      return response;
    } catch (error) {
      console.error('Get public plans error:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Get single plan by ID
   */
  async getPlanById(id: string): Promise<ApiResponse<Plan>> {
    try {
      const response = await ApiService.get<ApiResponse<Plan>>(`${this.endpoint}/${id}`);
      return response;
    } catch (error) {
      console.error('Get plan by ID error:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Create a new plan
   */
  async createPlan(planData: CreatePlanRequest): Promise<ApiResponse<Plan>> {
    try {
      const response = await ApiService.post<ApiResponse<Plan>>(this.endpoint, planData);
      return response;
    } catch (error) {
      console.error('Create plan error:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Update an existing plan
   */
  async updatePlan(id: string, planData: UpdatePlanRequest): Promise<ApiResponse<Plan>> {
    try {
      const response = await ApiService.put<ApiResponse<Plan>>(`${this.endpoint}/${id}`, planData);
      return response;
    } catch (error) {
      console.error('Update plan error:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Delete a plan (soft delete by default)
   */
  async deletePlan(id: string, permanent: boolean = false): Promise<ApiResponse> {
    try {
      const queryString = permanent ? '?permanent=true' : '';
      const response = await ApiService.delete<ApiResponse>(`${this.endpoint}/${id}${queryString}`);
      return response;
    } catch (error) {
      console.error('Delete plan error:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Get plan statistics
   */
  async getPlanStats(): Promise<ApiResponse<PlanStats>> {
    try {
      const response = await ApiService.get<ApiResponse<PlanStats>>(`${this.endpoint}/stats`);
      return response;
    } catch (error) {
      console.error('Get plan stats error:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Bulk update multiple plans
   */
  async bulkUpdatePlans(bulkData: BulkUpdateRequest): Promise<ApiResponse> {
    try {
      const response = await ApiService.put<ApiResponse>(`${this.endpoint}/bulk`, bulkData);
      return response;
    } catch (error) {
      console.error('Bulk update plans error:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Duplicate an existing plan
   */
  async duplicatePlan(id: string, duplicateData: DuplicatePlanRequest): Promise<ApiResponse<Plan>> {
    try {
      const response = await ApiService.post<ApiResponse<Plan>>(`${this.endpoint}/${id}/duplicate`, duplicateData);
      return response;
    } catch (error) {
      console.error('Duplicate plan error:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Toggle archive status of a plan
   */
  async toggleArchivePlan(id: string): Promise<ApiResponse<Plan>> {
    try {
      // Note: ApiService doesn't have PATCH method, using PUT instead
      const response = await ApiService.put<ApiResponse<Plan>>(`${this.endpoint}/${id}/archive`, {});
      return response;
    } catch (error) {
      console.error('Toggle archive plan error:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Toggle featured status of a plan
   */
  async toggleFeaturedPlan(id: string): Promise<ApiResponse<Plan>> {
    try {
      const response = await ApiService.put<ApiResponse<Plan>>(`${this.endpoint}/${id}/feature`, {});
      return response;
    } catch (error) {
      console.error('Toggle featured plan error:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Toggle popular status of a plan
   */
  async togglePopularPlan(id: string): Promise<ApiResponse<Plan>> {
    try {
      const response = await ApiService.put<ApiResponse<Plan>>(`${this.endpoint}/${id}/popular`, {});
      return response;
    } catch (error) {
      console.error('Toggle popular plan error:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Reorder plans by updating sortOrder
   */
  async reorderPlans(reorderData: ReorderPlansRequest): Promise<ApiResponse> {
    try {
      const response = await ApiService.put<ApiResponse>(`${this.endpoint}/reorder`, reorderData);
      return response;
    } catch (error) {
      console.error('Reorder plans error:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Get plans by type
   */
  async getPlansByType(planType: 'subscription' | 'mentorship' | 'script' | 'addon'): Promise<ApiResponse<Plan[]>> {
    try {
      const response = await ApiService.get<ApiResponse<Plan[]>>(`${this.endpoint}/type/${planType}`);
      return response;
    } catch (error) {
      console.error('Get plans by type error:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Get plans by category
   */
  async getPlansByCategory(category: 'basic' | 'diamond' | 'infinity' | 'ultimate' | 'script' | 'custom'): Promise<ApiResponse<Plan[]>> {
    try {
      const response = await ApiService.get<ApiResponse<Plan[]>>(`${this.endpoint}/category/${category}`);
      return response;
    } catch (error) {
      console.error('Get plans by category error:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Get featured and active plans
   */
  async getFeaturedPlans(): Promise<ApiResponse<Plan[]>> {
    try {
      const response = await ApiService.get<ApiResponse<Plan[]>>(`${this.endpoint}/featured/active`);
      return response;
    } catch (error) {
      console.error('Get featured plans error:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Helper method to build query string from parameters
   */
  private buildQueryString(params: Record<string, any>): string {
    const searchParams = new URLSearchParams();
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        searchParams.append(key, value.toString());
      }
    });
    
    const queryString = searchParams.toString();
    return queryString ? `?${queryString}` : '';
  }

  /**
   * Handle API errors and format them appropriately
   */
  private handleError(error: any): Error {
    if (error instanceof Error) {
      return error;
    }
    if (typeof error === 'string') {
      return new Error(error);
    }
    if (error?.message) {
      return new Error(error.message);
    }
    return new Error('An unexpected error occurred');
  }

  /**
   * Clear cache for plans (if using any caching mechanism)
   */
  clearCache(): void {
    // Implement cache clearing if using any client-side caching
    // For now, this is a placeholder
    console.log('Plan cache cleared');
  }
}

export default new PlanService();