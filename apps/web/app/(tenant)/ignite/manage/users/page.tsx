'use client';

export const dynamic = 'force-dynamic';

import {
  AlertCircle,
  BookOpen,
  Check,
  ChevronDown,
  Download,
  Loader2,
  Mail,
  MoreVertical,
  RefreshCw,
  Search,
  Shield,
  Upload,
  UserPlus,
} from 'lucide-react';
import Image from 'next/image';
import { useCallback, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

/** Team member type from API */
interface TeamMember {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  persona: string;
  status: 'active' | 'inactive' | 'pending';
  coursesAssigned: number;
  coursesCompleted: number;
  completionRate: number;
  lastActive: string | null;
  overdueCount: number;
  createdAt: string;
}

/** API response shape */
interface UsersResponse {
  users: TeamMember[];
  total: number;
  page: number;
  pageSize: number;
}

/** Get Firebase ID token for API authentication */
async function getIdToken(): Promise<string> {
  const { getAuth } = await import('firebase/auth');
  const auth = getAuth();
  const user = auth.currentUser;
  if (!user) throw new Error('Not authenticated');
  return user.getIdToken();
}

/**
 * User Management page - View and manage team members
 *
 * Features:
 * - Real Firestore data integration
 * - Filter by status (Active, Inactive, Pending)
 * - Search by name or email
 * - Sort by name, progress, last activity
 * - Bulk actions: Assign courses, Send reminders
 */
export default function UsersManagementPage() {
  // Data state
  const [users, setUsers] = useState<TeamMember[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filter/sort state
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState<'name' | 'progress' | 'lastActive'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  // Selection state for bulk actions
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isBulkActionLoading, setIsBulkActionLoading] = useState(false);

  // Fetch users from API
  const fetchUsers = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const token = await getIdToken();
      const params = new URLSearchParams({
        status: statusFilter,
        search: searchQuery,
        sortBy,
        sortOrder,
      });

      const response = await fetch(`/api/ignite/manager/users?${params}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to fetch users');
      }

      const data: UsersResponse = await response.json();
      setUsers(data.users);
      setTotal(data.total);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  }, [statusFilter, searchQuery, sortBy, sortOrder]);

  // Fetch on mount and when filters change
  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      fetchUsers();
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [fetchUsers]);

  // Handle select all
  const handleSelectAll = () => {
    if (selectedIds.size === users.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(users.map((u) => u.id)));
    }
  };

  // Handle individual selection
  const handleSelect = (userId: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(userId)) {
      newSelected.delete(userId);
    } else {
      newSelected.add(userId);
    }
    setSelectedIds(newSelected);
  };

  // Handle bulk action
  const handleBulkAction = async (action: 'assign_courses' | 'send_reminder') => {
    if (selectedIds.size === 0) return;

    setIsBulkActionLoading(true);

    try {
      const token = await getIdToken();
      const response = await fetch('/api/ignite/manager/users', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action,
          userIds: Array.from(selectedIds),
          data: action === 'assign_courses' ? { courseIds: [] } : undefined,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to perform action');
      }

      // Clear selection and refresh
      setSelectedIds(new Set());
      await fetchUsers();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Bulk action failed');
    } finally {
      setIsBulkActionLoading(false);
    }
  };

  // Export to CSV
  const handleExport = () => {
    const headers = [
      'Name',
      'Email',
      'Status',
      'Courses Assigned',
      'Completed',
      'Completion Rate',
      'Last Active',
    ];
    const rows = users.map((user) => [
      user.name,
      user.email,
      user.status,
      user.coursesAssigned.toString(),
      user.coursesCompleted.toString(),
      `${user.completionRate}%`,
      user.lastActive ? new Date(user.lastActive).toLocaleDateString() : 'Never',
    ]);

    const csv = [headers, ...rows]
      .map((row) => row.map((cell) => `"${cell}"`).join(','))
      .join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `team-members-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Handle sort change
  const handleSortChange = (field: 'name' | 'progress' | 'lastActive') => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  // Format date for display
  const formatDate = (dateString: string | null): string => {
    if (!dateString) return 'Never';
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Team Management</h1>
          <p className="text-muted-foreground mt-1">Manage your team members and assignments</p>
        </div>
        <div className="flex items-center gap-2">
          <Button type="button" variant="outline" className="gap-2">
            <Upload className="w-4 h-4" aria-hidden="true" />
            Import
          </Button>
          <Button type="button" variant="outline" className="gap-2" onClick={handleExport}>
            <Download className="w-4 h-4" aria-hidden="true" />
            Export
          </Button>
          <Button
            type="button"
            className="gap-2 bg-[var(--color-lxd-primary)] hover:bg-[var(--color-lxd-primary)]/90"
          >
            <UserPlus className="w-4 h-4" aria-hidden="true" />
            Add Member
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card className="bg-card/60 backdrop-blur-sm border-border">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="relative flex-1">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground"
                aria-hidden="true"
              />
              <input
                type="search"
                placeholder="Search by name or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-background border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-[var(--color-lxd-primary)]/50 focus:border-[var(--color-lxd-primary)]"
                aria-label="Search team members"
              />
            </div>

            {/* Status filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-[var(--color-lxd-primary)]/50"
              aria-label="Filter by status"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="pending">Pending</option>
            </select>

            {/* Sort dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button type="button" variant="outline" className="gap-2">
                  Sort:{' '}
                  {sortBy === 'name' ? 'Name' : sortBy === 'progress' ? 'Progress' : 'Last Active'}
                  <ChevronDown className="w-4 h-4" aria-hidden="true" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => handleSortChange('name')}>
                  Name {sortBy === 'name' && (sortOrder === 'asc' ? '↑' : '↓')}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleSortChange('progress')}>
                  Progress {sortBy === 'progress' && (sortOrder === 'asc' ? '↑' : '↓')}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleSortChange('lastActive')}>
                  Last Active {sortBy === 'lastActive' && (sortOrder === 'asc' ? '↑' : '↓')}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={fetchUsers}
              disabled={isLoading}
            >
              <RefreshCw
                className={cn('w-4 h-4', isLoading && 'animate-spin')}
                aria-hidden="true"
              />
              <span className="sr-only">Refresh</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Bulk Actions */}
      {selectedIds.size > 0 && (
        <Card className="bg-[var(--color-lxd-primary)]/5 border-[var(--color-lxd-primary)]/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-foreground">
                {selectedIds.size} member{selectedIds.size > 1 ? 's' : ''} selected
              </p>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="gap-2"
                  onClick={() => handleBulkAction('assign_courses')}
                  disabled={isBulkActionLoading}
                >
                  <BookOpen className="w-4 h-4" aria-hidden="true" />
                  Assign Courses
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="gap-2"
                  onClick={() => handleBulkAction('send_reminder')}
                  disabled={isBulkActionLoading}
                >
                  <Mail className="w-4 h-4" aria-hidden="true" />
                  Send Reminder
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedIds(new Set())}
                >
                  Clear
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Results count */}
      <p className="text-sm text-muted-foreground">
        Showing {users.length} of {total} team members
      </p>

      {/* Error state */}
      {error && (
        <Card className="bg-[var(--color-lxd-error)]/10 border-[var(--color-lxd-error)]/20">
          <CardContent className="p-4 flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-[var(--color-lxd-error)]" aria-hidden="true" />
            <p className="text-sm text-[var(--color-lxd-error)]">{error}</p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={fetchUsers}
              className="ml-auto"
            >
              Retry
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Loading state */}
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <Loader2
            className="w-8 h-8 animate-spin text-[var(--color-lxd-primary)]"
            aria-hidden="true"
          />
        </div>
      )}

      {/* Users Table */}
      {!isLoading && users.length > 0 && (
        <Card className="bg-card/60 backdrop-blur-sm border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="w-12 px-4 py-3">
                    <Checkbox
                      checked={selectedIds.size === users.length && users.length > 0}
                      onCheckedChange={handleSelectAll}
                      aria-label="Select all"
                    />
                  </th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">
                    Member
                  </th>
                  <th className="text-center px-4 py-3 text-sm font-medium text-muted-foreground">
                    Status
                  </th>
                  <th className="text-center px-4 py-3 text-sm font-medium text-muted-foreground">
                    Progress
                  </th>
                  <th className="text-center px-4 py-3 text-sm font-medium text-muted-foreground">
                    Overdue
                  </th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">
                    Last Active
                  </th>
                  <th className="text-right px-4 py-3 text-sm font-medium text-muted-foreground">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr
                    key={user.id}
                    className={cn(
                      'border-b border-border/50 hover:bg-muted/20 transition-colors',
                      selectedIds.has(user.id) && 'bg-[var(--color-lxd-primary)]/5',
                    )}
                  >
                    <td className="px-4 py-3">
                      <Checkbox
                        checked={selectedIds.has(user.id)}
                        onCheckedChange={() => handleSelect(user.id)}
                        aria-label={`Select ${user.name}`}
                      />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="relative w-10 h-10 rounded-full bg-[var(--color-lxd-primary)]/20 flex items-center justify-center text-[var(--color-lxd-primary)] font-medium overflow-hidden">
                          {user.avatarUrl ? (
                            <Image
                              src={user.avatarUrl}
                              alt={`${user.name} avatar`}
                              fill
                              className="object-cover"
                            />
                          ) : (
                            user.name
                              .split(' ')
                              .map((n) => n[0])
                              .join('')
                              .slice(0, 2)
                              .toUpperCase()
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-foreground">{user.name}</p>
                          <p className="text-xs text-muted-foreground">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span
                        className={cn(
                          'inline-flex items-center gap-1 px-2 py-1 text-xs rounded-full capitalize',
                          user.status === 'active' &&
                            'bg-[var(--color-lxd-success)]/20 text-[var(--color-lxd-success)]',
                          user.status === 'inactive' && 'bg-muted text-muted-foreground',
                          user.status === 'pending' &&
                            'bg-[var(--color-lxd-caution)]/20 text-[var(--color-lxd-caution)]',
                        )}
                      >
                        {user.status === 'active' && (
                          <Check className="w-3 h-3" aria-hidden="true" />
                        )}
                        {user.status === 'pending' && (
                          <Shield className="w-3 h-3" aria-hidden="true" />
                        )}
                        {user.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex flex-col items-center">
                        <span className="text-sm font-medium text-foreground">
                          {user.completionRate}%
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {user.coursesCompleted}/{user.coursesAssigned} courses
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center">
                      {user.overdueCount > 0 ? (
                        <span className="inline-flex items-center px-2 py-1 text-xs rounded-full bg-[var(--color-lxd-error)]/20 text-[var(--color-lxd-error)]">
                          {user.overdueCount} overdue
                        </span>
                      ) : (
                        <span className="text-sm text-muted-foreground">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm text-muted-foreground">
                        {formatDate(user.lastActive)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button type="button" variant="ghost" size="icon">
                            <MoreVertical className="w-4 h-4" aria-hidden="true" />
                            <span className="sr-only">Actions for {user.name}</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>View Profile</DropdownMenuItem>
                          <DropdownMenuItem>Assign Courses</DropdownMenuItem>
                          <DropdownMenuItem>Send Reminder</DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-[var(--color-lxd-error)]">
                            Remove from Team
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Empty state */}
      {!isLoading && users.length === 0 && !error && (
        <Card className="bg-card/60 backdrop-blur-sm border-border">
          <CardContent className="py-12 text-center">
            <div className="w-16 h-16 rounded-full bg-muted mx-auto mb-4 flex items-center justify-center">
              <UserPlus className="w-8 h-8 text-muted-foreground" aria-hidden="true" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">No team members found</h3>
            <p className="text-muted-foreground mb-4">
              {searchQuery || statusFilter !== 'all'
                ? 'Try adjusting your filters'
                : 'Add your first team member to get started'}
            </p>
            <Button
              type="button"
              className="gap-2 bg-[var(--color-lxd-primary)] hover:bg-[var(--color-lxd-primary)]/90"
            >
              <UserPlus className="w-4 h-4" aria-hidden="true" />
              Add Member
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
