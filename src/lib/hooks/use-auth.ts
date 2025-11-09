// hooks/use-auth.ts
import { create } from 'zustand'
import { authService } from '../services/admin/admin-auth.service'
import { AuthUser, LoginCredentials } from '../types'
import { clientCookies } from '../utils/cookies'

interface AuthState {
  user: AuthUser | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (credentials: LoginCredentials) => Promise<void>
  logout: () => Promise<void>
  checkAuth: () => Promise<void>
}

export const useAuth = create<AuthState>((set, get) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,

  login: async (credentials: LoginCredentials) => {
    try {
      const response = await authService.login(credentials)

      if (response.success && response.token) {
        clientCookies.setAuthCookies(response.token, response.user)

        set({
          user: response.user,
          isAuthenticated: true
        })
      }
    } catch (error) {
      throw error
    }
  },

  logout: async () => {
    try {
      console.log('🚪 Starting logout process...')

      // Call backend logout endpoint
      try {
        await authService.logout()
        console.log('✅ Backend logout successful')
      } catch (error) {
        console.warn('⚠️ Backend logout failed, continuing with client logout:', error)
      }

      // Clear cookies
      clientCookies.clearAuthCookies()
      console.log('✅ Cookies cleared')

      // Update state
      set({ user: null, isAuthenticated: false })
      console.log('✅ Auth state cleared')

      // Redirect to login
      if (typeof window !== 'undefined') {
        console.log('🔄 Redirecting to login...')
        window.location.href = '/login'
      }
    } catch (error) {
      console.error('❌ Logout error:', error)
      // Still clear cookies and redirect even on error
      clientCookies.clearAuthCookies()
      set({ user: null, isAuthenticated: false })
      if (typeof window !== 'undefined') {
        window.location.href = '/login'
      }
    }
  },

  checkAuth: async () => {
    try {
      console.log('🔍 Zustand Auth: Checking authentication state...')
      const { token, user } = clientCookies.getAuthCookies()
      console.log('🔍 Zustand Auth:', {
        hasToken: !!token,
        hasUser: !!user,
        userEmail: user?.email
      })

      if (token && user && user.id && user.email) {
        console.log('✅ Zustand Auth: Valid token and user data found in cookies')
        set({
          user: user,
          isAuthenticated: true,
          isLoading: false
        })
        return
      }

      console.log('❌ Zustand Auth: No valid token/user data found')
      set({
        user: null,
        isAuthenticated: false,
        isLoading: false
      })
    } catch (error) {
      console.error('❌ Zustand Auth: Auth check error:', error)
      clientCookies.clearAuthCookies()
      set({
        user: null,
        isAuthenticated: false,
        isLoading: false
      })
    }
  }
}))