'use client';

export const dynamic = 'force-dynamic';

import { Building, CreditCard, Palette, Settings, Users } from 'lucide-react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/lib/firebase/useAuth';

const orgAdminSections = [
  {
    title: 'Users',
    description: 'Manage organization members and roles',
    href: '/03-lxd360-inspire-ignite/manage/organization-admin/users',
    icon: Users,
  },
  {
    title: 'Branding',
    description: 'Customize your organization appearance',
    href: '/03-lxd360-inspire-ignite/manage/organization-admin/branding',
    icon: Palette,
  },
  {
    title: 'Billing',
    description: 'Manage subscription and payments',
    href: '/03-lxd360-inspire-ignite/manage/organization-admin/billing',
    icon: CreditCard,
  },
  {
    title: 'Settings',
    description: 'Configure organization settings',
    href: '/03-lxd360-inspire-ignite/manage/organization-admin/settings',
    icon: Settings,
  },
];

/**
 * Organization Admin Dashboard
 * Landing page for org_admin users to manage their organization
 */
export default function OrganizationAdminPage() {
  const { profile } = useAuth();
  const orgName = profile?.tenantId ?? 'Your Organization';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="h-12 w-12 rounded-lg bg-lxd-purple/20 flex items-center justify-center">
          <Building className="h-6 w-6 text-lxd-purple" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-brand-primary">Organization Admin</h1>
          <p className="text-muted-foreground">{orgName}</p>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-lxd-dark-surface border-lxd-dark-border">
          <CardContent className="p-4">
            <p className="text-2xl font-bold text-brand-primary">—</p>
            <p className="text-sm text-muted-foreground">Total Members</p>
          </CardContent>
        </Card>
        <Card className="bg-lxd-dark-surface border-lxd-dark-border">
          <CardContent className="p-4">
            <p className="text-2xl font-bold text-brand-primary">—</p>
            <p className="text-sm text-muted-foreground">Active Courses</p>
          </CardContent>
        </Card>
        <Card className="bg-lxd-dark-surface border-lxd-dark-border">
          <CardContent className="p-4">
            <p className="text-2xl font-bold text-brand-primary">—</p>
            <p className="text-sm text-muted-foreground">Completions</p>
          </CardContent>
        </Card>
        <Card className="bg-lxd-dark-surface border-lxd-dark-border">
          <CardContent className="p-4">
            <p className="text-2xl font-bold text-brand-primary">Active</p>
            <p className="text-sm text-muted-foreground">Subscription</p>
          </CardContent>
        </Card>
      </div>

      {/* Admin Sections */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {orgAdminSections.map((section) => (
          <Link key={section.href} href={section.href}>
            <Card className="bg-lxd-dark-surface border-lxd-dark-border hover:border-lxd-purple/50 transition-colors h-full">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-lxd-purple/10 flex items-center justify-center">
                    <section.icon className="h-5 w-5 text-lxd-purple" />
                  </div>
                  <div>
                    <CardTitle className="text-brand-primary">{section.title}</CardTitle>
                    <CardDescription>{section.description}</CardDescription>
                  </div>
                </div>
              </CardHeader>
            </Card>
          </Link>
        ))}
      </div>

      {/* Recent Activity */}
      <Card className="bg-lxd-dark-surface border-lxd-dark-border">
        <CardHeader>
          <CardTitle className="text-brand-primary">Recent Activity</CardTitle>
          <CardDescription>Latest organization events</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm text-center py-8">
            Activity tracking coming soon
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
