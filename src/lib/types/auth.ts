// types/auth.ts
export interface LoginCredentials {
  email: string
  password: string
  twoFactorCode?: string
}

export interface AuthResponse {
  success: boolean
  message: string
  token: string
  user: AuthUser
  expiresIn: number
  requires2FA?: boolean
}

export interface TwoFASetup {
  qrCode: string
  secret: string
}

export interface PasswordChange {
  currentPassword: string
  newPassword: string
}

// types/rbac.ts
export interface Permission {
  id: string
  resource: string
  action: string
  description: string
  category: string
  createdAt: string
  updatedAt: string
}

export interface Role {
  id: string
  name: string
  description: string
  permissions: Permission[]
  userCount: number
  createdAt: string
  updatedAt: string
}

export interface AuthUser {
  id: string
  firstName: string
  lastName: string
  fullName: string
  email: string
  username: string
  adminLevel: 'super_admin' | 'admin' | 'moderator'
  department: string
  permissions: Permission[]
  roles: Role[]
  profilePicture?: string
  forcePasswordChange: boolean
  isTwoFactorEnabled: boolean
  lastLoginAt: string
  status: 'active' | 'inactive' | 'suspended'
  createdAt: string
  updatedAt: string
}

export interface UserRole {
  id: string
  userId: string
  roleId: string
  expiresAt?: string
  user: AuthUser
  role: Role
}

export interface AuditLog {
  id: string
  userId: string
  action: string
  resource: string
  resourceId?: string
  description: string
  ipAddress: string
  userAgent: string
  timestamp: string
  user: AuthUser
}

export interface ListParams {
  page?: number
  limit?: number
  search?: string
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
  [key: string]: any
}