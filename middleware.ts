// middleware.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getTokenFromRequest, getUserDataFromRequest, TOKEN_NAME, USER_DATA_NAME, REFRESH_TOKEN_NAME } from '@/lib/utils/server-cookies'

// Define routes
const publicRoutes = ['/login', '/forgot-password', '/reset-password', '/api/auth', '/register', '/verify', '/.well-known']
const authRoutes = ['/login', '/register', '/forgot-password', '/reset-password']
const protectedRoutes = ['/', '/dashboard', '/admin', '/users', '/billing', '/security', '/analytics', '/settings']

// Routes to completely ignore (browser/devtools requests)
const ignoreRoutes = [
  '/.well-known',
  '/favicon.ico',
  '/robots.txt',
  '/sitemap.xml',
  '/_next',
  '/api/health'
]

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Skip middleware for browser/devtools requests
  const shouldIgnore = ignoreRoutes.some(route => pathname.startsWith(route))
  if (shouldIgnore) {
    return NextResponse.next()
  }

  const token = getTokenFromRequest(request)

  // Check if current route is public
  const isPublicRoute = publicRoutes.some(route =>
    pathname.startsWith(route)
  )

  const isAuthRoute = authRoutes.some(route =>
    pathname.startsWith(route)
  )

  console.log(`🔍 Middleware check: ${pathname}`)
  console.log(`   Token: ${token ? `EXISTS (${token.substring(0, 20)}...)` : 'NONE'}`)
  console.log(`   Is public route: ${isPublicRoute}`)
  console.log(`   Is auth route: ${isAuthRoute}`)
  console.log(`   JWT_SECRET available: ${!!process.env.JWT_SECRET}`)

  // If token exists, let's also check the user data
  if (token) {
    const userData = getUserDataFromRequest(request)
    console.log(`   User data: ${userData ? 'EXISTS' : 'NONE'}`)
    if (userData) {
      console.log(`   User role: ${userData.role || userData.adminLevel || 'UNKNOWN'}`)
      console.log(`   User ID: ${userData.id}`)
      console.log(`   User email: ${userData.email}`)
    }
  }

  const isApiRoute = pathname.startsWith('/api')

  // Handle API routes
  if (isApiRoute) {
    // Allow public API routes (including admin auth)
    if (pathname.startsWith('/api/auth') || pathname.startsWith('/api/admin/auth')) {
      return NextResponse.next()
    }

    // Protect other API routes
    if (!token) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // For API routes, just check if token exists
    // Let the actual API route handlers do the JWT verification
    const response = NextResponse.next()

    if (token) {
      const userData = getUserDataFromRequest(request)
      if (userData?.id) {
        response.headers.set('x-user-id', userData.id)
        response.headers.set('x-user-email', userData.email || '')
        response.headers.set('x-user-role', userData.adminLevel || '')
      }
    }

    return response
  }

  // Handle page routes
  if (!token && !isPublicRoute) {
    console.log(`❌ No token for protected route ${pathname}, redirecting to login`)
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('callbackUrl', encodeURI(request.url))
    return NextResponse.redirect(loginUrl)
  }

  if (token && isAuthRoute) {
    console.log(`✅ Token exists and user trying to access auth route ${pathname}, redirecting to dashboard`)
    // Redirect authenticated users away from auth pages
    return NextResponse.redirect(new URL('/', request.url))
  }

  if (token && !isPublicRoute && !isAuthRoute) {
    console.log(`🔐 Token exists for protected route: ${pathname}`)

    // Get user data from cookie (already stored during login)
    const userData = getUserDataFromRequest(request)
    console.log(`   User data from cookie: ${userData ? 'EXISTS' : 'NONE'}`)

    if (!userData || !userData.id) {
      console.log(`❌ No valid user data in cookie, clearing and redirecting to login`)
      // No valid user data - clear cookies and redirect
      const loginUrl = new URL('/login', request.url)
      const response = NextResponse.redirect(loginUrl)
      response.cookies.delete(TOKEN_NAME)
      response.cookies.delete(USER_DATA_NAME)
      response.cookies.delete(REFRESH_TOKEN_NAME)
      return response
    }

    console.log(`✅ Valid user data found: ${userData.email} (${userData.adminLevel || userData.role})`)

    // Check permissions for protected routes
    if (!checkPermissions(pathname, userData)) {
      console.log(`❌ Permission denied for ${pathname}`)
      return NextResponse.redirect(new URL('/unauthorized', request.url))
    }

    console.log(`✅ Permission granted for ${pathname}, proceeding...`)
    // Add user info to headers for server components
    const response = NextResponse.next()
    response.headers.set('x-user-id', userData.id)
    response.headers.set('x-user-email', userData.email || '')
    response.headers.set('x-user-role', userData.adminLevel || userData.role || '')

    return response
  }

  return NextResponse.next()
}

function checkPermissions(pathname: string, user: any): boolean {
  // Super admin has access to everything
  if (user.adminLevel === 'super_admin' || user.role === 'super_admin') {
    return true
  }

  // Admin level users have broad access
  if (user.adminLevel === 'admin' || user.role === 'admin') {
    return true
  }

  // For now, allow all authenticated users to access dashboard routes
  // You can implement more granular permissions here
  const allowedRoutes = ['/', '/dashboard', '/profile', '/settings']

  if (allowedRoutes.some(route => pathname === route || pathname.startsWith(route))) {
    return true
  }

  // Route-based permission checks for specific admin areas
  const adminRoutes = ['/admin', '/users', '/billing', '/security', '/system-settings']
  if (adminRoutes.some(route => pathname.startsWith(route))) {
    return user.adminLevel === 'admin' || user.adminLevel === 'super_admin' ||
      user.role === 'admin' || user.role === 'super_admin'
  }

  return true
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - .well-known (system files)
     * - files with common extensions (images, etc.)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|\\.well-known|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js)$).*)',
  ],
}