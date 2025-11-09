import ApiService from './shared/api.service';

export interface Webhook {
    _id?: string;
    id?: string;
    name: string;
    url: string;
    events: string[];
    enabled: boolean;
    status: string;
    retryPolicy: string;
    maxRetries: number;
    timeout: number;
    secret?: string;
    verifySsl?: boolean;
    authHeaders?: { name: string; value: string }[];
    lastDelivery?: string | null;
    deliveryStats?: {
        total: number;
        successful: number;
        failed: number;
    };
}

export interface WebhookDelivery {
    _id: string;
    webhookId: string;
    event: string;
    payload: any;
    statusCode: number;
    response?: string;
    error?: string;
    duration: number;
    success: boolean;
    attempt: number;
    deliveredAt: string;
}

export interface WebhookTestPayload {
    event?: string;
    payload?: any;
}

export interface ApiResponse<T> {
    success: boolean;
    message?: string;
    data: T;
}

class WebhookService {
    private static readonly BASE_PATH = '/webhooks';

    /**
     * Fetch all webhooks
     */
    static async getWebhooks(): Promise<ApiResponse<Webhook[]>> {
        return ApiService.get<ApiResponse<Webhook[]>>(this.BASE_PATH);
    }

    /**
     * Get webhook by ID
     */
    static async getWebhookById(webhookId: string): Promise<ApiResponse<Webhook>> {
        return ApiService.get<ApiResponse<Webhook>>(`${this.BASE_PATH}/${webhookId}`);
    }

    /**
     * Create new webhook
     */
    static async createWebhook(webhookData: Partial<Webhook>): Promise<ApiResponse<Webhook>> {
        return ApiService.post<ApiResponse<Webhook>>(this.BASE_PATH, webhookData);
    }

    /**
     * Update existing webhook
     */
    static async updateWebhook(webhookId: string, webhookData: Partial<Webhook>): Promise<ApiResponse<Webhook>> {
        return ApiService.put<ApiResponse<Webhook>>(`${this.BASE_PATH}/${webhookId}`, webhookData);
    }

    /**
     * Delete webhook
     */
    static async deleteWebhook(webhookId: string): Promise<ApiResponse<{ message: string }>> {
        return ApiService.delete<ApiResponse<{ message: string }>>(`${this.BASE_PATH}/${webhookId}`);
    }

    /**
     * Toggle webhook enabled/disabled status
     */
    static async toggleWebhook(webhookId: string, enabled: boolean): Promise<ApiResponse<Webhook>> {
        return ApiService.put<ApiResponse<Webhook>>(`${this.BASE_PATH}/${webhookId}`, { enabled });
    }

    /**
     * Test webhook delivery
     */
    static async testWebhook(webhookId: string, testData?: WebhookTestPayload): Promise<ApiResponse<WebhookDelivery>> {
        return ApiService.post<ApiResponse<WebhookDelivery>>(
            `${this.BASE_PATH}/${webhookId}/test`,
            testData
        );
    }

    /**
     * Fetch webhook deliveries/logs
     */
    static async getWebhookDeliveries(
        webhookId: string,
        limit: number = 10,
        skip: number = 0
    ): Promise<ApiResponse<WebhookDelivery[]>> {
        return ApiService.get<ApiResponse<WebhookDelivery[]>>(
            `${this.BASE_PATH}/${webhookId}/deliveries?limit=${limit}&skip=${skip}`
        );
    }

    /**
     * Get webhook delivery by ID
     */
    static async getDeliveryById(
        webhookId: string,
        deliveryId: string
    ): Promise<ApiResponse<WebhookDelivery>> {
        return ApiService.get<ApiResponse<WebhookDelivery>>(
            `${this.BASE_PATH}/${webhookId}/deliveries/${deliveryId}`
        );
    }

    /**
     * Retry failed delivery
     */
    static async retryDelivery(
        webhookId: string,
        deliveryId: string
    ): Promise<ApiResponse<WebhookDelivery>> {
        return ApiService.post<ApiResponse<WebhookDelivery>>(
            `${this.BASE_PATH}/${webhookId}/deliveries/${deliveryId}/retry`
        );
    }

    /**
     * Regenerate webhook signing secret
     */
    static async regenerateSecret(webhookId: string): Promise<ApiResponse<Webhook>> {
        return ApiService.post<ApiResponse<Webhook>>(`${this.BASE_PATH}/${webhookId}/regenerate-secret`);
    }

    /**
     * Validate webhook URL
     */
    static async validateWebhookUrl(url: string): Promise<ApiResponse<{ valid: boolean; message?: string }>> {
        return ApiService.post<ApiResponse<{ valid: boolean; message?: string }>>(
            `${this.BASE_PATH}/validate-url`,
            { url }
        );
    }

    /**
     * Get webhook statistics
     */
    static async getWebhookStats(webhookId: string): Promise<ApiResponse<{
        totalDeliveries: number;
        successfulDeliveries: number;
        failedDeliveries: number;
        avgDuration: number;
        lastDeliveryTime?: string;
    }>> {
        return ApiService.get<ApiResponse<any>>(`${this.BASE_PATH}/${webhookId}/stats`);
    }

    /**
     * Bulk update webhooks
     */
    static async bulkUpdateWebhooks(updates: { webhookId: string; data: Partial<Webhook> }[]): Promise<ApiResponse<Webhook[]>> {
        return ApiService.post<ApiResponse<Webhook[]>>(`${this.BASE_PATH}/bulk-update`, { updates });
    }

    /**
     * Test connection to webhook URL without saving
     */
    static async testConnection(url: string): Promise<ApiResponse<{ reachable: boolean; statusCode?: number; duration?: number }>> {
        return ApiService.post<ApiResponse<any>>(`${this.BASE_PATH}/test-connection`, { url });
    }
}

export default WebhookService;
