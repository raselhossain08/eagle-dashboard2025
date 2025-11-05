import { ApiClient } from '../shared';

// Types
export interface IntegrationCredentials {
  [key: string]: string;
}

export interface IntegrationConfiguration {
  [key: string]: any;
}

export interface IntegrationSettings {
  _id: string;
  provider: string;
  category: 'PAYMENT' | 'EMAIL' | 'SMS' | 'TAX';
  credentials: IntegrationCredentials;
  configuration: IntegrationConfiguration;
  isActive: boolean;
  isPrimary: boolean;
  priority: number;
  usage: {
    totalRequests: number;
    successfulRequests: number;
    failedRequests: number;
    lastUsed: string;
  };
  healthStatus: {
    status: 'HEALTHY' | 'DEGRADED' | 'ERROR';
    lastCheck: string;
    responseTime: number;
  };
  createdAt: string;
  updatedAt: string;
}

export interface ConfigureIntegrationRequest {
  provider: string;
  category: 'PAYMENT' | 'EMAIL' | 'SMS' | 'TAX';
  credentials: IntegrationCredentials;
  configuration: IntegrationConfiguration;
  isPrimary?: boolean;
  isActive?: boolean;
  priority?: number;
}

export interface UpdateIntegrationRequest {
  configuration?: IntegrationConfiguration;
  isActive?: boolean;
  isPrimary?: boolean;
}

export interface TestIntegrationRequest {
  testEmail?: string;
  testPhone?: string;
}

export interface HealthCheckResponse {
  overall: 'healthy' | 'degraded' | 'critical';
  services: {
    payment?: string;
    communication?: string;
    tax?: string;
  };
  timestamp: string;
}

export interface PaymentRequest {
  amount: number;
  currency: string;
  paymentMethodId: string;
  customerId?: string;
  description?: string;
  metadata?: Record<string, any>;
  preferredProvider?: string;
  enableFailover?: boolean;
}

export interface CreateCustomerRequest {
  email: string;
  name: string;
  phone?: string;
  address?: {
    line1: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  metadata?: Record<string, any>;
  preferredProvider?: string;
}

export interface RefundRequest {
  paymentId: string;
  amount?: number;
  reason?: string;
  provider: string;
}

export interface SendEmailRequest {
  to: string;
  subject?: string;
  html?: string;
  text?: string;
  from?: {
    email: string;
    name: string;
  };
  replyTo?: string;
  attachments?: Array<{
    filename: string;
    content: string;
    type: string;
  }>;
  template?: {
    id: string;
    alias?: string;
  };
  templateData?: Record<string, any>;
  preferredProvider?: string;
  enableFailover?: boolean;
}

export interface SendSMSRequest {
  to: string;
  message: string;
  statusCallback?: string;
  validityPeriod?: number;
  preferredProvider?: string;
}

export interface TaxCalculationRequest {
  amount: number;
  currency: string;
  fromAddress: {
    line1: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  toAddress: {
    line1: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  lineItems?: Array<{
    description: string;
    amount: number;
    quantity: number;
    taxCode?: string;
  }>;
  preferredProvider?: string;
}

class IntegrationService {
  private readonly basePath = '/integrations';
  
  // Integration Settings Management
  async listIntegrations(params?: {
    category?: string;
    isActive?: boolean;
  }) {
    return ApiClient.get<{ data: IntegrationSettings[] }>(`${this.basePath}/settings/list`, { params });
  }

  async configureIntegration(data: ConfigureIntegrationRequest) {
    return ApiClient.post<{ data: IntegrationSettings }>(`${this.basePath}/settings/configure`, data);
  }

  async updateIntegration(id: string, data: UpdateIntegrationRequest) {
    return ApiClient.put<{ data: IntegrationSettings }>(`${this.basePath}/settings/${id}`, data);
  }

  async deleteIntegration(id: string) {
    return ApiClient.delete(`${this.basePath}/settings/${id}`);
  }

  async toggleIntegration(id: string) {
    return ApiClient.post<{ data: IntegrationSettings }>(`${this.basePath}/settings/${id}/toggle`);
  }

  async testIntegration(id: string, data?: TestIntegrationRequest) {
    return ApiClient.post(`${this.basePath}/settings/${id}/test`, data);
  }

  async getIntegrationStats() {
    return ApiClient.get(`${this.basePath}/settings/stats`);
  }

  async bulkConfigure(integrations: ConfigureIntegrationRequest[]) {
    return ApiClient.post(`${this.basePath}/settings/bulk/configure`, { integrations });
  }

  // Health Monitoring
  async getSystemHealth() {
    return ApiClient.get<{ data: HealthCheckResponse }>(`${this.basePath}/health`);
  }

  async getPaymentHealth() {
    return ApiClient.get(`${this.basePath}/payment/health`);
  }

  async getCommunicationHealth() {
    return ApiClient.get(`${this.basePath}/communication/health`);
  }

  async getTaxHealth() {
    return ApiClient.get(`${this.basePath}/tax/health`);
  }

  // Payment Operations
  async processPayment(data: PaymentRequest) {
    return ApiClient.post(`${this.basePath}/payment/process`, data);
  }

  async createCustomer(data: CreateCustomerRequest) {
    return ApiClient.post(`${this.basePath}/payment/customer/create`, data);
  }

  async refundPayment(data: RefundRequest) {
    return ApiClient.post(`${this.basePath}/payment/refund`, data);
  }

  // Communication Operations
  async sendEmail(data: SendEmailRequest) {
    return ApiClient.post(`${this.basePath}/communication/email/send`, data);
  }

  async sendSMS(data: SendSMSRequest) {
    return ApiClient.post(`${this.basePath}/communication/sms/send`, data);
  }

  async validateEmail(email: string, provider?: string) {
    return ApiClient.get(`${this.basePath}/communication/email/validate`, {
      params: { email, provider }
    });
  }

  async validatePhone(phone: string, provider?: string) {
    return ApiClient.get(`${this.basePath}/communication/phone/validate`, {
      params: { phone, provider }
    });
  }

  // Tax Operations
  async calculateTax(data: TaxCalculationRequest) {
    return ApiClient.post(`${this.basePath}/tax/calculate`, data);
  }

  async createTaxTransaction(data: any) {
    return ApiClient.post(`${this.basePath}/tax/transaction`, data);
  }

  async commitTaxTransaction(provider: string, transactionCode: string) {
    return ApiClient.post(`${this.basePath}/tax/transaction/${provider}/${transactionCode}/commit`);
  }

  async voidTaxTransaction(provider: string, transactionCode: string, reason?: string) {
    return ApiClient.post(`${this.basePath}/tax/transaction/${provider}/${transactionCode}/void`, { reason });
  }

  async getTaxRates(params: {
    city?: string;
    state?: string;
    postalCode?: string;
    provider?: string;
  }) {
    return ApiClient.get(`${this.basePath}/tax/rates`, { params });
  }

  async validateAddress(address: any) {
    return ApiClient.post(`${this.basePath}/tax/validate-address`, address);
  }

  async getTaxCodes(provider?: string) {
    return ApiClient.get(`${this.basePath}/tax/codes`, {
      params: { provider }
    });
  }

  // Webhook Management
  async getWebhookLogs(params?: {
    provider?: string;
    startDate?: string;
    endDate?: string;
  }) {
    return ApiClient.get(`${this.basePath}/webhooks/logs`, { params });
  }

  // Analytics
  async getUsageAnalytics(params?: {
    startDate?: string;
    endDate?: string;
  }) {
    return ApiClient.get(`${this.basePath}/analytics/usage`, { params });
  }
}

export const integrationService = new IntegrationService();
export default integrationService;
