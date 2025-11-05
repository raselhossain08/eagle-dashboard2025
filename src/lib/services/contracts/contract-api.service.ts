import ApiService from '../shared/api.service';

// =================== API RESPONSE TYPES ===================
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

// =================== CONTRACT DATA TYPES ===================
export interface ContractContact {
  fullName: string;
  email: string;
  phone: string;
}

export interface ContractContactExtended extends ContractContact {
  name: string;
  productType: string;
  signature: string;
  country: string;
  streetAddress: string;
  townCity: string;
  stateCounty: string;
  postcodeZip: string;
}

export interface PublicContractData {
  email: string;
}

export interface ContractSigningData {
  name: string;
  email: string;
  signature: string;
  productType: string;
  subscriptionType?: string;
}

export interface ContractPaymentUpdate {
  paymentStatus: 'pending' | 'completed' | 'failed' | 'refunded';
  paymentId?: string;
  amount?: number;
  currency?: string;
}

export interface ContractExportParams {
  format?: 'csv' | 'excel';
  startDate?: string;
  endDate?: string;
  productType?: string;
}

export interface ContractFilterParams {
  page?: number;
  limit?: number;
  productType?: string;
  status?: string;
  startDate?: string;
  endDate?: string;
  search?: string;
}

// =================== TEMPLATE TYPES ===================
export interface ContractTemplateCreate {
  name: string;
  description?: string;
  content: string;
  productTypes: string[];
  isActive: boolean;
}

export interface ContractTemplateUpdate extends Partial<ContractTemplateCreate> {}

export interface ContractTemplateFilter {
  page?: number;
  limit?: number;
  active?: boolean;
}

// =================== ENHANCED CONTRACT TYPES ===================
export interface EnhancedContractInitiate {
  templateId: string;
  recipients: Array<{
    name: string;
    email: string;
    role: 'signer' | 'cc' | 'witness';
  }>;
  variables?: Record<string, any>;
}

export interface EnhancedSignatureSession {
  sessionId: string;
  contractId: string;
  signerEmail: string;
}

export interface EvidenceData {
  type: 'pageview' | 'interaction' | 'device_info' | 'geolocation';
  data: Record<string, any>;
  timestamp: string;
}

export interface SignatureSubmission {
  signatureImage: string;
  agreed: boolean;
  ipAddress: string;
  userAgent: string;
  timestamp: string;
}

// =================== CONTRACT STATS TYPES ===================
export interface ContractStats {
  totalContracts: number;
  signedContracts: number;
  pendingContracts: number;
  monthlyStats: Array<{
    month: string;
    contracts: number;
    signed: number;
  }>;
  productBreakdown: Record<string, number>;
}

// =================== CONTRACT API SERVICE CLASS ===================
class ContractAPIService {
  private readonly baseEndpoint = '/contracts';

  // ===================== PUBLIC CONTRACT APIs (No Authentication) =====================

  /**
   * Get contracts by contact information (Public)
   */
  async getContractsByContact(contactData: ContractContact): Promise<ApiResponse> {
    try {
      const response = await ApiService.post<ApiResponse>(
        `${this.baseEndpoint}/get-by-contact`, 
        contactData, 
        false // No auth required
      );
      return response;
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * Create contract with contact (Public)
   */
  async createContractWithContact(contractData: ContractContactExtended): Promise<ApiResponse> {
    try {
      const response = await ApiService.post<ApiResponse>(
        `${this.baseEndpoint}/create-with-contact`, 
        contractData, 
        false // No auth required
      );
      return response;
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * Get guest contract (Public)
   */
  async getGuestContract(contractId: string): Promise<ApiResponse> {
    try {
      const response = await ApiService.get<ApiResponse>(
        `${this.baseEndpoint}/guest/${contractId}`, 
        false // No auth required
      );
      return response;
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * Get user contracts by email (Public POST)
   */
  async getContractsByEmail(emailData: PublicContractData): Promise<ApiResponse> {
    try {
      const response = await ApiService.post<ApiResponse>(
        `${this.baseEndpoint}/public/my-contracts`, 
        emailData, 
        false // No auth required
      );
      return response;
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * Get user contracts by email (Public GET)
   */
  async getContractsByEmailGet(email: string): Promise<ApiResponse> {
    try {
      const response = await ApiService.get<ApiResponse>(
        `${this.baseEndpoint}/public/my-contracts/${encodeURIComponent(email)}`, 
        false // No auth required
      );
      return response;
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * Get my contracts (Optional Auth)
   */
  async getMyContracts(): Promise<ApiResponse> {
    try {
      const response = await ApiService.get<ApiResponse>(
        `${this.baseEndpoint}/my-contracts`, 
        true // Auth optional
      );
      return response;
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * Get guest contracts by contact info (Public)
   */
  async getGuestContractsByContact(contactData: ContractContact): Promise<ApiResponse> {
    try {
      const response = await ApiService.post<ApiResponse>(
        `${this.baseEndpoint}/my-contracts/guest`, 
        contactData, 
        false // No auth required
      );
      return response;
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * Public contract signing (Public)
   */
  async signContractPublic(signingData: ContractSigningData): Promise<ApiResponse> {
    try {
      const response = await ApiService.post<ApiResponse>(
        `${this.baseEndpoint}/public/sign`, 
        signingData, 
        false // No auth required
      );
      return response;
    } catch (error) {
      return this.handleError(error);
    }
  }

  // ===================== PROTECTED CONTRACT APIs (Authentication Required) =====================

  /**
   * Get contract statistics (Protected)
   */
  async getContractStats(): Promise<ApiResponse<ContractStats>> {
    try {
      const response = await ApiService.get<ApiResponse<ContractStats>>(
        `${this.baseEndpoint}/stats`
      );
      return response;
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * Get all contracts with filters (Protected)
   */
  async getAllContracts(params?: ContractFilterParams): Promise<ApiResponse> {
    try {
      const queryString = params ? this.buildQueryString(params) : '';
      const response = await ApiService.get<ApiResponse>(
        `${this.baseEndpoint}${queryString}`
      );
      return response;
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * Get contract by ID (Protected)
   */
  async getContractById(contractId: string): Promise<ApiResponse> {
    try {
      const response = await ApiService.get<ApiResponse>(
        `${this.baseEndpoint}/${contractId}`
      );
      return response;
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * Update contract (Protected)
   */
  async updateContract(contractId: string, updateData: any): Promise<ApiResponse> {
    try {
      const response = await ApiService.put<ApiResponse>(
        `${this.baseEndpoint}/${contractId}`, 
        updateData
      );
      return response;
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * Delete contract (Protected)
   */
  async deleteContract(contractId: string): Promise<ApiResponse> {
    try {
      const response = await ApiService.delete<ApiResponse>(
        `${this.baseEndpoint}/${contractId}`
      );
      return response;
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * Generate contract PDF (Protected)
   */
  async generateContractPDF(contractId: string, templateType?: string): Promise<ApiResponse> {
    try {
      const response = await ApiService.post<ApiResponse>(
        `${this.baseEndpoint}/generate-pdf`, 
        { contractId, templateType }
      );
      return response;
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * Store signed contract (Protected)
   */
  async storeSignedContract(signingData: ContractSigningData): Promise<ApiResponse> {
    try {
      const response = await ApiService.post<ApiResponse>(
        `${this.baseEndpoint}/sign`, 
        signingData
      );
      return response;
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * Update payment status (Protected)
   */
  async updatePaymentStatus(contractId: string, paymentData: ContractPaymentUpdate): Promise<ApiResponse> {
    try {
      const response = await ApiService.put<ApiResponse>(
        `${this.baseEndpoint}/${contractId}/payment`, 
        paymentData
      );
      return response;
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * Get contract PDF URL (Protected)
   */
  async getContractPDFUrl(contractId: string): Promise<ApiResponse> {
    try {
      const response = await ApiService.get<ApiResponse>(
        `${this.baseEndpoint}/${contractId}/pdf`
      );
      return response;
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * Export contracts (Protected)
   */
  async exportContracts(params?: ContractExportParams): Promise<ApiResponse> {
    try {
      const queryString = params ? this.buildQueryString(params) : '';
      const response = await ApiService.get<ApiResponse>(
        `${this.baseEndpoint}/export${queryString}`
      );
      return response;
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * Get evidence packets (Protected)
   */
  async getEvidencePackets(): Promise<ApiResponse> {
    try {
      const response = await ApiService.get<ApiResponse>(
        `${this.baseEndpoint}/evidence`
      );
      return response;
    } catch (error) {
      return this.handleError(error);
    }
  }

  // ===================== CONTRACT TEMPLATE Management =====================

  /**
   * Get all templates (Protected)
   */
  async getTemplates(params?: ContractTemplateFilter): Promise<ApiResponse> {
    try {
      const queryString = params ? this.buildQueryString(params) : '';
      const response = await ApiService.get<ApiResponse>(
        `${this.baseEndpoint}/templates${queryString}`
      );
      return response;
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * Create template (Protected)
   */
  async createTemplate(templateData: ContractTemplateCreate): Promise<ApiResponse> {
    try {
      const response = await ApiService.post<ApiResponse>(
        `${this.baseEndpoint}/templates`, 
        templateData
      );
      return response;
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * Update template (Protected)
   */
  async updateTemplate(templateId: string, templateData: ContractTemplateUpdate): Promise<ApiResponse> {
    try {
      const response = await ApiService.put<ApiResponse>(
        `${this.baseEndpoint}/templates/${templateId}`, 
        templateData
      );
      return response;
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * Delete template (Protected)
   */
  async deleteTemplate(templateId: string): Promise<ApiResponse> {
    try {
      const response = await ApiService.delete<ApiResponse>(
        `${this.baseEndpoint}/templates/${templateId}`
      );
      return response;
    } catch (error) {
      return this.handleError(error);
    }
  }

  // ===================== ENHANCED CONTRACT APIs =====================

  /**
   * Get enhanced templates (Protected)
   */
  async getEnhancedTemplates(): Promise<ApiResponse> {
    try {
      const response = await ApiService.get<ApiResponse>(
        `${this.baseEndpoint}/enhanced/templates`
      );
      return response;
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * Create enhanced template (Protected)
   */
  async createEnhancedTemplate(templateData: any): Promise<ApiResponse> {
    try {
      const response = await ApiService.post<ApiResponse>(
        `${this.baseEndpoint}/enhanced/templates`, 
        templateData
      );
      return response;
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * Get template by ID (Protected)
   */
  async getEnhancedTemplateById(templateId: string): Promise<ApiResponse> {
    try {
      const response = await ApiService.get<ApiResponse>(
        `${this.baseEndpoint}/enhanced/templates/${templateId}`
      );
      return response;
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * Update enhanced template (Protected)
   */
  async updateEnhancedTemplate(templateId: string, templateData: any): Promise<ApiResponse> {
    try {
      const response = await ApiService.put<ApiResponse>(
        `${this.baseEndpoint}/enhanced/templates/${templateId}`, 
        templateData
      );
      return response;
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * Create template version (Protected)
   */
  async createTemplateVersion(templateId: string, versionData: any): Promise<ApiResponse> {
    try {
      const response = await ApiService.post<ApiResponse>(
        `${this.baseEndpoint}/enhanced/templates/${templateId}/versions`, 
        versionData
      );
      return response;
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * Approve template (Protected)
   */
  async approveTemplate(templateId: string): Promise<ApiResponse> {
    try {
      const response = await ApiService.post<ApiResponse>(
        `${this.baseEndpoint}/enhanced/templates/${templateId}/approve`, 
        {}
      );
      return response;
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * Publish template (Protected)
   */
  async publishTemplate(templateId: string): Promise<ApiResponse> {
    try {
      const response = await ApiService.post<ApiResponse>(
        `${this.baseEndpoint}/enhanced/templates/${templateId}/publish`, 
        {}
      );
      return response;
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * Get template statistics (Protected)
   */
  async getTemplateStatistics(templateId: string): Promise<ApiResponse> {
    try {
      const response = await ApiService.get<ApiResponse>(
        `${this.baseEndpoint}/enhanced/templates/${templateId}/statistics`
      );
      return response;
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * Clone template (Protected)
   */
  async cloneTemplate(templateId: string): Promise<ApiResponse> {
    try {
      const response = await ApiService.post<ApiResponse>(
        `${this.baseEndpoint}/enhanced/templates/${templateId}/clone`, 
        {}
      );
      return response;
    } catch (error) {
      return this.handleError(error);
    }
  }

  // ===================== CONTRACT SIGNING PROCESS =====================

  /**
   * Initiate contract signing (Protected)
   */
  async initiateContractSigning(initiateData: EnhancedContractInitiate): Promise<ApiResponse> {
    try {
      const response = await ApiService.post<ApiResponse>(
        `${this.baseEndpoint}/enhanced/initiate`, 
        initiateData
      );
      return response;
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * Get contract for signing (Public)
   */
  async getContractForSigning(contractId: string): Promise<ApiResponse> {
    try {
      const response = await ApiService.get<ApiResponse>(
        `${this.baseEndpoint}/enhanced/sign/${contractId}`, 
        false // No auth required
      );
      return response;
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * Start signing session (Public)
   */
  async startSigningSession(contractId: string, sessionData: EnhancedSignatureSession): Promise<ApiResponse> {
    try {
      const response = await ApiService.post<ApiResponse>(
        `${this.baseEndpoint}/enhanced/${contractId}/sign-session`, 
        sessionData, 
        false // No auth required
      );
      return response;
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * Collect evidence (Public)
   */
  async collectEvidence(contractId: string, evidenceData: EvidenceData): Promise<ApiResponse> {
    try {
      const response = await ApiService.post<ApiResponse>(
        `${this.baseEndpoint}/enhanced/${contractId}/evidence`, 
        evidenceData, 
        false // No auth required
      );
      return response;
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * Submit signature (Public)
   */
  async submitSignature(contractId: string, signatureData: SignatureSubmission): Promise<ApiResponse> {
    try {
      const response = await ApiService.post<ApiResponse>(
        `${this.baseEndpoint}/enhanced/${contractId}/signatures`, 
        signatureData, 
        false // No auth required
      );
      return response;
    } catch (error) {
      return this.handleError(error);
    }
  }

  // ===================== EVIDENCE & COMPLIANCE =====================

  /**
   * Generate evidence package (Protected)
   */
  async generateEvidencePackage(contractId: string): Promise<ApiResponse> {
    try {
      const response = await ApiService.post<ApiResponse>(
        `${this.baseEndpoint}/enhanced/${contractId}/evidence-package`, 
        {}
      );
      return response;
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * Download evidence (Protected)
   */
  async downloadEvidence(contractId: string): Promise<ApiResponse> {
    try {
      const response = await ApiService.get<ApiResponse>(
        `${this.baseEndpoint}/enhanced/${contractId}/download-package`
      );
      return response;
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * Get completion certificate (Protected)
   */
  async getCompletionCertificate(contractId: string): Promise<ApiResponse> {
    try {
      const response = await ApiService.get<ApiResponse>(
        `${this.baseEndpoint}/enhanced/${contractId}/certificate`
      );
      return response;
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * Get audit trail (Protected)
   */
  async getAuditTrail(contractId: string): Promise<ApiResponse> {
    try {
      const response = await ApiService.get<ApiResponse>(
        `${this.baseEndpoint}/enhanced/${contractId}/audit-trail`
      );
      return response;
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * Verify evidence integrity (Public)
   */
  async verifyEvidenceIntegrity(contractId: string, hash: string): Promise<ApiResponse> {
    try {
      const response = await ApiService.get<ApiResponse>(
        `${this.baseEndpoint}/enhanced/${contractId}/verify/${hash}`, 
        false // No auth required
      );
      return response;
    } catch (error) {
      return this.handleError(error);
    }
  }

  // ===================== SEARCH & ANALYTICS =====================

  /**
   * Advanced contract search (Protected)
   */
  async searchContracts(searchQuery: string, filters?: any): Promise<ApiResponse> {
    try {
      const queryParams = { search: searchQuery, ...filters };
      const queryString = this.buildQueryString(queryParams);
      const response = await ApiService.get<ApiResponse>(
        `${this.baseEndpoint}/enhanced/search${queryString}`
      );
      return response;
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * Get analytics dashboard (Protected)
   */
  async getAnalyticsDashboard(): Promise<ApiResponse> {
    try {
      const response = await ApiService.get<ApiResponse>(
        `${this.baseEndpoint}/enhanced/analytics/dashboard`
      );
      return response;
    } catch (error) {
      return this.handleError(error);
    }
  }

  // ===================== ADMIN CONTROLS =====================

  /**
   * Void contract (Admin only)
   */
  async voidContract(contractId: string, reason: string): Promise<ApiResponse> {
    try {
      const response = await ApiService.post<ApiResponse>(
        `${this.baseEndpoint}/enhanced/${contractId}/void`, 
        { reason }
      );
      return response;
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * Resend contract (Admin only)
   */
  async resendContract(contractId: string): Promise<ApiResponse> {
    try {
      const response = await ApiService.post<ApiResponse>(
        `${this.baseEndpoint}/enhanced/${contractId}/resend`, 
        {}
      );
      return response;
    } catch (error) {
      return this.handleError(error);
    }
  }

  // ===================== INTEGRATION WEBHOOKS =====================

  /**
   * Handle provider webhooks (Public)
   */
  async handleProviderWebhook(provider: string, webhookData: any): Promise<ApiResponse> {
    try {
      const response = await ApiService.post<ApiResponse>(
        `${this.baseEndpoint}/enhanced/webhooks/${provider}`, 
        webhookData, 
        false // No auth required
      );
      return response;
    } catch (error) {
      return this.handleError(error);
    }
  }

  // ===================== HELPER METHODS =====================

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
  private handleError(error: any): ApiResponse {
    console.error('Contract API Error:', error);
    
    if (error instanceof Error) {
      return {
        success: false,
        error: error.message,
        message: 'Contract operation failed'
      };
    }
    
    if (typeof error === 'string') {
      return {
        success: false,
        error: error,
        message: 'Contract operation failed'
      };
    }
    
    if (error?.message) {
      return {
        success: false,
        error: error.message,
        message: 'Contract operation failed'
      };
    }
    
    return {
      success: false,
      error: 'An unexpected error occurred',
      message: 'Contract operation failed'
    };
  }
}

// Export singleton instance
export default new ContractAPIService();