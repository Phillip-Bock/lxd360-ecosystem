/**
 * Cleanup Script: Remove old test users not in 4-persona model
 *
 * Removes: phill+teach@lxd360.com (replaced by phill+editor@lxd360.com)
 */

import { cert, getApps, initializeApp, type ServiceAccount } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import * as dotenv from 'dotenv';
import * as path from 'node:path';

// Load env
dotenv.config({ path: path.resolve(process.cwd(), 'apps/web/.env.local') });
dotenv.config({ path: path.resolve(process.cwd(), 'apps/web/.env') });

const OLD_USERS_TO_DELETE = ['phill+teach@lxd360.com'];
const TENANT_ID = 'default-dev-tenant';

function initializeFirebase() {
  if (getApps().length > 0) return getApps()[0];

  const projectId = process.env.GOOGLE_CLOUD_PROJECT || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');

  if (!projectId || !clientEmail || !privateKey) {
    throw new Error('Missing Firebase credentials');
  }

  return initializeApp({
    credential: cert({ projectId, clientEmail, privateKey } as ServiceAccount),
    projectId,
  });
}

async function main() {
  console.log('\n=== Cleanup Old Users ===\n');

  initializeFirebase();
  const auth = getAuth();
  const db = getFirestore();

  for (const email of OLD_USERS_TO_DELETE) {
    console.log(`Processing: ${email}`);
    try {
      const user = await auth.getUserByEmail(email);
      console.log(`  Found user: ${user.uid}`);

      // Delete from Auth
      await auth.deleteUser(user.uid);
      console.log(`  Deleted from Firebase Auth`);

      // Delete from Firestore
      try {
        await db.collection('users').doc(user.uid).delete();
        console.log(`  Deleted from users/`);
      } catch { /* ignore */ }

      try {
        await db.collection('tenants').doc(TENANT_ID).collection('learners').doc(user.uid).delete();
        console.log(`  Deleted from tenants/${TENANT_ID}/learners/`);
      } catch { /* ignore */ }

      try {
        await db.collection('tenants').doc(TENANT_ID).collection('members').doc(user.uid).delete();
        console.log(`  Deleted from tenants/${TENANT_ID}/members/`);
      } catch { /* ignore */ }

      console.log(`  SUCCESS: ${email} removed\n`);
    } catch (error: unknown) {
      if ((error as { code?: string }).code === 'auth/user-not-found') {
        console.log(`  Already deleted or doesn't exist\n`);
      } else {
        console.error(`  ERROR: ${(error as Error).message}\n`);
      }
    }
  }

  console.log('=== Cleanup Complete ===\n');
}

main().catch(console.error);
