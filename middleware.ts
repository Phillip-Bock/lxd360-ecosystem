import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

/**
 * Routes that require authentication
 */
const PROTECTED_ROUTES = ['/dashboard', '/lxp360'];

/**
 * Auth routes that should redirect to dashboard if already authenticated
 */
const AUTH_ROUTES = ['/auth/login', '/auth/sign-up', '/auth/signin'];

/**
 * Cookie name for Firebase auth session token
 */
const AUTH_COOKIE_NAME = 'firebase-auth-token';

/**
 * Check if a path matches any of the protected route prefixes
 */
function isProtectedRoute(pathname: string): boolean {
  return PROTECTED_ROUTES.some((route) => pathname.startsWith(route));
}

/**
 * Check if a path is an auth route (login/signup)
 */
function isAuthRoute(pathname: string): boolean {
  return AUTH_ROUTES.some((route) => pathname === route || pathname.startsWith(`${route}/`));
}

/**
 * Middleware function for route protection
 *
 * @param request - The incoming request
 * @returns NextResponse with appropriate redirect or continue
 */
export async function middleware(request: NextRequest): Promise<NextResponse> {
  const { pathname } = request.nextUrl;

  // Get auth token from cookie
  const authToken = request.cookies.get(AUTH_COOKIE_NAME)?.value;
  const isAuthenticated = !!authToken;

  // Protected routes - redirect to login if not authenticated
  if (isProtectedRoute(pathname)) {
    if (!isAuthenticated) {
      const loginUrl = new URL('/auth/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // Auth routes - redirect to dashboard if already authenticated
  if (isAuthRoute(pathname)) {
    if (isAuthenticated) {
      const dashboardUrl = new URL('/dashboard', request.url);
      return NextResponse.redirect(dashboardUrl);
    }
  }

  return NextResponse.next();
}

/**
 * Middleware configuration
 *
 * Matcher excludes static files and API routes that don't need auth checks
 */
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - Public assets (svg, png, jpg, jpeg, gif, webp, json)
     * - API routes (handled separately)
     */
    '/((?!_next/static|_next/image|favicon.ico|api/|.*.(?:svg|png|jpg|jpeg|gif|webp|json|ico)$).*)',
  ],
};
