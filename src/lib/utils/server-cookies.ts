// lib/utils/server-cookies.ts
// Server-side cookie utilities for middleware and server components

import { cookies } from 'next/headers'
import type { NextRequest } from 'next/server'

export const TOKEN_NAME = 'admin_token'
export const USER_DATA_NAME = 'admin_user'
export const REFRESH_TOKEN_NAME = 'admin_refresh_token'

// Server-side functions for server components (using Next.js cookies)
export async function getServerToken(): Promise<string | null> {
  try {
    const cookieStore = await cookies()
    return cookieStore.get(TOKEN_NAME)?.value || null
  } catch (error) {
    console.error('Error getting server token:', error)
    return null
  }
}

export async function getServerUserData(): Promise<any | null> {
  try {
    const cookieStore = await cookies()
    const userData = cookieStore.get(USER_DATA_NAME)?.value
    return userData ? JSON.parse(userData) : null
  } catch (error) {
    console.error('Error getting server user data:', error)
    return null
  }
}

export async function clearServerAuthCookies(): Promise<void> {
  try {
    const cookieStore = await cookies()
    cookieStore.delete(TOKEN_NAME)
    cookieStore.delete(USER_DATA_NAME)
    cookieStore.delete(REFRESH_TOKEN_NAME)
  } catch (error) {
    console.error('Error clearing server cookies:', error)
  }
}

// Middleware-specific functions (using NextRequest)
export function getTokenFromRequest(request: NextRequest): string | null {
  return request.cookies.get(TOKEN_NAME)?.value || null
}

export function getUserDataFromRequest(request: NextRequest): any | null {
  try {
    const userData = request.cookies.get(USER_DATA_NAME)?.value
    return userData ? JSON.parse(userData) : null
  } catch (error) {
    console.error('Error parsing user data from request:', error)
    return null
  }
}