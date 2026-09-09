import { NextRequest, NextResponse } from "next/server";
import { sanitizeUrl, securityHeaders } from "@/lib/security";
import { LLM } from "z-ai-web-dev-sdk";

// Simple in-memory rate limiter: max 10 requests per IP per minute
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_MAX = 10;
const RATE_LIMIT_WINDOW_MS = 60_000;

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return false;
  }
  entry.count++;
  return entry.count > RATE_LIMIT_MAX;
}

interface AuditData {
  url: string;
  seoScore: number;
  aeoScore: number;
  geoScore: number;
  aioScore: number;
  sxoScore: number;
  seoChecks: { name: string; status: string; detail: string }[];
  aiReadinessChecks: { name: string; type: string; status: string; detail: string }[];
  totalLinks: number;
  criticalIssues: number;
  warnings: number;
  keywords: { keyword: string; count: number; density: number }[];
  issues: { errorType: string; targetUrl: string; anchorText: string }[];
  pageTitle: string;
  metaDescription: string;
  h1Count: number;
  imageCount: number;
  imagesMissingAlt: number;
  hasHttps: boolean;
  hasCanonical: boolean;
  hasViewport: boolean;
  isIndexable: boolean;
}

interface Recommendation {
  title: string;
  description: string;
  impact: "high" | "medium" | "low";
  category: "on-page" | "off-page" | "technical" | "ai-readiness";
  estimatedTimeToFix: string;
}

interface RecommendationsResponse {
  summary: string;
  recommendations: Recommendation[];
}

function buildPrompt(data: AuditData): string {
  const failedChecks = data.seoChecks
    .filter((c) => c.status !== "PASS")
    .map((c) => `- ${c.name} (${c.status}): ${c.detail}`)
    .join("\n");

  const failedAiChecks = data.aiReadinessChecks
    .filter((c) => c.status !== "PASS")
    .map((c) => `- ${c.name} (${c.type}, ${c.status}): ${c.detail}`)
    .join("\n");

  const topKeywords = data.keywords
    .slice(0, 10)
    .map((k) => `${k.keyword} (${k.density.toFixed(1)}%)`)
    .join(", ");

  const issueTypes = data.issues.reduce<Record<string, number>>((acc, i) => {
    acc[i.errorType] = (acc[i.errorType] || 0) + 1;
    return acc;
  }, {});
  const issueSummary = Object.entries(issueTypes)
    .map(([type, count]) => `${type}: ${count}`)
    .join(", ");

  return `You are an expert SEO consultant. Analyze the following website audit data and provide personalized, actionable recommendations.

WEBSITE AUDIT DATA:
- URL: ${data.url}
- Page Title: ${data.pageTitle || "(missing)"}
- Meta Description: ${data.metaDescription || "(missing)"}
- H1 Count: ${data.h1Count}
- Images: ${data.imageCount} total, ${data.imagesMissingAlt} missing alt text
- HTTPS: ${data.hasHttps ? "Yes" : "No"}
- Canonical Tag: ${data.hasCanonical ? "Yes" : "No"}
- Viewport Meta: ${data.hasViewport ? "Yes" : "No"}
- Indexable: ${data.isIndexable ? "Yes" : "No"}

SCORES:
- SEO: ${data.seoScore}/100
- AEO (Answer Engine Optimization): ${data.aeoScore}/100
- GEO (Generative Engine Optimization): ${data.geoScore}/100
- AIO (AI Overview Optimization): ${data.aioScore}/100
- SXO (Search Experience Optimization): ${data.sxoScore}/100

LINK PROFILE:
- Total Links: ${data.totalLinks}
- Critical Issues: ${data.criticalIssues}
- Warnings: ${data.warnings}
- Issues Breakdown: ${issueSummary || "None"}

TOP KEYWORDS: ${topKeywords || "None detected"}

FAILED SEO CHECKS:
${failedChecks || "All checks passed"}

FAILED AI READINESS CHECKS:
${failedAiChecks || "All AI readiness checks passed"}

Based on this audit data, provide exactly 5 prioritized recommendations and a summary.

IMPORTANT: Return ONLY valid JSON in this exact format, no markdown, no code blocks:
{
  "summary": "A 2-3 sentence overall assessment of the site's SEO and AI search readiness status.",
  "recommendations": [
    {
      "title": "Short actionable title",
      "description": "1-2 sentence explanation of what to do and why it matters",
      "impact": "high",
      "category": "on-page",
      "estimatedTimeToFix": "30 min"
    }
  ]
}

Rules:
- Order recommendations by impact (high first, then medium, then low)
- Each impact must be exactly "high", "medium", or "low"
- Each category must be exactly one of: "on-page", "off-page", "technical", "ai-readiness"
- estimatedTimeToFix should be a human-readable time estimate like "15 min", "1 hour", "2-3 hours"
- Be specific to this site's actual issues, not generic advice
- Focus on the biggest score improvement opportunities first
- If AI readiness scores are low, include AI-readiness category recommendations`;
}

function parseLlmResponse(raw: string): RecommendationsResponse {
  // Strip markdown code block wrappers if present
  let cleaned = raw.trim();
  const codeBlockMatch = cleaned.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (codeBlockMatch) {
    cleaned = codeBlockMatch[1].trim();
  }

  // Strip leading/trailing non-JSON characters
  const jsonStart = cleaned.indexOf("{");
  const jsonEnd = cleaned.lastIndexOf("}");
  if (jsonStart !== -1 && jsonEnd !== -1) {
    cleaned = cleaned.slice(jsonStart, jsonEnd + 1);
  }

  try {
    const parsed = JSON.parse(cleaned);

    // Validate structure
    if (!parsed.summary || !Array.isArray(parsed.recommendations)) {
      throw new Error("Invalid response structure");
    }

    // Validate and normalize each recommendation
    const validImpacts = new Set(["high", "medium", "low"]);
    const validCategories = new Set(["on-page", "off-page", "technical", "ai-readiness"]);

    const recommendations = parsed.recommendations
      .filter((r: Record<string, unknown>) => r.title && r.description)
      .slice(0, 5)
      .map((r: Record<string, unknown>) => ({
        title: String(r.title),
        description: String(r.description),
        impact: validImpacts.has(r.impact as string) ? (r.impact as "high" | "medium" | "low") : "medium",
        category: validCategories.has(r.category as string) ? (r.category as "on-page" | "off-page" | "technical" | "ai-readiness") : "technical",
        estimatedTimeToFix: String(r.estimatedTimeToFix || "Unknown"),
      }));

    // Sort by impact order
    const impactOrder = { high: 0, medium: 1, low: 2 };
    recommendations.sort((a: Recommendation, b: Recommendation) => impactOrder[a.impact] - impactOrder[b.impact]);

    return {
      summary: String(parsed.summary),
      recommendations,
    };
  } catch (e) {
    throw new Error(`Failed to parse LLM response as JSON: ${e instanceof Error ? e.message : "Unknown error"}`);
  }
}

export async function POST(req: NextRequest) {
  const headers = securityHeaders();

  // Rate limiting
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || req.headers.get("x-real-ip") || "unknown";
  if (isRateLimited(ip)) {
    return NextResponse.json(
      { error: "Rate limit exceeded. Please wait a minute before trying again." },
      { status: 429, headers }
    );
  }

  try {
    const body = await req.json();
    const { auditData } = body as { auditData: AuditData };

    if (!auditData || !auditData.url) {
      return NextResponse.json(
        { error: "Missing required audit data" },
        { status: 400, headers }
      );
    }

    // Sanitize the URL
    const { url: safeUrl, error: urlError } = sanitizeUrl(auditData.url);
    if (urlError) {
      return NextResponse.json(
        { error: `Invalid URL: ${urlError}` },
        { status: 400, headers }
      );
    }

    // Replace the URL with the sanitized version
    const sanitizedData: AuditData = { ...auditData, url: safeUrl };

    // Build the prompt
    const prompt = buildPrompt(sanitizedData);

    // Call LLM
    const llm = new LLM();
    const result = await llm.chat({
      messages: [
        {
          role: "system",
          content:
            "You are an expert SEO consultant providing personalized, data-driven recommendations. Always respond with valid JSON only, no markdown formatting, no extra text.",
        },
        { role: "user", content: prompt },
      ],
      model: "default",
    });

    // Parse the response
    const recommendations = parseLlmResponse(result.content);

    return NextResponse.json(recommendations, { status: 200, headers });
  } catch (error) {
    console.error("[AI Recommendations API Error]", error);

    if (error instanceof Error && error.message.includes("Rate limit")) {
      return NextResponse.json(
        { error: error.message },
        { status: 429, headers }
      );
    }

    return NextResponse.json(
      {
        error: "Failed to generate AI recommendations. Please try again.",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500, headers }
    );
  }
}
