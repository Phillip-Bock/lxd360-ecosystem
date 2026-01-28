'use client';

import { ChevronLeft, ChevronRight, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LogEntry {
  id: string;
  status: '200 OK' | '400 WRN' | '500 ERR' | string;
  action: string;
  date: string;
  time: string;
}

interface LogsTableProps {
  logs: LogEntry[];
  title?: string;
  totalRecords?: number;
  currentPage?: number;
  rowsPerPage?: number;
  onPageChange?: (page: number) => void;
  onRowsPerPageChange?: (rows: number) => void;
  onDelete?: (log: LogEntry) => void;
  className?: string;
}

export function LogsTable({
  logs,
  title = 'All logs',
  totalRecords = logs.length,
  currentPage = 1,
  rowsPerPage = 8,
  onPageChange,
  onRowsPerPageChange,
  onDelete,
  className,
}: LogsTableProps): React.JSX.Element {
  const startRecord = (currentPage - 1) * rowsPerPage + 1;
  const endRecord = Math.min(currentPage * rowsPerPage, totalRecords);

  const getStatusStyle = (status: string): string => {
    if (status.includes('200') || status.includes('OK')) {
      return 'bg-brand-success/10 text-green-600 dark:text-brand-success';
    }
    if (status.includes('400') || status.includes('WRN')) {
      return 'bg-brand-warning/10 text-amber-600 dark:text-brand-warning';
    }
    if (status.includes('500') || status.includes('ERR')) {
      return 'bg-brand-error/10 text-red-600 dark:text-brand-error';
    }
    return 'bg-lxd-light-surface/10 text-lxd-text-dark-body dark:text-lxd-text-light-muted';
  };

  return (
    <div className={cn('bg-card border-2 border-border rounded-[10px]', className)}>
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-border">
        <h3 className="text-lg font-semibold text-foreground">{title}</h3>
        <span className="text-sm text-muted-foreground">
          {startRecord}-{endRecord} of {totalRecords}
        </span>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Action
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Time
              </th>
              <th className="px-6 py-3 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {logs.map((log) => (
              <tr key={log.id} className="hover:bg-muted/50 transition-colors">
                <td className="px-6 py-4">
                  <span
                    className={cn(
                      'inline-flex items-center px-2.5 py-1 rounded-[6px] text-xs font-mono font-medium',
                      getStatusStyle(log.status),
                    )}
                  >
                    {log.status}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <code className="text-sm text-foreground font-mono bg-muted px-2 py-1 rounded-[4px]">
                    {log.action}
                  </code>
                </td>
                <td className="px-6 py-4 text-sm text-muted-foreground">{log.date}</td>
                <td className="px-6 py-4 text-sm text-muted-foreground">{log.time}</td>
                <td className="px-6 py-4 text-right">
                  {onDelete && (
                    <button
                      type="button"
                      onClick={() => onDelete(log)}
                      className="p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-[6px] transition-colors"
                      aria-label="Delete log"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between px-6 py-4 border-t border-border">
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Rows per page:</span>
          <select
            value={rowsPerPage}
            onChange={(e) => onRowsPerPageChange?.(Number(e.target.value))}
            className="bg-muted border border-border rounded-[6px] px-2 py-1 text-sm text-foreground"
          >
            {[5, 6, 7, 8, 10, 15, 20].map((num) => (
              <option key={num} value={num}>
                {num}
              </option>
            ))}
          </select>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onPageChange?.(currentPage - 1)}
            disabled={currentPage === 1}
            className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-[6px] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Previous page"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-sm text-foreground">
            Page {currentPage} of {Math.ceil(totalRecords / rowsPerPage)}
          </span>
          <button
            type="button"
            onClick={() => onPageChange?.(currentPage + 1)}
            disabled={currentPage >= Math.ceil(totalRecords / rowsPerPage)}
            className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-[6px] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Next page"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
