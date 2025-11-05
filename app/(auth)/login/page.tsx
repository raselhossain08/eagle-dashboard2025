// app/(auth)/login/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/lib/hooks/use-auth'
import { useToast } from '@/hooks/use-toast'
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
  const { toast } = useToast()
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
        
        toast({
          title: 'Login successful',
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
      toast({
        title: 'Login successful',
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
        toast({
          title: '2FA Required',
          description: 'Please enter your 6-digit authenticator code',
        })
        return
      }

      // Handle 2FA validation errors
      if (error.response?.data?.invalid2FA && ENABLE_2FA) {
        toast({
          title: '2FA Code Invalid',
          description: 'The 2FA code you entered is incorrect. Please try again.',
        })
        setTwoFactorCode('') // Clear the invalid code
        return
      }

      // Handle general login errors
      const errorMessage = error.response?.data?.message || 
                          error.message || 
                          'Invalid credentials. Please try again.'
      
      toast({
        title: 'Login failed',
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
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Checking authentication...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">Admin Login</CardTitle>
          <CardDescription className="text-center">
            Enter your credentials to access the dashboard
          </CardDescription>
          {!ENABLE_2FA && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3 mt-2">
              <div className="flex">
                <div className="shrink-0">
                  <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
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
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>

            {requires2FA && ENABLE_2FA && (
              <div className="space-y-2">
                <Label htmlFor="twoFactorCode">
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
                  className="text-center text-lg tracking-wider"
                />
                <p className="text-xs text-gray-600">
                  Enter the 6-digit code from your authenticator app
                </p>
              </div>
            )}

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading 
                ? 'Signing in...' 
                : requires2FA && ENABLE_2FA 
                  ? 'Verify & Sign in' 
                  : 'Sign in'
              }
            </Button>

            {requires2FA && ENABLE_2FA && (
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={resetForm}
                disabled={isLoading}
              >
                ← Back to Login
              </Button>
            )}

            <div className="text-center">
              <Link
                href="/forgot-password"
                className="text-sm text-blue-600 hover:text-blue-500"
              >
                Forgot your password?
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}