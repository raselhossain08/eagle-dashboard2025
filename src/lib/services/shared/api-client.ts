// lib/api/client.ts
import axios, { AxiosInstance, AxiosResponse } from 'axios'

class ApiClient {
  private client: AxiosInstance

  constructor() {
    this.client = axios.create({
      baseURL: process.env.NEXT_PUBLIC_API_URL || '/api',
      timeout: 30000,
    })

    this.setupInterceptors()
  }

  private setupInterceptors() {
    this.client.interceptors.request.use(
      (config) => {
        const token = this.getToken()
        if (token) {
          config.headers.Authorization = `Bearer ${token}`
        }
        return config
      },
      (error) => Promise.reject(error)
    )

    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          this.handleUnauthorized()
        }
        return Promise.reject(error)
      }
    )
  }

  private getToken(): string | null {
    if (typeof window !== 'undefined') {
      // Use cookies instead of localStorage
      try {
        const cookies = document.cookie.split(';')
        const tokenCookie = cookies.find(cookie => cookie.trim().startsWith('admin_token='))
        return tokenCookie ? tokenCookie.split('=')[1].trim() : null
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
    return this.client.post(url, data)
  }

  async put<T>(url: string, data?: any): Promise<AxiosResponse<T>> {
    return this.client.put(url, data)
  }

  async delete<T>(url: string): Promise<AxiosResponse<T>> {
    return this.client.delete(url)
  }
}

export const apiClient = new ApiClient()