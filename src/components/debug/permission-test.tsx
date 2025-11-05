/**
 * Permission Test Component
 * Quick test to verify role management permissions are working
 */

'use client';

import { useEffect } from 'react';
import { usePermissions } from '@/lib/hooks/use-permissions';
import { clientCookies } from '@/lib/utils/cookies';
import { jwtDecode } from 'jwt-decode';

export function PermissionTest() {
  const { hasPermission, userRole, userPermissions } = usePermissions();

  useEffect(() => {
    // Test permission debugging
    console.group('🧪 Permission Test Results');
    
    const token = clientCookies.getToken();
    if (token) {
      try {
        const decoded: any = jwtDecode(token);
        console.log('📋 Token Info:', {
          adminLevel: decoded.adminLevel,
          role: decoded.role,
          permissions: decoded.permissions?.length || 0,
          email: decoded.email
        });
      } catch (e) {
        console.error('Token decode error:', e);
      }
    }

    console.log('👤 Current User:', {
      userRole,
      permissionCount: userPermissions.length,
      hasRoleManagement: hasPermission('user_management:read'),
      hasRoleWrite: hasPermission('role_management:write')
    });

    console.log('🔑 Key Permissions Check:', {
      'user_management:read': hasPermission('user_management:read'),
      'role_management:read': hasPermission('role_management:read'), 
      'role_management:write': hasPermission('role_management:write'),
      'system:full_access': hasPermission('system:full_access')
    });

    if (hasPermission('user_management:read')) {
      console.log('✅ Permission Test PASSED - User should be able to access roles');
    } else {
      console.log('❌ Permission Test FAILED - User cannot access roles');
    }

    console.groupEnd();
  }, [hasPermission, userRole, userPermissions]);

  if (!hasPermission('user_management:read')) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
        <p className="text-red-800 font-medium">❌ Permission Test Failed</p>
        <p className="text-red-600 text-sm">
          User role: {userRole} | Permissions: {userPermissions.length}
        </p>
        <p className="text-red-600 text-sm">Missing: user_management:read</p>
      </div>
    );
  }

  return (
    <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
      <p className="text-green-800 font-medium">✅ Permission Test Passed</p>
      <p className="text-green-600 text-sm">
        User role: {userRole} | Permissions: {userPermissions.length}
      </p>
      <p className="text-green-600 text-sm">Ready for role management!</p>
    </div>
  );
}