import { type NextRequest, NextResponse } from 'next/server';
import { type AIPersonaId, getAllPersonaIds } from '@/lib/ai-personas/persona-config';
import { adminAuth } from '@/lib/firebase/admin';
import { deleteTenantCharacter, listTenantCharacters } from '@/lib/gcs/storage-client';

/**
 * GET - List all custom characters for the tenant
 */
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.split('Bearer ')[1];
    const decodedToken = await adminAuth.verifyIdToken(token);
    const claims = decodedToken as { tenantId?: string };

    if (!claims.tenantId) {
      return NextResponse.json({ error: 'No tenant associated' }, { status: 403 });
    }

    const characters = await listTenantCharacters(claims.tenantId);

    // Map to include all personas with their status
    const allPersonaIds = getAllPersonaIds();
    const result = allPersonaIds.map((personaId) => {
      const customChar = characters.find((c) => c.personaId === personaId);
      return {
        personaId,
        hasCustom: !!customChar,
        size: customChar?.size,
        updated: customChar?.updated.toISOString(),
        publicUrl: customChar?.publicUrl,
      };
    });

    return NextResponse.json({ characters: result });
  } catch (error) {
    console.error('List characters error:', error);
    return NextResponse.json({ error: 'Failed to list characters' }, { status: 500 });
  }
}

/**
 * DELETE - Remove a custom character
 */
export async function DELETE(request: NextRequest) {
  try {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.split('Bearer ')[1];
    const decodedToken = await adminAuth.verifyIdToken(token);
    const claims = decodedToken as { role?: string; tenantId?: string };

    if (!claims.tenantId) {
      return NextResponse.json({ error: 'No tenant associated' }, { status: 403 });
    }

    if (!['owner', 'org_admin', 'admin'].includes(claims.role || '')) {
      return NextResponse.json(
        { error: 'Only Org Admins can delete custom characters' },
        { status: 403 },
      );
    }

    const { searchParams } = new URL(request.url);
    const personaId = searchParams.get('personaId');

    if (!personaId || !getAllPersonaIds().includes(personaId as AIPersonaId)) {
      return NextResponse.json({ error: 'Invalid persona ID' }, { status: 400 });
    }

    await deleteTenantCharacter(claims.tenantId, personaId);

    return NextResponse.json({ success: true, personaId });
  } catch (error) {
    console.error('Delete character error:', error);
    return NextResponse.json({ error: 'Failed to delete character' }, { status: 500 });
  }
}
