'use client';

import { useEffect, useState } from 'react';
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

interface DataPoint {
  time: string;
  active: number;
  completions: number;
}

function generateInitialData(): DataPoint[] {
  return Array.from({ length: 20 }, (_, i) => ({
    time: new Date(Date.now() - (20 - i) * 3000).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    }),
    active: Math.floor(Math.random() * 200) + 400,
    completions: Math.floor(Math.random() * 50) + 20,
  }));
}

interface RealtimeChartProps {
  isLive?: boolean;
  updateInterval?: number;
}

export function RealtimeChart({ isLive = true, updateInterval = 3000 }: RealtimeChartProps) {
  const [data, setData] = useState<DataPoint[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setData(generateInitialData());
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!isLive || !mounted) return;

    const interval = setInterval(() => {
      setData((prev) => {
        const newData = [...prev.slice(1)];
        newData.push({
          time: new Date().toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false,
          }),
          active: Math.floor(Math.random() * 200) + 400,
          completions: Math.floor(Math.random() * 50) + 20,
        });
        return newData;
      });
    }, updateInterval);

    return () => clearInterval(interval);
  }, [isLive, updateInterval, mounted]);

  if (!mounted) {
    return (
      <div className="h-64 flex items-center justify-center text-brand-muted">Loading chart...</div>
    );
  }

  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="activeGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--lxd-blue-light)" stopOpacity={0.4} />
              <stop offset="100%" stopColor="var(--lxd-blue-light)" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="completionsGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--color-lxd-success)" stopOpacity={0.4} />
              <stop offset="100%" stopColor="var(--color-lxd-success)" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(var(--lxd-blue-light-rgb), 0.1)" />
          <XAxis
            dataKey="time"
            stroke="var(--color-gray-500)"
            fontSize={10}
            tickLine={false}
            axisLine={{ stroke: 'rgba(var(--lxd-blue-light-rgb), 0.2)' }}
          />
          <YAxis
            stroke="var(--color-gray-500)"
            fontSize={10}
            tickLine={false}
            axisLine={false}
            tickFormatter={(value) => value.toLocaleString()}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'var(--background-dark)',
              border: '1px solid rgba(var(--lxd-blue-light-rgb), 0.2)',
              borderRadius: '8px',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
            }}
            labelStyle={{ color: 'var(--color-gray-400)', fontFamily: 'monospace' }}
            itemStyle={{ fontFamily: 'monospace' }}
          />
          <Area
            type="monotone"
            dataKey="active"
            stroke="var(--lxd-blue-light)"
            strokeWidth={2}
            fill="url(#activeGradient)"
            name="Active Learners"
          />
          <Area
            type="monotone"
            dataKey="completions"
            stroke="var(--color-lxd-success)"
            strokeWidth={2}
            fill="url(#completionsGradient)"
            name="Completions"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
