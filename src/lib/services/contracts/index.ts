// Contract Services Barrel Export
export { default as ContractService } from './contract.service';
export { default as ContractLegacyService } from './contract-legacy.service';
export { default as ContractAPIService } from './contract-api.service';

// Export types and interfaces - avoiding conflicts
export type {
  ApiResponse,
  ContractStats,
  SignatureSubmission,
  ContractFilterParams,
  ContractExportParams,
  ContractTemplateCreate,
  ContractTemplateUpdate,
  ContractTemplateFilter,
  ContractContact,
  ContractContactExtended,
  PublicContractData,
  ContractSigningData,
  ContractPaymentUpdate,
  EnhancedContractInitiate,
  EnhancedSignatureSession,
  EvidenceData
} from './contract-api.service';

// Re-export the default service (keeping for backward compatibility)
import ContractServiceDefault from './contract.service';
export default ContractServiceDefault;