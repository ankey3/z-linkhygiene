'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  History,
  ExternalLink,
  Clock,
  GitCompareArrows,
  Trash2,
  Search,
  ArrowUpDown,
  BarChart3,
  Zap,
  Filter,
  Home,
  ChevronRight,
  FileSearch,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { useAuditStore, type AuditResult } from '@/lib/store';

type SortOption = 'newest' | 'oldest' | 'highest' | 'lowest';

function ScoreDot({ score, label }: { score: number; label?: string }) {
  const color =
    score >= 80
      ? 'bg-emerald-500'
      : score >= 60
        ? 'bg-amber-500'
        : 'bg-red-500';
  return (
    <span
      className={`inline-block h-2.5 w-2.5 rounded-full ${color}`}
      title={label ? `${label}: ${score}` : `Score: ${score}`}
    />
  );
}

function ScoreBadge({
  label,
  score,
  colorClass,
}: {
  label: string;
  score: number;
  colorClass: string;
}) {
  const textColor =
    score >= 80
      ? 'text-emerald-700 dark:text-emerald-400'
      : score >= 60
        ? 'text-amber-700 dark:text-amber-400'
        : 'text-red-700 dark:text-red-400';

  const bgColor =
    score >= 80
      ? 'bg-emerald-50 border-emerald-200 dark:bg-emerald-950/30 dark:border-emerald-800'
      : score >= 60
        ? 'bg-amber-50 border-amber-200 dark:bg-amber-950/30 dark:border-amber-800'
        : 'bg-red-50 border-red-200 dark:bg-red-950/30 dark:border-red-800';

  return (
    <div
      className={`flex flex-col items-center gap-0.5 rounded-lg border px-2.5 py-1.5 ${bgColor}`}
    >
      <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">
        {label}
      </span>
      <span className={`text-sm font-bold ${textColor}`}>{score}</span>
    </div>
  );
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function formatTime(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

function truncateUrl(url: string, maxLen: number = 52) {
  if (url.length <= maxLen) return url;
  const start = url.substring(0, maxLen - 20);
  const end = url.substring(url.length - 17);
  return `${start}...${end}`;
}

const sortOptions: { value: SortOption; label: string }[] = [
  { value: 'newest', label: 'Newest First' },
  { value: 'oldest', label: 'Oldest First' },
  { value: 'highest', label: 'Highest Score' },
  { value: 'lowest', label: 'Lowest Score' },
];

function AuditCard({
  audit,
  index,
  onView,
  onCompare,
  onDelete,
}: {
  audit: AuditResult;
  index: number;
  onView: () => void;
  onCompare: () => void;
  onDelete: () => void;
}) {
  const { currentAudit, compareAudit } = useAuditStore();
  const isCurrent = currentAudit?.id === audit.id;
  const isComparing = compareAudit?.id === audit.id;

  const avgScore = Math.round(
    (audit.seoScore + audit.aeoScore + audit.geoScore + audit.aioScore + audit.sxoScore) /
      5
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10, scale: 0.97 }}
      transition={{ duration: 0.35, delay: index * 0.05, ease: 'easeOut' }}
      layout
    >
      <Card
        className={`card-hover-lift relative overflow-hidden border transition-all ${
          isCurrent
            ? 'border-cyan-300 shadow-md shadow-cyan-100/50 dark:border-cyan-700 dark:shadow-cyan-900/20'
            : isComparing
              ? 'border-purple-300 shadow-md shadow-purple-100/50 dark:border-purple-700 dark:shadow-purple-900/20'
              : 'border-gray-200 dark:border-gray-800'
        }`}
      >
        {/* Active indicator bar */}
        {(isCurrent || isComparing) && (
          <div
            className={`absolute top-0 left-0 right-0 h-1 ${
              isCurrent
                ? 'bg-gradient-to-r from-cyan-500 to-teal-400'
                : 'bg-gradient-to-r from-purple-500 to-pink-400'
            }`}
          />
        )}

        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0 flex-1">
              <CardTitle className="flex items-center gap-2 text-sm font-bold text-gray-900 dark:text-white">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-cyan-50 to-teal-100 dark:from-cyan-900/40 dark:to-teal-800/30">
                  <ExternalLink className="h-4 w-4 text-cyan-600 dark:text-cyan-400" />
                </div>
                <span className="truncate" title={audit.url}>
                  {truncateUrl(audit.url)}
                </span>
              </CardTitle>
            </div>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 shrink-0 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:text-gray-500 dark:hover:text-red-400 dark:hover:bg-red-950/30"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete Audit</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will permanently remove this audit for{' '}
                    <span className="font-semibold">{audit.url}</span> from your
                    history. This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={onDelete}
                    className="bg-red-600 text-white hover:bg-red-700"
                  >
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>

          {/* Date & time row */}
          <div className="mt-2 flex flex-wrap items-center gap-2 pl-10 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {formatDate(audit.createdAt)}
            </span>
            <span className="text-gray-300 dark:text-gray-600">·</span>
            <span>{formatTime(audit.createdAt)}</span>
            {isCurrent && (
              <Badge
                variant="secondary"
                className="h-5 bg-cyan-100 text-cyan-700 text-[10px] dark:bg-cyan-900/40 dark:text-cyan-300"
              >
                Current
              </Badge>
            )}
            {isComparing && (
              <Badge
                variant="secondary"
                className="h-5 bg-purple-100 text-purple-700 text-[10px] dark:bg-purple-900/40 dark:text-purple-300"
              >
                Comparing
              </Badge>
            )}
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* 5 Score badges */}
          <div className="grid grid-cols-5 gap-1.5">
            <ScoreBadge label="SEO" score={audit.seoScore} colorClass="blue" />
            <ScoreBadge label="AEO" score={audit.aeoScore} colorClass="purple" />
            <ScoreBadge label="GEO" score={audit.geoScore} colorClass="emerald" />
            <ScoreBadge label="AIO" score={audit.aioScore} colorClass="orange" />
            <ScoreBadge label="SXO" score={audit.sxoScore} colorClass="cyan" />
          </div>

          {/* Score dots row */}
          <div className="flex items-center gap-2 px-1">
            <ScoreDot score={audit.seoScore} label="SEO" />
            <ScoreDot score={audit.aeoScore} label="AEO" />
            <ScoreDot score={audit.geoScore} label="GEO" />
            <ScoreDot score={audit.aioScore} label="AIO" />
            <ScoreDot score={audit.sxoScore} label="SXO" />
            <span className="ml-auto text-xs font-semibold text-muted-foreground">
              Avg: {avgScore}
            </span>
          </div>

          {/* Stats row */}
          <div className="flex flex-wrap items-center gap-3 rounded-lg bg-gray-50 px-3 py-2 dark:bg-gray-800/50">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <BarChart3 className="h-3.5 w-3.5" />
              <span>{audit.pagesCrawled} pages</span>
            </div>
            <div className="h-3 w-px bg-gray-200 dark:bg-gray-700" />
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <ExternalLink className="h-3.5 w-3.5" />
              <span>{audit.totalLinks} links</span>
            </div>
            <div className="h-3 w-px bg-gray-200 dark:bg-gray-700" />
            <div
              className={`flex items-center gap-1.5 text-xs font-medium ${
                audit.criticalIssues > 0
                  ? 'text-red-600 dark:text-red-400'
                  : 'text-emerald-600 dark:text-emerald-400'
              }`}
            >
              <Zap className="h-3.5 w-3.5" />
              <span>{audit.criticalIssues} critical</span>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              className="flex-1 bg-gradient-to-r from-cyan-600 to-teal-500 text-white shadow-sm shadow-cyan-200 hover:from-cyan-700 hover:to-teal-600 dark:shadow-cyan-900/20"
              onClick={onView}
            >
              <BarChart3 className="mr-1.5 h-3.5 w-3.5" />
              View Results
            </Button>
            <Button
              size="sm"
              variant={isComparing ? 'default' : 'outline'}
              className={
                isComparing
                  ? 'flex-1 bg-gradient-to-r from-purple-600 to-pink-500 text-white shadow-sm shadow-purple-200 hover:from-purple-700 hover:to-pink-600 dark:shadow-purple-900/20'
                  : 'flex-1 border-gray-200 hover:border-purple-300 hover:bg-purple-50 hover:text-purple-700 dark:border-gray-700 dark:hover:border-purple-700 dark:hover:bg-purple-950/30 dark:hover:text-purple-300'
              }
              onClick={onCompare}
            >
              <GitCompareArrows className="mr-1.5 h-3.5 w-3.5" />
              {isComparing ? 'Comparing' : 'Compare'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export function AuditHistoryPage() {
  const { scanHistory, setCurrentAudit, setCompareAudit, setPage, setScanHistory } =
    useAuditStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('newest');

  const filteredAndSorted = useMemo(() => {
    let result = [...scanHistory];

    // Filter by URL search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (a) =>
          a.url.toLowerCase().includes(q) ||
          a.pageTitle.toLowerCase().includes(q)
      );
    }

    // Sort
    switch (sortBy) {
      case 'newest':
        result.sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        break;
      case 'oldest':
        result.sort(
          (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );
        break;
      case 'highest':
        result.sort(
          (a, b) =>
            (b.seoScore + b.aeoScore + b.geoScore + b.aioScore + b.sxoScore) -
            (a.seoScore + a.aeoScore + a.geoScore + a.aioScore + a.sxoScore)
        );
        break;
      case 'lowest':
        result.sort(
          (a, b) =>
            (a.seoScore + a.aeoScore + a.geoScore + a.aioScore + a.sxoScore) -
            (b.seoScore + b.aeoScore + b.geoScore + b.aioScore + b.sxoScore)
        );
        break;
    }

    return result;
  }, [scanHistory, searchQuery, sortBy]);

  const handleViewResults = (audit: AuditResult) => {
    setCurrentAudit(audit);
    setPage('home');
  };

  const handleCompare = (audit: AuditResult) => {
    const { compareAudit } = useAuditStore.getState();
    if (compareAudit?.id === audit.id) {
      setCompareAudit(null);
    } else {
      setCompareAudit(audit);
    }
    setPage('home');
  };

  const handleDeleteOne = (id: string) => {
    setScanHistory(scanHistory.filter((a) => a.id !== id));
  };

  const handleClearHistory = () => {
    setScanHistory([]);
  };

  const hasFilters = searchQuery.trim().length > 0;
  const isFilteredAndEmpty = scanHistory.length > 0 && filteredAndSorted.length === 0;

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Banner */}
      <section className="relative overflow-hidden bg-gradient-to-br from-cyan-600 via-cyan-700 to-teal-800 dark:from-cyan-900 dark:via-cyan-950 dark:to-teal-950">
        {/* Background mesh effect */}
        <div className="hero-mesh hero-grid absolute inset-0" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/5 dark:to-black/20" />

        <div className="relative mx-auto max-w-7xl px-4 pb-12 pt-10 sm:px-6 sm:pb-16 sm:pt-14 lg:px-8">
          {/* Breadcrumb */}
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Breadcrumb className="mb-6">
              <BreadcrumbList className="text-cyan-100/80">
                <BreadcrumbItem>
                  <BreadcrumbLink
                    className="text-cyan-100/80 hover:text-white transition-colors cursor-pointer"
                    onClick={() => setPage('home')}
                  >
                    <Home className="mr-1 h-3.5 w-3.5" />
                    Home
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="text-cyan-200/50">
                  <ChevronRight />
                </BreadcrumbSeparator>
                <BreadcrumbItem>
                  <BreadcrumbPage className="text-white font-medium">
                    Audit History
                  </BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </motion.div>

          {/* Title */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 shadow-lg shadow-black/5 backdrop-blur-sm sm:h-14 sm:w-14">
                <History className="h-6 w-6 text-white sm:h-7 sm:w-7" />
              </div>
              <div>
                <h1 className="text-2xl font-extrabold tracking-tight text-white sm:text-3xl">
                  Audit History
                </h1>
                <p className="mt-0.5 text-sm text-cyan-100/70">
                  Review and compare your past website audits
                </p>
              </div>
            </div>
            {scanHistory.length > 0 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: 0.3 }}
                className="sm:ml-auto"
              >
                <div className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-4 py-1.5 text-sm font-semibold text-white backdrop-blur-sm">
                  <BarChart3 className="h-4 w-4" />
                  {scanHistory.length} {scanHistory.length === 1 ? 'Scan' : 'Scans'}
                </div>
              </motion.div>
            )}
          </motion.div>
        </div>
      </section>

      {/* Main Content */}
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Filter / Sort Bar */}
        {scanHistory.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.15 }}
            className="mb-6 flex flex-col gap-3 rounded-xl border border-gray-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between dark:border-gray-800 dark:bg-gray-900"
          >
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by URL..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 h-9"
              />
              {hasFilters && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full p-0.5 text-muted-foreground hover:text-foreground hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                  <Filter className="h-3.5 w-3.5" />
                </button>
              )}
            </div>

            <div className="flex items-center gap-2">
              {/* Sort */}
              <div className="flex items-center gap-2">
                <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
                <Select value={sortBy} onValueChange={(v) => setSortBy(v as SortOption)}>
                  <SelectTrigger className="h-9 w-[160px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {sortOptions.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Clear History */}
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-9 border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 hover:border-red-300 dark:border-red-900 dark:text-red-400 dark:hover:bg-red-950/30 dark:hover:text-red-300 dark:hover:border-red-800"
                  >
                    <Trash2 className="mr-1.5 h-3.5 w-3.5" />
                    Clear History
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Clear All Audit History</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will permanently delete all {scanHistory.length} audit
                      records. This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleClearHistory}
                      className="bg-red-600 text-white hover:bg-red-700"
                    >
                      Clear All
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </motion.div>
        )}

        {/* Content area */}
        {scanHistory.length === 0 ? (
          /* Empty state */
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-200 bg-gray-50/50 px-6 py-20 dark:border-gray-800 dark:bg-gray-900/30"
          >
            <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-3xl bg-gradient-to-br from-cyan-50 to-teal-100 shadow-lg shadow-cyan-100/50 dark:from-cyan-900/30 dark:to-teal-900/20 dark:shadow-cyan-900/10">
              <History className="h-12 w-12 text-cyan-400 dark:text-cyan-500" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              No Audits Yet
            </h2>
            <p className="mt-2 max-w-sm text-center text-sm text-muted-foreground">
              Start by running your first website audit. Results will appear here so
              you can track your SEO performance over time.
            </p>
            <Button
              size="lg"
              className="mt-6 bg-gradient-to-r from-cyan-600 to-teal-500 text-white shadow-md shadow-cyan-200 hover:from-cyan-700 hover:to-teal-600 dark:shadow-cyan-900/30"
              onClick={() => setPage('home')}
            >
              <FileSearch className="mr-2 h-4 w-4" />
              Start Your First Audit
            </Button>
          </motion.div>
        ) : isFilteredAndEmpty ? (
          /* No results from filter */
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-200 bg-gray-50/50 px-6 py-16 dark:border-gray-800 dark:bg-gray-900/30"
          >
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gray-100 dark:bg-gray-800">
              <Search className="h-8 w-8 text-gray-300 dark:text-gray-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              No Matching Audits
            </h3>
            <p className="mt-1 text-sm text-muted-foreground">
              No audits found matching &quot;{searchQuery}&quot;. Try a different search term.
            </p>
            <Button
              variant="outline"
              size="sm"
              className="mt-4"
              onClick={() => setSearchQuery('')}
            >
              Clear Search
            </Button>
          </motion.div>
        ) : (
          /* Audit cards grid */
          <AnimatePresence mode="popLayout">
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
              {filteredAndSorted.map((audit, index) => (
                <AuditCard
                  key={audit.id}
                  audit={audit}
                  index={index}
                  onView={() => handleViewResults(audit)}
                  onCompare={() => handleCompare(audit)}
                  onDelete={() => handleDeleteOne(audit.id)}
                />
              ))}
            </div>
          </AnimatePresence>
        )}

        {/* Footer count when there are results */}
        {filteredAndSorted.length > 0 && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-8 text-center text-xs text-muted-foreground"
          >
            Showing {filteredAndSorted.length} of {scanHistory.length} audit
            {scanHistory.length !== 1 ? 's' : ''}
            {hasFilters && ' (filtered)'}
          </motion.p>
        )}
      </main>
    </div>
  );
}