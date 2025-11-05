import ApiService from '../shared/api.service';

export interface Subscription {
  _id: string;
  userId: {
    _id: string;
    name: string;
    email: string;
    phone?: string;
  };
  planId: {
    _id: string;
    name: string;
    displayName: string;
    category: string;
    pricing: any;
  };
  planName: string;
  planType: string;
  billingCycle: string;
  price: number;
  originalPrice: number;
  currency: string;
  status: string;
  startDate: string;
  endDate?: string;
  nextBillingDate?: string;
  paymentMethod: string;
  daysRemaining?: number;
  isActive: boolean;
  displayName: string;
  createdAt: string;
  updatedAt: string;
  adminNotes?: string;
  planChangeHistory?: Array<{
    fromPlan: string;
    toPlan: string;
    fromBillingCycle: string;
    toBillingCycle: string;
    changeDate: string;
    effectiveDate?: string;
    reason?: string;
    priceChange: number;
  }>;
  scheduledPlanChange?: {
    newPlanId: string;
    newPlanName: string;
    newBillingCycle: string;
    effectiveDate: string;
    scheduledAt: string;
  };
}

export interface SubscriptionAnalytics {
  summary: {
    totalActive: number;
    totalCancelled: number;
    newSubscriptions: number;
    revenue: number;
    churnCount: number;
  };
  breakdown: {
    byStatus: Array<{ _id: string; count: number }>;
    byPlanType: Array<{ _id: string; count: number }>;
    byBillingCycle: Array<{ _id: string; count: number }>;
  };
}

export interface GetSubscriptionsParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  status?: string;
  planType?: string;
  userId?: string;
  planId?: string;
  startDate?: string;
  endDate?: string;
}

export interface UpdateSubscriptionRequest {
  status?: string;
  price?: number;
  billingCycle?: string;
  adminNotes?: string;
  endDate?: string;
}

export interface CancelSubscriptionRequest {
  reason: string;
  immediate?: boolean;
  refund?: boolean;
}

export interface CreateSubscriptionRequest {
  userId: string;
  planId: string;
  billingCycle: 'monthly' | 'annual' | 'oneTime';
  price?: number;
  currency?: string;
  paymentMethod?: string;
  startDate?: string;
  endDate?: string;
}

export interface SubscriptionsResponse {
  success: boolean;
  data: Subscription[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
  error?: string;
}

export interface SubscriptionResponse {
  success: boolean;
  data: Subscription;
  error?: string;
}

export interface AnalyticsResponse {
  success: boolean;
  data: SubscriptionAnalytics;
  error?: string;
}

class SubscriptionService extends ApiService {
  private static readonly BASE_PATH = '/subscription';

  /**
   * Get all subscriptions with filtering and pagination
   */
  static async getSubscriptions(params?: GetSubscriptionsParams): Promise<SubscriptionsResponse> {
    try {
      const queryParams = new URLSearchParams();
      
      if (params?.page) queryParams.append('page', params.page.toString());
      if (params?.limit) queryParams.append('limit', params.limit.toString());
      if (params?.sortBy) queryParams.append('sortBy', params.sortBy);
      if (params?.sortOrder) queryParams.append('sortOrder', params.sortOrder);
      if (params?.status) queryParams.append('status', params.status);
      if (params?.planType) queryParams.append('planType', params.planType);
      if (params?.userId) queryParams.append('userId', params.userId);
      if (params?.planId) queryParams.append('planId', params.planId);
      if (params?.startDate) queryParams.append('startDate', params.startDate);
      if (params?.endDate) queryParams.append('endDate', params.endDate);

      const url = queryParams.toString() 
        ? `${this.BASE_PATH}?${queryParams.toString()}`
        : this.BASE_PATH;

      return await this.get<SubscriptionsResponse>(url);
    } catch (error) {
      console.error('Failed to get subscriptions:', error);
      return {
        success: false,
        data: [],
        pagination: { page: 1, limit: 10, total: 0, pages: 0 },
        error: error instanceof Error ? error.message : 'Failed to get subscriptions'
      };
    }
  }

  /**
   * Get subscription by ID
   */
  static async getSubscription(id: string): Promise<SubscriptionResponse> {
    try {
      return await this.get<SubscriptionResponse>(`${this.BASE_PATH}/${id}`);
    } catch (error) {
      console.error('Failed to get subscription:', error);
      return {
        success: false,
        data: {} as Subscription,
        error: error instanceof Error ? error.message : 'Failed to get subscription'
      };
    }
  }

  /**
   * Create new subscription
   */
  static async createSubscription(data: CreateSubscriptionRequest): Promise<SubscriptionResponse> {
    try {
      return await this.post<SubscriptionResponse>(this.BASE_PATH, data);
    } catch (error) {
      console.error('Failed to create subscription:', error);
      return {
        success: false,
        data: {} as Subscription,
        error: error instanceof Error ? error.message : 'Failed to create subscription'
      };
    }
  }

  /**
   * Update subscription
   */
  static async updateSubscription(id: string, data: UpdateSubscriptionRequest): Promise<SubscriptionResponse> {
    try {
      return await this.put<SubscriptionResponse>(`${this.BASE_PATH}/${id}`, data);
    } catch (error) {
      console.error('Failed to update subscription:', error);
      return {
        success: false,
        data: {} as Subscription,
        error: error instanceof Error ? error.message : 'Failed to update subscription'
      };
    }
  }

  /**
   * Cancel subscription
   */
  static async cancelSubscription(id: string, data: CancelSubscriptionRequest): Promise<SubscriptionResponse> {
    try {
      return await this.post<SubscriptionResponse>(`${this.BASE_PATH}/${id}/cancel`, data);
    } catch (error) {
      console.error('Failed to cancel subscription:', error);
      return {
        success: false,
        data: {} as Subscription,
        error: error instanceof Error ? error.message : 'Failed to cancel subscription'
      };
    }
  }

  /**
   * Reactivate subscription
   */
  static async reactivateSubscription(id: string): Promise<SubscriptionResponse> {
    try {
      return await this.post<SubscriptionResponse>(`${this.BASE_PATH}/${id}/reactivate`, {});
    } catch (error) {
      console.error('Failed to reactivate subscription:', error);
      return {
        success: false,
        data: {} as Subscription,
        error: error instanceof Error ? error.message : 'Failed to reactivate subscription'
      };
    }
  }

  /**
   * Delete subscription
   */
  static async deleteSubscription(id: string): Promise<{ success: boolean; error?: string }> {
    try {
      return await this.delete(`${this.BASE_PATH}/${id}`);
    } catch (error) {
      console.error('Failed to delete subscription:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to delete subscription'
      };
    }
  }

  /**
   * Get subscription analytics
   */
  static async getAnalytics(): Promise<AnalyticsResponse> {
    try {
      return await this.get<AnalyticsResponse>(`${this.BASE_PATH}/analytics`);
    } catch (error) {
      console.error('Failed to get subscription analytics:', error);
      return {
        success: false,
        data: {
          summary: {
            totalActive: 0,
            totalCancelled: 0,
            newSubscriptions: 0,
            revenue: 0,
            churnCount: 0
          },
          breakdown: {
            byStatus: [],
            byPlanType: [],
            byBillingCycle: []
          }
        },
        error: error instanceof Error ? error.message : 'Failed to get analytics'
      };
    }
  }

  /**
   * Suspend subscription
   */
  static async suspendSubscription(id: string, reason: string): Promise<SubscriptionResponse> {
    try {
      return await this.post<SubscriptionResponse>(`${this.BASE_PATH}/${id}/suspend`, { reason });
    } catch (error) {
      console.error('Failed to suspend subscription:', error);
      return {
        success: false,
        data: {} as Subscription,
        error: error instanceof Error ? error.message : 'Failed to suspend subscription'
      };
    }
  }

  /**
   * Resume suspended subscription
   */
  static async resumeSubscription(id: string): Promise<SubscriptionResponse> {
    try {
      return await this.post<SubscriptionResponse>(`${this.BASE_PATH}/${id}/resume`, {});
    } catch (error) {
      console.error('Failed to resume subscription:', error);
      return {
        success: false,
        data: {} as Subscription,
        error: error instanceof Error ? error.message : 'Failed to resume subscription'
      };
    }
  }

  /**
   * Get user's subscriptions
   */
  static async getUserSubscriptions(userId: string): Promise<SubscriptionsResponse> {
    try {
      return await this.get<SubscriptionsResponse>(`${this.BASE_PATH}/user/${userId}`);
    } catch (error) {
      console.error('Failed to get user subscriptions:', error);
      return {
        success: false,
        data: [],
        pagination: { page: 1, limit: 10, total: 0, pages: 0 },
        error: error instanceof Error ? error.message : 'Failed to get user subscriptions'
      };
    }
  }

  /**
   * Get plan subscriptions
   */
  static async getPlanSubscriptions(planId: string): Promise<SubscriptionsResponse> {
    try {
      return await this.get<SubscriptionsResponse>(`${this.BASE_PATH}/plan/${planId}`);
    } catch (error) {
      console.error('Failed to get plan subscriptions:', error);
      return {
        success: false,
        data: [],
        pagination: { page: 1, limit: 10, total: 0, pages: 0 },
        error: error instanceof Error ? error.message : 'Failed to get plan subscriptions'
      };
    }
  }

  /**
   * Pause subscription
   */
  static async pauseSubscription(id: string, pauseDuration: number, reason: string): Promise<SubscriptionResponse> {
    try {
      return await this.post<SubscriptionResponse>(`${this.BASE_PATH}/${id}/pause`, { 
        pauseDuration, 
        reason 
      });
    } catch (error) {
      console.error('Failed to pause subscription:', error);
      return {
        success: false,
        data: {} as Subscription,
        error: error instanceof Error ? error.message : 'Failed to pause subscription'
      };
    }
  }

  /**
   * Get subscriptions expiring soon
   */
  static async getExpiringSoon(days: number = 7): Promise<SubscriptionsResponse> {
    try {
      return await this.get<SubscriptionsResponse>(`${this.BASE_PATH}/expiring-soon?days=${days}`);
    } catch (error) {
      console.error('Failed to get expiring subscriptions:', error);
      return {
        success: false,
        data: [],
        pagination: { page: 1, limit: 10, total: 0, pages: 0 },
        error: error instanceof Error ? error.message : 'Failed to get expiring subscriptions'
      };
    }
  }

  /**
   * Get subscriptions due for renewal
   */
  static async getDueForRenewal(): Promise<SubscriptionsResponse> {
    try {
      return await this.get<SubscriptionsResponse>(`${this.BASE_PATH}/due-for-renewal`);
    } catch (error) {
      console.error('Failed to get renewals:', error);
      return {
        success: false,
        data: [],
        pagination: { page: 1, limit: 10, total: 0, pages: 0 },
        error: error instanceof Error ? error.message : 'Failed to get renewals'
      };
    }
  }

  /**
   * Get recent subscription activity
   */
  static async getRecentActivity(limit: number = 10): Promise<{
    success: boolean;
    data: Array<{
      id: string;
      action: string;
      description: string;
      actor: string;
      resource: string;
      timestamp: Date;
      changes: string;
    }>;
    error?: string;
  }> {
    try {
      return await this.get<{
        success: boolean;
        data: Array<{
          id: string;
          action: string;
          description: string;
          actor: string;
          resource: string;
          timestamp: Date;
          changes: string;
        }>;
      }>(`${this.BASE_PATH}/activity/recent?limit=${limit}`);
    } catch (error) {
      console.error('Failed to get recent activity:', error);
      return {
        success: false,
        data: [],
        error: error instanceof Error ? error.message : 'Failed to get recent activity'
      };
    }
  }

  /**
   * Create sample data for testing
   */
  static async createSampleData(): Promise<{ success: boolean; message?: string; error?: string }> {
    try {
      return await this.post<{ success: boolean; message: string }>(`${this.BASE_PATH}/create-sample-data`, {});
    } catch (error) {
      console.error('Failed to create sample data:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create sample data'
      };
    }
  }

  /**
   * Create sample audit logs for testing
   */
  static async createSampleAuditLogs(): Promise<{ success: boolean; message?: string; error?: string }> {
    try {
      return await this.post<{ success: boolean; message: string }>(`${this.BASE_PATH}/create-sample-audit-logs`, {});
    } catch (error) {
      console.error('Failed to create sample audit logs:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create sample audit logs'
      };
    }
  }

  /**
   * Process subscription renewal
   */
  static async processRenewal(id: string, paymentId?: string): Promise<SubscriptionResponse> {
    try {
      return await this.post<SubscriptionResponse>(`${this.BASE_PATH}/${id}/renew`, { paymentId });
    } catch (error) {
      console.error('Failed to process renewal:', error);
      return {
        success: false,
        data: {} as Subscription,
        error: error instanceof Error ? error.message : 'Failed to process renewal'
      };
    }
  }

  /**
   * Change subscription plan
   */
  static async changePlan(id: string, data: {
    newPlanId: string;
    billingCycle: string;
    effectiveDate?: string;
    prorationMode?: 'immediate' | 'next_cycle';
  }): Promise<SubscriptionResponse> {
    try {
      return await this.post<SubscriptionResponse>(`${this.BASE_PATH}/${id}/change-plan`, data);
    } catch (error) {
      console.error('Failed to change plan:', error);
      return {
        success: false,
        data: {} as Subscription,
        error: error instanceof Error ? error.message : 'Failed to change plan'
      };
    }
  }

  /**
   * Cancel scheduled plan change
   */
  static async cancelScheduledPlanChange(id: string): Promise<SubscriptionResponse> {
    try {
      return await this.post<SubscriptionResponse>(`${this.BASE_PATH}/${id}/cancel-scheduled-change`, {});
    } catch (error) {
      console.error('Failed to cancel scheduled plan change:', error);
      return {
        success: false,
        data: {} as Subscription,
        error: error instanceof Error ? error.message : 'Failed to cancel scheduled plan change'
      };
    }
  }
}

export default SubscriptionService;