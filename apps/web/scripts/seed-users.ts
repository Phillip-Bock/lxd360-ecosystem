/**
 * Seed Users Script
 *
 * Creates test users with 4-persona hierarchy in Firebase Auth
 * with custom claims for persona and tenantId.
 *
 * Usage: npx tsx scripts/seed-users.ts
 *
 * Requires FIREBASE_SERVICE_ACCOUNT_KEY environment variable.
 */

import { config } from 'dotenv';
import { resolve } from 'path';

// Load .env.local explicitly (dotenv/config only loads .env)
config({ path: resolve(__dirname, '../.env.local') });
config({ path: resolve(__dirname, '../.env') });

import { cert, getApps, initializeApp, type ServiceAccount } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';

// =============================================================================
// CLI Output (using process.stdout for scripts)
// =============================================================================

/** CLI output helper - scripts use stdout, not print */
const print = (msg: string) => process.stdout.write(`${msg}\n`);
const printErr = (msg: string) => process.stderr.write(`${msg}\n`);

// =============================================================================
// Configuration
// =============================================================================

const DEFAULT_TENANT = 'default-dev-tenant';
const DEFAULT_PASSWORD = 'LXD360-Dev!';

interface TestUser {
  email: string;
  password: string;
  displayName: string;
  persona: 'owner' | 'editor' | 'manager' | 'learner';
  tenantId: string;
}

const TEST_USERS: TestUser[] = [
  {
    email: 'phill+super@lxd360.com',
    password: DEFAULT_PASSWORD,
    displayName: 'Phill Bock (Owner)',
    persona: 'owner',
    tenantId: DEFAULT_TENANT,
  },
  {
    email: 'phill+editor@lxd360.com',
    password: DEFAULT_PASSWORD,
    displayName: 'Editor User',
    persona: 'editor',
    tenantId: DEFAULT_TENANT,
  },
  {
    email: 'phill+admin@lxd360.com',
    password: DEFAULT_PASSWORD,
    displayName: 'Manager User',
    persona: 'manager',
    tenantId: DEFAULT_TENANT,
  },
  {
    email: 'phill+learn@lxd360.com',
    password: DEFAULT_PASSWORD,
    displayName: 'Learner User',
    persona: 'learner',
    tenantId: DEFAULT_TENANT,
  },
];

// =============================================================================
// Firebase Admin Initialization
// =============================================================================

function initializeFirebaseAdmin() {
  if (getApps().length > 0) {
    return;
  }

  // Option 1: Full JSON service account key
  const serviceAccountKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
  if (serviceAccountKey) {
    try {
      const serviceAccount = JSON.parse(serviceAccountKey) as ServiceAccount;
      initializeApp({
        credential: cert(serviceAccount),
        projectId: serviceAccount.projectId as string,
      });
      print('Firebase Admin initialized from FIREBASE_SERVICE_ACCOUNT_KEY');
      return;
    } catch (error) {
      throw new Error(`Failed to parse FIREBASE_SERVICE_ACCOUNT_KEY: ${error}`);
    }
  }

  // Option 2: Individual env vars (commonly used in Next.js)
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY;
  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || process.env.GOOGLE_PROJECT_ID;

  if (clientEmail && privateKey && projectId) {
    initializeApp({
      credential: cert({
        projectId,
        clientEmail,
        // Fix Next.js env variable newline escaping
        privateKey: privateKey.replace(/\\n/g, '\n'),
      }),
      projectId,
    });
    print('Firebase Admin initialized from individual env vars');
    return;
  }

  throw new Error(
    'Firebase credentials not found. Set either:\n' +
      '  - FIREBASE_SERVICE_ACCOUNT_KEY (full JSON), or\n' +
      '  - FIREBASE_CLIENT_EMAIL + FIREBASE_PRIVATE_KEY + NEXT_PUBLIC_FIREBASE_PROJECT_ID',
  );
}

// =============================================================================
// User Seeding Functions
// =============================================================================

async function createOrUpdateUser(user: TestUser): Promise<string> {
  const auth = getAuth();
  const db = getFirestore();

  let uid: string;

  try {
    // Try to get existing user
    const existingUser = await auth.getUserByEmail(user.email);
    uid = existingUser.uid;
    print(`  Found existing user: ${user.email} (${uid})`);
  } catch {
    // Create new user
    const newUser = await auth.createUser({
      email: user.email,
      password: user.password,
      displayName: user.displayName,
      emailVerified: true,
    });
    uid = newUser.uid;
    print(`  Created new user: ${user.email} (${uid})`);
  }

  // Set custom claims (persona + tenantId)
  await auth.setCustomUserClaims(uid, {
    persona: user.persona,
    tenantId: user.tenantId,
  });
  print(`  Set claims: persona=${user.persona}, tenantId=${user.tenantId}`);

  // Create/update user document in Firestore
  const userRef = db.collection('users').doc(uid);
  await userRef.set(
    {
      uid,
      email: user.email,
      displayName: user.displayName,
      persona: user.persona,
      tenantId: user.tenantId,
      emailVerified: true,
      updatedAt: FieldValue.serverTimestamp(),
    },
    { merge: true },
  );
  print(`  Updated Firestore document`);

  return uid;
}

async function ensureTenantExists(tenantId: string): Promise<void> {
  const db = getFirestore();
  const tenantRef = db.collection('tenants').doc(tenantId);
  const tenantDoc = await tenantRef.get();

  if (!tenantDoc.exists) {
    await tenantRef.set({
      id: tenantId,
      name: 'LXD360 Development',
      slug: 'lxd360-dev',
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
      settings: {
        features: {
          aiChat: true,
          tts: true,
          scormUpload: true,
        },
      },
    });
    print(`Created tenant: ${tenantId}`);
  } else {
    print(`Tenant exists: ${tenantId}`);
  }
}

// =============================================================================
// Main
// =============================================================================

async function main(): Promise<void> {
  print('='.repeat(60));
  print('LXD360 User Seeding Script');
  print('4-Persona Hierarchy: Owner > Editor > Manager > Learner');
  print('='.repeat(60));
  print('');

  try {
    initializeFirebaseAdmin();
    print('');

    // Ensure tenant exists
    print('Ensuring tenant exists...');
    await ensureTenantExists(DEFAULT_TENANT);
    print('');

    // Create/update users
    print('Seeding users...');
    for (const user of TEST_USERS) {
      print(`\nProcessing: ${user.email} (${user.persona})`);
      await createOrUpdateUser(user);
    }

    print('');
    print('='.repeat(60));
    print('Seeding complete!');
    print('');
    print('Test Accounts:');
    print('-'.repeat(60));
    for (const user of TEST_USERS) {
      print(`  ${user.persona.padEnd(8)} | ${user.email}`);
    }
    print('-'.repeat(60));
    print(`  Password: ${DEFAULT_PASSWORD}`);
    print('='.repeat(60));
  } catch (error) {
    printErr(`Seeding failed: ${error}`);
    process.exit(1);
  }
}

main();
