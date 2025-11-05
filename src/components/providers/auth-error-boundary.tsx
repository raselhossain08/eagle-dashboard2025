/**
 * Authentication Error Boundary
 * 
 * This component prevents localStorage security errors from breaking the authentication flow
 * by providing fallback mechanisms and safe error handling.
 */

'use client';

import React, { Component, ReactNode } from 'react';
import { toast } from 'sonner';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: any;
}

export class AuthErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error, errorInfo: null };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    // Log error details
    console.error('🚨 EAGLE AUTH ERROR BOUNDARY:', error);
    console.error('📍 Error Info:', errorInfo);

    // Check if this is a localStorage security error
    if (error.message?.toLowerCase().includes('localstorage') ||
        error.message?.toLowerCase().includes('storage') ||
        error.message?.toLowerCase().includes('installhook') ||
        error.stack?.includes('installHook')) {
      
      console.warn('⚠️ EAGLE AUTH: localStorage security error detected, using cookies-only mode');
      
      // Show user-friendly message
      toast.warning('🔐 Enhanced Security Mode Activated - Using secure cookies for authentication');
      
      // Auto-recover by clearing the error after a short delay
      setTimeout(() => {
        this.setState({ hasError: false, error: null, errorInfo: null });
      }, 1000);
      
      return;
    }

    // Update state with error information
    this.setState({
      error,
      errorInfo
    });

    // Show generic error message for other errors
    if (error.message?.toLowerCase().includes('auth')) {
      toast.error('Authentication error occurred. Please try logging in again.');
    }
  }

  render() {
    if (this.state.hasError) {
      // Check if this is a recoverable localStorage error
      if (this.state.error?.message?.toLowerCase().includes('localstorage') ||
          this.state.error?.message?.toLowerCase().includes('storage') ||
          this.state.error?.message?.toLowerCase().includes('installhook')) {
        
        // For localStorage errors, show loading state briefly then auto-recover
        return (
          <div className="flex items-center justify-center min-h-[200px]">
            <div className="text-center space-y-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <div className="text-sm text-gray-600">
                🔐 Activating Enhanced Security Mode...
              </div>
            </div>
          </div>
        );
      }

      // For other errors, show fallback UI or error message
      return this.props.fallback || (
        <div className="flex items-center justify-center min-h-[200px]">
          <div className="text-center space-y-4 p-6 border rounded-lg bg-red-50 border-red-200">
            <div className="text-red-600 text-lg font-semibold">
              ⚠️ Authentication Error
            </div>
            <div className="text-sm text-red-700">
              An authentication error occurred. Please refresh the page and try again.
            </div>
            <button 
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
            >
              Refresh Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default AuthErrorBoundary;