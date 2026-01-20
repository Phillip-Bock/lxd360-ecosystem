export const dynamic = 'force-dynamic';

import { type NextRequest, NextResponse } from 'next/server';

// Stub xAPI State endpoint - full implementation pending
const notImplemented = (): NextResponse =>
  NextResponse.json({ error: 'xAPI State endpoint not yet implemented' }, { status: 501 });

export async function GET(_request: NextRequest): Promise<NextResponse> {
  void _request;
  return notImplemented();
}
export async function PUT(_request: NextRequest): Promise<NextResponse> {
  void _request;
  return notImplemented();
}
export async function POST(_request: NextRequest): Promise<NextResponse> {
  void _request;
  return notImplemented();
}
export async function DELETE(_request: NextRequest): Promise<NextResponse> {
  void _request;
  return notImplemented();
}
