import { TokenUtils } from '../../utils/token.utils';

// Types
export interface Address {
  _id?: string;
  street?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
  isPrimary?: boolean;
  type?: 'home' | 'work' | 'billing' | 'shipping' | 'other';
}

export interface IdentityDocument {
  _id?: string;
  type: 'passport' | 'drivers_license' | 'national_id' | 'ssn_last4' | 'tax_id' | 'other';
  number?: string;
  issuingCountry?: string;
  issuingState?: string;
  issueDate?: string;
  expiryDate?: string;
  isVerified?: boolean;
  verifiedAt?: string;
  verifiedBy?: string;
}

export interface PersonalInfo {
  firstName?: string;
  lastName?: string;
  middleName?: string;
  dateOfBirth?: string;
  gender?: 'male' | 'female' | 'other' | 'prefer_not_to_say';
  nationality?: string;
  citizenship?: string[];
  maritalStatus?: 'single' | 'married' | 'divorced' | 'widowed' | 'separated' | 'other';
  dependents?: number;
}

export interface ContactInfo {
  primaryPhone?: string;
  alternatePhone?: string;
  addresses?: Address[];
  emergencyContact?: {
    name?: string;
    relationship?: string;
    phone?: string;
    email?: string;
  };
}

export interface Employment {
  employmentStatus?: 'employed' | 'self_employed' | 'unemployed' | 'student' | 'retired' | 'other';
  employer?: string;
  jobTitle?: string;
  industry?: string;
  annualIncome?: {
    amount?: number;
    currency?: string;
  };
  workAddress?: Address;
}

export interface FinancialProfile {
  netWorth?: {
    amount?: number;
    currency?: string;
  };
  liquidAssets?: {
    amount?: number;
    currency?: string;
  };
  investmentExperience?: 'none' | 'limited' | 'moderate' | 'extensive' | 'professional';
  riskTolerance?: 'conservative' | 'moderate' | 'aggressive' | 'very_aggressive';
  investmentObjectives?: ('capital_preservation' | 'income' | 'growth' | 'speculation' | 'retirement' | 'education')[];
  timeHorizon?: 'short_term' | 'medium_term' | 'long_term';
}

export interface CommunicationPreferences {
  preferredLanguage?: string;
  timezone?: string;
  emailNotifications?: {
    marketing?: boolean;
    transactional?: boolean;
    security?: boolean;
    newsletter?: boolean;
    promotions?: boolean;
  };
  smsNotifications?: {
    enabled?: boolean;
    security?: boolean;
    alerts?: boolean;
  };
  pushNotifications?: {
    enabled?: boolean;
    marketing?: boolean;
    transactional?: boolean;
  };
  preferredContactTime?: {
    start?: string;
    end?: string;
  };
  contactMethods?: ('email' | 'phone' | 'sms' | 'mail' | 'app_notification')[];
}

export interface PrivacyPreferences {
  dataSharing?: {
    analytics?: boolean;
    marketing?: boolean;
    thirdParty?: boolean;
  };
  cookieConsent?: {
    necessary?: boolean;
    functional?: boolean;
    analytics?: boolean;
    marketing?: boolean;
  };
  profileVisibility?: 'private' | 'contacts_only' | 'public';
  dataRetention?: {
    autoDelete?: boolean;
    retentionPeriod?: number;
  };
}

export interface TradingPreferences {
  defaultOrderType?: 'market' | 'limit' | 'stop' | 'stop_limit';
  confirmationRequired?: boolean;
  autoReinvest?: {
    dividends?: boolean;
    capitalGains?: boolean;
  };
  marginTrading?: {
    enabled?: boolean;
    riskLevel?: 'conservative' | 'moderate' | 'aggressive';
  };
  dayTradingPatternDay?: boolean;
}

export interface KycCompletedStep {
  step: string;
  completedAt: string;
  verifiedBy?: string;
}

export interface KycStatus {
  level?: 'none' | 'basic' | 'enhanced' | 'full';
  status?: 'not_started' | 'in_progress' | 'pending_review' | 'approved' | 'rejected' | 'expired';
  completedSteps?: KycCompletedStep[];
  submittedAt?: string;
  reviewedAt?: string;
  approvedAt?: string;
  rejectedAt?: string;
  expiresAt?: string;
  rejectionReason?: string;
  reviewedBy?: string;
  riskScore?: number;
  nextReviewDate?: string;
}

export interface Compliance {
  sanctionsCheck?: {
    status?: 'not_checked' | 'clear' | 'flagged' | 'blocked';
    lastChecked?: string;
    provider?: string;
  };
  pepCheck?: {
    status?: 'not_checked' | 'clear' | 'flagged';
    lastChecked?: string;
  };
  amlRiskRating?: 'low' | 'medium' | 'high' | 'very_high';
}

export interface ProfileCompletion {
  percentage?: number;
  missingFields?: {
    field: string;
    category: string;
    importance: 'required' | 'recommended' | 'optional';
  }[];
  lastUpdated?: string;
}

export interface SubscriberProfile {
  _id?: string;
  user?: {
    _id: string;
    name: string;
    email: string;
    phone?: string;
    isActive: boolean;
    createdAt: string;
  };
  personalInfo?: PersonalInfo;
  contactInfo?: ContactInfo;
  identityDocuments?: IdentityDocument[];
  employment?: Employment;
  financialProfile?: FinancialProfile;
  communicationPreferences?: CommunicationPreferences;
  privacyPreferences?: PrivacyPreferences;
  tradingPreferences?: TradingPreferences;
  kycStatus?: KycStatus;
  compliance?: Compliance;
  profileCompletion?: ProfileCompletion;
  metadata?: {
    source?: string;
    referralCode?: string;
    utmSource?: string;
    utmMedium?: string;
    utmCampaign?: string;
    ipAddress?: string;
    userAgent?: string;
    customFields?: Record<string, any>;
  };
  createdBy?: string;
  updatedBy?: string;
  lastLoginAt?: string;
  profileViewCount?: number;
  createdAt?: string;
  updatedAt?: string;
  
  // Virtual fields
  fullName?: string;
  age?: number;
  primaryAddress?: Address;
  isKycComplete?: boolean;
}

export interface ProfileAnalytics {
  totalProfiles: number;
  avgCompletionRate: number;
  avgAge: number;
  kycLevelDistribution: {
    none: number;
    basic: number;
    enhanced: number;
    full: number;
  };
  kycStatusDistribution: {
    not_started: number;
    in_progress: number;
    pending_review: number;
    approved: number;
    rejected: number;
  };
  totalUsers: number;
  profilesWithKyc: number;
  profileCompletionRate: number;
  kycAdoptionRate: number;
}

export interface CreateIdentityDocumentData {
  type: 'passport' | 'drivers_license' | 'national_id' | 'ssn_last4' | 'tax_id' | 'other';
  number: string;
  issuingCountry?: string;
  issuingState?: string;
  issueDate?: string;
  expiryDate?: string;
}

export interface UpdateKycStatusData {
  status: 'not_started' | 'in_progress' | 'pending_review' | 'approved' | 'rejected' | 'expired';
  level?: 'none' | 'basic' | 'enhanced' | 'full';
  rejectionReason?: string;
  riskScore?: number;
}

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
const BASE_PATH = '/subscriber-profiles';

class SubscriberProfileService {
  private getAuthHeaders(): HeadersInit {
    const token = TokenUtils.getToken();
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
  }

  // Get current user's profile
  async getMyProfile(): Promise<{ success: boolean; data: SubscriberProfile }> {
    try {
      const response = await fetch(`${BASE_URL}${BASE_PATH}/my-profile`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching my profile:', error);
      throw error;
    }
  }

  // Update current user's profile
  async updateMyProfile(data: Partial<SubscriberProfile>): Promise<{ success: boolean; data: SubscriberProfile }> {
    try {
      const response = await fetch(`${BASE_URL}${BASE_PATH}/my-profile`, {
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
      console.error('Error updating my profile:', error);
      throw error;
    }
  }

  // Get all profiles (admin only)
  async getAllProfiles(filters?: {
    page?: number;
    limit?: number;
    search?: string;
    kycStatus?: string;
    kycLevel?: string;
    completionRange?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }): Promise<{ success: boolean; data: any }> {
    try {
      const queryParams = new URLSearchParams();
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== '') {
            queryParams.append(key, String(value));
          }
        });
      }

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
      console.error('Error fetching all profiles:', error);
      throw error;
    }
  }

  // Get profile by ID (admin only)
  async getProfileById(id: string): Promise<{ success: boolean; data: SubscriberProfile }> {
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
      console.error('Error fetching profile by ID:', error);
      throw error;
    }
  }

  // Update profile by ID (admin only)
  async updateProfileById(id: string, data: Partial<SubscriberProfile>): Promise<{ success: boolean; data: SubscriberProfile }> {
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
      console.error('Error updating profile by ID:', error);
      throw error;
    }
  }

  // Update KYC status (admin only)
  async updateKycStatus(id: string, data: UpdateKycStatusData): Promise<{ success: boolean; data: SubscriberProfile }> {
    try {
      const response = await fetch(`${BASE_URL}${BASE_PATH}/${id}/kyc-status`, {
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
      console.error('Error updating KYC status:', error);
      throw error;
    }
  }

  // Complete KYC step
  async completeKycStep(step: string): Promise<{ success: boolean; data: SubscriberProfile }> {
    try {
      const response = await fetch(`${BASE_URL}${BASE_PATH}/kyc/complete-step`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        credentials: 'include',
        body: JSON.stringify({ step }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error completing KYC step:', error);
      throw error;
    }
  }

  // Add identity document
  async addIdentityDocument(data: CreateIdentityDocumentData): Promise<{ success: boolean; data: SubscriberProfile }> {
    try {
      const response = await fetch(`${BASE_URL}${BASE_PATH}/identity-documents`, {
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
      console.error('Error adding identity document:', error);
      throw error;
    }
  }

  // Verify identity document (admin only)
  async verifyIdentityDocument(profileId: string, documentId: string, verified: boolean): Promise<{ success: boolean; data: SubscriberProfile }> {
    try {
      const response = await fetch(`${BASE_URL}${BASE_PATH}/${profileId}/identity-documents/${documentId}/verify`, {
        method: 'PUT',
        headers: this.getAuthHeaders(),
        credentials: 'include',
        body: JSON.stringify({ verified }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error verifying identity document:', error);
      throw error;
    }
  }

  // Get profile analytics (admin only)
  async getProfileAnalytics(): Promise<{ success: boolean; data: ProfileAnalytics }> {
    try {
      const response = await fetch(`${BASE_URL}${BASE_PATH}/analytics`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching profile analytics:', error);
      throw error;
    }
  }

  // Get KYC queue (admin only)
  async getKycQueue(filters?: {
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }): Promise<{ success: boolean; data: any }> {
    try {
      const queryParams = new URLSearchParams();
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== '') {
            queryParams.append(key, String(value));
          }
        });
      }

      const response = await fetch(`${BASE_URL}${BASE_PATH}/kyc-queue?${queryParams}`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching KYC queue:', error);
      throw error;
    }
  }

  // Export profile data
  async exportMyProfile(): Promise<{ success: boolean; data: any }> {
    try {
      const response = await fetch(`${BASE_URL}${BASE_PATH}/my-profile/export`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error exporting my profile:', error);
      throw error;
    }
  }

  // Delete profile (admin only)
  async deleteProfile(id: string, reason?: string): Promise<{ success: boolean; message: string }> {
    try {
      const response = await fetch(`${BASE_URL}${BASE_PATH}/${id}`, {
        method: 'DELETE',
        headers: this.getAuthHeaders(),
        credentials: 'include',
        body: JSON.stringify({ reason }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error deleting profile:', error);
      throw error;
    }
  }

  // Utility methods for UI formatting
  formatKycStatus(status: string): string {
    return status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  }

  formatKycLevel(level: string): string {
    return level.replace(/\b\w/g, l => l.toUpperCase());
  }

  formatEmploymentStatus(status: string): string {
    return status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  }

  getKycStatusColor(status: string): string {
    const colors: Record<string, string> = {
      not_started: 'bg-gray-100 text-gray-800',
      in_progress: 'bg-blue-100 text-blue-800',
      pending_review: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
      expired: 'bg-orange-100 text-orange-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  }

  getKycLevelColor(level: string): string {
    const colors: Record<string, string> = {
      none: 'bg-gray-100 text-gray-800',
      basic: 'bg-blue-100 text-blue-800',
      enhanced: 'bg-purple-100 text-purple-800',
      full: 'bg-green-100 text-green-800',
    };
    return colors[level] || 'bg-gray-100 text-gray-800';
  }

  getCompletionColor(percentage: number): string {
    if (percentage >= 80) return 'bg-green-100 text-green-800';
    if (percentage >= 60) return 'bg-yellow-100 text-yellow-800';
    if (percentage >= 40) return 'bg-orange-100 text-orange-800';
    return 'bg-red-100 text-red-800';
  }

  getAmlRiskColor(risk: string): string {
    const colors: Record<string, string> = {
      low: 'bg-green-100 text-green-800',
      medium: 'bg-yellow-100 text-yellow-800',
      high: 'bg-orange-100 text-orange-800',
      very_high: 'bg-red-100 text-red-800',
    };
    return colors[risk] || 'bg-gray-100 text-gray-800';
  }

  formatAge(dateOfBirth: string): number | null {
    if (!dateOfBirth) return null;
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  }

  formatAddress(address: Address): string {
    if (!address) return '';
    const parts = [address.street, address.city, address.state, address.postalCode, address.country].filter(Boolean);
    return parts.join(', ');
  }
}

export const subscriberProfileService = new SubscriberProfileService();
export default subscriberProfileService;