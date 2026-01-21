'use client';

export const dynamic = 'force-dynamic';

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

/**
 * Learners management page - View and manage enrolled learners
 */
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-brand-primary">Learners</h1>
          <p className="text-muted-foreground mt-1">Manage and monitor your learners</p>
        </div>
        <Button className="gap-2 bg-lxd-purple hover:bg-lxd-purple/90">
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
            className="w-full pl-10 pr-4 py-2 bg-lxd-dark-surface border border-lxd-dark-border rounded-lg text-brand-primary placeholder-muted-foreground focus:outline-hidden focus:border-lxd-purple/50"
            aria-label="Search learners"
          />
        </div>

        {/* Status filter */}
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2 bg-lxd-dark-surface border border-lxd-dark-border rounded-lg text-brand-primary"
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
            className="bg-lxd-dark-surface border-lxd-dark-border hover:border-lxd-purple/50 transition-colors"
          >
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                {/* Avatar */}
                <div className="w-12 h-12 rounded-full bg-lxd-purple/20 flex items-center justify-center text-lxd-purple font-medium">
                  {learner.name
                    .split(' ')
                    .map((n) => n[0])
                    .join('')}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-medium text-brand-primary truncate">
                      {learner.name}
                    </h3>
                    <span
                      className={cn(
                        'px-2 py-0.5 text-xs rounded-full',
                        learner.status === 'active' && 'bg-green-500/20 text-green-400',
                        learner.status === 'at_risk' && 'bg-red-500/20 text-red-400',
                        learner.status === 'inactive' && 'bg-gray-500/20 text-gray-400',
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
                    <p className="text-sm font-medium text-brand-primary">
                      {learner.completedCourses}/{learner.enrolledCourses}
                    </p>
                    <p className="text-xs text-muted-foreground">Courses</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-brand-primary">{learner.avgProgress}%</p>
                    <p className="text-xs text-muted-foreground">Progress</p>
                  </div>
                  <div>
                    <p className="text-sm text-brand-primary">
                      {new Date(learner.lastActive).toLocaleDateString()}
                    </p>
                    <p className="text-xs text-muted-foreground">Last Active</p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    className="p-2 rounded-lg hover:bg-lxd-dark-border/50 transition-colors"
                    aria-label={`Send email to ${learner.name}`}
                  >
                    <Mail className="w-4 h-4 text-muted-foreground" />
                  </button>
                  <button
                    type="button"
                    className="p-2 rounded-lg hover:bg-lxd-dark-border/50 transition-colors"
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
