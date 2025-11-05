'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/components/providers';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Eye, EyeOff, Loader2, Mail, Lock, Shield, Smartphone, QrCode, Key, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { AuthService } from '@/lib/services';
import AdminAuthService from '@/lib/services/admin/admin-auth.service';
import { TokenUtils } from '@/lib/utils/token.utils';

function LoginContent() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // 2FA State
  const [requires2FA, setRequires2FA] = useState(false);
  const [twoFactorCode, setTwoFactorCode] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [twoFactorMethod, setTwoFactorMethod] = useState<'app' | 'backup'>('app');

  const { loading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const redirectTo = searchParams.get('redirect') || '/';
  const message = searchParams.get('message');

  useEffect(() => {
    if (message === 'registration-success') {
      toast.success('Registration successful! Please check your email and login.');
    } else if (message === 'password-reset-success') {
      toast.success('Password reset successful! Please login with your new password.');
    } else if (message === 'account-activated') {
      toast.success('Account activated successfully! Please login.');
    }
  }, [message]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Use AdminAuthService for admin login
      const response = await AdminAuthService.login({
        email: formData.email,
        password: formData.password
      });
      
      if (response.requiresTwoFactor) {
        setRequires2FA(true);
        setUserEmail(response.email || formData.email);
        toast.info('Two-factor authentication required');
      } else if (response.success && response.token && response.user) {
        // Token and user are already stored by AdminAuthService
        
        // Verify token was set correctly
        const verifyToken = TokenUtils.getToken();
        if (!verifyToken) {
          console.error('❌ Token not found after admin login');
          toast.error('Authentication error. Please try logging in again.');
          return;
        }
        
        console.log('✅ Admin login successful, token verified:', {
          tokenLength: verifyToken.length,
          adminLevel: response.user?.adminLevel,
          department: response.user?.department
        });
        
        // Check if password change is required
        if (response.user.forcePasswordChange) {
          toast.info('Password change required. Redirecting...');
          setTimeout(() => {
            window.location.href = '/change-password';
          }, 1000);
          return;
        }
        
        toast.success('Admin login successful!');
        
        setTimeout(() => {
          window.location.href = redirectTo;
        }, 500);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Admin login failed';
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handle2FAVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (twoFactorMethod === 'app' && (!twoFactorCode || twoFactorCode.length !== 6)) {
      toast.error('Please enter a valid 6-digit code');
      return;
    }

    if (twoFactorMethod === 'backup' && !twoFactorCode) {
      toast.error('Please enter a backup code');
      return;
    }

    setIsSubmitting(true);
    
    try {
      const response = await AdminAuthService.loginWith2FA({
        email: userEmail,
        token: twoFactorCode
      });
      
      if (response.success && response.token && response.user) {
        // Token and user are already stored by AdminAuthService
        
        // Verify token was set correctly
        const verifyToken = TokenUtils.getToken();
        if (!verifyToken) {
          console.error('❌ Token not found after 2FA login');
          toast.error('Authentication error. Please try logging in again.');
          return;
        }
        
        console.log('✅ Admin 2FA login successful, token verified:', {
          tokenLength: verifyToken.length,
          adminLevel: response.user?.adminLevel,
          department: response.user?.department
        });
        
        // Check if password change is required
        if (response.user.forcePasswordChange) {
          toast.info('Password change required. Redirecting...');
          setTimeout(() => {
            window.location.href = '/change-password';
          }, 1000);
          return;
        }
        
        if (response.usedBackupCode) {
          toast.success('Admin login successful! You used a backup recovery code.');
        } else {
          toast.success('Admin login successful!');
        }
        
        setTimeout(() => {
          window.location.href = redirectTo;
        }, 500);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : '2FA verification failed';
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBackToLogin = () => {
    setRequires2FA(false);
    setTwoFactorCode('');
    setUserEmail('');
    setTwoFactorMethod('app');
  };

  const isLoading = loading || isSubmitting;

  return (
    <div className=" px-4 py-8">
      <div className="w-full  space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-10 h-10 bg-linear-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
              <Shield className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold bg-linear-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Eagle Dashboard
            </h1>
          </div>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
            {requires2FA ? 'Secure Verification' : 'Admin Login'}
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            {requires2FA 
              ? 'Verify your identity to continue'
              : 'Sign in to access the admin dashboard'
            }
          </p>
        </div>

        <Card className="border-0 shadow-xl dark:shadow-gray-900/20">
          <CardContent className="p-6">
            {requires2FA ? (
              // Enhanced 2FA Verification
              <div className="space-y-6">
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <Mail className="h-4 w-4" />
                  <span>{userEmail}</span>
                </div>

                <Alert className="bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800">
                  <Shield className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  <AlertDescription className="text-blue-800 dark:text-blue-300">
                    Two-factor authentication is enabled for your account
                  </AlertDescription>
                </Alert>

                <Tabs value={twoFactorMethod} onValueChange={(value: string) => {
                  if (value === 'app' || value === 'backup') {
                    setTwoFactorMethod(value);
                  }
                }} className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="app" className="flex items-center gap-2">
                      <Smartphone className="h-4 w-4" />
                      Authenticator App
                    </TabsTrigger>
                    <TabsTrigger value="backup" className="flex items-center gap-2">
                      <Key className="h-4 w-4" />
                      Backup Code
                    </TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="app" className="space-y-4 pt-4">
                    <div className="text-center space-y-2">
                      <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-xl flex items-center justify-center mx-auto mb-2">
                        <QrCode className="h-8 w-8 text-gray-600 dark:text-gray-400" />
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Enter the 6-digit code from your authenticator app
                      </p>
                    </div>
                    
                    <form onSubmit={handle2FAVerification} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="appCode">Authentication Code</Label>
                        <Input
                          id="appCode"
                          type="text"
                          inputMode="numeric"
                          pattern="[0-9]*"
                          placeholder="000000"
                          value={twoFactorCode}
                          onChange={(e) => setTwoFactorCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                          className="text-center text-2xl font-mono tracking-widest h-12"
                          disabled={isSubmitting}
                          autoComplete="one-time-code"
                          autoFocus
                        />
                      </div>

                      <Button
                        type="submit"
                        className="w-full"
                        disabled={isSubmitting || twoFactorCode.length !== 6}
                        size="lg"
                      >
                        {isSubmitting ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Verifying...
                          </>
                        ) : (
                          <>
                            <Shield className="mr-2 h-4 w-4" />
                            Verify & Continue
                          </>
                        )}
                      </Button>
                    </form>
                  </TabsContent>
                  
                  <TabsContent value="backup" className="space-y-4 pt-4">
                    <Alert className="bg-amber-50 border-amber-200 dark:bg-amber-900/20 dark:border-amber-800">
                      <Key className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                      <AlertDescription className="text-amber-800 dark:text-amber-300">
                        Each backup code can only be used once
                      </AlertDescription>
                    </Alert>
                    
                    <form onSubmit={handle2FAVerification} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="backupCode">Backup Recovery Code</Label>
                        <Input
                          id="backupCode"
                          type="text"
                          placeholder="Enter backup code"
                          value={twoFactorCode}
                          onChange={(e) => setTwoFactorCode(e.target.value.toUpperCase())}
                          className="text-center font-mono h-12"
                          disabled={isSubmitting}
                          autoFocus
                        />
                        <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
                          Enter one of your 8-digit backup codes
                        </p>
                      </div>

                      <Button
                        type="submit"
                        className="w-full"
                        disabled={isSubmitting || !twoFactorCode}
                        size="lg"
                      >
                        {isSubmitting ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Verifying...
                          </>
                        ) : (
                          <>
                            <Key className="mr-2 h-4 w-4" />
                            Use Backup Code
                          </>
                        )}
                      </Button>
                    </form>
                  </TabsContent>
                </Tabs>

                <Button
                  type="button"
                  variant="ghost"
                  className="w-full"
                  onClick={handleBackToLogin}
                  disabled={isSubmitting}
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Login
                </Button>
              </div>
            ) : (
              // Enhanced Login Form
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm font-medium">Email Address</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        placeholder="Enter your email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className={`pl-10 h-11 ${errors.email ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
                        disabled={isLoading}
                        autoComplete="email"
                      />
                    </div>
                    {errors.email && (
                      <p className="text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                        {errors.email}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="password" className="text-sm font-medium">Password</Label>
                      <Link
                        href="/forgot-password"
                        className="text-sm text-blue-600 hover:text-blue-500 dark:text-blue-400 font-medium"
                      >
                        Forgot password?
                      </Link>
                    </div>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="password"
                        name="password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Enter your password"
                        value={formData.password}
                        onChange={handleInputChange}
                        className={`pl-10 pr-10 h-11 ${errors.password ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
                        disabled={isLoading}
                        autoComplete="current-password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-3 h-4 w-4 text-gray-400 hover:text-gray-600 transition-colors"
                        disabled={isLoading}
                      >
                        {showPassword ? <EyeOff /> : <Eye />}
                      </button>
                    </div>
                    {errors.password && (
                      <p className="text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                        {errors.password}
                      </p>
                    )}
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full h-11 text-base font-medium"
                  disabled={isLoading}
                  size="lg"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Signing In...
                    </>
                  ) : (
                    'Sign In to Admin Dashboard'
                  )}
                </Button>

                <div className="text-center text-sm pt-4 border-t border-gray-200 dark:border-gray-700">
                  <span className="text-gray-600 dark:text-gray-400">
                    Don't have an account?{' '}
                  </span>
                  <Link
                    href="/register"
                    className="text-blue-600 hover:text-blue-500 dark:text-blue-400 font-medium"
                  >
                    Create account
                  </Link>
                </div>
              </form>
            )}
          </CardContent>
        </Card>

        {/* Security Notice */}
        <div className="text-center">
          <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center justify-center gap-1">
            <Shield className="h-3 w-3" />
            Your security is our priority. We use advanced encryption to protect your data.
          </p>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    }>
      <LoginContent />
    </Suspense>
  );
}