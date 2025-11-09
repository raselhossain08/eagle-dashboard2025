// lib/services/admin/two-factor.service.ts

import { apiClient } from '../shared/api-client'

export interface TwoFactorSetupResponse {
  secret: string;
  qrCode: string;
  backupCodes: string[];
  manualEntryKey: string;
}

export interface TwoFactorStatusResponse {
  isEnabled: boolean;
  hasBackupCodes: boolean;
  backupCodesCount: number;
  lastUsed?: string;
  enrolledDevices?: string[];
}

export interface BackupCodesResponse {
  backupCodes: string[];
  generatedAt: string;
}

export interface EmergencyAccessResponse {
  accessToken: string;
  expiresAt: string;
  restrictions: string[];
}

export class TwoFactorService {
  /**
   * Get 2FA status for current user
   */
  async getStatus(): Promise<TwoFactorStatusResponse> {
    const response = await apiClient.get<{ success: boolean; data: TwoFactorStatusResponse }>('/rbac/two-factor/status');
    return response.data.data;
  }

  /**
   * Setup 2FA - Generate secret and QR code
   */
  async setup(): Promise<TwoFactorSetupResponse> {
    const response = await apiClient.post<{ success: boolean; data: TwoFactorSetupResponse }>('/rbac/two-factor/setup');
    return response.data.data;
  }

  /**
   * Enable 2FA with token verification
   */
  async enable(token: string): Promise<{ backupCodes: string[] }> {
    const response = await apiClient.post<{ success: boolean; data: { backupCodes: string[] } }>('/rbac/two-factor/enable', {
      token
    });
    return response.data.data;
  }

  /**
   * Disable 2FA with password and token
   */
  async disable(password: string, token: string): Promise<void> {
    await apiClient.post('/rbac/two-factor/disable', {
      password,
      token
    });
  }

  /**
   * Verify 2FA token
   */
  async verify(token: string): Promise<{ valid: boolean; remainingAttempts?: number }> {
    const response = await apiClient.post<{ success: boolean; data: { valid: boolean; remainingAttempts?: number } }>('/rbac/two-factor/verify', {
      token
    });
    return response.data.data;
  }

  /**
   * Generate new backup codes
   */
  async generateBackupCodes(): Promise<BackupCodesResponse> {
    const response = await apiClient.post<{ success: boolean; data: BackupCodesResponse }>('/rbac/two-factor/backup-codes/generate');
    return response.data.data;
  }

  /**
   * Download backup codes as file
   */
  async downloadBackupCodes(): Promise<Blob> {
    // Access the underlying axios client for custom headers
    const client = (apiClient as any).client;
    const token = typeof window !== 'undefined' ? 
      document.cookie.split(';').find(c => c.trim().startsWith('admin_token='))?.split('=')[1] : 
      null;

    const response = await client.get('/rbac/two-factor/backup-codes/download', {
      responseType: 'blob',
      headers: {
        'Authorization': token ? `Bearer ${token}` : '',
      }
    });
    return response.data as Blob;
  }

  /**
   * Request emergency access
   */
  async requestEmergencyAccess(reason: string, userInfo: any): Promise<EmergencyAccessResponse> {
    const response = await apiClient.post<{ success: boolean; data: EmergencyAccessResponse }>('/rbac/two-factor/emergency-access', {
      reason,
      userInfo
    });
    return response.data.data;
  }

  /**
   * Get 2FA recovery information
   */
  async getRecoveryInfo(): Promise<{
    hasRecoveryEmail: boolean;
    recoveryEmail?: string;
    hasBackupCodes: boolean;
    backupCodesCount: number;
  }> {
    const response = await apiClient.get<{ success: boolean; data: any }>('/rbac/two-factor/recovery');
    return response.data.data;
  }

  /**
   * Update recovery email
   */
  async updateRecoveryEmail(email: string, password: string): Promise<void> {
    await apiClient.post('/rbac/two-factor/recovery/email', {
      email,
      password
    });
  }

  /**
   * Test 2FA setup (validate secret without enabling)
   */
  async testSetup(secret: string, token: string): Promise<{ valid: boolean }> {
    const response = await apiClient.post<{ success: boolean; data: { valid: boolean } }>('/rbac/two-factor/test', {
      secret,
      token
    });
    return response.data.data;
  }

  /**
   * Get 2FA settings and preferences
   */
  async getSettings(): Promise<{
    requireFor: string[];
    rememberDevice: boolean;
    trustedDevices: any[];
  }> {
    const response = await apiClient.get<{ success: boolean; data: any }>('/rbac/two-factor/settings');
    return response.data.data;
  }

  /**
   * Update 2FA settings
   */
  async updateSettings(settings: {
    requireFor?: string[];
    rememberDevice?: boolean;
  }): Promise<void> {
    await apiClient.put('/rbac/two-factor/settings', settings);
  }

  /**
   * Remove trusted device
   */
  async removeTrustedDevice(deviceId: string): Promise<void> {
    await apiClient.delete(`/rbac/two-factor/trusted-devices/${deviceId}`);
  }

  /**
   * Clear all trusted devices
   */
  async clearAllTrustedDevices(): Promise<void> {
    await apiClient.delete('/rbac/two-factor/trusted-devices');
  }
}

export const twoFactorService = new TwoFactorService();