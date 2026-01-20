'use client';

import { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface DayData {
  date: string;
  status: 'operational' | 'degraded' | 'outage';
}

interface ServiceUptimeData {
  name: string;
  days: DayData[];
}

function generateDefaultUptimeData(): DayData[] {
  const data: DayData[] = [];
  const today = new Date();

  for (let i = 89; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);

    // 99.97% uptime means ~1 day of issues in 90 days
    const status = Math.random() > 0.997 ? 'degraded' : 'operational';

    data.push({
      date: date.toISOString().split('T')[0],
      status,
    });
  }

  return data;
}

const defaultServices = [
  'LXP360 Learning Platform',
  'INSPIRE Studio',
  'LXD Ecosystem',
  'Authentication & Security',
  'Data & Storage',
  'AI Services',
  'Communication',
  'External Integrations',
];

interface UptimeHistoryProps {
  servicesData?: ServiceUptimeData[];
}

export function UptimeHistory({ servicesData }: UptimeHistoryProps) {
  const [hoveredDay, setHoveredDay] = useState<{ date: string; status: string } | null>(null);

  // Generate default data if not provided
  const services = useMemo(() => {
    if (servicesData) return servicesData;
    return defaultServices.map((name) => ({
      name,
      days: generateDefaultUptimeData(),
    }));
  }, [servicesData]);

  const statusColors = {
    operational: 'bg-brand-success',
    degraded: 'bg-brand-warning',
    outage: 'bg-brand-error',
  };

  return (
    <section className="mb-12">
      <h2 className="mb-6 text-2xl font-semibold">90-Day Uptime History</h2>
      <Card className="border-brand-default bg-surface-card text-brand-primary">
        <CardHeader>
          <CardTitle className="text-base font-normal text-brand-muted">
            Last 90 days • Hover over unknown day for details
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {services.map((service, idx) => (
              <div key={idx}>
                <div className="mb-2 text-sm font-medium">{service.name}</div>
                <div className="flex gap-1">
                  {service.days.map((day, dayIdx) => (
                    <div
                      key={dayIdx}
                      role="presentation"
                      className={`h-10 flex-1 rounded-sm ${statusColors[day.status]} cursor-pointer transition-opacity hover:opacity-80`}
                      onMouseEnter={() =>
                        setHoveredDay({
                          date: new Date(day.date).toLocaleDateString(),
                          status: day.status,
                        })
                      }
                      onMouseLeave={() => setHoveredDay(null)}
                      title={`${new Date(day.date).toLocaleDateString()}: ${day.status}`}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>

          {hoveredDay && (
            <div className="mt-6 rounded-lg bg-surface-page p-4 text-sm">
              <div className="font-medium">{hoveredDay.date}</div>
              <div className="capitalize text-brand-muted">{hoveredDay.status}</div>
            </div>
          )}

          <div className="mt-6 flex items-center gap-6 text-sm">
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-sm bg-brand-success" />
              <span className="text-brand-muted">Operational</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-sm bg-brand-warning" />
              <span className="text-brand-muted">Degraded</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-sm bg-brand-error" />
              <span className="text-brand-muted">Outage</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
