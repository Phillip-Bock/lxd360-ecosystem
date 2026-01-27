/**
 * Fix Ma's Grocery Tenant Claims
 * 
 * Updates all Ma's Grocery users to have the correct tenantId in their Firebase custom claims.
 * This fixes the issue where courses show as 0 because the API falls back to wrong tenant.
 * 
 * Usage: npx tsx scripts/fix-mas-grocery-claims.ts
 */

import { cert, getApps, initializeApp, type ServiceAccount } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import * as dotenv from 'dotenv';
import * as path from 'node:path';

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });
dotenv.config({ path: path.resolve(process.cwd(), '.env') });
dotenv.config({ path: path.resolve(process.cwd(), 'apps/web/.env.local') });
dotenv.config({ path: path.resolve(process.cwd(), 'apps/web/.env') });

// Configuration
const TARGET_TENANT_ID = 'mas-grocery';
const MAS_GROCERY_DOMAIN = '@masgrocery.com';

// -----------------------------------------------------------------------------
// Firebase Initialization
// -----------------------------------------------------------------------------

function getCredentials(): ServiceAccount | undefined {
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
  });
}

// -----------------------------------------------------------------------------
// Main Fix Function
// -----------------------------------------------------------------------------

async function fixMasGroceryClaims() {
  console.log('\n===========================================');
  console.log("  Ma's Grocery Tenant Claims Fix");
  console.log('===========================================\n');

  // Initialize Firebase
  console.log('Initializing Firebase Admin SDK...');
  const app = initializeFirebase();
  const auth = getAuth(app);
  const db = getFirestore(app);

  // First, verify the tenant exists
  console.log(`\nVerifying tenant '${TARGET_TENANT_ID}' exists...`);
  const tenantDoc = await db.collection('tenants').doc(TARGET_TENANT_ID).get();
  if (!tenantDoc.exists) {
    console.error(`ERROR: Tenant '${TARGET_TENANT_ID}' does not exist in Firestore!`);
    process.exit(1);
  }
  console.log(`✅ Tenant '${TARGET_TENANT_ID}' found`);

  // Verify courses exist
  const coursesSnapshot = await db
    .collection('tenants')
    .doc(TARGET_TENANT_ID)
    .collection('courses')
    .get();
  console.log(`✅ Found ${coursesSnapshot.size} courses in tenant`);

  // Get all users
  console.log('\nFetching all users...');
  const listUsersResult = await auth.listUsers(1000);
  const allUsers = listUsersResult.users;
  console.log(`Found ${allUsers.length} total users`);

  // Filter to Ma's Grocery users
  const masGroceryUsers = allUsers.filter(
    (user) => user.email?.endsWith(MAS_GROCERY_DOMAIN)
  );
  console.log(`Found ${masGroceryUsers.length} Ma's Grocery users (${MAS_GROCERY_DOMAIN})`);

  if (masGroceryUsers.length === 0) {
    console.error('No Ma\'s Grocery users found! Check the domain filter.');
    process.exit(1);
  }

  // Update each user's custom claims
  console.log('\nUpdating custom claims...\n');
  
  let updated = 0;
  let skipped = 0;
  let errors = 0;

  for (const user of masGroceryUsers) {
    const currentClaims = user.customClaims || {};
    const currentTenantId = currentClaims.tenantId;

    // Check if already correct
    if (currentTenantId === TARGET_TENANT_ID) {
      console.log(`  ✓ ${user.email} - already has correct tenantId`);
      skipped++;
      continue;
    }

    try {
      // Preserve existing claims, update tenantId
      const newClaims = {
        ...currentClaims,
        tenantId: TARGET_TENANT_ID,
        claimsUpdatedAt: Date.now(),
      };

      await auth.setCustomUserClaims(user.uid, newClaims);
      
      // Also update Firestore user document
      const userRef = db.collection('users').doc(user.uid);
      await userRef.update({
        tenantId: TARGET_TENANT_ID,
        updatedAt: new Date(),
      });

      console.log(`  ✅ ${user.email} - updated tenantId from '${currentTenantId || 'none'}' to '${TARGET_TENANT_ID}'`);
      console.log(`     Claims: persona=${newClaims.persona}, level=${newClaims.personaLevel}`);
      updated++;
    } catch (error) {
      console.error(`  ❌ ${user.email} - ERROR: ${error}`);
      errors++;
    }
  }

  // Summary
  console.log('\n===========================================');
  console.log('  Summary');
  console.log('===========================================');
  console.log(`  Total Ma's Grocery users: ${masGroceryUsers.length}`);
  console.log(`  Updated: ${updated}`);
  console.log(`  Already correct: ${skipped}`);
  console.log(`  Errors: ${errors}`);
  console.log('\n===========================================');

  if (errors > 0) {
    console.log('\n⚠️  Some users had errors. Check output above.');
  } else {
    console.log('\n✅ All users updated successfully!');
    console.log('\nIMPORTANT: Users must log out and log back in for new claims to take effect.');
    console.log('Or use the "force refresh" feature in the app if available.');
  }

  console.log('\n===========================================');
  console.log('  DONE');
  console.log('===========================================\n');
}

// Run
fixMasGroceryClaims().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
