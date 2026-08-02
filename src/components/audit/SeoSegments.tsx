'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CheckCircle2, AlertTriangle, XCircle } from 'lucide-react';
import { useAuditStore, type AuditResult, type SeoCheck } from '@/lib/store';

function StatusIcon({ status }: { status: 'PASS' | 'WARN' | 'FAIL' }) {
  switch (status) {
    case 'PASS':
      return <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0" />;
    case 'WARN':
      return <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0" />;
    case 'FAIL':
      return <XCircle className="h-5 w-5 text-red-500 shrink-0" />;
  }
}

function StatusBadge({ status }: { status: 'PASS' | 'WARN' | 'FAIL' }) {
  const config = {
    PASS: { label: 'PASS', cls: 'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800' },
    WARN: { label: 'WARN', cls: 'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800' },
    FAIL: { label: 'FAIL', cls: 'bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800' },
  };
  const c = config[status];
  return (
    <Badge variant="outline" className={`text-[10px] font-bold ${c.cls}`}>
      {c.label}
    </Badge>
  );
}

function CheckRow({ check }: { check: SeoCheck }) {
  return (
    <div className="flex items-start gap-3 rounded-lg border border-gray-100 bg-white p-3 transition-colors hover:bg-gray-50/50 dark:border-gray-800 dark:bg-gray-900 dark:hover:bg-gray-800/50">
      <StatusIcon status={check.status} />
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">{check.name}</span>
          <StatusBadge status={check.status} />
        </div>
        <p className="mt-1 text-xs leading-relaxed text-gray-500 dark:text-gray-400">{check.detail}</p>
      </div>
    </div>
  );
}

export function SeoSegments({ audit }: { audit: AuditResult | null }) {
  if (!audit) return null;

  const onPage = audit.seoChecks.filter((c) => c.category === 'on-page');
  const offPage = audit.seoChecks.filter((c) => c.category === 'off-page');
  const technical = audit.seoChecks.filter((c) => c.category === 'technical');

  const getCounts = (checks: SeoCheck[]) => ({
    pass: checks.filter((c) => c.status === 'PASS').length,
    warn: checks.filter((c) => c.status === 'WARN').length,
    fail: checks.filter((c) => c.status === 'FAIL').length,
  });

  const onCounts = getCounts(onPage);
  const offCounts = getCounts(offPage);
  const techCounts = getCounts(technical);

  return (
    <Card className="card-hover-lift border-cyan-100 shadow-md shadow-cyan-50/50 dark:border-gray-800 dark:shadow-none">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-bold text-gray-900 dark:text-white">
          SEO Segments Analysis
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="on-page" className="w-full">
          <TabsList className="mb-4 grid w-full grid-cols-3 bg-gray-100 p-1 dark:bg-gray-800">
            <TabsTrigger
              value="on-page"
              className="text-xs data-[state=active]:bg-white data-[state=active]:shadow-sm dark:data-[state=active]:bg-gray-700 dark:data-[state=active]:text-gray-100"
            >
              On-Page
              <span className="ml-1.5 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-emerald-100 px-1 text-[9px] font-bold text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
                {onCounts.pass}/{onPage.length}
              </span>
            </TabsTrigger>
            <TabsTrigger
              value="off-page"
              className="text-xs data-[state=active]:bg-white data-[state=active]:shadow-sm dark:data-[state=active]:bg-gray-700 dark:data-[state=active]:text-gray-100"
            >
              Off-Page
              <span className="ml-1.5 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-emerald-100 px-1 text-[9px] font-bold text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
                {offCounts.pass}/{offPage.length}
              </span>
            </TabsTrigger>
            <TabsTrigger
              value="technical"
              className="text-xs data-[state=active]:bg-white data-[state=active]:shadow-sm dark:data-[state=active]:bg-gray-700 dark:data-[state=active]:text-gray-100"
            >
              Technical
              <span className="ml-1.5 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-emerald-100 px-1 text-[9px] font-bold text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
                {techCounts.pass}/{technical.length}
              </span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="on-page">
            <div className="flex flex-col gap-2 max-h-96 overflow-y-auto custom-scrollbar">
              {onPage.map((check) => (
                <CheckRow key={check.name} check={check} />
              ))}
            </div>
          </TabsContent>
          <TabsContent value="off-page">
            <div className="flex flex-col gap-2 max-h-96 overflow-y-auto custom-scrollbar">
              {offPage.map((check) => (
                <CheckRow key={check.name} check={check} />
              ))}
            </div>
          </TabsContent>
          <TabsContent value="technical">
            <div className="flex flex-col gap-2 max-h-96 overflow-y-auto custom-scrollbar">
              {technical.map((check) => (
                <CheckRow key={check.name} check={check} />
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}