'use client';

import { History, ExternalLink, Clock, GitCompareArrows } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuditStore, type AuditResult } from '@/lib/store';

function ScoreDot({ score }: { score: number }) {
  const color = score > 80 ? 'bg-emerald-500' : score >= 60 ? 'bg-amber-500' : 'bg-red-500';
  return (
    <span
      className={`inline-block h-2.5 w-2.5 rounded-full ${color}`}
      title={`SEO Score: ${score}`}
    />
  );
}

export function AuditHistoryPanel() {
  const { scanHistory, setCurrentAudit, currentAudit, setCompareAudit, compareAudit } = useAuditStore();

  if (scanHistory.length === 0) {
    return (
      <Card className="border-blue-100 shadow-md shadow-blue-50/50 dark:border-gray-800 dark:shadow-none">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base font-bold text-gray-900 dark:text-white">
            <History className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            Audit History
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center py-10">
          <div className="mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-gray-50 dark:bg-gray-800">
            <History className="h-8 w-8 text-gray-300 dark:text-gray-600" />
          </div>
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">No audit history yet</p>
          <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">Run your first audit above to see results here.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-blue-100 shadow-md shadow-blue-50/50 dark:border-gray-800 dark:shadow-none">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base font-bold text-gray-900 dark:text-white">
          <History className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          Audit History
          <Badge variant="secondary" className="ml-auto text-[10px] dark:bg-gray-800 dark:text-gray-300">{scanHistory.length}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="max-h-80 space-y-2 overflow-y-auto custom-scrollbar">
          {scanHistory.map((audit) => {
            const isCurrent = currentAudit?.id === audit.id;
            const isComparing = compareAudit?.id === audit.id;

            return (
              <div
                key={audit.id}
                className={`flex items-center gap-2 rounded-lg border p-2 transition-all ${
                  isCurrent
                    ? 'border-blue-300 bg-blue-50/50 shadow-sm dark:border-blue-700 dark:bg-blue-950/30'
                    : 'border-gray-100 bg-white hover:border-blue-200 hover:bg-blue-50/30 hover:shadow-sm dark:border-gray-800 dark:bg-gray-900 dark:hover:border-blue-800 dark:hover:bg-blue-950/20'
                }`}
              >
                <button
                  onClick={() => setCurrentAudit(audit)}
                  className="flex flex-1 items-center gap-3 text-left"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-50 dark:bg-blue-900/30">
                    <ExternalLink className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-semibold text-gray-800 dark:text-gray-200">{audit.url}</p>
                    <div className="mt-0.5 flex flex-wrap items-center gap-2 text-[10px] text-gray-400 dark:text-gray-500">
                      <span className="flex items-center gap-0.5">
                        <Clock className="h-3 w-3" />
                        {new Date(audit.createdAt).toLocaleDateString()}
                      </span>
                      <span>{audit.totalLinks} links</span>
                      <span>{audit.criticalIssues} issues</span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1.5">
                    <div className="flex items-center gap-1.5">
                      <ScoreDot score={audit.seoScore} />
                      <span
                        className={`text-sm font-bold ${
                          audit.seoScore >= 70 ? 'text-emerald-600 dark:text-emerald-400' : audit.seoScore >= 50 ? 'text-amber-600 dark:text-amber-400' : 'text-red-600 dark:text-red-400'
                        }`}
                      >
                        {audit.seoScore}
                      </span>
                    </div>
                    <span className="text-[9px] text-gray-400 dark:text-gray-500">SEO</span>
                  </div>
                </button>
                <Button
                  variant="ghost"
                  size="icon"
                  className={`h-8 w-8 shrink-0 ${isComparing ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400' : 'text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:text-gray-500 dark:hover:text-blue-400 dark:hover:bg-blue-900/30'}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (isComparing) {
                      setCompareAudit(null);
                    } else if (currentAudit && audit.id !== currentAudit.id) {
                      setCompareAudit(audit);
                    }
                  }}
                  title={isComparing ? 'Remove comparison' : 'Compare with current audit'}
                >
                  <GitCompareArrows className="h-3.5 w-3.5" />
                </Button>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}