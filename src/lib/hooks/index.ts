// Hooks Barrel Export - Existing hooks
export * from './use-admin-users';
export * from './use-permissions';
export * from './use-protected-route';
export * from './use-roles';
export * from './use-simple-auth';
export * from './use-toast';

// New Contract hooks
export {
  useContracts,
  useContract,
  useContractTemplates,
  useContractStats,
  useContractSigning,
  useContractAdmin
} from './useContracts';

// New Analytics hooks
export {
  useAnalytics,
  useRealTimeAnalytics,
  useAnalyticsTracker,
  useBatchAnalytics
} from './useAnalytics';

// Transaction hooks
export {
  useTransactions,
  useTransactionStats
} from './useTransactions';