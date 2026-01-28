'use client';

import { Download, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import type { Assignment, GradebookEntry } from './gradebook-table';

// ============================================================================
// TYPES
// ============================================================================

export interface ExportButtonProps {
  /** Gradebook entries to export */
  entries: GradebookEntry[];
  /** Assignments for column headers */
  assignments: Assignment[];
  /** Course name for the filename */
  courseName?: string;
  /** Additional CSS classes */
  className?: string;
}

type ExportFormat = 'csv' | 'csv-detailed';

// ============================================================================
// HELPERS
// ============================================================================

function escapeCSVField(value: string | number | null | undefined): string {
  if (value === null || value === undefined) {
    return '';
  }
  const stringValue = String(value);
  // Escape quotes and wrap in quotes if contains comma, quote, or newline
  if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
    return `"${stringValue.replace(/"/g, '""')}"`;
  }
  return stringValue;
}

function formatDateForExport(date: Date | undefined): string {
  if (!date) return '';
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

function generateCSV(
  entries: GradebookEntry[],
  assignments: Assignment[],
  format: ExportFormat,
): string {
  const rows: string[] = [];

  if (format === 'csv') {
    // Simple format: Name, Email, each assignment score, Overall Grade, Status
    const headers = ['Name', 'Email', ...assignments.map((a) => a.name), 'Overall Grade', 'Status'];
    rows.push(headers.map(escapeCSVField).join(','));

    for (const entry of entries) {
      const row = [
        entry.learnerName,
        entry.learnerEmail,
        ...assignments.map((assignment) => {
          const grade = entry.assignments.find((g) => g.assignmentId === assignment.id);
          if (grade?.score !== null && grade?.score !== undefined) {
            return `${Math.round((grade.score / grade.maxScore) * 100)}%`;
          }
          return '';
        }),
        entry.status === 'incomplete' ? '' : `${entry.overallGrade}%`,
        entry.status.charAt(0).toUpperCase() + entry.status.slice(1),
      ];
      rows.push(row.map(escapeCSVField).join(','));
    }
  } else {
    // Detailed format: includes raw scores, max scores, and submission dates
    const headers = [
      'Name',
      'Email',
      ...assignments.flatMap((a) => [
        `${a.name} (Score)`,
        `${a.name} (Max)`,
        `${a.name} (%)`,
        `${a.name} (Submitted)`,
      ]),
      'Overall Grade',
      'Status',
      'Completion Rate',
    ];
    rows.push(headers.map(escapeCSVField).join(','));

    for (const entry of entries) {
      const completedCount = entry.assignments.filter((a) => a.score !== null).length;
      const completionRate = Math.round((completedCount / entry.assignments.length) * 100);

      const row = [
        entry.learnerName,
        entry.learnerEmail,
        ...assignments.flatMap((assignment) => {
          const grade = entry.assignments.find((g) => g.assignmentId === assignment.id);
          const percentage =
            grade?.score !== null && grade?.score !== undefined
              ? `${Math.round((grade.score / grade.maxScore) * 100)}%`
              : '';
          return [
            grade?.score ?? '',
            grade?.maxScore ?? assignment.maxScore,
            percentage,
            formatDateForExport(grade?.submittedAt),
          ];
        }),
        entry.status === 'incomplete' ? '' : `${entry.overallGrade}%`,
        entry.status.charAt(0).toUpperCase() + entry.status.slice(1),
        `${completionRate}%`,
      ];
      rows.push(row.map(escapeCSVField).join(','));
    }
  }

  return rows.join('\n');
}

function downloadCSV(content: string, filename: string): void {
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.style.display = 'none';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function generateFilename(courseName: string | undefined, format: ExportFormat): string {
  const dateStr = new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  })
    .format(new Date())
    .replace(/\//g, '-');

  const baseName = courseName ? courseName.toLowerCase().replace(/[^a-z0-9]+/g, '-') : 'gradebook';

  const suffix = format === 'csv-detailed' ? '-detailed' : '';
  return `${baseName}-grades${suffix}-${dateStr}.csv`;
}

// ============================================================================
// COMPONENT
// ============================================================================

export function ExportButton({
  entries,
  assignments,
  courseName,
  className,
}: ExportButtonProps): React.ReactElement {
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async (format: ExportFormat): Promise<void> => {
    setIsExporting(true);

    // Small delay for UI feedback
    await new Promise((resolve) => setTimeout(resolve, 100));

    try {
      const csv = generateCSV(entries, assignments, format);
      const filename = generateFilename(courseName, format);
      downloadCSV(csv, filename);
    } finally {
      setIsExporting(false);
    }
  };

  const isEmpty = entries.length === 0;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant="outline"
          className={cn('gap-2', className)}
          disabled={isExporting || isEmpty}
          aria-label="Export grades"
        >
          {isExporting ? (
            <Loader2 className="size-4 animate-spin" aria-hidden="true" />
          ) : (
            <Download className="size-4" aria-hidden="true" />
          )}
          Export Grades
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem
          onClick={() => handleExport('csv')}
          disabled={isExporting}
          className="cursor-pointer"
        >
          <Download className="size-4 mr-2" aria-hidden="true" />
          Export as CSV
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => handleExport('csv-detailed')}
          disabled={isExporting}
          className="cursor-pointer"
        >
          <Download className="size-4 mr-2" aria-hidden="true" />
          Export Detailed CSV
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default ExportButton;
