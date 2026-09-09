'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CheckCircle2, AlertTriangle, XCircle, ChevronsUpDown, ChevronsDownUp } from 'lucide-react';
import { useAuditStore, type AuditResult, type SeoCheck } from '@/lib/store';
import { motion, AnimatePresence } from 'framer-motion';

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

function CheckRow({ check, expanded }: { check: SeoCheck; expanded: boolean }) {
  return (
    <motion.div
      layout
      className="flex items-start gap-3 rounded-lg border border-gray-100 bg-white p-3 transition-colors hover:bg-gray-50/50 dark:border-gray-800 dark:bg-gray-900 dark:hover:bg-gray-800/50"
    >
      <StatusIcon status={check.status} />
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">{check.name}</span>
          <StatusBadge status={check.status} />
        </div>
        <AnimatePresence initial={false}>
          {expanded && (
            <motion.p
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2, ease: 'easeInOut' }}
              className="mt-1 overflow-hidden text-xs leading-relaxed text-gray-500 dark:text-gray-400"
            >
              {check.detail}
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

export function SeoSegments({ audit }: { audit: AuditResult | null }) {
  const [allExpanded, setAllExpanded] = useState(true);
  const [activeTab, setActiveTab] = useState('on-page');

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

  const currentChecks = activeTab === 'on-page' ? onPage : activeTab === 'off-page' ? offPage : technical;

  return (
    <Card className="card-hover-lift border-cyan-100 shadow-md shadow-cyan-50/50 dark:border-gray-800 dark:shadow-none">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-bold text-gray-900 dark:text-white">
            SEO Segments Analysis
          </CardTitle>
          <button
            onClick={() => setAllExpanded(!allExpanded)}
            className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-600 shadow-sm transition-all hover:border-cyan-200 hover:bg-cyan-50 hover:text-cyan-700 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:border-cyan-800 dark:hover:bg-cyan-950 dark:hover:text-cyan-400"
          >
            {allExpanded ? (
              <>
                <ChevronsDownUp className="h-3.5 w-3.5" />
                Collapse All
              </>
            ) : (
              <>
                <ChevronsUpDown className="h-3.5 w-3.5" />
                Expand All
              </>
            )}
          </button>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
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
            <motion.div layout className="flex flex-col gap-2 max-h-96 overflow-y-auto custom-scrollbar">
              <AnimatePresence initial={false}>
                {onPage.map((check) => (
                  <CheckRow key={check.name} check={check} expanded={allExpanded} />
                ))}
              </AnimatePresence>
            </motion.div>
          </TabsContent>
          <TabsContent value="off-page">
            <motion.div layout className="flex flex-col gap-2 max-h-96 overflow-y-auto custom-scrollbar">
              <AnimatePresence initial={false}>
                {offPage.map((check) => (
                  <CheckRow key={check.name} check={check} expanded={allExpanded} />
                ))}
              </AnimatePresence>
            </motion.div>
          </TabsContent>
          <TabsContent value="technical">
            <motion.div layout className="flex flex-col gap-2 max-h-96 overflow-y-auto custom-scrollbar">
              <AnimatePresence initial={false}>
                {technical.map((check) => (
                  <CheckRow key={check.name} check={check} expanded={allExpanded} />
                ))}
              </AnimatePresence>
            </motion.div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
