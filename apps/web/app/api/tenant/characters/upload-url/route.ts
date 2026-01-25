import { type NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { type AIPersonaId, getAllPersonaIds } from '@/lib/ai-personas/persona-config';
import { adminAuth } from '@/lib/firebase/admin';
import { ALLOWED_EXTENSIONS, generateUploadUrl, MAX_FILE_SIZE } from '@/lib/gcs/storage-client';
import { logger } from '@/lib/logger';

const log = logger.scope('CharacterUploadAPI');

const RequestSchema = z.object({
  personaId: z.enum(getAllPersonaIds() as [AIPersonaId, ...AIPersonaId[]]),
  fileName: z.string().min(1),
  contentType: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const authHeader = request.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.split('Bearer ')[1];
    const decodedToken = await adminAuth.verifyIdToken(token);

    // Check if user is Org Admin or Owner
    const claims = decodedToken as { role?: string; tenantId?: string };
    if (!claims.tenantId) {
      return NextResponse.json({ error: 'No tenant associated' }, { status: 403 });
    }

    if (!['owner', 'org_admin', 'admin'].includes(claims.role || '')) {
      return NextResponse.json(
        { error: 'Only Org Admins can upload custom characters' },
        { status: 403 },
      );
    }

    // Parse and validate request
    const body = await request.json();
    const { personaId, fileName, contentType } = RequestSchema.parse(body);

    // Validate file extension
    const extension = fileName.toLowerCase().slice(fileName.lastIndexOf('.'));
    if (!ALLOWED_EXTENSIONS.includes(extension)) {
      return NextResponse.json(
        { error: `Invalid file type. Allowed: ${ALLOWED_EXTENSIONS.join(', ')}` },
        { status: 400 },
      );
    }

    // Generate signed upload URL
    const { uploadUrl, publicUrl, expiresAt } = await generateUploadUrl(
      claims.tenantId,
      personaId,
      contentType || 'application/octet-stream',
    );

    return NextResponse.json({
      uploadUrl,
      publicUrl,
      expiresAt: expiresAt.toISOString(),
      maxSize: MAX_FILE_SIZE,
      personaId,
    });
  } catch (error) {
    log.error('Upload URL generation error', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request', details: error.errors },
        { status: 400 },
      );
    }

    return NextResponse.json({ error: 'Failed to generate upload URL' }, { status: 500 });
  }
}
