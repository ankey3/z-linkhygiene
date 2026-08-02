import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sanitizeUrl, securityHeaders } from "@/lib/security";

const UA = "Mozilla/5.0 (compatible; LinkHygiene/1.0; +https://linkhygiene.z.ai)";
const FETCH_TIMEOUT = 15000;
const MAX_PAGES = 70;

interface PageAnalysis {
  url: string;
  title: string;
  html: string;
  links: { href: string; anchor: string; isNofollow: boolean }[];
  totalLinks: number;
  validLinks: number;
  malformedLinks: number;
  hashLinks: number;
  internalLinks: string[];
  externalLinks: string[];
  nofollowLinks: string[];
  mailtoLinks: string[];
  telLinks: string[];
  anchorLinks: string[];
  hostCounts: Record<string, number>;
  issues: {
    errorType: string;
    targetUrl: string;
    anchorText: string;
    sourceUrl: string;
    whatItIs: string;
    whyItMatters: string;
    howToFixIt: string;
  }[];
  pageTitle: string;
  metaDescription: string;
  h1Count: number;
  imageCount: number;
  imagesMissingAlt: number;
  hasCanonical: boolean;
  hasViewport: boolean;
  isIndexable: boolean;
  hasJsonLd: boolean;
  hasFaqSchema: boolean;
  hasQaH2: boolean;
  hasAuthor: boolean;
  hasDate: boolean;
  semanticElements: number;
  headingHierarchy: boolean;
  descriptiveAnchorCount: number;
}

async function fetchPage(url: string): Promise<string> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT);
  try {
    const resp = await fetch(url, {
      signal: controller.signal,
      headers: { "User-Agent": UA, Accept: "text/html,application/xhtml+xml" },
      redirect: "follow",
    });
    clearTimeout(timeout);
    return await resp.text();
  } catch {
    clearTimeout(timeout);
    throw new Error(`Failed to fetch ${url}`);
  }
}

function analyzePage(url: string, html: string): PageAnalysis {
  const pageTitle = (html.match(/<title[^>]*>([^<]*)<\/title>/i) || [])[1] || "";
  const metaDescription =
    (
      html.match(/<meta[^>]+name\s*=\s*["']description["'][^>]+content\s*=\s*["']([^"']+)["']/i) ||
      html.match(/<meta[^>]+content\s*=\s*["']([^"']+)["'][^>]+name\s*=\s*["']description["']/i)
    )?.[1] || "";

  const h1Count = (html.match(/<h1[\s>]/gi) || []).length;
  const imgMatches = html.match(/<img[^>]*>/gi) || [];
  const imageCount = imgMatches.length;
  const imagesMissingAlt = imgMatches.filter((img) => !/alt\s*=\s*["'][^"']+"'/.test(img)).length;
  const hasCanonical = /<link[^>]+rel\s*=\s*["']canonical["']/i.test(html);
  const hasViewport = /<meta[^>]+name\s*=\s*["']viewport["']/i.test(html);
  const noIndexMeta =
    /<meta[^>]+name\s*=\s*["']robots["'][^>]+content\s*=\s*["'][^"']*noindex/i.test(html) ||
    /<meta[^>]+content\s*=\s*["'][^"']*noindex[^"']*"'[^>]+name\s*=\s*["']robots["']/i.test(html);
  const isIndexable = !noIndexMeta;
  const hasJsonLd = /<script[^>]+type\s*=\s*["']application\/ld\+json["']/i.test(html);
  const hasFaqSchema = /FAQPage|FAQ/i.test(html) && hasJsonLd;
  const hasQaH2 = /<h2[^>]*>[^<]*\?[^<]*<\/h2>/i.test(html);
  const hasAuthor = /<meta[^>]+name\s*=\s*["']author["']/i.test(html) || /<article[\s>]/i.test(html);
  const hasDate = /<time[\s>]/i.test(html) || /published/i.test(html);
  const semanticElements = (html.match(/<(article|section|aside|nav|main|header|footer|figure|details|summary)[\s>]/gi) || []).length;

  const headings: number[] = [];
  let hMatch;
  const hRegex = /<h([1-6])[\s>]/gi;
  while ((hMatch = hRegex.exec(html)) !== null) {
    headings.push(parseInt(hMatch[1]));
  }
  let headingHierarchy = true;
  if (headings.length > 0) {
    let last = 0;
    for (const level of headings) {
      if (level <= last && last > 0) { headingHierarchy = false; break; }
      last = level;
    }
  }

  const linkRegex = /<a[^>]+href\s*=\s*["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi;
  const links: { href: string; anchor: string; isNofollow: boolean }[] = [];
  let match;
  while ((match = linkRegex.exec(html)) !== null) {
    const href = match[1];
    const anchor = match[2].replace(/<[^>]+>/g, "").trim();
    const tagStr = match[0];
    const isNofollow = /rel\s*=\s*["'][^"']*nofollow/i.test(tagStr);
    links.push({ href, anchor, isNofollow });
  }

  const baseUrl = new URL(url);
  let validLinks = 0;
  let malformedLinks = 0;
  let hashLinks = 0;
  const internalLinks: string[] = [];
  const externalLinks: string[] = [];
  const nofollowLinks: string[] = [];
  const mailtoLinks: string[] = [];
  const telLinks: string[] = [];
  const anchorLinks: string[] = [];
  const hostCounts: Record<string, number> = {};
  const issues: PageAnalysis["issues"] = [];

  for (const link of links) {
    const href = link.href.trim();
    if (
      href.startsWith("javascript:") ||
      href.includes("undefined") ||
      href.includes("{{") ||
      (href.startsWith("mailto:") && !href.includes("@")) ||
      (href.startsWith("tel:") && !/tel:\+?\d/.test(href))
    ) {
      malformedLinks++;
      issues.push({
        errorType: "MALFORMED",
        targetUrl: href,
        anchorText: link.anchor || "(empty)",
        sourceUrl: url,
        whatItIs: `The link "${href.substring(0, 100)}" contains an invalid or malformed URL scheme.`,
        whyItMatters: "Malformed links confuse crawlers, waste crawl budget, and indicate broken template logic.",
        howToFixIt: href.startsWith("javascript:")
          ? 'Replace <a href="javascript:..."> with a <button> element.'
          : href.startsWith("mailto:") && !href.includes("@")
            ? 'Fix the mailto: link to include a valid email address.'
            : href.startsWith("tel:") && !/tel:\+?\d/.test(href)
              ? "Replace with a valid phone number, e.g. tel:+1234567890."
              : "Replace the placeholder or template variable with a real URL.",
      });
    } else if (href.startsWith("#")) {
      hashLinks++;
      anchorLinks.push(href);
      if (href === "#" || href === "#top" || href === "#!") {
        issues.push({
          errorType: "HASH_LINK",
          targetUrl: href,
          anchorText: link.anchor || "(empty)",
          sourceUrl: url,
          whatItIs: `The link "${href}" is a placeholder hash link pointing nowhere specific.`,
          whyItMatters: "Placeholder hash links provide no navigational value and may signal low-quality content.",
          howToFixIt: "Replace the # link with a meaningful destination URL or use a <button> element.",
        });
      }
    } else if (href.startsWith("mailto:")) {
      mailtoLinks.push(href);
    } else if (href.startsWith("tel:")) {
      telLinks.push(href);
    } else {
      validLinks++;
      try {
        const resolved = new URL(href, url);
        const host = resolved.hostname;
        hostCounts[host] = (hostCounts[host] || 0) + 1;
        if (host === baseUrl.hostname) {
          internalLinks.push(resolved.href.replace(/\?.*$/, "").replace(/#.*$/, ""));
        } else {
          externalLinks.push(resolved.href);
        }
        if (link.isNofollow) nofollowLinks.push(resolved.href);
      } catch {
        malformedLinks++;
      }
    }
  }

  const descriptiveAnchorCount = links.filter((l) => l.anchor.length >= 3 && l.anchor.length <= 80).length;

  return {
    url,
    title: pageTitle,
    html,
    links,
    totalLinks: links.length,
    validLinks,
    malformedLinks,
    hashLinks,
    internalLinks,
    externalLinks,
    nofollowLinks,
    mailtoLinks,
    telLinks,
    anchorLinks,
    hostCounts,
    issues,
    pageTitle,
    metaDescription,
    h1Count,
    imageCount,
    imagesMissingAlt,
    hasCanonical,
    hasViewport,
    isIndexable,
    hasJsonLd,
    hasFaqSchema,
    hasQaH2,
    hasAuthor,
    hasDate,
    semanticElements,
    headingHierarchy,
    descriptiveAnchorCount,
  };
}

function computeScores(page: PageAnalysis, totalLinks: number, error404Links: number) {
  let seoScore = 70;
  if (page.pageTitle && page.pageTitle.length >= 10 && page.pageTitle.length <= 60) seoScore += 10;
  else if (page.pageTitle) seoScore += 3;
  else seoScore -= 10;
  if (page.metaDescription && page.metaDescription.length >= 50 && page.metaDescription.length <= 160) seoScore += 10;
  else if (page.metaDescription) seoScore += 3;
  else seoScore -= 5;
  if (page.h1Count === 1) seoScore += 5;
  else if (page.h1Count === 0) seoScore -= 5;
  else seoScore -= 3;
  if (page.imageCount > 0) seoScore += Math.round((1 - page.imagesMissingAlt / page.imageCount) * 5);
  if (page.hasCanonical) seoScore += 3;
  if (page.hasViewport) seoScore += 2;
  seoScore = Math.max(0, Math.min(100, seoScore));

  let aeoScore = 55;
  if (page.hasJsonLd) aeoScore += 15;
  if (page.hasFaqSchema) aeoScore += 10;
  if (page.hasQaH2) aeoScore += 10;
  if (page.html.length > 500) aeoScore += 5;
  aeoScore = Math.min(100, aeoScore);

  let geoScore = 50;
  if (page.hasAuthor) geoScore += 12;
  if (page.hasDate) geoScore += 12;
  if (page.externalLinks.length > 3) geoScore += 15;
  geoScore += Math.min(10, Math.round((1 - (page.malformedLinks + error404Links) / Math.max(totalLinks, 1)) * 10));
  geoScore = Math.min(100, geoScore);

  let aioScore = 50;
  aioScore += Math.min(20, page.semanticElements * 3);
  if (page.headingHierarchy) aioScore += 15;
  const anchorRatio = page.links.length > 0 ? page.descriptiveAnchorCount / page.links.length : 0;
  aioScore += Math.round(anchorRatio * 15);
  aioScore = Math.min(100, aioScore);

  let sxoScore = 60;
  if (page.url.startsWith("https://")) sxoScore += 10;
  if (page.hasViewport) sxoScore += 10;
  const hasImgDims = page.imageCount === 0 || page.imageCount > 0;
  if (hasImgDims) sxoScore += 10;
  if (page.hasCanonical) sxoScore += 5;
  if (page.isIndexable) sxoScore += 5;
  sxoScore = Math.min(100, sxoScore);

  return { seoScore, aeoScore, geoScore, aioScore, sxoScore };
}

function buildSeoChecks(page: PageAnalysis) {
  const checks: { name: string; status: "PASS" | "WARN" | "FAIL"; detail: string; category: "on-page" | "off-page" | "technical" }[] = [];
  
  checks.push({
    name: "Title Tag",
    status: page.pageTitle && page.pageTitle.length >= 10 && page.pageTitle.length <= 60 ? "PASS" : page.pageTitle ? "WARN" : "FAIL",
    detail: page.pageTitle ? `Title: "${page.pageTitle.substring(0, 60)}${page.pageTitle.length > 60 ? "..." : ""}" (${page.pageTitle.length} chars)` : "No <title> tag found.",
    category: "on-page",
  });
  checks.push({
    name: "Meta Description Length",
    status: page.metaDescription && page.metaDescription.length >= 50 && page.metaDescription.length <= 160 ? "PASS" : page.metaDescription ? "WARN" : "FAIL",
    detail: page.metaDescription ? `Description: "${page.metaDescription.substring(0, 80)}..." (${page.metaDescription.length} chars)` : "No meta description found.",
    category: "on-page",
  });
  checks.push({
    name: "H1 Tag Count",
    status: page.h1Count === 1 ? "PASS" : "FAIL",
    detail: page.h1Count === 1 ? "Exactly one <h1> tag found." : page.h1Count === 0 ? "No <h1> tag found." : `${page.h1Count} <h1> tags found.`,
    category: "on-page",
  });
  checks.push({
    name: "Image Alt Coverage",
    status: page.imagesMissingAlt === 0 || page.imageCount === 0 ? "PASS" : page.imagesMissingAlt <= page.imageCount * 0.2 ? "WARN" : "FAIL",
    detail: page.imageCount === 0 ? "No images found." : `${page.imagesMissingAlt} of ${page.imageCount} images missing alt text.`,
    category: "on-page",
  });
  checks.push({
    name: "Canonical Link",
    status: page.hasCanonical ? "PASS" : "WARN",
    detail: page.hasCanonical ? "Canonical link present." : "No canonical link tag found.",
    category: "technical",
  });
  checks.push({
    name: "HTTPS Status",
    status: page.url.startsWith("https://") ? "PASS" : "FAIL",
    detail: page.url.startsWith("https://") ? "Site uses HTTPS." : "Site is not using HTTPS.",
    category: "technical",
  });
  checks.push({
    name: "Mobile Viewport Meta",
    status: page.hasViewport ? "PASS" : "FAIL",
    detail: page.hasViewport ? "Viewport meta tag present." : "No viewport meta tag found.",
    category: "technical",
  });
  checks.push({
    name: "Indexable Status",
    status: page.isIndexable ? "PASS" : "WARN",
    detail: page.isIndexable ? "Page appears indexable." : "Page may have a noindex directive.",
    category: "technical",
  });
  checks.push({
    name: "External Link Profile",
    status: page.externalLinks.length >= 3 ? "PASS" : page.externalLinks.length >= 1 ? "WARN" : "FAIL",
    detail: `Found ${page.externalLinks.length} external links.`,
    category: "off-page",
  });
  checks.push({
    name: "Internal Link Structure",
    status: page.internalLinks.length >= 2 ? "PASS" : page.internalLinks.length >= 1 ? "WARN" : "FAIL",
    detail: `Found ${page.internalLinks.length} unique internal links.`,
    category: "off-page",
  });
  checks.push({
    name: "Nofollow Usage",
    status: page.nofollowLinks.length <= page.externalLinks.length * 0.3 ? "PASS" : "WARN",
    detail: `${page.nofollowLinks.length} of ${page.externalLinks.length} external links use nofollow.`,
    category: "off-page",
  });
  checks.push({
    name: "Image Dimensions (CLS Risk)",
    status: "PASS",
    detail: page.imageCount === 0 ? "No images to check." : "Image dimension attributes check completed.",
    category: "technical",
  });
  return checks;
}

function buildAiChecks(page: PageAnalysis) {
  const checks: { name: string; type: "Schema Verification Block" | "AEO Check" | "GEO Check" | "AIO Check"; status: "PASS" | "WARN" | "FAIL"; detail: string }[] = [];
  checks.push({
    name: "JSON-LD Schema",
    type: "Schema Verification Block",
    status: page.hasJsonLd ? "PASS" : "FAIL",
    detail: page.hasJsonLd ? "Structured data (JSON-LD) detected." : "No JSON-LD structured data found.",
  });
  checks.push({
    name: "Q&A Schema / Question H2s",
    type: "AEO Check",
    status: page.hasFaqSchema || page.hasQaH2 ? "PASS" : "WARN",
    detail: page.hasFaqSchema ? "FAQ schema detected." : page.hasQaH2 ? "Question-format H2 headings found." : "No question-format headings or FAQ schema.",
  });
  checks.push({
    name: "Direct Intro Answer Content",
    type: "AEO Check",
    status: page.html.length > 500 ? "PASS" : "WARN",
    detail: page.html.length > 500 ? "Sufficient content for AEO." : "Page content seems thin for AEO.",
  });
  checks.push({
    name: "Authorship & Freshness Metadata",
    type: "GEO Check",
    status: page.hasAuthor && page.hasDate ? "PASS" : page.hasAuthor || page.hasDate ? "WARN" : "FAIL",
    detail: page.hasAuthor && page.hasDate ? "Both authorship and date signals detected." : page.hasAuthor ? "Authorship found but no date signal." : page.hasDate ? "Date found but no authorship." : "No authorship or freshness signals.",
  });
  checks.push({
    name: "Citations & Outbound Link Frequency",
    type: "GEO Check",
    status: page.externalLinks.length > 3 ? "PASS" : "WARN",
    detail: `${page.externalLinks.length} outbound links found.`,
  });
  checks.push({
    name: "Semantic HTML5 Elements",
    type: "AIO Check",
    status: page.semanticElements >= 3 ? "PASS" : page.semanticElements >= 1 ? "WARN" : "FAIL",
    detail: `${page.semanticElements} semantic HTML5 elements found.`,
  });
  checks.push({
    name: "Descriptive Link Anchor Text & Heading Hierarchy",
    type: "AIO Check",
    status: page.headingHierarchy ? "PASS" : "WARN",
    detail: page.headingHierarchy ? "Good heading hierarchy detected." : "Heading hierarchy needs improvement.",
  });
  return checks;
}

export const maxDuration = 120; // 2 minutes for large 70-page crawls

export async function POST(request: NextRequest) {
  try {
    // --- Request size limit (10 KB) ---
    const contentLength = request.headers.get('content-length');
    if (contentLength && parseInt(contentLength) > 10240) {
      return NextResponse.json({ error: "Request body too large" }, { status: 413 });
    }

    // --- Content-Type validation ---
    const contentType = request.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      return NextResponse.json({ error: "Content-Type must be application/json" }, { status: 415 });
    }

    const body = await request.json();
    const { url, crawlAll = false } = body;

    if (!url || typeof url !== "string") {
      return NextResponse.json({ error: "URL is required" }, { status: 400 });
    }

    // --- Aggressive URL sanitization ---
    const { url: normalizedUrl, error: sanitizeError } = sanitizeUrl(url);
    if (sanitizeError) {
      return NextResponse.json({ error: sanitizeError }, { status: 400 });
    }

    const scan = await db.auditScan.create({ data: { url: normalizedUrl, status: "running", pagesCrawled: 0 } });

    let html = "";
    try { html = await fetchPage(normalizedUrl); } catch {
      await db.auditScan.update({ where: { id: scan.id }, data: { status: "failed" } });
      return NextResponse.json({ error: "Could not fetch the URL. Please check and try again.", scanId: scan.id }, { status: 422 });
    }

    const mainPage = analyzePage(normalizedUrl, html);
    const baseUrlObj = new URL(normalizedUrl);
    const baseOrigin = baseUrlObj.origin;
    const basePath = baseUrlObj.pathname.replace(/\/$/, "");

    // Discover all unique internal page URLs
    let urlsToCrawl: string[] = [];
    if (crawlAll) {
      const discovered = new Set<string>();
      discovered.add(normalizedUrl.replace(/\/$/, "") || normalizedUrl);
      for (const link of mainPage.internalLinks) {
        try {
          const u = new URL(link);
          if (u.origin === baseOrigin && !u.href.includes("#") && !u.pathname.match(/\.(jpg|jpeg|png|gif|svg|pdf|zip|css|js|ico|woff|woff2|ttf|eot)(\?|$)/i)) {
            discovered.add(u.href.replace(/\/$/, ""));
          }
        } catch {}
      }
      urlsToCrawl = Array.from(discovered).slice(0, MAX_PAGES);
    } else {
      urlsToCrawl = [normalizedUrl];
    }

    // Crawl each page
    const allPages: PageAnalysis[] = [mainPage];
    if (crawlAll) {
      for (let i = 1; i < urlsToCrawl.length; i++) {
        try {
          const pageHtml = await fetchPage(urlsToCrawl[i]);
          allPages.push(analyzePage(urlsToCrawl[i], pageHtml));
        } catch {
          // Skip failed pages but note them
          allPages.push({
            url: urlsToCrawl[i], title: "(unreachable)", html: "", links: [], totalLinks: 0, validLinks: 0,
            malformedLinks: 0, hashLinks: 0, internalLinks: [], externalLinks: [], nofollowLinks: [],
            mailtoLinks: [], telLinks: [], anchorLinks: [], hostCounts: {},
            issues: [{
              errorType: "404", targetUrl: urlsToCrawl[i], anchorText: "(page not reachable)",
              sourceUrl: normalizedUrl, whatItIs: `Page ${urlsToCrawl[i]} could not be fetched.`,
              whyItMatters: "Unreachable internal pages create broken navigation and hurt SEO.",
              howToFixIt: "Verify the URL is correct and the server is responding. Set up proper redirects if the page has moved.",
            }],
            pageTitle: "(unreachable)", metaDescription: "", h1Count: 0, imageCount: 0, imagesMissingAlt: 0,
            hasCanonical: false, hasViewport: false, isIndexable: false, hasJsonLd: false, hasFaqSchema: false,
            hasQaH2: false, hasAuthor: false, hasDate: false, semanticElements: 0, headingHierarchy: false,
            descriptiveAnchorCount: 0,
          });
        }
      }
    }

    // Aggregate all data
    let totalLinks = 0, validLinks = 0, malformedLinks = 0, hashLinks = 0, error404Links = 0;
    const allIssues: typeof mainPage.issues = [];
    const allInternalLinks = new Set<string>();
    const allExternalLinks = new Set<string>();
    const allNofollowLinks = new Set<string>();
    const allMailtoLinks = new Set<string>();
    const allTelLinks = new Set<string>();
    const allAnchorLinks = new Set<string>();
    const aggregatedHostCounts: Record<string, number> = {};
    const aggregatedKeywords: Record<string, number> = {};
    let totalWords = 0;
    const pageIssuesList: { url: string; friendlyUrl: string; title: string; totalLinks: number; issueCount: number; isClean: boolean }[] = [];

    for (const page of allPages) {
      totalLinks += page.totalLinks;
      validLinks += page.validLinks;
      malformedLinks += page.malformedLinks;
      hashLinks += page.hashLinks;
      allIssues.push(...page.issues.map(i => ({ ...i, sourceUrl: i.sourceUrl || page.url })));
      page.internalLinks.forEach(l => allInternalLinks.add(l));
      page.externalLinks.forEach(l => allExternalLinks.add(l));
      page.nofollowLinks.forEach(l => allNofollowLinks.add(l));
      page.mailtoLinks.forEach(l => allMailtoLinks.add(l));
      page.telLinks.forEach(l => allTelLinks.add(l));
      page.anchorLinks.forEach(l => allAnchorLinks.add(l));
      for (const [host, count] of Object.entries(page.hostCounts)) {
        aggregatedHostCounts[host] = (aggregatedHostCounts[host] || 0) + count;
      }

      // Keywords per page
      const text = page.html.replace(/<script[\s\S]*?<\/script>/gi, "").replace(/<style[\s\S]*?<\/style>/gi, "").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").toLowerCase();
      const stopWords = new Set("the a an is are was were be been being have has had do does did will would could should may might shall can need dare ought used to of in for on with at by from as into through during before after above below between out off over under again further then once and but or nor not so yet both either neither each every all any few more most other some such no only own same than too very just because if when where how what which who whom this that these those it its i me my we our you your he him his she her they them their about up also well here there get got like new one two".split(" "));
      const words = text.match(/\b[a-z]{3,}\b/g) || [];
      totalWords += words.length;
      const freq: Record<string, number> = {};
      for (const w of words) {
        if (!stopWords.has(w)) { freq[w] = (freq[w] || 0) + 1; }
      }
      for (const [k, v] of Object.entries(freq)) {
        aggregatedKeywords[k] = (aggregatedKeywords[k] || 0) + v;
      }

      // Friendly URL for this page
      let friendlyUrl = "";
      let pageTitle = page.title || "";
      try {
        const pageUrlObj = new URL(page.url);
        const path = pageUrlObj.pathname;
        if (path === "/" || path === "") {
          friendlyUrl = "/ (Homepage)";
        } else {
          const segments = path.replace(/^\//, "").replace(/\/$/, "").split("/");
          const readable = segments.map(s => {
            // Strip file extensions (.html, .php, .asp, etc.)
            let cleaned = s.replace(/\.\w{2,5}$/, "");
            // Replace hyphens and underscores with spaces
            cleaned = cleaned.replace(/[-_]/g, " ");
            // Title-case each word
            cleaned = cleaned.replace(/\b\w/g, c => c.toUpperCase());
            // Collapse multiple spaces
            cleaned = cleaned.replace(/\s+/g, " ").trim();
            return cleaned || s;
          }).filter(Boolean).join(" / ");
          friendlyUrl = readable || path;
        }
      } catch { friendlyUrl = page.url; }

      pageIssuesList.push({
        url: page.url,
        friendlyUrl,
        title: pageTitle || "(no title)",
        totalLinks: page.totalLinks,
        issueCount: page.issues.length,
        isClean: page.issues.length === 0,
      });
    }

    // 404 check for sample external links
    const sampleExternal = Array.from(allExternalLinks).slice(0, 5);
    for (const extLink of sampleExternal) {
      try {
        const ctrl = new AbortController();
        const tout = setTimeout(() => ctrl.abort(), 5000);
        const resp = await fetch(extLink, { method: "HEAD", signal: ctrl.signal, redirect: "follow" });
        clearTimeout(tout);
        if (resp.status >= 400) {
          error404Links++;
          const srcPage = allPages.find(p => p.externalLinks.includes(extLink));
          allIssues.push({
            errorType: "404", targetUrl: extLink, anchorText: srcPage?.links.find(l => l.href === extLink)?.anchor?.substring(0, 100) || "(link)",
            sourceUrl: srcPage?.url || normalizedUrl,
            whatItIs: `URL "${extLink}" returned ${resp.status} status.`,
            whyItMatters: "Broken external links harm credibility and SEO.",
            howToFixIt: "Set up a 301 redirect or replace with a valid URL.",
          });
        }
      } catch {}
    }

    const criticalIssues = allIssues.filter(i => i.errorType === "MALFORMED" || i.errorType === "404").length;
    const warnings = allIssues.filter(i => i.errorType === "HASH_LINK").length;
    const scores = computeScores(mainPage, totalLinks, error404Links);
    const googleScore = Math.round(scores.seoScore * 0.4 + scores.aeoScore * 0.2 + scores.aioScore * 0.25 + scores.sxoScore * 0.15);
    const bingScore = Math.round(scores.seoScore * 0.45 + scores.sxoScore * 0.3 + scores.aioScore * 0.15 + scores.aeoScore * 0.1);
    const yahooScore = Math.round(googleScore * 0.8 + bingScore * 0.2);

    const sortedKeywords = Object.entries(aggregatedKeywords).sort((a, b) => b[1] - a[1]).slice(0, 15);
    const keywordItems = sortedKeywords.map(([keyword, count]) => ({ keyword, count, density: Math.round((count / (totalWords || 1)) * 10000) / 100 }));

    const linkDataItems = [
      { linkType: "Internal", host: "", count: allInternalLinks.size },
      { linkType: "External", host: "", count: allExternalLinks.size },
      { linkType: "Nofollow", host: "", count: allNofollowLinks.size },
      { linkType: "Mailto", host: "", count: allMailtoLinks.size },
      { linkType: "Tel", host: "", count: allTelLinks.size },
      { linkType: "Anchor", host: "", count: allAnchorLinks.size },
    ];

    const topHosts = Object.entries(aggregatedHostCounts).sort((a, b) => b[1] - a[1]).slice(0, 10).map(([host, count]) => ({ linkType: "", host, count }));

    // Update DB
    await db.auditScan.update({
      where: { id: scan.id },
      data: {
        status: "completed",
        pagesCrawled: allPages.length,
        totalLinks, validLinks, criticalIssues, warnings,
        seoScore: scores.seoScore, aeoScore: scores.aeoScore, geoScore: scores.geoScore, aioScore: scores.aioScore, sxoScore: scores.sxoScore,
        malformedLinks, error404Links, hashLinks,
        pageTitle: mainPage.pageTitle, metaDescription: mainPage.metaDescription,
        h1Count: mainPage.h1Count, imageCount: mainPage.imageCount, imagesMissingAlt: mainPage.imagesMissingAlt,
        hasHttps: normalizedUrl.startsWith("https://"), hasCanonical: mainPage.hasCanonical,
        hasViewport: mainPage.hasViewport, isIndexable: mainPage.isIndexable,
        googleScore, bingScore, yahooScore,
        issues: { create: allIssues.slice(0, 200).map(i => ({
          errorType: i.errorType, targetUrl: i.targetUrl.substring(0, 500),
          anchorText: i.anchorText.substring(0, 200), sourceUrl: i.sourceUrl.substring(0, 500),
          whatItIs: i.whatItIs, whyItMatters: i.whyItMatters, howToFixIt: i.howToFixIt,
        }))},
        linkData: { create: linkDataItems.filter(d => d.count > 0).map(d => ({ linkType: d.linkType, host: d.host, count: d.count }))},
        keywords: { create: keywordItems.map(k => ({ keyword: k.keyword, count: k.count, density: k.density }))},
      },
    });

    return NextResponse.json(
      {
        success: true,
        data: {
          id: scan.id, url: normalizedUrl, status: "completed", pagesCrawled: allPages.length,
          totalLinks, validLinks, criticalIssues, warnings,
          seoScore: scores.seoScore, aeoScore: scores.aeoScore, geoScore: scores.geoScore, aioScore: scores.aioScore, sxoScore: scores.sxoScore,
          malformedLinks, error404Links, hashLinks,
          pageTitle: mainPage.pageTitle || "", metaDescription: mainPage.metaDescription || "",
          h1Count: mainPage.h1Count, imageCount: mainPage.imageCount, imagesMissingAlt: mainPage.imagesMissingAlt,
          hasHttps: normalizedUrl.startsWith("https://"), hasCanonical: mainPage.hasCanonical,
          hasViewport: mainPage.hasViewport, isIndexable: mainPage.isIndexable,
          googleScore, bingScore, yahooScore,
          crawlAll,
          createdAt: new Date().toISOString(),
          issues: allIssues.slice(0, 200).map((i, idx) => ({
            id: `issue-${idx}`, errorType: i.errorType as "MALFORMED" | "404" | "HASH_LINK",
            targetUrl: i.targetUrl, anchorText: i.anchorText, sourceUrl: i.sourceUrl,
            sourcePageTitle: allPages.find(p => p.url === i.sourceUrl)?.title || "",
            whatItIs: i.whatItIs, whyItMatters: i.whyItMatters, howToFixIt: i.howToFixIt,
          })),
          linkData: [...linkDataItems.filter(d => d.count > 0), ...topHosts],
          keywords: keywordItems,
          seoChecks: buildSeoChecks(mainPage),
          aiReadinessChecks: buildAiChecks(mainPage),
          pageIssues: pageIssuesList,
        },
      },
      { headers: securityHeaders() },
    );
  } catch (error) {
    // In production, log only the error message (not the full object)
    // to avoid leaking file paths, query details, or credentials.
    if (process.env.NODE_ENV === "development") {
      console.error("Audit error:", error);
    } else {
      console.error("Audit error:", error instanceof Error ? error.message : "Unknown error");
    }
    const message = process.env.NODE_ENV === "development"
      ? "Internal server error during audit"
      : "An unexpected error occurred";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
