const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

class ApiService {
  private static getToken(): string | null {
    if (typeof window === 'undefined') return null;

    // Use cookies instead of localStorage for better security
    try {
      const cookies = document.cookie.split(';');
      const tokenCookie = cookies.find(cookie => cookie.trim().startsWith('admin_token='));
      return tokenCookie ? tokenCookie.split('=')[1].trim() : null;
    } catch (error) {
      console.error('Error getting token from cookies:', error);
      return null;
    }
  }

  private static getHeaders(includeAuth: boolean = true): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (includeAuth) {
      const token = this.getToken();
      console.log('🔍 Token from cookie:', token ? `${token.substring(0, 20)}...` : 'No token found');
      if (token) {
        // Backend expects 'Bearer ' prefix based on standard JWT authentication
        headers['Authorization'] = `Bearer ${token}`;
        console.log('📤 Sending Authorization header:', headers['Authorization'].substring(0, 30) + '...');
      } else {
        console.warn('⚠️ No token available - request will be unauthenticated');
      }
    }

    return headers;
  }

  private static getFormDataHeaders(includeAuth: boolean = true): HeadersInit {
    const headers: HeadersInit = {};

    if (includeAuth) {
      const token = this.getToken();
      if (token) {
        // Backend expects 'Bearer ' prefix based on standard JWT authentication
        headers['Authorization'] = `Bearer ${token}`;
      }
    }

    return headers;
  }

  private static async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      let errorMessage = `HTTP ${response.status}`;
      let errorData = null;

      try {
        errorData = await response.json();
        errorMessage = errorData.message || errorData.error || errorMessage;

        // Log detailed error information
        console.error('🔴 API Error Response:', {
          status: response.status,
          statusText: response.statusText,
          url: response.url,
          message: errorMessage,
          fullError: errorData
        });
      } catch {
        errorMessage = response.statusText || errorMessage;
      }

      if (response.status === 401) {
        console.error('🔒 401 Unauthorized - Clearing auth state');
        errorMessage = errorData?.message || 'Authentication failed. Please log in again.';

        // Clear authentication
        if (typeof window !== 'undefined') {
          localStorage.removeItem('authToken');
          localStorage.removeItem('token');

          // Clear cookies
          document.cookie.split(";").forEach((c) => {
            document.cookie = c
              .replace(/^ +/, "")
              .replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
          });
        }
      } else if (response.status === 403) {
        errorMessage = 'Access denied. You do not have permission to perform this action.';
      } else if (response.status === 404) {
        errorMessage = 'Resource not found.';
      } else if (response.status >= 500) {
        errorMessage = 'Server error. Please try again later.';
      }

      const error = new Error(errorMessage);
      // Attach the full error data for better debugging
      (error as any).response = { data: errorData, status: response.status };
      throw error;
    }
    return response.json();
  }

  static async get<T>(endpoint: string, includeAuth: boolean = true): Promise<T> {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'GET',
      headers: this.getHeaders(includeAuth),
      credentials: 'include',
    });
    return this.handleResponse<T>(response);
  }

  static async post<T>(endpoint: string, data?: any, includeAuth: boolean = true): Promise<T> {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: this.getHeaders(includeAuth),
      credentials: 'include',
      body: data ? JSON.stringify(data) : undefined,
    });
    return this.handleResponse<T>(response);
  }

  static async put<T>(endpoint: string, data?: any, includeAuth: boolean = true): Promise<T> {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'PUT',
      headers: this.getHeaders(includeAuth),
      credentials: 'include',
      body: data ? JSON.stringify(data) : undefined,
    });
    return this.handleResponse<T>(response);
  }

  static async delete<T>(endpoint: string, data?: any, includeAuth: boolean = true): Promise<T> {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'DELETE',
      headers: this.getHeaders(includeAuth),
      credentials: 'include',
      body: data ? JSON.stringify(data) : undefined,
    });
    return this.handleResponse<T>(response);
  }

  static async patch<T>(endpoint: string, data?: any, includeAuth: boolean = true): Promise<T> {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'PATCH',
      headers: this.getHeaders(includeAuth),
      credentials: 'include',
      body: data ? JSON.stringify(data) : undefined,
    });
    return this.handleResponse<T>(response);
  }

  // Form data methods for file uploads
  static async postFormData<T>(endpoint: string, formData: FormData, includeAuth: boolean = true): Promise<T> {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: this.getFormDataHeaders(includeAuth),
      credentials: 'include',
      body: formData,
    });
    return this.handleResponse<T>(response);
  }

  static async putFormData<T>(endpoint: string, formData: FormData, includeAuth: boolean = true): Promise<T> {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'PUT',
      headers: this.getFormDataHeaders(includeAuth),
      credentials: 'include',
      body: formData,
    });
    return this.handleResponse<T>(response);
  }

  // Utility method to get token (for external use)
  static getAuthToken(): string | null {
    return this.getToken();
  }
}

export default ApiService;
