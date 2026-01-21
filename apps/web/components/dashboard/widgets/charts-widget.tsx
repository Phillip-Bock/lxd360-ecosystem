'use client';

import { BarChart3 } from 'lucide-react';
import { cn } from '@/lib/utils';
import WidgetWrapper from './widget-wrapper';

interface StatCard {
  label: string;
  value: string;
  change: number;
  trend: 'up' | 'down' | 'neutral';
}

// Mock stats - replace with real analytics data
const mockStats: StatCard[] = [
  { label: 'Total Learners', value: '1,234', change: 12, trend: 'up' },
  { label: 'Courses Published', value: '8', change: 2, trend: 'up' },
  { label: 'Completion Rate', value: '78%', change: -3, trend: 'down' },
  { label: 'Avg. Score', value: '85%', change: 5, trend: 'up' },
];

// Mock chart data - simple bar chart representation
const mockChartData = [
  { month: 'Jul', value: 65 },
  { month: 'Aug', value: 80 },
  { month: 'Sep', value: 72 },
  { month: 'Oct', value: 90 },
  { month: 'Nov', value: 85 },
  { month: 'Dec', value: 95 },
];

export default function ChartsWidget() {
  const maxValue = Math.max(...mockChartData.map((d) => d.value));

  return (
    <WidgetWrapper
      title="Analytics"
      size={4}
      headerAction={
        <select className="text-xs border border-white/30 rounded px-2 py-1 bg-white/10 text-white">
          <option>Last 6 months</option>
          <option>Last 30 days</option>
          <option>Last 7 days</option>
        </select>
      }
    >
      <div className="flex gap-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 gap-3 w-64 shrink-0">
          {mockStats.map((stat) => (
            <div key={stat.label} className="p-3 bg-white/10 rounded-lg">
              <p className="text-xs text-white/70 mb-1">{stat.label}</p>
              <p className="text-xl font-semibold text-white">{stat.value}</p>
              <div className="flex items-center gap-1 mt-1">
                <span
                  className={cn(
                    'text-xs font-medium',
                    stat.trend === 'up' && 'text-green-400',
                    stat.trend === 'down' && 'text-red-400',
                    stat.trend === 'neutral' && 'text-white/50',
                  )}
                >
                  {stat.trend === 'up' && '+'}
                  {stat.change}%
                </span>
                <span className="text-xs text-white/50">vs last period</span>
              </div>
            </div>
          ))}
        </div>

        {/* Simple Bar Chart */}
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="w-4 h-4 text-white" />
            <span className="text-sm font-medium text-white">Learner Engagement</span>
          </div>
          <div className="flex items-end gap-4 h-32">
            {mockChartData.map((data) => (
              <div key={data.month} className="flex-1 flex flex-col items-center gap-2">
                <div
                  className="w-full bg-primary/20 rounded-t-sm relative group cursor-pointer hover:bg-primary/30 transition-colors"
                  style={{ height: `${(data.value / maxValue) * 100}%` }}
                >
                  <div
                    className="absolute bottom-0 left-0 right-0 bg-primary rounded-t-sm transition-all"
                    style={{ height: `${(data.value / maxValue) * 100}%` }}
                  />
                  <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                    {data.value}%
                  </div>
                </div>
                <span className="text-xs text-white">{data.month}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </WidgetWrapper>
  );
}
