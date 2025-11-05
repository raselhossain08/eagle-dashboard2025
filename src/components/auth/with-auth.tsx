
'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/hooks/use-auth';
import { getToken, getUserData, clientCookies } from '@/lib/utils/cookies';
import { Loader2 } from 'lucide-react';

interface WithAuthProps {
  requiredRoles?: string[];
  requiredSubscriptions?: string[];
  redirectTo?: string;
  fallback?: React.ComponentType;
}

interface AuthCheckResult {
  isAuthenticated: boolean;
  hasRequiredRole: boolean;
  hasRequiredSubscription: boolean;
  isLoading: boolean;
}

function LoadingSpinner() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="text-center">
        <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
        <p className="text-gray-600 dark:text-gray-400">Loading...</p>
      </div>
    </div>
  );
}

function AccessDenied({ message }: { message: string }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="text-center max-w-md mx-auto p-6">
        <div className="w-16 h-16 mx-auto mb-4 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center">
          <svg className="w-8 h-8 text-red-600 dark:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
          Access Denied
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          {message}
        </p>
        <button
          onClick={() => window.history.back()}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Go Back
        </button>
      </div>
    </div>
  );
}

export function withAuth<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  options: WithAuthProps = {}
) {
  const {
    requiredRoles = [],
    requiredSubscriptions = [],
    redirectTo = '/login',
    fallback: FallbackComponent = LoadingSpinner,
  } = options;

  const WithAuthComponent: React.FC<P> = (props) => {
    const { user, isLoading, isAuthenticated } = useAuth();
    const router = useRouter();
    const [authCheck, setAuthCheck] = useState<AuthCheckResult>({
      isAuthenticated: false,
      hasRequiredRole: false,
      hasRequiredSubscription: false,
      isLoading: true,
    });

    useEffect(() => {
      checkAuthentication();
    }, [user, isLoading, isAuthenticated]);

    // Initialize auth check on mount
    useEffect(() => {
      const { checkAuth } = useAuth.getState();
      checkAuth();
    }, []);

    const checkAuthentication = () => {
      if (isLoading) {
        setAuthCheck(prev => ({ ...prev, isLoading: true }));
        return;
      }

      console.log('🦅 EAGLE withAuth: Professional authentication check:', { 
        isAuthenticated, 
        hasToken: !!clientCookies.getAccessToken(),
        authStatus: clientCookies.getAuthenticationStatus(),
        pathname: window.location.pathname,
        user: user ? { id: user.id, email: user.email, adminLevel: user.adminLevel } : null
      });
      
      if (!isAuthenticated) {
        console.log('❌ withAuth: Not authenticated, redirecting to login');
        router.push(`${redirectTo}?redirect=${encodeURIComponent(window.location.pathname)}`);
        return;
      }

      const hasRequiredRole = requiredRoles.length === 0 || 
        Boolean(user?.adminLevel && requiredRoles.includes(user.adminLevel));

      const hasRequiredSubscription = requiredSubscriptions.length === 0; // No subscription support for AdminUser

      setAuthCheck({
        isAuthenticated,
        hasRequiredRole,
        hasRequiredSubscription,
        isLoading: false,
      });
    };

    // Show loading spinner while checking authentication
    if (authCheck.isLoading) {
      return <FallbackComponent />;
    }

    // Show access denied for role restrictions
    if (!authCheck.hasRequiredRole) {
      return (
        <AccessDenied 
          message={`You need one of the following roles: ${requiredRoles.join(', ')}`} 
        />
      );
    }

    // Show access denied for subscription restrictions
    if (!authCheck.hasRequiredSubscription) {
      return (
        <AccessDenied 
          message={`You need one of the following subscriptions: ${requiredSubscriptions.join(', ')}`} 
        />
      );
    }

    // Render the protected component
    return <WrappedComponent {...props} />;
  };

  WithAuthComponent.displayName = `withAuth(${WrappedComponent.displayName || WrappedComponent.name})`;

  return WithAuthComponent;
}

// Higher-order component for admin-only pages
export const withAdminAuth = <P extends object>(WrappedComponent: React.ComponentType<P>) => {
  return withAuth(WrappedComponent, {
    requiredRoles: ['admin', 'super_admin'],
  });
};

// Higher-order component for subscription-based access
export const withSubscriptionAuth = <P extends object>(
  WrappedComponent: React.ComponentType<P>,
  requiredSubscriptions: string[]
) => {
  return withAuth(WrappedComponent, {
    requiredSubscriptions,
  });
};

export default withAuth;