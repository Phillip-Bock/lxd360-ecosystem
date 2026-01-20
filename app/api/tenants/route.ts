import { type NextRequest, NextResponse } from 'next/server';

const DEPRECATION_HEADERS = {
  'X-API-Deprecation': 'This endpoint is deprecated. Use /api/v1/tenants',
  'X-API-Sunset': '2025-06-01',
  Deprecation: 'true',
  Sunset: 'Sun, 01 Jun 2025 00:00:00 GMT',
};

/**
 * GET /api/tenants -> /api/v1/tenants
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  const url = new URL(request.url);
  return NextResponse.redirect(new URL(`/api/v1/tenants${url.search}`, request.url), {
    status: 308, // Permanent redirect
    headers: DEPRECATION_HEADERS,
  });
}

/**
 * POST /api/tenants -> /api/v1/tenants
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  const url = new URL(request.url);
  return NextResponse.redirect(new URL(`/api/v1/tenants${url.search}`, request.url), {
    status: 308, // Permanent redirect
    headers: DEPRECATION_HEADERS,
  });
}

/**
 * PUT /api/tenants -> /api/v1/tenants
 */
export async function PUT(request: NextRequest): Promise<NextResponse> {
  const url = new URL(request.url);
  return NextResponse.redirect(new URL(`/api/v1/tenants${url.search}`, request.url), {
    status: 308, // Permanent redirect
    headers: DEPRECATION_HEADERS,
  });
}

/**
 * DELETE /api/tenants -> /api/v1/tenants
 */
export async function DELETE(request: NextRequest): Promise<NextResponse> {
  const url = new URL(request.url);
  return NextResponse.redirect(new URL(`/api/v1/tenants${url.search}`, request.url), {
    status: 308, // Permanent redirect
    headers: DEPRECATION_HEADERS,
  });
}

/**
 * PATCH /api/tenants -> /api/v1/tenants
 */
export async function PATCH(request: NextRequest): Promise<NextResponse> {
  const url = new URL(request.url);
  return NextResponse.redirect(new URL(`/api/v1/tenants${url.search}`, request.url), {
    status: 308, // Permanent redirect
    headers: DEPRECATION_HEADERS,
  });
}
