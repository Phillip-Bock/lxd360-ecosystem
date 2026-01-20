'use client';

import { format } from 'date-fns';
import { Calendar, Search, X } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import * as React from 'react';
import type { DateRange } from 'react-day-picker';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

// ============================================================================
// TYPES
// ============================================================================

type UserRole = 'all' | 'admin' | 'author' | 'learner';
type UserStatus = 'all' | 'active' | 'suspended' | 'pending';
type UserPlan = 'all' | 'free' | 'professional' | 'enterprise';

interface FilterState {
  search: string;
  role: UserRole;
  status: UserStatus;
  plan: UserPlan;
  dateRange: DateRange | undefined;
}

// ============================================================================
// USER FILTERS COMPONENT
// ============================================================================

export function UserFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Initialize state from URL params
  const [filters, setFilters] = React.useState<FilterState>({
    search: searchParams.get('search') ?? '',
    role: (searchParams.get('role') as UserRole) ?? 'all',
    status: (searchParams.get('status') as UserStatus) ?? 'all',
    plan: (searchParams.get('plan') as UserPlan) ?? 'all',
    dateRange: undefined,
  });

  const [debouncedSearch, setDebouncedSearch] = React.useState(filters.search);

  // Debounce search input
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(filters.search);
    }, 300);
    return () => clearTimeout(timer);
  }, [filters.search]);

  // Update URL when filters change
  React.useEffect(() => {
    const params = new URLSearchParams();

    if (debouncedSearch) params.set('search', debouncedSearch);
    if (filters.role !== 'all') params.set('role', filters.role);
    if (filters.status !== 'all') params.set('status', filters.status);
    if (filters.plan !== 'all') params.set('plan', filters.plan);
    if (filters.dateRange?.from) {
      params.set('from', filters.dateRange.from.toISOString());
    }
    if (filters.dateRange?.to) {
      params.set('to', filters.dateRange.to.toISOString());
    }

    const queryString = params.toString();
    router.push(`/admin/users${queryString ? `?${queryString}` : ''}`);
  }, [debouncedSearch, filters.role, filters.status, filters.plan, filters.dateRange, router]);

  const updateFilter = <K extends keyof FilterState>(key: K, value: FilterState[K]) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      role: 'all',
      status: 'all',
      plan: 'all',
      dateRange: undefined,
    });
  };

  const activeFilterCount = [
    filters.role !== 'all',
    filters.status !== 'all',
    filters.plan !== 'all',
    filters.dateRange !== undefined,
  ].filter(Boolean).length;

  return (
    <div className="space-y-4">
      {/* Search and Main Filters Row */}
      <div className="flex flex-wrap gap-4">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px] max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by name or email..."
            value={filters.search}
            onChange={(e) => updateFilter('search', e.target.value)}
            className="pl-9"
          />
          {filters.search && (
            <button
              type="button"
              onClick={() => updateFilter('search', '')}
              className="absolute right-3 top-1/2 -translate-y-1/2"
            >
              <X className="h-4 w-4 text-muted-foreground hover:text-foreground" />
            </button>
          )}
        </div>

        {/* Role Filter */}
        <Select
          value={filters.role}
          onValueChange={(value: UserRole) => updateFilter('role', value)}
        >
          <SelectTrigger className="w-[130px]">
            <SelectValue placeholder="Role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Roles</SelectItem>
            <SelectItem value="admin">Admin</SelectItem>
            <SelectItem value="author">Author</SelectItem>
            <SelectItem value="learner">Learner</SelectItem>
          </SelectContent>
        </Select>

        {/* Status Filter */}
        <Select
          value={filters.status}
          onValueChange={(value: UserStatus) => updateFilter('status', value)}
        >
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="suspended">Suspended</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
          </SelectContent>
        </Select>

        {/* Plan Filter */}
        <Select
          value={filters.plan}
          onValueChange={(value: UserPlan) => updateFilter('plan', value)}
        >
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Plan" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Plans</SelectItem>
            <SelectItem value="free">Free</SelectItem>
            <SelectItem value="professional">Professional</SelectItem>
            <SelectItem value="enterprise">Enterprise</SelectItem>
          </SelectContent>
        </Select>

        {/* Date Range Filter */}
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="w-[200px] justify-start">
              <Calendar className="mr-2 h-4 w-4" />
              {filters.dateRange?.from ? (
                filters.dateRange.to ? (
                  <>
                    {format(filters.dateRange.from, 'LLL dd')} -{' '}
                    {format(filters.dateRange.to, 'LLL dd')}
                  </>
                ) : (
                  format(filters.dateRange.from, 'LLL dd, y')
                )
              ) : (
                <span className="text-muted-foreground">Join date</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <CalendarComponent
              initialFocus
              mode="range"
              defaultMonth={filters.dateRange?.from}
              selected={filters.dateRange}
              onSelect={(range) => updateFilter('dateRange', range)}
              numberOfMonths={2}
            />
          </PopoverContent>
        </Popover>

        {/* Clear Filters */}
        {activeFilterCount > 0 && (
          <Button variant="ghost" onClick={clearFilters}>
            <X className="mr-2 h-4 w-4" />
            Clear
            <Badge variant="secondary" className="ml-2">
              {activeFilterCount}
            </Badge>
          </Button>
        )}
      </div>

      {/* Active Filters Display */}
      {activeFilterCount > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm text-muted-foreground">Active filters:</span>

          {filters.role !== 'all' && (
            <Badge variant="secondary" className="capitalize">
              Role: {filters.role}
              <button type="button" onClick={() => updateFilter('role', 'all')} className="ml-1">
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}

          {filters.status !== 'all' && (
            <Badge variant="secondary" className="capitalize">
              Status: {filters.status}
              <button type="button" onClick={() => updateFilter('status', 'all')} className="ml-1">
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}

          {filters.plan !== 'all' && (
            <Badge variant="secondary" className="capitalize">
              Plan: {filters.plan}
              <button type="button" onClick={() => updateFilter('plan', 'all')} className="ml-1">
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}

          {filters.dateRange && (
            <Badge variant="secondary">
              Joined: {filters.dateRange.from && format(filters.dateRange.from, 'MMM d')}
              {filters.dateRange.to && ` - ${format(filters.dateRange.to, 'MMM d')}`}
              <button
                type="button"
                onClick={() => updateFilter('dateRange', undefined)}
                className="ml-1"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
        </div>
      )}
    </div>
  );
}
