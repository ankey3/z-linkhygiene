'use client';

import { useState, useEffect } from 'react';
import { Header } from '@/components/audit/Header';
import { ScanSummaryCard } from '@/components/audit/ScanSummaryCard';
import { AuditScoresRadial } from '@/components/audit/AuditScoresRadial';
import { IssueDistribution } from '@/components/audit/IssueDistribution';
import { SeoSegments } from '@/components/audit/SeoSegments';
import { AiSearchReadiness } from '@/components/audit/AiSearchReadiness';
import { ContentAndLinksAnalysis } from '@/components/audit/ContentAndLinksAnalysis';
import { SearchEngineVisibility } from '@/components/audit/SearchEngineVisibility';
import { PerPageDrillDown } from '@/components/audit/PerPageDrillDown';
import { BrokenLinksDebugger } from '@/components/audit/BrokenLinksDebugger';
import { ScoreImprovementTips } from '@/components/audit/ScoreImprovementTips';
import { Footer } from '@/components/audit/Footer';
import { AuditComparison } from '@/components/audit/AuditComparison';
import { BackToTop } from '@/components/audit/BackToTop';
import { ResultsSkeleton } from '@/components/audit/ResultsSkeleton';
import { ResultsAdModal } from '@/components/audit/ResultsAdModal';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { useAuditStore, pathToPage } from '@/lib/store';
import { AboutPage } from '@/components/pages/AboutPage';
import { ContactPage } from '@/components/pages/ContactPage';
import { SupportPage } from '@/components/pages/SupportPage';
import { AuditHistoryPage } from '@/components/pages/AuditHistoryPage';
import { PrivacyPolicyPage } from '@/components/pages/PrivacyPolicyPage';
import { TermsPage } from '@/components/pages/TermsPage';
import { CookiePolicyPage } from '@/components/pages/CookiePolicyPage';
import { Search, BarChart3, Bot, Link2, Activity, FileText, Bug, ArrowDown, Sparkles, Share2, Copy, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

function exportCsv(audit: any) {
  const rows = [
    ['LinkHygiene Audit Report'],
    [`URL: ${audit.url}`],
    [`Date: ${new Date(audit.createdAt).toLocaleString()}`],
    [`Pages Crawled: ${audit.pagesCrawled}`],
    [],
    ['Score', 'Value'],
    ['SEO', `${audit.seoScore}%`],
    ['AEO', `${audit.aeoScore}%`],
    ['GEO', `${audit.geoScore}%`],
    ['AIO', `${audit.aioScore}%`],
    ['SXO', `${audit.sxoScore}%`],
    ['Google', `${audit.googleScore}%`],
    ['Bing', `${audit.bingScore}%`],
    ['Yahoo', `${audit.yahooScore}%`],
    [],
    ['Total Links', String(audit.totalLinks)],
    ['Valid Links', String(audit.validLinks)],
    ['Critical Issues', String(audit.criticalIssues)],
    ['Warnings', String(audit.warnings)],
    [],
    ['SEO Check', 'Status', 'Detail'],
    ...audit.seoChecks.map((c: any) => [c.name, c.status, c.detail]),
    [],
    ['AI Readiness', 'Type', 'Status', 'Detail'],
    ...audit.aiReadinessChecks.map((c: any) => [c.name, c.type, c.status, c.detail]),
    [],
    ['Page URL', 'Title', 'Links', 'Issues', 'Clean'],
    ...audit.pageIssues.map((p: any) => [p.url, p.title, String(p.totalLinks), String(p.issueCount), p.isClean ? 'Yes' : 'No']),
    [],
    ['Error Type', 'Target URL', 'Anchor Text', 'Source URL'],
    ...audit.issues.map((i: any) => [i.errorType, i.targetUrl, i.anchorText, i.sourceUrl]),
    [],
    ['Keyword', 'Count', 'Density %'],
    ...audit.keywords.map((k: any) => [k.keyword, String(k.count), String(k.density)]),
  ];
  const csv = rows.map(r => r.map(c => `"${c.replace(/"/g, '\\"')}"`).join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = `linkhygiene-audit-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click(); URL.revokeObjectURL(url);
  toast.success('Audit report exported as CSV!');
}

function ShareButton({ audit }: { audit: any }) {
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    const avgScore = Math.round((audit.seoScore + audit.aeoScore + audit.geoScore + audit.aioScore + audit.sxoScore) / 5);
    const text = `🔍 LinkHygiene Audit for ${audit.url}\n📊 Overall: ${avgScore}%\n🔵 SEO: ${audit.seoScore}% | 🟢 AEO: ${audit.aeoScore}% | 🟠 GEO: ${audit.geoScore}%\n🔵 AIO: ${audit.aioScore}% | 🔴 SXO: ${audit.sxoScore}%\n🔗 ${audit.totalLinks} links | ⚠️ ${audit.criticalIssues} issues\n\nTry it free: https://linkhygiene.z.ai`;

    if (navigator.share) {
      try {
        await navigator.share({ title: 'LinkHygiene Audit Report', text });
        return;
      } catch {
        // fallback to clipboard
      }
    }

    await navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success('Audit summary copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Button
      onClick={handleShare}
      variant="outline"
      size="sm"
      className="btn-press gap-1.5 border-cyan-200 text-cyan-700 hover:bg-cyan-50 dark:border-cyan-800 dark:text-cyan-400 dark:hover:bg-cyan-950"
    >
      {copied ? <Check className="h-3.5 w-3.5" /> : <Share2 className="h-3.5 w-3.5" />}
      {copied ? 'Copied!' : 'Share'}
    </Button>
  );
}

const fadeIn = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5, ease: 'easeOut' },
};
const stagger = {
  animate: { transition: { staggerChildren: 0.08 } },
};

function HomePage() {
  const { currentAudit, isScanning, adDismissed, setAdDismissed } = useAuditStore();

  const hasCompletedScan = !!(currentAudit && currentAudit.status === 'completed' && !isScanning);
  const showAd = hasCompletedScan && !adDismissed;
  const showResults = hasCompletedScan && adDismissed;

  const handleScanComplete = () => {
    setTimeout(() => {
      document.getElementById('results-section')?.scrollIntoView({ behavior: 'smooth' });
    }, 300);
  };

  const handleAdClose = () => {
    setAdDismissed(true);
  };

  return (
    <>
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-cyan-600 via-cyan-600 to-teal-700 px-4 py-16 sm:py-24">
        {/* Animated mesh background */}
        <div className="hero-mesh absolute inset-0" />
        {/* Grid pattern overlay */}
        <div className="hero-grid absolute inset-0" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_20%_50%,rgba(255,255,255,0.1),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_80%_20%,rgba(147,51,234,0.15),transparent_50%)]" />
        {/* Floating particles */}
        <div className="floating-dot" style={{ top: '12%', left: '8%', '--float-duration': '7s', '--float-delay': '0s' } as React.CSSProperties} />
        <div className="floating-dot" style={{ top: '25%', left: '18%', '--float-duration': '5.5s', '--float-delay': '1s', width: '3px', height: '3px', opacity: '0.3' } as React.CSSProperties} />
        <div className="floating-dot" style={{ top: '60%', left: '12%', '--float-duration': '8s', '--float-delay': '2s' } as React.CSSProperties} />
        <div className="floating-dot" style={{ top: '35%', left: '75%', '--float-duration': '6s', '--float-delay': '0.5s' } as React.CSSProperties} />
        <div className="floating-dot" style={{ top: '70%', left: '82%', '--float-duration': '7.5s', '--float-delay': '1.5s', width: '3px', height: '3px', opacity: '0.3' } as React.CSSProperties} />
        <div className="floating-dot" style={{ top: '18%', left: '55%', '--float-duration': '6.5s', '--float-delay': '3s' } as React.CSSProperties} />
        <div className="floating-dot" style={{ top: '80%', left: '40%', '--float-duration': '9s', '--float-delay': '0.8s', width: '5px', height: '5px', opacity: '0.25' } as React.CSSProperties} />
        <div className="floating-dot" style={{ top: '45%', left: '90%', '--float-duration': '5s', '--float-delay': '2.5s', width: '3px', height: '3px' } as React.CSSProperties} />
        <div className="floating-dot" style={{ top: '50%', left: '30%', '--float-duration': '7s', '--float-delay': '4s' } as React.CSSProperties} />
        <div className="floating-dot" style={{ top: '15%', left: '88%', '--float-duration': '6.2s', '--float-delay': '1.8s', width: '3px', height: '3px', opacity: '0.35' } as React.CSSProperties} />
        <div className="floating-dot" style={{ top: '75%', left: '65%', '--float-duration': '8.5s', '--float-delay': '0.3s' } as React.CSSProperties} />
        <div className="floating-dot" style={{ top: '40%', left: '5%', '--float-duration': '5.8s', '--float-delay': '3.5s', width: '5px', height: '5px', opacity: '0.2' } as React.CSSProperties} />
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-[#f8fafc] to-transparent dark:from-gray-950" />

        <motion.div
          className="relative mx-auto max-w-4xl text-center"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="glass mb-6 inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm text-cyan-100"
          >
            <Sparkles className="h-4 w-4" />
            AI-Powered SEO Audit for the Era of AI Search
          </motion.div>

          <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl">
            Find Every Broken Link.
            <br />
            <span className="shimmer-text bg-gradient-to-r from-cyan-200 via-teal-100 to-cyan-300 bg-clip-text text-transparent">
              Even the ones nobody else does.
            </span>
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-cyan-100/90 sm:text-lg">
            Comprehensive SEO &amp; link audit optimized for Google, ChatGPT, Perplexity, Gemini, and AI Overviews.
            Optimize your site&apos;s visibility across every search engine — completely free.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            {[
              { emoji: '✅', label: '100% Free' },
              { emoji: '🔍', label: 'Deep Link Analysis' },
              { emoji: '🤖', label: 'AI Search Readiness' },
              { emoji: '📊', label: '5 Core Scores' },
              { emoji: '📄', label: 'CSV & PDF Export' },
            ].map((item, i) => (
              <motion.span
                key={item.label}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4 + i * 0.1, duration: 0.4 }}
                className="glass flex items-center gap-1.5 rounded-full px-3.5 py-2 text-sm text-cyan-100 transition-colors hover:bg-white/20"
              >
                {item.emoji} {item.label}
              </motion.span>
            ))}
          </div>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1, duration: 0.5 }}
            className="mt-10"
          >
            <button
              onClick={() => document.getElementById('scan-section')?.scrollIntoView({ behavior: 'smooth' })}
              className="glow-ring btn-press group inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-bold text-cyan-700 shadow-xl shadow-cyan-900/30 transition-all hover:bg-cyan-50 hover:shadow-2xl hover:-translate-y-0.5"
            >
              Start Your Free Audit
              <ArrowDown className="h-4 w-4 animate-bounce" />
            </button>
          </motion.div>
        </motion.div>
      </section>

      {/* Main Content */}
      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-8 lg:flex-row">
          {/* Main Column */}
          <div className="min-w-0 flex-1 space-y-8">
            {/* Print Header */}
            {currentAudit && (
              <div className="print-header mb-6 hidden border-b-2 border-cyan-600 pb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900">LinkHygiene Audit Report</h1>
                    <p className="mt-1 text-sm text-gray-600">{currentAudit.url}</p>
                    <p className="text-xs text-gray-400">Generated: {new Date(currentAudit.createdAt).toLocaleString()}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-3xl font-bold text-cyan-600">{Math.round((currentAudit.seoScore + currentAudit.aeoScore + currentAudit.geoScore + currentAudit.aioScore + currentAudit.sxoScore) / 5)}%</p>
                    <p className="text-xs text-gray-500">Overall Score</p>
                  </div>
                </div>
              </div>
            )}
            {/* Scan Card */}
            <motion.div id="scan-section" {...fadeIn}>
              <ScanSummaryCard onScanComplete={handleScanComplete} />
            </motion.div>

            {/* Loading Skeleton */}
            {isScanning && !currentAudit && (
              <ResultsSkeleton />
            )}

            {/* Export Button + Results */}
            <AnimatePresence mode="wait">
            {showResults && (
              <motion.div
                key="results"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4 }}
              >
                {/* Export toolbar */}
                <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                      Audit Results
                    </h2>
                    <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
                      {currentAudit.pagesCrawled} page{currentAudit.pagesCrawled !== 1 ? 's' : ''} scanned
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <ShareButton audit={currentAudit} />
                    <Button
                      onClick={() => exportCsv(currentAudit)}
                      variant="outline"
                      size="sm"
                      className="btn-press gap-1.5 border-cyan-200 text-cyan-700 hover:bg-cyan-50 dark:border-cyan-800 dark:text-cyan-400 dark:hover:bg-cyan-950"
                    >
                      <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                      CSV
                    </Button>
                    <Button
                      onClick={() => window.print()}
                      variant="outline"
                      size="sm"
                      className="btn-press gap-1.5 border-gray-200 text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
                    >
                      <FileText className="h-3.5 w-3.5" />
                      PDF
                    </Button>
                    <Button
                      onClick={() => {
                        const input = document.querySelector('input[placeholder*="example.com"]') as HTMLInputElement;
                        if (input) {
                          const nativeSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value')?.set;
                          if (nativeSetter) { nativeSetter.call(input, currentAudit.url); input.dispatchEvent(new Event('input', { bubbles: true })); }
                        }
                        setTimeout(() => {
                          const btn = document.querySelector('#scan-section button.bg-cyan-600, #scan-section button[class*="bg-cyan-700"]') as HTMLElement;
                          btn?.click();
                        }, 150);
                        toast.info('Re-scanning ' + currentAudit.url + '...');
                      }}
                      variant="outline"
                      size="sm"
                      className="btn-press gap-1.5 border-emerald-200 text-emerald-700 hover:bg-emerald-50 dark:border-emerald-800 dark:text-emerald-400 dark:hover:bg-emerald-950"
                    >
                      <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 2v6h-6"/><path d="M3 12a9 9 0 0 1 15-6.7L21 8"/><path d="M3 22v-6h6"/><path d="M21 12a9 9 0 0 1-15 6.7L3 16"/></svg>
                      Re-scan
                    </Button>
                  </div>
                </div>

                <div id="results-section" className="space-y-8">
                  {/* Scores + Distribution */}
                  <motion.div className="grid gap-8 lg:grid-cols-5" {...stagger}>
                    <motion.div className="lg:col-span-3" {...fadeIn}>
                      <AuditScoresRadial audit={currentAudit} />
                    </motion.div>
                    <motion.div className="lg:col-span-2" {...fadeIn}>
                      <IssueDistribution audit={currentAudit} />
                    </motion.div>
                  </motion.div>

                  <div className="ad-slot no-print flex items-center justify-center rounded-lg py-4">
                    <span className="text-[10px] text-gray-300 dark:text-gray-700">Advertisement · 728×90</span>
                  </div>

                  <motion.div {...fadeIn}><SeoSegments audit={currentAudit} /></motion.div>
                  <motion.div {...fadeIn}><AiSearchReadiness audit={currentAudit} /></motion.div>
                  <motion.div {...fadeIn}><ScoreImprovementTips audit={currentAudit} /></motion.div>
                  <motion.div {...fadeIn}><ContentAndLinksAnalysis audit={currentAudit} /></motion.div>

                  <div className="ad-slot no-print flex items-center justify-center rounded-lg py-4">
                    <span className="text-[10px] text-gray-300 dark:text-gray-700">Advertisement · 728×90</span>
                  </div>

                  <motion.div {...fadeIn}><SearchEngineVisibility audit={currentAudit} /></motion.div>
                  <motion.div {...fadeIn}><PerPageDrillDown audit={currentAudit} /></motion.div>
                  <motion.div {...fadeIn}><BrokenLinksDebugger audit={currentAudit} /></motion.div>
                </div>
              </motion.div>
            )}
            </AnimatePresence>

            {/* Empty state */}
            {!currentAudit && !isScanning && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.6 }}
                className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-cyan-200 bg-gradient-to-b from-cyan-50/50 to-transparent py-20 dark:border-gray-700 dark:from-cyan-950/20 dark:to-transparent"
              >
                <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-100 to-cyan-200 shadow-lg shadow-cyan-100 dark:from-cyan-900/40 dark:to-cyan-800/30 dark:shadow-cyan-900/20">
                  <Search className="h-10 w-10 text-cyan-500 dark:text-cyan-400" />
                </div>
                <h3 className="text-lg font-bold text-gray-700 dark:text-gray-200">Ready to Audit</h3>
                <p className="mt-2 max-w-md text-center text-sm text-gray-500 dark:text-gray-400">
                  Enter a website URL above and click &quot;Start Audit&quot; to begin your comprehensive SEO &amp; link analysis.
                </p>
                <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {[
                    { icon: BarChart3, label: '5 Core Scores', desc: 'SEO, AEO, GEO, AIO, SXO' },
                    { icon: Bot, label: 'AI Readiness', desc: 'ChatGPT, Perplexity, Gemini' },
                    { icon: Link2, label: 'Link Analysis', desc: 'Internal, external, broken' },
                    { icon: Activity, label: 'Engine Visibility', desc: 'Google, Bing, Yahoo' },
                    { icon: FileText, label: 'Per-Page Drill', desc: 'Friendly URL deep dive' },
                    { icon: Bug, label: 'Deep Debug', desc: 'What, why, how to fix' },
                  ].map((f, i) => (
                    <motion.div
                      key={f.label}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5 + i * 0.08 }}
                      className="card-hover-lift group flex items-center gap-2.5 rounded-xl border border-gray-100 bg-white px-4 py-3 shadow-sm dark:border-gray-800 dark:bg-gray-900"
                    >
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-cyan-50 transition-colors group-hover:bg-cyan-100 dark:bg-cyan-900/30 dark:group-hover:bg-cyan-900/50">
                        <f.icon className="h-4 w-4 text-cyan-500 dark:text-cyan-400" />
                      </div>
                      <div>
                        <span className="block text-xs font-semibold text-gray-700 dark:text-gray-200">{f.label}</span>
                        <span className="block text-[10px] text-gray-400 dark:text-gray-500">{f.desc}</span>
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* Popular sites to try */}
                <div className="mt-10 w-full max-w-md">
                  <p className="mb-3 text-center text-xs font-medium text-gray-400 dark:text-gray-500">Try auditing one of these popular sites:</p>
                  <div className="flex flex-wrap items-center justify-center gap-2">
                    {['example.com', 'wikipedia.org', 'github.com'].map((site) => (
                      <button
                        key={site}
                        onClick={() => {
                          const input = document.querySelector('input[placeholder*="example.com"]') as HTMLInputElement;
                          if (input) {
                            const nativeSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value')?.set;
                            if (nativeSetter) { nativeSetter.call(input, site); input.dispatchEvent(new Event('input', { bubbles: true })); }
                          }
                          document.getElementById('scan-section')?.scrollIntoView({ behavior: 'smooth' });
                        }}
                        className="btn-press rounded-full border border-gray-200 bg-white px-3.5 py-1.5 text-xs font-medium text-gray-600 shadow-sm transition-all hover:border-cyan-200 hover:bg-cyan-50 hover:text-cyan-700 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:border-cyan-800 dark:hover:bg-cyan-950 dark:hover:text-cyan-400"
                      >
                        {site}
                      </button>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </div>

          {/* Sidebar */}
          <aside className="no-print w-full shrink-0 space-y-8 lg:w-72 xl:w-80">
            <div className="ad-slot flex items-center justify-center rounded-lg py-12">
              <span className="text-[10px] text-gray-300 dark:text-gray-700">Ad · 300×250</span>
            </div>
          </aside>
        </div>
      </section>

      {/* Results Ad Modal */}
      <ResultsAdModal open={showAd} onClose={handleAdClose} />
    </>
  );
}

export default function Home() {
  const { currentPage, setPage } = useAuditStore();

  // Sync URL on initial load and back/forward navigation
  useEffect(() => {
    const syncFromUrl = () => {
      const page = pathToPage(window.location.pathname);
      if (page !== currentPage) {
        useAuditStore.setState({ currentPage: page });
      }
    };
    syncFromUrl();
    window.addEventListener('popstate', syncFromUrl);
    return () => window.removeEventListener('popstate', syncFromUrl);
  }, []);

  return (
    <ErrorBoundary>
      <div className="flex min-h-screen flex-col bg-[#f8fafc] dark:bg-gray-950">
        <Header />

        <main className="flex-1">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentPage}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.3 }}
            >
              {currentPage === 'home' && <HomePage />}
              {currentPage === 'about' && <AboutPage />}
              {currentPage === 'contact' && <ContactPage />}
              {currentPage === 'support' && <SupportPage />}
              {currentPage === 'audit-history' && <AuditHistoryPage />}
              {currentPage === 'privacy' && <PrivacyPolicyPage />}
              {currentPage === 'terms' && <TermsPage />}
              {currentPage === 'cookies' && <CookiePolicyPage />}
            </motion.div>
          </AnimatePresence>
        </main>

        <Footer />

        {/* Back to Top */}
        <BackToTop />

        {/* Audit Comparison */}
        <AuditComparison />
      </div>
    </ErrorBoundary>
  );
}