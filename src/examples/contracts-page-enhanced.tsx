// =================== EXAMPLE: Updated Contract Page with New API Service ===================

"use client"
import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Plus, Download, BarChart3 } from 'lucide-react';
import ContractsHeader from '@/components/dashboard/contracts/contracts-header';
import ContractsTable from '@/components/dashboard/contracts/contracts-table';
import ContractFormDialog from '@/components/dashboard/contracts/contract-form-dialog-complete';
import SignatureWorkflowDialog from '@/components/dashboard/contracts/signature-workflow-dialog';
import SignatureAuditTrail from '@/components/dashboard/contracts/signature-audit-trail';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

// Import the new hooks and API services
import { 
  useContracts, 
  useContractStats, 
  useContractSigning,
  useAnalyticsTracker
} from '@/lib/hooks';
import { analyticsTracker } from '@/lib/utils';
import { ContractAPIService } from '@/lib/services';

const ContractsManagementNew: React.FC = () => {
  // =================== NEW HOOKS USAGE ===================
  
  // Use the new contracts hook with auto-loading and filtering
  const {
    contracts,
    loading,
    error,
    pagination,
    filters,
    
    // Contract CRUD operations
    createContractWithContact,
    updateContract,
    deleteContract,
    generatePDF,
    signContract,
    signContractPublic,
    searchContracts,
    exportContracts,
    
    // Filter and pagination
    updateFilters,
    resetFilters,
    refresh
  } = useContracts({
    autoLoad: true,
    initialFilters: {
      page: 1,
      limit: 10,
      status: 'all'
    }
  });

  // Use contract stats hook with auto-refresh
  const {
    stats,
    loading: statsLoading,
    getAnalyticsDashboard,
    refresh: refreshStats
  } = useContractStats({
    autoLoad: true,
    refreshInterval: 30000 // Refresh every 30 seconds
  });

  // Use contract signing hook
  const {
    loading: signingLoading,
    initiateContractSigning,
    getContractForSigning,
    collectEvidence,
    submitSignature,
    generateEvidencePackage
  } = useContractSigning();

  // Use analytics tracker for user interactions
  const {
    trackEvent,
    trackConversion,
    trackInteraction
  } = useAnalyticsTracker({
    autoTrackPageViews: true
  });

  // =================== LOCAL STATE ===================
  
  const [formOpen, setFormOpen] = useState(false);
  const [editingContract, setEditingContract] = useState<any | null>(null);
  const [signatureDialogOpen, setSignatureDialogOpen] = useState(false);
  const [auditTrailOpen, setAuditTrailOpen] = useState(false);
  const [selectedContractForSignature, setSelectedContractForSignature] = useState<any | null>(null);
  const [selectedPartyType, setSelectedPartyType] = useState<'primary' | 'secondary' | 'additional'>('primary');
  const [selectedPartyIndex, setSelectedPartyIndex] = useState<number>(0);

  // Filter state (now managed by the hook but can be overridden)
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedTemplate, setSelectedTemplate] = useState('all');

  // =================== ANALYTICS TRACKING ===================
  
  useEffect(() => {
    // Initialize analytics tracker with user info
    analyticsTracker.init();
    
    // Track page view with additional context
    trackEvent('contracts_page_view', {
      eventCategory: 'navigation',
      eventAction: 'page_view',
      properties: {
        page_section: 'contracts_management',
        total_contracts: contracts.length
      }
    });
  }, []);

  // =================== EVENT HANDLERS ===================

  const handleCreateContract = async (data: any) => {
    try {
      // Track conversion attempt
      await trackEvent('contract_creation_attempt', {
        eventCategory: 'conversion',
        eventAction: 'create_attempt',
        properties: { contract_type: data.productType }
      });

      const response = await createContractWithContact(data);
      
      // Track successful conversion
      await trackConversion('contract_created', 1, {
        contract_type: data.productType,
        creation_method: 'dashboard'
      });

      setFormOpen(false);
    } catch (error: any) {
      // Track error
      await trackEvent('contract_creation_error', {
        eventCategory: 'error',
        eventAction: 'create_error',
        properties: { error_message: error.message }
      });
      throw error;
    }
  };

  const handleUpdateContract = async (contractId: string, data: any) => {
    try {
      await trackInteraction('contract_update', 'update', { contract_id: contractId });
      
      await updateContract(contractId, data);
      setFormOpen(false);
      setEditingContract(null);
    } catch (error: any) {
      await trackEvent('contract_update_error', {
        eventCategory: 'error',
        eventAction: 'update_error',
        properties: { contract_id: contractId, error_message: error.message }
      });
      throw error;
    }
  };

  const handleEdit = (contract: any) => {
    trackInteraction('contract_edit_button', 'click', { contract_id: contract._id });
    setEditingContract(contract);
    setFormOpen(true);
  };

  const handleView = (contract: any) => {
    trackInteraction('contract_view_button', 'click', { contract_id: contract._id });
    // Implement view functionality
    console.log('View contract:', contract);
    toast.info('View functionality coming soon');
  };

  const handleDownload = async (contract: any) => {
    try {
      await trackInteraction('contract_download', 'click', { contract_id: contract._id });
      
      // Use the new API service method
      const response = await ContractAPIService.getContractPDFUrl(contract._id);
      
      if (response.success && response.data?.url) {
        // Download the file
        const link = document.createElement('a');
        link.href = response.data.url;
        link.download = `${contract.title}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        // Track successful download
        await trackEvent('contract_downloaded', {
          eventCategory: 'engagement',
          eventAction: 'download',
          properties: { contract_id: contract._id }
        });

        toast.success('Contract downloaded successfully');
      } else {
        // Generate PDF if it doesn't exist
        await generatePDF(contract._id);
      }
    } catch (error: any) {
      console.error('Download contract error:', error);
      toast.error(error.message || 'Failed to download contract');
    }
  };

  const handleSendForSignature = async (contract: any) => {
    try {
      await trackInteraction('send_for_signature', 'click', { contract_id: contract._id });
      
      // Use the new enhanced signing workflow
      const response = await initiateContractSigning({
        templateId: contract.template.templateId,
        recipients: [
          {
            name: contract.parties.primary.name,
            email: contract.parties.primary.email || '',
            role: 'signer'
          },
          {
            name: contract.parties.secondary.name,
            email: contract.parties.secondary.email || '',
            role: 'signer'
          }
        ]
      });

      await trackConversion('contract_sent_for_signature', 1, { contract_id: contract._id });
      toast.success('Contract sent for signature');
    } catch (error: any) {
      console.error('Send for signature error:', error);
      toast.error(error.message || 'Failed to send for signature');
    }
  };

  const handleDelete = async (contract: any) => {
    if (!confirm(`Are you sure you want to delete "${contract.title}"? This action cannot be undone.`)) {
      return;
    }

    try {
      await trackInteraction('contract_delete', 'click', { contract_id: contract._id });
      await deleteContract(contract._id);
      
      await trackEvent('contract_deleted', {
        eventCategory: 'action',
        eventAction: 'delete',
        properties: { contract_id: contract._id }
      });
    } catch (error: any) {
      console.error('Delete contract error:', error);
      toast.error(error.message || 'Failed to delete contract');
    }
  };

  const handleExport = async () => {
    try {
      await trackInteraction('export_contracts', 'click', {});
      
      // Use the new export method
      const response = await exportContracts({
        format: 'excel',
        startDate: '2024-01-01',
        endDate: new Date().toISOString().split('T')[0]
      });

      await trackEvent('contracts_exported', {
        eventCategory: 'action',
        eventAction: 'export',
        properties: { format: 'excel', count: contracts.length }
      });
    } catch (error: any) {
      console.error('Export error:', error);
      toast.error('Failed to export contracts');
    }
  };

  const handleSearch = async (searchQuery: string) => {
    if (searchQuery.trim()) {
      await trackInteraction('contract_search', 'search', { query: searchQuery });
      await searchContracts(searchQuery);
    } else {
      refresh();
    }
  };

  // =================== FILTER HANDLERS ===================

  const handleStatusChange = (status: string) => {
    setSelectedStatus(status);
    updateFilters({ 
      status: status === 'all' ? undefined : status,
      page: 1 // Reset to first page
    });
    
    trackInteraction('filter_status', 'change', { status });
  };

  const handleTemplateChange = (template: string) => {
    setSelectedTemplate(template);
    updateFilters({ 
      page: 1 // Reset to first page
    });
    
    trackInteraction('filter_template', 'change', { template });
  };

  // =================== SIGNATURE HANDLERS ===================

  const handleSignContract = (contract: any, partyType: 'primary' | 'secondary' | 'additional', partyIndex: number = 0) => {
    trackInteraction('sign_contract', 'click', { 
      contract_id: contract._id, 
      party_type: partyType 
    });
    
    setSelectedContractForSignature(contract);
    setSelectedPartyType(partyType);
    setSelectedPartyIndex(partyIndex);
    setSignatureDialogOpen(true);
  };

  const handleViewAuditTrail = async (contract: any) => {
    await trackInteraction('view_audit_trail', 'click', { contract_id: contract._id });
    setSelectedContractForSignature(contract);
    setAuditTrailOpen(true);
  };

  const handleSignatureComplete = async () => {
    refresh(); // Refresh the contracts list
    setSignatureDialogOpen(false);
    setSelectedContractForSignature(null);
    
    await trackConversion('contract_signed', 1, {
      contract_id: selectedContractForSignature?._id,
      party_type: selectedPartyType
    });
    
    toast.success('Contract signed successfully!');
  };

  // =================== ANALYTICS DASHBOARD ===================

  const handleViewAnalytics = async () => {
    try {
      await trackInteraction('view_analytics', 'click', {});
      
      const analyticsData = await getAnalyticsDashboard();
      if (analyticsData) {
        console.log('Analytics Data:', analyticsData);
        // You could open a modal or navigate to an analytics page here
        toast.success('Analytics data loaded');
      }
    } catch (error: any) {
      console.error('Analytics error:', error);
      toast.error('Failed to load analytics');
    }
  };

  // =================== ERROR HANDLING ===================

  useEffect(() => {
    if (error) {
      trackEvent('contracts_page_error', {
        eventCategory: 'error',
        eventAction: 'page_error',
        properties: { error_message: error }
      });
    }
  }, [error]);

  // =================== RENDER ===================

  return (
    <div className="space-y-6">
      {/* Enhanced Header with Analytics */}
      <div className="flex justify-between items-center">
        <ContractsHeader
          searchTerm={searchTerm}
          onSearchChange={(term) => {
            setSearchTerm(term);
            handleSearch(term);
          }}
          selectedStatus={selectedStatus}
          onStatusChange={handleStatusChange}
          selectedTemplate={selectedTemplate}
          onTemplateChange={handleTemplateChange}
          selectedLocale="all"
          onLocaleChange={() => {}}
          onCreateClick={() => {
            trackInteraction('create_contract_button', 'click', {});
            setFormOpen(true);
          }}
          onExportClick={handleExport}
          totalCount={pagination.total}
        />
        
        {/* Analytics Button */}
        <Button 
          onClick={handleViewAnalytics}
          variant="outline"
          className="ml-4"
        >
          <BarChart3 className="h-4 w-4 mr-2" />
          Analytics
        </Button>
      </div>

      {/* Stats Cards (if available) */}
      {stats && !statsLoading && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-500">Total Contracts</h3>
            <p className="text-2xl font-bold">{stats.totalContracts}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-500">Signed Contracts</h3>
            <p className="text-2xl font-bold text-green-600">{stats.signedContracts}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-500">Pending Contracts</h3>
            <p className="text-2xl font-bold text-yellow-600">{stats.pendingContracts}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-500">Completion Rate</h3>
            <p className="text-2xl font-bold text-blue-600">
              {stats.totalContracts > 0 ? Math.round((stats.signedContracts / stats.totalContracts) * 100) : 0}%
            </p>
          </div>
        </div>
      )}

      {/* Contracts Table */}
      <ContractsTable
        contracts={contracts}
        loading={loading}
        onView={handleView}
        onEdit={handleEdit}
        onDownload={handleDownload}
        onSendForSignature={handleSendForSignature}
        onCancel={(contract) => console.log('Cancel:', contract)}
        onDelete={handleDelete}
        onSignContract={handleSignContract}
        onViewAuditTrail={handleViewAuditTrail}
        onSendReminder={(contract, partyType, partyIndex) => {
          trackInteraction('send_reminder', 'click', { 
            contract_id: contract._id, 
            party_type: partyType 
          });
          console.log('Send reminder:', contract, partyType, partyIndex);
        }}
      />

      {/* Pagination Controls */}
      {pagination.pages > 1 && (
        <div className="flex justify-center space-x-2">
          <Button
            variant="outline"
            disabled={pagination.page <= 1}
            onClick={() => updateFilters({ page: pagination.page - 1 })}
          >
            Previous
          </Button>
          <span className="flex items-center px-4">
            Page {pagination.page} of {pagination.pages}
          </span>
          <Button
            variant="outline"
            disabled={pagination.page >= pagination.pages}
            onClick={() => updateFilters({ page: pagination.page + 1 })}
          >
            Next
          </Button>
        </div>
      )}

      {/* Existing Dialogs... */}
      <ContractFormDialog
        open={formOpen}
        onOpenChange={() => setFormOpen(false)}
        contract={editingContract}
        templates={[]} // You would get these from useContractTemplates hook
        onSubmit={editingContract ? 
          (data) => handleUpdateContract(editingContract._id, data) :
          handleCreateContract
        }
        loading={loading || signingLoading}
      />

      {/* Enhanced Signature Dialogs with Evidence Collection */}
      {selectedContractForSignature && (
        <>
          <SignatureWorkflowDialog
            open={signatureDialogOpen}
            onOpenChange={() => setSignatureDialogOpen(false)}
            contract={selectedContractForSignature}
            partyType={selectedPartyType}
            partyIndex={selectedPartyIndex}
            onSignatureSubmit={async (signatureData) => {
              try {
                // Collect evidence before signature
                await collectEvidence(selectedContractForSignature._id, {
                  type: 'interaction',
                  data: {
                    action: 'signature_start',
                    timestamp: new Date().toISOString(),
                    userAgent: navigator.userAgent,
                    screenResolution: `${window.screen.width}x${window.screen.height}`
                  },
                  timestamp: new Date().toISOString()
                });

                // Submit signature using new API
                const response = await submitSignature(selectedContractForSignature._id, {
                  signatureImage: typeof signatureData.signatureImage === 'string' ? signatureData.signatureImage : '',
                  agreed: true,
                  ipAddress: 'auto-detect', // This would be detected on backend
                  userAgent: navigator.userAgent,
                  timestamp: new Date().toISOString()
                });

                if (response.success) {
                  await handleSignatureComplete();
                } else {
                  throw new Error(response.error || 'Failed to submit signature');
                }
              } catch (error: any) {
                console.error('Signature submission error:', error);
                toast.error(error.message || 'Failed to submit signature');
                throw error;
              }
            }}
            loading={signingLoading}
          />

          <Dialog open={auditTrailOpen} onOpenChange={() => setAuditTrailOpen(false)}>
            <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Signature Audit Trail - {selectedContractForSignature.title}</DialogTitle>
              </DialogHeader>
              <SignatureAuditTrail contract={selectedContractForSignature} />
            </DialogContent>
          </Dialog>
        </>
      )}
    </div>
  );
};

export default ContractsManagementNew;