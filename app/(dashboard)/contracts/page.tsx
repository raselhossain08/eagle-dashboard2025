
"use client"
import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Plus, Download } from 'lucide-react';
import ContractsHeader from '@/components/dashboard/contracts/contracts-header';
import ContractsTable from '@/components/dashboard/contracts/contracts-table';
import ContractFormDialog from '@/components/dashboard/contracts/contract-form-dialog-complete';
import SignatureWorkflowDialog from '@/components/dashboard/contracts/signature-workflow-dialog';
import SignatureAuditTrail from '@/components/dashboard/contracts/signature-audit-trail';
import ContractPreviewDialog from '@/components/dashboard/contracts/contract-preview-dialog';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ContractService } from '@/lib/services';
import type {
  Contract,
  ContractTemplate,
  CreateContractRequest,
  UpdateContractRequest,
  GetContractsParams,
  SignatureSubmission
} from '@/lib/services/contracts/contract.service';

const ContractsManagement: React.FC = () => {
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [templates, setTemplates] = useState<ContractTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [formLoading, setFormLoading] = useState(false);
  const [totalCount, setTotalCount] = useState(0);

  // Form state
  const [formOpen, setFormOpen] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [editingContract, setEditingContract] = useState<Contract | null>(null);
  const [viewingContract, setViewingContract] = useState<any>(null);

  // Signature management state
  const [signatureDialogOpen, setSignatureDialogOpen] = useState(false);
  const [auditTrailOpen, setAuditTrailOpen] = useState(false);
  const [selectedContractForSignature, setSelectedContractForSignature] = useState<Contract | null>(null);
  const [selectedPartyType, setSelectedPartyType] = useState<'primary' | 'secondary' | 'additional'>('primary');
  const [selectedPartyIndex, setSelectedPartyIndex] = useState<number>(0);

  // Filter state
  const [filters, setFilters] = useState<GetContractsParams>({
    page: 1,
    limit: 10,
    sortBy: 'createdAt',
    sortOrder: 'desc',
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedTemplate, setSelectedTemplate] = useState('all');
  const [selectedLocale, setSelectedLocale] = useState('all');

  // Load contracts
  const loadContracts = async () => {
    try {
      setLoading(true);

      const queryParams: GetContractsParams = {
        ...filters,
        ...(selectedStatus !== 'all' && { status: selectedStatus as any }),
        ...(selectedTemplate !== 'all' && { templateId: selectedTemplate }),
        ...(selectedLocale !== 'all' && { locale: selectedLocale }),
        ...(searchTerm.trim() && { search: searchTerm.trim() }),
      };

      const response = await ContractService.getContracts(queryParams);

      if (response.success && response.data) {
        // Extract contracts array from the nested data structure
        // API returns { contracts: Contract[], pagination: any, statistics: any }
        const responseData = response.data as any;
        const contractsData = responseData.contracts || response.data;
        const contractsArray = Array.isArray(contractsData) ? contractsData : [];
        setContracts(contractsArray);
        setTotalCount(response.pagination?.total || contractsArray.length);
      } else {
        // Don't show error toast on initial load if endpoint doesn't exist
        console.warn('Contracts endpoint returned error:', response.error);
        setContracts([]);
        setTotalCount(0);

        // Only show error if it's not a 401/403/404
        if (response.error && !response.error.includes('401') && !response.error.includes('404')) {
          toast.error(response.error || 'Failed to load contracts');
        }
      }
    } catch (error: any) {
      console.error('Load contracts error:', error);
      setContracts([]);
      setTotalCount(0);

      // Don't show error toast for auth/permission issues
      const errorMessage = error.message || 'Failed to load contracts';
      if (!errorMessage.includes('401') && !errorMessage.includes('Access denied') && !errorMessage.includes('404')) {
        toast.error(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  // Load templates
  const loadTemplates = async () => {
    try {
      const response = await ContractService.getContractTemplates({
        status: 'active',
      });

      if (response.success && response.data) {
        setTemplates(response.data);
      } else {
        console.warn('Templates endpoint returned error:', response.error);
        setTemplates([]);
      }
    } catch (error: any) {
      console.error('Load templates error:', error);
      setTemplates([]);
      // Silently fail - templates are optional for viewing contracts
    }
  };

  // Initial load
  useEffect(() => {
    loadContracts();
    loadTemplates();
  }, [filters, selectedStatus, selectedTemplate, selectedLocale]);

  // Search functionality
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchTerm.trim()) {
        // Reload contracts with search term - let backend handle it
        loadContracts();
      } else {
        loadContracts();
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchTerm]);

  // Handlers
  const handleCreateContract = async (data: CreateContractRequest) => {
    try {
      setFormLoading(true);
      const response = await ContractService.createContract(data);

      if (response.success) {
        toast.success('Contract created successfully');
        loadContracts();
        setFormOpen(false);
      } else {
        throw new Error(response.error || 'Failed to create contract');
      }
    } catch (error: any) {
      console.error('Create contract error:', error);
      toast.error(error.message || 'Failed to create contract');
      throw error;
    } finally {
      setFormLoading(false);
    }
  };

  const handleUpdateContract = async (data: UpdateContractRequest) => {
    if (!editingContract) return;

    try {
      setFormLoading(true);
      const response = await ContractService.updateContract(editingContract._id, data);

      if (response.success) {
        toast.success('Contract updated successfully');
        loadContracts();
        setFormOpen(false);
        setEditingContract(null);
      } else {
        throw new Error(response.error || 'Failed to update contract');
      }
    } catch (error: any) {
      console.error('Update contract error:', error);
      toast.error(error.message || 'Failed to update contract');
      throw error;
    } finally {
      setFormLoading(false);
    }
  };

  const handleEdit = (contract: Contract) => {
    setEditingContract(contract);
    setFormOpen(true);
  };

  const handleView = (contract: any) => {
    setViewingContract(contract);
    setPreviewOpen(true);
  };

  const handleDownload = async (contract: Contract) => {
    try {
      if (!contract.files.generatedContract) {
        // Generate PDF if it doesn't exist
        const pdfResponse = await ContractService.generateContractPDF(contract._id);
        if (!pdfResponse.success) {
          throw new Error(pdfResponse.error || 'Failed to generate PDF');
        }
      }

      const blob = await ContractService.downloadContractPDF(contract._id);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${contract.title}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success('Contract downloaded successfully');
    } catch (error: any) {
      console.error('Download contract error:', error);
      toast.error(error.message || 'Failed to download contract');
    }
  };

  const handleSendForSignature = async (contract: Contract) => {
    // Collect recipient information
    const recipients: string[] = [];

    if (contract.parties.primary.email) {
      recipients.push(`Primary: ${contract.parties.primary.name} (${contract.parties.primary.email})`);
    }

    if (contract.parties.secondary.email) {
      recipients.push(`Secondary: ${contract.parties.secondary.name} (${contract.parties.secondary.email})`);
    }

    if (contract.parties.additional && contract.parties.additional.length > 0) {
      contract.parties.additional.forEach((party, index) => {
        if (party.email) {
          recipients.push(`Additional ${index + 1}: ${party.name || 'N/A'} (${party.email})`);
        }
      });
    }

    // Show confirmation dialog
    const confirmed = window.confirm(
      `📧 Send Contract for Signature\n\n` +
      `Contract: "${contract.title}"\n` +
      `Contract #: ${contract.contractNumber}\n\n` +
      `The following parties will receive an email invitation to sign:\n\n` +
      `${recipients.join('\n')}\n\n` +
      `Total Recipients: ${recipients.length}\n\n` +
      `Do you want to proceed?`
    );

    if (!confirmed) return;

    try {
      const response = await ContractService.sendForSignature(contract._id);

      if (response.success) {
        toast.success(
          `Contract sent successfully to ${recipients.length} recipient${recipients.length > 1 ? 's' : ''}`
        );
        loadContracts();
      } else {
        throw new Error(response.error || 'Failed to send for signature');
      }
    } catch (error: any) {
      console.error('Send for signature error:', error);
      toast.error(error.message || 'Failed to send for signature');
    }
  };

  const handleCancel = async (contract: Contract) => {
    // First confirmation with warning
    const confirmed = window.confirm(
      `⚠️ WARNING: Cancel Contract\n\n` +
      `Contract: "${contract.title}"\n` +
      `Contract #: ${contract.contractNumber}\n` +
      `Current Status: ${contract.status}\n\n` +
      `Cancelling this contract will:\n` +
      `• Stop all pending signature requests\n` +
      `• Send cancellation notifications to all parties\n` +
      `• Mark the contract as "cancelled"\n` +
      `• Record the cancellation in the audit trail\n` +
      `• THIS ACTION CANNOT BE UNDONE\n\n` +
      `Are you sure you want to cancel this contract?`
    );

    if (!confirmed) return;

    // Ask for reason with better UX
    const reason = window.prompt(
      '📝 Cancellation Reason\n\n' +
      'Please provide a detailed reason for cancelling this contract.\n' +
      'This will be recorded in the audit trail and sent to all parties.\n\n' +
      'Reason (required):'
    );

    if (!reason?.trim()) {
      toast.error('Cancellation reason is required');
      return;
    }

    if (reason.trim().length < 10) {
      toast.error('Please provide a more detailed reason (at least 10 characters)');
      return;
    }

    try {
      const response = await ContractService.cancelContract(contract._id, reason.trim());

      if (response.success) {
        toast.success('Contract cancelled successfully');
        loadContracts();
      } else {
        throw new Error(response.error || 'Failed to cancel contract');
      }
    } catch (error: any) {
      console.error('Cancel contract error:', error);
      toast.error(error.message || 'Failed to cancel contract');
    }
  };

  const handleDelete = async (contract: Contract) => {
    // Comprehensive warning dialog
    const confirmed = window.confirm(
      `🗑️ DELETE CONTRACT\n\n` +
      `Contract: "${contract.title}"\n` +
      `Contract #: ${contract.contractNumber}\n` +
      `Status: ${contract.status}\n` +
      `Created: ${new Date(contract.createdAt).toLocaleDateString()}\n\n` +
      `⚠️ CRITICAL WARNING:\n` +
      `• This will PERMANENTLY DELETE the contract\n` +
      `• All associated data will be LOST\n` +
      `• Signatures and audit trails will be REMOVED\n` +
      `• This action CANNOT BE UNDONE\n\n` +
      `❓ Consider these alternatives instead:\n` +
      `• Cancel the contract (keeps records)\n` +
      `• Archive the contract (hides from view)\n\n` +
      `Are you ABSOLUTELY SURE you want to DELETE?`
    );

    if (!confirmed) return;

    // Second confirmation for safety
    const finalConfirm = window.confirm(
      `FINAL CONFIRMATION REQUIRED\n\n` +
      `You are about to permanently delete:\n` +
      `"${contract.title}"\n\n` +
      `This is your LAST CHANCE to cancel.\n\n` +
      `Click OK to proceed with PERMANENT DELETION.`
    );

    if (!finalConfirm) return;

    try {
      const response = await ContractService.deleteContract(contract._id);

      if (response.success) {
        toast.success('Contract deleted successfully');
        loadContracts();
      } else {
        throw new Error(response.error || 'Failed to delete contract');
      }
    } catch (error: any) {
      console.error('Delete contract error:', error);

      // Provide detailed error messages
      let errorMessage = 'Failed to delete contract';

      if (error.message?.includes('permission') || error.message?.includes('authorized')) {
        errorMessage = 'You do not have permission to delete this contract';
      } else if (error.message?.includes('active') || error.message?.includes('signed')) {
        errorMessage = 'Cannot delete active or signed contracts. Please cancel first.';
      } else if (error.message?.includes('not found')) {
        errorMessage = 'Contract not found. It may have been already deleted.';
      } else if (error.message) {
        errorMessage = error.message;
      }

      toast.error(errorMessage);
    }
  };

  const handleExport = async () => {
    try {
      // Export functionality - for now just download as JSON
      const dataStr = JSON.stringify(contracts, null, 2);
      const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);

      const exportFileDefaultName = `contracts-export-${new Date().toISOString().split('T')[0]}.json`;

      const linkElement = document.createElement('a');
      linkElement.setAttribute('href', dataUri);
      linkElement.setAttribute('download', exportFileDefaultName);
      linkElement.click();

      toast.success('Contracts exported successfully');
    } catch (error: any) {
      console.error('Export error:', error);
      toast.error('Failed to export contracts');
    }
  };

  const handleFormSubmit = async (data: CreateContractRequest | UpdateContractRequest) => {
    if (editingContract) {
      return handleUpdateContract(data as UpdateContractRequest);
    } else {
      return handleCreateContract(data as CreateContractRequest);
    }
  };

  const handleFormClose = () => {
    setFormOpen(false);
    setEditingContract(null);
  };

  // Signature Management Handlers
  const handleSignContract = (contract: Contract, partyType: 'primary' | 'secondary' | 'additional', partyIndex: number = 0) => {
    setSelectedContractForSignature(contract);
    setSelectedPartyType(partyType);
    setSelectedPartyIndex(partyIndex);
    setSignatureDialogOpen(true);
  };

  const handleViewAuditTrail = (contract: Contract) => {
    setSelectedContractForSignature(contract);
    setAuditTrailOpen(true);
  };

  const handleSendReminder = async (contract: Contract, partyType: string, partyIndex: number = 0) => {
    try {
      const response = await ContractService.sendSignatureReminder(contract._id, partyType, partyIndex);

      if (response.success) {
        toast.success(`Signature reminder sent to ${partyType} party`);
      } else {
        throw new Error(response.error || 'Failed to send reminder');
      }
    } catch (error: any) {
      console.error('Send reminder error:', error);
      toast.error(error.message || 'Failed to send signature reminder');
    }
  };

  const handleSignatureComplete = async () => {
    // Refresh the contracts list to show updated signature status
    await loadContracts();
    setSignatureDialogOpen(false);
    setSelectedContractForSignature(null);
    toast.success('Contract signed successfully!');
  };

  const handleSignatureDialogClose = () => {
    setSignatureDialogOpen(false);
    setSelectedContractForSignature(null);
  };

  const handleAuditTrailClose = () => {
    setAuditTrailOpen(false);
    setSelectedContractForSignature(null);
  };

  return (
    <div className="space-y-6">
      <ContractsHeader
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        selectedStatus={selectedStatus}
        onStatusChange={setSelectedStatus}
        selectedTemplate={selectedTemplate}
        onTemplateChange={setSelectedTemplate}
        selectedLocale={selectedLocale}
        onLocaleChange={setSelectedLocale}
        onCreateClick={() => setFormOpen(true)}
        onExportClick={handleExport}
        totalCount={totalCount}
      />

      <ContractsTable
        contracts={contracts as any}
        loading={loading}
        onView={handleView}
        onEdit={handleEdit}
        onDownload={handleDownload}
        onSendForSignature={handleSendForSignature}
        onCancel={handleCancel}
        onDelete={handleDelete}
        onSignContract={handleSignContract}
        onViewAuditTrail={handleViewAuditTrail}
        onSendReminder={handleSendReminder}
      />

      <ContractPreviewDialog
        contract={viewingContract}
        open={previewOpen}
        onOpenChange={setPreviewOpen}
      />

      <ContractFormDialog
        open={formOpen}
        onOpenChange={handleFormClose}
        contract={editingContract}
        templates={templates}
        onSubmit={handleFormSubmit}
        loading={formLoading}
      />

      {/* Signature Management Dialogs */}
      {selectedContractForSignature && (
        <>
          <SignatureWorkflowDialog
            open={signatureDialogOpen}
            onOpenChange={handleSignatureDialogClose}
            contract={selectedContractForSignature}
            partyType={selectedPartyType}
            partyIndex={selectedPartyIndex}
            onSignatureSubmit={async (signatureData) => {
              try {
                const response = await ContractService.addSignature(selectedContractForSignature._id, signatureData);
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
            loading={formLoading}
          />

          <Dialog open={auditTrailOpen} onOpenChange={handleAuditTrailClose}>
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

export default ContractsManagement;