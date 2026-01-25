import { NextResponse } from 'next/server';
import { verifyIdToken } from '@/lib/firebase/admin';

/**
 * POST /api/auth/session
 *
 * Sets the __session cookie after Firebase client-side login.
 * The middleware uses this cookie to verify authentication on protected routes.
 *
 * Request body: { idToken: string }
 * Response: { success: true } or { error: string }
 */
export async function POST(request: Request): Promise<NextResponse> {
  try {
    const body = await request.json();
    const { idToken } = body;

    if (!idToken || typeof idToken !== 'string') {
      return NextResponse.json({ error: 'ID token is required' }, { status: 400 });
    }

    // Verify the token is valid
    const decodedToken = await verifyIdToken(idToken);

    if (!decodedToken) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    // Create response with success message
    const response = NextResponse.json({
      success: true,
      uid: decodedToken.uid,
    });

    // Set the session cookie
    // - httpOnly: prevents JavaScript access (XSS protection)
    // - secure: only sent over HTTPS (except localhost)
    // - sameSite: strict CSRF protection
    // - maxAge: 7 days (matches Firebase token refresh)
    response.cookies.set('__session', idToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('[Session API] Error:', error);
    return NextResponse.json({ error: 'Failed to create session' }, { status: 500 });
  }
}

/**
 * DELETE /api/auth/session
 *
 * Clears the __session cookie (logout)
 */
export async function DELETE(): Promise<NextResponse> {
  const response = NextResponse.json({ success: true });

  // Clear the session cookie
  response.cookies.set('__session', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 0,
    path: '/',
  });

  return response;
}
