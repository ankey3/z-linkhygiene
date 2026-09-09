'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { type AuditResult } from '@/lib/store';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, AlertTriangle, ArrowRight, Clock, RefreshCw, Zap, Globe, Bot, Wrench } from 'lucide-react';

interface Recommendation {
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  category: 'on-page' | 'off-page' | 'technical' | 'ai-readiness';
  estimatedTimeToFix: string;
}

interface RecommendationsResponse {
  summary: string;
  recommendations: Recommendation[];
}

const impactConfig = {
  high: {
    color: 'bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800',
    dot: 'bg-red-500',
    label: 'High Impact',
    icon: Zap,
  },
  medium: {
    color: 'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800',
    dot: 'bg-amber-500',
    label: 'Medium Impact',
    icon: AlertTriangle,
  },
  low: {
    color: 'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800',
    dot: 'bg-emerald-500',
    label: 'Low Impact',
    icon: ArrowRight,
  },
};

const categoryConfig = {
  'on-page': {
    color: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400',
    icon: Globe,
    label: 'On-Page',
  },
  'off-page': {
    color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
    icon: Globe,
    label: 'Off-Page',
  },
  'technical': {
    color: 'bg-slate-100 text-slate-700 dark:bg-slate-800/50 dark:text-slate-400',
    icon: Wrench,
    label: 'Technical',
  },
  'ai-readiness': {
    color: 'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400',
    icon: Bot,
    label: 'AI Readiness',
  },
};

function LoadingSkeleton() {
  return (
    <div className="space-y-4 p-6">
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-3 w-full" />
      <div className="space-y-3 pt-2">
        {[0, 1, 2, 3, 4].map((i) => (
          <div key={i} className="space-y-2 rounded-lg border border-gray-100 p-4 dark:border-gray-800">
            <div className="flex items-center gap-2">
              <Skeleton className="h-5 w-20 rounded-full" />
              <Skeleton className="h-5 w-16 rounded-full" />
            </div>
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-1/3" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function AiRecommendations({ audit }: { audit: AuditResult | null }) {
  const [data, setData] = useState<RecommendationsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!audit) return null;

  const fetchRecommendations = async () => {
    setIsLoading(true);
    setError(null);
    setData(null);

    try {
      const response = await fetch('/api/audit/recommendations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ auditData: audit }),
      });

      if (!response.ok) {
        const errBody = await response.json().catch(() => ({}));
        if (response.status === 429) {
          throw new Error('Rate limit reached. Please wait a minute before trying again.');
        }
        throw new Error(errBody.error || `Request failed (${response.status})`);
      }

      const result: RecommendationsResponse = await response.json();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get recommendations');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="card-hover-lift border-violet-100 shadow-md shadow-violet-50/50 dark:border-violet-900/40 dark:shadow-violet-950/20">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-3">
          <div>
            <CardTitle className="flex items-center gap-2 text-base font-bold text-gray-900 dark:text-white">
              <Sparkles className="h-5 w-5 text-violet-500" />
              AI Recommendations
            </CardTitle>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Personalized SEO suggestions powered by AI analysis of your audit data.
            </p>
          </div>
          {!isLoading && (
            <Button
              onClick={fetchRecommendations}
              size="sm"
              className="btn-press shrink-0 gap-1.5 bg-violet-600 text-white hover:bg-violet-700 dark:bg-violet-700 dark:hover:bg-violet-800"
            >
              {data ? (
                <>
                  <RefreshCw className="h-3.5 w-3.5" />
                  Refresh
                </>
              ) : (
                <>
                  <Sparkles className="h-3.5 w-3.5" />
                  Get AI Recommendations
                </>
              )}
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {/* Loading state */}
        {isLoading && <LoadingSkeleton />}

        {/* Error state */}
        <AnimatePresence>
          {error && !isLoading && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-800 dark:bg-red-950/30 dark:text-red-400"
            >
              <p className="font-medium">Unable to generate recommendations</p>
              <p className="mt-1 text-xs">{error}</p>
              <Button
                onClick={fetchRecommendations}
                variant="outline"
                size="sm"
                className="mt-3 gap-1.5 border-red-200 text-red-700 hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-950"
              >
                <RefreshCw className="h-3 w-3" />
                Try Again
              </Button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Results */}
        <AnimatePresence>
          {data && !isLoading && !error && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
              className="space-y-5"
            >
              {/* Summary */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1, duration: 0.4 }}
                className="rounded-lg border border-violet-100 bg-gradient-to-r from-violet-50/80 to-purple-50/50 p-4 dark:border-violet-900/40 dark:from-violet-950/30 dark:to-purple-950/20"
              >
                <p className="text-sm leading-relaxed text-gray-700 dark:text-gray-300">{data.summary}</p>
              </motion.div>

              {/* Recommendations */}
              <div className="space-y-3">
                {data.recommendations.map((rec, i) => {
                  const impact = impactConfig[rec.impact];
                  const category = categoryConfig[rec.category];
                  const ImpactIcon = impact.icon;
                  const CategoryIcon = category.icon;

                  return (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.15 + i * 0.08, duration: 0.4, ease: 'easeOut' }}
                      className="group rounded-lg border border-gray-100 bg-white p-4 transition-all hover:border-violet-200 hover:shadow-sm dark:border-gray-800 dark:bg-gray-900/50 dark:hover:border-violet-800/50"
                    >
                      {/* Badges row */}
                      <div className="mb-2 flex flex-wrap items-center gap-2">
                        <span
                          className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-semibold ${impact.color}`}
                        >
                          <span className={`h-1.5 w-1.5 rounded-full ${impact.dot}`} />
                          {impact.label}
                        </span>
                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium ${category.color}`}
                        >
                          <CategoryIcon className="h-3 w-3" />
                          {category.label}
                        </span>
                      </div>

                      {/* Title */}
                      <h4 className="flex items-start gap-2 text-sm font-semibold text-gray-900 dark:text-white">
                        <ImpactIcon className="mt-0.5 h-4 w-4 shrink-0 text-violet-500" />
                        {rec.title}
                      </h4>

                      {/* Description */}
                      <p className="mt-1.5 pl-6 text-xs leading-relaxed text-gray-500 dark:text-gray-400">
                        {rec.description}
                      </p>

                      {/* Estimated time */}
                      <div className="mt-2 flex items-center gap-1.5 pl-6 text-[10px] text-gray-400 dark:text-gray-500">
                        <Clock className="h-3 w-3" />
                        <span>Estimated time: {rec.estimatedTimeToFix}</span>
                      </div>
                    </motion.div>
                  );
                })}
              </div>

              {/* Total time estimate */}
              {data.recommendations.length > 0 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6, duration: 0.3 }}
                  className="flex items-center justify-end gap-1.5 text-xs text-gray-400 dark:text-gray-500"
                >
                  <Clock className="h-3.5 w-3.5" />
                  <span>
                    {data.recommendations.length} recommendations · prioritize high-impact items first
                  </span>
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Empty / initial state */}
        {!data && !isLoading && !error && (
          <div className="flex flex-col items-center rounded-lg border-2 border-dashed border-violet-100 bg-violet-50/30 py-10 dark:border-violet-900/30 dark:bg-violet-950/10">
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-violet-100 dark:bg-violet-900/40">
              <Sparkles className="h-6 w-6 text-violet-500" />
            </div>
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
              AI-Powered Recommendations
            </p>
            <p className="mt-1 max-w-sm text-center text-xs text-gray-500 dark:text-gray-400">
              Get personalized, actionable SEO suggestions based on your audit results.
              Our AI analyzes your scores, issues, and content to prioritize the fixes that matter most.
            </p>
            <Button
              onClick={fetchRecommendations}
              size="sm"
              className="btn-press mt-4 gap-1.5 bg-violet-600 text-white hover:bg-violet-700 dark:bg-violet-700 dark:hover:bg-violet-800"
            >
              <Sparkles className="h-3.5 w-3.5" />
              Generate Recommendations
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
