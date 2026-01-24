'use client';

import { Mail, MoreVertical, Search, UserPlus } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

// Mock learners data - TODO: Replace with Firestore queries
const learnersData = [
  {
    id: '1',
    name: 'John Smith',
    email: 'john.smith@example.com',
    avatar: null,
    enrolledCourses: 3,
    completedCourses: 1,
    avgProgress: 65,
    lastActive: '2024-01-15T10:30:00',
    status: 'active',
  },
  {
    id: '2',
    name: 'Sarah Johnson',
    email: 'sarah.johnson@example.com',
    avatar: null,
    enrolledCourses: 2,
    completedCourses: 2,
    avgProgress: 100,
    lastActive: '2024-01-15T09:15:00',
    status: 'active',
  },
  {
    id: '3',
    name: 'Mike Davis',
    email: 'mike.davis@example.com',
    avatar: null,
    enrolledCourses: 4,
    completedCourses: 1,
    avgProgress: 35,
    lastActive: '2024-01-10T16:45:00',
    status: 'at_risk',
  },
  {
    id: '4',
    name: 'Emily Brown',
    email: 'emily.brown@example.com',
    avatar: null,
    enrolledCourses: 2,
    completedCourses: 0,
    avgProgress: 50,
    lastActive: '2024-01-14T14:20:00',
    status: 'active',
  },
  {
    id: '5',
    name: 'David Wilson',
    email: 'david.wilson@example.com',
    avatar: null,
    enrolledCourses: 1,
    completedCourses: 0,
    avgProgress: 20,
    lastActive: '2024-01-08T11:00:00',
    status: 'inactive',
  },
];

export default function LearnersPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const filteredLearners = learnersData.filter((learner) => {
    const matchesSearch =
      learner.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      learner.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || learner.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Learners</h1>
          <p className="text-muted-foreground mt-1">Manage and monitor your learners</p>
        </div>
        <Button className="gap-2 bg-[var(--color-lxd-primary)] hover:bg-[var(--color-lxd-primary)]/90">
          <UserPlus className="w-4 h-4" aria-hidden="true" />
          Invite Learners
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Search */}
        <div className="relative flex-1">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground"
            aria-hidden="true"
          />
          <input
            type="search"
            placeholder="Search learners..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-card border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:border-[var(--color-lxd-primary)]/50"
            aria-label="Search learners"
          />
        </div>

        {/* Status filter */}
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2 bg-card border border-border rounded-lg text-foreground"
          aria-label="Filter by status"
        >
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="at_risk">At Risk</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>

      {/* Results count */}
      <p className="text-sm text-muted-foreground">
        Showing {filteredLearners.length} of {learnersData.length} learners
      </p>

      {/* Learners List */}
      <div className="space-y-3">
        {filteredLearners.map((learner) => (
          <Card
            key={learner.id}
            className="bg-card/80 backdrop-blur-sm border-border/50 hover:border-[var(--color-lxd-primary)]/50 transition-colors"
          >
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                {/* Avatar */}
                <div className="w-12 h-12 rounded-full bg-[var(--color-lxd-primary)]/20 flex items-center justify-center text-[var(--color-lxd-primary)] font-medium">
                  {learner.name
                    .split(' ')
                    .map((n) => n[0])
                    .join('')}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-medium text-foreground truncate">{learner.name}</h3>
                    <span
                      className={cn(
                        'px-2 py-0.5 text-xs rounded-full',
                        learner.status === 'active' &&
                          'bg-[var(--color-lxd-success)]/20 text-[var(--color-lxd-success)]',
                        learner.status === 'at_risk' &&
                          'bg-[var(--color-lxd-error)]/20 text-[var(--color-lxd-error)]',
                        learner.status === 'inactive' && 'bg-muted text-muted-foreground',
                      )}
                    >
                      {learner.status.replace('_', ' ')}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground truncate">{learner.email}</p>
                </div>

                {/* Stats */}
                <div className="hidden md:flex items-center gap-8 text-center">
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      {learner.completedCourses}/{learner.enrolledCourses}
                    </p>
                    <p className="text-xs text-muted-foreground">Courses</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">{learner.avgProgress}%</p>
                    <p className="text-xs text-muted-foreground">Progress</p>
                  </div>
                  <div>
                    <p className="text-sm text-foreground">
                      {new Date(learner.lastActive).toLocaleDateString()}
                    </p>
                    <p className="text-xs text-muted-foreground">Last Active</p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    className="p-2 rounded-lg hover:bg-muted transition-colors"
                    aria-label={`Send email to ${learner.name}`}
                  >
                    <Mail className="w-4 h-4 text-muted-foreground" />
                  </button>
                  <button
                    type="button"
                    className="p-2 rounded-lg hover:bg-muted transition-colors"
                    aria-label={`More options for ${learner.name}`}
                  >
                    <MoreVertical className="w-4 h-4 text-muted-foreground" />
                  </button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
