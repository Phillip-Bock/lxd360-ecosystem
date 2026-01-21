'use client';

import { Globe, Laptop, Smartphone, Users } from 'lucide-react';
import * as React from 'react';
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

// ============================================================================
// TYPES
// ============================================================================

interface UserDataPoint {
  time: string;
  desktop: number;
  mobile: number;
  total: number;
}

interface ActiveUserStats {
  total: number;
  desktop: number;
  mobile: number;
  peakToday: number;
  currentHour: UserDataPoint[];
}

// ============================================================================
// MOCK DATA
// ============================================================================

function generateMockUserData(): ActiveUserStats {
  const currentHour: UserDataPoint[] = [];

  for (let i = 0; i < 12; i++) {
    const desktop = Math.floor(Math.random() * 80) + 40;
    const mobile = Math.floor(Math.random() * 40) + 20;
    currentHour.push({
      time: `${i * 5}m`,
      desktop,
      mobile,
      total: desktop + mobile,
    });
  }

  const latest = currentHour[currentHour.length - 1];

  return {
    total: latest?.total ?? 0,
    desktop: latest?.desktop ?? 0,
    mobile: latest?.mobile ?? 0,
    peakToday: Math.max(...currentHour.map((d) => d.total)),
    currentHour,
  };
}

// ============================================================================
// ACTIVE USER CHART COMPONENT
// ============================================================================

export function ActiveUserChart(): React.JSX.Element {
  const [data, setData] = React.useState<ActiveUserStats | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    // Simulate API call
    const fetchData = (): void => {
      const mockData = generateMockUserData();
      setData(mockData);
      setIsLoading(false);
    };

    fetchData();

    // Update every 30 seconds
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  if (isLoading || !data) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Active Users
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[200px] animate-pulse rounded bg-muted" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base font-medium">
            <Users className="h-4 w-4" />
            Active Users
          </CardTitle>
          <Badge variant="outline" className="font-mono">
            <Globe className="mr-1 h-3 w-3" />
            {data.total} online
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        {/* Stats Row */}
        <div className="mb-4 grid grid-cols-3 gap-4">
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-muted-foreground">
              <Laptop className="h-3 w-3" />
              <span className="text-xs">Desktop</span>
            </div>
            <p className="text-lg font-semibold">{data.desktop}</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-muted-foreground">
              <Smartphone className="h-3 w-3" />
              <span className="text-xs">Mobile</span>
            </div>
            <p className="text-lg font-semibold">{data.mobile}</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-muted-foreground">
              <Users className="h-3 w-3" />
              <span className="text-xs">Peak Today</span>
            </div>
            <p className="text-lg font-semibold">{data.peakToday}</p>
          </div>
        </div>

        {/* Chart */}
        <div className="h-[150px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data.currentHour}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis dataKey="time" tick={{ fontSize: 10 }} className="text-muted-foreground" />
              <YAxis tick={{ fontSize: 10 }} className="text-muted-foreground" />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '6px',
                  fontSize: '12px',
                }}
              />
              <Area
                type="monotone"
                dataKey="desktop"
                name="Desktop"
                stackId="1"
                stroke="hsl(var(--primary))"
                fill="hsl(var(--primary) / 0.3)"
              />
              <Area
                type="monotone"
                dataKey="mobile"
                name="Mobile"
                stackId="1"
                stroke="hsl(var(--chart-2))"
                fill="hsl(var(--chart-2) / 0.3)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <p className="mt-2 text-center text-xs text-muted-foreground">Last 60 minutes</p>
      </CardContent>
    </Card>
  );
}
