'use client';

import { motion } from 'framer-motion';
import { AlertTriangle, CheckCircle2, ShieldAlert, ShieldCheck, XCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import type { ComplianceStatus } from './types';

export interface ComplianceWidgetProps {
  /** Compliance status data */
  complianceData: ComplianceStatus[];
  /** Loading state */
  isLoading?: boolean;
  /** Additional class names */
  className?: string;
}

const statusConfig = {
  compliant: {
    icon: CheckCircle2,
    label: 'Compliant',
    badgeVariant: 'success' as const,
    bgColor: 'bg-emerald-500/10',
    borderColor: 'border-emerald-500/30',
    textColor: 'text-emerald-500',
  },
  at_risk: {
    icon: AlertTriangle,
    label: 'At Risk',
    badgeVariant: 'warning' as const,
    bgColor: 'bg-amber-500/10',
    borderColor: 'border-amber-500/30',
    textColor: 'text-amber-500',
  },
  non_compliant: {
    icon: XCircle,
    label: 'Non-Compliant',
    badgeVariant: 'destructive' as const,
    bgColor: 'bg-red-500/10',
    borderColor: 'border-red-500/30',
    textColor: 'text-red-500',
  },
};

function ComplianceStatusItem({
  item,
  index,
}: {
  item: ComplianceStatus;
  index: number;
}) {
  const config = statusConfig[item.status];
  const StatusIcon = config.icon;
  const completionPercent = item.required > 0 ? Math.round((item.completed / item.required) * 100) : 0;

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3, delay: index * 0.1 }}
      className={cn(
        'flex items-center justify-between p-4 rounded-lg border',
        config.bgColor,
        config.borderColor
      )}
    >
      <div className="flex items-center gap-3">
        <div
          className={cn(
            'flex h-10 w-10 items-center justify-center rounded-lg',
            config.bgColor
          )}
        >
          <StatusIcon className={cn('h-5 w-5', config.textColor)} aria-hidden="true" />
        </div>
        <div>
          <p className="font-medium text-foreground">{item.category}</p>
          <p className="text-sm text-muted-foreground">
            {item.completed} of {item.required} completed ({completionPercent}%)
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {item.dueDate && (
          <span className="text-xs text-muted-foreground">
            Due: {item.dueDate.toLocaleDateString()}
          </span>
        )}
        <Badge variant={config.badgeVariant}>{config.label}</Badge>
      </div>
    </motion.div>
  );
}

function ComplianceSummary({ data }: { data: ComplianceStatus[] }) {
  const counts = {
    compliant: data.filter((d) => d.status === 'compliant').length,
    at_risk: data.filter((d) => d.status === 'at_risk').length,
    non_compliant: data.filter((d) => d.status === 'non_compliant').length,
  };

  const total = data.length;
  const overallHealth = total > 0 ? Math.round((counts.compliant / total) * 100) : 0;

  return (
    <div className="flex items-center justify-between p-4 rounded-lg bg-muted/30 border border-border/50 mb-4">
      <div className="flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-lxd-primary/10 border border-lxd-primary/20">
          {overallHealth >= 80 ? (
            <ShieldCheck className="h-6 w-6 text-emerald-500" aria-hidden="true" />
          ) : (
            <ShieldAlert className="h-6 w-6 text-amber-500" aria-hidden="true" />
          )}
        </div>
        <div>
          <p className="text-2xl font-bold text-foreground">{overallHealth}%</p>
          <p className="text-sm text-muted-foreground">Overall Compliance</p>
        </div>
      </div>

      <div className="flex gap-6">
        <div className="text-center">
          <p className="text-lg font-semibold text-emerald-500">{counts.compliant}</p>
          <p className="text-xs text-muted-foreground">Compliant</p>
        </div>
        <div className="text-center">
          <p className="text-lg font-semibold text-amber-500">{counts.at_risk}</p>
          <p className="text-xs text-muted-foreground">At Risk</p>
        </div>
        <div className="text-center">
          <p className="text-lg font-semibold text-red-500">{counts.non_compliant}</p>
          <p className="text-xs text-muted-foreground">Non-Compliant</p>
        </div>
      </div>
    </div>
  );
}

/**
 * ComplianceWidget - Red/Yellow/Green compliance status display
 *
 * Shows compliance categories with status indicators:
 * - Green (Compliant): All requirements met
 * - Yellow (At Risk): Approaching deadline or partial completion
 * - Red (Non-Compliant): Requirements not met
 */
export function ComplianceWidget({
  complianceData,
  isLoading = false,
  className,
}: ComplianceWidgetProps) {
  if (isLoading) {
    return (
      <Card className={cn('bg-card/60 backdrop-blur-sm', className)}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-lxd-primary" aria-hidden="true" />
            Compliance Status
          </CardTitle>
          <CardDescription>Team compliance overview</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 animate-pulse">
            <div className="h-20 bg-muted/30 rounded-lg" />
            <div className="h-16 bg-muted/30 rounded-lg" />
            <div className="h-16 bg-muted/30 rounded-lg" />
            <div className="h-16 bg-muted/30 rounded-lg" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn('bg-card/60 backdrop-blur-sm', className)}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ShieldCheck className="h-5 w-5 text-lxd-primary" aria-hidden="true" />
          Compliance Status
        </CardTitle>
        <CardDescription>Team compliance overview by category</CardDescription>
      </CardHeader>
      <CardContent>
        {complianceData.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-6">
            No compliance data available
          </p>
        ) : (
          <>
            <ComplianceSummary data={complianceData} />
            <div className="space-y-3">
              {complianceData.map((item, index) => (
                <ComplianceStatusItem key={item.category} item={item} index={index} />
              ))}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}

export default ComplianceWidget;
