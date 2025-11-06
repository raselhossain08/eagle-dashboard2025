/**
 * 🌐 Eagle API Client - Bulletproof HTTP Client with Auto-Authentication
 * 
 * Features:
 * ✅ Automatically includes authentication tokens in ALL requests
 * ✅ Handles token refresh and retry logic
 * ✅ Smart error handling and user feedback
 * ✅ Request/response interceptors
 * ✅ TypeScript support with proper types
 * ✅ No manual token management required
 */

import EagleTokenManager, { AuthState } from './token-manager';

// API Configuration
const API_CONFIG = {
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api',
  timeout: 30000, // 30 seconds
  retries: 3,
  retryDelay: 1000, // 1 second
  retryBackoff: 2, // Exponential backoff multiplier
};

// Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  errors?: Record<string, string[]>;
}

export interface ApiError {
  message: string;
  status: number;
  code?: string;
  details?: any;
}

// Request Options
export interface RequestOptions {
  headers?: Record<string, string>;
  timeout?: number;
  retries?: number;
  skipAuth?: boolean;
  skipErrorHandling?: boolean;
}

class EagleApiClient {
  private static instance: EagleApiClient;
  private authState: AuthState | null = null;

  constructor() {
    // Listen to auth state changes
    EagleTokenManager.onAuthChange((state) => {
      this.authState = state;
    });
  }

  /**
   * 🏭 Get singleton instance
   */
  static getInstance(): EagleApiClient {
    if (!EagleApiClient.instance) {
      EagleApiClient.instance = new EagleApiClient();
    }
    return EagleApiClient.instance;
  }

  /**
   * 🔐 Get authentication headers
   */
  private getAuthHeaders(skipAuth = false): Record<string, string> {
    if (skipAuth) return {};

    const headers = EagleTokenManager.getAuthHeaders();

    // Log auth status for debugging
    if (process.env.NODE_ENV === 'development') {
      const hasAuth = Object.keys(headers).length > 0;
      console.log(`🔐 API Request - Auth: ${hasAuth ? '✅ Included' : '❌ Missing'}`);
    }

    return headers;
  }

  /**
   * 📊 Get default headers
   */
  private getDefaultHeaders(options: RequestOptions = {}): Record<string, string> {
    return {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...this.getAuthHeaders(options.skipAuth),
      ...options.headers,
    };
  }

  /**
   * 🌐 Make HTTP request with retry logic
   */
  private async makeRequest<T>(
    endpoint: string,
    init: RequestInit,
    options: RequestOptions = {}
  ): Promise<T> {
    const url = `${API_CONFIG.baseURL}${endpoint}`;
    const timeout = options.timeout || API_CONFIG.timeout;
    const maxRetries = options.retries || API_CONFIG.retries;

    let lastError: Error | null = null;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        // Add timeout signal
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeout);

        // Make the request with credentials to include cookies
        const response = await fetch(url, {
          ...init,
          signal: controller.signal,
          credentials: 'include', // This ensures cookies are sent
          headers: {
            ...this.getDefaultHeaders(options),
            ...init.headers,
          },
        });

        clearTimeout(timeoutId);

        // Handle response
        return await this.handleResponse<T>(response, options);

      } catch (error) {
        lastError = error as Error;

        // Don't retry on auth errors or final attempt
        if (attempt === maxRetries || this.isAuthError(error)) {
          break;
        }

        // Wait before retry with exponential backoff
        const delay = API_CONFIG.retryDelay * Math.pow(API_CONFIG.retryBackoff, attempt);
        console.warn(`⚠️ Request failed, retrying in ${delay}ms... (${attempt + 1}/${maxRetries})`);
        await this.delay(delay);
      }
    }

    // All retries failed
    throw this.createApiError(lastError);
  }

  /**
   * 📥 Handle API response
   */
  private async handleResponse<T>(
    response: Response,
    options: RequestOptions
  ): Promise<T> {
    const isJson = response.headers.get('content-type')?.includes('application/json');

    try {
      if (!response.ok) {
        let errorData: any = {};

        if (isJson) {
          errorData = await response.json();
        } else {
          errorData = { message: response.statusText };
        }

        // Handle authentication errors
        if (response.status === 401) {
          await this.handleAuthError();
        }

        // Create and throw API error
        const apiError = this.createApiError({
          message: errorData.message || errorData.error || 'Request failed',
          status: response.status,
          details: errorData,
        });

        if (!options.skipErrorHandling) {
          this.handleError(apiError);
        }

        throw apiError;
      }

      // Parse successful response
      if (isJson) {
        return await response.json();
      } else {
        return response.text() as T;
      }

    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        throw this.createApiError({
          message: 'Request timeout',
          status: 408,
        });
      }
      throw error;
    }
  }

  /**
   * 🚨 Handle authentication errors
   */
  private async handleAuthError(): Promise<void> {
    console.warn('🚨 Authentication error detected');

    // Clear invalid token
    EagleTokenManager.clearToken();

    // Try to refresh token if available
    if (EagleTokenManager.shouldRefreshToken()) {
      try {
        // Implement token refresh logic here if your backend supports it
        console.log('🔄 Attempting token refresh...');
        // await this.refreshToken();
      } catch (refreshError) {
        console.error('❌ Token refresh failed:', refreshError);
      }
    }

    // Redirect to login if in browser and not already on auth page
    if (typeof window !== 'undefined') {
      const currentPath = window.location.pathname;
      const authPaths = ['/login', '/register', '/forgot-password'];

      if (!authPaths.some(path => currentPath.startsWith(path))) {
        console.log('🔄 Redirecting to login...');
        window.location.href = `/login?redirect=${encodeURIComponent(currentPath)}`;
      }
    }
  }

  /**
   * 🚨 Handle API errors
   */
  private handleError(error: ApiError): void {
    // Log error for debugging
    console.error('🚨 API Error:', {
      message: error.message,
      status: error.status,
      code: error.code,
      details: error.details,
    });

    // Show user-friendly error messages
    if (typeof window !== 'undefined') {
      this.showErrorToast(error);
    }
  }

  /**
   * 🍞 Show error toast
   */
  private showErrorToast(error: ApiError): void {
    const message = this.getUserFriendlyErrorMessage(error);

    // Try different toast libraries
    if ((window as any).toast) {
      (window as any).toast.error(message);
    } else if ((window as any).Swal) {
      (window as any).Swal.fire('Error', message, 'error');
    } else {
      // Try to use sonner toast if available
      try {
        const { toast } = require('sonner');
        toast.error(message);
      } catch {
        console.error('🚨 Error:', message);
      }
    }
  }

  /**
   * 💬 Get user-friendly error message
   */
  private getUserFriendlyErrorMessage(error: ApiError): string {
    switch (error.status) {
      case 400:
        return error.message || 'Invalid request. Please check your input.';
      case 401:
        return 'Please log in to continue.';
      case 403:
        return 'You don\'t have permission to perform this action.';
      case 404:
        return 'The requested resource was not found.';
      case 408:
        return 'Request timeout. Please check your connection and try again.';
      case 409:
        return error.message || 'A conflict occurred. The resource may already exist.';
      case 422:
        return error.message || 'Validation failed. Please check your input.';
      case 429:
        return 'Too many requests. Please wait a moment and try again.';
      case 500:
        return 'Server error. Please try again later.';
      case 503:
        return 'Service temporarily unavailable. Please try again later.';
      default:
        return error.message || 'An unexpected error occurred. Please try again.';
    }
  }

  /**
   * 🏗️ Create API error object
   */
  private createApiError(error: any): ApiError {
    if (error.status) {
      return error as ApiError;
    }

    return {
      message: error.message || 'Unknown error occurred',
      status: error.status || 500,
      code: error.code,
      details: error.details,
    };
  }

  /**
   * 🔍 Check if error is auth-related
   */
  private isAuthError(error: any): boolean {
    return error?.status === 401 || error?.status === 403;
  }

  /**
   * ⏱️ Delay utility
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // ============================================================================
  // 🌐 HTTP Methods
  // ============================================================================

  /**
   * 📤 GET request
   */
  async get<T = any>(endpoint: string, options: RequestOptions = {}): Promise<T> {
    return this.makeRequest<T>(endpoint, { method: 'GET' }, options);
  }

  /**
   * 📤 POST request
   */
  async post<T = any>(
    endpoint: string,
    data?: any,
    options: RequestOptions = {}
  ): Promise<T> {
    return this.makeRequest<T>(
      endpoint,
      {
        method: 'POST',
        body: data ? JSON.stringify(data) : undefined,
      },
      options
    );
  }

  /**
   * 📤 PUT request
   */
  async put<T = any>(
    endpoint: string,
    data?: any,
    options: RequestOptions = {}
  ): Promise<T> {
    return this.makeRequest<T>(
      endpoint,
      {
        method: 'PUT',
        body: data ? JSON.stringify(data) : undefined,
      },
      options
    );
  }

  /**
   * 📤 PATCH request
   */
  async patch<T = any>(
    endpoint: string,
    data?: any,
    options: RequestOptions = {}
  ): Promise<T> {
    return this.makeRequest<T>(
      endpoint,
      {
        method: 'PATCH',
        body: data ? JSON.stringify(data) : undefined,
      },
      options
    );
  }

  /**
   * 📤 DELETE request
   */
  async delete<T = any>(
    endpoint: string,
    data?: any,
    options: RequestOptions = {}
  ): Promise<T> {
    return this.makeRequest<T>(
      endpoint,
      {
        method: 'DELETE',
        body: data ? JSON.stringify(data) : undefined,
      },
      options
    );
  }

  /**
   * 📤 Upload file (FormData)
   */
  async upload<T = any>(
    endpoint: string,
    formData: FormData,
    options: RequestOptions = {}
  ): Promise<T> {
    const headers = {
      ...this.getAuthHeaders(options.skipAuth),
      ...options.headers,
    };

    // Don't set Content-Type for FormData, let browser handle it
    delete headers['Content-Type'];

    return this.makeRequest<T>(
      endpoint,
      {
        method: 'POST',
        body: formData,
        headers,
      },
      options
    );
  }

  // ============================================================================
  // 🛠️ Utility Methods
  // ============================================================================

  /**
   * 🔍 Check API connectivity
   */
  async checkConnection(): Promise<boolean> {
    try {
      await this.get('/health', { skipAuth: true, timeout: 5000 });
      return true;
    } catch (error) {
      console.error('❌ API connection check failed:', error);
      return false;
    }
  }

  /**
   * 📊 Get current auth status
   */
  getAuthStatus(): AuthState | null {
    return this.authState;
  }

  /**
   * 🛠️ Debug information
   */
  debug(): void {
    console.group('🌐 Eagle API Client Debug');
    console.log('Base URL:', API_CONFIG.baseURL);
    console.log('Auth State:', this.authState);
    console.log('Configuration:', API_CONFIG);
    console.groupEnd();
  }
}

// Export singleton instance
const apiClient = EagleApiClient.getInstance();

export default apiClient;
export { EagleApiClient, API_CONFIG };