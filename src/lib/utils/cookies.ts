// lib/utils/cookies.ts

import Cookies from 'js-cookie'
import type { NextRequest } from 'next/server'

export const TOKEN_NAME = 'admin_token'  // Primary token name for frontend
export const TOKEN_NAME_BACKEND = 'adminToken'  // Backend cookie name (httpOnly)
export const USER_DATA_NAME = 'admin_user'
export const REFRESH_TOKEN_NAME = 'admin_refresh_token'

export interface CookieOptions {
  maxAge?: number
  path?: string
  secure?: boolean
  sameSite?: 'strict' | 'lax' | 'none'
}

// Client-side cookie options (for js-cookie)
const clientOptions = {
  expires: 1 / 3, // 8 hours (1/3 of a day)
  path: '/',
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict' as const
}

// Main cookie functions using js-cookie (client-side only)
export function setAuthCookies(token: string, userData: any, refreshToken?: string) {
  // Set access token
  Cookies.set(TOKEN_NAME, token, clientOptions)

  // Set user data
  Cookies.set(USER_DATA_NAME, JSON.stringify(userData), clientOptions)

  // Set refresh token if provided (longer expiry)
  if (refreshToken) {
    Cookies.set(REFRESH_TOKEN_NAME, refreshToken, {
      ...clientOptions,
      expires: 7 // 7 days
    })
  }
}

export function getAuthCookies() {
  const token = Cookies.get(TOKEN_NAME)
  const userData = Cookies.get(USER_DATA_NAME)
  const refreshToken = Cookies.get(REFRESH_TOKEN_NAME)

  return {
    token: token || null,
    user: userData ? JSON.parse(userData) : null,
    refreshToken: refreshToken || null
  }
}

export function clearAuthCookies() {
  console.log('🧹 Clearing authentication cookies...')
  console.trace('Cookie clear called from:')
  Cookies.remove(TOKEN_NAME, { path: '/' })
  Cookies.remove(USER_DATA_NAME, { path: '/' })
  Cookies.remove(REFRESH_TOKEN_NAME, { path: '/' })
  console.log('✅ Authentication cookies cleared')
}

export function getToken(): string | null {
  return Cookies.get(TOKEN_NAME) || null
}

export function getUserData(): any | null {
  const userData = Cookies.get(USER_DATA_NAME)
  return userData ? JSON.parse(userData) : null
}

export function updateUserData(userData: any) {
  Cookies.set(USER_DATA_NAME, JSON.stringify(userData), clientOptions)
}





// Client-side functions for use in client components
export const clientCookies = {
  setAuthCookies: (token: string, userData: any, refreshToken?: string) => {
    // Set access token
    Cookies.set(TOKEN_NAME, token, clientOptions)

    // Set user data
    Cookies.set(USER_DATA_NAME, JSON.stringify(userData), clientOptions)

    // Set refresh token if provided (longer expiry)
    if (refreshToken) {
      Cookies.set(REFRESH_TOKEN_NAME, refreshToken, {
        ...clientOptions,
        expires: 7 // 7 days
      })
    }
  },

  getAuthCookies: () => {
    const token = Cookies.get(TOKEN_NAME)
    const userData = Cookies.get(USER_DATA_NAME)
    const refreshToken = Cookies.get(REFRESH_TOKEN_NAME)

    return {
      token: token || null,
      user: userData ? JSON.parse(userData) : null,
      refreshToken: refreshToken || null
    }
  },

  clearAuthCookies: () => {
    console.log('🧹 ClientCookies: Clearing authentication cookies...')
    console.trace('ClientCookies clear called from:')
    Cookies.remove(TOKEN_NAME, { path: '/' })
    Cookies.remove(USER_DATA_NAME, { path: '/' })
    Cookies.remove(REFRESH_TOKEN_NAME, { path: '/' })
    console.log('✅ ClientCookies: Authentication cookies cleared')
  },

  getToken: (): string | null => {
    return Cookies.get(TOKEN_NAME) || null
  },

  getUserData: (): any | null => {
    const userData = Cookies.get(USER_DATA_NAME)
    return userData ? JSON.parse(userData) : null
  },

  updateUserData: (userData: any) => {
    Cookies.set(USER_DATA_NAME, JSON.stringify(userData), clientOptions)
  },

  isAuthenticated: (): boolean => {
    const token = Cookies.get(TOKEN_NAME)
    const userData = Cookies.get(USER_DATA_NAME)
    return !!(token && userData)
  },

  // Additional methods for TokenUtils compatibility
  getRefreshToken: (): string | null => {
    return Cookies.get(REFRESH_TOKEN_NAME) || null
  },

  setToken: (token: string) => {
    Cookies.set(TOKEN_NAME, token, clientOptions)
  },

  setRefreshToken: (refreshToken: string) => {
    Cookies.set(REFRESH_TOKEN_NAME, refreshToken, {
      ...clientOptions,
      expires: 7 // 7 days
    })
  },

  performSecureLogout: () => {
    // Clear all auth cookies
    Cookies.remove(TOKEN_NAME, { path: '/' })
    Cookies.remove(USER_DATA_NAME, { path: '/' })
    Cookies.remove(REFRESH_TOKEN_NAME, { path: '/' })
  },

  getAccessToken: (): string | null => {
    return Cookies.get(TOKEN_NAME) || null
  },

  setUserSession: (userData: any) => {
    Cookies.set(USER_DATA_NAME, JSON.stringify(userData), clientOptions)
  },

  // Mock methods that were in TokenUtils but may not be directly applicable to cookies
  getTokenHealth: () => {
    const token = Cookies.get(TOKEN_NAME)
    const userData = Cookies.get(USER_DATA_NAME)
    return {
      isValid: !!(token && userData),
      hasToken: !!token,
      hasUserData: !!userData,
      isExpired: false // Cookies handle expiry automatically
    }
  },

  getAuthenticationStatus: (): string => {
    const token = Cookies.get(TOKEN_NAME)
    const userData = Cookies.get(USER_DATA_NAME)
    if (token && userData) return 'authenticated'
    if (token) return 'token_only'
    return 'unauthenticated'
  }
}