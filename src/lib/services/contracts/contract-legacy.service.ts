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
    style?: {
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
    tags?: string[];
    keywords?: string[];
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
    additional?: Array<{
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
      period: string;
      noticePeriod: number;
    };
  };
  financialTerms?: {
    contractValue?: {
      amount: number;
      currency: string;
    };
    paymentTerms?: {
      schedule: string;
      dueDate: string;
      lateFees: number;
    };
  };
  files?: {
    originalTemplate?: string;
    generatedContract?: string;
    signedContract?: string;
    finalContract?: string;
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

export interface CreateContractTemplateRequest {
  name: string;
  templateId: string;
  category: ContractTemplate['category'];
  locale: string;
  language: string;
  content: {
    body: string;
    htmlBody?: string;
    variables: ContractTemplate['content']['variables'];
  };
  metadata?: {
    title?: string;
    description?: string;
    tags?: string[];
    keywords?: string[];
  };
  legal?: {
    requiresSignature?: boolean;
    signatureType?: 'electronic' | 'wet_signature' | 'both';
    witnessRequired?: boolean;
    notarizationRequired?: boolean;
  };
}

export interface UpdateContractTemplateRequest extends Partial<CreateContractTemplateRequest> {}

export interface CreateContractRequest {
  templateId: string;
  title: string;
  parties: {
    primary: Contract['parties']['primary'];
    secondary: Contract['parties']['secondary'];
    additional?: Contract['parties']['additional'];
  };
  content: {
    variables: Record<string, any>;
  };
  terms: {
    effectiveDate: string;
    expirationDate?: string;
  };
  financialTerms?: Contract['financialTerms'];
}

export interface UpdateContractRequest extends Partial<CreateContractRequest> {}

export interface GetContractTemplatesParams {
  status?: 'draft' | 'review' | 'approved' | 'active' | 'deprecated';
  category?: string;
  locale?: string;
  tags?: string[];
  page?: number;
  limit?: number;
  sortBy?: 'name' | 'createdAt' | 'updatedAt' | 'version';
  sortOrder?: 'asc' | 'desc';
}

export interface GetContractsParams {
  status?: 'draft' | 'pending_signature' | 'partially_signed' | 'fully_signed' | 'completed' | 'cancelled';
  templateId?: string;
  locale?: string;
  party?: string;
  page?: number;
  limit?: number;
  sortBy?: 'title' | 'createdAt' | 'updatedAt' | 'status';
  sortOrder?: 'asc' | 'desc';
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

export interface SignContractRequest {
  contractId: string;
  party: 'party1' | 'party2';
  signatureData: string;
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

  // Contract Templates Methods
  /**
   * Get all contract templates with optional filtering and pagination
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
  async createContractTemplate(templateData: CreateContractTemplateRequest): Promise<ApiResponse<ContractTemplate>> {
    try {
      const response = await ApiService.post<ApiResponse<ContractTemplate>>(this.templatesEndpoint, templateData);
      return response;
    } catch (error) {
      console.error('Create contract template error:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Update an existing contract template
   */
  async updateContractTemplate(id: string, templateData: UpdateContractTemplateRequest): Promise<ApiResponse<ContractTemplate>> {
    try {
      const response = await ApiService.put<ApiResponse<ContractTemplate>>(`${this.templatesEndpoint}/${id}`, templateData);
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
   * Create new version of contract template
   */
  async createTemplateVersion(id: string, versionData: CreateContractTemplateRequest): Promise<ApiResponse<ContractTemplate>> {
    try {
      const response = await ApiService.post<ApiResponse<ContractTemplate>>(`${this.templatesEndpoint}/${id}/version`, versionData);
      return response;
    } catch (error) {
      console.error('Create template version error:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Approve contract template
   */
  async approveTemplate(id: string, comments?: string): Promise<ApiResponse<ContractTemplate>> {
    try {
      const response = await ApiService.put<ApiResponse<ContractTemplate>>(`${this.templatesEndpoint}/${id}/approve`, { comments });
      return response;
    } catch (error) {
      console.error('Approve template error:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Reject contract template
   */
  async rejectTemplate(id: string, reason: string): Promise<ApiResponse<ContractTemplate>> {
    try {
      const response = await ApiService.put<ApiResponse<ContractTemplate>>(`${this.templatesEndpoint}/${id}/reject`, { reason });
      return response;
    } catch (error) {
      console.error('Reject template error:', error);
      throw this.handleError(error);
    }
  }

  // Contracts Methods
  /**
   * Get all contracts with optional filtering and pagination
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
  async createContract(contractData: CreateContractRequest): Promise<ApiResponse<Contract>> {
    try {
      const response = await ApiService.post<ApiResponse<Contract>>(`${this.contractsEndpoint}/new`, contractData);
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
      const response = await ApiService.put<ApiResponse<Contract>>(`${this.contractsEndpoint}/${id}`, contractData);
      return response;
    } catch (error) {
      console.error('Update contract error:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Delete a contract
   */
  async deleteContract(id: string): Promise<ApiResponse> {
    try {
      const response = await ApiService.delete<ApiResponse>(`${this.contractsEndpoint}/${id}`);
      return response;
    } catch (error) {
      console.error('Delete contract error:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Generate PDF for contract
   */
  async generateContractPDF(id: string): Promise<ApiResponse<{ pdfPath: string }>> {
    try {
      const response = await ApiService.post<ApiResponse<{ pdfPath: string }>>(`${this.contractsEndpoint}/generate-pdf`, { contractId: id });
      return response;
    } catch (error) {
      console.error('Generate contract PDF error:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Send contract for signature
   */
  async sendForSignature(id: string): Promise<ApiResponse<Contract>> {
    try {
      const response = await ApiService.post<ApiResponse<Contract>>(`${this.contractsEndpoint}/${id}/send-for-signature`, {});
      return response;
    } catch (error) {
      console.error('Send for signature error:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Sign contract
   */
  async signContract(signData: SignContractRequest): Promise<ApiResponse<Contract>> {
    try {
      const response = await ApiService.post<ApiResponse<Contract>>(`${this.contractsEndpoint}/${signData.contractId}/sign`, {
        party: signData.party,
        signatureData: signData.signatureData
      });
      return response;
    } catch (error) {
      console.error('Sign contract error:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Cancel contract
   */
  async cancelContract(id: string, reason: string): Promise<ApiResponse<Contract>> {
    try {
      const response = await ApiService.put<ApiResponse<Contract>>(`${this.contractsEndpoint}/${id}/cancel`, { reason });
      return response;
    } catch (error) {
      console.error('Cancel contract error:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Get contract statistics
   */
  async getContractStats(): Promise<ApiResponse<ContractStats>> {
    try {
      const response = await ApiService.get<ApiResponse<ContractStats>>(`${this.contractsEndpoint}/stats`);
      return response;
    } catch (error) {
      console.error('Get contract stats error:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Download contract PDF
   */
  async downloadContractPDF(id: string): Promise<Blob> {
    try {
      // Note: This would need special handling for file downloads
      const response = await fetch(`/api${this.contractsEndpoint}/${id}/download`, {
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
   * Helper method to build query string from parameters
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
   * Handle API errors and format them appropriately
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
   * Clear cache for contracts (if using any caching mechanism)
   */
  clearCache(): void {
    console.log('Contract cache cleared');
  }
}

export default new ContractService();