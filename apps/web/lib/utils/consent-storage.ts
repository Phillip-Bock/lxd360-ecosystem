'use client';

/**
 * =============================================================================
 * Consent-Gated Storage Wrapper (GDPR Art. 6)
 * =============================================================================
 *
 * This module provides a localStorage wrapper that respects user consent.
 * Data is only persisted when the user has granted storage consent.
 *
 * @module lib/utils/consent-storage
 * @version 1.0.0
 */

const CONSENT_KEY = 'lxd360_storage_consent';

export interface ConsentStorage {
  getItem(key: string): string | null;
  setItem(key: string, value: string): boolean;
  removeItem(key: string): void;
  hasConsent(): boolean;
  grantConsent(): void;
  revokeConsent(): void;
}

/**
 * Check if storage consent has been granted
 */
function hasStorageConsent(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    return localStorage.getItem(CONSENT_KEY) === 'granted';
  } catch {
    return false;
  }
}

/**
 * Consent-gated localStorage wrapper
 *
 * Only allows read/write operations when user has granted consent.
 * Silently fails (returns null/false) when consent is not granted.
 */
export const consentStorage: ConsentStorage = {
  hasConsent: hasStorageConsent,

  grantConsent(): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(CONSENT_KEY, 'granted');
    } catch {
      // Storage not available
    }
  },

  revokeConsent(): void {
    if (typeof window === 'undefined') return;
    try {
      // Clear all stored data when consent is revoked
      const keysToRemove: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key !== CONSENT_KEY) {
          keysToRemove.push(key);
        }
      }
      for (const key of keysToRemove) {
        localStorage.removeItem(key);
      }
      localStorage.removeItem(CONSENT_KEY);
    } catch {
      // Storage not available
    }
  },

  getItem(key: string): string | null {
    if (typeof window === 'undefined') return null;
    if (!hasStorageConsent()) return null;
    try {
      return localStorage.getItem(key);
    } catch {
      return null;
    }
  },

  setItem(key: string, value: string): boolean {
    if (typeof window === 'undefined') return false;
    if (!hasStorageConsent()) {
      // Silently skip - consent not granted
      return false;
    }
    try {
      localStorage.setItem(key, value);
      return true;
    } catch {
      return false;
    }
  },

  removeItem(key: string): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.removeItem(key);
    } catch {
      // Ignore errors
    }
  },
};

export default consentStorage;
