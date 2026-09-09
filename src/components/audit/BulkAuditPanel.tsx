'use client';

import { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from '@/components/ui/tooltip';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Layers,
  Search,
  Loader2,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ArrowUpDown,
  ExternalLink,
} from 'lucide-react';
import { useAuditStore, type AuditResult } from '@/lib/store';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

// ─── Types ──────────────────────────────────────────────────────

interface BulkAuditItem {
  url: string;
  status: 'pending' | 'scanning' | 'complete' | 'error';
  result: AuditResult | null;
  error: string | null;
}

type SortKey = 'url' | 'seoScore' | 'aeoScore' | 'criticalIssues' | 'warnings' | 'status';
type SortDir = 'asc' | 'desc';

// ─── Helpers ────────────────────────────────────────────────────

function truncateUrl(url: string, max = 40): string {
  if (url.length <= max) return url;
  return url.slice(0, max - 3) + '...';
}

function scoreColor(score: number): string {
  if (score >= 80) return 'text-emerald-600 dark:text-emerald-400';
  if (score >= 60) return 'text-teal-600 dark:text-teal-400';
  if (score >= 40) return 'text-amber-600 dark:text-amber-400';
  return 'text-red-600 dark:text-red-400';
}

function scoreBg(score: number): string {
  if (score >= 80) return 'bg-emerald-50 dark:bg-emerald-950/30';
  if (score >= 60) return 'bg-teal-50 dark:bg-teal-950/30';
  if (score >= 40) return 'bg-amber-50 dark:bg-amber-950/30';
  return 'bg-red-50 dark:bg-red-950/30';
}

function statusLabel(status: BulkAuditItem['status']): { text: string; cls: string } {
  switch (status) {
    case 'pending':
      return { text: 'Queued', cls: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400' };
    case 'scanning':
      return { text: 'Scanning', cls: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400' };
    case 'complete':
      return { text: 'Complete', cls: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' };
    case 'error':
      return { text: 'Error', cls: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' };
  }
}

function sortItems(items: BulkAuditItem[], key: SortKey, dir: SortDir): BulkAuditItem[] {
  const sorted = [...items].sort((a, b) => {
    let va: string | number;
    let vb: string | number;

    switch (key) {
      case 'url':
        va = a.url;
        vb = b.url;
        break;
      case 'seoScore':
        va = a.result?.seoScore ?? -1;
        vb = b.result?.seoScore ?? -1;
        break;
      case 'aeoScore':
        va = a.result?.aeoScore ?? -1;
        vb = b.result?.aeoScore ?? -1;
        break;
      case 'criticalIssues':
        va = a.result?.criticalIssues ?? -1;
        vb = b.result?.criticalIssues ?? -1;
        break;
      case 'warnings':
        va = a.result?.warnings ?? -1;
        vb = b.result?.warnings ?? -1;
        break;
      case 'status':
        va = a.status;
        vb = b.status;
        break;
      default:
        return 0;
    }

    if (va < vb) return -1;
    if (va > vb) return 1;
    return 0;
  });

  return dir === 'desc' ? sorted.reverse() : sorted;
}

// ─── Component ──────────────────────────────────────────────────

export function BulkAuditPanel({ audit }: { audit: AuditResult | null }) {
  const [urlText, setUrlText] = useState('');
  const [items, setItems] = useState<BulkAuditItem[]>([]);
  const [isBulkRunning, setIsBulkRunning] = useState(false);
  const [sortKey, setSortKey] = useState<SortKey>('url');
  const [sortDir, setSortDir] = useState<SortDir>('asc');

  const { setCurrentAudit, addToHistory } = useAuditStore();

  const completedCount = items.filter((i) => i.status === 'complete' || i.status === 'error').length;
  const totalCount = items.length;
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  const handleSort = useCallback(
    (key: SortKey) => {
      if (sortKey === key) {
        setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
      } else {
        setSortKey(key);
        setSortDir('asc');
      }
    },
    [sortKey]
  );

  const handleBulkAudit = async () => {
    const lines = urlText
      .split('\n')
      .map((l) => l.trim())
      .filter(Boolean)
      .map((u) => (u.startsWith('http://') || u.startsWith('https://') ? u : `https://${u}`));

    if (lines.length === 0) {
      toast.error('Please enter at least one URL');
      return;
    }

    if (lines.length > 10) {
      toast.error('Maximum 10 URLs allowed. Please reduce the list.');
      return;
    }

    const initialItems: BulkAuditItem[] = lines.map((url) => ({
      url,
      status: 'pending',
      result: null,
      error: null,
    }));

    setItems(initialItems);
    setIsBulkRunning(true);
    toast.info(`Starting bulk audit for ${lines.length} URLs...`);

    for (let i = 0; i < initialItems.length; i++) {
      const url = initialItems[i].url;

      // Mark as scanning
      setItems((prev) =>
        prev.map((item, idx) => (idx === i ? { ...item, status: 'scanning' } : item))
      );

      try {
        const res = await fetch('/api/audit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url, crawlAll: false }),
        });
        const data = await res.json();

        if (!res.ok) {
          setItems((prev) =>
            prev.map((item, idx) =>
              idx === i ? { ...item, status: 'error', error: data.error || 'Scan failed' } : item
            )
          );
          toast.error(`Failed: ${truncateUrl(url, 30)}`);
        } else {
          const auditResult = data.data as AuditResult;
          setItems((prev) =>
            prev.map((item, idx) =>
              idx === i ? { ...item, status: 'complete', result: auditResult } : item
            )
          );
          toast.success(`Complete: ${truncateUrl(url, 30)} — SEO ${auditResult.seoScore}%`);
        }
      } catch {
        setItems((prev) =>
          prev.map((item, idx) =>
            idx === i ? { ...item, status: 'error', error: 'Network error' } : item
          )
        );
        toast.error(`Network error: ${truncateUrl(url, 30)}`);
      }
    }

    setIsBulkRunning(false);
    toast.success('Bulk audit finished!');
  };

  const handleViewDetails = (item: BulkAuditItem) => {
    if (item.result) {
      setCurrentAudit(item.result);
      addToHistory(item.result);
      document.getElementById('results-section')?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const sortedItems = sortItems(items, sortKey, sortDir);

  const SortableHeader = ({ label, sortField }: { label: string; sortField: SortKey }) => (
    <button
      onClick={() => handleSort(sortField)}
      className="inline-flex items-center gap-1 text-xs font-semibold text-gray-600 transition-colors hover:text-cyan-700 dark:text-gray-400 dark:hover:text-cyan-400"
    >
      {label}
      <ArrowUpDown
        className={`h-3 w-3 transition-colors ${
          sortKey === sortField ? 'text-cyan-600 dark:text-cyan-400' : 'text-gray-300 dark:text-gray-600'
        }`}
      />
    </button>
  );

  return (
    <Card className="card-hover-lift border-cyan-100 shadow-md shadow-cyan-50/50 dark:border-gray-800 dark:shadow-none">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base font-bold text-gray-900 dark:text-white">
            <Layers className="h-5 w-5 text-cyan-600 dark:text-cyan-400" />
            Bulk Audit
          </CardTitle>
          {totalCount > 0 && (
            <Badge
              variant="outline"
              className="border-cyan-200 bg-cyan-50 text-[10px] font-bold text-cyan-700 dark:border-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-400"
            >
              {completedCount}/{totalCount} complete
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="pt-2">
        {/* URL Textarea Input */}
        <div className="space-y-3">
          <Textarea
            placeholder="Paste URLs here (one per line, up to 10)&#10;e.g.&#10;https://example.com&#10;https://wikipedia.org&#10;https://github.com"
            value={urlText}
            onChange={(e) => setUrlText(e.target.value)}
            disabled={isBulkRunning}
            rows={5}
            className="resize-none text-sm shadow-sm transition-all focus-visible:ring-cyan-400 dark:bg-gray-900 dark:border-gray-700"
          />
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {urlText.split('\n').filter((l) => l.trim()).length}/10 URLs
            </span>
            <Button
              onClick={handleBulkAudit}
              disabled={isBulkRunning || !urlText.trim()}
              className={`btn-press relative font-semibold text-white shadow-md transition-all dark:shadow-none ${
                isBulkRunning
                  ? 'bg-cyan-400'
                  : 'bg-gradient-to-r from-cyan-600 to-teal-500 hover:from-cyan-700 hover:to-teal-600 hover:shadow-lg hover:shadow-cyan-200 dark:hover:shadow-none'
              }`}
            >
              {isBulkRunning ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Auditing...
                </>
              ) : (
                <>
                  <Search className="mr-2 h-4 w-4" />
                  Bulk Audit
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Progress Bar */}
        <AnimatePresence>
          {isBulkRunning && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-4 overflow-hidden"
            >
              <div className="rounded-xl border border-cyan-100 bg-cyan-50/50 p-4 dark:border-cyan-900/50 dark:bg-cyan-950/20">
                <div className="flex items-center justify-between text-xs font-medium text-cyan-700 dark:text-cyan-300">
                  <span>
                    <Loader2 className="mr-1.5 inline h-3.5 w-3.5 animate-spin" />
                    Processing audits...
                  </span>
                  <span className="font-bold">{completedCount}/{totalCount} ({progressPercent}%)</span>
                </div>
                <Progress value={progressPercent} className="mt-2 h-2.5" />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Results Table */}
        <AnimatePresence>
          {items.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mt-5"
            >
              <div className="overflow-x-auto rounded-lg border border-gray-100 dark:border-gray-800">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50/80 dark:bg-gray-900/80">
                      <TableHead className="w-[180px]">
                        <SortableHeader label="URL" sortField="url" />
                      </TableHead>
                      <TableHead className="text-center">
                        <SortableHeader label="SEO" sortField="seoScore" />
                      </TableHead>
                      <TableHead className="text-center">
                        <SortableHeader label="AEO" sortField="aeoScore" />
                      </TableHead>
                      <TableHead className="text-center">
                        <SortableHeader label="Critical" sortField="criticalIssues" />
                      </TableHead>
                      <TableHead className="text-center">
                        <SortableHeader label="Warnings" sortField="warnings" />
                      </TableHead>
                      <TableHead className="text-center">
                        <SortableHeader label="Status" sortField="status" />
                      </TableHead>
                      <TableHead className="text-center">Details</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sortedItems.map((item, idx) => {
                      const sInfo = statusLabel(item.status);
                      return (
                        <TableRow key={idx} className="transition-colors">
                          {/* URL with tooltip */}
                          <TableCell className="max-w-[180px]">
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <span className="block cursor-default truncate text-xs font-medium text-gray-800 dark:text-gray-200">
                                  {truncateUrl(item.url, 30)}
                                </span>
                              </TooltipTrigger>
                              <TooltipContent side="bottom" className="score-tooltip max-w-xs">
                                {item.url}
                              </TooltipContent>
                            </Tooltip>
                          </TableCell>

                          {/* SEO Score */}
                          <TableCell className="text-center">
                            {item.result ? (
                              <span className={`inline-flex h-7 w-7 items-center justify-center rounded-md text-xs font-bold ${scoreBg(item.result.seoScore)} ${scoreColor(item.result.seoScore)}`}>
                                {item.result.seoScore}
                              </span>
                            ) : (
                              <span className="text-xs text-gray-300 dark:text-gray-600">—</span>
                            )}
                          </TableCell>

                          {/* AEO Score */}
                          <TableCell className="text-center">
                            {item.result ? (
                              <span className={`inline-flex h-7 w-7 items-center justify-center rounded-md text-xs font-bold ${scoreBg(item.result.aeoScore)} ${scoreColor(item.result.aeoScore)}`}>
                                {item.result.aeoScore}
                              </span>
                            ) : (
                              <span className="text-xs text-gray-300 dark:text-gray-600">—</span>
                            )}
                          </TableCell>

                          {/* Critical Issues */}
                          <TableCell className="text-center">
                            {item.result ? (
                              <span className={`text-xs font-semibold ${item.result.criticalIssues > 0 ? 'text-red-600 dark:text-red-400' : 'text-gray-500 dark:text-gray-400'}`}>
                                {item.result.criticalIssues > 0 && <AlertTriangle className="mr-0.5 inline h-3 w-3" />}
                                {item.result.criticalIssues}
                              </span>
                            ) : (
                              <span className="text-xs text-gray-300 dark:text-gray-600">—</span>
                            )}
                          </TableCell>

                          {/* Warnings */}
                          <TableCell className="text-center">
                            {item.result ? (
                              <span className={`text-xs font-semibold ${item.result.warnings > 0 ? 'text-amber-600 dark:text-amber-400' : 'text-gray-500 dark:text-gray-400'}`}>
                                {item.result.warnings}
                              </span>
                            ) : (
                              <span className="text-xs text-gray-300 dark:text-gray-600">—</span>
                            )}
                          </TableCell>

                          {/* Status */}
                          <TableCell className="text-center">
                            <Badge variant="outline" className={`text-[10px] font-bold ${sInfo.cls}`}>
                              {item.status === 'scanning' && <Loader2 className="mr-1 h-3 w-3 animate-spin" />}
                              {item.status === 'complete' && <CheckCircle2 className="mr-1 h-3 w-3" />}
                              {item.status === 'error' && <XCircle className="mr-1 h-3 w-3" />}
                              {sInfo.text}
                            </Badge>
                          </TableCell>

                          {/* View Details Link */}
                          <TableCell className="text-center">
                            {item.result ? (
                              <button
                                onClick={() => handleViewDetails(item)}
                                className="inline-flex items-center gap-1 text-xs font-medium text-cyan-600 transition-colors hover:text-cyan-800 dark:text-cyan-400 dark:hover:text-cyan-300"
                              >
                                View
                                <ExternalLink className="h-3 w-3" />
                              </button>
                            ) : (
                              <span className="text-xs text-gray-300 dark:text-gray-600">—</span>
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
}
