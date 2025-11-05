
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/hooks/use-auth';
import { clientCookies } from '@/lib/utils/cookies';

interface UseProtectedRouteOptions {
  requiredRoles?: string[];
  requiredSubscriptions?: string[];
  redirectTo?: string;
}

export function useProtectedRoute(options: UseProtectedRouteOptions = {}) {
  const {
    requiredRoles = [],
    requiredSubscriptions = [],
    redirectTo = '/login',
  } = options;

  const { user, isLoading, isAuthenticated } = useAuth();
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);

  useEffect(() => {
    if (isLoading) return;

    // Check authentication
    if (!isAuthenticated) {
      router.push(`${redirectTo}?redirect=${encodeURIComponent(window.location.pathname)}`);
      return;
    }

    // Check role authorization (using adminLevel for AdminUser)
    if (requiredRoles.length > 0) {
      const hasRequiredRole = user?.adminLevel && requiredRoles.includes(user.adminLevel);
      if (!hasRequiredRole) {
        setIsAuthorized(false);
        return;
      }
    }

    // Skip subscription authorization for AdminUser (not applicable)
    // if (requiredSubscriptions.length > 0) {
    //   const hasRequiredSubscription = user?.subscription && requiredSubscriptions.includes(user.subscription);
    //   if (!hasRequiredSubscription) {
    //     setIsAuthorized(false);
    //     return;
    //   }
    // }

    setIsAuthorized(true);
  }, [user, isLoading, isAuthenticated, requiredRoles, requiredSubscriptions, redirectTo, router]);

  return {
    isAuthorized,
    isLoading: isLoading || isAuthorized === null,
    user,
  };
}

// Hook for admin-only routes
export function useAdminRoute() {
  return useProtectedRoute({
    requiredRoles: ['admin', 'super_admin'],
  });
}

// Hook for subscription-based routes
export function useSubscriptionRoute(requiredSubscriptions: string[]) {
  return useProtectedRoute({
    requiredSubscriptions,
  });
}