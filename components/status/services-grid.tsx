'use client';

import {
  Brain,
  ChevronRight,
  Database,
  GraduationCap,
  Mail,
  Network,
  Plug,
  Shield,
  Wand2,
} from 'lucide-react';
import type React from 'react';
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export type ServiceStatus = 'operational' | 'degraded' | 'outage';

export interface Service {
  name: string;
  status: ServiceStatus;
}

export interface ServiceCategory {
  title: string;
  icon: React.ReactNode;
  services: Service[];
}

const defaultServices: ServiceCategory[] = [
  {
    title: 'LXP360 Learning Platform',
    icon: <GraduationCap className="h-5 w-5" />,
    services: [
      { name: 'Course Delivery', status: 'operational' },
      { name: 'Assessment Engine', status: 'operational' },
      { name: 'Progress Tracking', status: 'operational' },
      { name: 'Certificates & Badges', status: 'operational' },
    ],
  },
  {
    title: 'INSPIRE Studio',
    icon: <Wand2 className="h-5 w-5" />,
    services: [
      { name: 'Authoring Tools', status: 'operational' },
      { name: 'Media Processing', status: 'operational' },
      { name: 'AI Content Generation', status: 'operational' },
      { name: 'Publishing Pipeline', status: 'operational' },
    ],
  },
  {
    title: 'LXD Ecosystem',
    icon: <Network className="h-5 w-5" />,
    services: [
      { name: 'API Gateway', status: 'operational' },
      { name: 'Integrations Hub', status: 'operational' },
      { name: 'Webhook Delivery', status: 'operational' },
      { name: 'Data Sync', status: 'operational' },
    ],
  },
  {
    title: 'Authentication & Security',
    icon: <Shield className="h-5 w-5" />,
    services: [
      { name: 'User Authentication', status: 'operational' },
      { name: 'SSO / SAML', status: 'operational' },
      { name: 'Role-Based Access', status: 'operational' },
      { name: 'Session Management', status: 'operational' },
    ],
  },
  {
    title: 'Data & Storage',
    icon: <Database className="h-5 w-5" />,
    services: [
      { name: 'Database (Firestore)', status: 'operational' },
      { name: 'File Storage', status: 'operational' },
      { name: 'Media CDN', status: 'operational' },
      { name: 'Backup Systems', status: 'operational' },
    ],
  },
  {
    title: 'AI Services',
    icon: <Brain className="h-5 w-5" />,
    services: [
      { name: 'Neuro-naut AI Mentor', status: 'operational' },
      { name: 'Content Generation', status: 'operational' },
      { name: 'Adaptive Learning Engine', status: 'operational' },
      { name: 'Analytics AI', status: 'operational' },
    ],
  },
  {
    title: 'Communication',
    icon: <Mail className="h-5 w-5" />,
    services: [
      { name: 'Email Delivery (Brevo)', status: 'operational' },
      { name: 'In-App Notifications', status: 'operational' },
      { name: 'Webhook Notifications', status: 'operational' },
    ],
  },
  {
    title: 'External Integrations',
    icon: <Plug className="h-5 w-5" />,
    services: [
      { name: 'Payment Processing (Stripe)', status: 'operational' },
      { name: 'Calendar Sync', status: 'operational' },
      { name: 'LTI Connections', status: 'operational' },
      { name: 'xAPI/LRS', status: 'operational' },
    ],
  },
];

function StatusIndicator({ status }: { status: ServiceStatus }) {
  const colors = {
    operational: 'bg-brand-success',
    degraded: 'bg-brand-warning',
    outage: 'bg-brand-error',
  };

  return (
    <div
      className={`h-2 w-2 rounded-full ${colors[status]} ${status === 'operational' ? 'animate-pulse' : ''}`}
    />
  );
}

interface ServicesGridProps {
  services?: ServiceCategory[];
}

export function ServicesGrid({ services = defaultServices }: ServicesGridProps) {
  const [expandedCard, setExpandedCard] = useState<number | null>(null);

  return (
    <section className="mb-12">
      <h2 className="mb-6 text-2xl font-semibold">Core Services</h2>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {services.map((category, idx) => (
          <Card
            key={idx}
            className="cursor-pointer border-brand-default bg-surface-card text-brand-primary transition-all hover:border-[var(--brand-primary)]"
            onClick={() => setExpandedCard(expandedCard === idx ? null : idx)}
          >
            <CardHeader>
              <CardTitle className="flex items-center justify-between text-base">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--brand-primary)]/20 text-[var(--brand-primary)]">
                    {category.icon}
                  </div>
                  <span>{category.title}</span>
                </div>
                <ChevronRight
                  className={`h-5 w-5 text-brand-muted transition-transform ${expandedCard === idx ? 'rotate-90' : ''}`}
                />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {category.services.map((service, serviceIdx) => (
                  <div
                    key={serviceIdx}
                    className={`flex items-center justify-between transition-all ${
                      expandedCard === idx ? 'opacity-100' : 'opacity-0 h-0 overflow-hidden'
                    }`}
                  >
                    <span className="text-sm text-brand-secondary">{service.name}</span>
                    <StatusIndicator status={service.status} />
                  </div>
                ))}
                {expandedCard !== idx && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-brand-muted">
                      {category.services.length} services
                    </span>
                    <StatusIndicator status="operational" />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}
