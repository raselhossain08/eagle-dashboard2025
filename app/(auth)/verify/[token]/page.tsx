
'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/components/providers';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, CheckCircle, AlertTriangle, Mail } from 'lucide-react';
import AuthService from '@/lib/services/auth';

export default function VerifyEmailPage() {
  const [verificationStatus, setVerificationStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState('');
  const [isResending, setIsResending] = useState(false);

  const params = useParams();
  const router = useRouter();
  const { user, resendVerification } = useAuth();
  
  const token = params.token as string;

  useEffect(() => {
    if (token) {
      verifyEmailToken();
    } else {
      setVerificationStatus('error');
      setErrorMessage('No verification token provided');
    }
  }, [token]);

  const verifyEmailToken = async () => {
    try {
      const response = await AuthService.activateAccount(token);
      
      if (response.success) {
        setVerificationStatus('success');
        // Redirect to login after a short delay
        setTimeout(() => {
          router.push('/login?message=account-activated');
        }, 3000);
      } else {
        setVerificationStatus('error');
        setErrorMessage(response.message || 'Email verification failed');
      }
    } catch (error) {
      setVerificationStatus('error');
      const message = error instanceof Error ? error.message : 'Email verification failed';
      setErrorMessage(message);
    }
  };

  const handleResendVerification = async () => {
    if (!user?.email) {
      setErrorMessage('No user email found');
      return;
    }

    setIsResending(true);
    try {
      await resendVerification();
    } catch (error) {
      console.error('Resend verification error:', error);
    } finally {
      setIsResending(false);
    }
  };

  // Loading state
  if (verificationStatus === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
        <Card className="w-full max-w-md">
          <CardContent className="flex items-center justify-center py-12">
            <div className="text-center">
              <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4 text-blue-600" />
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Verifying Your Email
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                Please wait while we verify your email address...
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Success state
  if (verificationStatus === 'success') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1 text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center">
              <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
            </div>
            <CardTitle className="text-2xl font-bold">Email Verified!</CardTitle>
            <CardDescription>
              Your email address has been successfully verified.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                Welcome to Eagle Dashboard! Your account is now fully activated and ready to use.
              </AlertDescription>
            </Alert>

            <div className="text-center">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                You will be redirected to the login page automatically, or you can click below to continue.
              </p>
              
              <Button asChild className="w-full">
                <Link href="/login?message=account-activated">
                  Continue to Login
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Error state
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center">
            <AlertTriangle className="w-8 h-8 text-red-600 dark:text-red-400" />
          </div>
          <CardTitle className="text-2xl font-bold">Verification Failed</CardTitle>
          <CardDescription>
            We couldn't verify your email address.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              {errorMessage || 'The verification link is invalid or has expired.'}
            </AlertDescription>
          </Alert>

          <div className="space-y-2">
            <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
              Don't worry! You can request a new verification email.
            </p>

            {user?.email && (
              <Button
                onClick={handleResendVerification}
                disabled={isResending}
                className="w-full"
                variant="outline"
              >
                {isResending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Mail className="mr-2 h-4 w-4" />
                    Resend Verification Email
                  </>
                )}
              </Button>
            )}

            <Button asChild className="w-full">
              <Link href="/login">
                Back to Login
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}