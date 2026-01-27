/**
 * Sync Ma's Grocery Courses to Firestore
 * 
 * The course SCORM packages were uploaded to Cloud Storage at:
 * gs://lxd360-course-assets/courses/mas-grocery/
 * 
 * But the Firestore documents were never created in:
 * tenants/mas-grocery/courses
 * 
 * This script scans Cloud Storage and creates corresponding Firestore documents.
 * 
 * Usage: npx tsx scripts/sync-mas-grocery-courses.ts
 */

import { cert, getApps, initializeApp, type ServiceAccount } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { FieldValue, getFirestore } from 'firebase-admin/firestore';
import { getStorage } from 'firebase-admin/storage';
import * as dotenv from 'dotenv';
import * as path from 'node:path';

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });
dotenv.config({ path: path.resolve(process.cwd(), '.env') });
dotenv.config({ path: path.resolve(process.cwd(), 'apps/web/.env.local') });
dotenv.config({ path: path.resolve(process.cwd(), 'apps/web/.env') });

// Configuration
const TENANT_ID = 'mas-grocery';
const BUCKET_NAME = 'lxd360-course-assets';
const COURSES_PREFIX = 'courses/mas-grocery/';

// Course metadata (from the import session)
const COURSE_METADATA: Record<string, { title: string; description: string; category: string; duration: number }> = {
  'bloodborne-pathogens': {
    title: 'Bloodborne Pathogens Safety',
    description: 'OSHA-compliant training on bloodborne pathogen exposure prevention and response procedures.',
    category: 'Safety & Compliance',
    duration: 45,
  },
  'cold-chain-management': {
    title: 'Cold Chain Management',
    description: 'Best practices for maintaining proper temperatures throughout the cold chain.',
    category: 'Food Safety',
    duration: 60,
  },
  'customer-service-excellence': {
    title: 'Customer Service Excellence',
    description: 'Building positive customer relationships and handling difficult situations professionally.',
    category: 'Customer Service',
    duration: 45,
  },
  'diversity-inclusion': {
    title: 'Diversity & Inclusion in the Workplace',
    description: 'Creating an inclusive work environment that values diversity and promotes equity.',
    category: 'HR & Culture',
    duration: 60,
  },
  'emergency-procedures': {
    title: 'Emergency Procedures & Response',
    description: 'Comprehensive training on emergency protocols, evacuation procedures, and crisis management.',
    category: 'Safety & Compliance',
    duration: 45,
  },
  'food-safety-fundamentals': {
    title: 'Food Safety Fundamentals',
    description: 'Essential food safety practices including proper handling, storage, and sanitation.',
    category: 'Food Safety',
    duration: 90,
  },
  'hazard-communication': {
    title: 'Hazard Communication (HazCom)',
    description: 'Understanding chemical hazards, safety data sheets, and proper labeling requirements.',
    category: 'Safety & Compliance',
    duration: 45,
  },
  'inventory-management': {
    title: 'Inventory Management Basics',
    description: 'Effective inventory control, stock rotation, and loss prevention strategies.',
    category: 'Operations',
    duration: 60,
  },
  'leadership-fundamentals': {
    title: 'Leadership Fundamentals',
    description: 'Core leadership skills for supervisors and team leads in retail environments.',
    category: 'Leadership',
    duration: 90,
  },
  'loss-prevention': {
    title: 'Loss Prevention & Security',
    description: 'Identifying and preventing theft, fraud, and inventory shrinkage.',
    category: 'Operations',
    duration: 60,
  },
  'new-employee-orientation': {
    title: 'New Employee Orientation',
    description: 'Welcome to Ma\'s Grocery! Company policies, culture, and getting started.',
    category: 'Onboarding',
    duration: 60,
  },
  'osha-safety-basics': {
    title: 'OSHA Safety Basics',
    description: 'Fundamental workplace safety requirements and OSHA compliance essentials.',
    category: 'Safety & Compliance',
    duration: 60,
  },
  'point-of-sale-training': {
    title: 'Point of Sale (POS) Training',
    description: 'Operating the register, processing payments, and handling transactions.',
    category: 'Operations',
    duration: 45,
  },
  'produce-handling': {
    title: 'Produce Department Training',
    description: 'Proper handling, display, and quality standards for fresh produce.',
    category: 'Department Training',
    duration: 60,
  },
  'sexual-harassment-prevention': {
    title: 'Sexual Harassment Prevention',
    description: 'Recognizing, preventing, and reporting workplace harassment.',
    category: 'HR & Compliance',
    duration: 45,
  },
  'workplace-ergonomics': {
    title: 'Workplace Ergonomics',
    description: 'Preventing injuries through proper lifting, standing, and workstation setup.',
    category: 'Safety & Compliance',
    duration: 30,
  },
};

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
    storageBucket: `${credentials.projectId}.firebasestorage.app`,
  });
}

// -----------------------------------------------------------------------------
// Main Sync Function
// -----------------------------------------------------------------------------

async function syncCoursesToFirestore() {
  console.log('\n===========================================');
  console.log("  Ma's Grocery Course Sync to Firestore");
  console.log('===========================================\n');

  // Initialize Firebase
  console.log('Initializing Firebase Admin SDK...');
  const app = initializeFirebase();
  const db = getFirestore(app);
  const storage = getStorage(app);
  const bucket = storage.bucket(BUCKET_NAME);

  // Verify tenant exists
  console.log(`\nVerifying tenant '${TENANT_ID}' exists...`);
  const tenantDoc = await db.collection('tenants').doc(TENANT_ID).get();
  if (!tenantDoc.exists) {
    console.error(`ERROR: Tenant '${TENANT_ID}' does not exist!`);
    process.exit(1);
  }
  console.log(`✅ Tenant '${TENANT_ID}' found`);

  // List existing courses in Firestore
  const existingCourses = await db
    .collection('tenants')
    .doc(TENANT_ID)
    .collection('courses')
    .get();
  console.log(`Found ${existingCourses.size} existing courses in Firestore`);

  // Get existing course slugs to avoid duplicates
  const existingSlugs = new Set<string>();
  existingCourses.docs.forEach(doc => {
    const data = doc.data();
    if (data.slug) existingSlugs.add(data.slug);
    // Also check the scormPackagePath for course folder name
    if (data.scormPackagePath) {
      const match = data.scormPackagePath.match(/courses\/mas-grocery\/([^/]+)/);
      if (match) existingSlugs.add(match[1]);
    }
  });

  // List folders in Cloud Storage
  console.log(`\nScanning Cloud Storage: gs://${BUCKET_NAME}/${COURSES_PREFIX}`);
  
  const [files] = await bucket.getFiles({ prefix: COURSES_PREFIX });
  
  // Extract unique course folder names
  const courseFolders = new Set<string>();
  files.forEach(file => {
    const relativePath = file.name.replace(COURSES_PREFIX, '');
    const folderName = relativePath.split('/')[0];
    if (folderName && folderName !== '') {
      courseFolders.add(folderName);
    }
  });

  console.log(`Found ${courseFolders.size} course folders in Cloud Storage:`);
  courseFolders.forEach(folder => console.log(`  - ${folder}`));

  // Create Firestore documents for each course
  console.log('\nCreating Firestore documents...\n');

  let created = 0;
  let skipped = 0;
  let errors = 0;

  for (const courseSlug of courseFolders) {
    // Skip if already exists
    if (existingSlugs.has(courseSlug)) {
      console.log(`  ⏭️  ${courseSlug} - already exists in Firestore`);
      skipped++;
      continue;
    }

    // Get metadata or use defaults
    const meta = COURSE_METADATA[courseSlug] || {
      title: courseSlug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
      description: 'Training course for Ma\'s Grocery employees.',
      category: 'General Training',
      duration: 45,
    };

    try {
      const courseData = {
        // Core fields
        title: meta.title,
        description: meta.description,
        slug: courseSlug,
        type: 'SCORM',
        format: 'scorm_2004',
        
        // Status
        status: 'published',
        visibility: 'tenant',
        
        // Content location
        scormPackagePath: `${COURSES_PREFIX}${courseSlug}`,
        entryPoint: `${COURSES_PREFIX}${courseSlug}/index.html`,
        
        // Metadata
        category: meta.category,
        duration: meta.duration,
        difficulty: 'beginner',
        language: 'en',
        
        // Settings
        settings: {
          passMark: 80,
          attempts: 3,
          allowResume: true,
          trackProgress: true,
          certificateEnabled: true,
        },
        
        // Tenant & audit
        tenantId: TENANT_ID,
        authorId: 'system-import',
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
        publishedAt: FieldValue.serverTimestamp(),
        
        // Thumbnail (default)
        thumbnail: null,
        
        // Tags for filtering
        tags: [meta.category.toLowerCase().replace(/[^a-z0-9]+/g, '-'), 'imported'],
      };

      const docRef = await db
        .collection('tenants')
        .doc(TENANT_ID)
        .collection('courses')
        .add(courseData);

      console.log(`  ✅ ${courseSlug} → ${docRef.id}`);
      console.log(`     Title: ${meta.title}`);
      console.log(`     Category: ${meta.category}`);
      created++;
    } catch (error) {
      console.error(`  ❌ ${courseSlug} - ERROR: ${error}`);
      errors++;
    }
  }

  // Summary
  console.log('\n===========================================');
  console.log('  Summary');
  console.log('===========================================');
  console.log(`  Course folders in Storage: ${courseFolders.size}`);
  console.log(`  Created in Firestore: ${created}`);
  console.log(`  Already existed (skipped): ${skipped}`);
  console.log(`  Errors: ${errors}`);

  // Verify final count
  const finalCount = await db
    .collection('tenants')
    .doc(TENANT_ID)
    .collection('courses')
    .get();
  console.log(`\n  Total courses in Firestore now: ${finalCount.size}`);

  console.log('\n===========================================');
  if (errors > 0) {
    console.log('  ⚠️  Completed with errors');
  } else {
    console.log('  ✅ Sync completed successfully!');
  }
  console.log('===========================================\n');
}

// Run
syncCoursesToFirestore().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
