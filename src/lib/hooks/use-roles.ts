
import { useState, useEffect, useCallback, useRef } from 'react';
import RoleService, { Role } from '@/services/admin';
import { toast } from 'sonner';

export interface UseRolesResult {
  roles: Role[];
  loading: boolean;
  error: Error | null;
  refresh: () => Promise<void>;
  lastUpdated: Date | null;
}

export function useRoles(): UseRolesResult {
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const mountedRef = useRef(true);

  const fetchRoles = useCallback(async (forceRefresh: boolean = false) => {
    if (!mountedRef.current) return;

    try {
      setError(null);
      setLoading(true);

      const response = await RoleService.getRoles(forceRefresh);
      
      if (!mountedRef.current) return;

      setRoles(response.data);
      setLastUpdated(new Date());

    } catch (err) {
      if (!mountedRef.current) return;

      const error = err instanceof Error ? err : new Error('Failed to fetch roles');
      setError(error);
      
      // Only show error toast, no console logging for speed
      toast.error(`Failed to load roles: ${error.message}`);
    } finally {
      if (mountedRef.current) {
        setLoading(false);
      }
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      mountedRef.current = false;
    };
  }, []);

  // Initial fetch
  useEffect(() => {
    fetchRoles();
  }, [fetchRoles]);

  const refresh = useCallback(async () => {
    await fetchRoles(true);
  }, [fetchRoles]);

  return {
    roles,
    loading,
    error,
    refresh,
    lastUpdated
  };
}