'use client';

export const dynamic = 'force-dynamic';

import { Building, MoreVertical, Plus, Search, Users } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

// Mock organizations data - TODO(LXD-301): Replace with Firestore queries
const organizationsData = [
  {
    id: 'org-1',
    name: 'Acme Corporation',
    slug: 'acme',
    plan: 'enterprise',
    userCount: 156,
    courseCount: 12,
    status: 'active',
    createdAt: '2023-06-15',
    adminEmail: 'admin@acme.com',
  },
  {
    id: 'org-2',
    name: 'Global Industries',
    slug: 'global-ind',
    plan: 'professional',
    userCount: 89,
    courseCount: 8,
    status: 'active',
    createdAt: '2023-07-20',
    adminEmail: 'admin@globalind.com',
  },
  {
    id: 'org-3',
    name: 'TechStart Inc',
    slug: 'techstart',
    plan: 'starter',
    userCount: 67,
    courseCount: 5,
    status: 'active',
    createdAt: '2023-08-10',
    adminEmail: 'admin@techstart.io',
  },
  {
    id: 'org-4',
    name: 'Healthcare Partners',
    slug: 'healthcare-partners',
    plan: 'enterprise',
    userCount: 234,
    courseCount: 18,
    status: 'active',
    createdAt: '2023-05-05',
    adminEmail: 'admin@healthcarepartners.org',
  },
  {
    id: 'org-5',
    name: 'Demo Organization',
    slug: 'demo',
    plan: 'trial',
    userCount: 5,
    courseCount: 2,
    status: 'trial',
    createdAt: '2024-01-10',
    adminEmail: 'demo@example.com',
  },
];

/**
 * Organizations Management page
 */
export default function OrganizationsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [planFilter, setPlanFilter] = useState('all');

  const filteredOrgs = organizationsData.filter((org) => {
    const matchesSearch =
      org.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      org.slug.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesPlan = planFilter === 'all' || org.plan === planFilter;
    return matchesSearch && matchesPlan;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-brand-primary">Organizations</h1>
          <p className="text-muted-foreground mt-1">Manage tenant organizations</p>
        </div>
        <Button className="gap-2 bg-lxd-purple hover:bg-lxd-purple/90">
          <Plus className="w-4 h-4" aria-hidden="true" />
          Add Organization
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground"
            aria-hidden="true"
          />
          <input
            type="search"
            placeholder="Search organizations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-lxd-dark-surface border border-lxd-dark-border rounded-lg text-brand-primary placeholder-muted-foreground focus:outline-hidden focus:border-lxd-purple/50"
            aria-label="Search organizations"
          />
        </div>
        <select
          value={planFilter}
          onChange={(e) => setPlanFilter(e.target.value)}
          className="px-4 py-2 bg-lxd-dark-surface border border-lxd-dark-border rounded-lg text-brand-primary"
          aria-label="Filter by plan"
        >
          <option value="all">All Plans</option>
          <option value="enterprise">Enterprise</option>
          <option value="professional">Professional</option>
          <option value="starter">Starter</option>
          <option value="trial">Trial</option>
        </select>
      </div>

      {/* Organizations Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredOrgs.map((org) => (
          <Card
            key={org.id}
            className="bg-lxd-dark-surface border-lxd-dark-border hover:border-lxd-purple/50 transition-colors"
          >
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-lg bg-lxd-purple/20 flex items-center justify-center">
                    <Building className="w-6 h-6 text-lxd-purple" aria-hidden="true" />
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-brand-primary">{org.name}</h3>
                    <p className="text-xs text-muted-foreground">/{org.slug}</p>
                  </div>
                </div>
                <button
                  type="button"
                  className="p-2 rounded-lg hover:bg-lxd-dark-border/50 transition-colors"
                  aria-label={`More options for ${org.name}`}
                >
                  <MoreVertical className="w-4 h-4 text-muted-foreground" />
                </button>
              </div>

              <div className="flex items-center gap-4 mb-4">
                <span
                  className={cn(
                    'px-2 py-1 text-xs rounded-full capitalize',
                    org.plan === 'enterprise' && 'bg-purple-500/20 text-purple-400',
                    org.plan === 'professional' && 'bg-blue-500/20 text-blue-400',
                    org.plan === 'starter' && 'bg-green-500/20 text-green-400',
                    org.plan === 'trial' && 'bg-yellow-500/20 text-yellow-400',
                  )}
                >
                  {org.plan}
                </span>
                <span
                  className={cn(
                    'px-2 py-1 text-xs rounded-full',
                    org.status === 'active'
                      ? 'bg-green-500/20 text-green-400'
                      : 'bg-yellow-500/20 text-yellow-400',
                  )}
                >
                  {org.status}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-muted-foreground" aria-hidden="true" />
                  <span className="text-sm text-brand-primary">{org.userCount} users</span>
                </div>
                <div className="flex items-center gap-2">
                  <Building className="w-4 h-4 text-muted-foreground" aria-hidden="true" />
                  <span className="text-sm text-brand-primary">{org.courseCount} courses</span>
                </div>
              </div>

              <div className="pt-4 border-t border-lxd-dark-border">
                <p className="text-xs text-muted-foreground">Admin: {org.adminEmail}</p>
                <p className="text-xs text-muted-foreground">
                  Created: {new Date(org.createdAt).toLocaleDateString()}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
