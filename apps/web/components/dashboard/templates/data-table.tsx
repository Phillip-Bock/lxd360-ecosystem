'use client';

import { ChevronLeft, ChevronRight, Edit2, Trash2 } from 'lucide-react';
import Image from 'next/image';
import { cn } from '@/lib/utils';

export interface TableColumn<T> {
  key: keyof T | string;
  header: string;
  render?: (row: T) => React.ReactNode;
  className?: string;
}

interface DataTableProps<T> {
  columns: TableColumn<T>[];
  data: T[];
  title?: string;
  totalRecords?: number;
  currentPage?: number;
  rowsPerPage?: number;
  onPageChange?: (page: number) => void;
  onRowsPerPageChange?: (rows: number) => void;
  onEdit?: (row: T) => void;
  onDelete?: (row: T) => void;
  showActions?: boolean;
  className?: string;
}

export function DataTable<T extends { id?: string | number }>({
  columns,
  data,
  title,
  totalRecords = data.length,
  currentPage = 1,
  rowsPerPage = 8,
  onPageChange,
  onRowsPerPageChange,
  onEdit,
  onDelete,
  showActions = true,
  className,
}: DataTableProps<T>): React.JSX.Element {
  const startRecord = (currentPage - 1) * rowsPerPage + 1;
  const endRecord = Math.min(currentPage * rowsPerPage, totalRecords);

  return (
    <div className={cn('bg-card border-2 border-border rounded-[10px]', className)}>
      {/* Header */}
      {title && (
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <h3 className="text-lg font-semibold text-foreground">{title}</h3>
          <span className="text-sm text-muted-foreground">
            {startRecord}-{endRecord} of {totalRecords}
          </span>
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              {columns.map((column) => (
                <th
                  key={String(column.key)}
                  className={cn(
                    'px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider',
                    column.className,
                  )}
                >
                  {column.header}
                </th>
              ))}
              {showActions && (
                <th className="px-6 py-3 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Actions
                </th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {data.map((row, rowIndex) => (
              <tr key={row.id ?? rowIndex} className="hover:bg-muted/50 transition-colors">
                {columns.map((column) => (
                  <td
                    key={String(column.key)}
                    className={cn('px-6 py-4 text-sm text-foreground', column.className)}
                  >
                    {column.render
                      ? column.render(row)
                      : String((row as Record<string, unknown>)[column.key as string] ?? '')}
                  </td>
                ))}
                {showActions && (
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {onEdit && (
                        <button
                          type="button"
                          onClick={() => onEdit(row)}
                          className="p-1.5 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-[6px] transition-colors"
                          aria-label="Edit"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                      )}
                      {onDelete && (
                        <button
                          type="button"
                          onClick={() => onDelete(row)}
                          className="p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-[6px] transition-colors"
                          aria-label="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                )}
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

// User cell helper component
interface UserCellProps {
  name: string;
  email?: string;
  avatar?: string;
}

export function UserCell({ name, email, avatar }: UserCellProps): React.JSX.Element {
  return (
    <div className="flex items-center gap-3">
      {avatar ? (
        <Image
          src={avatar}
          alt={name}
          width={32}
          height={32}
          className="w-8 h-8 rounded-full object-cover"
        />
      ) : (
        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
          <span className="text-sm font-medium text-primary">{name.charAt(0).toUpperCase()}</span>
        </div>
      )}
      <div>
        <p className="text-sm font-medium text-foreground">{name}</p>
        {email && <p className="text-xs text-muted-foreground">{email}</p>}
      </div>
    </div>
  );
}

// Status badge helper component
interface StatusBadgeProps {
  status: 'success' | 'warning' | 'error' | 'info' | 'neutral';
  label: string;
}

export function StatusBadge({ status, label }: StatusBadgeProps): React.JSX.Element {
  const statusStyles = {
    success: 'bg-brand-success/10 text-green-600 dark:text-brand-success',
    warning: 'bg-brand-warning/10 text-amber-600 dark:text-brand-warning',
    error: 'bg-brand-error/10 text-red-600 dark:text-brand-error',
    info: 'bg-brand-primary/10 text-brand-blue dark:text-brand-cyan',
    neutral: 'bg-lxd-light-surface/10 text-lxd-text-dark-body dark:text-lxd-text-light-muted',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
        statusStyles[status],
      )}
    >
      {label}
    </span>
  );
}
