// Contract Services Barrel Export
export { default as ContractService } from './contract.service';
export { default as ContractLegacyService } from './contract-legacy.service';
export * from './contract.service';

// Re-export the default service
import ContractServiceDefault from './contract.service';
export default ContractServiceDefault;