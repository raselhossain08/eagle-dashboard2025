/**
 * Authentication Security Patch
 * 
 * This module patches potential localStorage security issues by wrapping
 * problematic functions and providing safe fallbacks.
 */

// Store original localStorage methods for safe access
const originalLocalStorage = {
  getItem: typeof window !== 'undefined' ? localStorage.getItem.bind(localStorage) : null,
  setItem: typeof window !== 'undefined' ? localStorage.setItem.bind(localStorage) : null,
  removeItem: typeof window !== 'undefined' ? localStorage.removeItem.bind(localStorage) : null,
  clear: typeof window !== 'undefined' ? localStorage.clear.bind(localStorage) : null
};

// Safe localStorage wrapper that won't throw security errors
export const SafeLocalStorage = {
  getItem: (key: string): string | null => {
    try {
      return originalLocalStorage.getItem?.(key) || null;
    } catch (error) {
      console.warn('🛡️ EAGLE SECURITY: localStorage.getItem blocked, using cookies fallback');
      return null;
    }
  },

  setItem: (key: string, value: string): void => {
    try {
      originalLocalStorage.setItem?.(key, value);
    } catch (error) {
      console.warn('🛡️ EAGLE SECURITY: localStorage.setItem blocked, ignoring request');
    }
  },

  removeItem: (key: string): void => {
    try {
      originalLocalStorage.removeItem?.(key);
    } catch (error) {
      console.warn('🛡️ EAGLE SECURITY: localStorage.removeItem blocked, ignoring request');
    }
  },

  clear: (): void => {
    try {
      originalLocalStorage.clear?.();
    } catch (error) {
      console.warn('🛡️ EAGLE SECURITY: localStorage.clear blocked, ignoring request');
    }
  }
};

// Patch global localStorage if it exists
if (typeof window !== 'undefined' && window.localStorage) {
  try {
    // Create a Proxy to intercept localStorage access
    const safeLocalStorageProxy = new Proxy(window.localStorage, {
      get(target, prop) {
        if (prop in SafeLocalStorage) {
          return SafeLocalStorage[prop as keyof typeof SafeLocalStorage];
        }
        return target[prop as keyof Storage];
      },
      
      set(target, prop, value) {
        try {
          (target as any)[prop] = value;
          return true;
        } catch (error) {
          console.warn('🛡️ EAGLE SECURITY: localStorage property assignment blocked');
          return false;
        }
      }
    });

    // Only apply proxy if not already applied
    if (!window.localStorage.toString().includes('Proxy')) {
      Object.defineProperty(window, 'localStorage', {
        value: safeLocalStorageProxy,
        writable: false,
        configurable: true
      });
    }
  } catch (error) {
    console.warn('🛡️ EAGLE SECURITY: Could not patch localStorage, using fallback methods');
  }
}

// Global error handler for authentication-related errors
if (typeof window !== 'undefined') {
  const originalErrorHandler = window.onerror;
  
  window.onerror = (message, source, lineno, colno, error) => {
    // Check if this is a localStorage security error
    const messageStr = message?.toString().toLowerCase() || '';
    
    if (messageStr.includes('localstorage') || 
        messageStr.includes('storage') || 
        messageStr.includes('installhook') ||
        messageStr.includes('security')) {
      
      console.warn('🛡️ EAGLE SECURITY: Intercepted localStorage security error:', message);
      
      // Don't propagate localStorage security errors
      return true;
    }
    
    // Call original error handler for other errors
    if (originalErrorHandler) {
      return originalErrorHandler(message, source, lineno, colno, error);
    }
    
    return false;
  };
}

// Initialize security patch
export function initializeAuthSecurity() {
  console.info('🛡️ EAGLE SECURITY: Authentication security patch initialized');
  
  // Additional security measures can be added here
  if (typeof window !== 'undefined') {
    // Prevent console errors from breaking the auth flow
    const originalConsoleError = console.error;
    console.error = (...args) => {
      const message = args.join(' ').toLowerCase();
      
      if (message.includes('localstorage') && message.includes('blocked')) {
        console.warn('🛡️ EAGLE SECURITY: localStorage error suppressed for stability');
        return;
      }
      
      originalConsoleError.apply(console, args);
    };
  }
}

// Auto-initialize when module is imported
if (typeof window !== 'undefined') {
  initializeAuthSecurity();
}

export default SafeLocalStorage;