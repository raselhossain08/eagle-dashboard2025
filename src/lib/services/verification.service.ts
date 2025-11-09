import ApiService from './shared/api.service';

export interface VerificationSettings {
    _id: string;
    emailVerification: {
        enabled: boolean;
        required: boolean;
        tokenExpiry: number;
        resendCooldown: number;
        maxAttempts: number;
        autoSendOnRegister: boolean;
    };
    emailTemplate: {
        subject: string;
        fromName: string;
        fromEmail: string;
        logoUrl: string;
        buttonText: string;
        buttonColor: string;
        footerText: string;
    };
    phoneVerification: {
        enabled: boolean;
        required: boolean;
        provider: 'twilio' | 'nexmo' | 'aws-sns';
    };
    security: {
        blockDisposableEmails: boolean;
        captchaOnResend: boolean;
        ipRateLimit: {
            enabled: boolean;
            maxRequests: number;
        };
    };
    updatedBy?: string;
    lastUpdated: string;
    createdAt: string;
    updatedAt: string;
}

export interface VerificationStatus {
    email: string;
    verified: boolean;
    verifiedAt: string | null;
    pendingVerification: {
        email: string;
        expiresAt: string;
        attempts: number;
        sentAt: string;
    } | null;
}

export interface VerificationAttempt {
    _id: string;
    userId: {
        _id: string;
        name: string;
        email: string;
    };
    email: string;
    token: string;
    expiresAt: string;
    verifiedAt: string | null;
    attempts: number;
    lastAttemptAt: string | null;
    ipAddress: string;
    userAgent: string;
    createdAt: string;
    updatedAt: string;
}

export interface ApiResponse<T = any> {
    success: boolean;
    message?: string;
    data?: T;
    error?: string;
    count?: number;
    remainingTime?: number;
}

class VerificationService {
    private readonly baseUrl = '/verification';

    // Send verification email
    async sendVerificationEmail(): Promise<ApiResponse> {
        return ApiService.post(`${this.baseUrl}/send`, {});
    }

    // Verify email with token (public endpoint)
    async verifyEmail(token: string): Promise<ApiResponse> {
        return ApiService.post(`${this.baseUrl}/verify/${token}`, {});
    }

    // Resend verification email
    async resendVerificationEmail(): Promise<ApiResponse> {
        return ApiService.post(`${this.baseUrl}/resend`, {});
    }

    // Get verification status
    async getVerificationStatus(): Promise<ApiResponse<VerificationStatus>> {
        return ApiService.get(`${this.baseUrl}/status`);
    }

    // Get verification settings (admin only)
    async getVerificationSettings(): Promise<ApiResponse<VerificationSettings>> {
        return ApiService.get(`${this.baseUrl}/settings`);
    }

    // Update verification settings (admin only)
    async updateVerificationSettings(
        settings: Partial<VerificationSettings>
    ): Promise<ApiResponse<VerificationSettings>> {
        return ApiService.put(`${this.baseUrl}/settings`, settings);
    }

    // Get recent verification attempts (admin only)
    async getRecentAttempts(
        limit: number = 50,
        status: 'all' | 'verified' | 'pending' | 'expired' = 'all'
    ): Promise<ApiResponse<VerificationAttempt[]>> {
        return ApiService.get(`${this.baseUrl}/attempts?limit=${limit}&status=${status}`);
    }
}

export const verificationService = new VerificationService();
