'use client';

export const dynamic = 'force-dynamic';

import { Download, MoreVertical, Search, Shield, Upload, UserPlus } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

// Mock users data - TODO(LXD-301): Replace with Firestore queries
const usersData = [
  {
    id: '1',
    name: 'John Smith',
    email: 'john.smith@acme.com',
    role: 'learner',
    organization: 'Acme Corporation',
    status: 'active',
    lastLogin: '2024-01-15T10:30:00',
    createdAt: '2023-06-15',
  },
  {
    id: '2',
    name: 'Sarah Johnson',
    email: 'sarah.johnson@acme.com',
    role: 'instructor',
    organization: 'Acme Corporation',
    status: 'active',
    lastLogin: '2024-01-15T09:15:00',
    createdAt: '2023-05-20',
  },
  {
    id: '3',
    name: 'Mike Davis',
    email: 'mike.davis@globalind.com',
    role: 'admin',
    organization: 'Global Industries',
    status: 'active',
    lastLogin: '2024-01-14T16:45:00',
    createdAt: '2023-04-10',
  },
  {
    id: '4',
    name: 'Emily Brown',
    email: 'emily.brown@techstart.io',
    role: 'learner',
    organization: 'TechStart Inc',
    status: 'inactive',
    lastLogin: '2024-01-08T11:00:00',
    createdAt: '2023-08-22',
  },
  {
    id: '5',
    name: 'David Wilson',
    email: 'david.wilson@acme.com',
    role: 'learner',
    organization: 'Acme Corporation',
    status: 'pending',
    lastLogin: null,
    createdAt: '2024-01-14',
  },
];

/**
 * User Management page - View and manage all users
 */
export default function UsersManagementPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  const filteredUsers = usersData.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    const matchesStatus = statusFilter === 'all' || user.status === statusFilter;
    return matchesSearch && matchesRole && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-brand-primary">User Management</h1>
          <p className="text-muted-foreground mt-1">Manage users across all organizations</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="gap-2">
            <Upload className="w-4 h-4" aria-hidden="true" />
            Import
          </Button>
          <Button variant="outline" className="gap-2">
            <Download className="w-4 h-4" aria-hidden="true" />
            Export
          </Button>
          <Button className="gap-2 bg-lxd-purple hover:bg-lxd-purple/90">
            <UserPlus className="w-4 h-4" aria-hidden="true" />
            Add User
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card className="bg-lxd-dark-surface border-lxd-dark-border">
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
                placeholder="Search users..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-lxd-dark-bg border border-lxd-dark-border rounded-lg text-brand-primary placeholder-muted-foreground focus:outline-hidden focus:border-lxd-purple/50"
                aria-label="Search users"
              />
            </div>

            {/* Role filter */}
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="px-4 py-2 bg-lxd-dark-bg border border-lxd-dark-border rounded-lg text-brand-primary"
              aria-label="Filter by role"
            >
              <option value="all">All Roles</option>
              <option value="learner">Learner</option>
              <option value="instructor">Instructor</option>
              <option value="admin">Admin</option>
            </select>

            {/* Status filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 bg-lxd-dark-bg border border-lxd-dark-border rounded-lg text-brand-primary"
              aria-label="Filter by status"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="pending">Pending</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Results count */}
      <p className="text-sm text-muted-foreground">
        Showing {filteredUsers.length} of {usersData.length} users
      </p>

      {/* Users Table */}
      <Card className="bg-lxd-dark-surface border-lxd-dark-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-lxd-dark-border bg-lxd-dark-bg/50">
                <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">
                  User
                </th>
                <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">
                  Organization
                </th>
                <th className="text-center px-4 py-3 text-sm font-medium text-muted-foreground">
                  Role
                </th>
                <th className="text-center px-4 py-3 text-sm font-medium text-muted-foreground">
                  Status
                </th>
                <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">
                  Last Login
                </th>
                <th className="text-right px-4 py-3 text-sm font-medium text-muted-foreground">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <tr
                  key={user.id}
                  className="border-b border-lxd-dark-border/50 hover:bg-lxd-dark-bg/30"
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-lxd-purple/20 flex items-center justify-center text-lxd-purple font-medium">
                        {user.name
                          .split(' ')
                          .map((n) => n[0])
                          .join('')}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-brand-primary">{user.name}</p>
                        <p className="text-xs text-muted-foreground">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-sm text-brand-primary">{user.organization}</span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span
                      className={cn(
                        'inline-flex items-center gap-1 px-2 py-1 text-xs rounded-full capitalize',
                        user.role === 'admin' && 'bg-red-500/20 text-red-400',
                        user.role === 'instructor' && 'bg-blue-500/20 text-blue-400',
                        user.role === 'learner' && 'bg-gray-500/20 text-gray-400',
                      )}
                    >
                      {user.role === 'admin' && <Shield className="w-3 h-3" aria-hidden="true" />}
                      {user.role}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span
                      className={cn(
                        'px-2 py-1 text-xs rounded-full capitalize',
                        user.status === 'active' && 'bg-green-500/20 text-green-400',
                        user.status === 'inactive' && 'bg-gray-500/20 text-gray-400',
                        user.status === 'pending' && 'bg-yellow-500/20 text-yellow-400',
                      )}
                    >
                      {user.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-sm text-muted-foreground">
                      {user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'Never'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      type="button"
                      className="p-2 rounded-lg hover:bg-lxd-dark-border/50 transition-colors"
                      aria-label={`More options for ${user.name}`}
                    >
                      <MoreVertical className="w-4 h-4 text-muted-foreground" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
