'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuditStore, type AuditResult } from '@/lib/store';
import { Lightbulb, TrendingUp, AlertTriangle, CheckCircle2 } from 'lucide-react';

function getTips(audit: AuditResult) {
  const tips: { icon: typeof Lightbulb; title: string; desc: string; priority: 'high' | 'medium' | 'low' }[] = [];

  // SEO tips
  if (audit.seoScore < 80) {
    if (!audit.hasCanonical) {
      tips.push({ icon: AlertTriangle, title: 'Add a Canonical URL', desc: 'Specify a canonical link tag to prevent duplicate content issues and consolidate page authority.', priority: 'high' });
    }
    if (audit.h1Count === 0) {
      tips.push({ icon: AlertTriangle, title: 'Add an H1 Heading', desc: 'Each page should have exactly one H1 tag that clearly describes the page content for search engines.', priority: 'high' });
    }
    if (audit.h1Count > 1) {
      tips.push({ icon: AlertTriangle, title: 'Use Only One H1 Tag', desc: `Found ${audit.h1Count} H1 tags. Multiple H1 tags can confuse search engines about the main topic of the page.`, priority: 'medium' });
    }
    if (audit.metaDescription.length === 0) {
      tips.push({ icon: AlertTriangle, title: 'Write a Meta Description', desc: 'Add a compelling 150-160 character meta description to improve click-through rates from search results.', priority: 'high' });
    }
    if (audit.imagesMissingAlt > 0) {
      tips.push({ icon: AlertTriangle, title: 'Fix Missing Alt Text', desc: `${audit.imagesMissingAlt} image(s) missing alt attributes. Alt text improves accessibility and helps search engines understand images.`, priority: 'medium' });
    }
  }

  // AEO tips
  if (audit.aeoScore < 70) {
    tips.push({ icon: Lightbulb, title: 'Add FAQ Schema Markup', desc: 'Include JSON-LD FAQPage structured data with relevant questions and answers to appear in AI answer boxes.', priority: 'high' });
    tips.push({ icon: Lightbulb, title: 'Use Question-Based Headings', desc: 'Add H2 headings phrased as questions (e.g., "What is...?") to match how AI engines extract answers.', priority: 'medium' });
  }

  // GEO tips
  if (audit.geoScore < 70) {
    tips.push({ icon: TrendingUp, title: 'Add Author Attribution', desc: 'Include author meta tags or article schema to signal content credibility for generative AI engines.', priority: 'medium' });
    tips.push({ icon: TrendingUp, title: 'Publish Fresh Content', desc: 'Add publication dates and regularly update content. Freshness is a key factor for generative engine ranking.', priority: 'low' });
  }

  // AIO tips
  if (audit.aioScore < 70) {
    tips.push({ icon: Lightbulb, title: 'Improve Heading Hierarchy', desc: 'Ensure proper H1→H2→H3 hierarchy. AI overviews rely on well-structured content to generate summaries.', priority: 'medium' });
    tips.push({ icon: Lightbulb, title: 'Use Descriptive Anchor Text', desc: 'Replace generic "click here" links with descriptive anchor text that tells AI engines what the linked page is about.', priority: 'medium' });
  }

  // SXO tips
  if (!audit.hasHttps) {
    tips.push({ icon: AlertTriangle, title: 'Enable HTTPS', desc: 'HTTPS is essential for user trust, SEO ranking, and is required by most modern browsers for secure connections.', priority: 'high' });
  }
  if (!audit.isIndexable) {
    tips.push({ icon: AlertTriangle, title: 'Fix No-Index Directive', desc: 'The page has a noindex meta tag, preventing search engines from indexing it. Remove it if you want the page to appear in search results.', priority: 'high' });
  }

  // Positive feedback
  if (tips.length === 0) {
    tips.push({ icon: CheckCircle2, title: 'Excellent Work!', desc: 'Your site scores well across all dimensions. Keep monitoring and maintaining your SEO, AEO, GEO, AIO, and SXO best practices.', priority: 'low' });
  }

  return tips.sort((a, b) => {
    const order = { high: 0, medium: 1, low: 2 };
    return order[a.priority] - order[b.priority];
  });
}

export function ScoreImprovementTips({ audit }: { audit: AuditResult | null }) {
  if (!audit) return null;

  const tips = getTips(audit);
  const highCount = tips.filter(t => t.priority === 'high').length;

  return (
    <Card className="card-hover-lift border-amber-100 shadow-md shadow-amber-50/50">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-base font-bold text-gray-900">
              <Lightbulb className="h-5 w-5 text-amber-500" />
              How to Improve Your Scores
            </CardTitle>
            <p className="mt-1 text-xs text-gray-500">
              Actionable recommendations to boost your SEO and AI search visibility.
            </p>
          </div>
          {highCount > 0 && (
            <span className="rounded-full bg-red-50 px-2.5 py-1 text-[10px] font-bold text-red-600 ring-1 ring-red-200/60">
              {highCount} urgent
            </span>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2.5">
          {tips.map((tip, i) => {
            const Icon = tip.icon;
            const priorityColors = {
              high: 'border-l-red-400 bg-red-50/40',
              medium: 'border-l-amber-400 bg-amber-50/30',
              low: 'border-l-emerald-400 bg-emerald-50/30',
            };
            const iconColors = {
              high: 'text-red-500',
              medium: 'text-amber-500',
              low: 'text-emerald-500',
            };
            return (
              <div
                key={i}
                className={`flex items-start gap-3 rounded-lg border-l-[3px] ${priorityColors[tip.priority]} p-3 transition-colors hover:bg-opacity-60`}
              >
                <Icon className={`mt-0.5 h-4 w-4 shrink-0 ${iconColors[tip.priority]}`} />
                <div>
                  <span className="text-xs font-semibold text-gray-800">{tip.title}</span>
                  <p className="mt-0.5 text-[11px] leading-relaxed text-gray-500">{tip.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}