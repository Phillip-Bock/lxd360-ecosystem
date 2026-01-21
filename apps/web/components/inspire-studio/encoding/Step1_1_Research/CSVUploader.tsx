'use client';

import { AlertCircle, Check, Download, FileSpreadsheet, Upload, X } from 'lucide-react';
import { useCallback, useRef, useState } from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import {
  type CSVRow,
  type CSVUploadResult,
  getCSVTemplate,
  type LocalPerformanceGap,
} from './types';

// ============================================================================
// COMPONENT
// ============================================================================

interface CSVUploaderProps {
  onUploadComplete: (gaps: LocalPerformanceGap[]) => void;
  className?: string;
}

/**
 * CSVUploader - Bulk upload for performance gaps via CSV
 *
 * Features:
 * - Download CSV template
 * - Parse and validate uploaded CSV
 * - Error reporting for invalid rows
 * - Preview before applying
 */
export function CSVUploader({ onUploadComplete, className }: CSVUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadResult, setUploadResult] = useState<CSVUploadResult | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  // Download template
  const handleDownloadTemplate = useCallback(() => {
    const template = getCSVTemplate();
    const blob = new Blob([template], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = 'performance-gaps-template.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, []);

  // Parse CSV content
  const parseCSV = useCallback((content: string): CSVUploadResult => {
    const lines = content.trim().split('\n');
    const gaps: LocalPerformanceGap[] = [];
    const errors: string[] = [];
    const warnings: string[] = [];

    // Skip header row
    if (lines.length < 2) {
      return {
        success: false,
        gaps: [],
        errors: ['CSV file must have at least a header row and one data row'],
        warnings: [],
      };
    }

    // Validate header
    const header = lines[0]?.toLowerCase();
    if (!header?.includes('title') || !header?.includes('description')) {
      errors.push(
        'Invalid header row. Expected: title,description,root_causes,success_metrics,priority',
      );
    }

    // Parse data rows
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i]?.trim();
      if (!line) continue;

      try {
        const row = parseCSVRow(line);

        if (!row.title) {
          errors.push(`Row ${i + 1}: Missing required field 'title'`);
          continue;
        }

        if (!row.description) {
          warnings.push(`Row ${i + 1}: Missing description for "${row.title}"`);
        }

        const gap: LocalPerformanceGap = {
          id: `csv-${Date.now()}-${i}`,
          title: row.title,
          description: row.description || '',
          rootCauses:
            row.root_causes
              ?.split('|')
              .map((s) => s.trim())
              .filter(Boolean) ?? [],
          successMetrics:
            row.success_metrics
              ?.split('|')
              .map((s) => s.trim())
              .filter(Boolean) ?? [],
          priority: validatePriority(row.priority),
          source: 'csv',
        };

        gaps.push(gap);
      } catch {
        errors.push(`Row ${i + 1}: Failed to parse row`);
      }
    }

    return {
      success: errors.length === 0,
      gaps,
      errors,
      warnings,
    };
  }, []);

  // Handle file selection
  const handleFileSelect = useCallback(
    (file: File) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        const result = parseCSV(content);
        setUploadResult(result);
      };
      reader.readAsText(file);
    },
    [parseCSV],
  );

  // Handle file input change
  const handleInputChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (file) {
        handleFileSelect(file);
      }
    },
    [handleFileSelect],
  );

  // Handle drag and drop
  const handleDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();
      setIsDragging(false);

      const file = event.dataTransfer.files[0];
      if (file && file.type === 'text/csv') {
        handleFileSelect(file);
      }
    },
    [handleFileSelect],
  );

  // Apply uploaded gaps
  const handleApplyGaps = useCallback(() => {
    if (uploadResult && uploadResult.gaps.length > 0) {
      onUploadComplete(uploadResult.gaps);
      setUploadResult(null);
    }
  }, [uploadResult, onUploadComplete]);

  // Clear result
  const handleClear = useCallback(() => {
    setUploadResult(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, []);

  return (
    <Card className={cn('bg-lxd-dark-surface border-lxd-dark-border', className)}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <FileSpreadsheet className="h-5 w-5 text-lxd-cyan" />
          CSV Bulk Upload
        </CardTitle>
        <CardDescription>Upload performance gaps in bulk using a CSV file</CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Download Template */}
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleDownloadTemplate}
          className="w-full"
        >
          <Download className="h-4 w-4 mr-2" />
          Download CSV Template
        </Button>

        {/* Upload Zone */}
        {/* biome-ignore lint/a11y/useSemanticElements: File upload zone with drag-drop requires div for complex interactions */}
        <div
          className={cn(
            'border-2 border-dashed rounded-lg p-6 text-center transition-colors cursor-pointer',
            isDragging
              ? 'border-lxd-purple bg-lxd-purple/10'
              : 'border-lxd-dark-border hover:border-lxd-dark-hover',
          )}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              fileInputRef.current?.click();
            }
          }}
          role="button"
          tabIndex={0}
          aria-label="Upload CSV file"
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv"
            onChange={handleInputChange}
            className="hidden"
            aria-label="CSV file input"
          />
          <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
          <p className="text-sm font-medium">Drop CSV file here or click to browse</p>
          <p className="text-xs text-muted-foreground mt-1">
            Supports .csv files with performance gap data
          </p>
        </div>

        {/* Upload Result */}
        {uploadResult && (
          <div className="space-y-3">
            {/* Errors */}
            {uploadResult.errors.length > 0 && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Upload Errors</AlertTitle>
                <AlertDescription>
                  <ul className="list-disc list-inside text-sm mt-2">
                    {uploadResult.errors.map((error, idx) => (
                      <li key={idx}>{error}</li>
                    ))}
                  </ul>
                </AlertDescription>
              </Alert>
            )}

            {/* Warnings */}
            {uploadResult.warnings.length > 0 && (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Warnings</AlertTitle>
                <AlertDescription>
                  <ul className="list-disc list-inside text-sm mt-2">
                    {uploadResult.warnings.map((warning, idx) => (
                      <li key={idx}>{warning}</li>
                    ))}
                  </ul>
                </AlertDescription>
              </Alert>
            )}

            {/* Success Preview */}
            {uploadResult.gaps.length > 0 && (
              <div className="p-4 rounded-lg bg-lxd-dark-bg/50">
                <div className="flex items-center gap-2 mb-3">
                  <Check className="h-4 w-4 text-green-500" />
                  <span className="font-medium text-sm">
                    {uploadResult.gaps.length} gap{uploadResult.gaps.length !== 1 ? 's' : ''} ready
                    to import
                  </span>
                </div>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  {uploadResult.gaps.slice(0, 5).map((gap) => (
                    <li key={gap.id} className="truncate">
                      • {gap.title}
                    </li>
                  ))}
                  {uploadResult.gaps.length > 5 && (
                    <li>...and {uploadResult.gaps.length - 5} more</li>
                  )}
                </ul>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-2">
              <Button
                type="button"
                onClick={handleApplyGaps}
                disabled={uploadResult.gaps.length === 0}
                className="flex-1"
              >
                <Check className="h-4 w-4 mr-2" />
                Apply {uploadResult.gaps.length} Gap{uploadResult.gaps.length !== 1 ? 's' : ''}
              </Button>
              <Button type="button" variant="outline" onClick={handleClear}>
                <X className="h-4 w-4" />
                <span className="sr-only">Clear</span>
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ============================================================================
// HELPERS
// ============================================================================

function parseCSVRow(line: string): CSVRow {
  const values: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];

    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      values.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  values.push(current.trim());

  return {
    title: values[0] ?? '',
    description: values[1] ?? '',
    root_causes: values[2] ?? '',
    success_metrics: values[3] ?? '',
    priority: values[4] ?? 'medium',
  };
}

function validatePriority(value: string): 'critical' | 'high' | 'medium' | 'low' {
  const normalized = value.toLowerCase().trim();
  if (normalized === 'critical') return 'critical';
  if (normalized === 'high') return 'high';
  if (normalized === 'low') return 'low';
  return 'medium';
}
