/**
 * 🔐 Login Form - Modern Authentication with Eagle Token Manager
 * 
 * This component demonstrates the bulletproof authentication system:
 * ✅ Easy login with automatic token storage
 * ✅ Real-time validation and feedback
 * ✅ Automatic API authentication for all subsequent requests
 * ✅ No manual token management needed
 */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Eye, EyeOff, CheckCircle } from 'lucide-react';
import { useAuth } from '@/lib/hooks/useAuth';
import { toast } from 'sonner';

interface LoginFormProps {
  redirectTo?: string;
  onSuccess?: () => void;
}

export default function LoginForm({ redirectTo = '/', onSuccess }: LoginFormProps) {
  const router = useRouter();
  const { login, isLoading, error, clearError } = useAuth();
  
  // Form state
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: true,
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  // Handle input changes
  const handleChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear validation error when user starts typing
    if (validationErrors[field]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
    
    // Clear auth error
    if (error) {
      clearError();
    }
  };

  // Validate form
  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    
    if (!formData.email) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Please enter a valid email address';
    }
    
    if (!formData.password) {
      errors.password = 'Password is required';
    } else if (formData.password.length < 3) {
      errors.password = 'Password must be at least 3 characters';
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      console.log('🔐 Attempting login...');
      
      const response = await login({
        email: formData.email,
        password: formData.password,
        rememberMe: formData.rememberMe,
      });

      if (response.success) {
        console.log('✅ Login successful!');
        
        // Show success message
        toast.success(`Welcome back, ${response.user?.email || 'User'}!`);
        
        // Call success callback if provided
        if (onSuccess) {
          onSuccess();
        }
        
        // Small delay to show success message
        setTimeout(() => {
          // Redirect to the intended page or dashboard
          const redirectUrl = new URLSearchParams(window.location.search).get('redirect') || redirectTo;
          router.push(redirectUrl);
        }, 500);
      }
    } catch (error) {
      console.error('❌ Login failed:', error);
      
      // Error is automatically handled by the useAuth hook
      // and displayed in the error state
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Welcome Back</CardTitle>
          <CardDescription>
            Sign in to your Eagle Dashboard account
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email Field */}
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                disabled={isLoading}
                className={validationErrors.email ? 'border-red-500' : ''}
                autoComplete="email"
                autoFocus
              />
              {validationErrors.email && (
                <p className="text-sm text-red-600">{validationErrors.email}</p>
              )}
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={(e) => handleChange('password', e.target.value)}
                  disabled={isLoading}
                  className={validationErrors.password ? 'border-red-500 pr-10' : 'pr-10'}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  disabled={isLoading}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {validationErrors.password && (
                <p className="text-sm text-red-600">{validationErrors.password}</p>
              )}
            </div>

            {/* Remember Me */}
            <div className="flex items-center space-x-2">
              <input
                id="rememberMe"
                type="checkbox"
                checked={formData.rememberMe}
                onChange={(e) => handleChange('rememberMe', e.target.checked)}
                disabled={isLoading}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <Label htmlFor="rememberMe" className="text-sm text-gray-600">
                Keep me signed in
              </Label>
            </div>

            {/* Error Display */}
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Submit Button */}
            <Button 
              type="submit" 
              className="w-full" 
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing In...
                </>
              ) : (
                <>
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Sign In
                </>
              )}
            </Button>
          </form>

          {/* Additional Links */}
          <div className="mt-6 text-center space-y-2">
            <p className="text-sm text-gray-600">
              Don't have an account?{' '}
              <button 
                type="button"
                onClick={() => router.push('/register')}
                className="text-blue-600 hover:text-blue-800 font-medium"
              >
                Sign up here
              </button>
            </p>
            <p className="text-sm">
              <button 
                type="button"
                onClick={() => router.push('/forgot-password')}
                className="text-blue-600 hover:text-blue-800"
              >
                Forgot your password?
              </button>
            </p>
          </div>

          {/* Development Helper */}
          {process.env.NODE_ENV === 'development' && (
            <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <h4 className="text-sm font-medium text-blue-900 mb-2">
                Development Helper
              </h4>
              <p className="text-xs text-blue-700 mb-2">
                After successful login, your token will be automatically stored and included in all API requests.
              </p>
              <div className="text-xs font-mono text-blue-600 space-y-1">
                <p>• Console: window.eagleAuth.debug()</p>
                <p>• Status: window.setupAuth.status()</p>
                <p>• Check: window.setupAuth.checkLogin()</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}