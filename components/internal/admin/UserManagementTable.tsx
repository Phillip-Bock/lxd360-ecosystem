'use client';

import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  Download,
  Edit,
  Mail,
  MoreHorizontal,
  Shield,
  Trash2,
  UserCheck,
  UserX,
} from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import * as React from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { cn } from '@/lib/core/utils';

// ============================================================================
// TYPES
// ============================================================================

interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string | null;
  role: 'admin' | 'author' | 'learner';
  status: 'active' | 'suspended' | 'pending';
  plan: 'free' | 'professional' | 'enterprise';
  lastActive: Date;
  createdAt: Date;
}

type SortField = 'name' | 'email' | 'role' | 'status' | 'plan' | 'lastActive';
type SortOrder = 'asc' | 'desc';

// ============================================================================
// MOCK DATA
// ============================================================================

const mockUsers: User[] = [
  {
    id: '1',
    name: 'John Doe',
    email: 'john@example.com',
    avatar: null,
    role: 'admin',
    status: 'active',
    plan: 'enterprise',
    lastActive: new Date(Date.now() - 5 * 60 * 1000),
    createdAt: new Date('2024-01-15'),
  },
  {
    id: '2',
    name: 'Jane Smith',
    email: 'jane@example.com',
    avatar: null,
    role: 'author',
    status: 'active',
    plan: 'professional',
    lastActive: new Date(Date.now() - 60 * 60 * 1000),
    createdAt: new Date('2024-02-20'),
  },
  {
    id: '3',
    name: 'Bob Wilson',
    email: 'bob@example.com',
    avatar: null,
    role: 'learner',
    status: 'suspended',
    plan: 'free',
    lastActive: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    createdAt: new Date('2024-03-10'),
  },
  {
    id: '4',
    name: 'Alice Johnson',
    email: 'alice@example.com',
    avatar: null,
    role: 'learner',
    status: 'pending',
    plan: 'professional',
    lastActive: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    createdAt: new Date('2024-04-05'),
  },
  {
    id: '5',
    name: 'Charlie Brown',
    email: 'charlie@example.com',
    avatar: null,
    role: 'author',
    status: 'active',
    plan: 'enterprise',
    lastActive: new Date(Date.now() - 30 * 60 * 1000),
    createdAt: new Date('2024-05-12'),
  },
  // Add more mock users for pagination demo
  ...Array.from({ length: 20 }, (_, i) => ({
    id: `${i + 6}`,
    name: `User ${i + 6}`,
    email: `user${i + 6}@example.com`,
    avatar: null,
    role: ['admin', 'author', 'learner'][i % 3] as User['role'],
    status: ['active', 'suspended', 'pending'][i % 3] as User['status'],
    plan: ['free', 'professional', 'enterprise'][i % 3] as User['plan'],
    lastActive: new Date(Date.now() - i * 24 * 60 * 60 * 1000),
    createdAt: new Date(Date.now() - (i + 30) * 24 * 60 * 60 * 1000),
  })),
];

// ============================================================================
// HELPERS
// ============================================================================

function formatLastActive(date: Date): string {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / 60000);

  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return date.toLocaleDateString();
}

function getStatusBadge(status: User['status']) {
  switch (status) {
    case 'active':
      return {
        label: 'Active',
        className: 'bg-brand-success/10 text-green-600 dark:text-brand-success',
      };
    case 'suspended':
      return {
        label: 'Suspended',
        className: 'bg-brand-error/10 text-red-600 dark:text-brand-error',
      };
    case 'pending':
      return {
        label: 'Pending',
        className: 'bg-brand-warning/10 text-yellow-600 dark:text-brand-warning',
      };
  }
}

function getRoleBadge(role: User['role']) {
  switch (role) {
    case 'admin':
      return {
        label: 'Admin',
        className: 'bg-brand-secondary/10 text-purple-600 dark:text-brand-purple',
      };
    case 'author':
      return {
        label: 'Author',
        className: 'bg-brand-primary/10 text-brand-blue dark:text-brand-cyan',
      };
    case 'learner':
      return { label: 'Learner', className: 'bg-muted text-muted-foreground' };
  }
}

function getPlanBadge(plan: User['plan']) {
  switch (plan) {
    case 'free':
      return { label: 'Free', className: 'bg-muted text-muted-foreground' };
    case 'professional':
      return {
        label: 'Pro',
        className: 'bg-brand-primary/10 text-brand-blue dark:text-brand-cyan',
      };
    case 'enterprise':
      return {
        label: 'Enterprise',
        className: 'bg-brand-warning/10 text-amber-600 dark:text-brand-warning',
      };
  }
}

// ============================================================================
// USER MANAGEMENT TABLE COMPONENT
// ============================================================================

export function UserManagementTable() {
  const searchParams = useSearchParams();

  // State
  const [users, setUsers] = React.useState<User[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [selectedIds, setSelectedIds] = React.useState<Set<string>>(new Set());
  const [sortField, setSortField] = React.useState<SortField>('name');
  const [sortOrder, setSortOrder] = React.useState<SortOrder>('asc');
  const [currentPage, setCurrentPage] = React.useState(1);
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
  const [userToDelete, setUserToDelete] = React.useState<User | null>(null);

  const pageSize = 10;

  // Fetch users
  React.useEffect(() => {
    const fetchUsers = async () => {
      setIsLoading(true);
      // In production, fetch from /api/admin/users with params
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Apply filters from search params
      let filteredUsers = [...mockUsers];

      const search = searchParams.get('search')?.toLowerCase();
      const role = searchParams.get('role');
      const status = searchParams.get('status');
      const plan = searchParams.get('plan');

      if (search) {
        filteredUsers = filteredUsers.filter(
          (u) => u.name.toLowerCase().includes(search) || u.email.toLowerCase().includes(search),
        );
      }

      if (role && role !== 'all') {
        filteredUsers = filteredUsers.filter((u) => u.role === role);
      }

      if (status && status !== 'all') {
        filteredUsers = filteredUsers.filter((u) => u.status === status);
      }

      if (plan && plan !== 'all') {
        filteredUsers = filteredUsers.filter((u) => u.plan === plan);
      }

      setUsers(filteredUsers);
      setIsLoading(false);
      setCurrentPage(1);
    };

    fetchUsers();
  }, [searchParams]);

  // Sort users
  const sortedUsers = React.useMemo(() => {
    return [...users].sort((a, b) => {
      let comparison = 0;
      switch (sortField) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'email':
          comparison = a.email.localeCompare(b.email);
          break;
        case 'role':
          comparison = a.role.localeCompare(b.role);
          break;
        case 'status':
          comparison = a.status.localeCompare(b.status);
          break;
        case 'plan':
          comparison = a.plan.localeCompare(b.plan);
          break;
        case 'lastActive':
          comparison = b.lastActive.getTime() - a.lastActive.getTime();
          break;
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });
  }, [users, sortField, sortOrder]);

  // Paginated users
  const paginatedUsers = React.useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return sortedUsers.slice(start, start + pageSize);
  }, [sortedUsers, currentPage]);

  const totalPages = Math.ceil(sortedUsers.length / pageSize);

  // Selection handlers
  const toggleAll = () => {
    if (selectedIds.size === paginatedUsers.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(paginatedUsers.map((u) => u.id)));
    }
  };

  const toggleUser = (id: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  // Sort handler
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) {
      return <ArrowUpDown className="ml-2 h-4 w-4" />;
    }
    return sortOrder === 'asc' ? (
      <ArrowUp className="ml-2 h-4 w-4" />
    ) : (
      <ArrowDown className="ml-2 h-4 w-4" />
    );
  };

  // Action handlers
  const handleDelete = async () => {
    if (!userToDelete) return;
    // In production, call DELETE /api/admin/users/:id
    setUsers((prev) => prev.filter((u) => u.id !== userToDelete.id));
    setUserToDelete(null);
    setDeleteDialogOpen(false);
  };

  const handleStatusChange = async (userId: string, newStatus: User['status']) => {
    // In production, call PATCH /api/admin/users/:id
    setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, status: newStatus } : u)));
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center py-10">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-base font-medium">Users ({sortedUsers.length})</CardTitle>
          <div className="flex items-center gap-2">
            {selectedIds.size > 0 && <Badge variant="secondary">{selectedIds.size} selected</Badge>}
            <Button variant="outline" size="sm">
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    <Checkbox
                      checked={
                        paginatedUsers.length > 0 && selectedIds.size === paginatedUsers.length
                      }
                      onCheckedChange={toggleAll}
                    />
                  </TableHead>
                  <TableHead>
                    <button
                      type="button"
                      onClick={() => handleSort('name')}
                      className="flex items-center hover:text-foreground"
                    >
                      User
                      <SortIcon field="name" />
                    </button>
                  </TableHead>
                  <TableHead>
                    <button
                      type="button"
                      onClick={() => handleSort('role')}
                      className="flex items-center hover:text-foreground"
                    >
                      Role
                      <SortIcon field="role" />
                    </button>
                  </TableHead>
                  <TableHead>
                    <button
                      type="button"
                      onClick={() => handleSort('status')}
                      className="flex items-center hover:text-foreground"
                    >
                      Status
                      <SortIcon field="status" />
                    </button>
                  </TableHead>
                  <TableHead>
                    <button
                      type="button"
                      onClick={() => handleSort('plan')}
                      className="flex items-center hover:text-foreground"
                    >
                      Plan
                      <SortIcon field="plan" />
                    </button>
                  </TableHead>
                  <TableHead>
                    <button
                      type="button"
                      onClick={() => handleSort('lastActive')}
                      className="flex items-center hover:text-foreground"
                    >
                      Last Active
                      <SortIcon field="lastActive" />
                    </button>
                  </TableHead>
                  <TableHead className="w-12" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedUsers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="py-10 text-center">
                      <p className="text-muted-foreground">No users found</p>
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedUsers.map((user) => {
                    const statusBadge = getStatusBadge(user.status);
                    const roleBadge = getRoleBadge(user.role);
                    const planBadge = getPlanBadge(user.plan);

                    return (
                      <TableRow key={user.id}>
                        <TableCell>
                          <Checkbox
                            checked={selectedIds.has(user.id)}
                            onCheckedChange={() => toggleUser(user.id)}
                          />
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={user.avatar ?? undefined} />
                              <AvatarFallback>
                                {user.name
                                  .split(' ')
                                  .map((n) => n[0])
                                  .join('')
                                  .toUpperCase()
                                  .slice(0, 2)}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium">{user.name}</p>
                              <p className="text-sm text-muted-foreground">{user.email}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={cn('text-xs', roleBadge.className)}>
                            {roleBadge.label}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={cn('text-xs', statusBadge.className)}>
                            {statusBadge.label}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={cn('text-xs', planBadge.className)}>
                            {planBadge.label}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {formatLastActive(user.lastActive)}
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuItem>
                                <Edit className="mr-2 h-4 w-4" />
                                Edit User
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Shield className="mr-2 h-4 w-4" />
                                Change Role
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Mail className="mr-2 h-4 w-4" />
                                Send Email
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              {user.status === 'active' ? (
                                <DropdownMenuItem
                                  onClick={() => handleStatusChange(user.id, 'suspended')}
                                >
                                  <UserX className="mr-2 h-4 w-4" />
                                  Suspend User
                                </DropdownMenuItem>
                              ) : (
                                <DropdownMenuItem
                                  onClick={() => handleStatusChange(user.id, 'active')}
                                >
                                  <UserCheck className="mr-2 h-4 w-4" />
                                  Activate User
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                className="text-destructive"
                                onClick={() => {
                                  setUserToDelete(user);
                                  setDeleteDialogOpen(true);
                                }}
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete User
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between border-t px-4 py-3">
              <p className="text-sm text-muted-foreground">
                Showing {(currentPage - 1) * pageSize + 1} to{' '}
                {Math.min(currentPage * pageSize, sortedUsers.length)} of {sortedUsers.length} users
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-sm">
                  Page {currentPage} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete User</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {userToDelete?.name}? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
