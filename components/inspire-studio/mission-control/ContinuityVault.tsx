'use client';

import { Check, Copy, Download, FileJson, Link2, Upload, X } from 'lucide-react';
import { useCallback, useMemo, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import { useMissionStore } from '@/store/inspire';
import { useMissionControl } from './MissionControlProvider';

// ============================================================================
// COMPONENT
// ============================================================================

interface ContinuityVaultProps {
  className?: string;
}

/**
 * ContinuityVault - Data Export/Import Hub and Resume URL generator
 *
 * Features:
 * - Download JSON/CSV manifest
 * - Import JSON manifest
 * - "Resume Exactly Here" URL generator
 * - Blueprint Preview (live-updating view of manifest)
 */
export function ContinuityVault({ className }: ContinuityVaultProps) {
  const { continuityVaultOpen, toggleContinuityVault, getResumeUrl } = useMissionControl();
  const manifest = useMissionStore((state) => state.manifest);
  const loadMission = useMissionStore((state) => state.loadMission);

  const [copied, setCopied] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);

  // Generate resume URL
  const resumeUrl = useMemo(() => getResumeUrl(), [getResumeUrl]);

  // Copy URL to clipboard
  const handleCopyUrl = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(resumeUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = resumeUrl;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [resumeUrl]);

  // Export manifest as JSON
  const handleExportJson = useCallback(() => {
    if (!manifest) return;

    const json = JSON.stringify(manifest, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = `inspire-manifest-${manifest.metadata?.id ?? 'export'}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [manifest]);

  // Export manifest as CSV (simplified)
  const handleExportCsv = useCallback(() => {
    if (!manifest) return;

    const rows: string[][] = [];

    // Header
    rows.push(['Section', 'Field', 'Value']);

    // Metadata
    if (manifest.metadata) {
      rows.push(['Metadata', 'ID', manifest.metadata.id]);
      rows.push(['Metadata', 'Title', manifest.metadata.title]);
      rows.push(['Metadata', 'Industry', manifest.metadata.industry ?? '']);
      rows.push(['Metadata', 'Created', manifest.metadata.createdAt ?? '']);
    }

    // Encoding data
    if (manifest.encoding) {
      rows.push(['Encoding', 'Complete', String(manifest.encoding.isComplete ?? false)]);
      rows.push(['Encoding', 'Industry', manifest.encoding.industryAnalysis?.industry ?? '']);
      rows.push(['Encoding', 'Personas', String(manifest.encoding.personas?.length ?? 0)]);
    }

    // Competency ladder
    if (manifest.competencyLadder) {
      manifest.competencyLadder.forEach((rung, idx) => {
        rows.push(['Competency Ladder', `Rung ${idx + 1}`, rung.objective]);
      });
    }

    // Convert to CSV
    const csv = rows.map((row) => row.map((cell) => `"${cell}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = `inspire-manifest-${manifest.metadata?.id ?? 'export'}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [manifest]);

  // Import manifest from JSON file
  const handleImportJson = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;

      setImportError(null);

      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const json = e.target?.result as string;
          const parsed = JSON.parse(json);

          // Basic validation
          if (!parsed.metadata || !parsed.metadata.id) {
            throw new Error('Invalid manifest: missing metadata.id');
          }

          loadMission(parsed);
          toggleContinuityVault();
        } catch (error) {
          setImportError(error instanceof Error ? error.message : 'Failed to parse JSON file');
        }
      };
      reader.readAsText(file);
    },
    [loadMission, toggleContinuityVault],
  );

  // Format JSON for preview
  const formattedManifest = useMemo(() => {
    if (!manifest) return 'No manifest loaded';
    return JSON.stringify(manifest, null, 2);
  }, [manifest]);

  // Calculate manifest stats
  const manifestStats = useMemo(() => {
    if (!manifest) return null;

    return {
      personas: manifest.encoding?.personas?.length ?? 0,
      competencyRungs: manifest.competencyLadder?.length ?? 0,
      blocks: manifest.assimilation?.blocks?.length ?? 0,
      encodingComplete: manifest.encoding?.isComplete ?? false,
      synthesizationComplete: manifest.synthesization?.isComplete ?? false,
      assimilationComplete: manifest.assimilation?.isComplete ?? false,
    };
  }, [manifest]);

  return (
    <Sheet open={continuityVaultOpen} onOpenChange={toggleContinuityVault}>
      <SheetContent side="bottom" className={cn('h-[60vh]', className)}>
        <SheetHeader className="pb-4">
          <SheetTitle className="flex items-center gap-2">
            <FileJson className="h-5 w-5" />
            Continuity Vault
          </SheetTitle>
        </SheetHeader>

        <Tabs defaultValue="resume" className="h-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="resume">Resume URL</TabsTrigger>
            <TabsTrigger value="export">Export</TabsTrigger>
            <TabsTrigger value="import">Import</TabsTrigger>
            <TabsTrigger value="preview">Blueprint</TabsTrigger>
          </TabsList>

          {/* Resume URL Tab */}
          <TabsContent value="resume" className="mt-4 space-y-4">
            <div>
              <Label htmlFor="resume-url">Resume Exactly Here URL</Label>
              <p className="text-sm text-muted-foreground mt-1">
                Share this URL to resume exactly where you left off
              </p>
            </div>
            <div className="flex gap-2">
              <Input
                id="resume-url"
                value={resumeUrl}
                readOnly
                className="flex-1 font-mono text-sm"
              />
              <Button type="button" variant="outline" onClick={handleCopyUrl} className="shrink-0">
                {copied ? (
                  <>
                    <Check className="h-4 w-4 mr-2" />
                    Copied
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4 mr-2" />
                    Copy
                  </>
                )}
              </Button>
            </div>

            {/* QR Code placeholder */}
            <div className="border border-dashed border-lxd-dark-border rounded-lg p-8 text-center">
              <Link2 className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground">QR Code generation coming soon</p>
            </div>
          </TabsContent>

          {/* Export Tab */}
          <TabsContent value="export" className="mt-4 space-y-4">
            <div>
              <h3 className="font-medium">Export Manifest</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Download your course manifest for backup or sharing
              </p>
            </div>

            {/* Stats */}
            {manifestStats && (
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-lxd-dark-hover rounded-lg p-3 text-center">
                  <p className="text-2xl font-bold">{manifestStats.personas}</p>
                  <p className="text-xs text-muted-foreground">Personas</p>
                </div>
                <div className="bg-lxd-dark-hover rounded-lg p-3 text-center">
                  <p className="text-2xl font-bold">{manifestStats.competencyRungs}</p>
                  <p className="text-xs text-muted-foreground">Rungs</p>
                </div>
                <div className="bg-lxd-dark-hover rounded-lg p-3 text-center">
                  <p className="text-2xl font-bold">{manifestStats.blocks}</p>
                  <p className="text-xs text-muted-foreground">Blocks</p>
                </div>
              </div>
            )}

            <div className="flex gap-4">
              <Button
                type="button"
                onClick={handleExportJson}
                disabled={!manifest}
                className="flex-1"
              >
                <Download className="h-4 w-4 mr-2" />
                Export as JSON
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={handleExportCsv}
                disabled={!manifest}
                className="flex-1"
              >
                <Download className="h-4 w-4 mr-2" />
                Export as CSV
              </Button>
            </div>
          </TabsContent>

          {/* Import Tab */}
          <TabsContent value="import" className="mt-4 space-y-4">
            <div>
              <h3 className="font-medium">Import Manifest</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Load a previously exported manifest to continue working
              </p>
            </div>

            <div className="border border-dashed border-lxd-dark-border rounded-lg p-8 text-center">
              <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-4" />
              <Label
                htmlFor="import-file"
                className="cursor-pointer text-lxd-purple hover:underline"
              >
                Click to select a JSON file
              </Label>
              <Input
                id="import-file"
                type="file"
                accept=".json"
                onChange={handleImportJson}
                className="hidden"
              />
              <p className="text-xs text-muted-foreground mt-2">
                Only .json files exported from INSPIRE Studio are supported
              </p>
            </div>

            {importError && (
              <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-3">
                <p className="text-sm text-red-500 flex items-center gap-2">
                  <X className="h-4 w-4" />
                  {importError}
                </p>
              </div>
            )}

            {manifest && (
              <div className="bg-yellow-500/10 border border-yellow-500/50 rounded-lg p-3">
                <p className="text-sm text-yellow-500">
                  Warning: Importing a new manifest will replace your current work.
                </p>
              </div>
            )}
          </TabsContent>

          {/* Blueprint Preview Tab */}
          <TabsContent value="preview" className="mt-4">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-medium">Blueprint Preview</h3>
                <p className="text-sm text-muted-foreground">Live view of your current manifest</p>
              </div>
              <div className="flex gap-2">
                {manifestStats && (
                  <>
                    <Badge variant={manifestStats.encodingComplete ? 'default' : 'secondary'}>
                      Encoding
                    </Badge>
                    <Badge variant={manifestStats.synthesizationComplete ? 'default' : 'secondary'}>
                      Synthesization
                    </Badge>
                    <Badge variant={manifestStats.assimilationComplete ? 'default' : 'secondary'}>
                      Assimilation
                    </Badge>
                  </>
                )}
              </div>
            </div>
            <ScrollArea className="h-[300px] rounded-md border border-lxd-dark-border">
              <pre className="p-4 text-xs font-mono text-muted-foreground">{formattedManifest}</pre>
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </SheetContent>
    </Sheet>
  );
}
