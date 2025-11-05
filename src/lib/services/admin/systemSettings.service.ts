// System Settings Service
import ApiService from '../shared/api.service';

export interface SystemSettings {
  id: string;
  organizationName: string;
  organizationLogo?: string;
  supportEmail: string;
  supportPhone?: string;
  defaultCurrency: string;
  defaultTimezone: string;
  maintenanceMode: boolean;
  maintenanceMessage?: string;
  featureFlags: FeatureFlag[];
  legalTexts: LegalText[];
  policyUrls: PolicyUrl[];
  configuration: SystemConfiguration;
  createdAt: Date;
  updatedAt: Date;
}

export interface FeatureFlag {
  id: string;
  name: string;
  key: string;
  description: string;
  enabled: boolean;
  rolloutPercentage: number;
  targetAudience?: string[];
  conditions?: any;
  createdAt: Date;
  updatedAt: Date;
}

export interface LegalText {
  id: string;
  type: LegalTextType;
  title: string;
  content: string;
  version: string;
  effectiveDate: Date;
  language: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface PolicyUrl {
  id: string;
  type: PolicyType;
  title: string;
  url: string;
  description?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface SystemConfiguration {
  authentication: {
    requireEmailVerification: boolean;
    requirePhoneVerification: boolean;
    passwordMinLength: number;
    passwordRequireUppercase: boolean;
    passwordRequireLowercase: boolean;
    passwordRequireNumbers: boolean;
    passwordRequireSymbols: boolean;
    sessionTimeout: number;
    maxLoginAttempts: number;
    lockoutDuration: number;
  };
  notifications: {
    emailEnabled: boolean;
    smsEnabled: boolean;
    pushEnabled: boolean;
    defaultEmailProvider: string;
    defaultSmsProvider: string;
  };
  billing: {
    taxCalculationEnabled: boolean;
    defaultTaxRate: number;
    invoiceAutoGeneration: boolean;
    paymentRetryAttempts: number;
    dunningEnabled: boolean;
  };
  security: {
    encryptionEnabled: boolean;
    auditLoggingEnabled: boolean;
    ipWhitelistEnabled: boolean;
    allowedIpRanges: string[];
    rateLimitEnabled: boolean;
    maxRequestsPerMinute: number;
  };
}

export enum LegalTextType {
  TERMS_OF_SERVICE = 'terms_of_service',
  PRIVACY_POLICY = 'privacy_policy',
  COOKIE_POLICY = 'cookie_policy',
  GDPR_NOTICE = 'gdpr_notice',
  ACCEPTABLE_USE = 'acceptable_use'
}

export enum PolicyType {
  PRIVACY_POLICY = 'privacy_policy',
  TERMS_OF_SERVICE = 'terms_of_service',
  COOKIE_POLICY = 'cookie_policy',
  SUPPORT = 'support',
  CONTACT = 'contact',
  ABOUT = 'about'
}

export interface CreateFeatureFlagData {
  name: string;
  key: string;
  description: string;
  enabled: boolean;
  rolloutPercentage: number;
  targetAudience?: string[];
  conditions?: any;
}

export interface CreateLegalTextData {
  type: LegalTextType;
  title: string;
  content: string;
  version: string;
  effectiveDate: Date;
  language: string;
  isActive: boolean;
}

export interface CreatePolicyUrlData {
  type: PolicyType;
  title: string;
  url: string;
  description?: string;
  isActive: boolean;
}

export interface SystemAnalytics {
  totalUsers: number;
  activeUsers: number;
  totalSubscriptions: number;
  totalRevenue: number;
  systemUptime: number;
  averageResponseTime: number;
  errorRate: number;
  featureFlagUsage: Array<{
    flag: string;
    usage: number;
    percentage: number;
  }>;
  performanceMetrics: Array<{
    metric: string;
    value: number;
    trend: 'up' | 'down' | 'stable';
  }>;
}

class SystemSettingsService {
  private readonly endpoint = '/system-settings';

  async getSettings(): Promise<SystemSettings> {
    return ApiService.get(this.endpoint);
  }

  async updateSettings(data: Partial<SystemSettings>): Promise<SystemSettings> {
    return ApiService.put(this.endpoint, data);
  }

  async updateConfiguration(config: Partial<SystemConfiguration>): Promise<SystemSettings> {
    return ApiService.put(`${this.endpoint}/configuration`, config);
  }

  // Feature Flags
  async getFeatureFlags(): Promise<FeatureFlag[]> {
    return ApiService.get(`${this.endpoint}/feature-flags`);
  }

  async createFeatureFlag(data: CreateFeatureFlagData): Promise<FeatureFlag> {
    return ApiService.post(`${this.endpoint}/feature-flags`, data);
  }

  async updateFeatureFlag(id: string, data: Partial<CreateFeatureFlagData>): Promise<FeatureFlag> {
    return ApiService.put(`${this.endpoint}/feature-flags/${id}`, data);
  }

  async deleteFeatureFlag(id: string): Promise<void> {
    return ApiService.delete(`${this.endpoint}/feature-flags/${id}`);
  }

  async toggleFeatureFlag(id: string): Promise<FeatureFlag> {
    return ApiService.post(`${this.endpoint}/feature-flags/${id}/toggle`);
  }

  // Legal Texts
  async getLegalTexts(): Promise<LegalText[]> {
    return ApiService.get(`${this.endpoint}/legal-texts`);
  }

  async createLegalText(data: CreateLegalTextData): Promise<LegalText> {
    return ApiService.post(`${this.endpoint}/legal-texts`, data);
  }

  async updateLegalText(id: string, data: Partial<CreateLegalTextData>): Promise<LegalText> {
    return ApiService.put(`${this.endpoint}/legal-texts/${id}`, data);
  }

  async deleteLegalText(id: string): Promise<void> {
    return ApiService.delete(`${this.endpoint}/legal-texts/${id}`);
  }

  // Policy URLs
  async getPolicyUrls(): Promise<PolicyUrl[]> {
    return ApiService.get(`${this.endpoint}/policy-urls`);
  }

  async createPolicyUrl(data: CreatePolicyUrlData): Promise<PolicyUrl> {
    return ApiService.post(`${this.endpoint}/policy-urls`, data);
  }

  async updatePolicyUrl(id: string, data: Partial<CreatePolicyUrlData>): Promise<PolicyUrl> {
    return ApiService.put(`${this.endpoint}/policy-urls/${id}`, data);
  }

  async deletePolicyUrl(id: string): Promise<void> {
    return ApiService.delete(`${this.endpoint}/policy-urls/${id}`);
  }

  // Analytics
  async getAnalytics(): Promise<SystemAnalytics> {
    return ApiService.get(`${this.endpoint}/analytics`);
  }

  // Maintenance
  async enableMaintenanceMode(message?: string): Promise<SystemSettings> {
    return ApiService.post(`${this.endpoint}/maintenance/enable`, { message });
  }

  async disableMaintenanceMode(): Promise<SystemSettings> {
    return ApiService.post(`${this.endpoint}/maintenance/disable`);
  }

  // Backup and Export
  async exportSettings(): Promise<Blob> {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}${this.endpoint}/export`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${ApiService.getToken()}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to export settings');
    }

    return response.blob();
  }

  async importSettings(file: File): Promise<SystemSettings> {
    const formData = new FormData();
    formData.append('file', file);

    return ApiService.postFormData(`${this.endpoint}/import`, formData);
  }

  // System Health
  async getSystemHealth(): Promise<{
    status: 'healthy' | 'degraded' | 'down';
    checks: Array<{
      name: string;
      status: 'pass' | 'fail';
      message?: string;
      responseTime?: number;
    }>;
  }> {
    return ApiService.get(`${this.endpoint}/health`);
  }
}

export const systemSettingsService = new SystemSettingsService();
export default systemSettingsService;