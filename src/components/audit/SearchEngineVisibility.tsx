'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, XCircle, Activity } from 'lucide-react';
import { useAuditStore, type AuditResult } from '@/lib/store';

function MiniBar({ score, label, color }: { score: number; label: string; color: string }) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-gray-700 dark:text-gray-200">{label}</span>
        <span className={`text-sm font-bold ${color}`}>{score}%</span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800">
        <div
          className={`h-full rounded-full transition-all duration-1000 ${color.replace('text-', 'bg-')}`}
          style={{ width: `${score}%` }}
        />
      </div>
    </div>
  );
}

function TechFlag({ label, value }: { label: string; value: boolean }) {
  return (
    <div className="flex items-center justify-between rounded-lg border border-gray-100 bg-white p-2.5 dark:border-gray-800 dark:bg-gray-900">
      <span className="text-xs font-medium text-gray-600 dark:text-gray-400">{label}</span>
      {value ? (
        <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 text-[10px] font-bold dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800">
          <CheckCircle2 className="mr-1 h-3 w-3" />
          Present
        </Badge>
      ) : (
        <Badge className="bg-red-100 text-red-700 border-red-200 text-[10px] font-bold dark:bg-red-900/30 dark:text-red-400 dark:border-red-800">
          <XCircle className="mr-1 h-3 w-3" />
          Missing
        </Badge>
      )}
    </div>
  );
}

export function SearchEngineVisibility({ audit }: { audit: AuditResult | null }) {
  if (!audit) return null;

  const hasImgDimensions = audit.imageCount === 0;

  return (
    <Card className="card-hover-lift border-cyan-100 shadow-md shadow-cyan-50/50 dark:border-gray-800 dark:shadow-none">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base font-bold text-gray-900 dark:text-white">
          <Activity className="h-5 w-5 text-cyan-600 dark:text-cyan-400" />
          Engine Readiness & Experience Metrics
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Heuristic Readiness Scores */}
        <div>
          <h3 className="mb-3 text-sm font-semibold text-gray-700 dark:text-gray-200">
            Heuristic Readiness Scores
          </h3>
          <div className="space-y-3 rounded-lg border border-gray-100 bg-gray-50/50 p-4 dark:border-gray-800 dark:bg-gray-900">
            <MiniBar score={audit.googleScore} label="Google" color={audit.googleScore >= 60 ? 'text-cyan-600 dark:text-cyan-400' : 'text-red-600 dark:text-red-400'} />
            <MiniBar score={audit.bingScore} label="Bing" color={audit.bingScore >= 60 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'} />
            <MiniBar score={audit.yahooScore} label="Yahoo" color={audit.yahooScore >= 60 ? 'text-purple-600 dark:text-purple-400' : 'text-red-600 dark:text-red-400'} />
          </div>
        </div>

        {/* Technical Flags */}
        <div>
          <h3 className="mb-3 text-sm font-semibold text-gray-700 dark:text-gray-200">Technical Flags</h3>
          <div className="grid gap-2 sm:grid-cols-2">
            <TechFlag label="HTTPS Status" value={audit.hasHttps} />
            <TechFlag label="Canonical Link Presence" value={audit.hasCanonical} />
            <TechFlag label="Mobile Viewport Metatag" value={audit.hasViewport} />
            <TechFlag label="Indexable Status" value={audit.isIndexable} />
          </div>
        </div>

        {/* SXO Core Web Vitals Risk */}
        <div>
          <h3 className="mb-3 text-sm font-semibold text-gray-700 dark:text-gray-200">
            SXO Core Web Vitals Risk
          </h3>
          <div className="rounded-lg border border-gray-100 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
            <TechFlag
              label="CLS Image Dimensions Check"
              value={hasImgDimensions}
            />
            {!hasImgDimensions && (
              <p className="mt-2 text-[11px] leading-relaxed text-gray-500 dark:text-gray-400">
                Some images are missing explicit width/height attributes. This can cause Cumulative Layout Shift (CLS), which impacts user experience and search ranking.
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}