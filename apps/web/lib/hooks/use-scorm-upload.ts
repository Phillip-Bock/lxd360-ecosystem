'use client';

import { ref, uploadBytes } from 'firebase/storage';
import JSZip from 'jszip';
import { useCallback, useState } from 'react';
import { getFirebaseStorage } from '@/lib/firebase/client';

// ============================================================================
// TYPES
// ============================================================================

export interface ScormManifest {
  title: string;
  identifier: string;
  version: string;
  scormVersion: '1.2' | '2004' | 'xapi' | 'cmi5' | 'unknown';
  organizations: Array<{
    identifier: string;
    title: string;
    items: Array<{
      identifier: string;
      title: string;
      launch?: string;
    }>;
  }>;
  resources: Array<{
    identifier: string;
    type: string;
    href: string;
    files: string[];
  }>;
}

export interface UploadProgress {
  phase: 'idle' | 'extracting' | 'validating' | 'uploading' | 'complete' | 'error';
  progress: number;
  currentFile?: string;
  totalFiles?: number;
  uploadedFiles?: number;
  error?: string;
}

export interface UseScormUploadReturn {
  upload: (file: File, tenantId: string, courseId: string) => Promise<ScormManifest>;
  progress: UploadProgress;
  reset: () => void;
}

// ============================================================================
// SCORM VERSION DETECTION
// ============================================================================

function detectScormVersion(manifest: Document): ScormManifest['scormVersion'] {
  const rootElement = manifest.documentElement;
  const xmlns = rootElement.getAttribute('xmlns') || '';

  if (xmlns.includes('adlcp_v3')) return '2004';
  if (xmlns.includes('adlcp')) return '1.2';

  // Check for xAPI/cmi5 indicators
  const schemaVersion = manifest.querySelector('schemaversion')?.textContent;
  if (schemaVersion?.includes('cmi5')) return 'cmi5';

  // Check for tincan.xml presence (handled separately)
  return 'unknown';
}

// ============================================================================
// MANIFEST PARSER
// ============================================================================

function parseImsManifest(xmlContent: string): ScormManifest {
  const parser = new DOMParser();
  const doc = parser.parseFromString(xmlContent, 'text/xml');

  const scormVersion = detectScormVersion(doc);

  // Parse title
  const titleElement = doc.querySelector('title langstring') || doc.querySelector('title');
  const title = titleElement?.textContent || 'Untitled Course';

  // Parse identifier
  const manifestElement = doc.querySelector('manifest');
  const identifier = manifestElement?.getAttribute('identifier') || 'unknown';
  const version = manifestElement?.getAttribute('version') || '1.0';

  // Parse organizations
  const organizations: ScormManifest['organizations'] = [];
  doc.querySelectorAll('organizations > organization').forEach((org) => {
    const orgId = org.getAttribute('identifier') || '';
    const orgTitle = org.querySelector('title')?.textContent || '';

    const items: ScormManifest['organizations'][0]['items'] = [];
    org.querySelectorAll('item').forEach((item) => {
      items.push({
        identifier: item.getAttribute('identifier') || '',
        title: item.querySelector('title')?.textContent || '',
        launch: item.getAttribute('identifierref') || undefined,
      });
    });

    organizations.push({ identifier: orgId, title: orgTitle, items });
  });

  // Parse resources
  const resources: ScormManifest['resources'] = [];
  doc.querySelectorAll('resources > resource').forEach((res) => {
    const files: string[] = [];
    res.querySelectorAll('file').forEach((file) => {
      const href = file.getAttribute('href');
      if (href) files.push(href);
    });

    resources.push({
      identifier: res.getAttribute('identifier') || '',
      type: res.getAttribute('type') || '',
      href: res.getAttribute('href') || '',
      files,
    });
  });

  return {
    title,
    identifier,
    version,
    scormVersion,
    organizations,
    resources,
  };
}

// ============================================================================
// HOOK
// ============================================================================

export function useScormUpload(): UseScormUploadReturn {
  const [progress, setProgress] = useState<UploadProgress>({
    phase: 'idle',
    progress: 0,
  });

  const reset = useCallback(() => {
    setProgress({ phase: 'idle', progress: 0 });
  }, []);

  const upload = useCallback(
    async (file: File, tenantId: string, courseId: string): Promise<ScormManifest> => {
      try {
        // ═══════════════════════════════════════════════════════════════════
        // PHASE 1: EXTRACT ZIP CLIENT-SIDE
        // ═══════════════════════════════════════════════════════════════════
        setProgress({ phase: 'extracting', progress: 5 });

        const zip = new JSZip();
        const contents = await zip.loadAsync(file);

        const fileNames = Object.keys(contents.files);
        const totalFiles = fileNames.filter((name) => !contents.files[name].dir).length;

        setProgress({
          phase: 'extracting',
          progress: 15,
          totalFiles,
          currentFile: 'Reading package contents...',
        });

        // ═══════════════════════════════════════════════════════════════════
        // PHASE 2: VALIDATE SCORM/xAPI STRUCTURE
        // ═══════════════════════════════════════════════════════════════════
        setProgress({ phase: 'validating', progress: 20 });

        // Look for imsmanifest.xml (SCORM) or tincan.xml (xAPI)
        const manifestFile =
          contents.files['imsmanifest.xml'] ||
          contents.files['tincan.xml'] ||
          contents.files['cmi5.xml'];

        if (!manifestFile) {
          throw new Error('Invalid package: No imsmanifest.xml, tincan.xml, or cmi5.xml found');
        }

        const manifestContent = await manifestFile.async('string');
        const manifest = parseImsManifest(manifestContent);

        setProgress({
          phase: 'validating',
          progress: 30,
          currentFile: `Detected: ${manifest.scormVersion.toUpperCase()} package`,
        });

        // ═══════════════════════════════════════════════════════════════════
        // PHASE 3: UPLOAD FILES TO CLOUD STORAGE
        // ═══════════════════════════════════════════════════════════════════
        setProgress({
          phase: 'uploading',
          progress: 35,
          totalFiles,
          uploadedFiles: 0,
        });

        const storage = getFirebaseStorage();
        if (!storage) {
          throw new Error('Firebase Storage not initialized');
        }

        const basePath = `tenants/${tenantId}/courses/${courseId}/scorm`;
        let uploadedCount = 0;

        // Upload each file
        for (const fileName of fileNames) {
          const zipEntry = contents.files[fileName];

          // Skip directories
          if (zipEntry.dir) continue;

          const fileContent = await zipEntry.async('blob');
          const storagePath = `${basePath}/${fileName}`;
          const storageRef = ref(storage, storagePath);

          await uploadBytes(storageRef, fileContent);

          uploadedCount++;
          const progressPercent = 35 + Math.floor((uploadedCount / totalFiles) * 60);

          setProgress({
            phase: 'uploading',
            progress: progressPercent,
            totalFiles,
            uploadedFiles: uploadedCount,
            currentFile: fileName,
          });
        }

        // ═══════════════════════════════════════════════════════════════════
        // PHASE 4: COMPLETE
        // ═══════════════════════════════════════════════════════════════════
        setProgress({
          phase: 'complete',
          progress: 100,
          totalFiles,
          uploadedFiles: uploadedCount,
        });

        return manifest;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Upload failed';
        setProgress({
          phase: 'error',
          progress: 0,
          error: errorMessage,
        });
        throw error;
      }
    },
    [],
  );

  return { upload, progress, reset };
}
