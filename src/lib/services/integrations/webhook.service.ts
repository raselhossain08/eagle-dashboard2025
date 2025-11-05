/**
 * Frontend Webhook Service
 * Handles API communication for webhook management
 */

import ApiService from '@/lib/services/shared/api.service'

export interface WebhookEndpoint {
  id: string
  name: string
  url: string
  events: string[]
  description?: string
  isActive: boolean
  timeout: number
  retryPolicy: {
    enabled: boolean
    maxAttempts: number
    initialDelayMs: number
    backoffMultiplier: number
    maxDelayMs: number
    retryOnStatus: number[]
  }
  security: {
    secretKey?: string
    signatureMethod: 'sha256' | 'sha1'
    signatureHeader: string
    timestampHeader: string
  }
  headers: Record<string, string>
  deliveryStats: {
    totalDeliveries: number
    successfulDeliveries: number
    failedDeliveries: number
    lastDeliveryAt?: string
    lastSuccessAt?: string
    lastFailureAt?: string
    averageResponseTime: number
  }
  healthCheck: {
    enabled: boolean
    interval: number
    timeout: number
    expectedStatusCodes: number[]
    lastCheck?: string
    lastCheckStatus?: 'success' | 'failure' | 'timeout'
  }
  createdAt: string
  updatedAt: string
}

export interface WebhookDelivery {
  id: string
  webhookEndpoint: {
    id: string
    name: string
    url: string
  }
  event: {
    id: string
    eventType: string
    payload: Record<string, any>
    metadata: Record<string, any>
  }
  status: 'pending' | 'delivered' | 'failed' | 'cancelled'
  attempts: Array<{
    attemptNumber: number
    timestamp: string
    httpStatus: number
    responseBody?: string
    responseHeaders?: Record<string, string>
    duration: number
    error?: string
    success: boolean
  }>
  totalAttempts: number
  nextRetryAt?: string
  lastAttemptAt?: string
  deliveredAt?: string
  finalizedAt?: string
  signature: string
  timestamp: number
  createdAt: string
  updatedAt: string
}

export interface WebhookAnalytics {
  totalEndpoints: number
  activeEndpoints: number
  totalDeliveries: number
  successfulDeliveries: number
  failedDeliveries: number
  pendingDeliveries: number
  successRate: number
  averageResponseTime: number
  fastestResponse: number
  slowestResponse: number
  deliveriesToday: number
  deliveriesThisWeek: number
  eventDistribution: Array<{
    eventType: string
    count: number
    percentage: number
  }>
  topPerformingEndpoints: Array<{
    id: string
    name: string
    successRate: number
    averageResponseTime: number
  }>
  recentFailures: Array<{
    id: string
    webhookName: string
    eventType: string
    error: string
    timestamp: string
  }>
}

export interface CreateWebhookData {
  name: string
  url: string
  events: string[]
  description?: string
  isActive?: boolean
  timeout?: number
  retryPolicy?: Partial<WebhookEndpoint['retryPolicy']>
  security?: Partial<WebhookEndpoint['security']>
  headers?: Record<string, string>
  healthCheck?: Partial<WebhookEndpoint['healthCheck']>
}

export interface UpdateWebhookData extends Partial<CreateWebhookData> {}

export interface TestWebhookPayload {
  [key: string]: any
}

class WebhookService {
  private baseUrl = '/api/webhooks'

  // ===================== WEBHOOK ENDPOINTS =====================

  /**
   * Get all webhook endpoints with pagination and filtering
   */
  async getWebhooks(params?: {
    page?: number
    limit?: number
    search?: string
    isActive?: boolean
    events?: string[]
  }): Promise<{
    webhooks: WebhookEndpoint[]
    pagination: {
      page: number
      limit: number
      total: number
      pages: number
    }
  }> {
    const searchParams = new URLSearchParams()
    
    if (params?.page) searchParams.set('page', params.page.toString())
    if (params?.limit) searchParams.set('limit', params.limit.toString())
    if (params?.search) searchParams.set('search', params.search)
    if (params?.isActive !== undefined) searchParams.set('isActive', params.isActive.toString())
    if (params?.events?.length) searchParams.set('events', params.events.join(','))

    const response = await ApiService.get<any>(`${this.baseUrl}?${searchParams}`)
    return response.data
  }

  /**
   * Get single webhook endpoint by ID
   */
  async getWebhook(id: string): Promise<WebhookEndpoint> {
    const response = await ApiService.get<any>(`${this.baseUrl}/${id}`)
    return response.data.webhook
  }

  /**
   * Create new webhook endpoint
   */
  async createWebhook(data: CreateWebhookData): Promise<WebhookEndpoint> {
    const response = await ApiService.post<any>(this.baseUrl, data)
    return response.data.webhook
  }

  /**
   * Update webhook endpoint
   */
  async updateWebhook(id: string, data: UpdateWebhookData): Promise<WebhookEndpoint> {
    const response = await ApiService.put<any>(`${this.baseUrl}/${id}`, data)
    return response.data.webhook
  }

  /**
   * Delete webhook endpoint
   */
  async deleteWebhook(id: string): Promise<void> {
    await ApiService.delete(`${this.baseUrl}/${id}`)
  }

  /**
   * Toggle webhook endpoint active status
   */
  async toggleWebhook(id: string, isActive: boolean): Promise<WebhookEndpoint> {
    const response = await ApiService.patch<any>(`${this.baseUrl}/${id}/toggle`, { isActive })
    return response.data.webhook
  }

  /**
   * Test webhook endpoint with custom payload
   */
  async testWebhook(id: string, payload: TestWebhookPayload): Promise<{
    success: boolean
    delivery: WebhookDelivery
    message: string
  }> {
    const response = await ApiService.post<any>(`${this.baseUrl}/${id}/test`, { payload })
    return response.data
  }

  // ===================== WEBHOOK SECRETS =====================

  /**
   * Regenerate webhook secret key
   */
  async regenerateSecret(id: string): Promise<{
    webhook: WebhookEndpoint
    secretKey: string
  }> {
    const response = await ApiService.post<any>(`${this.baseUrl}/${id}/regenerate-secret`)
    return response.data
  }

  /**
   * Update webhook security configuration
   */
  async updateSecurity(id: string, security: Partial<WebhookEndpoint['security']>): Promise<WebhookEndpoint> {
    const response = await ApiService.patch<any>(`${this.baseUrl}/${id}/security`, { security })
    return response.data.webhook
  }

  // ===================== WEBHOOK DELIVERIES =====================

  /**
   * Get webhook deliveries with filtering and pagination
   */
  async getDeliveries(params?: {
    webhookId?: string
    status?: WebhookDelivery['status']
    eventType?: string
    page?: number
    limit?: number
    startDate?: string
    endDate?: string
  }): Promise<{
    deliveries: WebhookDelivery[]
    pagination: {
      page: number
      limit: number
      total: number
      pages: number
    }
  }> {
    const searchParams = new URLSearchParams()
    
    if (params?.webhookId) searchParams.set('webhookId', params.webhookId)
    if (params?.status) searchParams.set('status', params.status)
    if (params?.eventType) searchParams.set('eventType', params.eventType)
    if (params?.page) searchParams.set('page', params.page.toString())
    if (params?.limit) searchParams.set('limit', params.limit.toString())
    if (params?.startDate) searchParams.set('startDate', params.startDate)
    if (params?.endDate) searchParams.set('endDate', params.endDate)

    const response = await ApiService.get<any>(`${this.baseUrl}/deliveries?${searchParams}`)
    return response.data
  }

  /**
   * Get recent deliveries (last 50)
   */
  async getRecentDeliveries(limit = 50): Promise<{
    deliveries: WebhookDelivery[]
  }> {
    const response = await ApiService.get<any>(`${this.baseUrl}/deliveries?limit=${limit}&sort=-createdAt`)
    return response.data
  }

  /**
   * Get single delivery details
   */
  async getDelivery(id: string): Promise<WebhookDelivery> {
    const response = await ApiService.get<any>(`${this.baseUrl}/deliveries/${id}`)
    return response.data.delivery
  }

  /**
   * Retry failed delivery
   */
  async retryDelivery(id: string): Promise<{
    success: boolean
    message: string
    delivery: WebhookDelivery
  }> {
    const response = await ApiService.post<any>(`${this.baseUrl}/deliveries/${id}/retry`)
    return response.data
  }

  /**
   * Cancel pending delivery
   */
  async cancelDelivery(id: string): Promise<{
    success: boolean
    message: string
    delivery: WebhookDelivery
  }> {
    const response = await ApiService.post<any>(`${this.baseUrl}/deliveries/${id}/cancel`)
    return response.data
  }

  // ===================== ANALYTICS AND MONITORING =====================

  /**
   * Get webhook analytics and statistics
   */
  async getAnalytics(params?: {
    webhookId?: string
    startDate?: string
    endDate?: string
    groupBy?: 'day' | 'week' | 'month'
  }): Promise<WebhookAnalytics> {
    const searchParams = new URLSearchParams()
    
    if (params?.webhookId) searchParams.set('webhookId', params.webhookId)
    if (params?.startDate) searchParams.set('startDate', params.startDate)
    if (params?.endDate) searchParams.set('endDate', params.endDate)
    if (params?.groupBy) searchParams.set('groupBy', params.groupBy)

    const response = await ApiService.get<any>(`${this.baseUrl}/analytics?${searchParams}`)
    return response.data.analytics
  }

  /**
   * Get delivery statistics for specific webhook
   */
  async getWebhookStats(id: string): Promise<{
    webhook: WebhookEndpoint
    stats: {
      totalDeliveries: number
      successRate: number
      averageResponseTime: number
      recentDeliveries: WebhookDelivery[]
      failureReasons: Array<{
        reason: string
        count: number
      }>
    }
  }> {
    const response = await ApiService.get<any>(`${this.baseUrl}/${id}/stats`)
    return response.data
  }

  /**
   * Get system-wide webhook statistics
   */
  async getSystemStats(): Promise<{
    totalEndpoints: number
    activeEndpoints: number
    queueStatus: {
      pending: number
      processing: number
      queued: number
    }
    performance: {
      averageResponseTime: number
      successRate: number
      deliveriesPerHour: number
    }
    health: {
      healthyEndpoints: number
      unhealthyEndpoints: number
      lastHealthCheck: string
    }
  }> {
    const response = await ApiService.get<any>(`${this.baseUrl}/system/stats`)
    return response.data.stats
  }

  // ===================== EVENT MANAGEMENT =====================

  /**
   * Get available event types
   */
  async getEventTypes(): Promise<{
    eventTypes: Array<{
      name: string
      description: string
      category: string
      samplePayload: Record<string, any>
    }>
  }> {
    const response = await ApiService.get<any>(`${this.baseUrl}/events/types`)
    return response.data
  }

  /**
   * Send manual webhook event (for testing/admin use)
   */
  async sendEvent(eventType: string, payload: Record<string, any>, metadata?: Record<string, any>): Promise<{
    success: boolean
    eventId: string
    subscriberCount: number
    deliveriesCreated: number
    message: string
  }> {
    const response = await ApiService.post<any>(`${this.baseUrl}/events/send`, {
      eventType,
      payload,
      metadata
    })
    return response.data
  }

  // ===================== HEALTH CHECK MANAGEMENT =====================

  /**
   * Trigger manual health check for webhook
   */
  async triggerHealthCheck(id: string): Promise<{
    success: boolean
    result: {
      status: 'success' | 'failure' | 'timeout'
      responseTime: number
      httpStatus: number
      error?: string
    }
  }> {
    const response = await ApiService.post<any>(`${this.baseUrl}/${id}/health-check`)
    return response.data
  }

  /**
   * Update health check configuration
   */
  async updateHealthCheck(id: string, healthCheck: Partial<WebhookEndpoint['healthCheck']>): Promise<WebhookEndpoint> {
    const response = await ApiService.patch<any>(`${this.baseUrl}/${id}/health-check`, { healthCheck })
    return response.data.webhook
  }

  // ===================== BULK OPERATIONS =====================

  /**
   * Bulk enable/disable webhooks
   */
  async bulkToggle(ids: string[], isActive: boolean): Promise<{
    success: boolean
    updatedCount: number
    errors: Array<{ id: string; error: string }>
  }> {
    const response = await ApiService.patch<any>(`${this.baseUrl}/bulk/toggle`, {
      ids,
      isActive
    })
    return response.data
  }

  /**
   * Bulk delete webhooks
   */
  async bulkDelete(ids: string[]): Promise<{
    success: boolean
    deletedCount: number
    errors: Array<{ id: string; error: string }>
  }> {
    const response = await ApiService.delete<any>(`${this.baseUrl}/bulk/delete`, {
      data: { ids }
    })
    return response.data
  }

  /**
   * Bulk test webhooks
   */
  async bulkTest(ids: string[], payload: TestWebhookPayload): Promise<{
    success: boolean
    results: Array<{
      id: string
      success: boolean
      deliveryId?: string
      error?: string
    }>
  }> {
    const response = await ApiService.post<any>(`${this.baseUrl}/bulk/test`, {
      ids,
      payload
    })
    return response.data
  }

  // ===================== EXPORT AND IMPORT =====================

  /**
   * Export webhook configurations
   */
  async exportWebhooks(ids?: string[]): Promise<{
    webhooks: Array<Omit<WebhookEndpoint, 'security'> & {
      security: Omit<WebhookEndpoint['security'], 'secretKey'>
    }>
    exportedAt: string
    version: string
  }> {
    const response = await ApiService.post<any>(`${this.baseUrl}/export`, { ids })
    return response.data
  }

  /**
   * Import webhook configurations
   */
  async importWebhooks(data: {
    webhooks: CreateWebhookData[]
    overwriteExisting?: boolean
  }): Promise<{
    success: boolean
    imported: number
    skipped: number
    errors: Array<{
      webhook: string
      error: string
    }>
  }> {
    const response = await ApiService.post<any>(`${this.baseUrl}/import`, data)
    return response.data
  }

  // ===================== UTILITY METHODS =====================

  /**
   * Validate webhook URL
   */
  async validateUrl(url: string): Promise<{
    valid: boolean
    reachable: boolean
    responseTime?: number
    httpStatus?: number
    error?: string
  }> {
    const response = await ApiService.post<any>(`${this.baseUrl}/validate-url`, { url })
    return response.data
  }

  /**
   * Generate webhook signature for payload verification
   */
  generateSignature(payload: any, secret: string, method: 'sha256' | 'sha1' = 'sha256'): string {
    // Note: In production, use a proper crypto library like crypto-js
    const payloadString = typeof payload === 'string' ? payload : JSON.stringify(payload)
    
    // This is a simplified implementation - replace with proper HMAC
    const timestamp = Date.now().toString()
    return `${method}=${btoa(secret + payloadString + timestamp)}`
  }

  /**
   * Parse webhook event from raw request data
   */
  parseWebhookEvent(headers: Record<string, string>, body: string): {
    signature?: string
    timestamp?: number
    payload: any
  } {
    const signature = headers['x-webhook-signature'] || headers['X-Webhook-Signature']
    const timestampStr = headers['x-webhook-timestamp'] || headers['X-Webhook-Timestamp']
    const timestamp = timestampStr ? parseInt(timestampStr) : undefined

    let payload
    try {
      payload = JSON.parse(body)
    } catch (error) {
      payload = body
    }

    return {
      signature,
      timestamp,
      payload
    }
  }

  /**
   * Format delivery duration for display
   */
  formatDuration(ms: number): string {
    if (ms < 1000) return `${ms}ms`
    if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`
    return `${(ms / 60000).toFixed(1)}m`
  }

  /**
   * Get status display color
   */
  getStatusColor(status: WebhookDelivery['status']): string {
    switch (status) {
      case 'delivered': return 'green'
      case 'failed': return 'red'
      case 'pending': return 'yellow'
      case 'cancelled': return 'gray'
      default: return 'gray'
    }
  }

  /**
   * Calculate retry delay based on attempt number
   */
  calculateRetryDelay(attempt: number, policy: WebhookEndpoint['retryPolicy']): number {
    if (!policy.enabled || attempt >= policy.maxAttempts) {
      return 0
    }

    const delay = policy.initialDelayMs * Math.pow(policy.backoffMultiplier, attempt - 1)
    return Math.min(delay, policy.maxDelayMs)
  }
}

// Create and export singleton instance
export const webhookService = new WebhookService()

// Export class for testing or custom instances
export { WebhookService }
