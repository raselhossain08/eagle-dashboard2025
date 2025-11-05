'use client';

import React, { ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { useSimpleAuth } from '@/lib/hooks/use-simple-auth';
import { Loader2, ShieldX } from 'lucide-react';

interface ProtectedRouteProps {
  children: ReactNode;
  requiredRole?: 'admin' | 'superadmin' | 'user';
  fallback?: ReactNode;
}

function LoadingScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="text-center">
        <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
        <p className="text-gray-600 dark:text-gray-400">Checking authentication...</p>
      </div>
    </div>
  );
}

function AccessDeniedScreen({ message }: { message: string }) {
  const router = useRouter();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="text-center max-w-md mx-auto p-6">
        <div className="w-16 h-16 mx-auto mb-4 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center">
          <ShieldX className="w-8 h-8 text-red-600 dark:text-red-400" />
        </div>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
          Access Denied
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          {message}
        </p>
        <div className="flex gap-3 justify-center">
          <button
            onClick={() => router.push('/login')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Login
          </button>
          <button
            onClick={() => router.back()}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    </div>
  );
}

export function ProtectedRoute({ children, requiredRole, fallback }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, hasRole, user } = useSimpleAuth();
  const router = useRouter();

  // Show loading screen while checking authentication
  if (isLoading) {
    return fallback || <LoadingScreen />;
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    router.push('/login');
    return <LoadingScreen />;
  }

  // Check role requirements
  if (requiredRole && !hasRole(requiredRole)) {
    const roleMessages = {
      admin: 'You need administrator privileges to access this page.',
      superadmin: 'You need super administrator privileges to access this page.',
      user: 'You need user access to view this page.'
    };

    return (
      <AccessDeniedScreen 
        message={`${roleMessages[requiredRole]} Your current role: ${user?.role || user?.adminLevel || 'Unknown'}`}
      />
    );
  }

  // Render protected content
  return <>{children}</>;
}

// Higher-order component for admin protection
export function withAdminProtection<P extends object>(
  WrappedComponent: React.ComponentType<P>
) {
  return function AdminProtectedComponent(props: P) {
    return (
      <ProtectedRoute requiredRole="admin">
        <WrappedComponent {...props} />
      </ProtectedRoute>
    );
  };
}

// Higher-order component for super admin protection
export function withSuperAdminProtection<P extends object>(
  WrappedComponent: React.ComponentType<P>
) {
  return function SuperAdminProtectedComponent(props: P) {
    return (
      <ProtectedRoute requiredRole="superadmin">
        <WrappedComponent {...props} />
      </ProtectedRoute>
    );
  };
}

export default ProtectedRoute;