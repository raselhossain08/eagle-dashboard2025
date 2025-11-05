import { TokenUtils } from '../../utils/token.utils';

export interface FeatureFlag {
  _id?: string;
  key: string;
  name: string;
  description?: string;
  enabled: boolean;
  environment: 'development' | 'staging' | 'production' | 'all';
  rolloutPercentage: number;
  targetRoles: string[];
  targetUsers: string[];
  conditions?: {
    userAttributes?: any;
    customLogic?: string;
  };
  metadata?: any;
  tags?: string[];
  expiresAt?: string;
  createdBy?: string;
  updatedBy?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface LegalText {
  _id?: string;
  type: 'privacy_policy' | 'terms_of_service' | 'cookie_policy' | 'data_protection' | 'gdpr_notice' | 'ccpa_notice' | 'disclaimer' | 'acceptable_use' | 'refund_policy' | 'subscription_terms' | 'api_terms' | 'compliance_notice';
  version: string;
  title: string;
  content: string;
  contentFormat: 'html' | 'markdown' | 'plain_text';
  language: string;
  isActive: boolean;
  effectiveDate: string;
  expirationDate?: string;
  jurisdiction?: string;
  lastReviewDate?: string;
  nextReviewDate?: string;
  approvalStatus: 'draft' | 'pending_review' | 'approved' | 'rejected' | 'archived';
  approvedBy?: string;
  approvedAt?: string;
  tags?: string[];
  metadata?: any;
  changeLog?: Array<{
    version: string;
    changes: string;
    changedBy: string;
    changedAt: string;
  }>;
  createdBy?: string;
  updatedBy?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface PolicyUrl {
  _id?: string;
  key: string;
  name: string;
  description?: string;
  url: string;
  category: 'legal' | 'privacy' | 'support' | 'social_media' | 'external_service' | 'documentation' | 'api' | 'marketing' | 'compliance' | 'other';
  isActive: boolean;
  isPublic: boolean;
  displayOrder: number;
  openInNewTab: boolean;
  metadata?: any;
  lastChecked?: string;
  isAccessible: boolean;
  responseTime?: number;
  statusCode?: number;
  createdBy?: string;
  updatedBy?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface SystemConfiguration {
  _id?: string;
  key: string;
  category: 'application' | 'security' | 'payment' | 'notification' | 'integration' | 'ui_settings' | 'business_rules' | 'compliance' | 'performance' | 'feature_limits';
  name: string;
  description?: string;
  value: any;
  dataType: 'string' | 'number' | 'boolean' | 'object' | 'array';
  isSecret: boolean;
  isReadOnly: boolean;
  validation?: {
    required?: boolean;
    min?: number;
    max?: number;
    pattern?: string;
    options?: any[];
  };
  environment: 'development' | 'staging' | 'production' | 'all';
  metadata?: any;
  lastModified?: string;
  modifiedBy?: string;
  createdBy?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface SystemSettings {
  _id?: string;
  applicationName: string;
  applicationVersion: string;
  maintenanceMode: boolean;
  maintenanceMessage: string;
  featureFlags: FeatureFlag[];
  legalTexts: LegalText[];
  policyUrls: PolicyUrl[];
  configurations: SystemConfiguration[];
  cacheEnabled: boolean;
  cacheTTL: number;
  lastFullBackup?: string;
  lastConfigUpdate?: string;
  configUpdateBy?: string;
  metadata?: any;
  configVersion: string;
  changeHistory?: Array<{
    version: string;
    changes: string;
    changedBy: string;
    changedAt: string;
  }>;
  createdAt?: string;
  updatedAt?: string;
}

export interface PublicSettings {
  applicationName: string;
  applicationVersion: string;
  maintenanceMode: boolean;
  maintenanceMessage: string;
  policyUrls: PolicyUrl[];
  featureFlags: Array<{
    key: string;
    name: string;
    description?: string;
  }>;
}

export interface SystemAnalytics {
  featureFlags: {
    total: number;
    enabled: number;
    byEnvironment: Record<string, number>;
  };
  legalTexts: {
    total: number;
    active: number;
    byType: Record<string, number>;
    byStatus: Record<string, number>;
  };
  policyUrls: {
    total: number;
    active: number;
    public: number;
    byCategory: Record<string, number>;
  };
  configurations: {
    total: number;
    byCategory: Record<string, number>;
    secret: number;
    readOnly: number;
  };
  systemInfo: {
    lastUpdate: string;
    configVersion: string;
    totalChanges: number;
  };
}

export interface CreateFeatureFlagData {
  name: string;
  description?: string;
  enabled?: boolean;
  environment?: 'development' | 'staging' | 'production' | 'all';
  rolloutPercentage?: number;
  targetRoles?: string[];
  targetUsers?: string[];
  conditions?: {
    userAttributes?: any;
    customLogic?: string;
  };
  metadata?: any;
  tags?: string[];
  expiresAt?: string;
}

export interface CreateLegalTextData {
  type: 'privacy_policy' | 'terms_of_service' | 'cookie_policy' | 'data_protection' | 'gdpr_notice' | 'ccpa_notice' | 'disclaimer' | 'acceptable_use' | 'refund_policy' | 'subscription_terms' | 'api_terms' | 'compliance_notice';
  version: string;
  title: string;
  content: string;
  contentFormat?: 'html' | 'markdown' | 'plain_text';
  language?: string;
  effectiveDate: string;
  expirationDate?: string;
  jurisdiction?: string;
  tags?: string[];
  metadata?: any;
}

export interface CreatePolicyUrlData {
  name: string;
  description?: string;
  url: string;
  category?: 'legal' | 'privacy' | 'support' | 'social_media' | 'external_service' | 'documentation' | 'api' | 'marketing' | 'compliance' | 'other';
  isActive?: boolean;
  isPublic?: boolean;
  displayOrder?: number;
  openInNewTab?: boolean;
  metadata?: any;
}

const BASE_URL = process.env.NODE_ENV === 'production' 
  ? process.env.NEXT_PUBLIC_API_URL || 'https://eagle-backend.vercel.app'
  : 'http://localhost:5000';

const BASE_PATH = '/api/system-settings';

class SystemSettingsService {
  private getAuthHeaders(): HeadersInit {
    // Get token from cookie or local storage - this is a placeholder
    // In a real app, you would implement this based on your auth strategy
    const token = null; // TokenUtils.getToken();
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
  }

  // Get all system settings (admin only)
  async getSystemSettings(): Promise<{ success: boolean; data: SystemSettings }> {
    try {
      const response = await fetch(`${BASE_URL}${BASE_PATH}`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching system settings:', error);
      throw error;
    }
  }

  // Get public settings (no auth required)
  async getPublicSettings(): Promise<{ success: boolean; data: PublicSettings }> {
    try {
      const response = await fetch(`${BASE_URL}${BASE_PATH}/public`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching public settings:', error);
      throw error;
    }
  }

  // Get system analytics
  async getSystemAnalytics(): Promise<{ success: boolean; data: SystemAnalytics }> {
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
      console.error('Error fetching system analytics:', error);
      throw error;
    }
  }

  // Feature Flags
  async getFeatureFlags(filters?: { environment?: string; enabled?: boolean }): Promise<{ success: boolean; data: FeatureFlag[] }> {
    try {
      const queryParams = new URLSearchParams();
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined) {
            queryParams.append(key, String(value));
          }
        });
      }

      const response = await fetch(`${BASE_URL}${BASE_PATH}/feature-flags?${queryParams}`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching feature flags:', error);
      throw error;
    }
  }

  async updateFeatureFlag(key: string, data: CreateFeatureFlagData): Promise<{ success: boolean; data: FeatureFlag }> {
    try {
      const response = await fetch(`${BASE_URL}${BASE_PATH}/feature-flags/${key}`, {
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
      console.error('Error updating feature flag:', error);
      throw error;
    }
  }

  async deleteFeatureFlag(key: string): Promise<{ success: boolean; message: string }> {
    try {
      const response = await fetch(`${BASE_URL}${BASE_PATH}/feature-flags/${key}`, {
        method: 'DELETE',
        headers: this.getAuthHeaders(),
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error deleting feature flag:', error);
      throw error;
    }
  }

  async checkFeatureFlag(key: string): Promise<{ success: boolean; data: { key: string; enabled: boolean; userId: string; userRole: string } }> {
    try {
      const response = await fetch(`${BASE_URL}${BASE_PATH}/feature-flag/${key}/check`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error checking feature flag:', error);
      throw error;
    }
  }

  // Legal Texts
  async getLegalTexts(filters?: { type?: string; language?: string; status?: string }): Promise<{ success: boolean; data: LegalText[] }> {
    try {
      const queryParams = new URLSearchParams();
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined) {
            queryParams.append(key, String(value));
          }
        });
      }

      const response = await fetch(`${BASE_URL}${BASE_PATH}/legal-texts?${queryParams}`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching legal texts:', error);
      throw error;
    }
  }

  async addLegalText(data: CreateLegalTextData): Promise<{ success: boolean; data: LegalText }> {
    try {
      const response = await fetch(`${BASE_URL}${BASE_PATH}/legal-texts`, {
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
      console.error('Error adding legal text:', error);
      throw error;
    }
  }

  async updateLegalText(id: string, data: Partial<LegalText>): Promise<{ success: boolean; data: LegalText }> {
    try {
      const response = await fetch(`${BASE_URL}${BASE_PATH}/legal-texts/${id}`, {
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
      console.error('Error updating legal text:', error);
      throw error;
    }
  }

  async approveLegalText(id: string): Promise<{ success: boolean; data: LegalText }> {
    try {
      const response = await fetch(`${BASE_URL}${BASE_PATH}/legal-texts/${id}/approve`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error approving legal text:', error);
      throw error;
    }
  }

  // Policy URLs
  async getPolicyUrls(filters?: { category?: string; isActive?: boolean }): Promise<{ success: boolean; data: PolicyUrl[] }> {
    try {
      const queryParams = new URLSearchParams();
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined) {
            queryParams.append(key, String(value));
          }
        });
      }

      const response = await fetch(`${BASE_URL}${BASE_PATH}/policy-urls?${queryParams}`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching policy URLs:', error);
      throw error;
    }
  }

  async updatePolicyUrl(key: string, data: CreatePolicyUrlData): Promise<{ success: boolean; data: PolicyUrl }> {
    try {
      const response = await fetch(`${BASE_URL}${BASE_PATH}/policy-urls/${key}`, {
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
      console.error('Error updating policy URL:', error);
      throw error;
    }
  }

  async deletePolicyUrl(key: string): Promise<{ success: boolean; message: string }> {
    try {
      const response = await fetch(`${BASE_URL}${BASE_PATH}/policy-urls/${key}`, {
        method: 'DELETE',
        headers: this.getAuthHeaders(),
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error deleting policy URL:', error);
      throw error;
    }
  }

  // Configurations
  async getConfigurations(filters?: { category?: string; environment?: string }): Promise<{ success: boolean; data: SystemConfiguration[] }> {
    try {
      const queryParams = new URLSearchParams();
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined) {
            queryParams.append(key, String(value));
          }
        });
      }

      const response = await fetch(`${BASE_URL}${BASE_PATH}/configurations?${queryParams}`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching configurations:', error);
      throw error;
    }
  }

  async updateConfiguration(key: string, value: any): Promise<{ success: boolean; data: SystemConfiguration }> {
    try {
      const response = await fetch(`${BASE_URL}${BASE_PATH}/configurations/${key}`, {
        method: 'PUT',
        headers: this.getAuthHeaders(),
        credentials: 'include',
        body: JSON.stringify({ value }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error updating configuration:', error);
      throw error;
    }
  }

  // Maintenance Mode
  async toggleMaintenanceMode(enabled: boolean, message?: string): Promise<{ success: boolean; data: { maintenanceMode: boolean; maintenanceMessage: string } }> {
    try {
      const response = await fetch(`${BASE_URL}${BASE_PATH}/maintenance-mode`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        credentials: 'include',
        body: JSON.stringify({ enabled, message }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error toggling maintenance mode:', error);
      throw error;
    }
  }

  // Export settings
  async exportSettings(): Promise<Blob> {
    try {
      const response = await fetch(`${BASE_URL}${BASE_PATH}/export`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.blob();
    } catch (error) {
      console.error('Error exporting settings:', error);
      throw error;
    }
  }

  // Utility methods
  getStatusColor(status: string): string {
    const statusColors: Record<string, string> = {
      draft: 'bg-gray-100 text-gray-800',
      pending_review: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
      archived: 'bg-gray-100 text-gray-600',
    };
    return statusColors[status] || 'bg-gray-100 text-gray-800';
  }

  getCategoryColor(category: string): string {
    const categoryColors: Record<string, string> = {
      legal: 'bg-blue-100 text-blue-800',
      privacy: 'bg-purple-100 text-purple-800',
      support: 'bg-green-100 text-green-800',
      social_media: 'bg-pink-100 text-pink-800',
      external_service: 'bg-orange-100 text-orange-800',
      documentation: 'bg-indigo-100 text-indigo-800',
      api: 'bg-teal-100 text-teal-800',
      marketing: 'bg-red-100 text-red-800',
      compliance: 'bg-yellow-100 text-yellow-800',
      other: 'bg-gray-100 text-gray-800',
    };
    return categoryColors[category] || 'bg-gray-100 text-gray-800';
  }

  getEnvironmentColor(environment: string): string {
    const envColors: Record<string, string> = {
      development: 'bg-blue-100 text-blue-800',
      staging: 'bg-yellow-100 text-yellow-800',
      production: 'bg-green-100 text-green-800',
      all: 'bg-purple-100 text-purple-800',
    };
    return envColors[environment] || 'bg-gray-100 text-gray-800';
  }

  formatLegalTextType(type: string): string {
    return type.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  }

  formatPolicyCategory(category: string): string {
    return category.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  }
}

export const systemSettingsService = new SystemSettingsService();
export default systemSettingsService;