import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'System Status | LXD360',
  description: 'Current system status and maintenance schedule for LXD360 services.',
};

const services = [
  { name: 'INSPIRE Studio', status: 'operational', uptime: '99.9%' },
  { name: 'INSPIRE Ignite', status: 'operational', uptime: '99.9%' },
  { name: 'LRS (Learning Record Store)', status: 'operational', uptime: '99.8%' },
  { name: 'AI Services', status: 'operational', uptime: '99.7%' },
  { name: 'Authentication', status: 'operational', uptime: '99.99%' },
  { name: 'API Gateway', status: 'operational', uptime: '99.9%' },
];

const incidents: { date: string; title: string; status: string; description: string }[] = [];

export default function StatusPage() {
  return (
    <div className="min-h-screen py-16 px-4">
      <div className="container mx-auto max-w-4xl">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-lxd-text-dark dark:text-lxd-text-light mb-4">
            System Status
          </h1>
          <p className="text-xl text-lxd-text-dark/70 dark:text-lxd-text-light/70">
            Current operational status of LXD360 services.
          </p>
        </div>

        {/* Overall Status */}
        <div className="bg-green-500/10 dark:bg-green-500/20 rounded-2xl p-8 mb-8 border border-green-500/20 text-center">
          <div className="flex items-center justify-center gap-3 mb-2">
            <div className="w-4 h-4 rounded-full bg-green-500 animate-pulse" />
            <h2 className="text-2xl font-bold text-green-700 dark:text-green-400">
              All Systems Operational
            </h2>
          </div>
          <p className="text-green-600/80 dark:text-green-400/80">
            Last checked: {new Date().toLocaleString()}
          </p>
        </div>

        {/* Service Status */}
        <div className="bg-lxd-light-card dark:bg-lxd-dark-surface rounded-2xl border border-lxd-light-border dark:border-lxd-dark-border overflow-hidden mb-8">
          <div className="p-4 border-b border-lxd-light-border dark:border-lxd-dark-border">
            <h3 className="text-lg font-semibold text-lxd-text-dark dark:text-lxd-text-light">
              Service Status
            </h3>
          </div>
          <div className="divide-y divide-lxd-light-border dark:divide-lxd-dark-border">
            {services.map((service) => (
              <div key={service.name} className="flex items-center justify-between p-4">
                <div className="flex items-center gap-3">
                  <div className={`w-2.5 h-2.5 rounded-full ${
                    service.status === 'operational' ? 'bg-green-500' :
                    service.status === 'degraded' ? 'bg-yellow-500' :
                    'bg-red-500'
                  }`} />
                  <span className="font-medium text-lxd-text-dark dark:text-lxd-text-light">
                    {service.name}
                  </span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-sm text-lxd-text-dark/60 dark:text-lxd-text-light/60">
                    {service.uptime} uptime
                  </span>
                  <span className={`text-sm font-medium capitalize ${
                    service.status === 'operational' ? 'text-green-600 dark:text-green-400' :
                    service.status === 'degraded' ? 'text-yellow-600 dark:text-yellow-400' :
                    'text-red-600 dark:text-red-400'
                  }`}>
                    {service.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Incidents */}
        <div className="bg-lxd-light-card dark:bg-lxd-dark-surface rounded-2xl border border-lxd-light-border dark:border-lxd-dark-border overflow-hidden mb-8">
          <div className="p-4 border-b border-lxd-light-border dark:border-lxd-dark-border">
            <h3 className="text-lg font-semibold text-lxd-text-dark dark:text-lxd-text-light">
              Recent Incidents
            </h3>
          </div>
          <div className="p-4">
            {incidents.length === 0 ? (
              <p className="text-lxd-text-dark/60 dark:text-lxd-text-light/60 text-center py-8">
                No recent incidents. All systems running smoothly.
              </p>
            ) : (
              <div className="space-y-4">
                {incidents.map((incident, index) => (
                  <div key={index} className="border-l-4 border-yellow-500 pl-4">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm text-lxd-text-dark/60 dark:text-lxd-text-light/60">
                        {incident.date}
                      </span>
                      <span className="text-xs px-2 py-0.5 bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 rounded">
                        {incident.status}
                      </span>
                    </div>
                    <h4 className="font-medium text-lxd-text-dark dark:text-lxd-text-light">
                      {incident.title}
                    </h4>
                    <p className="text-sm text-lxd-text-dark/60 dark:text-lxd-text-light/60">
                      {incident.description}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Links */}
        <div className="flex flex-wrap gap-4 justify-center">
          <Link
            href="/faq"
            className="px-6 py-3 bg-lxd-light-surface dark:bg-lxd-dark-page text-lxd-text-dark dark:text-lxd-text-light rounded-lg font-medium hover:bg-lxd-blue hover:text-white transition-colors"
          >
            View FAQ
          </Link>
          <Link
            href="/contact"
            className="px-6 py-3 bg-lxd-blue hover:bg-lxd-blue-dark text-white rounded-lg font-medium transition-colors"
          >
            Report an Issue
          </Link>
        </div>
      </div>
    </div>
  );
}
