import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { RateLimiter } from "@/lib/rate-limit";

// ---------------------------------------------------------------------------
// Allowed origins for CORS (reads from env or defaults to same-origin only)
// ---------------------------------------------------------------------------
const ALLOWED_ORIGINS = (process.env.CORS_ORIGINS || "").split(",").map(s => s.trim()).filter(Boolean);

// ---------------------------------------------------------------------------
// Rate limiter – 15 requests per minute per IP on /api/* routes
// ---------------------------------------------------------------------------
const apiRateLimiter = new RateLimiter(60_000, 15);
apiRateLimiter.startCleanup(60_000);

// ---------------------------------------------------------------------------
// Known bad-bot signatures (checked case-insensitively against User-Agent)
// ---------------------------------------------------------------------------
const BAD_BOT_SIGNATURES = [
  "sqlmap",
  "nikto",
  "nmap",
  "masscan",
  "zgrab",
  "gobuster",
  "dirbuster",
  "wfuzz",
];

// ---------------------------------------------------------------------------
// Helper: build the security headers applied to every response
// ---------------------------------------------------------------------------
function getSecurityHeaders(): HeadersInit {
  return {
    "Content-Security-Policy": [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://pagead2.googlesyndication.com https://googlesyndication.com",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com data:",
      "img-src 'self' data: https: blob:",
      "connect-src 'self' https://pagead2.googlesyndication.com https://*.doubleclick.net https://googleads.g.doubleclick.net https://stats.g.doubleclick.net",
      "frame-src https://pagead2.googlesyndication.com https://tpc.googlesyndication.com",
      "child-src https://pagead2.googlesyndication.com",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "frame-ancestors 'none'",
      "upgrade-insecure-requests",
    ].join("; "),
    "Strict-Transport-Security": "max-age=31536000; includeSubDomains; preload",
    "X-Content-Type-Options": "nosniff",
    "X-Frame-Options": "DENY",
    "Referrer-Policy": "strict-origin-when-cross-origin",
    "Permissions-Policy":
      "camera=(), microphone=(), geolocation=(), interest-cohort=()",
    "X-DNS-Prefetch-Control": "on",
    "X-XSS-Protection": "0",
    "Cross-Origin-Opener-Policy": "same-origin",
    "Cross-Origin-Resource-Policy": "same-origin",
  };
}

// ---------------------------------------------------------------------------
// Helper: derive client IP from the request (handles X-Forwarded-For / CF)
// ---------------------------------------------------------------------------
function getClientIp(request: NextRequest): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }
  const realIp = request.headers.get("x-real-ip");
  if (realIp) return realIp.trim();
  return "127.0.0.1";
}

// ---------------------------------------------------------------------------
// Helper: check if an origin is allowed for CORS
// ---------------------------------------------------------------------------
function isAllowedOrigin(origin: string | null): boolean {
  if (!origin) return false;
  // No CORS_ORIGINS configured = same-origin only (browser handles this)
  if (ALLOWED_ORIGINS.length === 0) return false;
  return ALLOWED_ORIGINS.includes(origin);
}

// ---------------------------------------------------------------------------
// Middleware
// ---------------------------------------------------------------------------
export function middleware(request: NextRequest) {
  const securityHeaders = getSecurityHeaders();

  // ── 0. CORS handling for API routes ────────────────────────────────────
  const origin = request.headers.get("origin");
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/api/")) {
    // Preflight OPTIONS request
    if (request.method === "OPTIONS") {
      if (isAllowedOrigin(origin)) {
        return new NextResponse(null, {
          status: 204,
          headers: {
            ...securityHeaders,
            "Access-Control-Allow-Origin": origin!,
            "Access-Control-Allow-Methods": "GET, POST, DELETE, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type, Authorization",
            "Access-Control-Max-Age": "86400",
            "Access-Control-Allow-Credentials": "true",
          },
        });
      }
      return new NextResponse(null, { status: 204, headers: securityHeaders });
    }

    // Non-preflight: set CORS header only if origin is allowed
    if (isAllowedOrigin(origin)) {
      const response = NextResponse.next();
      for (const [key, value] of Object.entries(securityHeaders)) {
        response.headers.set(key, value);
      }
      response.headers.set("Access-Control-Allow-Origin", origin!);
      response.headers.set("Access-Control-Allow-Credentials", "true");
      // Continue to rate limiting & bot protection below
    }
  }

  const response = NextResponse.next();

  // ── 1. Attach security headers to every response ──────────────────────
  for (const [key, value] of Object.entries(securityHeaders)) {
    response.headers.set(key, value);
  }

  // ── 2. Bot protection ─────────────────────────────────────────────────
  const userAgent = request.headers.get("user-agent") ?? "";

  if (!userAgent) {
    return new NextResponse("Forbidden: Missing User-Agent", {
      status: 403,
      headers: securityHeaders,
    });
  }

  const lowerUA = userAgent.toLowerCase();
  for (const signature of BAD_BOT_SIGNATURES) {
    if (lowerUA.includes(signature)) {
      return new NextResponse("Forbidden: Bot detected", {
        status: 403,
        headers: securityHeaders,
      });
    }
  }

  // ── 3. Rate limiting for /api/* routes ────────────────────────────────
  if (pathname.startsWith("/api/")) {
    const ip = getClientIp(request);
    const { limited, retryAfter } = apiRateLimiter.check(ip);

    if (limited) {
      const rateLimitHeaders: HeadersInit = {
        ...securityHeaders,
        "Retry-After": String(retryAfter),
      };
      return new NextResponse("Too Many Requests", {
        status: 429,
        headers: rateLimitHeaders,
      });
    }
  }

  return response;
}

// ---------------------------------------------------------------------------
// Matcher – skip static assets & internal Next.js files
// ---------------------------------------------------------------------------
export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|icon.png|og-image.png|robots.txt|sitemap.xml).*)",
  ],
};
