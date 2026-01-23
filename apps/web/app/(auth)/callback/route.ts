import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { logger } from '@/lib/logger';

const log = logger.child({ module: 'auth-callback' });

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const error = requestUrl.searchParams.get('error');
  const error_description = requestUrl.searchParams.get('error_description');
  const next = requestUrl.searchParams.get('next') ?? '/dashboard';
  const mode = requestUrl.searchParams.get('mode');

  // Handle OAuth errors
  if (error) {
    log.error('OAuth error', { error, errorDescription: error_description });
    return NextResponse.redirect(
      new URL(
        `/auth/login?error=${encodeURIComponent(error_description || error)}`,
        requestUrl.origin,
      ),
    );
  }

  // Firebase Auth handles most OAuth flows client-side
  // This endpoint is for:
  // 1. Email verification links (mode=verifyEmail)
  // 2. Password reset links (mode=resetPassword)
  // 3. Custom OAuth provider callbacks

  if (mode === 'verifyEmail') {
    log.info('Email verification callback');
    return NextResponse.redirect(new URL('/auth/verify-email?verified=true', requestUrl.origin));
  }

  if (mode === 'resetPassword') {
    const oobCode = requestUrl.searchParams.get('oobCode');
    log.info('Password reset callback');
    return NextResponse.redirect(
      new URL(`/auth/reset-password?oobCode=${oobCode || ''}`, requestUrl.origin),
    );
  }

  // Default: redirect to the specified destination
  log.info('Auth callback redirect', { destination: next });
  return NextResponse.redirect(new URL(next, requestUrl.origin));
}
