/**
 * Import Demo Courses Script
 *
 * Reads course ZIP files from a local directory, detects their format,
 * uploads to Firebase Storage, and creates Firestore course documents.
 *
 * Usage: npx tsx scripts/import-demo-courses.ts --tenant=mas-grocery
 *
 * Options:
 *   --tenant=<tenantId>  Required. The tenant ID to import courses into.
 *   --source=<path>      Optional. Source directory (default: D:\Demo Courses\Zips\)
 *   --dry-run            Optional. Preview without uploading or creating documents.
 *
 * Requires Firebase Admin credentials via FIREBASE_SERVICE_ACCOUNT_KEY
 * or individual environment variables.
 */

import { config } from 'dotenv';
import { existsSync, readdirSync, readFileSync } from 'fs';
import { resolve } from 'path';
import JSZip from 'jszip';
import { nanoid } from 'nanoid';

// Load environment files
config({ path: resolve(__dirname, '../.env.local') });
config({ path: resolve(__dirname, '../.env') });

import { cert, getApps, initializeApp, type ServiceAccount } from 'firebase-admin/app';
import { FieldValue, getFirestore } from 'firebase-admin/firestore';
import { getStorage } from 'firebase-admin/storage';

import {
  detectFormat,
  detectFormatFromFilename,
  generateTitleFromFilename,
  parseManifest,
} from '../lib/import/format-detector';
import { uploadCoursePackage } from '../lib/import/storage-uploader';
import type { ComplianceType, ContentFormat, ImportResult } from '../lib/import/types';
import { CATEGORY_RULES, MANUAL_UPLOAD_FILES } from '../lib/import/types';

// =============================================================================
// CLI Output
// =============================================================================

const print = (msg: string): void => {
  process.stdout.write(`${msg}\n`);
};
const printErr = (msg: string): void => {
  process.stderr.write(`${msg}\n`);
};

// =============================================================================
// Configuration
// =============================================================================

const DEFAULT_SOURCE = 'D:\\Demo Courses\\Zips';

// =============================================================================
// Argument Parsing
// =============================================================================

interface ScriptArgs {
  tenantId?: string;
  sourcePath: string;
  dryRun: boolean;
}

function parseArgs(): ScriptArgs {
  const args: ScriptArgs = {
    sourcePath: DEFAULT_SOURCE,
    dryRun: false,
  };

  for (const arg of process.argv.slice(2)) {
    if (arg.startsWith('--tenant=')) {
      args.tenantId = arg.split('=')[1];
    } else if (arg.startsWith('--source=')) {
      args.sourcePath = arg.split('=')[1];
    } else if (arg === '--dry-run') {
      args.dryRun = true;
    }
  }

  return args;
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
    const serviceAccount = JSON.parse(serviceAccountKey) as ServiceAccount;
    initializeApp({
      credential: cert(serviceAccount),
      projectId: serviceAccount.projectId as string,
      storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    });
    print('Firebase Admin initialized');
    return;
  }

  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY;
  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || process.env.GOOGLE_PROJECT_ID;
  const storageBucket = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET;

  if (clientEmail && privateKey && projectId) {
    initializeApp({
      credential: cert({
        projectId,
        clientEmail,
        privateKey: privateKey.replace(/\\n/g, '\n'),
      }),
      projectId,
      storageBucket,
    });
    print('Firebase Admin initialized');
    return;
  }

  throw new Error('Firebase credentials not found');
}

// =============================================================================
// Category Detection
// =============================================================================

function detectCategory(filename: string): {
  complianceType: ComplianceType;
  isRequired: boolean;
  approvalRequired: boolean;
} {
  const lowerFilename = filename.toLowerCase();

  for (const rule of CATEGORY_RULES) {
    for (const pattern of rule.patterns) {
      if (lowerFilename.includes(pattern)) {
        return {
          complianceType: rule.category,
          isRequired: rule.isRequired,
          approvalRequired: rule.approvalRequired,
        };
      }
    }
  }

  // Default: no compliance type, not required, no approval
  return {
    complianceType: null,
    isRequired: false,
    approvalRequired: false,
  };
}

// =============================================================================
// Course Import
// =============================================================================

async function importCourse(
  filePath: string,
  filename: string,
  tenantId: string,
  dryRun: boolean,
): Promise<ImportResult> {
  const courseId = `course-${nanoid(10)}`;

  try {
    // Read file
    const fileBuffer = readFileSync(filePath);

    // Check if PDF
    const formatFromFilename = detectFormatFromFilename(filename);
    if (formatFromFilename.format === 'pdf') {
      const title = generateTitleFromFilename(filename);
      const { complianceType, isRequired, approvalRequired } = detectCategory(filename);

      if (dryRun) {
        return {
          success: true,
          filename,
          courseId,
          format: 'pdf',
          title,
        };
      }

      const storage = getStorage();
      const uploadResult = await uploadCoursePackage(
        storage,
        fileBuffer,
        filename,
        tenantId,
        courseId,
        JSZip,
      );

      await createCourseDocument({
        id: courseId,
        tenantId,
        title,
        description: '',
        format: 'pdf',
        entryPoint: filename,
        storagePath: uploadResult.storagePath,
        storageUrl: uploadResult.storageUrl,
        complianceType,
        isRequired,
        approvalRequired,
        originalFilename: filename,
      });

      return {
        success: true,
        filename,
        courseId,
        format: 'pdf',
        title,
      };
    }

    // Load ZIP and detect format
    const zip = await JSZip.loadAsync(fileBuffer);
    const detectionResult = await detectFormat(zip);

    if (detectionResult.format === 'unknown') {
      return {
        success: false,
        filename,
        error: 'Unknown format - could not detect SCORM, xAPI, cmi5, AICC, or HTML5',
      };
    }

    // Parse manifest for metadata
    const metadata = await parseManifest(
      zip,
      detectionResult.format,
      detectionResult.manifestPath,
    );

    // Use title from manifest or generate from filename
    const title = metadata.title !== 'Untitled Course'
      ? metadata.title
      : generateTitleFromFilename(filename);

    const { complianceType, isRequired, approvalRequired } = detectCategory(filename);

    if (dryRun) {
      return {
        success: true,
        filename,
        courseId,
        format: detectionResult.format,
        title,
      };
    }

    // Upload to Firebase Storage
    const storage = getStorage();
    const uploadResult = await uploadCoursePackage(
      storage,
      fileBuffer,
      filename,
      tenantId,
      courseId,
      JSZip,
    );

    // Create Firestore document
    await createCourseDocument({
      id: courseId,
      tenantId,
      title,
      description: metadata.description || '',
      format: detectionResult.format,
      entryPoint: metadata.entryPoint,
      storagePath: uploadResult.storagePath,
      storageUrl: uploadResult.storageUrl,
      complianceType,
      isRequired,
      approvalRequired,
      originalFilename: filename,
      version: metadata.version,
      duration: metadata.duration,
      language: metadata.language,
      activityId: metadata.activityId,
    });

    return {
      success: true,
      filename,
      courseId,
      format: detectionResult.format,
      title,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return {
      success: false,
      filename,
      error: errorMessage,
    };
  }
}

// =============================================================================
// Firestore Document Creation
// =============================================================================

interface CreateCourseParams {
  id: string;
  tenantId: string;
  title: string;
  description: string;
  format: ContentFormat;
  entryPoint: string;
  storagePath: string;
  storageUrl: string;
  complianceType: ComplianceType;
  isRequired: boolean;
  approvalRequired: boolean;
  originalFilename?: string;
  version?: string;
  duration?: number;
  language?: string;
  activityId?: string;
}

async function createCourseDocument(params: CreateCourseParams): Promise<void> {
  const db = getFirestore();
  const now = FieldValue.serverTimestamp();

  const courseDoc: Record<string, unknown> = {
    id: params.id,
    tenantId: params.tenantId,
    title: params.title,
    description: params.description,
    format: params.format,
    entryPoint: params.entryPoint,
    storagePath: params.storagePath,
    storageUrl: params.storageUrl,
    enrollmentSettings: {
      selfEnrollment: !params.approvalRequired,
      approvalRequired: params.approvalRequired,
    },
    complianceType: params.complianceType,
    isRequired: params.isRequired,
    status: 'published',
    createdAt: now,
    updatedAt: now,
    publishedAt: now,
  };

  // Add optional fields
  if (params.originalFilename) {
    courseDoc.originalFilename = params.originalFilename;
  }
  if (params.version) {
    courseDoc.version = params.version;
  }
  if (params.duration) {
    courseDoc.duration = params.duration;
  }
  if (params.language) {
    courseDoc.language = params.language;
  }
  if (params.activityId) {
    courseDoc.activityId = params.activityId;
  }

  // Write to Firestore
  await db.doc(`organizations/${params.tenantId}/courses/${params.id}`).set(courseDoc);
}

// =============================================================================
// Ensure Organization Exists
// =============================================================================

async function ensureOrganizationExists(tenantId: string): Promise<void> {
  const db = getFirestore();
  const orgRef = db.doc(`organizations/${tenantId}`);
  const orgDoc = await orgRef.get();

  if (!orgDoc.exists) {
    await orgRef.set({
      id: tenantId,
      name: tenantId.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
      slug: tenantId,
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
    print(`Created organization: ${tenantId}`);
  } else {
    print(`Organization exists: ${tenantId}`);
  }
}

// =============================================================================
// Main
// =============================================================================

async function main(): Promise<void> {
  print('='.repeat(60));
  print('LXD360 Course Import Script');
  print('='.repeat(60));
  print('');

  const args = parseArgs();

  // Validate arguments
  if (!args.tenantId) {
    printErr('Error: --tenant argument is required');
    printErr('Usage: npx tsx scripts/import-demo-courses.ts --tenant=mas-grocery');
    process.exit(1);
  }

  // Check source directory
  if (!existsSync(args.sourcePath)) {
    printErr(`Error: Source directory not found: ${args.sourcePath}`);
    process.exit(1);
  }

  print(`Tenant: ${args.tenantId}`);
  print(`Source: ${args.sourcePath}`);
  print(`Mode: ${args.dryRun ? 'DRY RUN (no changes will be made)' : 'LIVE'}`);
  print('');

  try {
    // Initialize Firebase (unless dry run)
    if (!args.dryRun) {
      initializeFirebaseAdmin();
      print('');

      // Ensure organization exists
      await ensureOrganizationExists(args.tenantId);
      print('');
    }

    // Read files from source directory
    const files = readdirSync(args.sourcePath).filter((f) => {
      const lower = f.toLowerCase();
      return (lower.endsWith('.zip') || lower.endsWith('.pdf')) &&
        !MANUAL_UPLOAD_FILES.includes(f);
    });

    print(`Found ${files.length} course files to import`);
    print('');

    // Import courses
    const results: ImportResult[] = [];
    const formatCounts: Record<ContentFormat, number> = {
      'scorm_1.2': 0,
      scorm_2004: 0,
      xapi: 0,
      cmi5: 0,
      aicc: 0,
      html5: 0,
      pdf: 0,
      unknown: 0,
    };

    for (let i = 0; i < files.length; i++) {
      const filename = files[i];
      const filePath = resolve(args.sourcePath, filename);

      print(`[${i + 1}/${files.length}] Processing: ${filename}`);

      const result = await importCourse(filePath, filename, args.tenantId, args.dryRun);
      results.push(result);

      if (result.success && result.format) {
        formatCounts[result.format]++;
        print(`  ✓ ${result.format} - "${result.title}"`);
      } else {
        print(`  ✗ Error: ${result.error}`);
      }
    }

    // Print summary
    print('');
    print('='.repeat(60));
    print('Import Summary');
    print('='.repeat(60));
    print('');

    const successful = results.filter((r) => r.success);
    const failed = results.filter((r) => !r.success);

    print(`Total files:    ${results.length}`);
    print(`Successful:     ${successful.length}`);
    print(`Failed:         ${failed.length}`);
    print('');

    print('By Format:');
    for (const [format, count] of Object.entries(formatCounts)) {
      if (count > 0) {
        print(`  ${format}: ${count}`);
      }
    }

    if (failed.length > 0) {
      print('');
      print('Failed imports:');
      for (const result of failed) {
        print(`  - ${result.filename}: ${result.error}`);
      }
    }

    print('');
    print('='.repeat(60));
    print(args.dryRun ? 'Dry run complete!' : 'Import complete!');
    print('='.repeat(60));
  } catch (error) {
    printErr(`Import failed: ${error}`);
    process.exit(1);
  }
}

main();
