/**
 * xAPI About Resource Endpoint
 *
 * Returns information about the LRS implementation.
 * Required for xAPI 1.0.3 conformance.
 *
 * @see https://github.com/adlnet/xAPI-Spec/blob/master/xAPI-Communication.md#aboutresource
 */
import { NextResponse } from 'next/server';

/**
 * GET /api/xapi/about
 *
 * Returns the xAPI version supported by this LRS
 */
export async function GET(): Promise<NextResponse> {
  const aboutResponse = {
    version: ['1.0.3', '1.0.2', '1.0.1', '1.0.0'],
    extensions: {
      'https://lxp360.com/xapi': {
        name: 'LXD360 INSPIRE Learning Record Store',
        version: '1.0.0',
        features: [
          'statement-storage',
          'activity-state',
          'activity-profile',
          'cognitive-load-extensions',
          'inspire-framework-support',
        ],
      },
    },
  };

  return NextResponse.json(aboutResponse, {
    status: 200,
    headers: {
      'X-Experience-API-Version': '1.0.3',
      'Content-Type': 'application/json',
    },
  });
}
