import { getCookie, setCookie, deleteCookie } from 'cookies-next';
import { TokenUtils } from '@/lib/utils/token.utils';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

class ApiService {
  private static getHeaders(): HeadersInit {
    const token = this.getToken();
    
    // Enhanced debug logging
    console.log('🔑 API Service Token Check:', {
      tokenExists: !!token,
      tokenLength: token?.length || 0,
      tokenPreview: token ? `${token.substring(0, 20)}...` : 'No token',
      tokenSource: this.getTokenSource()
    });
    
    // Decode and check token if exists
    if (token) {
      try {
        const decoded = TokenUtils.decodeToken(token);
        console.log('👤 Token Info:', {
          role: decoded.role,
          email: decoded.email,
          name: decoded.name,
          expires: new Date(decoded.exp * 1000)
        });
      } catch (error) {
        console.error('❌ Token decode failed:', error);
      }
    }
    
    return {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    };
  }

  /**
   * Get authentication token dynamically from current session
   */
  static getToken(): string | null {
    // Always get fresh token from current session
    return TokenUtils.getToken();
  }

  /**
   * Get token source for debugging
   */
  static getTokenSource(): string {
    const tokenUtilsToken = TokenUtils.getToken();
    if (tokenUtilsToken) return 'TokenUtils';
    
    try {
      const cookieToken = getCookie('token');
      if (cookieToken) return 'cookies-next';
    } catch {}
    
    if (typeof document !== 'undefined' && document.cookie.includes('token=')) {
      return 'document.cookie';
    }
    
    return 'not found';
  }

  /**
   * Set authentication token in cookies
   */
  static setToken(token: string, options?: { maxAge?: number; secure?: boolean }): void {
    TokenUtils.setToken(token, options);
  }

  /**
   * Remove authentication token from cookies
   */
  static removeToken(): void {
    TokenUtils.removeToken();
  }

  /**
   * Check if user is authenticated (has valid token)
   */
  static isAuthenticated(): boolean {
    return TokenUtils.isAuthenticated();
  }

  /**
   * Get user info from token
   */
  static getUserInfo() {
    return TokenUtils.getUserInfo();
  }

  /**
   * Check if user has permission
   */
  static hasPermission(permission: string): boolean {
    return TokenUtils.hasPermission(permission);
  }

  /**
   * Debug method to check current session token status
   */
  static debugTokenStatus(): void {
    const token = this.getToken();
    const userInfo = this.getUserInfo();
    
    console.log('🔍 Current Session Token Status:', {
      tokenExists: !!token,
      tokenLength: token?.length || 0,
      isAuthenticated: this.isAuthenticated(),
      userRole: userInfo?.role || 'not found',
      userEmail: userInfo?.email || 'not found',
      tokenExpires: token ? new Date((TokenUtils.decodeToken(token)?.exp || 0) * 1000) : 'no token'
    });
    
    if (!token) {
      console.log('💡 No token found. User needs to login.');
    } else if (userInfo?.role !== 'superadmin' && userInfo?.role !== 'admin') {
      console.log(`⚠️  Current role "${userInfo?.role}" may not have admin access.`);
    }
  }

  private static async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      let errorMessage = `HTTP ${response.status}`;
      
      try {
        const error = await response.json();
        errorMessage = error.message || error.error || errorMessage;
      } catch {
        // If parsing JSON fails, use status text
        errorMessage = response.statusText || errorMessage;
      }

      // Handle authentication errors
      if (response.status === 401) {
        errorMessage = 'Authentication required. Please log in.';
        // Clear invalid tokens
        TokenUtils.clearAllTokens();
        // Redirect to login if in browser
        // if (typeof window !== 'undefined') {
        //   window.location.href = '/login';
        // }
      } else if (response.status === 403) {
        errorMessage = 'Access denied. You do not have permission to perform this action.';
      } else if (response.status === 404) {
        errorMessage = 'Resource not found.';
      } else if (response.status >= 500) {
        errorMessage = 'Server error. Please try again later.';
      }

      throw new Error(errorMessage);
    }
    return response.json();
  }

  static async get<T>(endpoint: string): Promise<T> {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'GET',
        headers: this.getHeaders(),
        credentials: 'include',
        // Add timeout
        signal: AbortSignal.timeout(30000) // 30 second timeout
      });
      return this.handleResponse<T>(response);
    } catch (error) {
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          throw new Error('Request timeout. Please check your connection.');
        }
        if (error.message.includes('fetch')) {
          throw new Error('Network error. Please check your internet connection.');
        }
      }
      throw error;
    }
  }

  static async post<T>(endpoint: string, data?: any): Promise<T> {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: this.getHeaders(),
      credentials: 'include',
      body: data ? JSON.stringify(data) : undefined,
    });
    return this.handleResponse<T>(response);
  }

  static async put<T>(endpoint: string, data?: any): Promise<T> {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'PUT',
      headers: this.getHeaders(),
      credentials: 'include',
      body: data ? JSON.stringify(data) : undefined,
    });
    return this.handleResponse<T>(response);
  }

  static async delete<T>(endpoint: string, data?: any): Promise<T> {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'DELETE',
      headers: this.getHeaders(),
      credentials: 'include',
      body: data ? JSON.stringify(data) : undefined,
    });
    return this.handleResponse<T>(response);
  }

  static async patch<T>(endpoint: string, data?: any): Promise<T> {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'PATCH',
      headers: this.getHeaders(),
      credentials: 'include',
      body: data ? JSON.stringify(data) : undefined,
    });
    return this.handleResponse<T>(response);
  }

  /**
   * POST request with FormData (for file uploads)
   */
  static async postFormData<T>(endpoint: string, formData: FormData): Promise<T> {
    const token = this.getToken();
    const headers: HeadersInit = {};
    
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
    
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'POST',
      headers, // Don't set Content-Type for FormData, let browser set it
      credentials: 'include',
      body: formData,
    });
    return this.handleResponse<T>(response);
  }

  /**
   * PUT request with FormData (for file uploads)
   */
  static async putFormData<T>(endpoint: string, formData: FormData): Promise<T> {
    const token = this.getToken();
    const headers: HeadersInit = {};
    
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
    
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'PUT',
      headers, // Don't set Content-Type for FormData, let browser set it
      credentials: 'include',
      body: formData,
    });
    return this.handleResponse<T>(response);
  }
}

export default ApiService;