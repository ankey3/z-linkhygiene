'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuditStore, type AuditResult } from '@/lib/store';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  Legend,
} from 'recharts';
import {
  GitCompareArrows,
  Globe,
  Loader2,
  CheckCircle2,
  TrendingUp,
  TrendingDown,
  Minus,
  Link2,
  AlertCircle,
  AlertTriangle,
  Shield,
  Trophy,
  ArrowRight,
} from 'lucide-react';

interface CompetitorComparisonProps {
  audit: AuditResult | null;
}

const SCORE_KEYS = [
  { key: 'seoScore' as const, label: 'SEO', color: '#06b6d4' },
  { key: 'aeoScore' as const, label: 'AEO', color: '#10b981' },
  { key: 'geoScore' as const, label: 'GEO', color: '#f59e0b' },
  { key: 'aioScore' as const, label: 'AIO', color: '#8b5cf6' },
  { key: 'sxoScore' as const, label: 'SXO', color: '#ef4444' },
];

const METRIC_KEYS = [
  { key: 'totalLinks' as const, label: 'Total Links', icon: Link2, higherIsBetter: true },
  { key: 'validLinks' as const, label: 'Valid Links', icon: CheckCircle2, higherIsBetter: true },
  { key: 'criticalIssues' as const, label: 'Critical Issues', icon: AlertCircle, higherIsBetter: false },
  { key: 'warnings' as const, label: 'Warnings', icon: AlertTriangle, higherIsBetter: false },
];

function WinnerBadge({ yours, competitor, higherIsBetter }: { yours: number; competitor: number; higherIsBetter: boolean }) {
  const youWin = higherIsBetter ? yours > competitor : yours < competitor;
  const theyWin = higherIsBetter ? competitor > yours : competitor < yours;
  const isTie = yours === competitor;

  if (isTie) {
    return (
      <span className="inline-flex items-center gap-1 text-[10px] font-medium text-gray-400 dark:text-gray-500">
        <Minus className="h-3 w-3" /> Tie
      </span>
    );
  }

  return (
    <motion.span
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold ${
        youWin
          ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
          : 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400'
      }`}
    >
      <CheckCircle2 className="h-3 w-3" />
      {youWin ? 'You' : 'Competitor'}
    </motion.span>
  );
}

function ScoreBar({ label, yourScore, competitorScore, color }: { label: string; yourScore: number; competitorScore: number; color: string }) {
  const youWin = yourScore > competitorScore;
  const theyWin = competitorScore > yourScore;
  const isTie = yourScore === competitorScore;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">{label}</span>
        <div className="flex items-center gap-2">
          <span className={`text-sm font-bold ${youWin ? 'text-emerald-600 dark:text-emerald-400' : theyWin ? 'text-red-500 dark:text-red-400' : 'text-gray-500 dark:text-gray-400'}`}>
            {yourScore}
          </span>
          <span className="text-[10px] text-gray-400 dark:text-gray-500">vs</span>
          <span className={`text-sm font-bold ${theyWin ? 'text-emerald-600 dark:text-emerald-400' : youWin ? 'text-red-500 dark:text-red-400' : 'text-gray-500 dark:text-gray-400'}`}>
            {competitorScore}
          </span>
          {!isTie && (
            <motion.span
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', stiffness: 200, damping: 15 }}
            >
              {youWin ? (
                <TrendingUp className="h-3.5 w-3.5 text-emerald-500" />
              ) : (
                <TrendingDown className="h-3.5 w-3.5 text-red-500" />
              )}
            </motion.span>
          )}
        </div>
      </div>
      {/* Dual progress bars */}
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <span className="w-8 text-right text-[9px] font-medium text-gray-400 dark:text-gray-500">You</span>
          <div className="flex-1 h-3 overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${yourScore}%` }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              className="h-full rounded-full"
              style={{ backgroundColor: youWin || isTie ? color : `${color}66` }}
            />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-8 text-right text-[9px] font-medium text-gray-400 dark:text-gray-500">Comp</span>
          <div className="flex-1 h-3 overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${competitorScore}%` }}
              transition={{ duration: 0.8, ease: 'easeOut', delay: 0.15 }}
              className="h-full rounded-full"
              style={{ backgroundColor: theyWin || isTie ? color : `${color}66` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function MetricRow({ label, yourVal, competitorVal, icon: Icon, higherIsBetter }: {
  label: string;
  yourVal: number;
  competitorVal: number;
  icon: typeof Link2;
  higherIsBetter: boolean;
}) {
  const youWin = higherIsBetter ? yourVal > competitorVal : yourVal < competitorVal;
  const theyWin = higherIsBetter ? competitorVal > yourVal : competitorVal < yourVal;

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      className={`flex items-center justify-between rounded-lg border p-3 transition-colors ${
        youWin
          ? 'border-emerald-200 bg-emerald-50/50 dark:border-emerald-800/50 dark:bg-emerald-950/20'
          : theyWin
            ? 'border-orange-200 bg-orange-50/50 dark:border-orange-800/50 dark:bg-orange-950/20'
            : 'border-gray-100 bg-white dark:border-gray-800 dark:bg-gray-900'
      }`}
    >
      <div className="flex items-center gap-2">
        <Icon className={`h-4 w-4 ${youWin ? 'text-emerald-500' : theyWin ? 'text-orange-500' : 'text-gray-400'}`} />
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{label}</span>
      </div>
      <div className="flex items-center gap-3">
        <div className="text-right">
          <span className={`text-sm font-bold ${youWin ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-900 dark:text-white'}`}>
            {yourVal}
          </span>
        </div>
        <ArrowRight className="h-3 w-3 text-gray-300 dark:text-gray-600" />
        <div className="text-left">
          <span className={`text-sm font-bold ${theyWin ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-900 dark:text-white'}`}>
            {competitorVal}
          </span>
        </div>
        <WinnerBadge yours={yourVal} competitor={competitorVal} higherIsBetter={higherIsBetter} />
      </div>
    </motion.div>
  );
}

function ComparisonChart({ yourAudit, competitorAudit }: { yourAudit: AuditResult; competitorAudit: AuditResult }) {
  const data = SCORE_KEYS.map(({ key, label, color }) => ({
    name: label,
    yours: yourAudit[key],
    competitor: competitorAudit[key],
    color,
  }));

  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={data} barGap={4} barCategoryGap="20%">
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" opacity={0.5} />
        <XAxis
          dataKey="name"
          tick={{ fontSize: 11, fill: '#6b7280' }}
          axisLine={{ stroke: '#d1d5db' }}
        />
        <YAxis
          domain={[0, 100]}
          tick={{ fontSize: 10, fill: '#9ca3af' }}
          axisLine={{ stroke: '#d1d5db' }}
        />
        <Tooltip
          contentStyle={{
            fontSize: 11,
            borderRadius: 8,
            border: '1px solid #e5e7eb',
            boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
          }}
          formatter={(value: number, name: string) => [`${value}%`, name === 'yours' ? 'Your Site' : 'Competitor']}
        />
        <Legend
          formatter={(value: string) => value === 'yours' ? 'Your Site' : 'Competitor'}
          iconType="circle"
          iconSize={8}
          wrapperStyle={{ fontSize: 11 }}
        />
        <Bar dataKey="yours" radius={[4, 4, 0, 0]} maxBarSize={24}>
          {data.map((entry, index) => (
            <Cell key={`yours-${index}`} fill={entry.color} opacity={0.9} />
          ))}
        </Bar>
        <Bar dataKey="competitor" radius={[4, 4, 0, 0]} maxBarSize={24}>
          {data.map((entry, index) => (
            <Cell key={`comp-${index}`} fill={entry.color} opacity={0.45} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

function AdvantagesSummary({ yourAudit, competitorAudit }: { yourAudit: AuditResult; competitorAudit: AuditResult }) {
  const yourAdvantages: string[] = [];
  const competitorAdvantages: string[] = [];

  SCORE_KEYS.forEach(({ key, label }) => {
    if (yourAudit[key] > competitorAudit[key]) {
      yourAdvantages.push(`${label}: +${yourAudit[key] - competitorAudit[key]} points`);
    } else if (competitorAudit[key] > yourAudit[key]) {
      competitorAdvantages.push(`${label}: +${competitorAudit[key] - yourAudit[key]} points`);
    }
  });

  METRIC_KEYS.forEach(({ key, label, higherIsBetter }) => {
    const yours = yourAudit[key];
    const comp = competitorAudit[key];
    if (higherIsBetter ? yours > comp : yours < comp) {
      yourAdvantages.push(`${label}: ${Math.abs(yours - comp)} better`);
    } else if (higherIsBetter ? comp > yours : comp < yours) {
      competitorAdvantages.push(`${label}: ${Math.abs(yours - comp)} better`);
    }
  });

  const yourTotal = SCORE_KEYS.reduce((sum, { key }) => sum + yourAudit[key], 0);
  const compTotal = SCORE_KEYS.reduce((sum, { key }) => sum + competitorAudit[key], 0);
  const youWinOverall = yourTotal >= compTotal;

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className={`rounded-xl border p-4 ${
          youWinOverall
            ? 'border-emerald-200 bg-emerald-50/50 dark:border-emerald-800/50 dark:bg-emerald-950/20'
            : 'border-gray-100 bg-white dark:border-gray-800 dark:bg-gray-900'
        }`}
      >
        <div className="mb-3 flex items-center gap-2">
          {youWinOverall && <Trophy className="h-4 w-4 text-emerald-500" />}
          <Shield className={`h-4 w-4 ${youWinOverall ? 'text-emerald-500' : 'text-gray-400'}`} />
          <h4 className="text-sm font-bold text-gray-900 dark:text-white">Your Site</h4>
          <Badge variant="outline" className={`text-[9px] font-bold ${
            youWinOverall
              ? 'border-emerald-200 bg-emerald-100 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400'
              : 'border-gray-200 bg-gray-100 text-gray-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400'
          }`}>
            {yourTotal} pts
          </Badge>
        </div>
        {yourAdvantages.length > 0 ? (
          <ul className="space-y-1">
            {yourAdvantages.map((adv, i) => (
              <motion.li
                key={i}
                initial={{ opacity: 0, x: -5 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + i * 0.05 }}
                className="flex items-center gap-1.5 text-xs text-emerald-700 dark:text-emerald-400"
              >
                <CheckCircle2 className="h-3 w-3 shrink-0" />
                {adv}
              </motion.li>
            ))}
          </ul>
        ) : (
          <p className="text-xs text-gray-400 dark:text-gray-500">No advantages found</p>
        )}
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className={`rounded-xl border p-4 ${
          !youWinOverall
            ? 'border-emerald-200 bg-emerald-50/50 dark:border-emerald-800/50 dark:bg-emerald-950/20'
            : 'border-gray-100 bg-white dark:border-gray-800 dark:bg-gray-900'
        }`}
      >
        <div className="mb-3 flex items-center gap-2">
          {!youWinOverall && <Trophy className="h-4 w-4 text-emerald-500" />}
          <Globe className={`h-4 w-4 ${!youWinOverall ? 'text-emerald-500' : 'text-gray-400'}`} />
          <h4 className="text-sm font-bold text-gray-900 dark:text-white">Competitor</h4>
          <Badge variant="outline" className={`text-[9px] font-bold ${
            !youWinOverall
              ? 'border-emerald-200 bg-emerald-100 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400'
              : 'border-gray-200 bg-gray-100 text-gray-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400'
          }`}>
            {compTotal} pts
          </Badge>
        </div>
        {competitorAdvantages.length > 0 ? (
          <ul className="space-y-1">
            {competitorAdvantages.map((adv, i) => (
              <motion.li
                key={i}
                initial={{ opacity: 0, x: -5 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 + i * 0.05 }}
                className="flex items-center gap-1.5 text-xs text-orange-700 dark:text-orange-400"
              >
                <AlertCircle className="h-3 w-3 shrink-0" />
                {adv}
              </motion.li>
            ))}
          </ul>
        ) : (
          <p className="text-xs text-gray-400 dark:text-gray-500">No advantages found</p>
        )}
      </motion.div>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center gap-3">
        <Skeleton className="h-5 w-5 rounded-full" />
        <Skeleton className="h-5 w-40" />
      </div>
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="space-y-1.5">
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-2.5 w-full" />
            <Skeleton className="h-2.5 w-3/4" />
          </div>
        ))}
      </div>
      <Skeleton className="h-48 w-full rounded-lg" />
      <div className="space-y-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-12 w-full rounded-lg" />
        ))}
      </div>
    </div>
  );
}

export function CompetitorComparison({ audit }: CompetitorComparisonProps) {
  const [competitorUrl, setCompetitorUrl] = useState('');
  const [isComparing, setIsComparing] = useState(false);
  const [competitorAudit, setCompetitorAudit] = useState<AuditResult | null>(null);

  if (!audit) return null;

  const handleCompare = async () => {
    if (!competitorUrl.trim()) {
      toast.error('Please enter a competitor URL');
      return;
    }

    let scanUrl = competitorUrl.trim();
    if (!scanUrl.startsWith('http://') && !scanUrl.startsWith('https://')) {
      scanUrl = 'https://' + scanUrl;
      setCompetitorUrl(scanUrl);
    }

    // Don't compare same URL
    if (scanUrl.replace(/\/+$/, '') === audit.url.replace(/\/+$/, '')) {
      toast.error('Please enter a different URL than your current audit');
      return;
    }

    setIsComparing(true);
    setCompetitorAudit(null);

    try {
      const res = await fetch('/api/audit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: scanUrl, crawlAll: false }),
      });
      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || 'Competitor scan failed');
        return;
      }

      setCompetitorAudit(data.data);
      toast.success('Competitor scan complete! Showing comparison.');
    } catch {
      toast.error('Network error scanning competitor. Please try again.');
    } finally {
      setIsComparing(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleCompare();
  };

  const handleReset = () => {
    setCompetitorAudit(null);
    setCompetitorUrl('');
  };

  return (
    <Card className="card-hover-lift border-cyan-100 shadow-md shadow-cyan-50/50 dark:border-gray-800 dark:shadow-none">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base font-bold text-gray-900 dark:text-white">
          <GitCompareArrows className="h-5 w-5 text-cyan-600 dark:text-cyan-400" />
          Competitor Comparison
          {competitorAudit && (
            <Badge variant="outline" className="ml-1 border-emerald-200 bg-emerald-50 text-[9px] font-bold text-emerald-700 dark:border-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400">
              Active
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* URL Input */}
        <div className="flex flex-col gap-2 sm:flex-row">
          <div className="relative flex-1">
            <Globe className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 dark:text-gray-500" />
            <Input
              placeholder="Enter competitor URL (e.g., competitor.com)"
              value={competitorUrl}
              onChange={(e) => setCompetitorUrl(e.target.value)}
              onKeyDown={handleKeyDown}
              className="h-10 pl-10 pr-4 text-sm shadow-sm transition-all focus-visible:ring-cyan-400 dark:bg-gray-900 dark:border-gray-700"
              disabled={isComparing}
            />
          </div>
          <div className="flex gap-2">
            <Button
              onClick={handleCompare}
              disabled={isComparing || !competitorUrl.trim()}
              className="btn-press h-10 gap-2 bg-cyan-600 px-6 font-semibold text-white hover:bg-cyan-700 dark:bg-cyan-600 dark:hover:bg-cyan-700"
            >
              {isComparing ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Scanning...
                </>
              ) : (
                <>
                  <GitCompareArrows className="h-4 w-4" />
                  Compare
                </>
              )}
            </Button>
            {competitorAudit && (
              <Button
                onClick={handleReset}
                variant="outline"
                size="sm"
                className="h-10 gap-1.5 border-gray-200 text-gray-600 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-800"
              >
                Reset
              </Button>
            )}
          </div>
        </div>

        {/* Loading Skeleton */}
        <AnimatePresence mode="wait">
          {isComparing && (
            <motion.div
              key="loading"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mt-6"
            >
              <div className="rounded-lg border border-cyan-100 bg-cyan-50/30 p-3 dark:border-cyan-900/50 dark:bg-cyan-950/20">
                <div className="flex items-center gap-2 text-xs font-medium text-cyan-700 dark:text-cyan-300">
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  Scanning competitor site... This may take a moment.
                </div>
              </div>
              <LoadingSkeleton />
            </motion.div>
          )}

          {/* Comparison Results */}
          {competitorAudit && !isComparing && (
            <motion.div
              key="results"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
              className="mt-6 space-y-6"
            >
              {/* Competitor URL badge */}
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Comparing with:</span>
                <Badge variant="outline" className="gap-1 border-cyan-200 bg-cyan-50 text-[10px] font-semibold text-cyan-700 dark:border-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-400">
                  <Globe className="h-3 w-3" />
                  {competitorAudit.url}
                </Badge>
              </div>

              {/* Score Comparison Bars */}
              <div>
                <h3 className="mb-4 text-sm font-bold text-gray-900 dark:text-white">Score Comparison</h3>
                <div className="space-y-4">
                  {SCORE_KEYS.map(({ key, label, color }, index) => (
                    <motion.div
                      key={key}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1, duration: 0.4 }}
                    >
                      <ScoreBar
                        label={label}
                        yourScore={audit[key]}
                        competitorScore={competitorAudit[key]}
                        color={color}
                      />
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Chart Comparison */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5, duration: 0.4 }}
              >
                <h3 className="mb-3 text-sm font-bold text-gray-900 dark:text-white">Visual Score Comparison</h3>
                <div className="rounded-xl border border-gray-100 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
                  <ComparisonChart yourAudit={audit} competitorAudit={competitorAudit} />
                </div>
              </motion.div>

              {/* Key Metrics Comparison */}
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6, duration: 0.4 }}
              >
                <h3 className="mb-3 text-sm font-bold text-gray-900 dark:text-white">Key Metrics Comparison</h3>
                <div className="space-y-2">
                  {METRIC_KEYS.map(({ key, label, icon, higherIsBetter }, index) => (
                    <motion.div
                      key={key}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.7 + index * 0.08 }}
                    >
                      <MetricRow
                        label={label}
                        yourVal={audit[key]}
                        competitorVal={competitorAudit[key]}
                        icon={icon}
                        higherIsBetter={higherIsBetter}
                      />
                    </motion.div>
                  ))}
                </div>
              </motion.div>

              {/* Advantages Summary */}
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.9, duration: 0.4 }}
              >
                <h3 className="mb-3 text-sm font-bold text-gray-900 dark:text-white">Advantages Summary</h3>
                <AdvantagesSummary yourAudit={audit} competitorAudit={competitorAudit} />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
}
