import { Calendar, Clock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export interface MaintenanceWindow {
  id: string;
  title: string;
  date: string;
  time: string;
  duration: string;
  affectedServices: string[];
  description: string;
}

const defaultMaintenance: MaintenanceWindow[] = [];

interface ScheduledMaintenanceProps {
  maintenance?: MaintenanceWindow[];
  onSubscribe?: (maintenanceId: string) => void;
}

export function ScheduledMaintenance({
  maintenance = defaultMaintenance,
  onSubscribe,
}: ScheduledMaintenanceProps) {
  if (maintenance.length === 0) {
    return null;
  }

  return (
    <section className="mb-12">
      <h2 className="mb-6 text-2xl font-semibold">Scheduled Maintenance</h2>
      <Card className="border-[var(--brand-primary)] bg-surface-card text-brand-primary">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-[var(--brand-primary)]">
            <Calendar className="h-6 w-6" />
            Upcoming Maintenance Windows
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {maintenance.map((item) => (
            <div key={item.id} className="space-y-3">
              <h3 className="text-lg font-semibold">{item.title}</h3>

              <div className="flex flex-col gap-2 text-sm text-brand-secondary sm:flex-row sm:gap-6">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-[var(--brand-primary)]" />
                  <span>{item.date}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-[var(--brand-primary)]" />
                  <span>{item.time}</span>
                </div>
              </div>

              <p className="text-sm text-brand-muted">{item.description}</p>

              <div>
                <div className="mb-2 text-sm font-medium text-brand-muted">Affected Services:</div>
                <div className="flex flex-wrap gap-2">
                  {item.affectedServices.map((service, serviceIdx) => (
                    <Badge key={serviceIdx} variant="secondary" className="bg-surface-page">
                      {service}
                    </Badge>
                  ))}
                </div>
              </div>

              <Button
                variant="outline"
                className="border-[var(--brand-primary)] text-[var(--brand-primary)] hover:bg-[var(--brand-primary)] hover:text-brand-primary bg-transparent"
                onClick={() => onSubscribe?.(item.id)}
              >
                Subscribe for Updates
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>
    </section>
  );
}
