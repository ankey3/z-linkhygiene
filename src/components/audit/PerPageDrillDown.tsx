'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { FileText, CheckCircle2, AlertTriangle, ExternalLink, ChevronRight, File } from 'lucide-react';
import { useAuditStore, type AuditResult, type PageIssue } from '@/lib/store';

export function PerPageDrillDown({ audit }: { audit: AuditResult | null }) {
  const [expandedPage, setExpandedPage] = useState<string | null>(null);

  if (!audit) return null;

  // Deduplicate page issues by URL
  const uniquePages = audit.pageIssues.reduce((acc, page) => {
    if (!acc.find(p => p.url === page.url)) {
      acc.push(page);
    }
    return acc;
  }, [] as PageIssue[]);

  const getIssuesForPage = (pageUrl: string) => {
    return audit.issues.filter(i => i.sourceUrl === pageUrl);
  };

  return (
    <Card className="card-hover-lift border-cyan-100 shadow-md shadow-cyan-50/50 dark:border-gray-800 dark:shadow-none">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-cyan-600 dark:text-cyan-400" />
            <span className="text-base font-bold text-gray-900 dark:text-white">
              Per-Page Issues Drill-Down
            </span>
          </div>
          <Badge variant="secondary" className="text-[10px] dark:bg-gray-800 dark:text-gray-300">
            {uniquePages.length} page{uniquePages.length !== 1 ? 's' : ''}
          </Badge>
        </CardTitle>
        {audit.crawlAll && audit.pagesCrawled > 1 && (
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            Multi-page crawl: {audit.pagesCrawled} pages discovered and audited across the domain.
          </p>
        )}
      </CardHeader>
      <CardContent>
        <div className="max-h-[600px] overflow-y-auto rounded-lg border border-gray-100 dark:border-gray-800 custom-scrollbar">
          {/* Page Cards (friendly URL view) */}
          {uniquePages.map((page) => {
            const pageIssues = getIssuesForPage(page.url);
            const isExpanded = expandedPage === page.url;

            return (
              <div
                key={page.url}
                className="border-b border-gray-50 last:border-0 dark:border-gray-800"
              >
                {/* Page Row */}
                <button
                  onClick={() => setExpandedPage(isExpanded ? null : page.url)}
                  className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-cyan-50/40 dark:hover:bg-gray-800/50"
                >
                  {/* Expand arrow */}
                  <ChevronRight className={`h-4 w-4 shrink-0 text-gray-400 dark:text-gray-500 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />

                  {/* Page icon */}
                  <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
                    page.isClean ? 'bg-emerald-50 dark:bg-emerald-900/30' : 'bg-red-50 dark:bg-red-900/30'
                  }`}>
                    {page.isClean ? (
                      <CheckCircle2 className="h-4.5 w-4.5 text-emerald-500" />
                    ) : (
                      <AlertTriangle className="h-4.5 w-4.5 text-red-500" />
                    )}
                  </div>

                  {/* Friendly URL + Title */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <File className="h-3.5 w-3.5 shrink-0 text-gray-400 dark:text-gray-500" />
                      <span className="truncate text-sm font-semibold text-gray-800 dark:text-gray-200">
                        {page.friendlyUrl || page.url}
                      </span>
                    </div>
                    <div className="mt-0.5 flex items-center gap-2">
                      <span className="truncate text-[11px] text-gray-400 dark:text-gray-500 max-w-[300px]">
                        {page.title !== page.friendlyUrl ? page.title : page.url}
                      </span>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="flex shrink-0 items-center gap-3">
                    <div className="text-right">
                      <span className="text-[10px] text-gray-400 dark:text-gray-500">Links</span>
                      <p className="text-sm font-bold text-gray-700 dark:text-gray-200">{page.totalLinks}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-gray-400 dark:text-gray-500">Issues</span>
                      <p className={`text-sm font-bold ${page.issueCount > 0 ? 'text-red-600 dark:text-red-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                        {page.issueCount}
                      </p>
                    </div>
                    {page.isClean ? (
                      <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 text-[9px] font-bold dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800">
                        Clean
                      </Badge>
                    ) : (
                      <Badge className="bg-red-100 text-red-700 border-red-200 text-[9px] font-bold dark:bg-red-900/30 dark:text-red-400 dark:border-red-800">
                        {page.issueCount} Alert{page.issueCount > 1 ? 's' : ''}
                      </Badge>
                    )}
                  </div>
                </button>

                {/* Expanded: Show issues for this page */}
                {isExpanded && pageIssues.length > 0 && (
                  <div className="border-t border-gray-100 bg-gray-50/50 px-4 py-3 dark:border-gray-700 dark:bg-gray-900">
                    <div className="space-y-2">
                      {pageIssues.map((issue, idx) => (
                        <div
                          key={`${issue.targetUrl}-${idx}`}
                          className="flex items-start gap-2.5 rounded-lg border border-white bg-white p-2.5 shadow-sm dark:border-gray-800 dark:bg-gray-800"
                        >
                          <div className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded text-[9px] font-bold text-white ${
                            issue.errorType === 'MALFORMED' ? 'bg-red-500' :
                            issue.errorType === '404' ? 'bg-orange-500' : 'bg-amber-500'
                          }`}>
                            {issue.errorType === 'MALFORMED' ? 'M' : issue.errorType === '404' ? '4' : '#'}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-medium text-gray-700 dark:text-gray-300 truncate">
                              {issue.targetUrl}
                            </p>
                            <p className="mt-0.5 text-[11px] text-gray-500 dark:text-gray-400">
                              {issue.anchorText && issue.anchorText !== '(empty)' ? `Anchor: "${issue.anchorText}"` : 'No anchor text'}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {isExpanded && pageIssues.length === 0 && (
                  <div className="border-t border-gray-100 bg-gray-50/50 px-4 py-4 text-center dark:border-gray-700 dark:bg-gray-900">
                    <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">No issues found on this page.</p>
                  </div>
                )}
              </div>
            );
          })}

          {uniquePages.length === 0 && (
            <div className="py-8 text-center text-xs text-gray-400 dark:text-gray-500">
              No pages found.
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}