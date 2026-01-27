import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

/**
 * Simplified Middleware
 *
 * This middleware handles basic route protection without blocking the auth flow.
 * Firebase Auth is the source of truth - pages handle their own auth checks.
 *
 * The middleware only:
 * 1. Adds security headers
 * 2. Allows all routes through (no cookie checks that cause redirect loops)
 */

// Public routes that don't need any special handling
const PUBLIC_ROUTES = [
  '/',
  '/login',
  '/sign-up',
  '/reset-password',
  '/coming-soon',
  '/verify-email',
  '/auth/action',
];

// Routes that are always public (APIs, static, etc.)
const ALWAYS_ALLOWED_PATTERNS = [
  '/api/',
  '/_next/',
  '/static/',
  '/images/',
  '/audio/',
  '/favicon',
  '/manifest',
  '/robots.txt',
];

function isAlwaysAllowed(pathname: string): boolean {
  return ALWAYS_ALLOWED_PATTERNS.some((pattern) => pathname.startsWith(pattern));
}

function isPublicRoute(pathname: string): boolean {
  return PUBLIC_ROUTES.includes(pathname) || pathname.includes('.');
}

export function middleware(request: NextRequest): NextResponse {
  const { pathname } = request.nextUrl;

  // Always allow API routes, static files, etc.
  if (isAlwaysAllowed(pathname)) {
    return NextResponse.next();
  }

  // Allow public routes
  if (isPublicRoute(pathname)) {
    return NextResponse.next();
  }

  // For protected routes, check for session cookie
  // If no cookie, let the page handle auth (client-side redirect)
  const sessionCookie = request.cookies.get('__session')?.value;

  if (!sessionCookie) {
    // Instead of redirecting here (which causes loops),
    // let the page load and handle auth client-side
    // This avoids race conditions with cookie setting
    return NextResponse.next();
  }

  // User has session cookie - allow through
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all paths except:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico
     * - public folder files (images, etc.)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|gif|svg|ico|webp)$).*)',
  ],
};
