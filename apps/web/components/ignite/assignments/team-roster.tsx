'use client';

import { Search, UserCircle } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

// ============================================================================
// TYPES
// ============================================================================

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  department?: string;
  coursesAssigned: number;
  coursesCompleted: number;
}

export interface TeamRosterProps {
  /** Team members (direct reports) */
  members: TeamMember[];
  /** Selected member IDs */
  selectedIds: Set<string>;
  /** Callback when selection changes */
  onSelectionChange: (selectedIds: Set<string>) => void;
  /** Loading state */
  isLoading?: boolean;
  /** Additional class names */
  className?: string;
}

// ============================================================================
// HELPERS
// ============================================================================

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

// ============================================================================
// COMPONENT
// ============================================================================

/**
 * TeamRoster - Displays team members for selection
 *
 * Features:
 * - Multi-select with checkboxes
 * - Search/filter functionality
 * - Select all option
 * - Shows assigned course counts
 */
export function TeamRoster({
  members,
  selectedIds,
  onSelectionChange,
  isLoading = false,
  className,
}: TeamRosterProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredMembers = useMemo(() => {
    if (!searchQuery.trim()) return members;
    const query = searchQuery.toLowerCase();
    return members.filter(
      (m) =>
        m.name.toLowerCase().includes(query) ||
        m.email.toLowerCase().includes(query) ||
        m.department?.toLowerCase().includes(query),
    );
  }, [members, searchQuery]);

  const toggleMember = (memberId: string) => {
    const next = new Set(selectedIds);
    if (next.has(memberId)) {
      next.delete(memberId);
    } else {
      next.add(memberId);
    }
    onSelectionChange(next);
  };

  const toggleAll = () => {
    if (selectedIds.size === filteredMembers.length) {
      onSelectionChange(new Set());
    } else {
      onSelectionChange(new Set(filteredMembers.map((m) => m.id)));
    }
  };

  const allSelected = filteredMembers.length > 0 && selectedIds.size === filteredMembers.length;
  const someSelected = selectedIds.size > 0 && selectedIds.size < filteredMembers.length;

  if (isLoading) {
    return (
      <Card className={cn('bg-card/60 backdrop-blur-sm', className)}>
        <CardHeader>
          <CardTitle>Team Members</CardTitle>
          <CardDescription>Loading team data...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 animate-pulse">
            <div className="h-10 bg-muted/30 rounded-lg" />
            <div className="h-48 bg-muted/30 rounded-lg" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn('bg-card/60 backdrop-blur-sm', className)}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <UserCircle className="h-5 w-5 text-[var(--color-lxd-primary)]" aria-hidden="true" />
              Team Members
            </CardTitle>
            <CardDescription>
              {selectedIds.size} of {members.length} selected
            </CardDescription>
          </div>
          <Badge variant={selectedIds.size > 0 ? 'default' : 'secondary'}>
            {selectedIds.size} selected
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        {/* Search */}
        <div className="relative mb-4">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"
            aria-hidden="true"
          />
          <Input
            placeholder="Search by name, email, or department..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
            aria-label="Search team members"
          />
        </div>

        {/* Select All */}
        <div className="flex items-center justify-between mb-3 p-2 bg-muted/30 rounded-lg">
          <button
            type="button"
            onClick={toggleAll}
            className="flex items-center gap-2 cursor-pointer"
          >
            <Checkbox
              checked={allSelected}
              ref={(el) => {
                if (el) {
                  // Handle indeterminate state
                  const input = el as unknown as HTMLInputElement;
                  if (input.indeterminate !== undefined) {
                    input.indeterminate = someSelected;
                  }
                }
              }}
              onCheckedChange={toggleAll}
              aria-label="Select all team members"
            />
            <span className="text-sm font-medium text-foreground">Select All</span>
          </button>
          <span className="text-sm text-muted-foreground">
            {filteredMembers.length} team member{filteredMembers.length !== 1 ? 's' : ''}
          </span>
        </div>

        {/* Member List */}
        <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2">
          {filteredMembers.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-8 text-muted-foreground">
              <UserCircle className="h-8 w-8" aria-hidden="true" />
              <p>No team members found</p>
              {searchQuery && <p className="text-sm">Try adjusting your search</p>}
            </div>
          ) : (
            filteredMembers.map((member) => (
              <button
                key={member.id}
                type="button"
                onClick={() => toggleMember(member.id)}
                className={cn(
                  'flex items-center gap-3 w-full p-3 rounded-lg border transition-colors text-left',
                  selectedIds.has(member.id)
                    ? 'border-[var(--color-lxd-primary)] bg-[var(--color-lxd-primary)]/5'
                    : 'border-border hover:border-border/80 hover:bg-muted/30',
                )}
              >
                <Checkbox
                  checked={selectedIds.has(member.id)}
                  onCheckedChange={() => toggleMember(member.id)}
                  aria-label={`Select ${member.name}`}
                />
                <Avatar className="h-9 w-9">
                  {member.avatarUrl && (
                    <AvatarImage src={member.avatarUrl} alt={`${member.name}'s avatar`} />
                  )}
                  <AvatarFallback className="bg-[var(--color-lxd-primary)]/10 text-[var(--color-lxd-primary)] text-sm">
                    {getInitials(member.name)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-foreground truncate">{member.name}</p>
                  <p className="text-xs text-muted-foreground truncate">{member.email}</p>
                  {member.department && (
                    <p className="text-xs text-muted-foreground/70">{member.department}</p>
                  )}
                </div>
                <div className="text-right">
                  <p className="text-sm tabular-nums text-muted-foreground">
                    {member.coursesCompleted}/{member.coursesAssigned}
                  </p>
                  <p className="text-xs text-muted-foreground">courses</p>
                </div>
              </button>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export default TeamRoster;
