import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtDecode } from 'jwt-decode';

interface JWTPayload {
  id: string;
  email: string;
  role: string;
  iat: number;
  exp: number;
}

// Routes that require authentication
const protectedRoutes = [
  '/subscriptions',
  '/plans',
  '/contracts',
  '/analytics',
  '/audit',
  '/contract-templates',
  '/discounts',
  '/invoices',
  '/payment-methods',
  '/roles',
  '/signatures',
  '/subscriber-profiles',
  '/system-settings',
  '/transactions',
  '/webhooks',
  '/api/protected',
];

// Routes that should redirect to home if user is authenticated
const authRoutes = [
  '/login',
  '/auth/register',
  '/auth/forgot-password',
  '/auth/reset-password',
  '/auth/verify',
];

// Admin only routes
const adminRoutes = [
  '/admin',
  '/roles',
  '/system-settings',
  '/audit',
  '/subscriber-profiles',
];

// Public routes that don't require authentication
const publicRoutes = [
  '/',
  '/api/auth',
  '/debug',
];

function isTokenExpired(token: string): boolean {
  try {
    const decoded = jwtDecode<JWTPayload>(token);
    const currentTime = Date.now() / 1000;
    return decoded.exp < currentTime;
  } catch (error) {
    return true;
  }
}

function getUserRole(token: string): string | null {
  try {
    const decoded = jwtDecode<JWTPayload>(token);
    return decoded.role;
  } catch (error) {
    return null;
  }
}

function isRouteProtected(pathname: string): boolean {
  // Root path is protected, so check for it specifically
  if (pathname === '/') return true;
  return protectedRoutes.some(route => pathname.startsWith(route));
}

function isAuthRoute(pathname: string): boolean {
  return authRoutes.some(route => pathname.startsWith(route));
}

function isAdminRoute(pathname: string): boolean {
  return adminRoutes.some(route => pathname.startsWith(route));
}

function isPublicRoute(pathname: string): boolean {
  return publicRoutes.some(route => pathname.startsWith(route));
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get('AdminToken')?.value;

  // Allow public routes
  if (isPublicRoute(pathname)) {
    return NextResponse.next();
  }

  // Check if user has valid token
  const isAuthenticated = token && !isTokenExpired(token);
  const userRole = token ? getUserRole(token) : null;

  // Handle auth routes (login, register, etc.)
  if (isAuthRoute(pathname)) {
    if (isAuthenticated) {
      // Redirect authenticated users away from auth pages to root
      return NextResponse.redirect(new URL('/', request.url));
    }
    return NextResponse.next();
  }

  // Handle protected routes
  if (isRouteProtected(pathname)) {
    if (!isAuthenticated) {
      // Redirect unauthenticated users to login
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }

    // Check admin routes
    if (isAdminRoute(pathname)) {
      if (userRole !== 'admin' && userRole !== 'super_admin') {
        // Redirect non-admin users to home page
        return NextResponse.redirect(new URL('/', request.url));
      }
    }

    return NextResponse.next();
  }

  // Default behavior for other routes
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};