// Subscriber Profile Service
import ApiService from '../shared/api.service';

export interface SubscriberProfile {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  dateOfBirth?: Date;
  address: Address;
  kycStatus: KycStatus;
  identityDocuments: IdentityDocument[];
  preferences: ProfilePreferences;
  metadata: any;
  createdAt: Date;
  updatedAt: Date;
}

export interface Address {
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

export interface IdentityDocument {
  id: string;
  type: DocumentType;
  documentNumber: string;
  issueDate: Date;
  expiryDate?: Date;
  issuingAuthority: string;
  status: DocumentStatus;
  fileUrl?: string;
  verifiedAt?: Date;
}

export interface ProfilePreferences {
  language: string;
  timezone: string;
  currency: string;
  notifications: NotificationPreferences;
  privacy: PrivacyPreferences;
}

export interface NotificationPreferences {
  email: boolean;
  sms: boolean;
  push: boolean;
  marketing: boolean;
}

export interface PrivacyPreferences {
  profileVisibility: 'public' | 'private' | 'contacts';
  dataSharing: boolean;
  analytics: boolean;
}

export enum KycStatus {
  NOT_STARTED = 'not_started',
  PENDING = 'pending',
  UNDER_REVIEW = 'under_review',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  EXPIRED = 'expired'
}

export enum DocumentType {
  PASSPORT = 'passport',
  DRIVERS_LICENSE = 'drivers_license',
  NATIONAL_ID = 'national_id',
  UTILITY_BILL = 'utility_bill',
  BANK_STATEMENT = 'bank_statement'
}

export enum DocumentStatus {
  PENDING = 'pending',
  VERIFIED = 'verified',
  REJECTED = 'rejected',
  EXPIRED = 'expired'
}

export interface UpdateKycStatusData {
  status: KycStatus;
  reason?: string;
  notes?: string;
}

export interface CreateIdentityDocumentData {
  type: DocumentType;
  documentNumber: string;
  issueDate: Date;
  expiryDate?: Date;
  issuingAuthority: string;
  file?: File;
}

export interface ProfileAnalytics {
  totalProfiles: number;
  verifiedProfiles: number;
  pendingVerification: number;
  kycStatusDistribution: Array<{
    status: KycStatus;
    count: number;
    percentage: number;
  }>;
  documentStatusDistribution: Array<{
    status: DocumentStatus;
    count: number;
    percentage: number;
  }>;
  geographicDistribution: Array<{
    country: string;
    count: number;
    percentage: number;
  }>;
}

class SubscriberProfileService {
  private readonly endpoint = '/subscriber-profiles';

  async getProfiles(filters: {
    kycStatus?: KycStatus;
    country?: string;
    page?: number;
    limit?: number;
    search?: string;
  } = {}): Promise<{
    profiles: SubscriberProfile[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined) {
        params.append(key, value.toString());
      }
    });

    return ApiService.get(`${this.endpoint}?${params.toString()}`);
  }

  async getProfileById(id: string): Promise<SubscriberProfile> {
    return ApiService.get(`${this.endpoint}/${id}`);
  }

  async getProfileByUserId(userId: string): Promise<SubscriberProfile> {
    return ApiService.get(`${this.endpoint}/user/${userId}`);
  }

  async updateProfile(id: string, data: Partial<SubscriberProfile>): Promise<SubscriberProfile> {
    return ApiService.put(`${this.endpoint}/${id}`, data);
  }

  async updateKycStatus(id: string, data: UpdateKycStatusData): Promise<SubscriberProfile> {
    return ApiService.put(`${this.endpoint}/${id}/kyc-status`, data);
  }

  async addIdentityDocument(profileId: string, data: CreateIdentityDocumentData): Promise<IdentityDocument> {
    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined) {
        if (key === 'file' && value instanceof File) {
          formData.append(key, value);
        } else {
          formData.append(key, value.toString());
        }
      }
    });

    return ApiService.postFormData(`${this.endpoint}/${profileId}/documents`, formData);
  }

  async verifyDocument(profileId: string, documentId: string): Promise<IdentityDocument> {
    return ApiService.post(`${this.endpoint}/${profileId}/documents/${documentId}/verify`);
  }

  async rejectDocument(profileId: string, documentId: string, reason: string): Promise<IdentityDocument> {
    return ApiService.post(`${this.endpoint}/${profileId}/documents/${documentId}/reject`, { reason });
  }

  async deleteDocument(profileId: string, documentId: string): Promise<void> {
    return ApiService.delete(`${this.endpoint}/${profileId}/documents/${documentId}`);
  }

  async getAnalytics(): Promise<ProfileAnalytics> {
    return ApiService.get(`${this.endpoint}/analytics`);
  }

  async exportProfiles(filters: {
    kycStatus?: KycStatus;
    country?: string;
    format?: 'csv' | 'xlsx';
  } = {}): Promise<Blob> {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined) {
        params.append(key, value.toString());
      }
    });

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}${this.endpoint}/export?${params.toString()}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${ApiService.getToken()}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to export profiles');
    }

    return response.blob();
  }

  async bulkUpdateKycStatus(profileIds: string[], data: UpdateKycStatusData): Promise<{ updated: number; errors: string[] }> {
    return ApiService.post(`${this.endpoint}/bulk/kyc-status`, {
      profileIds,
      ...data
    });
  }
}

export const subscriberProfileService = new SubscriberProfileService();
export default subscriberProfileService;