import { useState, useEffect, useCallback } from 'react';

interface ConnectionStatus {
  isOnline: boolean;
  isApiReachable: boolean;
  lastChecked: Date | null;
  checkConnection: () => Promise<void>;
}

export function useConnectionStatus(): ConnectionStatus {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isApiReachable, setIsApiReachable] = useState(true);
  const [lastChecked, setLastChecked] = useState<Date | null>(null);

  const checkApiConnection = useCallback(async (): Promise<boolean> => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/health`,
        {
          method: 'GET',
          signal: AbortSignal.timeout(10000), // 10 second timeout
          cache: 'no-cache'
        }
      );
      return response.ok;
    } catch (error) {
      console.warn('API health check failed:', error);
      return false;
    }
  }, []);

  const checkConnection = useCallback(async () => {
    setLastChecked(new Date());
    
    if (!navigator.onLine) {
      setIsOnline(false);
      setIsApiReachable(false);
      return;
    }

    setIsOnline(true);
    const apiReachable = await checkApiConnection();
    setIsApiReachable(apiReachable);
  }, [checkApiConnection]);

  // Listen for online/offline events
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      checkConnection();
    };

    const handleOffline = () => {
      setIsOnline(false);
      setIsApiReachable(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Initial check
    checkConnection();

    // Periodic API health check
    const interval = setInterval(checkConnection, 60000); // Check every minute

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(interval);
    };
  }, [checkConnection]);

  return {
    isOnline,
    isApiReachable,
    lastChecked,
    checkConnection
  };
}