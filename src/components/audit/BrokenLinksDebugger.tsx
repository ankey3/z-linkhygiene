'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Bug, AlertTriangle, AlertCircle, Hash } from 'lucide-react';
import { useAuditStore, type AuditResult, type AuditIssue } from '@/lib/store';

function ErrorTypeBadge({ type }: { type: string }) {
  const config: Record<string, { icon: typeof Bug; cls: string; label: string }> = {
    MALFORMED: {
      icon: Bug,
      cls: 'bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800',
      label: 'MALFORMED',
    },
    '404': {
      icon: AlertCircle,
      cls: 'bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-900/30 dark:text-orange-400 dark:border-orange-800',
      label: '404/4XX',
    },
    HASH_LINK: {
      icon: Hash,
      cls: 'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800',
      label: 'HASH LINK',
    },
  };
  const c = config[type] || config.MALFORMED;
  const Icon = c.icon;
  return (
    <Badge variant="outline" className={`gap-1 text-[10px] font-bold ${c.cls}`}>
      <Icon className="h-3 w-3" />
      {c.label}
    </Badge>
  );
}

function IssueCard({ issue, index }: { issue: AuditIssue; index: number }) {
  return (
    <AccordionItem
      value={`issue-${index}`}
      className="rounded-lg border border-gray-100 bg-white px-1 transition-colors data-[state=open]:border-cyan-200 data-[state=open]:bg-cyan-50/30 dark:border-gray-800 dark:bg-gray-900 dark:data-[state=open]:border-cyan-800 dark:data-[state=open]:bg-cyan-950/20"
    >
      <AccordionTrigger className="py-3 px-3 hover:no-underline">
        <div className="flex flex-1 flex-wrap items-center gap-2 text-left">
          <ErrorTypeBadge type={issue.errorType} />
          <span className="max-w-[200px] truncate text-xs font-medium text-gray-700 dark:text-gray-300 sm:max-w-[300px]">
            {issue.targetUrl}
          </span>
          <span className="hidden text-[11px] text-gray-400 dark:text-gray-500 sm:inline">
            → {issue.anchorText || '(no anchor)'}
          </span>
        </div>
      </AccordionTrigger>
      <AccordionContent className="px-3 pb-3">
        <div className="space-y-3 rounded-lg border border-gray-100 bg-white p-4 text-xs dark:border-gray-800 dark:bg-gray-900">
          <div>
            <div className="mb-1 flex items-center gap-1.5">
              <Bug className="h-3.5 w-3.5 text-cyan-500 dark:text-cyan-400" />
              <span className="font-semibold text-gray-700 dark:text-gray-300">What It Is</span>
            </div>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">{issue.whatItIs}</p>
          </div>
          <div>
            <div className="mb-1 flex items-center gap-1.5">
              <AlertTriangle className="h-3.5 w-3.5 text-amber-500" />
              <span className="font-semibold text-gray-700 dark:text-gray-300">Why It Matters</span>
            </div>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">{issue.whyItMatters}</p>
          </div>
          <div className="rounded-lg bg-emerald-50 p-3 dark:bg-emerald-900/20">
            <div className="mb-1 flex items-center gap-1.5">
              <span className="text-sm">✅</span>
              <span className="font-semibold text-emerald-800 dark:text-emerald-300">How To Fix It</span>
            </div>
            <p className="text-emerald-700 dark:text-emerald-400 leading-relaxed">{issue.howToFixIt}</p>
          </div>
          <div className="border-t border-gray-100 pt-2 text-[10px] text-gray-400 dark:border-gray-800 dark:text-gray-500">
            Source: {issue.sourcePageTitle && issue.sourcePageTitle !== '(unreachable)' ? `${issue.sourcePageTitle}` : issue.sourceUrl}
          </div>
        </div>
      </AccordionContent>
    </AccordionItem>
  );
}

export function BrokenLinksDebugger({ audit }: { audit: AuditResult | null }) {
  const [filter, setFilter] = useState<string>('all');

  if (!audit) return null;

  const issues = audit.issues;
  const filtered =
    filter === 'all' ? issues : issues.filter((i) => i.errorType === filter);

  const counts = {
    all: issues.length,
    MALFORMED: issues.filter((i) => i.errorType === 'MALFORMED').length,
    '404': issues.filter((i) => i.errorType === '404').length,
    HASH_LINK: issues.filter((i) => i.errorType === 'HASH_LINK').length,
  };

  if (issues.length === 0) {
    return (
      <Card className="card-hover-lift border-cyan-100 shadow-md shadow-cyan-50/50 dark:border-gray-800 dark:shadow-none">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base font-bold text-gray-900 dark:text-white">
            <Bug className="h-5 w-5 text-cyan-600 dark:text-cyan-400" />
            Broken & Suspect Links Deep Dive
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center py-10">
          <div className="mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 dark:bg-emerald-900/30">
            <span className="text-2xl">🎉</span>
          </div>
          <p className="text-sm font-medium text-emerald-700 dark:text-emerald-400">No broken or suspect links found!</p>
          <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">All scanned links appear to be healthy.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="card-hover-lift border-cyan-100 shadow-md shadow-cyan-50/50 dark:border-gray-800 dark:shadow-none">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base font-bold text-gray-900 dark:text-white">
          <Bug className="h-5 w-5 text-cyan-600 dark:text-cyan-400" />
          Broken & Suspect Links Deep Dive
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Filter buttons */}
        <div className="mb-4 flex flex-wrap gap-2">
          {(['all', 'MALFORMED', '404', 'HASH_LINK'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`rounded-full border px-3 py-1 text-[11px] font-semibold transition-colors ${
                filter === f
                  ? 'border-cyan-300 bg-cyan-600 text-white dark:border-cyan-700 dark:bg-cyan-600'
                  : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
              }`}
            >
              {f === 'all' ? 'All' : f === '404' ? '404/4XX' : f} ({counts[f]})
            </button>
          ))}
        </div>

        {/* Issue Cards */}
        <div className="max-h-[500px] overflow-y-auto custom-scrollbar space-y-2">
          <Accordion type="multiple" className="w-full">
            {filtered.map((issue, i) => (
              <IssueCard key={issue.id} issue={issue} index={i} />
            ))}
          </Accordion>
        </div>

        {filtered.length === 0 && (
          <div className="py-8 text-center text-xs text-gray-400 dark:text-gray-500">
            No issues found for this filter.
          </div>
        )}
      </CardContent>
    </Card>
  );
}