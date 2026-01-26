/**
 * Ma's Grocery LLC Demo Tenant Seeding Script
 *
 * Creates the complete Ma's Grocery demo tenant with:
 * - Tenant document in Firestore
 * - Firebase Auth users (27 with demo password, 1 real account link)
 * - Firestore user profiles
 * - Department structure
 * - Manager relationships
 * - DiceBear avatars for all users
 *
 * Usage: npx tsx scripts/seed-mas-grocery.ts
 *
 * Requires FIREBASE_SERVICE_ACCOUNT_KEY environment variable.
 *
 * @module scripts/seed-mas-grocery
 */

import { randomBytes } from 'crypto';
import { config } from 'dotenv';
import { resolve } from 'path';

// Load .env.local explicitly (dotenv/config only loads .env)
config({ path: resolve(__dirname, '../.env.local') });
config({ path: resolve(__dirname, '../.env') });

import { cert, getApps, initializeApp, type ServiceAccount } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { FieldValue, getFirestore } from 'firebase-admin/firestore';

import {
  ALL_USERS,
  DEPARTMENTS,
  DEFAULT_PASSWORD,
  getAvatarUrl,
  type MasGroceryUser,
  TENANT_ID,
  TENANT_LOCATION,
  TENANT_NAME,
  TENANT_SLUG,
  USER_COUNTS,
} from './mas-grocery-data';

// =============================================================================
// CLI Output
// =============================================================================

const print = (msg: string) => process.stdout.write(`${msg}\n`);
const printErr = (msg: string) => process.stderr.write(`${msg}\n`);

// =============================================================================
// Firebase Admin Initialization
// =============================================================================

function initializeFirebaseAdmin(): void {
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

  // Option 2: Individual env vars
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY;
  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || process.env.GOOGLE_PROJECT_ID;

  if (clientEmail && privateKey && projectId) {
    initializeApp({
      credential: cert({
        projectId,
        clientEmail,
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
// Tenant Creation
// =============================================================================

async function createTenant(): Promise<void> {
  const db = getFirestore();
  const tenantRef = db.collection('tenants').doc(TENANT_ID);
  const existingTenant = await tenantRef.get();

  if (existingTenant.exists) {
    print(`Tenant "${TENANT_ID}" already exists - updating...`);
  }

  await tenantRef.set(
    {
      id: TENANT_ID,
      name: TENANT_NAME,
      slug: TENANT_SLUG,
      subscriptionTier: 'professional',
      branding: {
        primaryColor: '#2E7D32', // Green - grocery store theme
        logoUrl: null,
        faviconUrl: null,
      },
      features: {
        adaptiveLearning: true,
        spacedRepetition: true,
        cognitiveLoadMonitoring: true,
        glassBoxExplanations: true,
        jitaiInterventions: false,
        federatedLearning: false,
      },
      compliance: {
        dataResidency: 'us',
        hipaaCompliant: false,
        gdprCompliant: false,
        fedRampCompliant: false,
        dataRetentionDays: 2557,
      },
      maxUsers: 50,
      userCount: ALL_USERS.length,
      isActive: true,
      location: TENANT_LOCATION,
      industry: 'Retail / Grocery',
      createdAt: existingTenant.exists
        ? existingTenant.data()?.createdAt
        : FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    },
    { merge: true },
  );

  print(`Tenant "${TENANT_NAME}" created/updated`);
}

// =============================================================================
// Department Structure
// =============================================================================

async function createDepartments(): Promise<void> {
  const db = getFirestore();
  const batch = db.batch();

  for (const [id, dept] of Object.entries(DEPARTMENTS)) {
    const ref = db.collection('tenants').doc(TENANT_ID).collection('departments').doc(id);
    batch.set(
      ref,
      {
        ...dept,
        tenantId: TENANT_ID,
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
      },
      { merge: true },
    );
  }

  await batch.commit();
  print(`Created ${Object.keys(DEPARTMENTS).length} departments`);
}

// =============================================================================
// User Creation
// =============================================================================

/**
 * Generate a secure random password for real accounts
 */
function generateSecurePassword(): string {
  return randomBytes(16).toString('base64').slice(0, 20) + '!Aa1';
}

/**
 * Create or update a single user in Firebase Auth and Firestore
 */
async function createOrUpdateUser(user: MasGroceryUser): Promise<string> {
  const auth = getAuth();
  const db = getFirestore();

  let uid: string;
  let isNewUser = false;
  const password = user.isRealAccount ? generateSecurePassword() : DEFAULT_PASSWORD;

  try {
    // Try to get existing user
    const existingUser = await auth.getUserByEmail(user.email);
    uid = existingUser.uid;
    print(`  Found existing: ${user.email}`);
  } catch {
    // Create new user
    const createParams: {
      email: string;
      displayName: string;
      emailVerified: boolean;
      photoURL: string;
      password?: string;
    } = {
      email: user.email,
      displayName: user.displayName,
      emailVerified: true,
      photoURL: getAvatarUrl(user.email),
    };

    // Only set password for non-real accounts or if creating new real account
    if (!user.isRealAccount) {
      createParams.password = password;
    } else {
      // For real accounts, set a secure random password (user will need to reset)
      createParams.password = password;
      print(`  NOTE: Real account ${user.email} - password set to secure random value`);
    }

    const newUser = await auth.createUser(createParams);
    uid = newUser.uid;
    isNewUser = true;
    print(`  Created new: ${user.email}`);
  }

  // Set custom claims (persona + tenantId)
  await auth.setCustomUserClaims(uid, {
    persona: user.persona,
    tenantId: TENANT_ID,
  });

  // Update display name and photo if changed
  await auth.updateUser(uid, {
    displayName: user.displayName,
    photoURL: getAvatarUrl(user.email),
  });

  // Create/update user document in Firestore (users collection)
  const userRef = db.collection('users').doc(uid);
  await userRef.set(
    {
      uid,
      email: user.email,
      displayName: user.displayName,
      firstName: user.firstName,
      lastName: user.lastName,
      photoURL: getAvatarUrl(user.email),
      persona: user.persona,
      tenantId: TENANT_ID,
      emailVerified: true,
      isActive: true,
      updatedAt: FieldValue.serverTimestamp(),
      ...(isNewUser && { createdAt: FieldValue.serverTimestamp() }),
    },
    { merge: true },
  );

  // Create/update tenant member document
  const memberRef = db
    .collection('tenants')
    .doc(TENANT_ID)
    .collection('members')
    .doc(uid);

  await memberRef.set(
    {
      uid,
      email: user.email,
      displayName: user.displayName,
      firstName: user.firstName,
      lastName: user.lastName,
      photoURL: getAvatarUrl(user.email),
      persona: user.persona,
      department: user.department,
      jobTitle: user.jobTitle,
      onetCode: user.onetCode,
      age: user.age,
      gender: user.gender,
      hireDate: user.hireDate,
      managerId: user.managerId ?? null,
      isRealAccount: user.isRealAccount ?? false,
      notifications: user.notifications ?? {
        email: true,
        push: false,
        sms: false,
      },
      isActive: true,
      updatedAt: FieldValue.serverTimestamp(),
      ...(isNewUser && { createdAt: FieldValue.serverTimestamp() }),
    },
    { merge: true },
  );

  return uid;
}

// =============================================================================
// Manager Relationships
// =============================================================================

async function updateManagerRelationships(): Promise<void> {
  const db = getFirestore();
  const membersRef = db.collection('tenants').doc(TENANT_ID).collection('members');

  // Build email -> uid mapping
  const emailToUid = new Map<string, string>();
  const membersSnapshot = await membersRef.get();

  for (const doc of membersSnapshot.docs) {
    const data = doc.data();
    if (data.email) {
      emailToUid.set(data.email, doc.id);
    }
  }

  // Update manager UIDs
  const batch = db.batch();
  let updateCount = 0;

  for (const user of ALL_USERS) {
    if (user.managerId) {
      const userUid = emailToUid.get(user.email);
      const managerUid = emailToUid.get(user.managerId);

      if (userUid && managerUid) {
        const memberRef = membersRef.doc(userUid);
        batch.update(memberRef, {
          managerUid,
          updatedAt: FieldValue.serverTimestamp(),
        });
        updateCount++;
      }
    }
  }

  await batch.commit();
  print(`Updated ${updateCount} manager relationships`);
}

// =============================================================================
// Summary
// =============================================================================

function printSummary(): void {
  print('');
  print('='.repeat(60));
  print("Ma's Grocery LLC Demo Tenant - Seeding Complete!");
  print('='.repeat(60));
  print('');
  print(`Tenant ID: ${TENANT_ID}`);
  print(`Location:  ${TENANT_LOCATION}`);
  print('');
  print('User Counts:');
  print('-'.repeat(40));
  print(`  Owners:   ${USER_COUNTS.owners}`);
  print(`  Editors:  ${USER_COUNTS.editors}`);
  print(`  Managers: ${USER_COUNTS.managers}`);
  print(`  Learners: ${USER_COUNTS.learners}`);
  print(`  Total:    ${USER_COUNTS.total}`);
  print('');
  print('Departments:');
  print('-'.repeat(40));
  for (const [id, dept] of Object.entries(DEPARTMENTS)) {
    print(`  ${id}: ${dept.name}`);
  }
  print('');
  print('Demo Credentials:');
  print('-'.repeat(40));
  print(`  Password: ${DEFAULT_PASSWORD}`);
  print('');
  print('Note: bockphillipj@outlook.com uses a secure random password');
  print('      (requires password reset to access)');
  print('='.repeat(60));
}

// =============================================================================
// Main
// =============================================================================

async function main(): Promise<void> {
  print('='.repeat(60));
  print("Ma's Grocery LLC Demo Tenant Seeding Script");
  print('='.repeat(60));
  print('');

  try {
    initializeFirebaseAdmin();
    print('');

    // Step 1: Create tenant
    print('Step 1: Creating tenant...');
    await createTenant();
    print('');

    // Step 2: Create departments
    print('Step 2: Creating departments...');
    await createDepartments();
    print('');

    // Step 3: Create users
    print(`Step 3: Creating ${ALL_USERS.length} users...`);
    print('-'.repeat(40));

    for (const user of ALL_USERS) {
      await createOrUpdateUser(user);
    }
    print('');

    // Step 4: Update manager relationships
    print('Step 4: Updating manager relationships...');
    await updateManagerRelationships();

    printSummary();
  } catch (error) {
    printErr(`\nSeeding failed: ${error}`);
    process.exit(1);
  }
}

main();
