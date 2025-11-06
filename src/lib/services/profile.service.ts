import ApiService from './shared/api.service';

export interface ProfileData {
    fullName: string;
    email: string;
    phone?: string;
    bio?: string;
    company?: string;
    location?: string;
    website?: string;
    position?: string;
    avatar?: string;
    profilePicture?: string;
}

export interface ProfileResponse {
    success: boolean;
    profile: ProfileData;
    user?: any;
}

class ProfileService {
    /**
     * Get user profile
     */
    async getProfile(): Promise<ProfileData> {
        try {
            const response = await ApiService.get<{ success: boolean; data: any }>('/admin/profile');
            const data = response.data || {};
            return {
                fullName: data.fullName || '',
                email: data.email || '',
                phone: data.phone || '',
                bio: data.bio || '',
                company: data.company || '',
                location: data.location || '',
                website: data.website || '',
                position: data.position || '',
                avatar: data.profilePicture || data.avatar || '',
                profilePicture: data.profilePicture || data.avatar || '',
            };
        } catch (error) {
            console.error('Error fetching profile:', error);
            throw error;
        }
    }

    /**
     * Update user profile
     */
    async updateProfile(data: Partial<ProfileData>): Promise<ProfileData> {
        try {
            const response = await ApiService.put<ProfileResponse>('/admin/profile', data);
            return response.profile || response.user || {};
        } catch (error) {
            console.error('Error updating profile:', error);
            throw error;
        }
    }

    /**
     * Upload profile picture
     */
    async uploadAvatar(file: File): Promise<string> {
        try {
            const formData = new FormData();
            formData.append('avatar', file);

            const response = await ApiService.postFormData<{ success: boolean; data: { profilePicture: string } }>(
                '/admin/profile/avatar',
                formData
            );

            return response.data.profilePicture;
        } catch (error) {
            console.error('Error uploading avatar:', error);
            throw error;
        }
    }

    /**
     * Change password
     */
    async changePassword(currentPassword: string, newPassword: string): Promise<boolean> {
        try {
            await ApiService.post('/admin/profile/change-password', {
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
     * Get account stats
     */
    async getAccountStats(): Promise<any> {
        try {
            const response = await ApiService.get<{ success: boolean; stats: any }>(
                '/admin/profile/stats'
            );
            return response.stats || {};
        } catch (error) {
            console.error('Error fetching account stats:', error);
            return {
                totalActions: 0,
                activeSessions: 0,
                lastLogin: new Date().toISOString(),
            };
        }
    }

    /**
     * Get activity log
     */
    async getActivityLog(limit: number = 10): Promise<any[]> {
        try {
            const response = await ApiService.get<{ success: boolean; activities: any[] }>(
                `/admin/profile/activity?limit=${limit}`
            );
            return response.activities || [];
        } catch (error) {
            console.error('Error fetching activity log:', error);
            return [];
        }
    }
}

export default new ProfileService();
