/**
 * Prepare Manual Courses Script
 *
 * Moves specific course files to a separate directory for manual upload testing.
 * These files are excluded from the automated import script.
 *
 * Usage: npx tsx scripts/prepare-manual-courses.ts
 *
 * Options:
 *   --source=<path>  Optional. Source directory (default: D:\Demo Courses\Zips\)
 *   --dest=<path>    Optional. Destination directory (default: D:\Demo Courses\Manual\)
 *   --dry-run        Optional. Preview without moving files.
 */

import { copyFileSync, existsSync, mkdirSync, readdirSync, unlinkSync } from 'fs';
import { join } from 'path';

import { MANUAL_UPLOAD_FILES } from '../lib/import/types';

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
const DEFAULT_DEST = 'D:\\Demo Courses\\Manual';

// =============================================================================
// Argument Parsing
// =============================================================================

interface ScriptArgs {
  sourcePath: string;
  destPath: string;
  dryRun: boolean;
}

function parseArgs(): ScriptArgs {
  const args: ScriptArgs = {
    sourcePath: DEFAULT_SOURCE,
    destPath: DEFAULT_DEST,
    dryRun: false,
  };

  for (const arg of process.argv.slice(2)) {
    if (arg.startsWith('--source=')) {
      args.sourcePath = arg.split('=')[1];
    } else if (arg.startsWith('--dest=')) {
      args.destPath = arg.split('=')[1];
    } else if (arg === '--dry-run') {
      args.dryRun = true;
    }
  }

  return args;
}

// =============================================================================
// Main
// =============================================================================

function main(): void {
  print('='.repeat(60));
  print('LXD360 Prepare Manual Courses Script');
  print('='.repeat(60));
  print('');

  const args = parseArgs();

  print(`Source: ${args.sourcePath}`);
  print(`Destination: ${args.destPath}`);
  print(`Mode: ${args.dryRun ? 'DRY RUN' : 'LIVE'}`);
  print('');

  // Check source directory
  if (!existsSync(args.sourcePath)) {
    printErr(`Error: Source directory not found: ${args.sourcePath}`);
    process.exit(1);
  }

  // Create destination directory if needed
  if (!args.dryRun && !existsSync(args.destPath)) {
    mkdirSync(args.destPath, { recursive: true });
    print(`Created destination directory: ${args.destPath}`);
    print('');
  }

  // Get list of files in source
  const sourceFiles = readdirSync(args.sourcePath);

  // Find matching files
  const filesToMove = MANUAL_UPLOAD_FILES.filter((f) => sourceFiles.includes(f));
  const notFound = MANUAL_UPLOAD_FILES.filter((f) => !sourceFiles.includes(f));

  if (filesToMove.length === 0) {
    print('No matching files found to move.');
    print('');
    print('Files configured for manual upload:');
    for (const file of MANUAL_UPLOAD_FILES) {
      print(`  - ${file}`);
    }
    return;
  }

  print(`Found ${filesToMove.length} of ${MANUAL_UPLOAD_FILES.length} files to move:`);
  print('');

  // Move files
  let movedCount = 0;
  for (const filename of filesToMove) {
    const srcPath = join(args.sourcePath, filename);
    const destPath = join(args.destPath, filename);

    if (args.dryRun) {
      print(`  [DRY RUN] Would move: ${filename}`);
      movedCount++;
    } else {
      try {
        // Copy file to destination
        copyFileSync(srcPath, destPath);
        // Remove original
        unlinkSync(srcPath);
        print(`  ✓ Moved: ${filename}`);
        movedCount++;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        print(`  ✗ Failed: ${filename} - ${errorMessage}`);
      }
    }
  }

  print('');

  // Report not found files
  if (notFound.length > 0) {
    print('Files not found in source directory:');
    for (const file of notFound) {
      print(`  - ${file}`);
    }
    print('');
  }

  // Summary
  print('='.repeat(60));
  print('Summary');
  print('='.repeat(60));
  print(`Files moved: ${movedCount}`);
  print(`Files not found: ${notFound.length}`);
  print('');

  if (movedCount > 0 && !args.dryRun) {
    print(`Manual upload files are now in: ${args.destPath}`);
  }

  print('');
  print('Files designated for manual upload testing:');
  print('');
  print('1. how-to-protect-your-data-scorm12-CSROxLaE.zip');
  print('   - SCORM 1.2 security course');
  print('');
  print('2. diversity-basics-foundations-xapi-b63XOx1k.zip');
  print('   - xAPI diversity course');
  print('');
  print('3. how-to-avoid-bias-in-talent-recruiting-and-retention-dmGMVGv0.pdf');
  print('   - PDF document');
  print('');
  print('4. how-to-avoid-bias-in-talent-recruiting-and-retention-raw-obl5AB90.zip');
  print('   - Raw HTML5 content');
  print('');
}

main();
