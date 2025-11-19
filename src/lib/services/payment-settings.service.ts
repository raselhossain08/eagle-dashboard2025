import ApiService from './shared/api.service';

// Types
export interface PayPalSettings {
    enabled: boolean;
    mode: 'sandbox' | 'live';
    clientId: string;
    clientSecret: string;
    apiUrl?: string;
    configured: boolean;
}

export interface StripeSettings {
    enabled: boolean;
    mode: 'test' | 'live';
    publishableKey: string;
    secretKey: string;
    webhookSecret: string;
    configured: boolean;
}

export interface PaymentSettings {
    paypal: PayPalSettings;
    stripe: StripeSettings;
    lastUpdated?: string;
}

export interface ApiResponse<T> {
    success: boolean;
    data: T;
    message?: string;
}

export interface TestConnectionResponse {
    success: boolean;
    message: string;
    data?: {
        mode?: string;
        status?: string;
        accountId?: string;
    };
}

/**
 * Payment Settings Service
 * Handles all payment gateway configuration operations
 */
class PaymentSettingsService {
    private baseUrl = '/payment-settings';

    /**
     * Get current payment settings from database
     */
    async getSettings(): Promise<ApiResponse<PaymentSettings>> {
        return ApiService.get<ApiResponse<PaymentSettings>>(this.baseUrl);
    }

    /**
     * Update payment gateway settings
     * @param settings - Updated payment settings
     */
    async updateSettings(settings: PaymentSettings): Promise<ApiResponse<PaymentSettings>> {
        return ApiService.put<ApiResponse<PaymentSettings>>(this.baseUrl, settings);
    }

    /**
     * Test payment gateway connection
     * @param provider - 'paypal' or 'stripe'
     */
    async testConnection(provider: 'paypal' | 'stripe'): Promise<TestConnectionResponse> {
        return ApiService.post<TestConnectionResponse>(`${this.baseUrl}/test/${provider}`);
    }

    /**
     * Update PayPal settings only
     * @param paypalSettings - PayPal configuration
     */
    async updatePayPalSettings(paypalSettings: Partial<PayPalSettings>): Promise<ApiResponse<PaymentSettings>> {
        const currentSettings = await this.getSettings();
        const updatedSettings: PaymentSettings = {
            ...currentSettings.data,
            paypal: {
                ...currentSettings.data.paypal,
                ...paypalSettings
            }
        };
        return this.updateSettings(updatedSettings);
    }

    /**
     * Update Stripe settings only
     * @param stripeSettings - Stripe configuration
     */
    async updateStripeSettings(stripeSettings: Partial<StripeSettings>): Promise<ApiResponse<PaymentSettings>> {
        const currentSettings = await this.getSettings();
        const updatedSettings: PaymentSettings = {
            ...currentSettings.data,
            stripe: {
                ...currentSettings.data.stripe,
                ...stripeSettings
            }
        };
        return this.updateSettings(updatedSettings);
    }

    /**
     * Enable or disable a payment gateway
     * @param provider - 'paypal' or 'stripe'
     * @param enabled - true to enable, false to disable
     */
    async toggleGateway(provider: 'paypal' | 'stripe', enabled: boolean): Promise<ApiResponse<PaymentSettings>> {
        if (provider === 'paypal') {
            return this.updatePayPalSettings({ enabled });
        } else {
            return this.updateStripeSettings({ enabled });
        }
    }

    /**
     * Switch payment gateway mode (sandbox/test or live/production)
     * @param provider - 'paypal' or 'stripe'
     * @param mode - Mode to switch to
     */
    async switchMode(
        provider: 'paypal' | 'stripe',
        mode: 'sandbox' | 'live' | 'test'
    ): Promise<ApiResponse<PaymentSettings>> {
        if (provider === 'paypal') {
            return this.updatePayPalSettings({ mode: mode as 'sandbox' | 'live' });
        } else {
            return this.updateStripeSettings({ mode: mode as 'test' | 'live' });
        }
    }

    /**
     * Validate payment settings before saving
     * @param settings - Settings to validate
     */
    validateSettings(settings: PaymentSettings): { valid: boolean; errors: string[] } {
        const errors: string[] = [];

        // Validate PayPal
        if (settings.paypal.enabled) {
            if (!settings.paypal.clientId || settings.paypal.clientId.length < 10) {
                errors.push('PayPal Client ID is required and must be valid');
            }
            if (!settings.paypal.clientSecret || settings.paypal.clientSecret.length < 10) {
                errors.push('PayPal Client Secret is required and must be valid');
            }
        }

        // Validate Stripe
        if (settings.stripe.enabled) {
            if (!settings.stripe.publishableKey || !settings.stripe.publishableKey.startsWith('pk_')) {
                errors.push('Stripe Publishable Key is required and must start with "pk_"');
            }
            if (!settings.stripe.secretKey || !settings.stripe.secretKey.startsWith('sk_') && !settings.stripe.secretKey.startsWith('rk_')) {
                errors.push('Stripe Secret Key is required and must start with "sk_" or "rk_"');
            }
        }

        return {
            valid: errors.length === 0,
            errors
        };
    }

    /**
     * Get default/empty settings
     */
    getDefaultSettings(): PaymentSettings {
        return {
            paypal: {
                enabled: false,
                mode: 'sandbox',
                clientId: '',
                clientSecret: '',
                configured: false
            },
            stripe: {
                enabled: false,
                mode: 'test',
                publishableKey: '',
                secretKey: '',
                webhookSecret: '',
                configured: false
            }
        };
    }
}

// Export singleton instance
export const paymentSettingsService = new PaymentSettingsService();
export default paymentSettingsService;
