'use client';

import { ChevronDown } from 'lucide-react';
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export interface HistoricalIncident {
  id: string;
  title: string;
  date: string;
  duration: string;
  affectedServices: string[];
  status: 'Resolved' | 'Investigating';
  summary: string;
  resolution: string;
}

const defaultIncidents: HistoricalIncident[] = [
  {
    id: '1',
    title: 'Brief API Gateway Latency',
    date: 'December 10, 2025',
    duration: '23 minutes',
    affectedServices: ['API Gateway', 'Integrations Hub'],
    status: 'Resolved',
    summary: 'Increased latency on API requests due to traffic spike.',
    resolution: 'Scaled infrastructure and optimized caching.',
  },
  {
    id: '2',
    title: 'Email Delivery Delays',
    date: 'November 28, 2025',
    duration: '1 hour 15 minutes',
    affectedServices: ['Email Delivery (Brevo)'],
    status: 'Resolved',
    summary: 'Delays in email delivery due to third-party provider issues.',
    resolution: 'Provider resolved the issue. All delayed emails were delivered.',
  },
];

interface IncidentHistoryProps {
  incidents?: HistoricalIncident[];
  title?: string;
}

export function IncidentHistory({
  incidents = defaultIncidents,
  title = 'Incident History',
}: IncidentHistoryProps) {
  const [expandedIncident, setExpandedIncident] = useState<string | null>(null);

  return (
    <section className="mb-12">
      <h2 className="mb-6 text-2xl font-semibold">{title}</h2>
      <Card className="border-brand-default bg-surface-card text-brand-primary">
        <CardHeader>
          <CardTitle className="text-base font-normal text-brand-muted">Last 30 days</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {incidents.length === 0 ? (
            <div className="py-8 text-center text-brand-muted">
              No incidents reported in the last 30 days
            </div>
          ) : (
            incidents.map((incident) => (
              <button
                type="button"
                key={incident.id}
                className="w-full text-left cursor-pointer rounded-lg border border-brand-default p-4 transition-all hover:border-[var(--brand-primary)]"
                onClick={() =>
                  setExpandedIncident(expandedIncident === incident.id ? null : incident.id)
                }
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="mb-2 flex items-center gap-3">
                      <h3 className="font-semibold">{incident.title}</h3>
                      <Badge variant="outline" className="border-brand-success text-brand-success">
                        {incident.status}
                      </Badge>
                    </div>
                    <div className="text-sm text-brand-muted">
                      {incident.date} • Duration: {incident.duration}
                    </div>
                  </div>
                  <ChevronDown
                    className={`h-5 w-5 text-brand-muted transition-transform ${
                      expandedIncident === incident.id ? 'rotate-180' : ''
                    }`}
                  />
                </div>

                {expandedIncident === incident.id && (
                  <div className="mt-4 space-y-3 border-t border-brand-default pt-4">
                    <div>
                      <div className="mb-1 text-sm font-medium">Summary</div>
                      <div className="text-sm text-brand-muted">{incident.summary}</div>
                    </div>
                    <div>
                      <div className="mb-1 text-sm font-medium">Resolution</div>
                      <div className="text-sm text-brand-muted">{incident.resolution}</div>
                    </div>
                    <div>
                      <div className="mb-2 text-sm font-medium">Affected Services</div>
                      <div className="flex flex-wrap gap-2">
                        {incident.affectedServices.map((service, serviceIdx) => (
                          <Badge key={serviceIdx} variant="secondary" className="bg-surface-page">
                            {service}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </button>
            ))
          )}
        </CardContent>
      </Card>
    </section>
  );
}
