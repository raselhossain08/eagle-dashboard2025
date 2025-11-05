// Common types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

// Services Barrel Export - selective to avoid conflicts
export { AuthService } from './auth';
export { AnalyticsService } from './analytics';
export { ContractService } from './contracts';
export { SubscriptionService } from './subscriptions';
export { PaymentMethodService } from './payments';
export { PlanService, DiscountService } from './plans';
export { WebhookService } from './integrations';
export { ApiService, ApiClient } from './shared';

// New service layer exports - using correct paths and naming
export { getAnalytics as analyticsService } from './analytics';
export { default as contractService } from './contracts';

// Export service types from the correct locations
export type {
  ContractTemplate,
  Contract,
  CreateContractTemplateRequest,
  CreateContractRequest,
  UpdateContractTemplateRequest,
  UpdateContractRequest,
  GetContractTemplatesParams,
  GetContractsParams,
  SignatureRequirement,
  SignatureMetadata,
  SignatureSubmission,
  SignatureStatus,
  ContractStats,
  ContractSignature
} from './contracts/contract.service';

// Admin services exported separately to avoid conflicts
import { 
  AuditLogService, 
  SystemSettingsService, 
  InvoiceService, 
  SubscriberProfileService 
} from './admin';

export {
  AuditLogService as AdminAuditLogService,
  SystemSettingsService as AdminSystemSettingsService,
  InvoiceService as AdminInvoiceService,
  SubscriberProfileService as AdminSubscriberProfileService
};