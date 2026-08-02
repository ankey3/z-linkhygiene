'use client';

import { useAuditStore, type AuditResult } from '@/lib/store';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ArrowUp, ArrowDown, Minus, GitCompareArrows, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

function ChangeIndicator({ current, previous, label }: { current: number; previous: number; label: string }) {
  const diff = current - previous;
  const isPositive = diff > 0;
  const isNegative = diff < 0;
  const isNeutral = diff === 0;

  const isIssue = label.toLowerCase().includes('issue') || label.toLowerCase().includes('warning') || label.toLowerCase().includes('broken');

  return (
    <div className="flex items-center justify-between rounded-lg border border-gray-100 bg-white p-3 dark:border-gray-800 dark:bg-gray-900">
      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{label}</span>
      <div className="flex items-center gap-2">
        <span className="text-xs text-gray-400 line-through dark:text-gray-600">{previous}</span>
        <span className="text-sm font-bold text-gray-900 dark:text-white">{current}</span>
        {isNeutral ? (
          <span className="flex items-center text-xs text-gray-400 dark:text-gray-500">
            <Minus className="h-3 w-3" /> 0
          </span>
        ) : isPositive ? (
          <span className={`flex items-center text-xs font-semibold ${isIssue ? 'text-red-600 dark:text-red-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
            <ArrowUp className="h-3 w-3" /> +{diff}
          </span>
        ) : (
          <span className={`flex items-center text-xs font-semibold ${isIssue ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
            <ArrowDown className="h-3 w-3" /> {diff}
          </span>
        )}
      </div>
    </div>
  );
}

function ScoreChange({ current, previous, label }: { current: number; previous: number; label: string }) {
  const diff = current - previous;
  const isPositive = diff > 0;
  const isNegative = diff < 0;
  const isNeutral = diff === 0;

  return (
    <div className="flex flex-col items-center rounded-xl border border-gray-100 bg-white p-3 text-center dark:border-gray-800 dark:bg-gray-900">
      <span className="text-[11px] font-medium text-gray-500 dark:text-gray-400">{label}</span>
      <div className="mt-1 flex items-center gap-2">
        <span className="text-xs text-gray-400 dark:text-gray-500">{previous}</span>
        {isNeutral ? (
          <span className="text-gray-400 dark:text-gray-600">→</span>
        ) : isPositive ? (
          <span className="text-emerald-500">→</span>
        ) : (
          <span className="text-red-500">→</span>
        )}
        <span className={`text-lg font-bold ${current >= 80 ? 'text-emerald-600 dark:text-emerald-400' : current >= 60 ? 'text-amber-600 dark:text-amber-400' : 'text-red-600 dark:text-red-400'}`}>
          {current}
        </span>
      </div>
      {isNeutral ? (
        <span className="mt-0.5 text-[10px] text-gray-400 dark:text-gray-500">No change</span>
      ) : isPositive ? (
        <span className="mt-0.5 flex items-center text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
          <ArrowUp className="h-3 w-3" /> +{diff}
        </span>
      ) : (
        <span className="mt-0.5 flex items-center text-[10px] font-semibold text-red-600 dark:text-red-400">
          <ArrowDown className="h-3 w-3" /> {diff}
        </span>
      )}
    </div>
  );
}

export function AuditComparison() {
  const { compareAudit, currentAudit, setCompareAudit } = useAuditStore();

  if (!compareAudit || !currentAudit) return null;

  return (
    <Dialog open={!!compareAudit} onOpenChange={(open) => { if (!open) setCompareAudit(null); }}>
      <DialogContent className="sm:max-w-2xl max-h-[85vh] overflow-y-auto dark:bg-gray-950 dark:border-gray-800">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 dark:text-white">
            <GitCompareArrows className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            Audit Comparison
          </DialogTitle>
          <DialogDescription className="dark:text-gray-400">
            Comparing previous scan ({new Date(compareAudit.createdAt).toLocaleDateString()}) with current scan ({new Date(currentAudit.createdAt).toLocaleDateString()})
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 mt-2">
          <div className="rounded-lg bg-gray-50 p-3 dark:bg-gray-900">
            <p className="text-[11px] font-medium text-gray-400 uppercase tracking-wider mb-1 dark:text-gray-500">Compared URL</p>
            <p className="text-sm font-mono text-gray-700 truncate dark:text-gray-300">{compareAudit.url}</p>
          </div>

          <div>
            <h3 className="text-sm font-bold text-gray-900 mb-3 dark:text-white">Score Changes</h3>
            <div className="grid grid-cols-5 gap-2">
              <ScoreChange current={currentAudit.seoScore} previous={compareAudit.seoScore} label="SEO" />
              <ScoreChange current={currentAudit.aeoScore} previous={compareAudit.aeoScore} label="AEO" />
              <ScoreChange current={currentAudit.geoScore} previous={compareAudit.geoScore} label="GEO" />
              <ScoreChange current={currentAudit.aioScore} previous={compareAudit.aioScore} label="AIO" />
              <ScoreChange current={currentAudit.sxoScore} previous={compareAudit.sxoScore} label="SXO" />
            </div>
            <Separator className="my-3 dark:bg-gray-800" />
            <div className="grid grid-cols-3 gap-2">
              <ScoreChange current={currentAudit.googleScore} previous={compareAudit.googleScore} label="Google" />
              <ScoreChange current={currentAudit.bingScore} previous={compareAudit.bingScore} label="Bing" />
              <ScoreChange current={currentAudit.yahooScore} previous={compareAudit.yahooScore} label="Yahoo" />
            </div>
          </div>

          <div>
            <h3 className="text-sm font-bold text-gray-900 mb-3 dark:text-white">Link & Issue Changes</h3>
            <div className="space-y-2">
              <ChangeIndicator current={currentAudit.totalLinks} previous={compareAudit.totalLinks} label="Total Links" />
              <ChangeIndicator current={currentAudit.validLinks} previous={compareAudit.validLinks} label="Valid Links" />
              <ChangeIndicator current={currentAudit.pagesCrawled} previous={compareAudit.pagesCrawled} label="Pages Crawled" />
              <ChangeIndicator current={currentAudit.criticalIssues} previous={compareAudit.criticalIssues} label="Critical Issues" />
              <ChangeIndicator current={currentAudit.warnings} previous={compareAudit.warnings} label="Warnings" />
              <ChangeIndicator current={currentAudit.malformedLinks} previous={compareAudit.malformedLinks} label="Malformed Links" />
              <ChangeIndicator current={currentAudit.error404Links} previous={compareAudit.error404Links} label="404 Links" />
            </div>
          </div>
        </div>

        <div className="mt-4 flex justify-end">
          <Button variant="outline" onClick={() => setCompareAudit(null)} className="gap-1.5 dark:border-gray-700 dark:text-gray-300">
            <X className="h-3.5 w-3.5" />
            Close Comparison
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}