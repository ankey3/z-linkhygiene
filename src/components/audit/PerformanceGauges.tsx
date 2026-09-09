'use client';

import { useEffect, useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { motion } from 'framer-motion';
import type { AuditResult } from '@/lib/store';

/* ─── helpers ─── */

function getGaugeColor(score: number): { fill: string; bg: string; text: string; label: string } {
  if (score >= 90) return { fill: '#22c55e', bg: '#22c55e20', text: 'text-emerald-600 dark:text-emerald-400', label: 'Good' };
  if (score >= 50) return { fill: '#f59e0b', bg: '#f59e0b20', text: 'text-amber-600 dark:text-amber-400', label: 'Needs work' };
  return { fill: '#ef4444', bg: '#ef444420', text: 'text-red-600 dark:text-red-400', label: 'Poor' };
}

function getMetricRating(value: number, thresholds: [number, number]): { rating: 'good' | 'needs-improvement' | 'poor'; color: string; bgColor: string } {
  if (value <= thresholds[0]) return { rating: 'good', color: '#22c55e', bgColor: 'bg-emerald-500' };
  if (value <= thresholds[1]) return { rating: 'needs-improvement', color: '#f59e0b', bgColor: 'bg-amber-500' };
  return { rating: 'poor', color: '#ef4444', bgColor: 'bg-red-500' };
}

/* ─── score calculations ─── */

function calcAccessibilityScore(audit: AuditResult): number {
  let score = 100;
  // Penalize missing alt tags
  if (audit.imageCount > 0) {
    const altRatio = (audit.imageCount - audit.imagesMissingAlt) / audit.imageCount;
    score -= (1 - altRatio) * 40; // up to -40
  }
  // Penalize bad heading hierarchy
  if (audit.h1Count === 0) score -= 20;
  else if (audit.h1Count > 1) score -= 10;
  // Penalize missing page title
  if (!audit.pageTitle || audit.pageTitle.trim().length === 0) score -= 15;
  // Penalize missing meta description
  if (!audit.metaDescription || audit.metaDescription.trim().length === 0) score -= 15;
  // Bonus: checks from seoChecks
  const passCount = audit.seoChecks.filter(c => c.status === 'PASS').length;
  const totalChecks = audit.seoChecks.length || 1;
  const checkScore = (passCount / totalChecks) * 10;
  score = score * 0.9 + checkScore; // blend
  return Math.max(0, Math.min(100, Math.round(score)));
}

function calcBestPracticesScore(audit: AuditResult): number {
  let score = 0;
  let max = 0;
  // HTTPS
  max += 25; if (audit.hasHttps) score += 25;
  // Canonical
  max += 25; if (audit.hasCanonical) score += 25;
  // Viewport
  max += 25; if (audit.hasViewport) score += 25;
  // Indexable
  max += 25; if (audit.isIndexable) score += 25;
  return Math.round((score / max) * 100);
}

/* ─── Core Web Vitals proxy ─── */

interface CwvMetric {
  name: string;
  shortName: string;
  value: string;
  numericValue: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  color: string;
  bgColor: string;
  description: string;
}

function estimateCoreWebVitals(audit: AuditResult): CwvMetric[] {
  // Heuristic estimates based on audit data
  const totalLinks = audit.totalLinks || 1;
  const brokenRatio = (audit.criticalIssues + audit.malformedLinks + audit.error404Links) / totalLinks;

  // LCP estimate: base 1.2s, worsened by many links, no https, missing viewport
  let lcp = 1.2;
  if (!audit.hasHttps) lcp += 0.3;
  if (!audit.hasViewport) lcp += 0.8;
  lcp += brokenRatio * 2;
  lcp += (audit.imageCount > 20 ? 0.5 : audit.imageCount > 10 ? 0.2 : 0);
  lcp = Math.round(lcp * 100) / 100;

  // FID estimate: base 30ms, worsened by heavy pages
  let fid = 30;
  fid += (audit.totalLinks > 100 ? 80 : audit.totalLinks > 50 ? 40 : 10);
  fid += (audit.imagesMissingAlt > 5 ? 20 : 0);
  fid = Math.round(fid);

  // CLS estimate: base 0.02, worsened by missing viewport, many images without alt
  let cls = 0.02;
  if (!audit.hasViewport) cls += 0.15;
  cls += (audit.imagesMissingAlt / Math.max(audit.imageCount, 1)) * 0.1;
  cls += brokenRatio * 0.05;
  cls = Math.round(cls * 1000) / 1000;

  const lcpRating = getMetricRating(lcp, [2.5, 4.0]);
  const fidRating = getMetricRating(fid, [100, 300]);
  const clsRating = getMetricRating(cls, [0.1, 0.25]);

  return [
    {
      name: 'Largest Contentful Paint',
      shortName: 'LCP',
      value: `${lcp}s`,
      numericValue: lcp,
      ...lcpRating,
      description: 'Time when the largest content element becomes visible',
    },
    {
      name: 'First Input Delay',
      shortName: 'FID',
      value: `${fid}ms`,
      numericValue: fid,
      ...fidRating,
      description: 'Time from first user interaction to browser response',
    },
    {
      name: 'Cumulative Layout Shift',
      shortName: 'CLS',
      value: cls.toFixed(3),
      numericValue: cls,
      ...clsRating,
      description: 'Visual stability score — how much content shifts during load',
    },
  ];
}

/* ─── Gauge SVG Component ─── */

function GaugeMeter({
  score,
  label,
  delay = 0,
}: {
  score: number;
  label: string;
  delay?: number;
}) {
  const [animated, setAnimated] = useState(0);
  const colors = getGaugeColor(score);

  useEffect(() => {
    const timer = setTimeout(() => setAnimated(score), 100 + delay * 150);
    return () => clearTimeout(timer);
  }, [score, delay]);

  // Semi-circle gauge parameters
  const radius = 56;
  const stroke = 8;
  const center = 64;
  const circumference = Math.PI * radius; // half circle
  const progress = (animated / 100) * circumference;
  const startAngle = -180; // left side
  const endAngle = 0; // right side

  // SVG arc path for background
  const describeArc = (cx: number, cy: number, r: number, startA: number, endA: number) => {
    const rad = (deg: number) => (deg * Math.PI) / 180;
    const x1 = cx + r * Math.cos(rad(startA));
    const y1 = cy + r * Math.sin(rad(startA));
    const x2 = cx + r * Math.cos(rad(endA));
    const y2 = cy + r * Math.sin(rad(endA));
    return `M ${x1} ${y1} A ${r} ${r} 0 0 1 ${x2} ${y2}`;
  };

  // Progress arc
  const progressAngle = startAngle + (animated / 100) * 180;
  const progressPath = animated > 0 ? describeArc(center, center, radius, startAngle, progressAngle) : '';

  return (
    <div className="flex flex-col items-center gap-1.5">
      <div className="relative h-[80px] w-[128px]">
        <svg viewBox="0 0 128 80" className="h-full w-full">
          {/* Background arc */}
          <path
            d={describeArc(center, center, radius, startAngle, endAngle)}
            fill="none"
            stroke="currentColor"
            strokeWidth={stroke}
            strokeLinecap="round"
            className="text-gray-100 dark:text-gray-800"
          />
          {/* Colored progress arc */}
          {animated > 0 && (
            <motion.path
              d={describeArc(center, center, radius, startAngle, endAngle)}
              fill="none"
              stroke={colors.fill}
              strokeWidth={stroke}
              strokeLinecap="round"
              pathLength={circumference}
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: animated / 100, opacity: 1 }}
              transition={{ duration: 1.2, delay: delay * 0.15, ease: [0.4, 0, 0.2, 1] }}
            />
          )}
        </svg>
        {/* Score text in center */}
        <div className="absolute inset-0 flex flex-col items-center justify-end pb-0.5">
          <motion.span
            className={`text-2xl font-bold tabular-nums ${colors.text}`}
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: delay * 0.15 + 0.3 }}
          >
            {Math.round(animated)}
          </motion.span>
        </div>
      </div>
      <div className="text-center">
        <span className="block text-xs font-bold text-gray-800 dark:text-gray-200">{label}</span>
        <span
          className="mt-0.5 inline-block rounded-full px-2 py-0.5 text-[9px] font-semibold"
          style={{ backgroundColor: colors.bg, color: colors.fill }}
        >
          {colors.label}
        </span>
      </div>
    </div>
  );
}

/* ─── Metric Bar ─── */

function MetricBar({ metric }: { metric: CwvMetric }) {
  // Calculate bar fill percentage based on rating
  let barPercent: number;
  if (metric.rating === 'good') barPercent = 30 + Math.random() * 15;
  else if (metric.rating === 'needs-improvement') barPercent = 50 + Math.random() * 15;
  else barPercent = 75 + Math.random() * 15;

  // Deterministic based on metric name
  if (metric.shortName === 'LCP') barPercent = metric.rating === 'good' ? 25 : metric.rating === 'needs-improvement' ? 55 : 80;
  if (metric.shortName === 'FID') barPercent = metric.rating === 'good' ? 20 : metric.rating === 'needs-improvement' ? 50 : 75;
  if (metric.shortName === 'CLS') barPercent = metric.rating === 'good' ? 15 : metric.rating === 'needs-improvement' ? 45 : 70;

  const ratingLabel = metric.rating === 'good' ? 'Good' : metric.rating === 'needs-improvement' ? 'Needs Improvement' : 'Poor';

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-gray-800 dark:text-gray-200">{metric.shortName}</span>
          <span className="text-[10px] text-gray-400 dark:text-gray-500">{metric.name}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold tabular-nums" style={{ color: metric.color }}>
            {metric.value}
          </span>
          <span
            className="rounded-full px-1.5 py-0.5 text-[9px] font-semibold"
            style={{ backgroundColor: metric.color + '20', color: metric.color }}
          >
            {ratingLabel}
          </span>
        </div>
      </div>
      {/* Bar */}
      <div className="h-2 w-full overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800">
        <motion.div
          className="h-full rounded-full"
          style={{ backgroundColor: metric.color }}
          initial={{ width: '0%' }}
          animate={{ width: `${barPercent}%` }}
          transition={{ duration: 0.8, delay: 0.5, ease: [0.4, 0, 0.2, 1] }}
        />
      </div>
      <p className="text-[10px] text-gray-400 dark:text-gray-500">{metric.description}</p>
    </div>
  );
}

/* ─── Main Component ─── */

export function PerformanceGauges({ audit }: { audit: AuditResult | null }) {
  const scores = useMemo(() => {
    if (!audit) return null;

    const performance = audit.sxoScore; // SXO as Core Web Vitals proxy
    const accessibility = calcAccessibilityScore(audit);
    const bestPractices = calcBestPracticesScore(audit);
    const seo = audit.seoScore;

    return { performance, accessibility, bestPractices, seo };
  }, [audit]);

  const metrics = useMemo(() => {
    if (!audit) return [];
    return estimateCoreWebVitals(audit);
  }, [audit]);

  if (!audit || !scores) return null;

  const gauges = [
    { label: 'Performance', score: scores.performance },
    { label: 'Accessibility', score: scores.accessibility },
    { label: 'Best Practices', score: scores.bestPractices },
    { label: 'SEO', score: scores.seo },
  ];

  return (
    <Card className="card-hover-lift border-cyan-100 shadow-md shadow-cyan-50/50 dark:border-gray-800 dark:shadow-none">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-bold text-gray-900 dark:text-white">
            Performance Scores
          </CardTitle>
          <span className="text-[10px] font-medium text-gray-400 dark:text-gray-500">
            Lighthouse-style
          </span>
        </div>
      </CardHeader>
      <CardContent className="pt-2 space-y-6">
        {/* Gauge Grid */}
        <div className="grid grid-cols-2 gap-6 sm:gap-8 md:grid-cols-4">
          {gauges.map((g, i) => (
            <GaugeMeter key={g.label} score={g.score} label={g.label} delay={i} />
          ))}
        </div>

        {/* Divider */}
        <div className="border-t border-gray-100 dark:border-gray-800" />

        {/* Metrics Breakdown */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <h4 className="text-sm font-bold text-gray-800 dark:text-gray-200">Metrics Breakdown</h4>
            <span className="rounded-full bg-cyan-50 px-2 py-0.5 text-[9px] font-semibold text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400">
              Core Web Vitals Proxy
            </span>
          </div>
          <div className="space-y-5">
            {metrics.map((m) => (
              <MetricBar key={m.shortName} metric={m} />
            ))}
          </div>
          <p className="text-[10px] italic text-gray-400 dark:text-gray-500">
            * Metrics are heuristically estimated from audit data. For precise field data, use PageSpeed Insights.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
