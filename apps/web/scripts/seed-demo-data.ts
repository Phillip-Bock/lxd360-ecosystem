/**
 * Seed Demo Data Script
 *
 * Populates Firestore with demo data for learners, courses, enrollments,
 * and achievements. Uses mock data files as the source.
 *
 * Usage: npx tsx scripts/seed-demo-data.ts
 *
 * Requires Firebase Admin credentials (see seed-users.ts for details).
 */

import { config } from 'dotenv';
import { resolve } from 'path';

// Load environment files
config({ path: resolve(__dirname, '../.env.local') });
config({ path: resolve(__dirname, '../.env') });

import { cert, getApps, initializeApp, type ServiceAccount } from 'firebase-admin/app';
import { FieldValue, getFirestore, Timestamp } from 'firebase-admin/firestore';

// =============================================================================
// CLI Output
// =============================================================================

const print = (msg: string) => process.stdout.write(`${msg}\n`);
const printErr = (msg: string) => process.stderr.write(`${msg}\n`);

// =============================================================================
// Configuration
// =============================================================================

const DEFAULT_ORG = 'default-dev-tenant';

// =============================================================================
// Firebase Admin Initialization
// =============================================================================

function initializeFirebaseAdmin() {
  if (getApps().length > 0) {
    return;
  }

  const serviceAccountKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
  if (serviceAccountKey) {
    const serviceAccount = JSON.parse(serviceAccountKey) as ServiceAccount;
    initializeApp({
      credential: cert(serviceAccount),
      projectId: serviceAccount.projectId as string,
    });
    print('Firebase Admin initialized');
    return;
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
    print('Firebase Admin initialized');
    return;
  }

  throw new Error('Firebase credentials not found');
}

// =============================================================================
// Demo Data
// =============================================================================

const DEMO_LEARNERS = [
  {
    id: 'learner-001',
    userId: 'learner-001',
    email: 'john.smith@example.com',
    displayName: 'John Smith',
    firstName: 'John',
    lastName: 'Smith',
    status: 'active',
    xp: 1250,
    level: 2,
    xpToNextLevel: 250,
    enrollmentCount: 3,
    completedCount: 1,
    averageProgress: 65,
    averageScore: 82,
  },
  {
    id: 'learner-002',
    userId: 'learner-002',
    email: 'sarah.johnson@example.com',
    displayName: 'Sarah Johnson',
    firstName: 'Sarah',
    lastName: 'Johnson',
    status: 'active',
    xp: 4500,
    level: 5,
    xpToNextLevel: 500,
    enrollmentCount: 2,
    completedCount: 2,
    averageProgress: 100,
    averageScore: 95,
  },
  {
    id: 'learner-003',
    userId: 'learner-003',
    email: 'mike.davis@example.com',
    displayName: 'Mike Davis',
    firstName: 'Mike',
    lastName: 'Davis',
    status: 'at_risk',
    xp: 350,
    level: 1,
    xpToNextLevel: 150,
    enrollmentCount: 4,
    completedCount: 1,
    averageProgress: 35,
    averageScore: 68,
  },
  {
    id: 'learner-004',
    userId: 'learner-004',
    email: 'emily.brown@example.com',
    displayName: 'Emily Brown',
    firstName: 'Emily',
    lastName: 'Brown',
    status: 'active',
    xp: 800,
    level: 1,
    xpToNextLevel: 700,
    enrollmentCount: 2,
    completedCount: 0,
    averageProgress: 50,
    averageScore: 75,
  },
  {
    id: 'learner-005',
    userId: 'learner-005',
    email: 'david.wilson@example.com',
    displayName: 'David Wilson',
    firstName: 'David',
    lastName: 'Wilson',
    status: 'inactive',
    xp: 100,
    level: 1,
    xpToNextLevel: 400,
    enrollmentCount: 1,
    completedCount: 0,
    averageProgress: 20,
    averageScore: 60,
  },
];

const DEMO_COURSES = [
  {
    id: 'course-001',
    title: 'Cybersecurity Essentials',
    description: 'Learn the fundamentals of cybersecurity and protect your organization.',
    status: 'published',
    category: 'Compliance',
    difficulty: 'beginner',
    duration: 120,
    lessonsCount: 12,
    enrollmentCount: 156,
    rating: 4.8,
    isRequired: true,
    thumbnail: '/images/courses/cybersecurity.jpg',
  },
  {
    id: 'course-002',
    title: 'Leadership Development',
    description: 'Develop essential leadership skills for managing high-performing teams.',
    status: 'published',
    category: 'Leadership',
    difficulty: 'intermediate',
    duration: 180,
    lessonsCount: 18,
    enrollmentCount: 89,
    rating: 4.6,
    isRequired: false,
    thumbnail: '/images/courses/leadership.jpg',
  },
  {
    id: 'course-003',
    title: 'HIPAA Compliance Training',
    description: 'Mandatory training on HIPAA regulations and patient privacy.',
    status: 'published',
    category: 'Compliance',
    difficulty: 'beginner',
    duration: 60,
    lessonsCount: 6,
    enrollmentCount: 234,
    rating: 4.2,
    isRequired: true,
    thumbnail: '/images/courses/hipaa.jpg',
  },
  {
    id: 'course-004',
    title: 'Project Management Fundamentals',
    description: 'Master the basics of project management using modern methodologies.',
    status: 'published',
    category: 'Professional Skills',
    difficulty: 'intermediate',
    duration: 240,
    lessonsCount: 24,
    enrollmentCount: 67,
    rating: 4.7,
    isRequired: false,
    thumbnail: '/images/courses/pm.jpg',
  },
];

const DEMO_BADGES = [
  {
    id: 'badge-001',
    name: 'First Course Complete',
    description: 'Complete your first course',
    category: 'milestone',
    type: 'milestone',
    tier: 'bronze',
    xpReward: 100,
    isActive: true,
    isStackable: false,
    icon: 'Trophy',
    color: '#CD7F32',
  },
  {
    id: 'badge-002',
    name: 'Perfect Score',
    description: 'Score 100% on any quiz',
    category: 'achievement',
    type: 'skill',
    tier: 'gold',
    xpReward: 250,
    isActive: true,
    isStackable: true,
    icon: 'Star',
    color: '#FFD700',
  },
  {
    id: 'badge-003',
    name: 'Week Warrior',
    description: 'Complete learning activities 7 days in a row',
    category: 'streak',
    type: 'engagement',
    tier: 'silver',
    xpReward: 150,
    isActive: true,
    isStackable: true,
    icon: 'Flame',
    color: '#C0C0C0',
  },
  {
    id: 'badge-004',
    name: 'Compliance Champion',
    description: 'Complete all required compliance courses',
    category: 'compliance',
    type: 'milestone',
    tier: 'platinum',
    xpReward: 500,
    isActive: true,
    isStackable: false,
    icon: 'Shield',
    color: '#E5E4E2',
  },
];

// =============================================================================
// Seeding Functions
// =============================================================================

async function seedLearners(orgId: string): Promise<void> {
  const db = getFirestore();
  const batch = db.batch();
  const now = FieldValue.serverTimestamp();
  const oneWeekAgo = Timestamp.fromDate(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000));

  for (const learner of DEMO_LEARNERS) {
    const ref = db.doc(`organizations/${orgId}/learners/${learner.id}`);
    batch.set(ref, {
      ...learner,
      createdAt: now,
      updatedAt: now,
      lastActiveAt: learner.status === 'inactive' ? oneWeekAgo : now,
    });
  }

  await batch.commit();
  print(`  Seeded ${DEMO_LEARNERS.length} learners`);
}

async function seedCourses(orgId: string): Promise<void> {
  const db = getFirestore();
  const batch = db.batch();
  const now = FieldValue.serverTimestamp();

  for (const course of DEMO_COURSES) {
    const ref = db.doc(`organizations/${orgId}/courses/${course.id}`);
    batch.set(ref, {
      ...course,
      organizationId: orgId,
      createdAt: now,
      updatedAt: now,
      publishedAt: now,
    });
  }

  await batch.commit();
  print(`  Seeded ${DEMO_COURSES.length} courses`);
}

async function seedBadges(orgId: string): Promise<void> {
  const db = getFirestore();
  const batch = db.batch();
  const now = FieldValue.serverTimestamp();

  for (const badge of DEMO_BADGES) {
    const ref = db.doc(`organizations/${orgId}/badges/${badge.id}`);
    batch.set(ref, {
      ...badge,
      createdAt: now,
      updatedAt: now,
    });
  }

  await batch.commit();
  print(`  Seeded ${DEMO_BADGES.length} badges`);
}

async function seedEnrollments(orgId: string): Promise<void> {
  const db = getFirestore();
  const batch = db.batch();
  const now = FieldValue.serverTimestamp();
  const enrollments = [
    { learnerId: 'learner-001', courseId: 'course-001', status: 'completed', progress: 100 },
    { learnerId: 'learner-001', courseId: 'course-002', status: 'in-progress', progress: 65 },
    { learnerId: 'learner-001', courseId: 'course-003', status: 'enrolled', progress: 0 },
    { learnerId: 'learner-002', courseId: 'course-001', status: 'completed', progress: 100 },
    { learnerId: 'learner-002', courseId: 'course-003', status: 'completed', progress: 100 },
    { learnerId: 'learner-003', courseId: 'course-001', status: 'in-progress', progress: 45 },
    { learnerId: 'learner-003', courseId: 'course-002', status: 'in-progress', progress: 30 },
    { learnerId: 'learner-003', courseId: 'course-003', status: 'enrolled', progress: 0 },
    { learnerId: 'learner-003', courseId: 'course-004', status: 'completed', progress: 100 },
    { learnerId: 'learner-004', courseId: 'course-002', status: 'in-progress', progress: 50 },
    { learnerId: 'learner-004', courseId: 'course-004', status: 'in-progress', progress: 50 },
    { learnerId: 'learner-005', courseId: 'course-001', status: 'in-progress', progress: 20 },
  ];

  let i = 0;
  for (const enrollment of enrollments) {
    i++;
    const ref = db.doc(`organizations/${orgId}/enrollments/enroll-${String(i).padStart(3, '0')}`);
    batch.set(ref, {
      id: `enroll-${String(i).padStart(3, '0')}`,
      ...enrollment,
      source: 'self',
      timeSpent: Math.floor(Math.random() * 3600),
      enrolledAt: now,
      lastAccessedAt: now,
      ...(enrollment.status === 'completed' ? { completedAt: now } : {}),
      ...(enrollment.status === 'in-progress' ? { startedAt: now } : {}),
    });
  }

  await batch.commit();
  print(`  Seeded ${enrollments.length} enrollments`);
}

async function seedEarnedBadges(orgId: string): Promise<void> {
  const db = getFirestore();
  const batch = db.batch();
  const now = FieldValue.serverTimestamp();

  const earnedBadges = [
    { learnerId: 'learner-001', badgeId: 'badge-001' },
    { learnerId: 'learner-002', badgeId: 'badge-001' },
    { learnerId: 'learner-002', badgeId: 'badge-002' },
    { learnerId: 'learner-002', badgeId: 'badge-004' },
    { learnerId: 'learner-003', badgeId: 'badge-001' },
  ];

  let i = 0;
  for (const earned of earnedBadges) {
    i++;
    const ref = db.doc(`organizations/${orgId}/earned_badges/earned-${String(i).padStart(3, '0')}`);
    batch.set(ref, {
      id: `earned-${String(i).padStart(3, '0')}`,
      ...earned,
      earnedAt: now,
      source: { type: 'course', id: 'course-001' },
      stackCount: 1,
      isDisplayed: true,
    });
  }

  await batch.commit();
  print(`  Seeded ${earnedBadges.length} earned badges`);
}

async function ensureOrganizationExists(orgId: string): Promise<void> {
  const db = getFirestore();
  const orgRef = db.doc(`organizations/${orgId}`);
  const orgDoc = await orgRef.get();

  if (!orgDoc.exists) {
    await orgRef.set({
      id: orgId,
      name: 'LXD360 Development',
      slug: 'lxd360-dev',
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
      settings: {
        features: {
          gamification: true,
          badges: true,
          certificates: true,
        },
      },
    });
    print(`Created organization: ${orgId}`);
  } else {
    print(`Organization exists: ${orgId}`);
  }
}

// =============================================================================
// Main
// =============================================================================

async function main(): Promise<void> {
  print('='.repeat(60));
  print('LXD360 Demo Data Seeding Script');
  print('='.repeat(60));
  print('');

  try {
    initializeFirebaseAdmin();
    print('');

    // Ensure organization exists
    print('Ensuring organization exists...');
    await ensureOrganizationExists(DEFAULT_ORG);
    print('');

    // Seed data
    print('Seeding demo data...');
    await seedLearners(DEFAULT_ORG);
    await seedCourses(DEFAULT_ORG);
    await seedBadges(DEFAULT_ORG);
    await seedEnrollments(DEFAULT_ORG);
    await seedEarnedBadges(DEFAULT_ORG);

    print('');
    print('='.repeat(60));
    print('Demo data seeding complete!');
    print('');
    print('Data seeded:');
    print(`  - ${DEMO_LEARNERS.length} learners`);
    print(`  - ${DEMO_COURSES.length} courses`);
    print(`  - ${DEMO_BADGES.length} badges`);
    print('  - Enrollments and earned badges');
    print('='.repeat(60));
  } catch (error) {
    printErr(`Seeding failed: ${error}`);
    process.exit(1);
  }
}

main();
