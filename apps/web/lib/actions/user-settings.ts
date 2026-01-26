'use server';

import { FieldValue } from 'firebase-admin/firestore';
import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import { adminAuth, adminDb } from '@/lib/firebase/admin';
import { logger } from '@/lib/logger';
import {
  type AccessibilityPreferences,
  type AppearancePreferences,
  accessibilityPreferencesSchema,
  appearancePreferencesSchema,
  DEFAULT_ACCESSIBILITY_PREFERENCES,
  DEFAULT_APPEARANCE_PREFERENCES,
  DEFAULT_NOTIFICATION_PREFERENCES,
  type NotificationPreferences,
  notificationPreferencesSchema,
  type ProfileFormData,
  profileSchema,
} from '@/types/user-settings';

const log = logger.child({ module: 'actions-user-settings' });

// ============================================================================
// Types
// ============================================================================

type ActionResult<T = unknown> = { error: string } | { data: T };

interface UserSettingsDocument {
  uid: string;
  email: string;
  displayName: string;
  firstName: string;
  lastName: string;
  phone?: string;
  jobTitle?: string;
  department?: string;
  bio?: string;
  location?: string;
  timezone?: string;
  avatarUrl?: string;
  notifications: NotificationPreferences;
  accessibility: AccessibilityPreferences;
  appearance: AppearancePreferences;
  updatedAt: FirebaseFirestore.Timestamp | FieldValue;
  createdAt: FirebaseFirestore.Timestamp | FieldValue;
}

// ============================================================================
// Auth Helper
// ============================================================================

async function getAuthenticatedUser(): Promise<{ uid: string; email: string } | null> {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('__session')?.value;

    if (!sessionCookie) {
      log.warn('No session cookie found');
      return null;
    }

    const decodedToken = await adminAuth.verifySessionCookie(sessionCookie, true);

    return {
      uid: decodedToken.uid,
      email: decodedToken.email || '',
    };
  } catch (error) {
    log.error('Failed to verify session', { error });
    return null;
  }
}

// ============================================================================
// Get User Settings
// ============================================================================

export async function getUserSettings(): Promise<
  ActionResult<{
    profile: ProfileFormData & { email: string; avatarUrl?: string };
    notifications: NotificationPreferences;
    accessibility: AccessibilityPreferences;
    appearance: AppearancePreferences;
  }>
> {
  try {
    const authUser = await getAuthenticatedUser();

    if (!authUser) {
      return { error: 'Unauthorized: Please sign in' };
    }

    const userRef = adminDb.collection('users').doc(authUser.uid);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      // Return defaults if no settings exist
      return {
        data: {
          profile: {
            displayName: '',
            firstName: '',
            lastName: '',
            phone: '',
            jobTitle: '',
            department: '',
            bio: '',
            location: '',
            timezone: '',
            email: authUser.email,
            avatarUrl: undefined,
          },
          notifications: DEFAULT_NOTIFICATION_PREFERENCES,
          accessibility: DEFAULT_ACCESSIBILITY_PREFERENCES,
          appearance: DEFAULT_APPEARANCE_PREFERENCES,
        },
      };
    }

    const data = userDoc.data() as UserSettingsDocument;

    return {
      data: {
        profile: {
          displayName: data.displayName || '',
          firstName: data.firstName || '',
          lastName: data.lastName || '',
          phone: data.phone || '',
          jobTitle: data.jobTitle || '',
          department: data.department || '',
          bio: data.bio || '',
          location: data.location || '',
          timezone: data.timezone || '',
          email: authUser.email,
          avatarUrl: data.avatarUrl,
        },
        notifications: data.notifications || DEFAULT_NOTIFICATION_PREFERENCES,
        accessibility: data.accessibility || DEFAULT_ACCESSIBILITY_PREFERENCES,
        appearance: data.appearance || DEFAULT_APPEARANCE_PREFERENCES,
      },
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    log.error('Failed to get user settings', { error: errorMessage });
    return { error: `Failed to get user settings: ${errorMessage}` };
  }
}

// ============================================================================
// Update Profile
// ============================================================================

export async function updateProfile(
  data: ProfileFormData,
): Promise<ActionResult<{ updated: boolean }>> {
  try {
    const authUser = await getAuthenticatedUser();

    if (!authUser) {
      return { error: 'Unauthorized: Please sign in' };
    }

    // Validate input
    const validationResult = profileSchema.safeParse(data);
    if (!validationResult.success) {
      return {
        error: validationResult.error.errors[0]?.message || 'Invalid profile data',
      };
    }

    const userRef = adminDb.collection('users').doc(authUser.uid);

    await userRef.set(
      {
        uid: authUser.uid,
        email: authUser.email,
        displayName: validationResult.data.displayName,
        firstName: validationResult.data.firstName,
        lastName: validationResult.data.lastName,
        phone: validationResult.data.phone || '',
        jobTitle: validationResult.data.jobTitle || '',
        department: validationResult.data.department || '',
        bio: validationResult.data.bio || '',
        location: validationResult.data.location || '',
        timezone: validationResult.data.timezone || '',
        updatedAt: FieldValue.serverTimestamp(),
      },
      { merge: true },
    );

    // Also update Firebase Auth display name
    await adminAuth.updateUser(authUser.uid, {
      displayName: validationResult.data.displayName,
    });

    log.info('Profile updated', { uid: authUser.uid });

    revalidatePath('/ignite/settings');
    revalidatePath('/ignite/settings/profile');

    return { data: { updated: true } };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    log.error('Failed to update profile', { error: errorMessage });
    return { error: `Failed to update profile: ${errorMessage}` };
  }
}

// ============================================================================
// Update Avatar URL
// ============================================================================

export async function updateAvatarUrl(
  avatarUrl: string,
): Promise<ActionResult<{ updated: boolean }>> {
  try {
    const authUser = await getAuthenticatedUser();

    if (!authUser) {
      return { error: 'Unauthorized: Please sign in' };
    }

    const userRef = adminDb.collection('users').doc(authUser.uid);

    await userRef.set(
      {
        avatarUrl,
        updatedAt: FieldValue.serverTimestamp(),
      },
      { merge: true },
    );

    // Also update Firebase Auth photo URL
    await adminAuth.updateUser(authUser.uid, {
      photoURL: avatarUrl,
    });

    log.info('Avatar updated', { uid: authUser.uid });

    revalidatePath('/ignite/settings');
    revalidatePath('/ignite/settings/profile');

    return { data: { updated: true } };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    log.error('Failed to update avatar', { error: errorMessage });
    return { error: `Failed to update avatar: ${errorMessage}` };
  }
}

// ============================================================================
// Update Notification Preferences
// ============================================================================

export async function updateNotificationPreferences(
  data: NotificationPreferences,
): Promise<ActionResult<{ updated: boolean }>> {
  try {
    const authUser = await getAuthenticatedUser();

    if (!authUser) {
      return { error: 'Unauthorized: Please sign in' };
    }

    // Validate input
    const validationResult = notificationPreferencesSchema.safeParse(data);
    if (!validationResult.success) {
      return {
        error: validationResult.error.errors[0]?.message || 'Invalid notification preferences',
      };
    }

    const userRef = adminDb.collection('users').doc(authUser.uid);

    await userRef.set(
      {
        notifications: validationResult.data,
        updatedAt: FieldValue.serverTimestamp(),
      },
      { merge: true },
    );

    log.info('Notification preferences updated', { uid: authUser.uid });

    revalidatePath('/ignite/settings');
    revalidatePath('/ignite/settings/notifications');

    return { data: { updated: true } };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    log.error('Failed to update notification preferences', { error: errorMessage });
    return { error: `Failed to update notification preferences: ${errorMessage}` };
  }
}

// ============================================================================
// Update Accessibility Preferences
// ============================================================================

export async function updateAccessibilityPreferences(
  data: AccessibilityPreferences,
): Promise<ActionResult<{ updated: boolean }>> {
  try {
    const authUser = await getAuthenticatedUser();

    if (!authUser) {
      return { error: 'Unauthorized: Please sign in' };
    }

    // Validate input
    const validationResult = accessibilityPreferencesSchema.safeParse(data);
    if (!validationResult.success) {
      return {
        error: validationResult.error.errors[0]?.message || 'Invalid accessibility preferences',
      };
    }

    const userRef = adminDb.collection('users').doc(authUser.uid);

    await userRef.set(
      {
        accessibility: validationResult.data,
        updatedAt: FieldValue.serverTimestamp(),
      },
      { merge: true },
    );

    log.info('Accessibility preferences updated', { uid: authUser.uid });

    revalidatePath('/ignite/settings');
    revalidatePath('/ignite/settings/accessibility');

    return { data: { updated: true } };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    log.error('Failed to update accessibility preferences', { error: errorMessage });
    return { error: `Failed to update accessibility preferences: ${errorMessage}` };
  }
}

// ============================================================================
// Update Appearance Preferences
// ============================================================================

export async function updateAppearancePreferences(
  data: AppearancePreferences,
): Promise<ActionResult<{ updated: boolean }>> {
  try {
    const authUser = await getAuthenticatedUser();

    if (!authUser) {
      return { error: 'Unauthorized: Please sign in' };
    }

    // Validate input
    const validationResult = appearancePreferencesSchema.safeParse(data);
    if (!validationResult.success) {
      return {
        error: validationResult.error.errors[0]?.message || 'Invalid appearance preferences',
      };
    }

    const userRef = adminDb.collection('users').doc(authUser.uid);

    await userRef.set(
      {
        appearance: validationResult.data,
        updatedAt: FieldValue.serverTimestamp(),
      },
      { merge: true },
    );

    log.info('Appearance preferences updated', { uid: authUser.uid });

    revalidatePath('/ignite/settings');
    revalidatePath('/ignite/settings/appearance');

    return { data: { updated: true } };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    log.error('Failed to update appearance preferences', { error: errorMessage });
    return { error: `Failed to update appearance preferences: ${errorMessage}` };
  }
}
