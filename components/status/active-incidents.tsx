import { AlertTriangle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export interface IncidentUpdate {
  status: string;
  message: string;
  timestamp: string;
}

export interface ActiveIncident {
  id: string;
  title: string;
  status: 'investigating' | 'identified' | 'monitoring' | 'resolved';
  affectedServices: string[];
  updates: IncidentUpdate[];
  eta?: string;
}

interface ActiveIncidentsProps {
  incidents?: ActiveIncident[];
}

export function ActiveIncidents({ incidents = [] }: ActiveIncidentsProps) {
  if (incidents.length === 0) {
    return null;
  }

  const statusColors = {
    investigating: 'border-brand-error text-brand-error',
    identified: 'border-orange-500 text-orange-500',
    monitoring: 'border-brand-warning text-yellow-500',
    resolved: 'border-brand-success text-brand-success',
  };

  return (
    <section className="mb-12">
      <Card className="border-brand-warning bg-surface-card text-brand-primary">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-yellow-500">
            <AlertTriangle className="h-6 w-6" />
            Active Incidents
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {incidents.map((incident) => (
            <div key={incident.id} className="space-y-3">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <h3 className="font-semibold">{incident.title}</h3>
                <Badge variant="outline" className={statusColors[incident.status]}>
                  {incident.status}
                </Badge>
              </div>

              <div className="flex flex-wrap gap-2">
                {incident.affectedServices.map((service, serviceIdx) => (
                  <Badge key={serviceIdx} variant="secondary" className="bg-surface-page">
                    {service}
                  </Badge>
                ))}
              </div>

              <div className="space-y-2 border-l-2 border-brand-warning pl-4">
                {incident.updates.map((update, updateIdx) => (
                  <div key={updateIdx}>
                    <div className="text-sm font-medium">{update.status}</div>
                    <div className="text-sm text-brand-muted">{update.message}</div>
                    <div className="text-xs text-brand-muted">{update.timestamp}</div>
                  </div>
                ))}
              </div>

              {incident.eta && (
                <div className="text-sm text-brand-muted">Estimated resolution: {incident.eta}</div>
              )}
            </div>
          ))}
        </CardContent>
      </Card>
    </section>
  );
}
