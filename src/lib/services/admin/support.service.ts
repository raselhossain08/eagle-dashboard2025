import ApiService from '../shared/api.service';
import type { ApiResponse } from '../index';

// =================== SUPPORT TOOLS TYPES ===================

export interface ImpersonationSession {
  _id: string;
  sessionId: string;
  supportAgent: {
    _id: string;
    name: string;
    email: string;
  };
  targetUser: {
    _id: string;
    name: string;
    email: string;
    status: string;
  };
  sessionType: 'READ_ONLY' | 'WRITE_ENABLED';
  reason: string;
  status: 'ACTIVE' | 'EXPIRED' | 'ENDED';
  startTime: string;
  endTime?: string;
  expiresAt: string;
  banner: {
    message: string;
    type: 'info' | 'warning' | 'error';
    dismissible: boolean;
  };
  actions: Array<{
    action: string;
    timestamp: string;
    details?: any;
  }>;
  createdAt: string;
  updatedAt: string;
}

export interface StartImpersonationRequest {
  targetUserId: string;
  reason: string;
  sessionType: 'READ_ONLY' | 'WRITE_ENABLED';
}

export interface EmailResendRequest {
  reason: string;
}

export interface EmailResendResponse {
  success: boolean;
  message: string;
  data: {
    resendId: string;
    rateLimit: {
      allowed: boolean;
      dailyCount: number;
      hourlyCount: number;
      dailyLimit: number;
      hourlyLimit: number;
    };
  };
}

export interface EmailType {
  type: string;
  name: string;
  description: string;
  endpoint: string;
  rateLimits: {
    daily: number;
    hourly: number;
  };
}

export interface RateLimitInfo {
  [emailType: string]: {
    allowed: boolean;
    dailyCount: number;
    hourlyCount: number;
    dailyLimit: number;
    hourlyLimit: number;
  };
}

export interface UserNote {
  _id: string;
  userId: string;
  title: string;
  content: string;
  noteType: 'SUPPORT' | 'BILLING' | 'TECHNICAL' | 'GENERAL' | 'SECURITY';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  tags: string[];
  visibility: 'ALL' | 'SUPPORT' | 'FINANCE' | 'TECHNICAL' | 'ADMIN';
  isPinned: boolean;
  isDeleted: boolean;
  createdBy: {
    _id: string;
    name: string;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface CreateUserNoteRequest {
  title: string;
  content: string;
  noteType: 'SUPPORT' | 'BILLING' | 'TECHNICAL' | 'GENERAL' | 'SECURITY';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  tags: string[];
  visibility: 'ALL' | 'SUPPORT' | 'FINANCE' | 'TECHNICAL' | 'ADMIN';
  isPinned: boolean;
}

export interface UserFlag {
  _id: string;
  userId: string;
  flagType: 'VIP' | 'PAYMENT_ISSUES' | 'PROBLEMATIC' | 'SUPPORT_ESCALATION' | 'FRAUD_RISK' | 'HIGH_VALUE';
  reason: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  isActive: boolean;
  expiresAt?: string;
  createdBy: {
    _id: string;
    name: string;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface CreateUserFlagRequest {
  flagType: 'VIP' | 'PAYMENT_ISSUES' | 'PROBLEMATIC' | 'SUPPORT_ESCALATION' | 'FRAUD_RISK' | 'HIGH_VALUE';
  reason: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  expiresAt?: string;
}

export interface SavedReply {
  _id: string;
  title: string;
  category: 'SUPPORT' | 'FINANCE' | 'TECHNICAL' | 'GENERAL' | 'BILLING';
  subcategory?: string;
  subject: string;
  content: string;
  variables: Array<{
    name: string;
    description: string;
    isRequired: boolean;
    defaultValue?: string;
  }>;
  tags: string[];
  isPublic: boolean;
  isActive: boolean;
  usageCount: number;
  createdBy: {
    _id: string;
    name: string;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface CreateSavedReplyRequest {
  title: string;
  category: 'SUPPORT' | 'FINANCE' | 'TECHNICAL' | 'GENERAL' | 'BILLING';
  subcategory?: string;
  subject: string;
  content: string;
  variables: Array<{
    name: string;
    description: string;
    isRequired: boolean;
    defaultValue?: string;
  }>;
  tags: string[];
  isPublic: boolean;
}

export interface UseReplyRequest {
  variables: Record<string, string>;
}

export interface UseReplyResponse {
  success: boolean;
  data: {
    subject: string;
    content: string;
    renderedContent: string;
  };
}

export interface SupportStats {
  impersonation: {
    activeSessions: number;
    totalSessions: number;
    avgSessionDuration: number;
  };
  emailResends: {
    todayCount: number;
    weekCount: number;
    monthCount: number;
  };
  notes: {
    totalNotes: number;
    pinnedNotes: number;
    recentNotes: number;
  };
  savedReplies: {
    totalReplies: number;
    popularReplies: number;
    recentUsage: number;
  };
}

// =================== SUPPORT TOOLS SERVICE ===================

class SupportToolsService {
  private readonly baseEndpoint = '/support';

  // ===================== IMPERSONATION APIS =====================

  /**
   * Start user impersonation session
   */
  async startImpersonation(data: StartImpersonationRequest): Promise<ApiResponse<ImpersonationSession>> {
    try {
      const response = await ApiService.post<ApiResponse<ImpersonationSession>>(
        `${this.baseEndpoint}/impersonation/start`,
        data
      );
      return response;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get active impersonation sessions
   */
  async getActiveSessions(page: number = 1, limit: number = 20): Promise<ApiResponse<{ sessions: ImpersonationSession[]; pagination: any }>> {
    try {
      const response = await ApiService.get<ApiResponse<{ sessions: ImpersonationSession[]; pagination: any }>>(
        `${this.baseEndpoint}/impersonation/sessions?page=${page}&limit=${limit}`
      );
      return response;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * End impersonation session
   */
  async endImpersonationSession(sessionId: string): Promise<ApiResponse> {
    try {
      const response = await ApiService.post<ApiResponse>(
        `${this.baseEndpoint}/impersonation/sessions/${sessionId}/end`
      );
      return response;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get impersonation session details
   */
  async getImpersonationSession(sessionId: string): Promise<ApiResponse<ImpersonationSession>> {
    try {
      const response = await ApiService.get<ApiResponse<ImpersonationSession>>(
        `${this.baseEndpoint}/impersonation/sessions/${sessionId}`
      );
      return response;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // ===================== EMAIL RESEND APIS =====================

  /**
   * Get available email types
   */
  async getEmailTypes(): Promise<ApiResponse<EmailType[]>> {
    try {
      const response = await ApiService.get<ApiResponse<EmailType[]>>(
        `${this.baseEndpoint}/email-resend/types`
      );
      return response;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Check rate limits for user
   */
  async getRateLimits(userId: string): Promise<ApiResponse<RateLimitInfo>> {
    try {
      const response = await ApiService.get<ApiResponse<RateLimitInfo>>(
        `${this.baseEndpoint}/email-resend/rate-limits/${userId}`
      );
      return response;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Resend verification email
   */
  async resendVerificationEmail(userId: string, data: EmailResendRequest): Promise<EmailResendResponse> {
    try {
      const response = await ApiService.post<EmailResendResponse>(
        `${this.baseEndpoint}/email-resend/verification/${userId}`,
        data
      );
      return response;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Resend password reset email
   */
  async resendPasswordResetEmail(userId: string, data: EmailResendRequest): Promise<EmailResendResponse> {
    try {
      const response = await ApiService.post<EmailResendResponse>(
        `${this.baseEndpoint}/email-resend/password-reset/${userId}`,
        data
      );
      return response;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Resend welcome email
   */
  async resendWelcomeEmail(userId: string, data: EmailResendRequest): Promise<EmailResendResponse> {
    try {
      const response = await ApiService.post<EmailResendResponse>(
        `${this.baseEndpoint}/email-resend/welcome/${userId}`,
        data
      );
      return response;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Resend receipt email
   */
  async resendReceiptEmail(userId: string, data: EmailResendRequest): Promise<EmailResendResponse> {
    try {
      const response = await ApiService.post<EmailResendResponse>(
        `${this.baseEndpoint}/email-resend/receipt/${userId}`,
        data
      );
      return response;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // ===================== USER NOTES APIS =====================

  /**
   * Get user notes
   */
  async getUserNotes(userId: string, params?: {
    page?: number;
    limit?: number;
    noteType?: string;
    priority?: string;
    search?: string;
  }): Promise<ApiResponse<{ notes: UserNote[]; pagination: any }>> {
    try {
      const queryParams = new URLSearchParams();
      if (params?.page) queryParams.append('page', params.page.toString());
      if (params?.limit) queryParams.append('limit', params.limit.toString());
      if (params?.noteType) queryParams.append('noteType', params.noteType);
      if (params?.priority) queryParams.append('priority', params.priority);
      if (params?.search) queryParams.append('search', params.search);

      const response = await ApiService.get<ApiResponse<{ notes: UserNote[]; pagination: any }>>(
        `${this.baseEndpoint}/notes/${userId}?${queryParams.toString()}`
      );
      return response;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Create user note
   */
  async createUserNote(userId: string, data: CreateUserNoteRequest): Promise<ApiResponse<UserNote>> {
    try {
      const response = await ApiService.post<ApiResponse<UserNote>>(
        `${this.baseEndpoint}/notes/${userId}`,
        data
      );
      return response;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Update user note
   */
  async updateUserNote(userId: string, noteId: string, data: Partial<CreateUserNoteRequest>): Promise<ApiResponse<UserNote>> {
    try {
      const response = await ApiService.put<ApiResponse<UserNote>>(
        `${this.baseEndpoint}/notes/${userId}/${noteId}`,
        data
      );
      return response;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Delete user note
   */
  async deleteUserNote(userId: string, noteId: string): Promise<ApiResponse> {
    try {
      const response = await ApiService.delete<ApiResponse>(
        `${this.baseEndpoint}/notes/${userId}/${noteId}`
      );
      return response;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get user flags
   */
  async getUserFlags(userId: string): Promise<ApiResponse<UserFlag[]>> {
    try {
      const response = await ApiService.get<ApiResponse<UserFlag[]>>(
        `${this.baseEndpoint}/notes/${userId}/flags`
      );
      return response;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Add user flag
   */
  async addUserFlag(userId: string, data: CreateUserFlagRequest): Promise<ApiResponse<UserFlag>> {
    try {
      const response = await ApiService.post<ApiResponse<UserFlag>>(
        `${this.baseEndpoint}/notes/${userId}/flags`,
        data
      );
      return response;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Update user flag
   */
  async updateUserFlag(userId: string, flagId: string, data: Partial<CreateUserFlagRequest>): Promise<ApiResponse<UserFlag>> {
    try {
      const response = await ApiService.put<ApiResponse<UserFlag>>(
        `${this.baseEndpoint}/notes/${userId}/flags/${flagId}`,
        data
      );
      return response;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Remove user flag
   */
  async removeUserFlag(userId: string, flagId: string): Promise<ApiResponse> {
    try {
      const response = await ApiService.delete<ApiResponse>(
        `${this.baseEndpoint}/notes/${userId}/flags/${flagId}`
      );
      return response;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // ===================== SAVED REPLIES APIS =====================

  /**
   * Get saved replies
   */
  async getSavedReplies(params?: {
    page?: number;
    limit?: number;
    category?: string;
    search?: string;
    isPublic?: boolean;
  }): Promise<ApiResponse<{ replies: SavedReply[]; pagination: any }>> {
    try {
      const queryParams = new URLSearchParams();
      if (params?.page) queryParams.append('page', params.page.toString());
      if (params?.limit) queryParams.append('limit', params.limit.toString());
      if (params?.category) queryParams.append('category', params.category);
      if (params?.search) queryParams.append('search', params.search);
      if (params?.isPublic !== undefined) queryParams.append('isPublic', params.isPublic.toString());

      const response = await ApiService.get<ApiResponse<{ replies: SavedReply[]; pagination: any }>>(
        `${this.baseEndpoint}/saved-replies?${queryParams.toString()}`
      );
      return response;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Create saved reply
   */
  async createSavedReply(data: CreateSavedReplyRequest): Promise<ApiResponse<SavedReply>> {
    try {
      const response = await ApiService.post<ApiResponse<SavedReply>>(
        `${this.baseEndpoint}/saved-replies`,
        data
      );
      return response;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Update saved reply
   */
  async updateSavedReply(replyId: string, data: Partial<CreateSavedReplyRequest>): Promise<ApiResponse<SavedReply>> {
    try {
      const response = await ApiService.put<ApiResponse<SavedReply>>(
        `${this.baseEndpoint}/saved-replies/${replyId}`,
        data
      );
      return response;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Delete saved reply
   */
  async deleteSavedReply(replyId: string): Promise<ApiResponse> {
    try {
      const response = await ApiService.delete<ApiResponse>(
        `${this.baseEndpoint}/saved-replies/${replyId}`
      );
      return response;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Use saved reply (render template)
   */
  async useSavedReply(replyId: string, data: UseReplyRequest): Promise<UseReplyResponse> {
    try {
      const response = await ApiService.post<UseReplyResponse>(
        `${this.baseEndpoint}/saved-replies/${replyId}/use`,
        data
      );
      return response;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get saved reply categories
   */
  async getSavedReplyCategories(): Promise<ApiResponse<string[]>> {
    try {
      const response = await ApiService.get<ApiResponse<string[]>>(
        `${this.baseEndpoint}/saved-replies/categories`
      );
      return response;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // ===================== GENERAL SUPPORT APIS =====================

  /**
   * Get support tools statistics
   */
  async getSupportStats(): Promise<ApiResponse<SupportStats>> {
    try {
      const response = await ApiService.get<ApiResponse<SupportStats>>(
        `${this.baseEndpoint}/stats`
      );
      return response;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Search users for impersonation
   */
  async searchUsers(query: string, page: number = 1, limit: number = 10): Promise<ApiResponse<{ users: any[]; pagination: any }>> {
    try {
      const response = await ApiService.get<ApiResponse<{ users: any[]; pagination: any }>>(
        `${this.baseEndpoint}/users/search?q=${encodeURIComponent(query)}&page=${page}&limit=${limit}`
      );
      return response;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get user details for support
   */
  async getUserDetails(userId: string): Promise<ApiResponse<any>> {
    try {
      const response = await ApiService.get<ApiResponse<any>>(
        `${this.baseEndpoint}/users/${userId}`
      );
      return response;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // ===================== HEALTH CHECK =====================

  /**
   * Health check
   */
  async healthCheck(): Promise<ApiResponse<{ status: string; features: string[] }>> {
    try {
      const response = await ApiService.get<ApiResponse<{ status: string; features: string[] }>>(
        this.baseEndpoint
      );
      return response;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // ===================== UTILITY METHODS =====================

  /**
   * Handle API errors
   */
  private handleError(error: any): Error {
    if (error.response?.data?.message) {
      return new Error(error.response.data.message);
    } else if (error.message) {
      return new Error(error.message);
    } else {
      return new Error('An unexpected error occurred');
    }
  }

  /**
   * Format date for display
   */
  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleString();
  }

  /**
   * Format time remaining
   */
  formatTimeRemaining(expiresAt: string): string {
    const now = new Date();
    const expires = new Date(expiresAt);
    const diff = expires.getTime() - now.getTime();
    
    if (diff <= 0) return 'Expired';
    
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes % 60}m`;
    } else {
      return `${minutes}m`;
    }
  }

  /**
   * Render template with variables
   */
  renderTemplate(template: string, variables: Record<string, string>): string {
    let result = template;
    Object.entries(variables).forEach(([key, value]) => {
      const regex = new RegExp(`{{${key}}}`, 'g');
      result = result.replace(regex, value || '');
    });
    return result;
  }
}

export default new SupportToolsService();