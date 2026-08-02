'use client';

import { Heart, Github, Twitter } from 'lucide-react';
import { useAuditStore, type AppPage } from '@/lib/store';

export function Footer() {
  const { setPage } = useAuditStore();

  const navigate = (page: AppPage) => (e: React.MouseEvent) => {
    e.preventDefault();
    setPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="mt-auto footer-gradient-border bg-white dark:bg-gray-950">
      {/* Ad Slot: Bottom Footer */}
      <div className="ad-slot no-print mx-auto flex max-w-[728px] items-center justify-center py-3">
        <span className="text-[10px] text-gray-300 dark:text-gray-700">Advertisement · 728×90</span>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Main Footer Content */}
        <div className="grid gap-8 py-8 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div className="sm:col-span-2 lg:col-span-1">
            <div className="flex items-center gap-2">
              <img src="/icon.png" alt="LinkHygiene" className="h-8 w-8 rounded-lg shadow-md shadow-cyan-200/50 dark:shadow-cyan-900/30" />
              <span className="text-sm font-extrabold text-gray-900 dark:text-white">
                Link<span className="bg-gradient-to-r from-cyan-600 to-teal-500 bg-clip-text text-transparent">Hygiene</span>
              </span>
            </div>
            <p className="mt-3 max-w-xs text-xs leading-relaxed text-gray-500 dark:text-gray-400">
              Free AI-powered SEO &amp; link audit tool. Analyze your website for Google, ChatGPT, Perplexity, Gemini, and AI Overviews. No sign-up required.
            </p>
          </div>

          {/* Product */}
          <div>
            <h4 className="mb-3 text-xs font-bold uppercase tracking-wider text-gray-900 dark:text-gray-200">Product</h4>
            <nav className="flex flex-col gap-2">
              <a href="#" onClick={(e) => { e.preventDefault(); setPage('home'); setTimeout(() => document.getElementById('scan-section')?.scrollIntoView({ behavior: 'smooth' }), 100); }} className="footer-link text-xs text-gray-500 transition-colors hover:text-cyan-600 dark:text-gray-400 dark:hover:text-cyan-400">SEO Audit</a>
              <a href="#" onClick={(e) => { e.preventDefault(); setPage('support'); }} className="footer-link text-xs text-gray-500 transition-colors hover:text-cyan-600 dark:text-gray-400 dark:hover:text-cyan-400">Multi-Page Crawl</a>
              <a href="#" onClick={(e) => { e.preventDefault(); setPage('home'); setTimeout(() => document.getElementById('scan-section')?.scrollIntoView({ behavior: 'smooth' }), 100); }} className="footer-link text-xs text-gray-500 transition-colors hover:text-cyan-600 dark:text-gray-400 dark:hover:text-cyan-400">AI Readiness Check</a>
              <a href="#" onClick={(e) => { e.preventDefault(); setPage('home'); setTimeout(() => document.getElementById('scan-section')?.scrollIntoView({ behavior: 'smooth' }), 100); }} className="footer-link text-xs text-gray-500 transition-colors hover:text-cyan-600 dark:text-gray-400 dark:hover:text-cyan-400">Score Comparison</a>
            </nav>
          </div>

          {/* Resources */}
          <div>
            <h4 className="mb-3 text-xs font-bold uppercase tracking-wider text-gray-900 dark:text-gray-200">Resources</h4>
            <nav className="flex flex-col gap-2">
              <a href="#" onClick={navigate('about')} className="footer-link text-xs text-gray-500 transition-colors hover:text-cyan-600 dark:text-gray-400 dark:hover:text-cyan-400">About</a>
              <a href="#" onClick={navigate('support')} className="footer-link text-xs text-gray-500 transition-colors hover:text-cyan-600 dark:text-gray-400 dark:hover:text-cyan-400">FAQ &amp; Support</a>
              <a href="#" onClick={navigate('contact')} className="footer-link text-xs text-gray-500 transition-colors hover:text-cyan-600 dark:text-gray-400 dark:hover:text-cyan-400">Contact Us</a>
            </nav>
          </div>

          {/* Legal */}
          <div>
            <h4 className="mb-3 text-xs font-bold uppercase tracking-wider text-gray-900 dark:text-gray-200">Legal</h4>
            <nav className="flex flex-col gap-2">
              <a href="#" onClick={navigate('privacy')} className="footer-link text-xs text-gray-500 transition-colors hover:text-cyan-600 dark:text-gray-400 dark:hover:text-cyan-400">Privacy Policy</a>
              <a href="#" onClick={navigate('terms')} className="footer-link text-xs text-gray-500 transition-colors hover:text-cyan-600 dark:text-gray-400 dark:hover:text-cyan-400">Terms of Service</a>
              <a href="#" onClick={navigate('cookies')} className="footer-link text-xs text-gray-500 transition-colors hover:text-cyan-600 dark:text-gray-400 dark:hover:text-cyan-400">Cookie Policy</a>
            </nav>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="flex flex-col items-center justify-between gap-3 border-t border-gray-100 py-4 dark:border-gray-800 sm:flex-row">
          <div className="flex items-center gap-1.5 text-xs text-gray-400 dark:text-gray-500">
            <span>© 2026 LinkHygiene</span>
            <span className="text-gray-300 dark:text-gray-700">·</span>
            <span className="flex items-center gap-0.5">Made with <Heart className="h-3 w-3 text-red-400" /> for the web</span>
          </div>
          <div className="flex items-center gap-3">
            <a href="#" className="flex h-7 w-7 items-center justify-center rounded-md text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 dark:text-gray-500 dark:hover:bg-gray-800 dark:hover:text-gray-300">
              <Github className="h-4 w-4" />
            </a>
            <a href="#" className="flex h-7 w-7 items-center justify-center rounded-md text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 dark:text-gray-500 dark:hover:bg-gray-800 dark:hover:text-gray-300">
              <Twitter className="h-4 w-4" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}