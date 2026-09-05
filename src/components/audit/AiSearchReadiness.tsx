'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, AlertTriangle, XCircle, Bot } from 'lucide-react';
import { useAuditStore, type AuditResult, type AiReadinessCheck } from '@/lib/store';

function TypeBadge({ type }: { type: string }) {
  const config: Record<string, string> = {
    'Schema Verification Block': 'bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-900/30 dark:text-purple-400 dark:border-purple-800',
    'AEO Check': 'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800',
    'GEO Check': 'bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-900/30 dark:text-orange-400 dark:border-orange-800',
    'AIO Check': 'bg-cyan-100 text-cyan-700 border-cyan-200 dark:bg-cyan-900/30 dark:text-cyan-400 dark:border-cyan-800',
  };
  return (
    <Badge variant="outline" className={`text-[9px] font-semibold ${config[type] || 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700'}`}>
      {type}
    </Badge>
  );
}

function StatusIcon({ status }: { status: 'PASS' | 'WARN' | 'FAIL' }) {
  switch (status) {
    case 'PASS':
      return <CheckCircle2 className="h-4.5 w-4.5 text-emerald-500 shrink-0" />;
    case 'WARN':
      return <AlertTriangle className="h-4.5 w-4.5 text-amber-500 shrink-0" />;
    case 'FAIL':
      return <XCircle className="h-4.5 w-4.5 text-red-500 shrink-0" />;
  }
}

export function AiSearchReadiness({ audit }: { audit: AuditResult | null }) {
  if (!audit) return null;

  const checks = audit.aiReadinessChecks;
  const passCount = checks.filter((c) => c.status === 'PASS').length;
  const total = checks.length;
  const pct = Math.round((passCount / total) * 100);

  return (
    <Card className="card-hover-lift border-cyan-100 shadow-md shadow-cyan-50/50 dark:border-gray-800 dark:shadow-none">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-base font-bold text-gray-900 dark:text-white">
              <Bot className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              AI Search Readiness & Visibility
            </CardTitle>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Optimization checks for ChatGPT, Perplexity, Gemini, and AI Overviews.
            </p>
          </div>
          <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${pct >= 70 ? 'bg-emerald-50 dark:bg-emerald-900/30' : pct >= 40 ? 'bg-amber-50 dark:bg-amber-900/30' : 'bg-red-50 dark:bg-red-900/30'}`}>
            <span className={`text-sm font-bold ${pct >= 70 ? 'text-emerald-700 dark:text-emerald-400' : pct >= 40 ? 'text-amber-700 dark:text-amber-400' : 'text-red-700 dark:text-red-400'}`}>
              {pct}%
            </span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid gap-2 sm:grid-cols-2">
          {checks.map((check) => (
            <div
              key={check.name}
              className="flex items-start gap-2.5 rounded-lg border border-gray-100 bg-white p-3 transition-colors hover:bg-gray-50/50 dark:border-gray-800 dark:bg-gray-900 dark:hover:bg-gray-800/50"
            >
              <StatusIcon status={check.status} />
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="text-xs font-semibold text-gray-800 dark:text-gray-200">{check.name}</span>
                  <TypeBadge type={check.type} />
                </div>
                <p className="mt-1 text-[11px] leading-relaxed text-gray-500 dark:text-gray-400">{check.detail}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}