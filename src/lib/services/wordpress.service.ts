export interface WPConfig {
    url: string;
    apiKey: string;
}

export type WPEndpoint = 'customers' | 'orders' | 'subscriptions' | 'analytics' | 'payment-methods' | 'coupons';

export interface WPResponse<T = any> {
    success: boolean;
    data: T;
    timestamp?: string;
    metadata?: {
        source: string;
        wpUrl: string;
        lastSynced: string;
        itemCount: number;
    };
}

export class WordPressService {
    private config: WPConfig | null = null;
    private backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

    constructor() {
        this.loadConfig();
    }

    setConfig(config: WPConfig) {
        this.config = config;
        if (typeof window !== 'undefined') {
            localStorage.setItem('wp_config', JSON.stringify(config));
        }
    }

    getConfig(): WPConfig | null {
        return this.config;
    }

    private loadConfig() {
        if (typeof window !== 'undefined') {
            const stored = localStorage.getItem('wp_config');
            if (stored) {
                try {
                    this.config = JSON.parse(stored);
                } catch {
                    this.config = null;
                }
            }
        }
    }

    clearConfig() {
        this.config = null;
        if (typeof window !== 'undefined') {
            localStorage.removeItem('wp_config');
        }
    }

    private getAuthToken(): string | null {
        if (typeof window !== 'undefined') {
            return localStorage.getItem('token');
        }
        return null;
    }

    private getHeaders(): HeadersInit {
        const token = this.getAuthToken();
        const headers: HeadersInit = {
            'Content-Type': 'application/json',
        };

        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        return headers;
    }

    private buildBackendUrl(path: string): string {
        return `${this.backendUrl}/wordpress${path}`;
    }

    // Sync data from WordPress to backend database
    async syncEndpoint(endpoint: WPEndpoint): Promise<WPResponse> {
        if (!this.config) {
            throw new Error('WordPress configuration not set');
        }

        try {
            const url = this.buildBackendUrl(`/sync/${endpoint}`);
            const response = await fetch(url, {
                method: 'POST',
                headers: this.getHeaders(),
                body: JSON.stringify({
                    wpUrl: this.config.url,
                    apiKey: this.config.apiKey
                }),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error(`Error syncing ${endpoint}:`, error);
            throw error;
        }
    }

    // Sync all endpoints at once
    async syncAllEndpoints(): Promise<WPResponse> {
        if (!this.config) {
            throw new Error('WordPress configuration not set');
        }

        try {
            const url = this.buildBackendUrl('/sync-all');
            const response = await fetch(url, {
                method: 'POST',
                headers: this.getHeaders(),
                body: JSON.stringify({
                    wpUrl: this.config.url,
                    apiKey: this.config.apiKey
                }),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error syncing all endpoints:', error);
            throw error;
        }
    }

    // Fetch data from backend (already synced data)
    async fetchEndpoint<T = any>(endpoint: WPEndpoint): Promise<WPResponse<T>> {
        try {
            const url = this.buildBackendUrl(`/${endpoint}`);
            const response = await fetch(url, {
                method: 'GET',
                headers: this.getHeaders(),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            return data;
        } catch (error) {
            console.error(`Error fetching ${endpoint}:`, error);
            throw error;
        }
    }

    // Get status of all endpoints
    async getEndpointsStatus(): Promise<WPResponse> {
        try {
            const url = this.buildBackendUrl('/status/all');
            const response = await fetch(url, {
                method: 'GET',
                headers: this.getHeaders(),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error fetching endpoints status:', error);
            throw error;
        }
    }

    async testConnection(): Promise<boolean> {
        if (!this.config) {
            throw new Error('WordPress configuration not set');
        }

        try {
            const url = this.buildBackendUrl('/test-connection');
            const response = await fetch(url, {
                method: 'POST',
                headers: this.getHeaders(),
                body: JSON.stringify({
                    wpUrl: this.config.url,
                    apiKey: this.config.apiKey
                }),
            });

            if (!response.ok) {
                return false;
            }

            const data = await response.json();
            return data.success;
        } catch {
            return false;
        }
    }

    // Specific methods for each endpoint
    async getCustomers() {
        return this.fetchEndpoint('customers');
    }

    async getOrders() {
        return this.fetchEndpoint('orders');
    }

    async getSubscriptions() {
        return this.fetchEndpoint('subscriptions');
    }

    async getAnalytics() {
        return this.fetchEndpoint('analytics');
    }

    async getPaymentMethods() {
        return this.fetchEndpoint('payment-methods');
    }

    async getCoupons() {
        return this.fetchEndpoint('coupons');
    }
}

// Singleton instance
export const wpService = new WordPressService();
