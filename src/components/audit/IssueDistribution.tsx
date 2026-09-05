'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuditStore, type AuditResult } from '@/lib/store';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

const COLORS = ['#ef4444', '#f97316', '#eab308'];

interface DataItem {
  name: string;
  value: number;
  color: string;
}

export function IssueDistribution({ audit }: { audit: AuditResult | null }) {
  if (!audit) return null;

  const total = audit.malformedLinks + audit.error404Links + audit.hashLinks;

  const data: DataItem[] = [
    { name: 'Malformed Links', value: audit.malformedLinks, color: COLORS[0] },
    { name: '404/4xx Errors', value: audit.error404Links, color: COLORS[1] },
    { name: 'Placeholder Hash Links', value: audit.hashLinks, color: COLORS[2] },
  ].filter((d) => d.value > 0);

  if (data.length === 0) {
    return (
      <Card className="card-hover-lift border-cyan-100 shadow-md shadow-cyan-50/50 dark:border-gray-800 dark:shadow-none">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-bold text-gray-900 dark:text-white">
            Issue Distribution
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center py-10">
          <div className="mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 dark:bg-emerald-900/30">
            <span className="text-2xl">✅</span>
          </div>
          <p className="text-sm font-medium text-emerald-700 dark:text-emerald-400">No link issues detected!</p>
          <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">All scanned links appear to be valid.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="card-hover-lift border-cyan-100 shadow-md shadow-cyan-50/50 dark:border-gray-800 dark:shadow-none">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-bold text-gray-900 dark:text-white">
          Issue Distribution
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-center gap-4">
          <div className="h-[180px] w-[180px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={3}
                  dataKey="value"
                  strokeWidth={0}
                >
                  {data.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    borderRadius: '8px',
                    border: '1px solid #e5e7eb',
                    fontSize: '12px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-col gap-3">
            {data.map((item) => (
              <div key={item.name} className="flex items-center gap-2.5">
                <div
                  className="h-3 w-3 rounded-full"
                  style={{ backgroundColor: item.color }}
                />
                <div>
                  <p className="text-xs font-medium text-gray-700 dark:text-gray-300">{item.name}</p>
                  <p className="text-lg font-bold text-gray-900 dark:text-white">{item.value}</p>
                </div>
              </div>
            ))}
            <div className="border-t border-gray-100 pt-2 dark:border-gray-800">
              <p className="text-xs text-gray-400 dark:text-gray-500">Total Issues</p>
              <p className="text-lg font-bold text-gray-900 dark:text-white">{total}</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}