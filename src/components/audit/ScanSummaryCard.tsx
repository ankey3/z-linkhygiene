'use client';

import { useState, useEffect, useRef } from 'react';
import { Search, Loader2, Globe, Zap, Clock, CheckCircle2, AlertTriangle, AlertCircle, Layers, FileText } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuditStore } from '@/lib/store';
import { toast } from 'sonner';

interface ScanSummaryProps {
  onScanComplete: () => void;
}

export function ScanSummaryCard({ onScanComplete }: ScanSummaryProps) {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [crawlAll, setCrawlAll] = useState(false);
  const [progressPercent, setProgressPercent] = useState(0);
  const { currentAudit, setScanning, setCurrentAudit, addToHistory, crawlProgress, setCrawlProgress } = useAuditStore();
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Simulate realistic crawl progress
  useEffect(() => {
    if (loading && crawlAll && crawlProgress) {
      intervalRef.current = setInterval(() => {
        setCrawlProgress((prev) => {
          if (!prev) return prev;
          let newCrawled = prev.pagesCrawled;
          let newFound = prev.pagesFound;
          let newStatus = prev.status;
          let newTitle = prev.currentPageTitle;

          if (prev.status === 'discovering') {
            // Simulate discovery phase
            newFound = Math.min(prev.pagesFound + 2, 40);
            newTitle = 'Discovering pages...';
            if (newFound >= 5) {
              newStatus = 'crawling';
              newTitle = prev.currentPage;
            }
          } else if (prev.status === 'crawling') {
            newCrawled = Math.min(prev.pagesCrawled + 1, newFound || 5);
            newTitle = `Page ${newCrawled} of ${newFound || '?'}`;
            if (newCrawled >= (newFound || 5)) {
              newStatus = 'completed';
            }
          }

          return {
            ...prev,
            pagesFound: newFound,
            pagesCrawled: newCrawled,
            status: newStatus as 'discovering' | 'crawling' | 'completed',
            currentPageTitle: newTitle,
          };
        });
      }, 1500);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [loading, crawlAll, crawlProgress, setCrawlProgress]);

  // Calculate progress percentage
  useEffect(() => {
    if (!crawlProgress || !loading) {
      setProgressPercent(0);
      return;
    }

    if (crawlProgress.status === 'discovering') {
      setProgressPercent(Math.min((crawlProgress.pagesFound / 10) * 30, 30));
    } else if (crawlProgress.status === 'crawling') {
      const totalPages = crawlProgress.pagesFound || 1;
      setProgressPercent(30 + (crawlProgress.pagesCrawled / totalPages) * 65);
    } else if (crawlProgress.status === 'completed') {
      setProgressPercent(100);
    }
  }, [crawlProgress, loading]);

  const [ripplePos, setRipplePos] = useState<{ x: number; y: number } | null>(null);

  const handleRipple = (e: React.MouseEvent<HTMLButtonElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setRipplePos({ x: e.clientX - rect.left - 20, y: e.clientY - rect.top - 20 });
    setTimeout(() => setRipplePos(null), 600);
  };

  const handleScan = async () => {
    if (!url.trim()) {
      toast.error('Please enter a URL to audit');
      return;
    }
    let scanUrl = url.trim();
    if (!scanUrl.startsWith('http://') && !scanUrl.startsWith('https://')) {
      scanUrl = 'https://' + scanUrl;
      setUrl(scanUrl);
    }

    setLoading(true);
    setScanning(true);
    setCrawlProgress({ currentPage: scanUrl, currentPageTitle: 'Discovering pages...', pagesFound: 0, pagesCrawled: 0, totalPages: crawlAll ? 0 : 1, status: 'discovering' });

    try {
      const res = await fetch('/api/audit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: scanUrl, crawlAll }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || 'Scan failed');
        return;
      }
      const audit = data.data;
      setCurrentAudit(audit);
      addToHistory(audit);
      setCrawlProgress(null);
      toast.success(`Audit complete! ${crawlAll ? `${audit.pagesCrawled} pages crawled.` : 'Single page scanned.'}`);
      onScanComplete();
    } catch {
      toast.error('Network error. Please try again.');
    } finally {
      setLoading(false);
      setScanning(false);
      setCrawlProgress(null);
      setProgressPercent(0);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleScan();
  };

  const stats = currentAudit
    ? [
        { icon: Globe, label: 'Pages Crawled', value: currentAudit.pagesCrawled, color: 'text-cyan-600 dark:text-cyan-400' },
        { icon: Zap, label: 'Total Links', value: currentAudit.totalLinks, color: 'text-purple-600 dark:text-purple-400' },
        { icon: CheckCircle2, label: 'Valid Links', value: currentAudit.validLinks, color: 'text-emerald-600 dark:text-emerald-400' },
        { icon: AlertCircle, label: 'Critical Issues', value: currentAudit.criticalIssues, color: 'text-red-600 dark:text-red-400' },
        { icon: AlertTriangle, label: 'Warnings', value: currentAudit.warnings, color: 'text-amber-600 dark:text-amber-400' },
      ]
    : [];

  return (
    <Card className={`overflow-hidden shadow-lg shadow-cyan-50 transition-all dark:shadow-none ${loading ? 'border-cyan-300 scan-border-pulse dark:border-cyan-700' : 'border-cyan-100 dark:border-gray-800'}`}>
      <CardHeader className="bg-gradient-to-r from-cyan-600 to-teal-500 px-6 py-4 dark:from-cyan-700 dark:to-teal-600">
        <CardTitle className="flex items-center gap-2 text-lg text-white">
          <Search className="h-5 w-5" />
          Audit Overview
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        {/* URL Input Row */}
        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Globe className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 dark:text-gray-500" />
            <Input
              placeholder="Enter website URL (e.g., example.com)"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onKeyDown={handleKeyDown}
              className="h-12 pl-10 pr-4 text-sm shadow-sm transition-all focus-visible:ring-cyan-400 dark:bg-gray-900 dark:border-gray-700"
              disabled={loading}
            />
          </div>
          <Button
            onClick={(e) => { handleRipple(e); handleScan(); }}
            disabled={loading}
            className={`btn-ripple btn-press relative h-12 px-8 font-semibold text-white shadow-md transition-all dark:shadow-none ${
              loading
                ? 'bg-cyan-400'
                : crawlAll
                  ? 'bg-gradient-to-r from-cyan-600 to-teal-500 hover:from-cyan-700 hover:to-teal-600 hover:shadow-lg hover:shadow-cyan-200 dark:hover:shadow-none'
                  : 'bg-cyan-600 hover:bg-cyan-700 hover:shadow-lg hover:shadow-cyan-200 dark:hover:shadow-none'
            }`}
          >
            {ripplePos && <span className="ripple-effect" style={{ left: ripplePos.x, top: ripplePos.y } as React.CSSProperties} />}
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {crawlAll ? 'Crawling...' : 'Scanning...'}
              </>
            ) : (
              <>
                <Search className="mr-2 h-4 w-4" />
                {crawlAll ? 'Crawl Entire Site' : 'Start Audit'}
              </>
            )}
          </Button>
        </div>

        {/* Crawl All Pages — Prominent Inline Toggle */}
        <div className="mt-3 no-print">
          <button
            type="button"
            onClick={() => setCrawlAll(!crawlAll)}
            disabled={loading}
            className={`group flex w-full items-center gap-3 rounded-xl border p-3.5 text-left transition-all ${
              crawlAll
                ? 'border-cyan-300 bg-cyan-50/70 shadow-sm shadow-cyan-100 dark:border-cyan-700 dark:bg-cyan-950/30 dark:shadow-none'
                : 'border-gray-200 bg-white hover:border-cyan-200 hover:bg-cyan-50/30 dark:border-gray-700 dark:bg-gray-900 dark:hover:border-gray-600 dark:hover:bg-gray-800'
            } ${loading ? 'pointer-events-none opacity-60' : 'cursor-pointer'}`}
          >
            {/* Toggle Switch */}
            <div className={`relative flex h-7 w-12 shrink-0 items-center rounded-full transition-colors duration-200 ${
              crawlAll ? 'bg-cyan-600' : 'bg-gray-300 group-hover:bg-gray-400 dark:bg-gray-600 dark:group-hover:bg-gray-500'
            }`}>
              <span className={`absolute h-5 w-5 rounded-full bg-white shadow-md transition-transform duration-200 ${
                crawlAll ? 'translate-x-[26px]' : 'translate-x-[3px]'
              }`} />
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <Layers className={`h-4.5 w-4.5 ${crawlAll ? 'text-cyan-600 dark:text-cyan-400' : 'text-gray-500 dark:text-gray-400'} transition-colors`} />
                <span className={`text-sm font-semibold transition-colors ${crawlAll ? 'text-cyan-800 dark:text-cyan-300' : 'text-gray-700 dark:text-gray-200'}`}>
                  Crawl All Pages
                </span>
                <Badge variant="outline" className={`text-[9px] font-bold transition-colors ${
                  crawlAll
                    ? 'border-cyan-300 bg-cyan-100 text-cyan-700 dark:border-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400'
                    : 'border-gray-200 bg-gray-100 text-gray-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400'
                }`}>
                  UP TO 70 PAGES
                </Badge>
              </div>
              <p className={`mt-0.5 text-xs leading-relaxed transition-colors ${crawlAll ? 'text-cyan-600 dark:text-cyan-400' : 'text-gray-500 dark:text-gray-400'}`}>
                {crawlAll
                  ? 'Will discover and audit up to 70 internal pages for comprehensive site-wide analysis.'
                  : 'Enable to crawl multiple pages from this domain instead of just the homepage.'}
              </p>
            </div>
          </button>
        </div>

        {/* Scanning Progress */}
        {loading && (
          <div className="mt-4 rounded-xl border border-cyan-100 bg-cyan-50/50 p-4 dark:border-cyan-900/50 dark:bg-cyan-950/20">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-medium text-cyan-700 dark:text-cyan-300">
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                {crawlProgress?.status === 'discovering'
                  ? `Discovering pages across the site... (${crawlProgress.pagesFound} found so far)`
                  : crawlProgress?.status === 'crawling'
                    ? `Analyzing page ${crawlProgress.pagesCrawled} of ${crawlProgress.pagesFound || '?'}...`
                    : 'Finalizing comprehensive audit...'}
              </div>
              <span className="text-xs font-bold text-cyan-600 dark:text-cyan-400">{Math.round(progressPercent)}%</span>
            </div>
            <div className="mt-2 h-2.5 w-full overflow-hidden rounded-full bg-cyan-100 dark:bg-cyan-900/30">
              <div
                className="progress-shimmer h-full rounded-full transition-all duration-700 ease-out"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <div className="mt-2 flex items-center justify-between text-[11px] text-cyan-500 dark:text-cyan-400">
              <span>
                {crawlProgress?.pagesFound
                  ? `${crawlProgress.pagesFound} pages discovered`
                  : 'Scanning all internal links found on the domain...'}
              </span>
              {crawlAll && crawlProgress?.pagesCrawled ? (
                <span className="flex items-center gap-1">
                  <FileText className="h-3 w-3" />
                  {crawlProgress.pagesCrawled} / {crawlProgress.pagesFound || '?'} pages scanned
                </span>
              ) : null}
            </div>
          </div>
        )}

        {/* Scan Meta */}
        {currentAudit && (
          <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {new Date(currentAudit.createdAt).toLocaleString()}
            </span>
            <span className="rounded bg-gray-100 px-2 py-0.5 font-mono text-[10px] dark:bg-gray-800 dark:text-gray-400">
              ID: {currentAudit.id.slice(0, 8)}
            </span>
            <span className="rounded bg-gray-100 px-2 py-0.5 truncate max-w-[200px] dark:bg-gray-800 dark:text-gray-400">
              {currentAudit.url}
            </span>
            {currentAudit.crawlAll && (
              <Badge variant="outline" className="border-cyan-200 bg-cyan-50 text-[9px] font-bold text-cyan-700 dark:border-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-400">
                <Layers className="mr-1 h-3 w-3" />
                Multi-Page ({currentAudit.pagesCrawled} pages)
              </Badge>
            )}
          </div>
        )}

        {/* Stats Grid */}
        {stats.length > 0 && (
          <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            {stats.map((stat) => (
              <div
                key={stat.label}
                className="flex flex-col items-center rounded-xl border border-gray-100 bg-gray-50/50 p-3 text-center transition-colors hover:bg-white hover:shadow-sm dark:border-gray-800 dark:bg-gray-900 dark:hover:bg-gray-800 dark:hover:shadow-none"
              >
                <stat.icon className={`mb-1.5 h-5 w-5 ${stat.color}`} />
                <span className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</span>
                <span className="mt-0.5 text-[11px] font-medium text-gray-500 dark:text-gray-400">{stat.label}</span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}