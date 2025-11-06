// app/(auth)/login/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/lib/hooks/use-auth'
import { toast } from 'sonner'
import { clientCookies } from '@/lib/utils/cookies'

// Development flag - set to false to disable 2FA during development
const ENABLE_2FA = false
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [twoFactorCode, setTwoFactorCode] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [requires2FA, setRequires2FA] = useState(false)

  const { login, isAuthenticated, isLoading: authLoading } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get('callbackUrl') || searchParams.get('redirect') || '/'

  // Reset form function
  const resetForm = () => {
    setEmail('')
    setPassword('')
    setTwoFactorCode('')
    setRequires2FA(false)
    setIsLoading(false)
  }

  // Handle 2FA code input
  const handle2FAInput = (value: string) => {
    // Only allow numbers and limit to 6 digits
    const numericValue = value.replace(/\D/g, '').slice(0, 6)
    setTwoFactorCode(numericValue)
  }

  // Check authentication status on component mount
  const { checkAuth } = useAuth()

  useEffect(() => {
    // Initialize auth check
    checkAuth()
  }, [checkAuth])

  // Check if user is already authenticated and redirect
  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      console.log('✅ User already authenticated, redirecting to dashboard')
      const redirectUrl = callbackUrl && callbackUrl !== '/' ? callbackUrl : '/'
      router.push(redirectUrl)
    }
  }, [isAuthenticated, authLoading, callbackUrl, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // Development mode - skip 2FA validation
      if (!ENABLE_2FA) {
        console.log('🔧 DEV MODE: 2FA disabled for development')
        await login({ email, password, twoFactorCode: '' })

        // Verify cookies were set
        const { token, user } = clientCookies.getAuthCookies()
        console.log('🍪 Cookies after login:', {
          hasToken: !!token,
          hasUser: !!user,
          userRole: user?.role || user?.adminLevel
        })

        toast.success('Login successful', {
          description: 'Welcome back! (2FA disabled for development)',
        })

        // Determine redirect URL for development mode
        const redirectUrl = callbackUrl && callbackUrl !== '/' ? callbackUrl : '/'

        // Small delay to ensure cookies are set
        setTimeout(() => {
          console.log('🔧 DEV MODE: Redirecting to:', redirectUrl)
          router.push(redirectUrl)
          if (redirectUrl === '/') {
            router.refresh()
          }
        }, 100)
        return
      }

      // Production mode - full 2FA logic
      await login({ email, password, twoFactorCode })

      // Login successful
      toast.success('Login successful', {
        description: 'Welcome back!',
      })

      // Determine redirect URL
      const redirectUrl = callbackUrl && callbackUrl !== '/' ? callbackUrl : '/'

      // Small delay to ensure cookies are set and middleware processes correctly
      setTimeout(() => {
        console.log('🔄 Redirecting to:', redirectUrl)
        router.push(redirectUrl)
        // Force a page refresh to ensure middleware processes the new auth state
        if (redirectUrl === '/') {
          router.refresh()
        }
      }, 100)

    } catch (error: any) {
      console.error('Login error:', error)

      // Handle 2FA requirement
      if (error.response?.data?.requires2FA && ENABLE_2FA) {
        setRequires2FA(true)
        toast.info('2FA Required', {
          description: 'Please enter your 6-digit authenticator code',
        })
        return
      }

      // Handle 2FA validation errors
      if (error.response?.data?.invalid2FA && ENABLE_2FA) {
        toast.error('2FA Code Invalid', {
          description: 'The 2FA code you entered is incorrect. Please try again.',
        })
        setTwoFactorCode('') // Clear the invalid code
        return
      }

      // Handle general login errors
      const errorMessage = error.response?.data?.message ||
        error.message ||
        'Invalid credentials. Please try again.'

      toast.error('Login failed', {
        description: errorMessage,
      })

      // Reset form on authentication failure
      if (error.response?.status === 401) {
        setPassword('')
        setTwoFactorCode('')
        setRequires2FA(false)
      }
    } finally {
      setIsLoading(false)
    }
  }

  // Show loading while checking authentication
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Checking authentication...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md">
        {/* Header Section */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Eagle Dashboard!</h1>
          <p className="text-lg text-gray-600 mb-6">Sign in to your account</p>

          <div className="bg-white rounded-2xl shadow-lg p-8">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Welcome Back!</h2>
              <p className="text-gray-500 text-sm leading-relaxed">
                Sign in to access your dashboard and manage your subscriptions, contracts, and analytics with ease.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isLoading}
                  className="h-12 px-4 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                />
              </div>

              <div className="space-y-2">
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={isLoading}
                  className="h-12 px-4 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                />
              </div>

              {requires2FA && ENABLE_2FA && (
                <div className="space-y-2">
                  <Label htmlFor="twoFactorCode" className="text-sm font-medium text-gray-700">
                    2FA Code
                    <span className="text-xs text-gray-500 ml-1">(6 digits)</span>
                  </Label>
                  <Input
                    id="twoFactorCode"
                    type="text"
                    placeholder="123456"
                    value={twoFactorCode}
                    onChange={(e) => handle2FAInput(e.target.value)}
                    maxLength={6}
                    required
                    disabled={isLoading}
                    className="text-center text-lg tracking-wider h-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  />
                  <p className="text-xs text-gray-600 text-center">
                    Enter the 6-digit code from your authenticator app
                  </p>
                </div>
              )}

              <Button
                type="submit"
                className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-base rounded-lg transition-colors duration-200"
                disabled={isLoading}
              >
                {isLoading
                  ? 'Signing in...'
                  : requires2FA && ENABLE_2FA
                    ? 'Verify & Sign in'
                    : 'SIGN IN'
                }
              </Button>

              {requires2FA && ENABLE_2FA && (
                <Button
                  type="button"
                  variant="outline"
                  className="w-full h-12 border-gray-300 text-gray-700 hover:bg-gray-50"
                  onClick={resetForm}
                  disabled={isLoading}
                >
                  ← Back to Login
                </Button>
              )}

              <div className="text-center pt-4 border-t border-gray-200">
                <p className="text-gray-600 text-sm">
                  Don't have an account?{' '}
                  <Link
                    href="/register"
                    className="text-blue-600 hover:text-blue-500 font-medium transition-colors duration-200"
                  >
                    Create
                  </Link>
                </p>
              </div>
            </form>
          </div>

          {/* Development Mode Warning */}
          {!ENABLE_2FA && (
            <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-xl p-4">
              <div className="flex items-start">
                <div className="shrink-0">
                  <svg className="h-5 w-5 text-yellow-400 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-yellow-800">
                    <strong>Development Mode:</strong> 2FA is disabled
                  </p>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  )
}