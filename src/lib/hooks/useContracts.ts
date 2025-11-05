import { useState, useEffect, useCallback, useMemo } from 'react';
import { toast } from 'sonner';
import ContractAPIService from '../services/contracts/contract-api.service';
import type {
  ApiResponse,
  ContractContact,
  ContractContactExtended,
  ContractSigningData,
  ContractPaymentUpdate,
  ContractExportParams,
  ContractFilterParams,
  ContractTemplateCreate,
  ContractTemplateUpdate,
  ContractTemplateFilter,
  ContractStats,
  EnhancedContractInitiate,
  EvidenceData,
  SignatureSubmission
} from '../services/contracts/contract-api.service';

// =================== HOOK TYPES ===================
interface UseContractsOptions {
  autoLoad?: boolean;
  initialFilters?: ContractFilterParams;
}

interface UseContractOptions {
  autoLoad?: boolean;
}

interface UseContractTemplatesOptions {
  autoLoad?: boolean;
  initialFilters?: ContractTemplateFilter;
}

interface UseContractStatsOptions {
  autoLoad?: boolean;
  refreshInterval?: number;
}

// =================== useContracts Hook ===================
export function useContracts(options: UseContractsOptions = {}) {
  const { autoLoad = true, initialFilters = {} } = options;

  const [contracts, setContracts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0
  });
  const [filters, setFilters] = useState<ContractFilterParams>(initialFilters);

  // Fetch contracts
  const fetchContracts = useCallback(async (params?: ContractFilterParams) => {
    try {
      setLoading(true);
      setError(null);

      const queryParams = { ...filters, ...params };
      const response = await ContractAPIService.getAllContracts(queryParams);

      if (response.success) {
        setContracts(response.data || []);
        if (response.pagination) {
          setPagination(response.pagination);
        }
      } else {
        throw new Error(response.error || 'Failed to fetch contracts');
      }
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to fetch contracts';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  // Create contract with contact (Public)
  const createContractWithContact = useCallback(async (contractData: ContractContactExtended) => {
    try {
      const response = await ContractAPIService.createContractWithContact(contractData);

      if (response.success) {
        toast.success('Contract created successfully');
        fetchContracts(); // Refresh the list
        return response;
      } else {
        throw new Error(response.error || 'Failed to create contract');
      }
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to create contract';
      toast.error(errorMessage);
      throw error;
    }
  }, [fetchContracts]);

  // Get contracts by contact (Public)
  const getContractsByContact = useCallback(async (contactData: ContractContact) => {
    try {
      const response = await ContractAPIService.getContractsByContact(contactData);
      return response;
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to get contracts by contact';
      toast.error(errorMessage);
      throw error;
    }
  }, []);

  // Get contracts by email (Public)
  const getContractsByEmail = useCallback(async (email: string) => {
    try {
      const response = await ContractAPIService.getContractsByEmailGet(email);
      return response;
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to get contracts by email';
      toast.error(errorMessage);
      throw error;
    }
  }, []);

  // Update contract
  const updateContract = useCallback(async (contractId: string, updateData: any) => {
    try {
      const response = await ContractAPIService.updateContract(contractId, updateData);

      if (response.success) {
        toast.success('Contract updated successfully');
        fetchContracts(); // Refresh the list
        return response;
      } else {
        throw new Error(response.error || 'Failed to update contract');
      }
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to update contract';
      toast.error(errorMessage);
      throw error;
    }
  }, [fetchContracts]);

  // Delete contract
  const deleteContract = useCallback(async (contractId: string) => {
    try {
      const response = await ContractAPIService.deleteContract(contractId);

      if (response.success) {
        toast.success('Contract deleted successfully');
        fetchContracts(); // Refresh the list
        return response;
      } else {
        throw new Error(response.error || 'Failed to delete contract');
      }
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to delete contract';
      toast.error(errorMessage);
      throw error;
    }
  }, [fetchContracts]);

  // Generate PDF
  const generatePDF = useCallback(async (contractId: string, templateType?: string) => {
    try {
      const response = await ContractAPIService.generateContractPDF(contractId, templateType);

      if (response.success) {
        toast.success('PDF generated successfully');
        return response;
      } else {
        throw new Error(response.error || 'Failed to generate PDF');
      }
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to generate PDF';
      toast.error(errorMessage);
      throw error;
    }
  }, []);

  // Sign contract (Protected)
  const signContract = useCallback(async (signingData: ContractSigningData) => {
    try {
      const response = await ContractAPIService.storeSignedContract(signingData);

      if (response.success) {
        toast.success('Contract signed successfully');
        fetchContracts(); // Refresh the list
        return response;
      } else {
        throw new Error(response.error || 'Failed to sign contract');
      }
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to sign contract';
      toast.error(errorMessage);
      throw error;
    }
  }, [fetchContracts]);

  // Sign contract (Public)
  const signContractPublic = useCallback(async (signingData: ContractSigningData) => {
    try {
      const response = await ContractAPIService.signContractPublic(signingData);

      if (response.success) {
        toast.success('Contract signed successfully');
        return response;
      } else {
        throw new Error(response.error || 'Failed to sign contract');
      }
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to sign contract';
      toast.error(errorMessage);
      throw error;
    }
  }, []);

  // Update payment status
  const updatePaymentStatus = useCallback(async (contractId: string, paymentData: ContractPaymentUpdate) => {
    try {
      const response = await ContractAPIService.updatePaymentStatus(contractId, paymentData);

      if (response.success) {
        toast.success('Payment status updated successfully');
        fetchContracts(); // Refresh the list
        return response;
      } else {
        throw new Error(response.error || 'Failed to update payment status');
      }
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to update payment status';
      toast.error(errorMessage);
      throw error;
    }
  }, [fetchContracts]);

  // Export contracts
  const exportContracts = useCallback(async (params?: ContractExportParams) => {
    try {
      const response = await ContractAPIService.exportContracts(params);

      if (response.success) {
        toast.success('Contracts exported successfully');
        return response;
      } else {
        throw new Error(response.error || 'Failed to export contracts');
      }
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to export contracts';
      toast.error(errorMessage);
      throw error;
    }
  }, []);

  // Search contracts
  const searchContracts = useCallback(async (searchQuery: string, searchFilters?: any) => {
    try {
      const response = await ContractAPIService.searchContracts(searchQuery, searchFilters);

      if (response.success) {
        setContracts(response.data || []);
        return response;
      } else {
        throw new Error(response.error || 'Failed to search contracts');
      }
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to search contracts';
      setError(errorMessage);
      toast.error(errorMessage);
      throw error;
    }
  }, []);

  // Update filters
  const updateFilters = useCallback((newFilters: Partial<ContractFilterParams>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  }, []);

  // Reset filters
  const resetFilters = useCallback(() => {
    setFilters({});
  }, []);

  // Refresh contracts
  const refresh = useCallback(() => {
    fetchContracts();
  }, [fetchContracts]);

  // Auto-load on mount and filter changes
  useEffect(() => {
    if (autoLoad) {
      fetchContracts();
    }
  }, [autoLoad, fetchContracts, filters]);

  return {
    contracts,
    loading,
    error,
    pagination,
    filters,
    
    // Actions
    fetchContracts,
    createContractWithContact,
    getContractsByContact,
    getContractsByEmail,
    updateContract,
    deleteContract,
    generatePDF,
    signContract,
    signContractPublic,
    updatePaymentStatus,
    exportContracts,
    searchContracts,
    updateFilters,
    resetFilters,
    refresh
  };
}

// =================== useContract Hook (Single Contract) ===================
export function useContract(contractId?: string, options: UseContractOptions = {}) {
  const { autoLoad = true } = options;

  const [contract, setContract] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch single contract
  const fetchContract = useCallback(async (id?: string) => {
    const targetId = id || contractId;
    if (!targetId) return;

    try {
      setLoading(true);
      setError(null);

      const response = await ContractAPIService.getContractById(targetId);

      if (response.success) {
        setContract(response.data || null);
      } else {
        throw new Error(response.error || 'Failed to fetch contract');
      }
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to fetch contract';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [contractId]);

  // Get guest contract (Public)
  const fetchGuestContract = useCallback(async (id?: string) => {
    const targetId = id || contractId;
    if (!targetId) return;

    try {
      setLoading(true);
      setError(null);

      const response = await ContractAPIService.getGuestContract(targetId);

      if (response.success) {
        setContract(response.data || null);
      } else {
        throw new Error(response.error || 'Failed to fetch guest contract');
      }
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to fetch guest contract';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [contractId]);

  // Get PDF URL
  const getPDFUrl = useCallback(async (id?: string) => {
    const targetId = id || contractId;
    if (!targetId) return null;

    try {
      const response = await ContractAPIService.getContractPDFUrl(targetId);

      if (response.success) {
        return response.data?.url || null;
      } else {
        throw new Error(response.error || 'Failed to get PDF URL');
      }
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to get PDF URL';
      toast.error(errorMessage);
      return null;
    }
  }, [contractId]);

  // Get audit trail
  const getAuditTrail = useCallback(async (id?: string) => {
    const targetId = id || contractId;
    if (!targetId) return null;

    try {
      const response = await ContractAPIService.getAuditTrail(targetId);

      if (response.success) {
        return response.data || null;
      } else {
        throw new Error(response.error || 'Failed to get audit trail');
      }
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to get audit trail';
      toast.error(errorMessage);
      return null;
    }
  }, [contractId]);

  // Refresh contract
  const refresh = useCallback(() => {
    if (contractId) {
      fetchContract(contractId);
    }
  }, [contractId, fetchContract]);

  // Auto-load on mount
  useEffect(() => {
    if (autoLoad && contractId) {
      fetchContract(contractId);
    }
  }, [autoLoad, contractId, fetchContract]);

  return {
    contract,
    loading,
    error,

    // Actions
    fetchContract,
    fetchGuestContract,
    getPDFUrl,
    getAuditTrail,
    refresh
  };
}

// =================== useContractTemplates Hook ===================
export function useContractTemplates(options: UseContractTemplatesOptions = {}) {
  const { autoLoad = true, initialFilters = {} } = options;

  const [templates, setTemplates] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<ContractTemplateFilter>(initialFilters);

  // Fetch templates
  const fetchTemplates = useCallback(async (params?: ContractTemplateFilter) => {
    try {
      setLoading(true);
      setError(null);

      const queryParams = { ...filters, ...params };
      const response = await ContractAPIService.getTemplates(queryParams);

      if (response.success) {
        setTemplates(response.data || []);
      } else {
        throw new Error(response.error || 'Failed to fetch templates');
      }
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to fetch templates';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  // Create template
  const createTemplate = useCallback(async (templateData: ContractTemplateCreate) => {
    try {
      const response = await ContractAPIService.createTemplate(templateData);

      if (response.success) {
        toast.success('Template created successfully');
        fetchTemplates(); // Refresh the list
        return response;
      } else {
        throw new Error(response.error || 'Failed to create template');
      }
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to create template';
      toast.error(errorMessage);
      throw error;
    }
  }, [fetchTemplates]);

  // Update template
  const updateTemplate = useCallback(async (templateId: string, templateData: ContractTemplateUpdate) => {
    try {
      const response = await ContractAPIService.updateTemplate(templateId, templateData);

      if (response.success) {
        toast.success('Template updated successfully');
        fetchTemplates(); // Refresh the list
        return response;
      } else {
        throw new Error(response.error || 'Failed to update template');
      }
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to update template';
      toast.error(errorMessage);
      throw error;
    }
  }, [fetchTemplates]);

  // Delete template
  const deleteTemplate = useCallback(async (templateId: string) => {
    try {
      const response = await ContractAPIService.deleteTemplate(templateId);

      if (response.success) {
        toast.success('Template deleted successfully');
        fetchTemplates(); // Refresh the list
        return response;
      } else {
        throw new Error(response.error || 'Failed to delete template');
      }
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to delete template';
      toast.error(errorMessage);
      throw error;
    }
  }, [fetchTemplates]);

  // Approve template
  const approveTemplate = useCallback(async (templateId: string) => {
    try {
      const response = await ContractAPIService.approveTemplate(templateId);

      if (response.success) {
        toast.success('Template approved successfully');
        fetchTemplates(); // Refresh the list
        return response;
      } else {
        throw new Error(response.error || 'Failed to approve template');
      }
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to approve template';
      toast.error(errorMessage);
      throw error;
    }
  }, [fetchTemplates]);

  // Publish template
  const publishTemplate = useCallback(async (templateId: string) => {
    try {
      const response = await ContractAPIService.publishTemplate(templateId);

      if (response.success) {
        toast.success('Template published successfully');
        fetchTemplates(); // Refresh the list
        return response;
      } else {
        throw new Error(response.error || 'Failed to publish template');
      }
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to publish template';
      toast.error(errorMessage);
      throw error;
    }
  }, [fetchTemplates]);

  // Clone template
  const cloneTemplate = useCallback(async (templateId: string) => {
    try {
      const response = await ContractAPIService.cloneTemplate(templateId);

      if (response.success) {
        toast.success('Template cloned successfully');
        fetchTemplates(); // Refresh the list
        return response;
      } else {
        throw new Error(response.error || 'Failed to clone template');
      }
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to clone template';
      toast.error(errorMessage);
      throw error;
    }
  }, [fetchTemplates]);

  // Update filters
  const updateFilters = useCallback((newFilters: Partial<ContractTemplateFilter>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  }, []);

  // Reset filters
  const resetFilters = useCallback(() => {
    setFilters({});
  }, []);

  // Refresh templates
  const refresh = useCallback(() => {
    fetchTemplates();
  }, [fetchTemplates]);

  // Auto-load on mount and filter changes
  useEffect(() => {
    if (autoLoad) {
      fetchTemplates();
    }
  }, [autoLoad, fetchTemplates, filters]);

  return {
    templates,
    loading,
    error,
    filters,

    // Actions
    fetchTemplates,
    createTemplate,
    updateTemplate,
    deleteTemplate,
    approveTemplate,
    publishTemplate,
    cloneTemplate,
    updateFilters,
    resetFilters,
    refresh
  };
}

// =================== useContractStats Hook ===================
export function useContractStats(options: UseContractStatsOptions = {}) {
  const { autoLoad = true, refreshInterval } = options;

  const [stats, setStats] = useState<ContractStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch stats
  const fetchStats = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await ContractAPIService.getContractStats();

      if (response.success) {
        setStats(response.data || null);
      } else {
        throw new Error(response.error || 'Failed to fetch contract stats');
      }
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to fetch contract stats';
      setError(errorMessage);
      // Don't show toast for stats errors as they might be frequent
      console.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  // Get analytics dashboard
  const getAnalyticsDashboard = useCallback(async () => {
    try {
      const response = await ContractAPIService.getAnalyticsDashboard();

      if (response.success) {
        return response.data || null;
      } else {
        throw new Error(response.error || 'Failed to get analytics dashboard');
      }
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to get analytics dashboard';
      toast.error(errorMessage);
      return null;
    }
  }, []);

  // Refresh stats
  const refresh = useCallback(() => {
    fetchStats();
  }, [fetchStats]);

  // Auto-load on mount
  useEffect(() => {
    if (autoLoad) {
      fetchStats();
    }
  }, [autoLoad, fetchStats]);

  // Set up refresh interval
  useEffect(() => {
    if (refreshInterval && refreshInterval > 0) {
      const interval = setInterval(fetchStats, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [refreshInterval, fetchStats]);

  return {
    stats,
    loading,
    error,

    // Actions
    fetchStats,
    getAnalyticsDashboard,
    refresh
  };
}

// =================== useContractSigning Hook ===================
export function useContractSigning() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initiate contract signing
  const initiateContractSigning = useCallback(async (initiateData: EnhancedContractInitiate) => {
    try {
      setLoading(true);
      setError(null);

      const response = await ContractAPIService.initiateContractSigning(initiateData);

      if (response.success) {
        toast.success('Contract signing initiated successfully');
        return response;
      } else {
        throw new Error(response.error || 'Failed to initiate contract signing');
      }
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to initiate contract signing';
      setError(errorMessage);
      toast.error(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  // Get contract for signing (Public)
  const getContractForSigning = useCallback(async (contractId: string) => {
    try {
      const response = await ContractAPIService.getContractForSigning(contractId);

      if (response.success) {
        return response.data;
      } else {
        throw new Error(response.error || 'Failed to get contract for signing');
      }
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to get contract for signing';
      toast.error(errorMessage);
      throw error;
    }
  }, []);

  // Collect evidence
  const collectEvidence = useCallback(async (contractId: string, evidenceData: EvidenceData) => {
    try {
      const response = await ContractAPIService.collectEvidence(contractId, evidenceData);

      if (response.success) {
        return response;
      } else {
        throw new Error(response.error || 'Failed to collect evidence');
      }
    } catch (error: any) {
      // Don't show toast for evidence collection as it might be frequent
      console.error('Failed to collect evidence:', error.message);
      throw error;
    }
  }, []);

  // Submit signature
  const submitSignature = useCallback(async (contractId: string, signatureData: SignatureSubmission) => {
    try {
      setLoading(true);
      setError(null);

      const response = await ContractAPIService.submitSignature(contractId, signatureData);

      if (response.success) {
        toast.success('Signature submitted successfully');
        return response;
      } else {
        throw new Error(response.error || 'Failed to submit signature');
      }
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to submit signature';
      setError(errorMessage);
      toast.error(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  // Generate evidence package
  const generateEvidencePackage = useCallback(async (contractId: string) => {
    try {
      const response = await ContractAPIService.generateEvidencePackage(contractId);

      if (response.success) {
        toast.success('Evidence package generated successfully');
        return response;
      } else {
        throw new Error(response.error || 'Failed to generate evidence package');
      }
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to generate evidence package';
      toast.error(errorMessage);
      throw error;
    }
  }, []);

  // Verify evidence integrity
  const verifyEvidenceIntegrity = useCallback(async (contractId: string, hash: string) => {
    try {
      const response = await ContractAPIService.verifyEvidenceIntegrity(contractId, hash);

      if (response.success) {
        return response.data;
      } else {
        throw new Error(response.error || 'Failed to verify evidence integrity');
      }
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to verify evidence integrity';
      toast.error(errorMessage);
      throw error;
    }
  }, []);

  return {
    loading,
    error,

    // Actions
    initiateContractSigning,
    getContractForSigning,
    collectEvidence,
    submitSignature,
    generateEvidencePackage,
    verifyEvidenceIntegrity
  };
}

// =================== useContractAdmin Hook ===================
export function useContractAdmin() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Void contract (Admin only)
  const voidContract = useCallback(async (contractId: string, reason: string) => {
    try {
      setLoading(true);
      setError(null);

      const response = await ContractAPIService.voidContract(contractId, reason);

      if (response.success) {
        toast.success('Contract voided successfully');
        return response;
      } else {
        throw new Error(response.error || 'Failed to void contract');
      }
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to void contract';
      setError(errorMessage);
      toast.error(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  // Resend contract (Admin only)
  const resendContract = useCallback(async (contractId: string) => {
    try {
      setLoading(true);
      setError(null);

      const response = await ContractAPIService.resendContract(contractId);

      if (response.success) {
        toast.success('Contract resent successfully');
        return response;
      } else {
        throw new Error(response.error || 'Failed to resend contract');
      }
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to resend contract';
      setError(errorMessage);
      toast.error(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    error,

    // Actions
    voidContract,
    resendContract
  };
}