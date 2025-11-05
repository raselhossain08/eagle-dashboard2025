// lib/auth/token.ts
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || process.env.NEXT_PUBLIC_JWT_SECRET || 'development-secret-key-change-in-production'

export interface DecodedToken {
  id: string
  email: string
  username: string
  adminLevel: string
  department: string
  type: string
  iat: number
  exp: number
  aud: string
  iss: string
}

export interface User {
  id: string
  firstName: string
  lastName: string
  fullName: string
  email: string
  username: string
  adminLevel: string
  department: string
  permissions: Permission[]
  profilePicture: string | null
  forcePasswordChange: boolean
  isTwoFactorEnabled: boolean
  lastLoginAt: string
}

export interface Permission {
  module: string
  actions: string[]
  _id: string
  id: string
}

export async function verifyToken(token: string): Promise<User | null> {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as DecodedToken
    
    // In a real application, you might want to fetch fresh user data from database
    // For now, we'll reconstruct the user object from the token
    // Note: This is a simplified version - adjust based on your token payload
    
    return {
      id: decoded.id,
      firstName: '', // You might need to store this in token or fetch from DB
      lastName: '',
      fullName: '',
      email: decoded.email,
      username: decoded.username,
      adminLevel: decoded.adminLevel,
      department: decoded.department,
      permissions: [], // You might need to fetch this from DB
      profilePicture: null,
      forcePasswordChange: false,
      isTwoFactorEnabled: false,
      lastLoginAt: new Date().toISOString()
    }
  } catch (error) {
    console.error('Token verification failed:', error)
    return null
  }
}

export function checkRoutePermissions(pathname: string, user: User): boolean {
  // Super admin has access to everything
  if (user.adminLevel === 'super_admin') {
    return true
  }

  // Check module-based permissions
  if (pathname.startsWith('/admin')) {
    return hasPermission(user, 'admin', 'read')
  }

  if (pathname.startsWith('/users')) {
    return hasPermission(user, 'users', 'read')
  }

  if (pathname.startsWith('/billing')) {
    return hasPermission(user, 'billing', 'read')
  }

  if (pathname.startsWith('/security')) {
    return hasPermission(user, 'security', 'read')
  }

  // Default allow for other authenticated routes
  return true
}

export function hasPermission(
  user: User, 
  module: string, 
  action: string
): boolean {
  const permission = user.permissions.find(p => p.module === module)
  if (!permission) return false
  
  return permission.actions.includes(action)
}