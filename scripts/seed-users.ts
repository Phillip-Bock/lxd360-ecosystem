/**
 * Seed Script: Create "Fab Four" Test Users
 *
 * Creates the standard test users for Strike 1 verification:
 * - Super Admin: phill+super@lxd360.com
 * - Org Admin: phill+admin@lxd360.com
 * - Instructor: phill+teach@lxd360.com
 * - Learner: phill+learn@lxd360.com
 *
 * Usage: npx tsx scripts/seed-users.ts
 */

import { cert, getApps, initializeApp, type ServiceAccount } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { FieldValue, getFirestore } from 'firebase-admin/firestore';
import * as dotenv from 'dotenv';
import * as fs from 'node:fs';
import * as path from 'node:path';

// Load environment variables from .env.local or .env
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

// Also check apps/web for env files (monorepo structure)
dotenv.config({ path: path.resolve(process.cwd(), 'apps/web/.env.local') });
dotenv.config({ path: path.resolve(process.cwd(), 'apps/web/.env') });

// -----------------------------------------------------------------------------
// Configuration
// -----------------------------------------------------------------------------

const TEST_PASSWORD = 'LXD360-Dev!';
const DEFAULT_TENANT_ID = 'default-dev-tenant';

interface TestUser {
  email: string;
  displayName: string;
  role: 'super_admin' | 'org_admin' | 'instructor' | 'learner';
  roleLevel: number;
}

const FAB_FOUR: TestUser[] = [
  {
    email: 'phill+super@lxd360.com',
    displayName: 'Super Admin (Phill)',
    role: 'super_admin',
    roleLevel: 100,
  },
  {
    email: 'phill+admin@lxd360.com',
    displayName: 'Org Admin (Phill)',
    role: 'org_admin',
    roleLevel: 90,
  },
  {
    email: 'phill+teach@lxd360.com',
    displayName: 'Instructor (Phill)',
    role: 'instructor',
    roleLevel: 50,
  },
  {
    email: 'phill+learn@lxd360.com',
    displayName: 'Learner (Phill)',
    role: 'learner',
    roleLevel: 40,
  },
];

// Role permissions mapping
const ROLE_PERMISSIONS: Record<string, string[]> = {
  super_admin: [
    'read:own_profile',
    'write:own_profile',
    'read:courses',
    'write:courses',
    'publish:courses',
    'delete:courses',
    'read:learners',
    'write:learners',
    'enroll:learners',
    'read:analytics',
    'read:analytics:personal',
    'read:analytics:team',
    'read:analytics:org',
    'read:analytics:platform',
    'export:analytics',
    'manage:users',
    'manage:roles',
    'invite:users',
    'manage:org',
    'manage:org:settings',
    'manage:org:billing',
    'manage:org:branding',
    'manage:platform',
    'manage:tenants',
    'create:content',
    'review:content',
    'approve:content',
    'mentor:assign',
    'mentor:sessions',
    'take:assessments',
    'grade:assessments',
    'create:assessments',
  ],
  org_admin: [
    'read:own_profile',
    'write:own_profile',
    'read:courses',
    'write:courses',
    'publish:courses',
    'delete:courses',
    'read:learners',
    'write:learners',
    'enroll:learners',
    'read:analytics',
    'read:analytics:personal',
    'read:analytics:team',
    'read:analytics:org',
    'export:analytics',
    'manage:users',
    'manage:roles',
    'invite:users',
    'manage:org',
    'manage:org:settings',
    'manage:org:billing',
    'manage:org:branding',
    'create:content',
    'review:content',
    'approve:content',
    'mentor:assign',
    'mentor:sessions',
    'take:assessments',
    'grade:assessments',
    'create:assessments',
  ],
  instructor: [
    'read:own_profile',
    'write:own_profile',
    'read:courses',
    'write:courses',
    'publish:courses',
    'read:learners',
    'enroll:learners',
    'read:analytics',
    'read:analytics:personal',
    'read:analytics:team',
    'create:content',
    'review:content',
    'mentor:sessions',
    'take:assessments',
    'grade:assessments',
    'create:assessments',
  ],
  learner: [
    'read:own_profile',
    'write:own_profile',
    'read:courses',
    'read:analytics:personal',
    'take:assessments',
  ],
};

// -----------------------------------------------------------------------------
// Firebase Initialization
// -----------------------------------------------------------------------------

function getCredentials(): ServiceAccount | undefined {
  // Option 1: Full JSON credentials in GOOGLE_CREDENTIALS
  const googleCredentials = process.env.GOOGLE_CREDENTIALS;
  if (googleCredentials) {
    try {
      const decoded = Buffer.from(googleCredentials, 'base64').toString('utf-8');
      const parsed = JSON.parse(decoded);
      if (parsed.project_id) {
        console.log('Using GOOGLE_CREDENTIALS (base64)');
        return parsed as ServiceAccount;
      }
    } catch {
      try {
        const parsed = JSON.parse(googleCredentials);
        if (parsed.project_id) {
          console.log('Using GOOGLE_CREDENTIALS (raw JSON)');
          return parsed as ServiceAccount;
        }
      } catch {
        console.warn('Failed to parse GOOGLE_CREDENTIALS');
      }
    }
  }

  // Option 2: Individual environment variables
  const projectId = process.env.GOOGLE_CLOUD_PROJECT || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');

  if (projectId && clientEmail && privateKey) {
    console.log(`Using individual env vars (project: ${projectId})`);
    return {
      projectId,
      clientEmail,
      privateKey,
    } as ServiceAccount;
  }

  console.error('No Firebase credentials found!');
  console.error('Required: GOOGLE_CREDENTIALS or (GOOGLE_CLOUD_PROJECT + FIREBASE_CLIENT_EMAIL + FIREBASE_PRIVATE_KEY)');
  return undefined;
}

function initializeFirebase() {
  if (getApps().length > 0) {
    return getApps()[0];
  }

  const credentials = getCredentials();
  if (!credentials) {
    throw new Error('Firebase credentials not found. Check your .env.local file.');
  }

  return initializeApp({
    credential: cert(credentials),
    projectId: credentials.projectId as string,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  });
}

// -----------------------------------------------------------------------------
// User Creation
// -----------------------------------------------------------------------------

interface CreatedUser {
  email: string;
  uid: string;
  role: string;
  password: string;
  displayName: string;
}

async function createOrUpdateUser(
  auth: ReturnType<typeof getAuth>,
  db: ReturnType<typeof getFirestore>,
  user: TestUser
): Promise<CreatedUser> {
  let uid: string;
  let created = false;

  // Check if user exists
  try {
    const existingUser = await auth.getUserByEmail(user.email);
    uid = existingUser.uid;
    console.log(`  Found existing user: ${user.email} (${uid})`);

    // Update password to known value
    await auth.updateUser(uid, {
      password: TEST_PASSWORD,
      displayName: user.displayName,
      emailVerified: true,
    });
    console.log(`  Updated password and profile`);
  } catch (error: unknown) {
    // User doesn't exist, create them
    if ((error as { code?: string }).code === 'auth/user-not-found') {
      const newUser = await auth.createUser({
        email: user.email,
        password: TEST_PASSWORD,
        displayName: user.displayName,
        emailVerified: true,
      });
      uid = newUser.uid;
      created = true;
      console.log(`  Created new user: ${user.email} (${uid})`);
    } else {
      throw error;
    }
  }

  // Set custom claims
  const claims = {
    role: user.role,
    roleLevel: user.roleLevel,
    tenantId: DEFAULT_TENANT_ID,
    permissions: ROLE_PERMISSIONS[user.role] || [],
    isEmployee: true,
    claimsUpdatedAt: Date.now(),
  };
  await auth.setCustomUserClaims(uid, claims);
  console.log(`  Set custom claims: role=${user.role}, level=${user.roleLevel}`);

  // Create/update Firestore documents
  try {
    // Create tenant document first (if it doesn't exist)
    const tenantRef = db.collection('tenants').doc(DEFAULT_TENANT_ID);
    await tenantRef.set(
      {
        id: DEFAULT_TENANT_ID,
        name: 'Development Tenant',
        createdAt: FieldValue.serverTimestamp(),
      },
      { merge: true }
    );

    // Create learner document at tenants/{tenantId}/learners/{uid}
    const learnerRef = tenantRef.collection('learners').doc(uid);
    const learnerData: Record<string, unknown> = {
      uid,
      email: user.email,
      displayName: user.displayName,
      role: user.role,
      roleLevel: user.roleLevel,
      tenantId: DEFAULT_TENANT_ID,
      isEmployee: true,
      isTestUser: true,
      updatedAt: FieldValue.serverTimestamp(),
    };
    if (created) {
      learnerData.createdAt = FieldValue.serverTimestamp();
    }
    await learnerRef.set(learnerData, { merge: true });
    console.log(`  Created Firestore doc: tenants/${DEFAULT_TENANT_ID}/learners/${uid}`);

    // Also create in users collection for backward compatibility
    const userRef = db.collection('users').doc(uid);
    await userRef.set(
      {
        uid,
        email: user.email,
        displayName: user.displayName,
        role: user.role,
        roleLevel: user.roleLevel,
        tenantId: DEFAULT_TENANT_ID,
        isEmployee: true,
        isTestUser: true,
        updatedAt: FieldValue.serverTimestamp(),
      },
      { merge: true }
    );
    console.log(`  Created Firestore doc: users/${uid}`);
  } catch (firestoreError) {
    console.warn(`  WARNING: Firestore write failed (${firestoreError})`);
    console.warn(`  Auth user was created - Firestore docs may need manual creation`);
  }

  return {
    email: user.email,
    uid,
    role: user.role,
    password: TEST_PASSWORD,
    displayName: user.displayName,
  };
}

// -----------------------------------------------------------------------------
// Main
// -----------------------------------------------------------------------------

async function main() {
  console.log('\n===========================================');
  console.log('  LXD360 Test User Seeder - "Fab Four"');
  console.log('===========================================\n');

  // Initialize Firebase
  console.log('Initializing Firebase Admin SDK...');
  const app = initializeFirebase();
  const auth = getAuth(app);
  const db = getFirestore(app);

  console.log('\nCreating/updating test users...\n');

  const createdUsers: CreatedUser[] = [];

  for (const user of FAB_FOUR) {
    console.log(`\n[${user.role.toUpperCase()}] ${user.email}`);
    try {
      const result = await createOrUpdateUser(auth, db, user);
      createdUsers.push(result);
    } catch (error) {
      console.error(`  ERROR: Failed to create/update user: ${error}`);
      process.exit(1);
    }
  }

  // Save credentials to local file
  const credsFile = path.resolve(process.cwd(), 'local-test-creds.json');
  const credsData = {
    generatedAt: new Date().toISOString(),
    tenantId: DEFAULT_TENANT_ID,
    users: createdUsers,
  };

  fs.writeFileSync(credsFile, JSON.stringify(credsData, null, 2));
  console.log(`\nCredentials saved to: ${credsFile}`);

  console.log('\n===========================================');
  console.log('  Summary');
  console.log('===========================================');
  console.log(`  Total users: ${createdUsers.length}`);
  console.log(`  Tenant ID: ${DEFAULT_TENANT_ID}`);
  console.log(`  Password: ${TEST_PASSWORD}`);
  console.log('\n  Users created:');
  for (const u of createdUsers) {
    console.log(`    - ${u.email} (${u.role})`);
  }

  console.log('\n  Verification commands:');
  console.log('    firebase auth:export users.json --project lxd-saas-dev');
  console.log('    cat local-test-creds.json');

  console.log('\n===========================================');
  console.log('  DONE');
  console.log('===========================================\n');
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
