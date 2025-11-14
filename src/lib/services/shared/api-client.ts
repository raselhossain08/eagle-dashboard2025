// lib/api/client.ts
import axios, { AxiosInstance, AxiosResponse } from 'axios'

class ApiClient {
  private client: AxiosInstance

  constructor() {
    this.client = axios.create({
      baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api',
      timeout: 30000,
      withCredentials: true, // Enable sending cookies with cross-origin requests
      headers: {
        'Content-Type': 'application/json',
      }
    })

    this.setupInterceptors()
  }

  private setupInterceptors() {
    this.client.interceptors.request.use(
      (config) => {
        const token = this.getToken()
        if (token) {
          config.headers.Authorization = `Bearer ${token}`
          console.log('🔑 API Request:', {
            url: config.url,
            method: config.method?.toUpperCase(),
            hasToken: true,
            tokenPreview: token.substring(0, 20) + '...'
          })
        } else {
          console.log('⚠️ API Request without token:', {
            url: config.url,
            method: config.method?.toUpperCase()
          })
        }
        return config
      },
      (error) => Promise.reject(error)
    )

    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        console.error('❌ API Error:', {
          url: error.config?.url,
          status: error.response?.status,
          message: error.response?.data?.message || error.message,
          data: error.response?.data
        })

        if (error.response?.status === 401) {
          const errorMessage = error.response?.data?.message || 'Unauthorized'
          console.error('🔒 401 Unauthorized:', errorMessage)
          this.handleUnauthorized()
        }
        return Promise.reject(error)
      }
    )
  }

  private getToken(): string | null {
    if (typeof window !== 'undefined') {
      // Check multiple cookie names for compatibility
      try {
        const cookies = document.cookie.split(';')

        // Try primary token name first
        let tokenCookie = cookies.find(cookie => cookie.trim().startsWith('admin_token='))
        if (tokenCookie) {
          return tokenCookie.split('=')[1].trim()
        }

        // Try fallback names
        const fallbackNames = ['adminToken=', 'AdminToken=', 'token=']
        for (const name of fallbackNames) {
          tokenCookie = cookies.find(cookie => cookie.trim().startsWith(name))
          if (tokenCookie) {
            return tokenCookie.split('=')[1].trim()
          }
        }

        return null
      } catch (error) {
        console.error('Error getting token from cookies:', error)
        return null
      }
    }
    return null
  }



  private handleUnauthorized() {
    console.warn('🔒 API Client: Received 401 Unauthorized response')
    // Don't automatically redirect - let the auth store handle this
    // The middleware and auth components should handle redirects properly
  }

  async get<T>(url: string, params?: any): Promise<AxiosResponse<T>> {
    return this.client.get(url, { params })
  }

  async post<T>(url: string, data?: any): Promise<AxiosResponse<T>> {
    return this.client.post(url, data, {
      headers: {
        'Content-Type': 'application/json',
      },
      withCredentials: true
    })
  }

  async put<T>(url: string, data?: any): Promise<AxiosResponse<T>> {
    return this.client.put(url, data, {
      headers: {
        'Content-Type': 'application/json',
      },
      withCredentials: true
    })
  }

  async delete<T>(url: string): Promise<AxiosResponse<T>> {
    return this.client.delete(url, {
      withCredentials: true
    })
  }
}

export const apiClient = new ApiClient()