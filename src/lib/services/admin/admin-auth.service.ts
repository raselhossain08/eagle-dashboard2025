// services/auth.service.ts

import { LoginCredentials, AuthResponse, TwoFASetup, PasswordChange } from '@/types/auth'
import { apiClient } from '../shared/api-client'

export class AuthService {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>('/admin/auth/login', credentials)
    return response.data
  }

  async login2FA(email: string, token: string): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>('/admin/auth/login-2fa', { email, token })
    return response.data
  }

  async getProfile(): Promise<AuthResponse> {
    const response = await apiClient.get<AuthResponse>('/admin/auth/profile')
    return response.data
  }

  async setup2FA(): Promise<TwoFASetup> {
    const response = await apiClient.post<TwoFASetup>('/admin/auth/setup-2fa')
    return response.data
  }

  async confirm2FA(token: string): Promise<void> {
    await apiClient.post('/admin/auth/confirm-2fa', { token })
  }

  async disable2FA(password: string, token: string): Promise<void> {
    await apiClient.post('/admin/auth/disable-2fa', { password, token })
  }

  async changePassword(data: PasswordChange): Promise<void> {
    await apiClient.post('/admin/auth/change-password', data)
  }

  async forgotPassword(email: string): Promise<void> {
    await apiClient.post('/admin/auth/forgot-password', { email })
  }

  async resetPassword(token: string, password: string): Promise<void> {
    await apiClient.post(`/admin/auth/reset-password/${token}`, { password })
  }

  async validateToken(): Promise<boolean> {
    const response = await apiClient.get<{ success: boolean }>('/admin/auth/validate-token')
    return response.data.success
  }

  async logout(): Promise<void> {
    await apiClient.post('/admin/auth/logout')
  }
}

export const authService = new AuthService()