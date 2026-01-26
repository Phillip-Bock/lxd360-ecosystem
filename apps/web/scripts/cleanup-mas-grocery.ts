/**
 * Ma's Grocery LLC Demo Tenant Cleanup Script
 *
 * Deletes all Ma's Grocery data for re-seeding:
 * - Firebase Auth users (except cross-tenant admin)
 * - Firestore user profiles
 * - Tenant member documents
 * - Department documents
 * - Optionally: the tenant document itself
 *
 * Usage: npx tsx scripts/cleanup-mas-grocery.ts [--include-tenant]
 *
 * Options:
 *   --include-tenant    Also delete the tenant document (default: keep tenant)
 *   --force             Skip confirmation prompt
 *   --keep-phill        Keep Phill's account linked (default: true)
 *
 * Requires FIREBASE_SERVICE_ACCOUNT_KEY environment variable.
 *
 * @module scripts/cleanup-mas-grocery
 */

import { config } from 'dotenv';
import * as readline from 'readline';
import { resolve } from 'path';

// Load .env.local explicitly
config({ path: resolve(__dirname, '../.env.local') });
config({ path: resolve(__dirname, '../.env') });

import { cert, getApps, initializeApp, type ServiceAccount } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';

import { ALL_USERS, CROSS_TENANT_ADMIN, TENANT_ID, TENANT_NAME } from './mas-grocery-data';

// =============================================================================
// CLI Output & Input
// =============================================================================

const print = (msg: string) => process.stdout.write(`${msg}\n`);
const printErr = (msg: string) => process.stderr.write(`${msg}\n`);

function prompt(question: string): Promise<string> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer);
    });
  });
}

// =============================================================================
// CLI Arguments
// =============================================================================

interface CliOptions {
  includeTenant: boolean;
  force: boolean;
  keepPhill: boolean;
}

function parseArgs(): CliOptions {
  const args = process.argv.slice(2);
  return {
    includeTenant: args.includes('--include-tenant'),
    force: args.includes('--force'),
    keepPhill: !args.includes('--no-keep-phill'), // Default: keep Phill
  };
}

// =============================================================================
// Firebase Admin Initialization
// =============================================================================

function initializeFirebaseAdmin(): void {
  if (getApps().length > 0) {
    return;
  }

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
// Cleanup Functions
// =============================================================================

/**
 * Delete Firebase Auth users
 */
async function deleteAuthUsers(keepPhill: boolean): Promise<number> {
  const auth = getAuth();
  let deletedCount = 0;
  let skippedCount = 0;

  const usersToDelete = keepPhill
    ? ALL_USERS.filter((u) => u.email !== CROSS_TENANT_ADMIN.email)
    : ALL_USERS;

  for (const user of usersToDelete) {
    try {
      const existingUser = await auth.getUserByEmail(user.email);
      await auth.deleteUser(existingUser.uid);
      deletedCount++;
      print(`  Deleted Auth: ${user.email}`);
    } catch {
      skippedCount++;
      // User doesn't exist, skip
    }
  }

  if (keepPhill) {
    print(`  Kept: ${CROSS_TENANT_ADMIN.email} (cross-tenant admin)`);
  }

  return deletedCount;
}

/**
 * Delete Firestore user documents
 */
async function deleteUserDocuments(keepPhill: boolean): Promise<number> {
  const db = getFirestore();
  const auth = getAuth();
  let deletedCount = 0;

  const usersToDelete = keepPhill
    ? ALL_USERS.filter((u) => u.email !== CROSS_TENANT_ADMIN.email)
    : ALL_USERS;

  for (const user of usersToDelete) {
    try {
      // Find user by email to get UID
      const existingUser = await auth.getUserByEmail(user.email);
      const uid = existingUser.uid;

      // Delete from users collection
      const userRef = db.collection('users').doc(uid);
      const userDoc = await userRef.get();
      if (userDoc.exists) {
        await userRef.delete();
        deletedCount++;
        print(`  Deleted user doc: ${user.email}`);
      }
    } catch {
      // User not found in Auth, try to find doc by email query
      const usersQuery = await db.collection('users').where('email', '==', user.email).get();
      for (const doc of usersQuery.docs) {
        await doc.ref.delete();
        deletedCount++;
        print(`  Deleted user doc (by email): ${user.email}`);
      }
    }
  }

  return deletedCount;
}

/**
 * Delete tenant member documents
 */
async function deleteMemberDocuments(keepPhill: boolean): Promise<number> {
  const db = getFirestore();
  const membersRef = db.collection('tenants').doc(TENANT_ID).collection('members');
  const snapshot = await membersRef.get();

  let deletedCount = 0;
  const batch = db.batch();

  for (const doc of snapshot.docs) {
    const data = doc.data();

    // Skip Phill's account if keepPhill is true
    if (keepPhill && data.email === CROSS_TENANT_ADMIN.email) {
      print(`  Kept member: ${data.email} (cross-tenant admin)`);
      continue;
    }

    batch.delete(doc.ref);
    deletedCount++;
  }

  if (deletedCount > 0) {
    await batch.commit();
  }

  return deletedCount;
}

/**
 * Delete department documents
 */
async function deleteDepartments(): Promise<number> {
  const db = getFirestore();
  const deptRef = db.collection('tenants').doc(TENANT_ID).collection('departments');
  const snapshot = await deptRef.get();

  if (snapshot.empty) {
    return 0;
  }

  const batch = db.batch();
  for (const doc of snapshot.docs) {
    batch.delete(doc.ref);
  }
  await batch.commit();

  return snapshot.size;
}

/**
 * Delete the tenant document
 */
async function deleteTenant(): Promise<boolean> {
  const db = getFirestore();
  const tenantRef = db.collection('tenants').doc(TENANT_ID);
  const tenantDoc = await tenantRef.get();

  if (tenantDoc.exists) {
    await tenantRef.delete();
    return true;
  }

  return false;
}

// =============================================================================
// Main
// =============================================================================

async function main(): Promise<void> {
  const options = parseArgs();

  print('='.repeat(60));
  print("Ma's Grocery LLC Demo Tenant Cleanup Script");
  print('='.repeat(60));
  print('');
  print(`Tenant: ${TENANT_NAME} (${TENANT_ID})`);
  print('');
  print('Options:');
  print(`  --include-tenant: ${options.includeTenant}`);
  print(`  --keep-phill:     ${options.keepPhill}`);
  print(`  --force:          ${options.force}`);
  print('');

  // Confirmation prompt
  if (!options.force) {
    print('This will DELETE:');
    print(`  - ${ALL_USERS.length - (options.keepPhill ? 1 : 0)} Firebase Auth users`);
    print(`  - All user documents in Firestore`);
    print(`  - All member documents in tenant`);
    print(`  - All department documents`);
    if (options.includeTenant) {
      print(`  - The tenant document itself`);
    }
    print('');

    const answer = await prompt('Are you sure you want to continue? (yes/no): ');
    if (answer.toLowerCase() !== 'yes') {
      print('Cleanup cancelled.');
      process.exit(0);
    }
    print('');
  }

  try {
    initializeFirebaseAdmin();
    print('');

    // Step 1: Delete Auth users
    print('Step 1: Deleting Firebase Auth users...');
    const authDeleted = await deleteAuthUsers(options.keepPhill);
    print(`  Total deleted: ${authDeleted}`);
    print('');

    // Step 2: Delete user documents
    print('Step 2: Deleting Firestore user documents...');
    const userDocsDeleted = await deleteUserDocuments(options.keepPhill);
    print(`  Total deleted: ${userDocsDeleted}`);
    print('');

    // Step 3: Delete member documents
    print('Step 3: Deleting tenant member documents...');
    const membersDeleted = await deleteMemberDocuments(options.keepPhill);
    print(`  Total deleted: ${membersDeleted}`);
    print('');

    // Step 4: Delete departments
    print('Step 4: Deleting department documents...');
    const deptsDeleted = await deleteDepartments();
    print(`  Total deleted: ${deptsDeleted}`);
    print('');

    // Step 5: Optionally delete tenant
    if (options.includeTenant) {
      print('Step 5: Deleting tenant document...');
      const tenantDeleted = await deleteTenant();
      print(`  Tenant deleted: ${tenantDeleted}`);
      print('');
    }

    print('='.repeat(60));
    print('Cleanup Complete!');
    print('='.repeat(60));
    print('');
    print('Summary:');
    print(`  Auth users deleted:   ${authDeleted}`);
    print(`  User docs deleted:    ${userDocsDeleted}`);
    print(`  Members deleted:      ${membersDeleted}`);
    print(`  Departments deleted:  ${deptsDeleted}`);
    if (options.keepPhill) {
      print('');
      print(`  Preserved: ${CROSS_TENANT_ADMIN.email}`);
    }
    print('='.repeat(60));
  } catch (error) {
    printErr(`\nCleanup failed: ${error}`);
    process.exit(1);
  }
}

main();
