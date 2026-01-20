import { type NextRequest, NextResponse } from 'next/server';

const DEPRECATION_HEADERS = {
  'X-API-Deprecation': 'This endpoint is deprecated. Use /api/v1/xapi',
  'X-API-Sunset': '2025-06-01',
  Deprecation: 'true',
  Sunset: 'Sun, 01 Jun 2025 00:00:00 GMT',
  'X-Experience-API-Version': '1.0.3',
};

/**
 * GET /api/xapi -> /api/v1/xapi
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  const url = new URL(request.url);
  return NextResponse.redirect(new URL(`/api/v1/xapi${url.search}`, request.url), {
    status: 308, // Permanent redirect
    headers: DEPRECATION_HEADERS,
  });
}

/**
 * POST /api/xapi -> /api/v1/xapi
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  const url = new URL(request.url);
  return NextResponse.redirect(new URL(`/api/v1/xapi${url.search}`, request.url), {
    status: 308, // Permanent redirect
    headers: DEPRECATION_HEADERS,
  });
}

/**
 * PUT /api/xapi -> /api/v1/xapi
 */
export async function PUT(request: NextRequest): Promise<NextResponse> {
  const url = new URL(request.url);
  return NextResponse.redirect(new URL(`/api/v1/xapi${url.search}`, request.url), {
    status: 308, // Permanent redirect
    headers: DEPRECATION_HEADERS,
  });
}

/**
 * DELETE /api/xapi -> /api/v1/xapi
 */
export async function DELETE(request: NextRequest): Promise<NextResponse> {
  const url = new URL(request.url);
  return NextResponse.redirect(new URL(`/api/v1/xapi${url.search}`, request.url), {
    status: 308, // Permanent redirect
    headers: DEPRECATION_HEADERS,
  });
}
