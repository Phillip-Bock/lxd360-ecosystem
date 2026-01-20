'use client';

import { Search } from 'lucide-react';
import type { SortDirection, SortField } from '@/types/library';
import { SORT_OPTIONS } from '@/types/library';

interface LibraryToolbarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  sortField: SortField;
  sortDirection: SortDirection;
  onSortChange: (field: SortField, direction: SortDirection) => void;
  itemCount: number;
  selectedCount: number;
}

export function LibraryToolbar({
  searchQuery,
  onSearchChange,
  sortField,
  sortDirection,
  onSortChange,
  itemCount,
  selectedCount,
}: LibraryToolbarProps) {
  const currentSortKey = `${sortField}-${sortDirection}`;

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const [field, direction] = e.target.value.split('-') as [SortField, SortDirection];
    onSortChange(field, direction);
  };

  return (
    <div className="flex items-center justify-between gap-4 px-6 py-3 border-b border-gray-200 bg-white">
      {/* Search */}
      <div className="relative flex-1 max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
        <input
          type="text"
          placeholder="Search files and folders..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {/* Item Count */}
      <div className="text-sm text-gray-600">
        {selectedCount > 0 ? <span>{selectedCount} selected</span> : <span>{itemCount} items</span>}
      </div>

      {/* Sort */}
      <select
        value={currentSortKey}
        onChange={handleSortChange}
        className="px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 text-sm cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        {SORT_OPTIONS.map((option) => (
          <option
            key={`${option.field}-${option.direction}`}
            value={`${option.field}-${option.direction}`}
            className="bg-white"
          >
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}
