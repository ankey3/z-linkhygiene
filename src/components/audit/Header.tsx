'use client';

import { useState } from 'react';
import { Menu, X, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from './ThemeToggle';
import { useAuditStore, type AppPage } from '@/lib/store';

const navItems: { label: string; page: AppPage }[] = [
  { label: 'Home', page: 'home' },
  { label: 'Audit History', page: 'audit-history' },
  { label: 'About', page: 'about' },
  { label: 'Contact', page: 'contact' },
  { label: 'Support', page: 'support' },
];

export function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { currentPage, setPage } = useAuditStore();

  const handleNav = (page: AppPage) => {
    setMobileOpen(false);
    if (page === 'home') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    setPage(page);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-cyan-100/80 bg-white/85 shadow-sm shadow-cyan-50/20 backdrop-blur-xl transition-shadow duration-300 dark:border-gray-800 dark:bg-gray-950/85 dark:shadow-gray-950/20">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <button onClick={() => handleNav('home')} className="flex items-center gap-2.5 transition-transform hover:scale-105">
          <img src="/icon.png" alt="LinkHygiene" className="h-9 w-9 rounded-lg shadow-md shadow-cyan-200 dark:shadow-cyan-900/30" />
          <div className="flex flex-col">
            <span className="text-lg font-extrabold tracking-tight text-gray-900 dark:text-white">
              Link<span className="bg-gradient-to-r from-cyan-600 to-teal-500 bg-clip-text text-transparent">Hygiene</span>
            </span>
            <span className="hidden text-[10px] leading-none text-gray-400 sm:block">
              AI-Powered SEO Audit
            </span>
          </div>
        </button>

        <nav className="hidden items-center gap-0.5 md:flex">
          {navItems.map((item) => (
            <button
              key={item.page}
              onClick={() => handleNav(item.page)}
              data-active={currentPage === item.page || undefined}
              className="relative rounded-lg px-3 py-2 text-[13px] font-medium text-gray-600 transition-all hover:bg-cyan-50 hover:text-cyan-700 data-[active=true]:bg-cyan-50 data-[active=true]:text-cyan-700 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-cyan-400 dark:data-[active=true]:bg-gray-800 dark:data-[active=true]:text-cyan-400"
            >
              {item.label}
              {currentPage === item.page && (
                <span className="absolute bottom-0.5 left-1/2 h-0.5 w-4 -translate-x-1/2 rounded-full bg-cyan-600 dark:bg-cyan-500" />
              )}
            </button>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <ThemeToggle />
          <div className="flex items-center gap-1.5 rounded-full bg-gradient-to-r from-emerald-50 to-emerald-100/50 px-3.5 py-1.5 text-xs font-semibold text-emerald-700 shadow-sm shadow-emerald-100 dark:from-emerald-900/30 dark:to-emerald-900/10 dark:text-emerald-400 dark:shadow-none">
            <Shield className="h-3.5 w-3.5" />
            100% Free
          </div>
        </div>

        <Button
          variant="ghost"
          size="icon"
          className="rounded-lg md:hidden dark:text-gray-400"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </div>

      {/* Mobile Nav */}
      {mobileOpen && (
        <div className="mobile-nav-enter border-t border-cyan-100 bg-white px-4 pb-4 md:hidden dark:border-gray-800 dark:bg-gray-950 overflow-hidden">
          {navItems.map((item) => (
            <button
              key={item.page}
              onClick={() => handleNav(item.page)}
              data-active={currentPage === item.page || undefined}
              className="block w-full rounded-lg px-3 py-2.5 text-left text-sm font-medium text-gray-600 transition-colors hover:bg-cyan-50 hover:text-cyan-700 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-cyan-400 dark:data-[active=true]:bg-gray-800 dark:data-[active=true]:text-cyan-400"
            >
              {item.label}
            </button>
          ))}
          <div className="mt-3 flex items-center gap-3">
            <div className="flex-1 flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700 dark:from-emerald-900/30 dark:text-emerald-400">
              <Shield className="h-3.5 w-3.5" />
              100% Free Tool
            </div>
            <ThemeToggle />
          </div>
        </div>
      )}

      {/* Ad Slot */}
      <div className="ad-slot no-print mx-auto flex max-w-[728px] items-center justify-center py-1">
        <span className="text-[10px] text-gray-300 dark:text-gray-700">Advertisement · 728×90</span>
      </div>
    </header>
  );
}