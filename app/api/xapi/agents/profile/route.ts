import { type NextRequest, NextResponse } from 'next/server';
import { logger } from '@/lib/logger';
import { ActorSchema } from '@/lib/xapi/types';

const log = logger.child({ module: 'api-xapi-agent-profile' });

// ============================================================================
// Helper: Parse required parameters
// ============================================================================

function parseAgentProfileParams(
  request: NextRequest,
): { error: string } | { agent: Record<string, unknown>; profileId: string | null } {
  const searchParams = request.nextUrl.searchParams;

  const agentParam = searchParams.get('agent');
  const profileId = searchParams.get('profileId');

  if (!agentParam) {
    return { error: 'agent is required' };
  }

  let agent: Record<string, unknown>;
  try {
    const agentJson = JSON.parse(agentParam);
    const parsed = ActorSchema.safeParse(agentJson);
    if (!parsed.success) {
      return { error: 'Invalid agent format' };
    }
    agent = parsed.data as Record<string, unknown>;
  } catch {
    // Silently ignore - error message already returned
    return { error: 'agent must be valid JSON' };
  }

  return { agent, profileId };
}

// ============================================================================
// GET /api/xapi/agents/profile - Get Agent Profile(s)
// ============================================================================

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    // TODO(LXD-301): Implement Firebase Auth verification
    const params = parseAgentProfileParams(request);
    if ('error' in params) {
      return NextResponse.json({ error: params.error }, { status: 400 });
    }

    // TODO(LXD-301): Implement Firestore agent profile query
    log.info('xAPI Agent Profile GET called - migration to Firebase/GCP in progress', {
      profileId: params.profileId,
    });

    return NextResponse.json(
      { error: 'xAPI Agent Profile temporarily unavailable - GCP migration in progress' },
      { status: 503 },
    );
  } catch (error) {
    log.error('xAPI Agent Profile GET error', { error });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// ============================================================================
// PUT /api/xapi/agents/profile - Store/Update Agent Profile
// ============================================================================

export async function PUT(request: NextRequest): Promise<NextResponse> {
  try {
    // TODO(LXD-301): Implement Firebase Auth verification
    const params = parseAgentProfileParams(request);
    if ('error' in params) {
      return NextResponse.json({ error: params.error }, { status: 400 });
    }

    const { profileId } = params;

    if (!profileId) {
      return NextResponse.json({ error: 'profileId is required for PUT' }, { status: 400 });
    }

    // TODO(LXD-301): Implement Firestore agent profile upsert
    log.info('xAPI Agent Profile PUT called - migration to Firebase/GCP in progress');

    return NextResponse.json(
      { error: 'xAPI Agent Profile temporarily unavailable - GCP migration in progress' },
      { status: 503 },
    );
  } catch (error) {
    log.error('xAPI Agent Profile PUT error', { error });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// ============================================================================
// POST /api/xapi/agents/profile - Merge Agent Profile
// ============================================================================

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    // TODO(LXD-301): Implement Firebase Auth verification
    const params = parseAgentProfileParams(request);
    if ('error' in params) {
      return NextResponse.json({ error: params.error }, { status: 400 });
    }

    const { profileId } = params;

    if (!profileId) {
      return NextResponse.json({ error: 'profileId is required for POST' }, { status: 400 });
    }

    // TODO(LXD-301): Implement Firestore agent profile merge
    log.info('xAPI Agent Profile POST called - migration to Firebase/GCP in progress');

    return NextResponse.json(
      { error: 'xAPI Agent Profile temporarily unavailable - GCP migration in progress' },
      { status: 503 },
    );
  } catch (error) {
    log.error('xAPI Agent Profile POST error', { error });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// ============================================================================
// DELETE /api/xapi/agents/profile - Delete Agent Profile
// ============================================================================

export async function DELETE(request: NextRequest): Promise<NextResponse> {
  try {
    // TODO(LXD-301): Implement Firebase Auth verification
    const params = parseAgentProfileParams(request);
    if ('error' in params) {
      return NextResponse.json({ error: params.error }, { status: 400 });
    }

    const { profileId } = params;

    if (!profileId) {
      return NextResponse.json({ error: 'profileId is required for DELETE' }, { status: 400 });
    }

    // TODO(LXD-301): Implement Firestore agent profile delete
    log.info('xAPI Agent Profile DELETE called - migration to Firebase/GCP in progress');

    return NextResponse.json(
      { error: 'xAPI Agent Profile temporarily unavailable - GCP migration in progress' },
      { status: 503 },
    );
  } catch (error) {
    log.error('xAPI Agent Profile DELETE error', { error });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
