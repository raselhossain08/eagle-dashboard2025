import ApiService from '../shared/api.service';

export interface ContractTemplate {
  _id: string;
  name: string;
  templateId: string;
  category: 'investment_agreement' | 'service_agreement' | 'nda' | 'terms_of_service' | 'privacy_policy' | 'advisory_agreement' | 'subscription_agreement' | 'partnership_agreement' | 'employment_contract' | 'consulting_agreement' | 'license_agreement' | 'custom';
  version: {
    major: number;
    minor: number;
    patch: number;
  };
  versionString: string;
  locale: string;
  language: string;
  content: {
    body: string;
    htmlBody?: string;
    header?: string;
    footer?: string;
    variables: Array<{
      name: string;
      label: string;
      type: 'text' | 'number' | 'date' | 'boolean' | 'select' | 'textarea' | 'email' | 'phone' | 'currency';
      required: boolean;
      defaultValue?: any;
      options?: string[];
      validation?: {
        minLength?: number;
        maxLength?: number;
        min?: number;
        max?: number;
        pattern?: string;
      };
      description?: string;
      placeholder?: string;
      group?: string;
    }>;
    style: {
      font: {
        family: string;
        size: number;
      };
      margins: {
        top: number;
        bottom: number;
        left: number;
        right: number;
      };
      pageSize: 'A4' | 'Letter' | 'Legal';
      orientation: 'portrait' | 'landscape';
    };
  };
  metadata: {
    title?: string;
    description?: string;
    tags: string[];
    keywords: string[];
    author?: string;
    jurisdiction?: string;
    applicableLaw?: string;
    effectiveDate?: string;
    expiryDate?: string;
  };
  status: 'draft' | 'review' | 'approved' | 'active' | 'deprecated' | 'archived';
  isActive: boolean;
  isDefault: boolean;
  approval: {
    status: 'pending' | 'approved' | 'rejected' | 'requires_changes';
    approvedBy?: string;
    approvedAt?: string;
    rejectedBy?: string;
    rejectedAt?: string;
    rejectionReason?: string;
    reviewComments: Array<{
      reviewer: string;
      comment: string;
      reviewedAt: string;
      severity: 'info' | 'warning' | 'error';
    }>;
  };
  usage: {
    totalContracts: number;
    activeContracts: number;
    lastUsed?: string;
    popularityScore: number;
  };
  legal: {
    requiresSignature: boolean;
    signatureType: 'electronic' | 'wet_signature' | 'both';
    witnessRequired: boolean;
    notarizationRequired: boolean;
    retentionPeriod?: number;
    complianceNotes?: string;
  };
  createdBy: string;
  updatedBy?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Contract {
  _id: string;
  contractNumber: string;
  title: string;
  template: {
    templateId: string;
    templateVersion: string;
    templateRef: string;
    locale: string;
  };
  parties: {
    primary: {
      type: 'individual' | 'company' | 'organization';
      name: string;
      title?: string;
      email?: string;
      phone?: string;
      address?: {
        line1?: string;
        line2?: string;
        city?: string;
        state?: string;
        postalCode?: string;
        country?: string;
      };
      userId?: string;
      signatureRequired: boolean;
    };
    secondary: {
      type: 'individual' | 'company' | 'organization';
      name: string;
      title?: string;
      email?: string;
      phone?: string;
      address?: {
        line1?: string;
        line2?: string;
        city?: string;
        state?: string;
        postalCode?: string;
        country?: string;
      };
      userId?: string;
      signatureRequired: boolean;
    };
    additional: Array<{
      type: 'individual' | 'company' | 'organization' | 'witness' | 'notary';
      name?: string;
      title?: string;
      email?: string;
      phone?: string;
      role?: string;
      userId?: string;
      signatureRequired: boolean;
    }>;
  };
  content: {
    body: string;
    htmlBody?: string;
    variables: Record<string, any>;
    header?: string;
    footer?: string;
    attachments: Array<{
      fileName: string;
      originalName: string;
      fileType: string;
      fileSize: number;
      filePath: string;
      uploadedBy: string;
      uploadedAt: string;
      description?: string;
      isRequired: boolean;
    }>;
  };
  status: 'draft' | 'pending_review' | 'pending_approval' | 'approved' | 'sent_for_signature' | 'partially_signed' | 'fully_signed' | 'executed' | 'active' | 'expired' | 'terminated' | 'cancelled' | 'disputed';
  signatures: Array<{
    partyType: 'primary' | 'secondary' | 'additional';
    partyIndex?: number;
    signedBy?: string;
    signedByName?: string;
    signedByEmail?: string;
    signatureMethod: 'electronic' | 'wet_signature' | 'docusign' | 'adobe_sign' | 'hellosign';
    signatureData?: {
      signatureImage?: string;
      ipAddress?: string;
      userAgent?: string;
      timestamp?: string;
      externalId?: string;
      externalStatus?: string;
      externalData?: any;
    };
    signedAt?: string;
  }>;
  terms: {
    effectiveDate: string;
    expirationDate?: string;
    autoRenewal?: {
      enabled: boolean;
      period?: string;
      noticePeriod?: number;
    };
    terminationClause?: {
      allowedBy: string[];
      noticePeriod?: number;
      penalties?: string;
    };
  };
  financialTerms?: {
    contractValue?: {
      amount: number;
      currency: string;
    };
    paymentTerms?: {
      schedule: string;
      dueDate?: string;
      lateFees?: number;
      discounts: Array<{
        description: string;
        amount?: number;
        percentage?: number;
        conditions?: string;
      }>;
    };
  };
  approvals: Array<{
    approver: string;
    approverRole?: string;
    status: 'pending' | 'approved' | 'rejected' | 'delegated';
    approvedAt?: string;
    rejectedAt?: string;
    comments?: string;
    conditions?: string;
    delegatedTo?: string;
  }>;
  files: {
    originalTemplate?: string;
    generatedContract?: string;
    signedContract?: string;
    finalContract?: string;
    backups: string[];
  };
  analytics: {
    views: {
      total: number;
      unique: number;
      lastViewed?: string;
    };
    downloads: {
      total: number;
      lastDownloaded?: string;
    };
    timeToSign?: number;
    negotiationRounds: number;
    revisions: number;
  };
  createdBy: string;
  updatedBy?: string;
  createdAt: string;
  updatedAt: string;
}

// Request/Response interfaces
export interface CreateContractTemplateRequest {
  name: string;
  templateId: string;
  category: ContractTemplate['category'];
  locale?: string;
  content: {
    body: string;
    htmlBody?: string;
    variables: ContractTemplate['content']['variables'];
  };
  metadata?: Partial<ContractTemplate['metadata']>;
  legal?: Partial<ContractTemplate['legal']>;
}

export interface UpdateContractTemplateRequest extends Partial<CreateContractTemplateRequest> {}

export interface CreateContractRequest {
  templateId: string;
  title: string;
  parties: {
    primary: Omit<Contract['parties']['primary'], 'signatureRequired'>;
    secondary: Omit<Contract['parties']['secondary'], 'signatureRequired'>;
    additional?: Array<Omit<Contract['parties']['additional'][0], 'signatureRequired'>>;
  };
  variableValues: Record<string, any>;
  terms: {
    effectiveDate: string;
    expirationDate?: string;
  };
  financialTerms?: Contract['financialTerms'];
}

export interface UpdateContractRequest extends Partial<CreateContractRequest> {}

export interface GetContractTemplatesParams {
  category?: ContractTemplate['category'];
  status?: ContractTemplate['status'];
  locale?: string;
  language?: string;
  isActive?: boolean;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  search?: string;
}

export interface GetContractsParams {
  status?: Contract['status'];
  templateId?: string;
  partyEmail?: string;
  contractNumber?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  search?: string;
}

// ==================== SIGNATURE INTERFACES ====================

export interface SignatureRequirement {
  partyType: 'primary' | 'secondary' | 'additional';
  partyIndex?: number;
  partyName: string;
  partyEmail?: string;
  signatureRequired: boolean;
  isSigned: boolean;
  signedAt?: string;
  signedBy?: string;
  witnessRequired?: boolean;
  notaryRequired?: boolean;
}

export interface SignatureMetadata {
  ipAddress: string;
  userAgent: string;
  timestamp: Date;
  geolocation?: {
    latitude: number;
    longitude: number;
    accuracy: number;
  };
  deviceInfo?: {
    platform: string;
    screenResolution: string;
    timeZone: string;
    language: string;
  };
}

export interface SignatureWitness {
  name: string;
  email: string;
  phone?: string;
}

export interface SignatureNotary {
  name: string;
  commission: string;
  stamp?: File | string;
}

export interface SignatureSubmission {
  partyType: 'primary' | 'secondary' | 'additional';
  partyIndex?: number;
  signatureMethod: 'electronic' | 'wet_signature' | 'docusign' | 'adobe_sign' | 'hellosign';
  signatureImage?: File | string; // Base64 or File object
  metadata: SignatureMetadata;
  witness?: SignatureWitness;
  notary?: SignatureNotary;
}

export interface SignatureStatus {
  totalRequired: number;
  totalSigned: number;
  percentage: number;
  isFullySigned: boolean;
  pendingParties: Array<{
    partyType: string;
    partyIndex?: number;
    partyName: string;
    partyEmail?: string;
  }>;
  signedParties: Array<{
    partyType: string;
    partyIndex?: number;
    partyName: string;
    signedAt: string;
    signedBy: string;
  }>;
}

export interface SignatureRecipient {
  partyType: 'primary' | 'secondary' | 'additional';
  partyIndex?: number;
  name: string;
  email: string;
  customMessage?: string;
}

export interface SignatureVerification {
  isValid: boolean;
  signatureId: string;
  signedBy: string;
  signedAt: string;
  ipAddress: string;
  userAgent: string;
  hash: string;
  certificate?: string;
  errors?: string[];
  warnings?: string[];
}

export interface SignatureAuditEntry {
  _id: string;
  action: 'signature_added' | 'signature_verified' | 'signature_sent' | 'reminder_sent' | 'signature_cancelled';
  timestamp: string;
  performedBy?: string;
  performedByName?: string;
  partyType?: string;
  partyIndex?: number;
  partyName?: string;
  details: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
}

export interface ContractSignature {
  _id: string;
  contractId: string;
  signerName: string;
  signerEmail: string;
  signatureImage: string;
  signedAt: string;
  ipAddress: string;
  userAgent: string;
  status: 'valid' | 'pending' | 'invalid' | 'expired';
  metadata: SignatureMetadata;
  witness?: SignatureWitness;
  notary?: SignatureNotary;
  hashValue: string;
  certificate?: string;
}

export interface ContractStats {
  overview: {
    totalContracts: number;
    activeTemplates: number;
    pendingSignatures: number;
    fullySignedContracts: number;
    draftContracts: number;
  };
  statusBreakdown: Array<{
    _id: string;
    count: number;
  }>;
  templateUsage: Array<{
    _id: string;
    name: string;
    usageCount: number;
  }>;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

class ContractService {
  private readonly templatesEndpoint = '/contract-templates';
  private readonly contractsEndpoint = '/contracts';

  // =================== CONTRACT TEMPLATES ===================

  /**
   * Get all contract templates with pagination and filtering
   */
  async getContractTemplates(params?: GetContractTemplatesParams): Promise<ApiResponse<ContractTemplate[]>> {
    try {
      const queryString = params ? this.buildQueryString(params) : '';
      const response = await ApiService.get<ApiResponse<ContractTemplate[]>>(`${this.templatesEndpoint}${queryString}`);
      return response;
    } catch (error) {
      console.error('Get contract templates error:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Get contract template by ID
   */
  async getContractTemplateById(id: string): Promise<ApiResponse<ContractTemplate>> {
    try {
      const response = await ApiService.get<ApiResponse<ContractTemplate>>(`${this.templatesEndpoint}/${id}`);
      return response;
    } catch (error) {
      console.error('Get contract template by ID error:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Create a new contract template
   */
  async createContractTemplate(templateData: CreateContractTemplateRequest, file?: File): Promise<ApiResponse<ContractTemplate>> {
    try {
      const formData = new FormData();
      
      // Append template data
      Object.entries(templateData).forEach(([key, value]) => {
        if (value !== undefined) {
          formData.append(key, typeof value === 'object' ? JSON.stringify(value) : value as string);
        }
      });

      // Append file if provided
      if (file) {
        formData.append('templateFile', file);
      }

      const response = await ApiService.postFormData<ApiResponse<ContractTemplate>>(this.templatesEndpoint, formData);
      return response;
    } catch (error) {
      console.error('Create contract template error:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Update an existing contract template
   */
  async updateContractTemplate(id: string, templateData: UpdateContractTemplateRequest, file?: File): Promise<ApiResponse<ContractTemplate>> {
    try {
      const formData = new FormData();
      
      // Append template data
      Object.entries(templateData).forEach(([key, value]) => {
        if (value !== undefined) {
          formData.append(key, typeof value === 'object' ? JSON.stringify(value) : value as string);
        }
      });

      // Append file if provided
      if (file) {
        formData.append('templateFile', file);
      }

      const response = await ApiService.putFormData<ApiResponse<ContractTemplate>>(`${this.templatesEndpoint}/${id}`, formData);
      return response;
    } catch (error) {
      console.error('Update contract template error:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Delete a contract template
   */
  async deleteContractTemplate(id: string): Promise<ApiResponse> {
    try {
      const response = await ApiService.delete<ApiResponse>(`${this.templatesEndpoint}/${id}`);
      return response;
    } catch (error) {
      console.error('Delete contract template error:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Approve contract template
   */
  async approveTemplate(id: string, comments?: string): Promise<ApiResponse<ContractTemplate>> {
    try {
      const response = await ApiService.post<ApiResponse<ContractTemplate>>(`${this.templatesEndpoint}/${id}/approve`, { comments });
      return response;
    } catch (error) {
      console.error('Approve template error:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Publish contract template
   */
  async publishTemplate(id: string): Promise<ApiResponse<ContractTemplate>> {
    try {
      const response = await ApiService.post<ApiResponse<ContractTemplate>>(`${this.templatesEndpoint}/${id}/publish`, {});
      return response;
    } catch (error) {
      console.error('Publish template error:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Render template with variables
   */
  async renderTemplate(id: string, variables: Record<string, any>): Promise<ApiResponse<{ content: string; htmlContent?: string }>> {
    try {
      const response = await ApiService.post<ApiResponse<{ content: string; htmlContent?: string }>>(`${this.templatesEndpoint}/${id}/render`, { variables });
      return response;
    } catch (error) {
      console.error('Render template error:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Get template categories
   */
  async getTemplateCategories(): Promise<ApiResponse<string[]>> {
    try {
      const response = await ApiService.get<ApiResponse<string[]>>(`${this.templatesEndpoint}/categories`);
      return response;
    } catch (error) {
      console.error('Get template categories error:', error);
      throw this.handleError(error);
    }
  }

  // =================== CONTRACTS ===================

  /**
   * Get all contracts with pagination and filtering
   */
  async getContracts(params?: GetContractsParams): Promise<ApiResponse<Contract[]>> {
    try {
      const queryString = params ? this.buildQueryString(params) : '';
      const response = await ApiService.get<ApiResponse<Contract[]>>(`${this.contractsEndpoint}/all${queryString}`);
      return response;
    } catch (error) {
      console.error('Get contracts error:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Get contract by ID
   */
  async getContractById(id: string): Promise<ApiResponse<Contract>> {
    try {
      const response = await ApiService.get<ApiResponse<Contract>>(`${this.contractsEndpoint}/new/${id}`);
      return response;
    } catch (error) {
      console.error('Get contract by ID error:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Create a new contract
   */
  async createContract(contractData: CreateContractRequest, attachments?: File[]): Promise<ApiResponse<Contract>> {
    try {
      const formData = new FormData();
      
      // Append contract data
      Object.entries(contractData).forEach(([key, value]) => {
        if (value !== undefined) {
          formData.append(key, typeof value === 'object' ? JSON.stringify(value) : value as string);
        }
      });

      // Append attachments if provided
      if (attachments && attachments.length > 0) {
        attachments.forEach(file => {
          formData.append('attachments', file);
        });
      }

      const response = await ApiService.postFormData<ApiResponse<Contract>>(`${this.contractsEndpoint}/new`, formData);
      return response;
    } catch (error) {
      console.error('Create contract error:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Update an existing contract
   */
  async updateContract(id: string, contractData: UpdateContractRequest): Promise<ApiResponse<Contract>> {
    try {
      // For simplicity, use regular PUT request since update might not need file uploads
      const response = await ApiService.put<ApiResponse<Contract>>(`${this.contractsEndpoint}/new/${id}`, contractData);
      return response;
    } catch (error) {
      console.error('Update contract error:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Delete contract
   */
  async deleteContract(id: string): Promise<ApiResponse> {
    try {
      const response = await ApiService.delete<ApiResponse>(`${this.contractsEndpoint}/new/${id}`);
      return response;
    } catch (error) {
      console.error('Delete contract error:', error);
      throw this.handleError(error);
    }
  }



  /**
   * Cancel contract (placeholder - might need backend implementation)
   */
  async cancelContract(id: string, reason: string): Promise<ApiResponse<Contract>> {
    try {
      // This endpoint might not exist in backend, implement as needed
      const response = await ApiService.put<ApiResponse<Contract>>(`${this.contractsEndpoint}/${id}/cancel`, { reason });
      return response;
    } catch (error) {
      console.error('Cancel contract error:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Generate PDF for contract
   */
  async generateContractPDF(contractId: string): Promise<ApiResponse<{ pdfUrl: string }>> {
    try {
      const response = await ApiService.post<ApiResponse<{ pdfUrl: string }>>(`${this.contractsEndpoint}/generate-pdf`, { contractId });
      return response;
    } catch (error) {
      console.error('Generate contract PDF error:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Get contract PDF URL
   */
  async getContractPDFUrl(contractId: string): Promise<ApiResponse<{ url: string }>> {
    try {
      const response = await ApiService.get<ApiResponse<{ url: string }>>(`${this.contractsEndpoint}/${contractId}/pdf`);
      return response;
    } catch (error) {
      console.error('Get contract PDF URL error:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Download contract PDF
   */
  async downloadContractPDF(contractId: string): Promise<Blob> {
    try {
      const response = await fetch(`/api${this.contractsEndpoint}/${contractId}/pdf`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      
      if (!response.ok) {
        throw new Error('Failed to download PDF');
      }
      
      return await response.blob();
    } catch (error) {
      console.error('Download contract PDF error:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Sign contract
   */
  async signContract(contractId: string, signatureData: {
    partyType: 'primary' | 'secondary' | 'additional';
    partyIndex?: number;
    signatureImage: string;
  }): Promise<ApiResponse<Contract>> {
    try {
      const response = await ApiService.post<ApiResponse<Contract>>(`${this.contractsEndpoint}/sign`, {
        contractId,
        ...signatureData
      });
      return response;
    } catch (error) {
      console.error('Sign contract error:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Get contract statistics
   */
  async getContractStats(): Promise<ApiResponse<ContractStats>> {
    try {
      // This endpoint might not exist in the backend yet, so we'll create a placeholder
      const contractsResponse = await this.getContracts({ limit: 1000 });
      const templatesResponse = await this.getContractTemplates({ limit: 1000 });
      
      if (contractsResponse.success && templatesResponse.success) {
        const contracts = contractsResponse.data || [];
        const templates = templatesResponse.data || [];
        
        const stats: ContractStats = {
          overview: {
            totalContracts: contracts.length,
            activeTemplates: templates.filter(t => t.status === 'active').length,
            pendingSignatures: contracts.filter(c => ['sent_for_signature', 'partially_signed'].includes(c.status)).length,
            fullySignedContracts: contracts.filter(c => ['fully_signed', 'executed', 'active'].includes(c.status)).length,
            draftContracts: contracts.filter(c => c.status === 'draft').length,
          },
          statusBreakdown: this.calculateStatusBreakdown(contracts),
          templateUsage: this.calculateTemplateUsage(contracts, templates),
        };
        
        return { success: true, data: stats };
      }
      
      throw new Error('Failed to fetch stats data');
    } catch (error) {
      console.error('Get contract stats error:', error);
      throw this.handleError(error);
    }
  }

  // =================== HELPER METHODS ===================

  /**
   * Calculate status breakdown for contracts
   */
  private calculateStatusBreakdown(contracts: Contract[]): Array<{ _id: string; count: number }> {
    const statusCounts: Record<string, number> = {};
    
    contracts.forEach(contract => {
      statusCounts[contract.status] = (statusCounts[contract.status] || 0) + 1;
    });
    
    return Object.entries(statusCounts).map(([status, count]) => ({
      _id: status,
      count
    }));
  }

  /**
   * Calculate template usage statistics
   */
  private calculateTemplateUsage(contracts: Contract[], templates: ContractTemplate[]): Array<{ _id: string; name: string; usageCount: number }> {
    const templateUsage: Record<string, { name: string; count: number }> = {};
    
    // Initialize with all templates
    templates.forEach(template => {
      templateUsage[template.templateId] = {
        name: template.name,
        count: 0
      };
    });
    
    // Count usage from contracts
    contracts.forEach(contract => {
      if (templateUsage[contract.template.templateId]) {
        templateUsage[contract.template.templateId].count++;
      }
    });
    
    return Object.entries(templateUsage).map(([templateId, data]) => ({
      _id: templateId,
      name: data.name,
      usageCount: data.count
    }));
  }

  // ==================== SIGNATURE MANAGEMENT ====================

  /**
   * Get signature requirements for a contract
   */
  async getSignatureRequirements(contractId: string): Promise<ApiResponse<SignatureRequirement[]>> {
    try {
      const response = await ApiService.get<ApiResponse<SignatureRequirement[]>>(`${this.contractsEndpoint}/${contractId}/signature-requirements`);
      return response;
    } catch (error) {
      console.error('Get signature requirements error:', error);
      return { success: false, error: this.handleError(error).message };
    }
  }

  /**
   * Add signature to contract
   */
  async addSignature(contractId: string, signatureData: SignatureSubmission): Promise<ApiResponse<Contract>> {
    try {
      const formData = new FormData();
      formData.append('partyType', signatureData.partyType);
      if (signatureData.partyIndex !== undefined) {
        formData.append('partyIndex', signatureData.partyIndex.toString());
      }
      formData.append('signatureMethod', signatureData.signatureMethod);
      
      // Add signature data
      if (signatureData.signatureImage) {
        if (typeof signatureData.signatureImage === 'string') {
          formData.append('signatureImage', signatureData.signatureImage);
        } else {
          formData.append('signatureImage', signatureData.signatureImage);
        }
      }
      
      // Add metadata
      formData.append('ipAddress', signatureData.metadata.ipAddress);
      formData.append('userAgent', signatureData.metadata.userAgent);
      formData.append('timestamp', signatureData.metadata.timestamp.toISOString());
      
      if (signatureData.metadata.geolocation) {
        formData.append('geolocation', JSON.stringify(signatureData.metadata.geolocation));
      }
      
      if (signatureData.metadata.deviceInfo) {
        formData.append('deviceInfo', JSON.stringify(signatureData.metadata.deviceInfo));
      }
      
      // Add witness information if provided
      if (signatureData.witness) {
        formData.append('witnessName', signatureData.witness.name);
        formData.append('witnessEmail', signatureData.witness.email);
        if (signatureData.witness.phone) {
          formData.append('witnessPhone', signatureData.witness.phone);
        }
      }
      
      // Add notary information if provided
      if (signatureData.notary) {
        formData.append('notaryName', signatureData.notary.name);
        formData.append('notaryCommission', signatureData.notary.commission);
        if (signatureData.notary.stamp) {
          formData.append('notaryStamp', signatureData.notary.stamp);
        }
      }

      const response = await ApiService.postFormData<ApiResponse<Contract>>(`${this.contractsEndpoint}/${contractId}/signatures`, formData);
      return response;
    } catch (error) {
      console.error('Add signature error:', error);
      return { success: false, error: this.handleError(error).message };
    }
  }

  /**
   * Get signature status for a contract
   */
  async getSignatureStatus(contractId: string): Promise<ApiResponse<SignatureStatus>> {
    try {
      const response = await ApiService.get<ApiResponse<SignatureStatus>>(`${this.contractsEndpoint}/${contractId}/signature-status`);
      return response;
    } catch (error) {
      console.error('Get signature status error:', error);
      return { success: false, error: this.handleError(error).message };
    }
  }

  /**
   * Send contract for signature
   */
  async sendForSignature(contractId: string, recipients?: SignatureRecipient[]): Promise<ApiResponse<Contract>> {
    try {
      const payload = recipients ? { recipients } : {};
      const response = await ApiService.post<ApiResponse<Contract>>(`${this.contractsEndpoint}/${contractId}/send-for-signature`, payload);
      return response;
    } catch (error) {
      console.error('Send for signature error:', error);
      return { success: false, error: this.handleError(error).message };
    }
  }

  /**
   * Verify signature authenticity
   */
  async verifySignature(contractId: string, signatureId: string): Promise<ApiResponse<SignatureVerification>> {
    try {
      const response = await ApiService.get<ApiResponse<SignatureVerification>>(`${this.contractsEndpoint}/${contractId}/signatures/${signatureId}/verify`);
      return response;
    } catch (error) {
      console.error('Verify signature error:', error);
      return { success: false, error: this.handleError(error).message };
    }
  }

  /**
   * Get signature audit trail
   */
  async getSignatureAuditTrail(contractId: string): Promise<ApiResponse<SignatureAuditEntry[]>> {
    try {
      const response = await ApiService.get<ApiResponse<SignatureAuditEntry[]>>(`${this.contractsEndpoint}/${contractId}/signature-audit`);
      return response;
    } catch (error) {
      console.error('Get signature audit trail error:', error);
      return { success: false, error: this.handleError(error).message };
    }
  }

  /**
   * Cancel signature request
   */
  async cancelSignatureRequest(contractId: string, reason?: string): Promise<ApiResponse<Contract>> {
    try {
      const payload = { reason };
      const response = await ApiService.post<ApiResponse<Contract>>(`${this.contractsEndpoint}/${contractId}/cancel-signature`, payload);
      return response;
    } catch (error) {
      console.error('Cancel signature request error:', error);
      return { success: false, error: this.handleError(error).message };
    }
  }

  /**
   * Request signature reminder
   */
  async sendSignatureReminder(contractId: string, partyType: string, partyIndex?: number): Promise<ApiResponse<boolean>> {
    try {
      const payload = { partyType, partyIndex };
      const response = await ApiService.post<ApiResponse<boolean>>(`${this.contractsEndpoint}/${contractId}/signature-reminder`, payload);
      return response;
    } catch (error) {
      console.error('Send signature reminder error:', error);
      return { success: false, error: this.handleError(error).message };
    }
  }

  /**
   * Get signature certificate (for legal verification)
   */
  async getSignatureCertificate(contractId: string, signatureId: string): Promise<Blob> {
    try {
      const token = ApiService.getToken();
      const response = await fetch(`/api${this.contractsEndpoint}/${contractId}/signatures/${signatureId}/certificate`, {
        method: 'GET',
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to download signature certificate');
      }

      return await response.blob();
    } catch (error) {
      console.error('Download signature certificate error:', error);
      throw error;
    }
  }

  /**
   * Build query string from parameters
   */
  private buildQueryString(params: Record<string, any>): string {
    const searchParams = new URLSearchParams();
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        if (Array.isArray(value)) {
          value.forEach(v => searchParams.append(key, v.toString()));
        } else {
          searchParams.append(key, value.toString());
        }
      }
    });
    
    const queryString = searchParams.toString();
    return queryString ? `?${queryString}` : '';
  }

  /**
   * Handle API errors
   */
  private handleError(error: any): Error {
    if (error instanceof Error) {
      return error;
    }
    if (typeof error === 'string') {
      return new Error(error);
    }
    if (error?.message) {
      return new Error(error.message);
    }
    return new Error('An unexpected error occurred');
  }

  /**
   * Get signatures with filtering
   */
  async getSignatures(params?: {
    contractId?: string;
    status?: string;
    search?: string;
    limit?: number;
    page?: number;
  }): Promise<ApiResponse<ContractSignature[]>> {
    try {
      const queryParams = new URLSearchParams();
      
      if (params?.contractId) queryParams.append('contractId', params.contractId);
      if (params?.status) queryParams.append('status', params.status);
      if (params?.search) queryParams.append('search', params.search);
      if (params?.limit) queryParams.append('limit', params.limit.toString());
      if (params?.page) queryParams.append('page', params.page.toString());

      const response = await ApiService.get<ApiResponse<ContractSignature[]>>(`/contracts/signatures?${queryParams.toString()}`);

      // Normalize response.data to always be an array of signatures
      let normalizedData: ContractSignature[] = [];

      try {
        const payload = (response as any)?.data;

        if (Array.isArray(payload)) {
          normalizedData = payload;
        } else if (payload?.data && Array.isArray(payload.data)) {
          normalizedData = payload.data;
        } else if (payload?.items && Array.isArray(payload.items)) {
          normalizedData = payload.items;
        } else if (payload?.signatures && Array.isArray(payload.signatures)) {
          normalizedData = payload.signatures;
        } else {
          // If payload is a single object representing a signature, wrap it
          if (payload && typeof payload === 'object' && payload._id) {
            normalizedData = [payload as ContractSignature];
          } else {
            normalizedData = [];
          }
        }
      } catch (err) {
        console.warn('Failed to normalize signatures response, falling back to empty array', err);
        normalizedData = [];
      }

      return {
        success: true,
        data: normalizedData,
        message: 'Signatures retrieved successfully'
      };
    } catch (error) {
      console.error('Get signatures error:', error);
      return {
        success: false,
        error: this.handleError(error).message,
        message: 'Failed to retrieve signatures'
      };
    }
  }

  /**
   * Clear cache
   */
  clearCache(): void {
    console.log('Contract cache cleared');
  }
}

export default new ContractService();