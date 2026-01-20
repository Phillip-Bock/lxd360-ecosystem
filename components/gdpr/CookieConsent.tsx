/**
 * GDPR Cookie Consent Banner
 * ===========================
 * EU GDPR Article 6(1)(a) compliant cookie consent banner.
 * Provides granular control over cookie categories.
 *
 * @see https://gdpr.eu/cookies/
 * @module components/gdpr/CookieConsent
 */

'use client';

import { BarChart, Cookie, Shield, Target } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';

// ============================================================================
// TYPES
// ============================================================================

export interface CookiePreferences {
  necessary: boolean; // Always true, cannot be disabled
  analytics: boolean;
  marketing: boolean;
  preferences: boolean;
  consentDate: string;
  consentVersion: string;
}

interface CookieConsentProps {
  privacyPolicyUrl?: string;
  cookiePolicyUrl?: string;
  onConsentChange?: (preferences: CookiePreferences) => void;
}

// ============================================================================
// CONSTANTS
// ============================================================================

const CONSENT_KEY = 'lxp360_cookie_consent';
const CONSENT_VERSION = '1.0.0';

const DEFAULT_PREFERENCES: CookiePreferences = {
  necessary: true,
  analytics: false,
  marketing: false,
  preferences: false,
  consentDate: '',
  consentVersion: CONSENT_VERSION,
};

// ============================================================================
// COMPONENT
// ============================================================================

export function CookieConsent({
  privacyPolicyUrl = '/legal/privacy-policy',
  cookiePolicyUrl = '/legal/cookie-policy',
  onConsentChange,
}: CookieConsentProps) {
  const [showBanner, setShowBanner] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [preferences, setPreferences] = useState<CookiePreferences>(DEFAULT_PREFERENCES);

  // Check for existing consent on mount
  useEffect(() => {
    const stored = localStorage.getItem(CONSENT_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as CookiePreferences;
        // Check if consent version matches
        if (parsed.consentVersion === CONSENT_VERSION) {
          setPreferences(parsed);
          onConsentChange?.(parsed);
          return;
        }
      } catch {
        // Silently ignore - invalid stored data, show banner to get fresh consent
      }
    }
    // Show banner after a brief delay for UX
    const timer = setTimeout(() => setShowBanner(true), 500);
    return () => clearTimeout(timer);
  }, [onConsentChange]);

  const savePreferences = useCallback(
    (prefs: CookiePreferences) => {
      const withDate = {
        ...prefs,
        consentDate: new Date().toISOString(),
        consentVersion: CONSENT_VERSION,
      };
      localStorage.setItem(CONSENT_KEY, JSON.stringify(withDate));
      setPreferences(withDate);
      onConsentChange?.(withDate);
      setShowBanner(false);
      setShowSettings(false);
    },
    [onConsentChange],
  );

  const acceptAll = useCallback(() => {
    savePreferences({
      ...DEFAULT_PREFERENCES,
      analytics: true,
      marketing: true,
      preferences: true,
    });
  }, [savePreferences]);

  const rejectAll = useCallback(() => {
    savePreferences({
      ...DEFAULT_PREFERENCES,
      analytics: false,
      marketing: false,
      preferences: false,
    });
  }, [savePreferences]);

  const saveSelected = useCallback(() => {
    savePreferences(preferences);
  }, [preferences, savePreferences]);

  const updatePreference = (key: keyof CookiePreferences, value: boolean) => {
    if (key === 'necessary') return; // Cannot disable necessary cookies
    setPreferences((prev) => ({ ...prev, [key]: value }));
  };

  // Don't render if consent already given
  if (!showBanner && !showSettings) return null;

  return (
    <>
      {/* Main Banner */}
      {showBanner && (
        <div
          className="fixed bottom-0 left-0 right-0 z-50 bg-background border-t shadow-lg p-4 md:p-6"
          role="dialog"
          aria-modal="true"
          aria-labelledby="cookie-consent-title"
          aria-describedby="cookie-consent-description"
        >
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="flex items-start gap-3">
                <Cookie className="h-6 w-6 text-primary shrink-0 mt-0.5" />
                <div>
                  <h2 id="cookie-consent-title" className="text-lg font-semibold">
                    We use cookies
                  </h2>
                  <p id="cookie-consent-description" className="text-sm text-muted-foreground mt-1">
                    We use cookies to enhance your experience, analyze site traffic, and for
                    marketing purposes. By clicking &quot;Accept All&quot;, you consent to our use
                    of cookies.{' '}
                    <a
                      href={cookiePolicyUrl}
                      className="underline hover:text-primary"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Learn more
                    </a>
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2 md:shrink-0">
                <Button variant="outline" onClick={rejectAll} className="flex-1 md:flex-none">
                  Reject All
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowSettings(true)}
                  className="flex-1 md:flex-none"
                >
                  Customize
                </Button>
                <Button onClick={acceptAll} className="flex-1 md:flex-none">
                  Accept All
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Settings Dialog */}
      <Dialog open={showSettings} onOpenChange={setShowSettings}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Cookie Preferences
            </DialogTitle>
            <DialogDescription>
              Manage your cookie preferences. Some cookies are necessary for the site to function
              and cannot be disabled.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Necessary Cookies */}
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-green-600" />
                  <Label className="font-medium">Strictly Necessary</Label>
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  Essential for the website to function. Cannot be disabled.
                </p>
              </div>
              <Switch checked disabled aria-label="Necessary cookies (always enabled)" />
            </div>

            {/* Preferences Cookies */}
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <Cookie className="h-4 w-4 text-brand-blue" />
                  <Label htmlFor="pref-cookies" className="font-medium">
                    Preference Cookies
                  </Label>
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  Remember your settings and preferences for a better experience.
                </p>
              </div>
              <Switch
                id="pref-cookies"
                checked={preferences.preferences}
                onCheckedChange={(v) => updatePreference('preferences', v)}
                aria-label="Toggle preference cookies"
              />
            </div>

            {/* Analytics Cookies */}
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <BarChart className="h-4 w-4 text-purple-600" />
                  <Label htmlFor="analytics-cookies" className="font-medium">
                    Analytics Cookies
                  </Label>
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  Help us understand how visitors interact with our website.
                </p>
              </div>
              <Switch
                id="analytics-cookies"
                checked={preferences.analytics}
                onCheckedChange={(v) => updatePreference('analytics', v)}
                aria-label="Toggle analytics cookies"
              />
            </div>

            {/* Marketing Cookies */}
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <Target className="h-4 w-4 text-orange-600" />
                  <Label htmlFor="marketing-cookies" className="font-medium">
                    Marketing Cookies
                  </Label>
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  Used to deliver relevant advertisements and track campaign performance.
                </p>
              </div>
              <Switch
                id="marketing-cookies"
                checked={preferences.marketing}
                onCheckedChange={(v) => updatePreference('marketing', v)}
                aria-label="Toggle marketing cookies"
              />
            </div>
          </div>

          <div className="text-xs text-muted-foreground">
            <a
              href={privacyPolicyUrl}
              className="underline hover:text-primary"
              target="_blank"
              rel="noopener noreferrer"
            >
              Privacy Policy
            </a>
            {' • '}
            <a
              href={cookiePolicyUrl}
              className="underline hover:text-primary"
              target="_blank"
              rel="noopener noreferrer"
            >
              Cookie Policy
            </a>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={rejectAll}>
              Reject All
            </Button>
            <Button onClick={saveSelected}>Save Preferences</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

// ============================================================================
// HOOK FOR CHECKING CONSENT
// ============================================================================

/**
 * Hook to check if a specific cookie type has consent.
 * Use this before setting non-essential cookies.
 *
 * @example
 * ```ts
 * const { hasConsent, preferences } = useCookieConsent()
 *
 * if (hasConsent('analytics')) {
 *   // Initialize analytics
 * }
 * ```
 */
export function useCookieConsent() {
  const [preferences, setPreferences] = useState<CookiePreferences | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem(CONSENT_KEY);
    if (stored) {
      try {
        setPreferences(JSON.parse(stored));
      } catch {
        // Silently ignore - invalid stored data, set preferences to null
        setPreferences(null);
      }
    }
  }, []);

  const hasConsent = useCallback(
    (type: keyof Omit<CookiePreferences, 'consentDate' | 'consentVersion'>) => {
      if (!preferences) return false;
      return preferences[type] === true;
    },
    [preferences],
  );

  return { preferences, hasConsent };
}

export default CookieConsent;
