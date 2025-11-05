
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/providers';
import { CookieManager } from '@/lib/utils/cookie-manager';

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

  const { user, loading } = useAuth();
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);

  useEffect(() => {
    if (loading) return;

    // Check authentication
    // if (!CookieManager.isAuthenticated()) {
    //   router.push(`${redirectTo}?redirect=${encodeURIComponent(window.location.pathname)}`);
    //   return;
    // }

    // Check role authorization
    if (requiredRoles.length > 0) {
      const hasRequiredRole = user?.role && requiredRoles.includes(user.role);
      if (!hasRequiredRole) {
        setIsAuthorized(false);
        return;
      }
    }

    // Check subscription authorization
    if (requiredSubscriptions.length > 0) {
      const hasRequiredSubscription = user?.subscription && requiredSubscriptions.includes(user.subscription);
      if (!hasRequiredSubscription) {
        setIsAuthorized(false);
        return;
      }
    }

    setIsAuthorized(true);
  }, [user, loading, requiredRoles, requiredSubscriptions, redirectTo, router]);

  return {
    isAuthorized,
    isLoading: loading || isAuthorized === null,
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