/**
 * Update Ma's Grocery Course Titles
 * 
 * The courses were imported with generic IDs. This script updates them
 * with proper grocery store training course titles.
 * 
 * Usage: npx tsx scripts/update-mas-grocery-titles.ts
 */

import { cert, getApps, initializeApp, type ServiceAccount } from 'firebase-admin/app';
import { FieldValue, getFirestore } from 'firebase-admin/firestore';
import * as dotenv from 'dotenv';
import * as path from 'node:path';

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });
dotenv.config({ path: path.resolve(process.cwd(), '.env') });
dotenv.config({ path: path.resolve(process.cwd(), 'apps/web/.env.local') });
dotenv.config({ path: path.resolve(process.cwd(), 'apps/web/.env') });

const TENANT_ID = 'mas-grocery';

// Proper course titles for a grocery store
const COURSE_UPDATES = [
  {
    title: 'Food Safety Fundamentals',
    description: 'Essential food safety practices including proper handling, storage, and sanitation. Required for all employees.',
    category: 'Food Safety',
    duration: 90,
    difficulty: 'beginner',
  },
  {
    title: 'New Employee Orientation',
    description: "Welcome to Ma's Grocery! Learn about our company culture, policies, benefits, and getting started on your first day.",
    category: 'Onboarding',
    duration: 60,
    difficulty: 'beginner',
  },
  {
    title: 'Customer Service Excellence',
    description: 'Building positive customer relationships, handling complaints professionally, and creating memorable shopping experiences.',
    category: 'Customer Service',
    duration: 45,
    difficulty: 'beginner',
  },
  {
    title: 'Point of Sale (POS) Training',
    description: 'Operating the register, processing payments, handling returns, and managing transactions efficiently.',
    category: 'Operations',
    duration: 45,
    difficulty: 'beginner',
  },
  {
    title: 'Workplace Safety & OSHA Basics',
    description: 'Fundamental workplace safety requirements, hazard identification, and OSHA compliance essentials.',
    category: 'Safety & Compliance',
    duration: 60,
    difficulty: 'beginner',
  },
  {
    title: 'Produce Department Training',
    description: 'Proper handling, display techniques, quality standards, and rotation practices for fresh produce.',
    category: 'Department Training',
    duration: 60,
    difficulty: 'intermediate',
  },
  {
    title: 'Cold Chain Management',
    description: 'Maintaining proper temperatures throughout the supply chain for dairy, meat, and frozen products.',
    category: 'Food Safety',
    duration: 60,
    difficulty: 'intermediate',
  },
  {
    title: 'Loss Prevention & Security',
    description: 'Identifying and preventing theft, fraud, inventory shrinkage, and security best practices.',
    category: 'Operations',
    duration: 60,
    difficulty: 'intermediate',
  },
  {
    title: 'Inventory Management Basics',
    description: 'Effective inventory control, stock rotation (FIFO), receiving procedures, and loss prevention strategies.',
    category: 'Operations',
    duration: 60,
    difficulty: 'intermediate',
  },
  {
    title: 'Hazard Communication (HazCom)',
    description: 'Understanding chemical hazards, reading safety data sheets (SDS), and proper labeling requirements.',
    category: 'Safety & Compliance',
    duration: 45,
    difficulty: 'beginner',
  },
  {
    title: 'Sexual Harassment Prevention',
    description: 'Recognizing, preventing, and reporting workplace harassment. Required annual training.',
    category: 'HR & Compliance',
    duration: 45,
    difficulty: 'beginner',
  },
  {
    title: 'Diversity & Inclusion',
    description: 'Creating an inclusive work environment that values diversity and promotes equity for all team members.',
    category: 'HR & Culture',
    duration: 60,
    difficulty: 'beginner',
  },
  {
    title: 'Emergency Procedures',
    description: 'Fire safety, evacuation procedures, severe weather protocols, and emergency response training.',
    category: 'Safety & Compliance',
    duration: 45,
    difficulty: 'beginner',
  },
  {
    title: 'Bloodborne Pathogens',
    description: 'OSHA-compliant training on bloodborne pathogen exposure prevention and response procedures.',
    category: 'Safety & Compliance',
    duration: 30,
    difficulty: 'beginner',
  },
  {
    title: 'Leadership Fundamentals',
    description: 'Core leadership skills for supervisors and team leads: communication, delegation, and performance management.',
    category: 'Leadership',
    duration: 90,
    difficulty: 'advanced',
  },
  {
    title: 'Workplace Ergonomics',
    description: 'Preventing injuries through proper lifting techniques, standing posture, and workstation setup.',
    category: 'Safety & Compliance',
    duration: 30,
    difficulty: 'beginner',
  },
  {
    title: 'Deli & Prepared Foods Safety',
    description: 'Food safety protocols specific to deli operations, including slicing, temperature control, and cross-contamination prevention.',
    category: 'Department Training',
    duration: 60,
    difficulty: 'intermediate',
  },
];

// -----------------------------------------------------------------------------
// Firebase Initialization
// -----------------------------------------------------------------------------

function getCredentials(): ServiceAccount | undefined {
  const googleCredentials = process.env.GOOGLE_CREDENTIALS;
  if (googleCredentials) {
    try {
      const decoded = Buffer.from(googleCredentials, 'base64').toString('utf-8');
      const parsed = JSON.parse(decoded);
      if (parsed.project_id) return parsed as ServiceAccount;
    } catch {
      try {
        const parsed = JSON.parse(googleCredentials);
        if (parsed.project_id) return parsed as ServiceAccount;
      } catch { /* ignore */ }
    }
  }

  const projectId = process.env.GOOGLE_CLOUD_PROJECT || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');

  if (projectId && clientEmail && privateKey) {
    return { projectId, clientEmail, privateKey } as ServiceAccount;
  }
  return undefined;
}

function initializeFirebase() {
  if (getApps().length > 0) return getApps()[0];
  const credentials = getCredentials();
  if (!credentials) throw new Error('Firebase credentials not found');
  return initializeApp({
    credential: cert(credentials),
    projectId: credentials.projectId as string,
  });
}

// -----------------------------------------------------------------------------
// Main
// -----------------------------------------------------------------------------

async function updateCourseTitles() {
  console.log('\n===========================================');
  console.log("  Update Ma's Grocery Course Titles");
  console.log('===========================================\n');

  const app = initializeFirebase();
  const db = getFirestore(app);

  // Get all courses
  const snapshot = await db
    .collection('tenants')
    .doc(TENANT_ID)
    .collection('courses')
    .get();

  console.log(`Found ${snapshot.size} courses to update\n`);

  const docs = snapshot.docs;
  
  for (let i = 0; i < docs.length && i < COURSE_UPDATES.length; i++) {
    const doc = docs[i];
    const update = COURSE_UPDATES[i];
    
    const oldTitle = doc.data().title;
    
    await doc.ref.update({
      title: update.title,
      description: update.description,
      category: update.category,
      duration: update.duration,
      difficulty: update.difficulty,
      tags: [update.category.toLowerCase().replace(/[^a-z0-9]+/g, '-'), 'mas-grocery'],
      updatedAt: FieldValue.serverTimestamp(),
    });
    
    console.log(`  ✅ ${oldTitle} → ${update.title}`);
  }

  console.log('\n===========================================');
  console.log('  ✅ Course titles updated!');
  console.log('===========================================\n');
}

updateCourseTitles().catch(console.error);
