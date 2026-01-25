/**
 * Seed Script: Create 4-Persona Test Users
 *
 * Creates the standard test users for the 4-persona RBAC model:
 * - Owner: phill+super@lxd360.com (Full access + Billing)
 * - Editor: phill+editor@lxd360.com (Authoring + Courses)
 * - Manager: phill+admin@lxd360.com (LXP/LMS dashboards, learners)
 * - Learner: phill+learn@lxd360.com (Content consumption only)
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
// Configuration - 4-Persona Model
// -----------------------------------------------------------------------------

const TEST_PASSWORD = 'LXD360-Dev!';
const DEFAULT_TENANT_ID = 'default-dev-tenant';

/** 4-Persona types matching CLAUDE.md v16 */
type Persona = 'owner' | 'editor' | 'manager' | 'learner';

interface TestUser {
  email: string;
  displayName: string;
  persona: Persona;
  personaLevel: number;
}

/**
 * 4-Persona Test Users
 * Owner > Editor > Manager > Learner
 */
const FOUR_PERSONAS: TestUser[] = [
  {
    email: 'phill+super@lxd360.com',
    displayName: 'Phill Bock (Owner)',
    persona: 'owner',
    personaLevel: 100,
  },
  {
    email: 'phill+editor@lxd360.com',
    displayName: 'Editor User',
    persona: 'editor',
    personaLevel: 75,
  },
  {
    email: 'phill+admin@lxd360.com',
    displayName: 'Manager User',
    persona: 'manager',
    personaLevel: 50,
  },
  {
    email: 'phill+learn@lxd360.com',
    displayName: 'Learner User',
    persona: 'learner',
    personaLevel: 25,
  },
];

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
  persona: Persona;
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

  // Set custom claims (4-persona model)
  const claims = {
    persona: user.persona,
    personaLevel: user.personaLevel,
    tenantId: DEFAULT_TENANT_ID,
    isEmployee: true,
    claimsUpdatedAt: Date.now(),
  };
  await auth.setCustomUserClaims(uid, claims);
  console.log(`  Set custom claims: persona=${user.persona}, level=${user.personaLevel}`);

  // Create/update Firestore documents
  try {
    // Create tenant document first (if it doesn't exist)
    const tenantRef = db.collection('tenants').doc(DEFAULT_TENANT_ID);
    await tenantRef.set(
      {
        id: DEFAULT_TENANT_ID,
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
      },
      { merge: true }
    );

    // Create user document at users/{uid}
    const userRef = db.collection('users').doc(uid);
    const userData: Record<string, unknown> = {
      uid,
      email: user.email,
      displayName: user.displayName,
      persona: user.persona,
      personaLevel: user.personaLevel,
      tenantId: DEFAULT_TENANT_ID,
      isEmployee: true,
      isTestUser: true,
      emailVerified: true,
      updatedAt: FieldValue.serverTimestamp(),
    };
    if (created) {
      userData.createdAt = FieldValue.serverTimestamp();
    }
    await userRef.set(userData, { merge: true });
    console.log(`  Created Firestore doc: users/${uid}`);

    // Also create in tenant members collection
    const memberRef = tenantRef.collection('members').doc(uid);
    await memberRef.set(
      {
        uid,
        email: user.email,
        displayName: user.displayName,
        persona: user.persona,
        personaLevel: user.personaLevel,
        joinedAt: FieldValue.serverTimestamp(),
      },
      { merge: true }
    );
    console.log(`  Created Firestore doc: tenants/${DEFAULT_TENANT_ID}/members/${uid}`);
  } catch (firestoreError) {
    console.warn(`  WARNING: Firestore write failed (${firestoreError})`);
    console.warn(`  Auth user was created - Firestore docs may need manual creation`);
  }

  return {
    email: user.email,
    uid,
    persona: user.persona,
    password: TEST_PASSWORD,
    displayName: user.displayName,
  };
}

// -----------------------------------------------------------------------------
// Main
// -----------------------------------------------------------------------------

async function main() {
  console.log('\n===========================================');
  console.log('  LXD360 Test User Seeder - 4-Persona Model');
  console.log('  Owner > Editor > Manager > Learner');
  console.log('===========================================\n');

  // Initialize Firebase
  console.log('Initializing Firebase Admin SDK...');
  const app = initializeFirebase();
  const auth = getAuth(app);
  const db = getFirestore(app);

  console.log('\nCreating/updating test users...\n');

  const createdUsers: CreatedUser[] = [];

  for (const user of FOUR_PERSONAS) {
    console.log(`\n[${user.persona.toUpperCase()}] ${user.email}`);
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
    model: '4-persona',
    users: createdUsers,
  };

  fs.writeFileSync(credsFile, JSON.stringify(credsData, null, 2));
  console.log(`\nCredentials saved to: ${credsFile}`);

  console.log('\n===========================================');
  console.log('  Summary - 4-Persona Model');
  console.log('===========================================');
  console.log(`  Total users: ${createdUsers.length}`);
  console.log(`  Tenant ID: ${DEFAULT_TENANT_ID}`);
  console.log(`  Password: ${TEST_PASSWORD}`);
  console.log('\n  Users created:');
  for (const u of createdUsers) {
    console.log(`    - ${u.persona.padEnd(8)} | ${u.email}`);
  }

  console.log('\n===========================================');
  console.log('  DONE');
  console.log('===========================================\n');
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
