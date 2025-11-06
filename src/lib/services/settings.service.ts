import ApiService from './shared/api.service';

export interface NotificationSettings {
    emailNotifications: boolean;
    pushNotifications: boolean;
    smsNotifications: boolean;
    weeklyReport: boolean;
    monthlyReport: boolean;
    securityAlerts: boolean;
    productUpdates: boolean;
    newsletter: boolean;
}

export interface PrivacySettings {
    profileVisibility: 'public' | 'private' | 'friends';
    showEmail: boolean;
    showActivity: boolean;
    allowMessages: boolean;
}

export interface SecuritySettings {
    twoFactorEnabled: boolean;
    sessionTimeout: string;
    loginAlerts: boolean;
}

export interface UserSettings {
    notifications: NotificationSettings;
    privacy: PrivacySettings;
    security: SecuritySettings;
    theme?: 'light' | 'dark' | 'system';
    language?: string;
    timezone?: string;
}

class SettingsService {
    /**
     * Get all user settings
     */
    async getSettings(): Promise<UserSettings> {
        try {
            const response = await ApiService.get<{ success: boolean; settings: UserSettings }>(
                '/admin/settings'
            );
            return response.settings || this.getDefaultSettings();
        } catch (error) {
            console.error('Error fetching settings:', error);
            return this.getDefaultSettings();
        }
    }

    /**
     * Update notification settings
     */
    async updateNotificationSettings(settings: NotificationSettings): Promise<boolean> {
        try {
            await ApiService.put('/admin/settings/notifications', settings);
            return true;
        } catch (error) {
            console.error('Error updating notification settings:', error);
            throw error;
        }
    }

    /**
     * Update privacy settings
     */
    async updatePrivacySettings(settings: PrivacySettings): Promise<boolean> {
        try {
            await ApiService.put('/admin/settings/privacy', settings);
            return true;
        } catch (error) {
            console.error('Error updating privacy settings:', error);
            throw error;
        }
    }

    /**
     * Update security settings
     */
    async updateSecuritySettings(settings: SecuritySettings): Promise<boolean> {
        try {
            await ApiService.put('/admin/settings/security', settings);
            return true;
        } catch (error) {
            console.error('Error updating security settings:', error);
            throw error;
        }
    }

    /**
     * Enable/Disable Two-Factor Authentication
     */
    async toggleTwoFactor(enable: boolean, code?: string): Promise<{ success: boolean; qrCode?: string }> {
        try {
            const response = await ApiService.post<{ success: boolean; qrCode?: string }>(
                '/admin/settings/2fa',
                { enable, code }
            );
            return response;
        } catch (error) {
            console.error('Error toggling 2FA:', error);
            throw error;
        }
    }

    /**
     * Change password
     */
    async changePassword(currentPassword: string, newPassword: string): Promise<boolean> {
        try {
            await ApiService.post('/admin/settings/change-password', {
                currentPassword,
                newPassword,
            });
            return true;
        } catch (error) {
            console.error('Error changing password:', error);
            throw error;
        }
    }

    /**
     * Export user data
     */
    async exportData(): Promise<Blob> {
        try {
            const response = await ApiService.get('/admin/settings/export-data', true);
            return response as Blob;
        } catch (error) {
            console.error('Error exporting data:', error);
            throw error;
        }
    }

    /**
     * Delete account
     */
    async deleteAccount(password: string, reason?: string): Promise<boolean> {
        try {
            await ApiService.post('/admin/settings/delete-account', {
                password,
                reason,
            });
            return true;
        } catch (error) {
            console.error('Error deleting account:', error);
            throw error;
        }
    }

    /**
     * Get active sessions
     */
    async getActiveSessions(): Promise<any[]> {
        try {
            const response = await ApiService.get<{ success: boolean; sessions: any[] }>(
                '/admin/settings/sessions'
            );
            return response.sessions || [];
        } catch (error) {
            console.error('Error fetching sessions:', error);
            return [];
        }
    }

    /**
     * Revoke session
     */
    async revokeSession(sessionId: string): Promise<boolean> {
        try {
            await ApiService.delete(`/admin/settings/sessions/${sessionId}`);
            return true;
        } catch (error) {
            console.error('Error revoking session:', error);
            throw error;
        }
    }

    /**
     * Get default settings
     */
    private getDefaultSettings(): UserSettings {
        return {
            notifications: {
                emailNotifications: true,
                pushNotifications: true,
                smsNotifications: false,
                weeklyReport: true,
                monthlyReport: false,
                securityAlerts: true,
                productUpdates: false,
                newsletter: true,
            },
            privacy: {
                profileVisibility: 'public',
                showEmail: false,
                showActivity: true,
                allowMessages: true,
            },
            security: {
                twoFactorEnabled: false,
                sessionTimeout: '30',
                loginAlerts: true,
            },
            theme: 'system',
            language: 'en',
            timezone: 'UTC',
        };
    }
}

export default new SettingsService();
