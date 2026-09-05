import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { securityHeaders } from "@/lib/security";

// NOTE: Rate limiting is enforced by middleware. This route relies on that
// upstream protection and does not implement its own rate limiter.

const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 50;

function mapScan(s: Awaited<ReturnType<typeof db.auditScan.findMany>>[number]) {
  return {
    id: s.id,
    url: s.url,
    status: s.status,
    pagesCrawled: s.pagesCrawled,
    totalLinks: s.totalLinks,
    validLinks: s.validLinks,
    criticalIssues: s.criticalIssues,
    warnings: s.warnings,
    seoScore: s.seoScore,
    aeoScore: s.aeoScore,
    geoScore: s.geoScore,
    aioScore: s.aioScore,
    sxoScore: s.sxoScore,
    malformedLinks: s.malformedLinks,
    error404Links: s.error404Links,
    hashLinks: s.hashLinks,
    pageTitle: s.pageTitle || "",
    metaDescription: s.metaDescription || "",
    h1Count: s.h1Count,
    imageCount: s.imageCount,
    imagesMissingAlt: s.imagesMissingAlt,
    hasHttps: s.hasHttps,
    hasCanonical: s.hasCanonical,
    hasViewport: s.hasViewport,
    isIndexable: s.isIndexable,
    googleScore: s.googleScore,
    bingScore: s.bingScore,
    yahooScore: s.yahooScore,
    createdAt: s.createdAt.toISOString(),
    issues: s.issues.map((i) => ({
      id: i.id,
      errorType: i.errorType as "MALFORMED" | "404" | "HASH_LINK",
      targetUrl: i.targetUrl,
      anchorText: i.anchorText,
      sourceUrl: i.sourceUrl,
      whatItIs: i.whatItIs,
      whyItMatters: i.whyItMatters,
      howToFixIt: i.howToFixIt,
    })),
    linkData: s.linkData.map((d) => ({
      linkType: d.linkType,
      host: d.host,
      count: d.count,
    })),
    keywords: s.keywords.map((k) => ({
      keyword: k.keyword,
      count: k.count,
      density: k.density,
    })),
  };
}

export async function GET(request: NextRequest) {
  try {
    // --- Pagination: ?limit=N (max 50, default 20) & ?cursor=ID ---
    const { searchParams } = request.nextUrl;
    let limit = DEFAULT_LIMIT;
    const rawLimit = searchParams.get("limit");
    if (rawLimit) {
      const parsed = parseInt(rawLimit, 10);
      if (!isNaN(parsed) && parsed > 0) {
        limit = Math.min(parsed, MAX_LIMIT);
      }
    }

    const cursor = searchParams.get("cursor");

    const scans = await db.auditScan.findMany({
      orderBy: { createdAt: "desc" },
      take: limit + 1, // fetch one extra to determine if there's a next page
      ...(cursor
        ? {
            cursor: { id: cursor },
            skip: 1, // skip the cursor itself
          }
        : {}),
      include: {
        issues: true,
        linkData: true,
        keywords: true,
      },
    });

    const hasMore = scans.length > limit;
    const data = hasMore ? scans.slice(0, limit) : scans;
    const nextCursor = hasMore ? data[data.length - 1].id : null;

    // No sensitive data is included — only audit metadata, scores, and
    // publicly-visible scan results are returned.

    return NextResponse.json(
      {
        success: true,
        data: data.map(mapScan),
        pagination: {
          limit,
          nextCursor,
        },
      },
      { headers: securityHeaders() },
    );
  } catch (error) {
    // In production, log only the error message (not the full object)
    // to avoid leaking file paths, query details, or credentials.
    if (process.env.NODE_ENV === "development") {
      console.error("History error:", error);
    } else {
      console.error("History error:", error instanceof Error ? error.message : "Unknown error");
    }
    const message =
      process.env.NODE_ENV === "development"
        ? "Failed to fetch audit history"
        : "An unexpected error occurred";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}