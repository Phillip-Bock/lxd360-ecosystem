/**
 * Google Cloud Authentication
 *
 * Unified Google Cloud credentials handler for all LXP360 tools.
 * Supports GOOGLE_CREDENTIALS environment variable (raw JSON or base64).
 */

export interface GoogleCredentials {
  type: string;
  project_id: string;
  private_key_id: string;
  private_key: string;
  client_email: string;
  client_id: string;
  auth_uri: string;
  token_uri: string;
  auth_provider_x509_cert_url: string;
  client_x509_cert_url: string;
  universe_domain?: string;
}

let cachedCredentials: GoogleCredentials | null = null;
let cachedAccessToken: { token: string; expiresAt: number } | null = null;

/**
 * Gets Google Cloud credentials from environment variable
 * The GOOGLE_CREDENTIALS env var should contain the JSON service account key
 */
export function getGoogleCredentials(): GoogleCredentials {
  if (cachedCredentials) {
    return cachedCredentials;
  }

  const credentialsString = process.env.GOOGLE_CREDENTIALS;

  if (!credentialsString) {
    throw new Error(
      'GOOGLE_CREDENTIALS environment variable is not set. ' +
        'Please add your Google Cloud service account JSON key to Cloud Run environment variables.',
    );
  }

  try {
    let jsonString = credentialsString;

    // Check if it's base64 encoded (doesn't start with '{')
    if (!credentialsString.startsWith('{')) {
      try {
        jsonString = Buffer.from(credentialsString, 'base64').toString('utf-8');
      } catch {
        // Silently ignore - base64 decode failed, use original string
        jsonString = credentialsString;
      }
    }

    cachedCredentials = JSON.parse(jsonString) as GoogleCredentials;
    return cachedCredentials;
  } catch {
    throw new Error(
      'Failed to parse GOOGLE_CREDENTIALS. Ensure it contains valid JSON ' +
        'from a Google Cloud service account key file.',
    );
  }
}

/**
 * Gets the project ID from credentials
 */
export function getProjectId(): string {
  const credentials = getGoogleCredentials();
  return credentials.project_id;
}

/**
 * Creates credentials config for Google Cloud clients
 */
export function getClientConfig() {
  const credentials = getGoogleCredentials();

  return {
    credentials: {
      client_email: credentials.client_email,
      private_key: credentials.private_key,
    },
    projectId: credentials.project_id,
  };
}

/**
 * Base64 URL encode
 */
function base64UrlEncode(str: string): string {
  return Buffer.from(str)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
}

/**
 * Signs data with private key using Node.js crypto
 */
async function signWithPrivateKey(data: string, privateKey: string): Promise<string> {
  const crypto = await import('node:crypto');
  const sign = crypto.createSign('RSA-SHA256');
  sign.update(data);
  const signature = sign.sign(privateKey, 'base64');
  return signature.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}

/**
 * Creates a JWT for Google OAuth2 authentication
 */
async function createJWT(
  credentials: { client_email: string; private_key: string },
  scopes: string[],
): Promise<string> {
  const header = {
    alg: 'RS256',
    typ: 'JWT',
  };

  const now = Math.floor(Date.now() / 1000);
  const payload = {
    iss: credentials.client_email,
    sub: credentials.client_email,
    aud: 'https://oauth2.googleapis.com/token',
    iat: now,
    exp: now + 3600,
    scope: scopes.join(' '),
  };

  const encodedHeader = base64UrlEncode(JSON.stringify(header));
  const encodedPayload = base64UrlEncode(JSON.stringify(payload));

  const signatureInput = `${encodedHeader}.${encodedPayload}`;
  const signature = await signWithPrivateKey(signatureInput, credentials.private_key);

  return `${signatureInput}.${signature}`;
}

/**
 * Gets OAuth2 access token using service account
 * Tokens are cached until near expiration
 */
export async function getAccessToken(
  scopes: string[] = ['https://www.googleapis.com/auth/cloud-platform'],
): Promise<string> {
  // Return cached token if still valid (with 5 min buffer)
  if (cachedAccessToken && Date.now() < cachedAccessToken.expiresAt - 300000) {
    return cachedAccessToken.token;
  }

  const config = getClientConfig();
  const jwt = await createJWT(config.credentials, scopes);

  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: jwt,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to get Google access token: ${error}`);
  }

  const data = await response.json();

  cachedAccessToken = {
    token: data.access_token,
    expiresAt: Date.now() + data.expires_in * 1000,
  };

  return data.access_token;
}

/**
 * Validates that credentials have required fields
 */
export function validateCredentials(): { valid: boolean; missingFields: string[] } {
  try {
    const credentials = getGoogleCredentials();
    const requiredFields: (keyof GoogleCredentials)[] = [
      'type',
      'project_id',
      'private_key',
      'client_email',
    ];

    const missingFields = requiredFields.filter((field) => !credentials[field]);

    return {
      valid: missingFields.length === 0,
      missingFields,
    };
  } catch {
    // Silently ignore - credentials parsing failed
    return {
      valid: false,
      missingFields: ['all'],
    };
  }
}

/**
 * Checks if Google credentials are configured
 */
export function hasGoogleCredentials(): boolean {
  return !!process.env.GOOGLE_CREDENTIALS;
}
