import { create } from "zustand";

export interface AuditResult {
  id: string;
  url: string;
  status: "pending" | "running" | "completed" | "failed";
  pagesCrawled: number;
  totalLinks: number;
  validLinks: number;
  criticalIssues: number;
  warnings: number;
  seoScore: number;
  aeoScore: number;
  geoScore: number;
  aioScore: number;
  sxoScore: number;
  malformedLinks: number;
  error404Links: number;
  hashLinks: number;
  pageTitle: string;
  metaDescription: string;
  h1Count: number;
  imageCount: number;
  imagesMissingAlt: number;
  hasHttps: boolean;
  hasCanonical: boolean;
  hasViewport: boolean;
  isIndexable: boolean;
  googleScore: number;
  bingScore: number;
  yahooScore: number;
  crawlAll: boolean;
  createdAt: string;
  issues: AuditIssue[];
  linkData: LinkDatum[];
  keywords: KeywordItem[];
  seoChecks: SeoCheck[];
  aiReadinessChecks: AiReadinessCheck[];
  pageIssues: PageIssue[];
}

export interface AuditIssue {
  id: string;
  errorType: "MALFORMED" | "404" | "HASH_LINK";
  targetUrl: string;
  anchorText: string;
  sourceUrl: string;
  sourcePageTitle: string;
  whatItIs: string;
  whyItMatters: string;
  howToFixIt: string;
}

export interface LinkDatum {
  linkType: string;
  host: string;
  count: number;
}

export interface KeywordItem {
  keyword: string;
  count: number;
  density: number;
}

export interface SeoCheck {
  name: string;
  status: "PASS" | "WARN" | "FAIL";
  detail: string;
  category: "on-page" | "off-page" | "technical";
}

export interface AiReadinessCheck {
  name: string;
  type: "Schema Verification Block" | "AEO Check" | "GEO Check" | "AIO Check";
  status: "PASS" | "WARN" | "FAIL";
  detail: string;
}

export interface PageIssue {
  url: string;
  friendlyUrl: string;
  title: string;
  totalLinks: number;
  issueCount: number;
  isClean: boolean;
}

export interface CrawlProgress {
  currentPage: string;
  currentPageTitle: string;
  pagesFound: number;
  pagesCrawled: number;
  totalPages: number;
  status: "discovering" | "crawling" | "completed";
}

export type AppPage = 'home' | 'audit-history' | 'about' | 'contact' | 'support' | 'privacy' | 'terms' | 'cookies';

const PAGE_PATHS: Record<AppPage, string> = {
  home: '/',
  'audit-history': '/audit-history',
  about: '/about',
  contact: '/contact',
  support: '/support',
  privacy: '/privacy',
  terms: '/terms',
  cookies: '/cookies',
};

const PATH_TO_PAGE: Record<string, AppPage> = Object.fromEntries(
  Object.entries(PAGE_PATHS).map(([k, v]) => [v, k as AppPage])
);

export function pageToPath(page: AppPage): string {
  return PAGE_PATHS[page];
}

export function pathToPage(path: string): AppPage {
  return PATH_TO_PAGE[path] || 'home';
}

interface AuditStore {
  currentAudit: AuditResult | null;
  isScanning: boolean;
  crawlProgress: CrawlProgress | null;
  scanHistory: AuditResult[];
  compareAudit: AuditResult | null;
  currentPage: AppPage;
  adDismissed: boolean;
  setCurrentAudit: (audit: AuditResult | null) => void;
  setScanning: (scanning: boolean) => void;
  setCrawlProgress: (progress: CrawlProgress | null) => void;
  setScanHistory: (history: AuditResult[]) => void;
  addToHistory: (audit: AuditResult) => void;
  setCompareAudit: (audit: AuditResult | null) => void;
  setPage: (page: AppPage) => void;
  setAdDismissed: (dismissed: boolean) => void;
}

export const useAuditStore = create<AuditStore>((set) => ({
  currentAudit: null,
  isScanning: false,
  crawlProgress: null,
  scanHistory: [],
  compareAudit: null,
  currentPage: 'home' as AppPage,
  adDismissed: false,
  setCurrentAudit: (audit) => set({ currentAudit: audit }),
  setScanning: (scanning) => set({ isScanning: scanning }),
  setCrawlProgress: (progress) => set({ crawlProgress: progress }),
  setScanHistory: (history) => set({ scanHistory: history }),
  addToHistory: (audit) =>
    set((state) => ({
      scanHistory: [audit, ...state.scanHistory].slice(0, 20),
    })),
  setCompareAudit: (audit) => set({ compareAudit: audit }),
  setPage: (page) => {
    const path = PAGE_PATHS[page];
    window.history.pushState({ page }, '', path);
    set({ currentPage: page, adDismissed: false });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  },
  setAdDismissed: (dismissed) => set({ adDismissed: dismissed }),
}));
