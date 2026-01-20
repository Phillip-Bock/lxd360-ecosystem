/**
 * =============================================================================
 * LXP360-SaaS | Accessible Data Table Components
 * =============================================================================
 *
 * @fileoverview Accessible data table components for WCAG 2.1 AA compliance
 *
 * @description
 * Provides accessible table components with:
 * - Proper table semantics and ARIA attributes
 * - Sortable columns with screen reader announcements
 * - Keyboard navigation
 * - Responsive design with mobile-friendly layout
 * - Row selection with accessible checkboxes
 * - Pagination with proper labeling
 *
 * WCAG Compliance:
 * - 1.3.1 Info and Relationships (Level A)
 * - 1.3.2 Meaningful Sequence (Level A)
 * - 2.1.1 Keyboard (Level A)
 * - 2.4.6 Headings and Labels (Level AA)
 * - 4.1.2 Name, Role, Value (Level A)
 *
 * =============================================================================
 */

'use client';

import * as React from 'react';
import { announce } from '@/lib/accessibility/focus-management';
import { cn } from '@/lib/utils';

// ============================================================================
// Types
// ============================================================================

export interface Column<T> {
  /** Unique column identifier */
  id: string;
  /** Column header text */
  header: string;
  /** Cell accessor function or key */
  accessor: keyof T | ((row: T) => React.ReactNode);
  /** Whether column is sortable */
  sortable?: boolean;
  /** Column width */
  width?: string | number;
  /** Cell alignment */
  align?: 'left' | 'center' | 'right';
  /** Whether to hide on mobile */
  hideOnMobile?: boolean;
  /** Screen reader description */
  srDescription?: string;
}

export type SortDirection = 'asc' | 'desc' | null;

export interface SortState {
  column: string | null;
  direction: SortDirection;
}

export interface AccessibleTableProps<T> {
  /** Column definitions */
  columns: Column<T>[];
  /** Table data */
  data: T[];
  /** Row key accessor */
  getRowId: (row: T) => string | number;
  /** Table caption for screen readers */
  caption: string;
  /** Whether to show caption visually */
  showCaption?: boolean;
  /** Enable row selection */
  selectable?: boolean;
  /** Selected row IDs */
  selectedIds?: Set<string | number>;
  /** Selection change handler */
  onSelectionChange?: (selectedIds: Set<string | number>) => void;
  /** Sort state */
  sortState?: SortState;
  /** Sort change handler */
  onSortChange?: (state: SortState) => void;
  /** Loading state */
  isLoading?: boolean;
  /** Empty state message */
  emptyMessage?: string;
  /** Additional CSS classes */
  className?: string;
  /** Enable striped rows */
  striped?: boolean;
  /** Enable hover highlight */
  hoverable?: boolean;
  /** Compact mode */
  compact?: boolean;
  /** Sticky header */
  stickyHeader?: boolean;
}

export interface PaginationProps {
  /** Current page (1-indexed) */
  currentPage: number;
  /** Total number of pages */
  totalPages: number;
  /** Total number of items */
  totalItems: number;
  /** Items per page */
  pageSize: number;
  /** Page change handler */
  onPageChange: (page: number) => void;
  /** Page size change handler */
  onPageSizeChange?: (size: number) => void;
  /** Available page sizes */
  pageSizeOptions?: number[];
  /** Additional CSS classes */
  className?: string;
}

// ============================================================================
// Sort Icons
// ============================================================================

function SortIcon({ direction, className }: { direction: SortDirection; className?: string }) {
  if (direction === 'asc') {
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 20 20"
        fill="currentColor"
        className={cn('w-4 h-4', className)}
        aria-hidden="true"
      >
        <path
          fillRule="evenodd"
          d="M10 17a.75.75 0 01-.75-.75V5.612L5.29 9.77a.75.75 0 01-1.08-1.04l5.25-5.5a.75.75 0 011.08 0l5.25 5.5a.75.75 0 11-1.08 1.04l-3.96-4.158V16.25A.75.75 0 0110 17z"
          clipRule="evenodd"
        />
      </svg>
    );
  }

  if (direction === 'desc') {
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 20 20"
        fill="currentColor"
        className={cn('w-4 h-4', className)}
        aria-hidden="true"
      >
        <path
          fillRule="evenodd"
          d="M10 3a.75.75 0 01.75.75v10.638l3.96-4.158a.75.75 0 111.08 1.04l-5.25 5.5a.75.75 0 01-1.08 0l-5.25-5.5a.75.75 0 111.08-1.04l3.96 4.158V3.75A.75.75 0 0110 3z"
          clipRule="evenodd"
        />
      </svg>
    );
  }

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 20 20"
      fill="currentColor"
      className={cn('w-4 h-4 opacity-40', className)}
      aria-hidden="true"
    >
      <path
        fillRule="evenodd"
        d="M10 3a.75.75 0 01.55.24l3.25 3.5a.75.75 0 11-1.1 1.02L10 4.852 7.3 7.76a.75.75 0 01-1.1-1.02l3.25-3.5A.75.75 0 0110 3zm-3.76 9.2a.75.75 0 011.06.04l2.7 2.908 2.7-2.908a.75.75 0 111.1 1.02l-3.25 3.5a.75.75 0 01-1.1 0l-3.25-3.5a.75.75 0 01.04-1.06z"
        clipRule="evenodd"
      />
    </svg>
  );
}

// ============================================================================
// Checkbox Component
// ============================================================================

function SelectAllCheckbox({
  checked,
  indeterminate,
  onChange,
  label,
}: {
  checked: boolean;
  indeterminate: boolean;
  onChange: (checked: boolean) => void;
  label: string;
}) {
  const checkboxRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (checkboxRef.current) {
      checkboxRef.current.indeterminate = indeterminate;
    }
  }, [indeterminate]);

  return (
    <input
      ref={checkboxRef}
      type="checkbox"
      checked={checked}
      onChange={(e) => onChange(e.target.checked)}
      className={cn(
        'h-4 w-4 rounded border text-primary',
        'focus:ring-2 focus:ring-ring focus:ring-offset-2',
      )}
      aria-label={label}
    />
  );
}

// ============================================================================
// Loading Skeleton
// ============================================================================

function TableSkeleton({ columns, rows = 5 }: { columns: number; rows?: number }) {
  return (
    <>
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <tr key={rowIndex}>
          {Array.from({ length: columns }).map((_, colIndex) => (
            <td key={colIndex} className="px-4 py-3">
              <div className="h-4 bg-muted rounded animate-pulse" />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}

// ============================================================================
// Main Table Component
// ============================================================================

export function AccessibleTable<T>({
  columns,
  data,
  getRowId,
  caption,
  showCaption = false,
  selectable = false,
  selectedIds = new Set(),
  onSelectionChange,
  sortState,
  onSortChange,
  isLoading = false,
  emptyMessage = 'No data available',
  className,
  striped = false,
  hoverable = true,
  compact = false,
  stickyHeader = false,
}: AccessibleTableProps<T>) {
  const tableId = React.useId();

  // Calculate selection state
  const allSelected = data.length > 0 && data.every((row) => selectedIds.has(getRowId(row)));
  const someSelected = data.some((row) => selectedIds.has(getRowId(row)));

  // Handle select all
  const handleSelectAll = (checked: boolean) => {
    if (!onSelectionChange) return;

    if (checked) {
      const newSelected = new Set(selectedIds);
      for (const row of data) {
        newSelected.add(getRowId(row));
      }
      onSelectionChange(newSelected);
      announce(`All ${data.length} rows selected`);
    } else {
      const newSelected = new Set(selectedIds);
      for (const row of data) {
        newSelected.delete(getRowId(row));
      }
      onSelectionChange(newSelected);
      announce('All rows deselected');
    }
  };

  // Handle row selection
  const handleRowSelect = (rowId: string | number, checked: boolean) => {
    if (!onSelectionChange) return;

    const newSelected = new Set(selectedIds);
    if (checked) {
      newSelected.add(rowId);
    } else {
      newSelected.delete(rowId);
    }
    onSelectionChange(newSelected);
    announce(checked ? 'Row selected' : 'Row deselected');
  };

  // Handle sort
  const handleSort = (columnId: string) => {
    if (!onSortChange) return;

    const isCurrentColumn = sortState?.column === columnId;
    let newDirection: SortDirection;

    if (!isCurrentColumn) {
      newDirection = 'asc';
    } else if (sortState?.direction === 'asc') {
      newDirection = 'desc';
    } else {
      newDirection = null;
    }

    onSortChange({
      column: newDirection ? columnId : null,
      direction: newDirection,
    });

    // Announce sort change
    const column = columns.find((c) => c.id === columnId);
    if (newDirection) {
      announce(
        `Sorted by ${column?.header} ${newDirection === 'asc' ? 'ascending' : 'descending'}`,
      );
    } else {
      announce('Sort cleared');
    }
  };

  // Get cell value
  const getCellValue = (row: T, column: Column<T>): React.ReactNode => {
    if (typeof column.accessor === 'function') {
      return column.accessor(row);
    }
    return row[column.accessor] as React.ReactNode;
  };

  // Visible columns (respecting hideOnMobile) - reserved for responsive table feature
  const _visibleColumns = columns.filter((col) => !col.hideOnMobile);
  void _visibleColumns;

  return (
    <div className={cn('overflow-x-auto', className)}>
      <table
        id={tableId}
        aria-describedby={`${tableId}-caption`}
        className="w-full border-collapse text-sm"
      >
        <caption
          id={`${tableId}-caption`}
          className={cn(showCaption ? 'text-left mb-2 font-medium' : 'sr-only')}
        >
          {caption}
          {selectedIds.size > 0 && (
            <span className="ml-2 text-muted-foreground">({selectedIds.size} selected)</span>
          )}
        </caption>

        <thead
          className={cn('bg-muted/50 border-b', stickyHeader && 'sticky top-0 z-10 bg-background')}
        >
          <tr>
            {selectable && (
              <th scope="col" className="w-12 px-4 py-3">
                <SelectAllCheckbox
                  checked={allSelected}
                  indeterminate={someSelected && !allSelected}
                  onChange={handleSelectAll}
                  label={allSelected ? 'Deselect all rows' : 'Select all rows'}
                />
              </th>
            )}
            {columns.map((column) => {
              const isSorted = sortState?.column === column.id;
              const sortDirection = isSorted ? sortState?.direction : null;

              return (
                <th
                  key={column.id}
                  scope="col"
                  aria-sort={
                    isSorted ? (sortDirection === 'asc' ? 'ascending' : 'descending') : undefined
                  }
                  className={cn(
                    'px-4 font-medium text-left text-muted-foreground',
                    compact ? 'py-2' : 'py-3',
                    column.align === 'center' && 'text-center',
                    column.align === 'right' && 'text-right',
                    column.hideOnMobile && 'hidden md:table-cell',
                  )}
                  style={{ width: column.width }}
                >
                  {column.sortable && onSortChange ? (
                    <button
                      type="button"
                      onClick={() => handleSort(column.id)}
                      className={cn(
                        'inline-flex items-center gap-1 hover:text-foreground',
                        'focus-visible:outline-hidden focus-visible:ring-2',
                        'focus-visible:ring-ring focus-visible:rounded-sm',
                      )}
                      aria-label={`Sort by ${column.header}${
                        sortDirection
                          ? `, currently ${sortDirection === 'asc' ? 'ascending' : 'descending'}`
                          : ''
                      }`}
                    >
                      {column.header}
                      <SortIcon direction={sortDirection} />
                    </button>
                  ) : (
                    column.header
                  )}
                  {column.srDescription && <span className="sr-only">{column.srDescription}</span>}
                </th>
              );
            })}
          </tr>
        </thead>

        <tbody className="divide-y">
          {isLoading ? (
            <TableSkeleton columns={columns.length + (selectable ? 1 : 0)} rows={5} />
          ) : data.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length + (selectable ? 1 : 0)}
                className="px-4 py-8 text-center text-muted-foreground"
              >
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data.map((row, rowIndex) => {
              const rowId = getRowId(row);
              const isSelected = selectedIds.has(rowId);

              return (
                <tr
                  key={rowId}
                  aria-selected={selectable ? isSelected : undefined}
                  className={cn(
                    'transition-colors',
                    striped && rowIndex % 2 === 1 && 'bg-muted/50',
                    hoverable && 'hover:bg-muted/50',
                    isSelected && 'bg-primary/5',
                  )}
                >
                  {selectable && (
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={(e) => handleRowSelect(rowId, e.target.checked)}
                        className={cn(
                          'h-4 w-4 rounded border text-primary',
                          'focus:ring-2 focus:ring-ring focus:ring-offset-2',
                        )}
                        aria-label={`Select row ${rowIndex + 1}`}
                      />
                    </td>
                  )}
                  {columns.map((column) => (
                    <td
                      key={column.id}
                      className={cn(
                        'px-4',
                        compact ? 'py-2' : 'py-3',
                        column.align === 'center' && 'text-center',
                        column.align === 'right' && 'text-right',
                        column.hideOnMobile && 'hidden md:table-cell',
                      )}
                    >
                      {getCellValue(row, column)}
                    </td>
                  ))}
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}

// ============================================================================
// Pagination Component
// ============================================================================

export function TablePagination({
  currentPage,
  totalPages,
  totalItems,
  pageSize,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [10, 25, 50, 100],
  className,
}: PaginationProps) {
  const paginationId = React.useId();

  // Calculate visible range
  const startItem = (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalItems);

  // Generate page numbers to show
  const getPageNumbers = (): (number | 'ellipsis')[] => {
    const pages: (number | 'ellipsis')[] = [];
    const showPages = 5;

    if (totalPages <= showPages) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    // Always show first page
    pages.push(1);

    // Calculate range around current page
    let start = Math.max(2, currentPage - 1);
    let end = Math.min(totalPages - 1, currentPage + 1);

    // Adjust if near start or end
    if (currentPage <= 3) {
      end = 4;
    } else if (currentPage >= totalPages - 2) {
      start = totalPages - 3;
    }

    // Add ellipsis before range if needed
    if (start > 2) {
      pages.push('ellipsis');
    }

    // Add range
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    // Add ellipsis after range if needed
    if (end < totalPages - 1) {
      pages.push('ellipsis');
    }

    // Always show last page
    pages.push(totalPages);

    return pages;
  };

  const handlePageChange = (page: number) => {
    onPageChange(page);
    announce(`Page ${page} of ${totalPages}`);
  };

  return (
    <nav
      aria-label="Table pagination"
      className={cn('flex items-center justify-between gap-4 py-4', className)}
    >
      {/* Items info */}
      <div className="text-sm text-muted-foreground">
        Showing{' '}
        <span className="font-medium">
          {startItem}-{endItem}
        </span>{' '}
        of <span className="font-medium">{totalItems}</span> items
      </div>

      {/* Page size selector */}
      {onPageSizeChange && (
        <div className="flex items-center gap-2">
          <label htmlFor={`${paginationId}-pagesize`} className="text-sm text-muted-foreground">
            Rows per page:
          </label>
          <select
            id={`${paginationId}-pagesize`}
            value={pageSize}
            onChange={(e) => onPageSizeChange(Number(e.target.value))}
            className={cn(
              'h-8 rounded-md border bg-background px-2 text-sm',
              'focus:outline-hidden focus:ring-2 focus:ring-ring',
            )}
          >
            {pageSizeOptions.map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Page navigation */}
      <div className="flex items-center gap-1">
        {/* Previous button */}
        <button
          type="button"
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className={cn(
            'h-8 px-3 rounded-md text-sm',
            'border bg-background',
            'hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed',
            'focus:outline-hidden focus:ring-2 focus:ring-ring',
          )}
          aria-label="Go to previous page"
        >
          Previous
        </button>

        {/* Page numbers */}
        <ul className="hidden sm:flex items-center gap-1 list-none m-0 p-0">
          {getPageNumbers().map((page, index) =>
            page === 'ellipsis' ? (
              <li key={`ellipsis-${index}`} aria-hidden="true">
                <span className="px-2 text-muted-foreground">...</span>
              </li>
            ) : (
              <li key={page}>
                <button
                  type="button"
                  onClick={() => handlePageChange(page)}
                  aria-current={page === currentPage ? 'page' : undefined}
                  className={cn(
                    'h-8 min-w-[2rem] px-2 rounded-md text-sm',
                    'focus:outline-hidden focus:ring-2 focus:ring-ring',
                    page === currentPage ? 'bg-primary text-primary-foreground' : 'hover:bg-accent',
                  )}
                >
                  {page}
                </button>
              </li>
            ),
          )}
        </ul>

        {/* Mobile page indicator */}
        <span className="sm:hidden px-2 text-sm text-muted-foreground">
          Page {currentPage} of {totalPages}
        </span>

        {/* Next button */}
        <button
          type="button"
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className={cn(
            'h-8 px-3 rounded-md text-sm',
            'border bg-background',
            'hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed',
            'focus:outline-hidden focus:ring-2 focus:ring-ring',
          )}
          aria-label="Go to next page"
        >
          Next
        </button>
      </div>
    </nav>
  );
}

// ============================================================================
// Mobile Card View Component
// ============================================================================

export interface TableCardViewProps<T> {
  /** Column definitions */
  columns: Column<T>[];
  /** Table data */
  data: T[];
  /** Row key accessor */
  getRowId: (row: T) => string | number;
  /** Empty state message */
  emptyMessage?: string;
  /** Additional CSS classes */
  className?: string;
}

export function TableCardView<T>({
  columns,
  data,
  getRowId,
  emptyMessage = 'No data available',
  className,
}: TableCardViewProps<T>) {
  const getCellValue = (row: T, column: Column<T>): React.ReactNode => {
    if (typeof column.accessor === 'function') {
      return column.accessor(row);
    }
    return row[column.accessor] as React.ReactNode;
  };

  if (data.length === 0) {
    return <div className="py-8 text-center text-muted-foreground">{emptyMessage}</div>;
  }

  return (
    <ul className={cn('space-y-4 list-none p-0 m-0', className)}>
      {data.map((row) => (
        <li key={getRowId(row)} className="rounded-lg border p-4 space-y-2">
          {columns.map((column) => (
            <div key={column.id} className="flex justify-between gap-2">
              <span className="text-sm text-muted-foreground">{column.header}</span>
              <span className="text-sm font-medium text-right">{getCellValue(row, column)}</span>
            </div>
          ))}
        </li>
      ))}
    </ul>
  );
}

// ============================================================================
// Exports
// ============================================================================

export default AccessibleTable;
