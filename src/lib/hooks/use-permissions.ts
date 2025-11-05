'use client';

import { useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';
import { clientCookies } from '../utils/cookies';

export interface Permission {
  hasPermission: (permission: string) => boolean;
  hasAnyPermission: (permissions: string[]) => boolean;
  hasAllPermissions: (permissions: string[]) => boolean;
  canManageRole: (targetRole: string) => boolean;
  userRole: string;
  userPermissions: string[];
  isLoading: boolean;
}

// Role hierarchy for permission checking
const ROLE_HIERARCHY = {
  user: 1,
  read_only: 2,
  support: 3,
  growth_marketing: 4,
  finance_admin: 5,
  admin: 6,
  superadmin: 7,
  super_admin: 7
} as const;

// Role-based permissions - matching backend
const ROLE_PERMISSIONS = {
  superadmin: [
    "system:full_access", "security:manage", "users:delete", "system:destroy",
    "users:read", "users:write", "users:manage", "reports:read", "reports:write",
    "dashboard:access", "analytics:read", "analytics:write", "system:read",
    "billing:manage", "invoices:manage", "refunds:process", "payouts:manage", 
    "taxes:manage", "financial_reports:view", "financial_reports:export",
    "discounts:manage", "campaigns:manage", "announcements:manage",
    "subscribers:lookup", "plans:change_non_financial", "receipts:resend", 
    "cancellations:initiate", "users:impersonate",
    "roles:view", "roles:create", "roles:edit", "roles:delete",
    "system_admin:read", "system_admin:write", "system_admin:delete", "system_admin:manage"
  ],
  super_admin: [
    "system:full_access", "security:manage", "users:delete", "system:destroy",
    "users:read", "users:write", "users:manage", "reports:read", "reports:write",
    "dashboard:access", "analytics:read", "analytics:write", "system:read",
    "billing:manage", "invoices:manage", "refunds:process", "payouts:manage", 
    "taxes:manage", "financial_reports:view", "financial_reports:export",
    "discounts:manage", "campaigns:manage", "announcements:manage",
    "subscribers:lookup", "plans:change_non_financial", "receipts:resend", 
    "cancellations:initiate", "users:impersonate",
    "roles:view", "roles:create", "roles:edit", "roles:delete",
    "system_admin:read", "system_admin:write", "system_admin:delete", "system_admin:manage"
  ],
  finance_admin: [
    "billing:manage", "invoices:manage", "refunds:process", "payouts:manage", 
    "taxes:manage", "financial_reports:view", "financial_reports:export",
    "dashboard:access", "users:read", "reports:read", "system:read",
    "roles:view"
  ],
  growth_marketing: [
    "discounts:manage", "campaigns:manage", "announcements:manage", 
    "analytics:read", "dashboard:access", "users:read", "reports:read", "system:read",
    "roles:view"
  ],
  support: [
    "subscribers:lookup", "plans:change_non_financial", "receipts:resend", 
    "cancellations:initiate", "users:impersonate", "dashboard:access", 
    "users:read", "users:write", "reports:read", "system:read",
    "roles:view"
  ],
  read_only: [
    "dashboard:access", "users:read", "reports:read", "analytics:read", "system:read",
    "roles:view"
  ],
  admin: [
    "users:read", "users:write", "users:manage", "reports:read", "reports:write",
    "dashboard:access", "analytics:read", "analytics:write", "system:read",
    "roles:view", "roles:edit", "system_admin:read", "system_admin:write"
  ],
  user: [
    "dashboard:access", "system:read"
  ]
} as const;

export function usePermissions(): Permission {
  const [userRole, setUserRole] = useState<string>('user');
  const [userPermissions, setUserPermissions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadUserPermissions = () => {
      try {
        // Use professional Eagle token system from cookies
        const token = clientCookies.getToken();
        
        if (!token) {
          setUserRole('user');
          setUserPermissions([]);
          setIsLoading(false);
          return;
        }

        // Decode professional Eagle token
        const decoded: any = jwtDecode(token);
        
        // Enhanced role and permission extraction for Eagle system
        let role = 'user';
        
        // Priority mapping: adminLevel -> userRole (same as middleware)
        if (decoded.adminLevel) {
          const adminLevelMapping: Record<string, string> = {
            'super_admin': 'superadmin',
            'finance_admin': 'admin', 
            'growth_marketing': 'admin',
            'support': 'admin',
            'read_only': 'user'
          };
          
          role = adminLevelMapping[decoded.adminLevel] || decoded.role || 'user';
        } else {
          // Fallback to role field if no adminLevel
          role = decoded.role || 'user';
        }
        let customPermissions = decoded.permissions || [];
        const department = decoded.department || '';
        
        // Fix for super_admin users - ensure they have all permissions
        if (decoded.adminLevel === 'super_admin' && customPermissions.length === 0) {
          customPermissions = [
            "system:full_access", "security:manage", "users:delete", "system:destroy",
            "users:read", "users:write", "users:manage", "reports:read", "reports:write",
            "dashboard:access", "analytics:read", "analytics:write", "system:read",
            "billing:manage", "invoices:manage", "refunds:process", "payouts:manage", 
            "taxes:manage", "financial_reports:view", "financial_reports:export",
            "discounts:manage", "campaigns:manage", "announcements:manage",
            "subscribers:lookup", "plans:change_non_financial", "receipts:resend", 
            "cancellations:initiate", "users:impersonate",
            "roles:view", "roles:create", "roles:edit", "roles:delete",
            "user_management:read", "user_management:write", "user_management:delete",
            "role_management:read", "role_management:write", "role_management:delete",
            "permission_management:read", "permission_management:write", "audit_logs:read",
            "system_admin:read", "system_admin:write", "system_admin:delete", "system_admin:manage"
          ];
        }
        
        setUserRole(role);
        setUserPermissions(customPermissions);
        setIsLoading(false);
      } catch (error) {
        setUserRole('user');
        setUserPermissions([]);
        setIsLoading(false);
      }
    };

    loadUserPermissions();
  }, []);

  const getRolePermissions = (role: string): string[] => {
    return [...(ROLE_PERMISSIONS[role as keyof typeof ROLE_PERMISSIONS] || ROLE_PERMISSIONS.user)];
  };

  const getEffectivePermissions = (): string[] => {
    const rolePerms = getRolePermissions(userRole);
    return [...new Set([...rolePerms, ...userPermissions])];
  };

  const hasPermission = (permission: string): boolean => {
    // Super admin has all permissions
    if (userRole === 'superadmin' || userRole === 'super_admin') return true;
    
    const effectivePermissions = getEffectivePermissions();
    return effectivePermissions.includes(permission);
  };

  const hasAnyPermission = (permissions: string[]): boolean => {
    return permissions.some(permission => hasPermission(permission));
  };

  const hasAllPermissions = (permissions: string[]): boolean => {
    return permissions.every(permission => hasPermission(permission));
  };

  const canManageRole = (targetRole: string): boolean => {
    const userHierarchy = ROLE_HIERARCHY[userRole as keyof typeof ROLE_HIERARCHY] || 0;
    const targetHierarchy = ROLE_HIERARCHY[targetRole as keyof typeof ROLE_HIERARCHY] || 0;
    return userHierarchy > targetHierarchy;
  };

  return {
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    canManageRole,
    userRole,
    userPermissions: getEffectivePermissions(),
    isLoading
  };
}