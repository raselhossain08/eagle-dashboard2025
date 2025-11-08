// Common types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

// Services Barrel Export - selective to avoid conflicts
export { AuthService } from './auth';
export { ContractService } from './contracts';
export { SubscriptionService } from './subscriptions';
export { PaymentMethodService } from './payments';
export { PlanService, DiscountService } from './plans';
export { WebhookService } from './integrations';
export { ApiService, ApiClient } from './shared';
export { UserService } from './users';

// Billing and Payment Services
export { billingService } from './billing.service';
export { paypalService } from './paypal.service';
export { taxService } from './tax.service';

// New API service layer exports
export { default as ContractAPIService } from './contracts/contract-api.service';

// New analytics service export
export { analyticsService as dashboardAnalyticsService } from './analytics.service';

// Legacy service exports (keeping for backward compatibility)
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

// Export new API service types
export type {
  ContractContact,
  ContractContactExtended,
  ContractSigningData,
  ContractPaymentUpdate,
  ContractExportParams,
  ContractFilterParams,
  ContractTemplateCreate,
  ContractTemplateUpdate,
  ContractTemplateFilter,
  EnhancedContractInitiate,
  EvidenceData,
  SignatureSubmission as APISignatureSubmission
} from './contracts/contract-api.service';

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