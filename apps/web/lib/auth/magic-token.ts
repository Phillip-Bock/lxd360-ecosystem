/**
 * Magic Link Token Utilities
 *
 * Secure token generation, hashing, and validation for passwordless authentication.
 * Implements single-use tokens with 24-hour expiry.
 *
 * Security features:
 * - Cryptographically secure random token generation
 * - Token hash stored in Firestore (never the raw token)
 * - Single-use tokens (invalidated after use)
 * - 24-hour expiry
 * - Rate limiting on generation
 * - Audit logging
 *
 * @module lib/auth/magic-token
 */

import 'server-only';

import { createHash, randomBytes } from 'node:crypto';
import { FieldValue } from 'firebase-admin/firestore';
import { adminAuth, adminDb } from '@/lib/firebase/admin';
import { logger } from '@/lib/logger';

const log = logger.scope('MagicToken');

// =============================================================================
// Configuration
// =============================================================================

/** Token expiry time in milliseconds (24 hours) */
const TOKEN_EXPIRY_MS = 24 * 60 * 60 * 1000;

/** Token length in bytes (32 bytes = 256 bits of entropy) */
const TOKEN_LENGTH_BYTES = 32;

/** Maximum magic link requests per email per hour */
const RATE_LIMIT_PER_HOUR = 5;

/** Firestore collection names */
const COLLECTIONS = {
  MAGIC_TOKENS: 'magic_tokens',
  MAGIC_LINK_AUDIT: 'magic_link_audit',
  RATE_LIMITS: 'rate_limits',
} as const;

// =============================================================================
// Types
// =============================================================================

/**
 * Magic token document stored in Firestore
 */
export interface MagicTokenDocument {
  /** SHA-256 hash of the token */
  tokenHash: string;
  /** User's email address */
  email: string;
  /** When the token expires */
  expiresAt: Date;
  /** When the token was created */
  createdAt: Date;
  /** Whether the token has been used */
  used: boolean;
  /** When the token was used (if applicable) */
  usedAt?: Date;
  /** IP address that requested the token */
  requestIp?: string;
  /** User agent that requested the token */
  userAgent?: string;
  /** Optional destination URL path for deep linking (e.g., /ignite/courses/abc123) */
  destination?: string;
  /** Optional tenant ID for multi-tenant context */
  tenantId?: string;
}

/**
 * Audit log entry for magic link actions
 */
export interface MagicLinkAuditEntry {
  /** Type of action */
  action: 'requested' | 'sent' | 'validated' | 'expired' | 'invalid' | 'rate_limited';
  /** User's email address */
  email: string;
  /** Token hash (for correlation) */
  tokenHash?: string;
  /** IP address */
  ip?: string;
  /** User agent */
  userAgent?: string;
  /** Additional details */
  details?: string;
  /** Timestamp */
  timestamp: Date;
}

/**
 * Result of token generation
 */
export interface GenerateTokenResult {
  success: boolean;
  /** Raw token to include in the magic link URL */
  token?: string;
  /** Token hash for reference */
  tokenHash?: string;
  /** Error message if failed */
  error?: string;
  /** Error code */
  errorCode?: 'RATE_LIMITED' | 'GENERATION_FAILED' | 'USER_NOT_FOUND';
}

/**
 * Result of token validation
 */
export interface ValidateTokenResult {
  success: boolean;
  /** User's email if validation succeeded */
  email?: string;
  /** User's Firebase UID if they exist */
  uid?: string;
  /** Firebase custom token for sign-in */
  customToken?: string;
  /** Destination URL path for deep linking */
  destination?: string;
  /** Tenant ID for multi-tenant context */
  tenantId?: string;
  /** Error message if failed */
  error?: string;
  /** Error code */
  errorCode?: 'INVALID_TOKEN' | 'EXPIRED_TOKEN' | 'ALREADY_USED' | 'VALIDATION_FAILED';
}

// =============================================================================
// Token Generation & Hashing
// =============================================================================

/**
 * Generate a cryptographically secure random token
 */
function generateSecureToken(): string {
  return randomBytes(TOKEN_LENGTH_BYTES).toString('base64url');
}

/**
 * Hash a token using SHA-256
 * @param token - Raw token string
 * @returns Hex-encoded hash
 */
function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}

// =============================================================================
// Rate Limiting
// =============================================================================

/**
 * Check if the email is rate limited for magic link requests
 */
async function isRateLimited(email: string): Promise<boolean> {
  const normalizedEmail = email.toLowerCase().trim();
  const rateLimitKey = `magic_link:${normalizedEmail}`;
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);

  try {
    const rateLimitDoc = await adminDb.collection(COLLECTIONS.RATE_LIMITS).doc(rateLimitKey).get();

    if (!rateLimitDoc.exists) {
      return false;
    }

    const data = rateLimitDoc.data();
    const requests = data?.requests || [];

    // Filter requests from the last hour
    const recentRequests = requests.filter(
      (timestamp: { toDate: () => Date }) => timestamp.toDate() > oneHourAgo,
    );

    return recentRequests.length >= RATE_LIMIT_PER_HOUR;
  } catch (error) {
    log.error('Failed to check rate limit', error);
    // Fail open - allow the request if rate limit check fails
    return false;
  }
}

/**
 * Record a magic link request for rate limiting
 */
async function recordRateLimitRequest(email: string): Promise<void> {
  const normalizedEmail = email.toLowerCase().trim();
  const rateLimitKey = `magic_link:${normalizedEmail}`;

  try {
    await adminDb
      .collection(COLLECTIONS.RATE_LIMITS)
      .doc(rateLimitKey)
      .set(
        {
          email: normalizedEmail,
          requests: FieldValue.arrayUnion(new Date()),
          updatedAt: new Date(),
        },
        { merge: true },
      );
  } catch (error) {
    log.error('Failed to record rate limit request', error);
  }
}

// =============================================================================
// Audit Logging
// =============================================================================

/**
 * Record an audit log entry for magic link actions
 */
async function recordAuditLog(entry: MagicLinkAuditEntry): Promise<void> {
  try {
    await adminDb.collection(COLLECTIONS.MAGIC_LINK_AUDIT).add({
      ...entry,
      timestamp: entry.timestamp || new Date(),
    });
  } catch (error) {
    log.error('Failed to record audit log', error, { entry });
  }
}

// =============================================================================
// Token Operations
// =============================================================================

/**
 * Generate a magic link token for a user
 *
 * @param email - User's email address
 * @param options - Additional options including deep linking destination
 * @returns Token generation result
 */
export async function generateMagicToken(
  email: string,
  options?: {
    requestIp?: string;
    userAgent?: string;
    /** Optional destination URL path for deep linking (e.g., /ignite/courses/abc123) */
    destination?: string;
    /** Optional tenant ID for multi-tenant context */
    tenantId?: string;
  },
): Promise<GenerateTokenResult> {
  const normalizedEmail = email.toLowerCase().trim();

  try {
    // Check rate limiting
    if (await isRateLimited(normalizedEmail)) {
      await recordAuditLog({
        action: 'rate_limited',
        email: normalizedEmail,
        ip: options?.requestIp,
        userAgent: options?.userAgent,
        timestamp: new Date(),
      });

      log.warn('Magic link request rate limited', { email: normalizedEmail });

      return {
        success: false,
        error: 'Too many requests. Please try again later.',
        errorCode: 'RATE_LIMITED',
      };
    }

    // Generate token
    const token = generateSecureToken();
    const tokenHash = hashToken(token);
    const expiresAt = new Date(Date.now() + TOKEN_EXPIRY_MS);

    // Store token hash in Firestore
    const tokenDoc: MagicTokenDocument = {
      tokenHash,
      email: normalizedEmail,
      expiresAt,
      createdAt: new Date(),
      used: false,
      requestIp: options?.requestIp,
      userAgent: options?.userAgent,
      destination: options?.destination,
      tenantId: options?.tenantId,
    };

    await adminDb.collection(COLLECTIONS.MAGIC_TOKENS).doc(tokenHash).set(tokenDoc);

    // Record rate limit
    await recordRateLimitRequest(normalizedEmail);

    // Record audit log
    await recordAuditLog({
      action: 'requested',
      email: normalizedEmail,
      tokenHash,
      ip: options?.requestIp,
      userAgent: options?.userAgent,
      timestamp: new Date(),
    });

    log.info('Magic token generated', { email: normalizedEmail, tokenHash });

    return {
      success: true,
      token,
      tokenHash,
    };
  } catch (error) {
    log.error('Failed to generate magic token', error, { email: normalizedEmail });

    return {
      success: false,
      error: 'Failed to generate magic link. Please try again.',
      errorCode: 'GENERATION_FAILED',
    };
  }
}

/**
 * Validate a magic link token and sign in the user
 *
 * @param token - Raw token from the magic link URL
 * @param options - Additional options for audit logging
 * @returns Validation result with Firebase custom token for sign-in
 */
export async function validateMagicToken(
  token: string,
  options?: {
    requestIp?: string;
    userAgent?: string;
  },
): Promise<ValidateTokenResult> {
  const tokenHash = hashToken(token);

  try {
    // Get token document
    const tokenDocRef = adminDb.collection(COLLECTIONS.MAGIC_TOKENS).doc(tokenHash);
    const tokenDocSnap = await tokenDocRef.get();

    if (!tokenDocSnap.exists) {
      await recordAuditLog({
        action: 'invalid',
        email: 'unknown',
        tokenHash,
        ip: options?.requestIp,
        userAgent: options?.userAgent,
        details: 'Token not found',
        timestamp: new Date(),
      });

      log.warn('Invalid magic token - not found', { tokenHash });

      return {
        success: false,
        error: 'Invalid or expired link. Please request a new one.',
        errorCode: 'INVALID_TOKEN',
      };
    }

    const tokenData = tokenDocSnap.data() as MagicTokenDocument;

    // Check if token is already used
    if (tokenData.used) {
      await recordAuditLog({
        action: 'invalid',
        email: tokenData.email,
        tokenHash,
        ip: options?.requestIp,
        userAgent: options?.userAgent,
        details: 'Token already used',
        timestamp: new Date(),
      });

      log.warn('Magic token already used', { tokenHash, email: tokenData.email });

      return {
        success: false,
        error: 'This link has already been used. Please request a new one.',
        errorCode: 'ALREADY_USED',
      };
    }

    // Check if token is expired
    const expiresAt =
      tokenData.expiresAt instanceof Date
        ? tokenData.expiresAt
        : (tokenData.expiresAt as { toDate: () => Date }).toDate();

    if (expiresAt < new Date()) {
      await recordAuditLog({
        action: 'expired',
        email: tokenData.email,
        tokenHash,
        ip: options?.requestIp,
        userAgent: options?.userAgent,
        timestamp: new Date(),
      });

      log.warn('Magic token expired', { tokenHash, email: tokenData.email });

      return {
        success: false,
        error: 'This link has expired. Please request a new one.',
        errorCode: 'EXPIRED_TOKEN',
      };
    }

    // Mark token as used (single-use)
    await tokenDocRef.update({
      used: true,
      usedAt: new Date(),
    });

    // Get or create Firebase user
    let uid: string;
    try {
      const userRecord = await adminAuth.getUserByEmail(tokenData.email);
      uid = userRecord.uid;
    } catch {
      // User doesn't exist, create them
      const newUser = await adminAuth.createUser({
        email: tokenData.email,
        emailVerified: true, // Magic link verifies email
      });
      uid = newUser.uid;
      log.info('Created new user via magic link', { uid, email: tokenData.email });
    }

    // Generate Firebase custom token for sign-in
    const customToken = await adminAuth.createCustomToken(uid);

    // Record successful validation
    await recordAuditLog({
      action: 'validated',
      email: tokenData.email,
      tokenHash,
      ip: options?.requestIp,
      userAgent: options?.userAgent,
      timestamp: new Date(),
    });

    log.info('Magic token validated successfully', {
      tokenHash,
      email: tokenData.email,
      uid,
      destination: tokenData.destination,
      tenantId: tokenData.tenantId,
    });

    return {
      success: true,
      email: tokenData.email,
      uid,
      customToken,
      destination: tokenData.destination,
      tenantId: tokenData.tenantId,
    };
  } catch (error) {
    log.error('Failed to validate magic token', error, { tokenHash });

    return {
      success: false,
      error: 'Failed to validate link. Please try again.',
      errorCode: 'VALIDATION_FAILED',
    };
  }
}

/**
 * Clean up expired tokens (for scheduled cleanup job)
 */
export async function cleanupExpiredTokens(): Promise<number> {
  try {
    const expiredTokens = await adminDb
      .collection(COLLECTIONS.MAGIC_TOKENS)
      .where('expiresAt', '<', new Date())
      .limit(500)
      .get();

    const batch = adminDb.batch();
    expiredTokens.docs.forEach((doc) => {
      batch.delete(doc.ref);
    });

    await batch.commit();

    log.info('Cleaned up expired magic tokens', { count: expiredTokens.size });

    return expiredTokens.size;
  } catch (error) {
    log.error('Failed to cleanup expired tokens', error);
    return 0;
  }
}

/**
 * Get token expiry duration for display purposes
 */
export function getTokenExpiryDuration(): string {
  const hours = TOKEN_EXPIRY_MS / (60 * 60 * 1000);
  return `${hours} hours`;
}
