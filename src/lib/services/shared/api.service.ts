// Use relative /api path to leverage Next.js proxy and avoid CORS issues
const API_BASE_URL = '/api';

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
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
    }

    return headers;
  }

  private static getFormDataHeaders(includeAuth: boolean = true): HeadersInit {
    const headers: HeadersInit = {};

    if (includeAuth) {
      const token = this.getToken();
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
    }

    return headers;
  }

  private static async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      let errorMessage = `HTTP ${response.status}`;

      try {
        const error = await response.json();
        errorMessage = error.message || error.error || errorMessage;
      } catch {
        errorMessage = response.statusText || errorMessage;
      }

      if (response.status === 401) {
        errorMessage = 'Authentication required. Please log in.';
        // Optionally clear token and redirect to login
        if (typeof window !== 'undefined') {
          localStorage.removeItem('authToken');
          localStorage.removeItem('token');
        }
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

  static async getBlob(endpoint: string, includeAuth: boolean = true): Promise<Blob> {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'GET',
      headers: this.getHeaders(includeAuth),
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return response.blob();
  }

  // Utility method to get token (for external use)
  static getAuthToken(): string | null {
    return this.getToken();
  }
}

export default ApiService;
