import { type NextRequest, NextResponse } from 'next/server';
import { logger } from '@/lib/logger';

const log = logger.child({ module: 'api-xapi-activity-profile' });

// ============================================================================
// Helper: Parse required parameters
// ============================================================================

function parseActivityProfileParams(
  request: NextRequest,
): { error: string } | { activityId: string; profileId: string | null } {
  const searchParams = request.nextUrl.searchParams;

  const activityId = searchParams.get('activityId');
  const profileId = searchParams.get('profileId');

  if (!activityId) {
    return { error: 'activityId is required' };
  }

  return { activityId, profileId };
}

// ============================================================================
// GET /api/xapi/activities/profile - Get Activity Profile(s)
// ============================================================================

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    // TODO(LXD-301): Implement Firebase Auth verification

    const params = parseActivityProfileParams(request);
    if ('error' in params) {
      return NextResponse.json({ error: params.error }, { status: 400 });
    }

    // TODO(LXD-301): Implement Firestore activity profile query
    log.info('xAPI Activity Profile GET called - migration to Firebase/GCP in progress', {
      activityId: params.activityId,
      profileId: params.profileId,
    });

    return NextResponse.json(
      { error: 'xAPI Activity Profile temporarily unavailable - GCP migration in progress' },
      { status: 503 },
    );
  } catch (error) {
    log.error('xAPI Activity Profile GET error', { error });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// ============================================================================
// PUT /api/xapi/activities/profile - Store/Update Activity Profile
// ============================================================================

export async function PUT(request: NextRequest): Promise<NextResponse> {
  try {
    // TODO(LXD-301): Implement Firebase Auth verification
    const params = parseActivityProfileParams(request);
    if ('error' in params) {
      return NextResponse.json({ error: params.error }, { status: 400 });
    }

    const { profileId } = params;

    if (!profileId) {
      return NextResponse.json({ error: 'profileId is required for PUT' }, { status: 400 });
    }

    // TODO(LXD-301): Implement Firestore activity profile upsert
    log.info('xAPI Activity Profile PUT called - migration to Firebase/GCP in progress');

    return NextResponse.json(
      { error: 'xAPI Activity Profile temporarily unavailable - GCP migration in progress' },
      { status: 503 },
    );
  } catch (error) {
    log.error('xAPI Activity Profile PUT error', { error });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// ============================================================================
// POST /api/xapi/activities/profile - Merge Activity Profile
// ============================================================================

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    // TODO(LXD-301): Implement Firebase Auth verification
    const params = parseActivityProfileParams(request);
    if ('error' in params) {
      return NextResponse.json({ error: params.error }, { status: 400 });
    }

    const { profileId } = params;

    if (!profileId) {
      return NextResponse.json({ error: 'profileId is required for POST' }, { status: 400 });
    }

    // TODO(LXD-301): Implement Firestore activity profile merge
    log.info('xAPI Activity Profile POST called - migration to Firebase/GCP in progress');

    return NextResponse.json(
      { error: 'xAPI Activity Profile temporarily unavailable - GCP migration in progress' },
      { status: 503 },
    );
  } catch (error) {
    log.error('xAPI Activity Profile POST error', { error });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// ============================================================================
// DELETE /api/xapi/activities/profile - Delete Activity Profile
// ============================================================================

export async function DELETE(request: NextRequest): Promise<NextResponse> {
  try {
    // TODO(LXD-301): Implement Firebase Auth verification
    const params = parseActivityProfileParams(request);
    if ('error' in params) {
      return NextResponse.json({ error: params.error }, { status: 400 });
    }

    const { profileId } = params;

    if (!profileId) {
      return NextResponse.json({ error: 'profileId is required for DELETE' }, { status: 400 });
    }

    // TODO(LXD-301): Implement Firestore activity profile delete
    log.info('xAPI Activity Profile DELETE called - migration to Firebase/GCP in progress');

    return NextResponse.json(
      { error: 'xAPI Activity Profile temporarily unavailable - GCP migration in progress' },
      { status: 503 },
    );
  } catch (error) {
    log.error('xAPI Activity Profile DELETE error', { error });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
