'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from '@/components/ui/tooltip';
import { useAuditStore, type AuditResult } from '@/lib/store';

interface ScoreItem {
  name: string;
  shortName: string;
  score: number;
  color: string;
  strokeColor: string;
  bgColor: string;
  textColor: string;
  description: string;
}

const SCORE_DESCRIPTIONS: Record<string, string> = {
  SEO: 'Measures how well your site is optimized for traditional search engine crawling and ranking factors (meta tags, headings, links, etc.).',
  AEO: 'Evaluates how effectively your content can be extracted and cited by AI answer engines like ChatGPT and Perplexity.',
  GEO: 'Assesses optimization for generative AI engines that produce synthesized answers from multiple sources.',
  AIO: 'Measures readiness for Google AI Overviews and similar AI-powered search result features.',
  SXO: 'Combines technical SEO, UX, and content quality signals that influence the overall search experience for users.',
};

function getGrade(s: number) {
  if (s >= 80) return { label: 'A', cls: 'text-emerald-600 dark:text-emerald-400', interpretation: 'Excellent — Strong optimization with minimal issues.' };
  if (s >= 60) return { label: 'B', cls: 'text-teal-600 dark:text-teal-400', interpretation: 'Good — Mostly well-optimized, some areas for improvement.' };
  if (s >= 40) return { label: 'C', cls: 'text-amber-600 dark:text-amber-400', interpretation: 'Fair — Notable issues that could impact visibility.' };
  return { label: 'D', cls: 'text-red-600 dark:text-red-400', interpretation: 'Poor — Significant problems requiring immediate attention.' };
}

function RadialCircle({ item, index }: { item: ScoreItem; index: number }) {
  const [animatedScore, setAnimatedScore] = useState(0);
  const circumference = 2 * Math.PI * 45;
  const offset = circumference - (animatedScore / 100) * circumference;

  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedScore(item.score);
    }, index * 100);
    return () => clearTimeout(timer);
  }, [item.score, index]);

  const grade = getGrade(item.score);

  const glowColors: Record<string, string> = {
    teal: 'rgba(20, 184, 166, 0.3)',
    blue: 'rgba(20, 184, 166, 0.3)',
    green: 'rgba(34, 197, 94, 0.3)',
    orange: 'rgba(249, 115, 22, 0.3)',
    cyan: 'rgba(6, 182, 212, 0.3)',
    red: 'rgba(239, 68, 68, 0.3)',
  };
  const gradePillBg: Record<string, string> = {
    A: 'bg-gradient-to-r from-emerald-100 to-emerald-50 text-emerald-700 ring-1 ring-emerald-200/60 dark:from-emerald-900/40 dark:to-emerald-950/40 dark:text-emerald-400 dark:ring-emerald-700/40',
    B: 'bg-gradient-to-r from-teal-100 to-teal-50 text-teal-700 ring-1 ring-teal-200/60 dark:from-teal-900/40 dark:to-teal-950/40 dark:text-teal-400 dark:ring-teal-700/40',
    C: 'bg-gradient-to-r from-amber-100 to-amber-50 text-amber-700 ring-1 ring-amber-200/60 dark:from-amber-900/40 dark:to-amber-950/40 dark:text-amber-400 dark:ring-amber-700/40',
    D: 'bg-gradient-to-r from-red-100 to-red-50 text-red-700 ring-1 ring-red-200/60 dark:from-red-900/40 dark:to-red-950/40 dark:text-red-400 dark:ring-red-700/40',
  };

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div className="flex flex-col items-center gap-2 cursor-default">
          <div
            className={`score-glow relative h-[120px] w-[120px] rounded-full ${item.bgColor} p-2`}
            style={{ '--glow-color': glowColors[item.color] || glowColors.blue } as React.CSSProperties}
          >
            <svg className="h-full w-full -rotate-90" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="45"
                fill="none"
                stroke="currentColor"
                strokeWidth="6"
                className="text-gray-100 dark:text-gray-800"
              />
              <circle
                cx="50"
                cy="50"
                r="45"
                fill="none"
                stroke={item.strokeColor}
                strokeWidth="6"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={offset}
                className="radial-animate"
                style={{
                  strokeDashoffset: offset,
                  transition: `stroke-dashoffset 1.2s ease-out ${index * 0.1}s`,
                }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className={`text-2xl font-bold tabular-nums ${grade.cls}`}>
                {Math.round(animatedScore)}
              </span>
              <span className={`mt-0.5 inline-flex items-center rounded-full px-2 py-0.5 text-[9px] font-bold ${gradePillBg[grade.label]}`}>
                Grade {grade.label}
              </span>
            </div>
          </div>
          <div className="text-center">
            <span className="block text-xs font-bold text-gray-800 dark:text-gray-200">{item.shortName}</span>
            <span className="block text-[10px] text-gray-400 mt-0.5 dark:text-gray-500">{item.name}</span>
          </div>
        </div>
      </TooltipTrigger>
      <TooltipContent side="bottom" sideOffset={8} className="score-tooltip max-w-xs px-4 py-3">
        <div className="space-y-1.5">
          <div className="flex items-center justify-between gap-3">
            <span className="text-xs font-bold">{item.shortName} Score</span>
            <span className="text-xs font-bold tabular-nums">{Math.round(item.score)}/100</span>
          </div>
          <p className="text-[11px] leading-relaxed opacity-90">{item.description}</p>
          <div className="flex items-center gap-2 border-t border-white/10 pt-1.5">
            <span className={`inline-flex rounded px-1.5 py-0.5 text-[10px] font-bold ${gradePillBg[grade.label]}`}>
              Grade {grade.label}
            </span>
            <span className="text-[10px] opacity-80">{grade.interpretation}</span>
          </div>
        </div>
      </TooltipContent>
    </Tooltip>
  );
}

export function AuditScoresRadial({ audit }: { audit: AuditResult | null }) {
  if (!audit) return null;

  const scores: ScoreItem[] = [
    {
      name: 'Search Engine Optimization',
      shortName: 'SEO',
      score: audit.seoScore,
      color: 'teal',
      strokeColor: '#14b8a6',
      bgColor: 'bg-teal-50 dark:bg-teal-950/30',
      textColor: 'text-teal-600',
      description: SCORE_DESCRIPTIONS.SEO,
    },
    {
      name: 'Answer Engine Optimization',
      shortName: 'AEO',
      score: audit.aeoScore,
      color: 'green',
      strokeColor: '#22c55e',
      bgColor: 'bg-emerald-50 dark:bg-emerald-950/30',
      textColor: 'text-emerald-600',
      description: SCORE_DESCRIPTIONS.AEO,
    },
    {
      name: 'Generative Engine Optimization',
      shortName: 'GEO',
      score: audit.geoScore,
      color: 'orange',
      strokeColor: '#f97316',
      bgColor: 'bg-orange-50 dark:bg-orange-950/30',
      textColor: 'text-orange-600',
      description: SCORE_DESCRIPTIONS.GEO,
    },
    {
      name: 'AI Overview Optimization',
      shortName: 'AIO',
      score: audit.aioScore,
      color: 'cyan',
      strokeColor: '#06b6d4',
      bgColor: 'bg-cyan-50 dark:bg-cyan-950/30',
      textColor: 'text-cyan-600',
      description: SCORE_DESCRIPTIONS.AIO,
    },
    {
      name: 'Search Experience Optimization',
      shortName: 'SXO',
      score: audit.sxoScore,
      color: 'red',
      strokeColor: '#ef4444',
      bgColor: 'bg-red-50 dark:bg-red-950/30',
      textColor: 'text-red-600',
      description: SCORE_DESCRIPTIONS.SXO,
    },
  ];

  const avgScore = Math.round(
    (audit.seoScore + audit.aeoScore + audit.geoScore + audit.aioScore + audit.sxoScore) / 5
  );

  return (
    <Card className="card-hover-lift border-cyan-100 shadow-md shadow-cyan-50/50 dark:border-gray-800 dark:shadow-none">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-bold text-gray-900 dark:text-white">
            Core Audit Scores
          </CardTitle>
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500 dark:text-gray-400">Overall</span>
            <span
              className={`text-lg font-bold ${
                avgScore >= 70 ? 'text-emerald-600 dark:text-emerald-400' : avgScore >= 50 ? 'text-amber-600 dark:text-amber-400' : 'text-red-600 dark:text-red-400'
              }`}
            >
              {avgScore}%
            </span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-2">
        <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 lg:gap-4 xl:gap-6">
          {scores.map((item, i) => (
            <RadialCircle key={item.shortName} item={item} index={i} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
