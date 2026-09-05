import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { RateLimiter } from "@/lib/rate-limit";

const ALLOWED_ORIGINS = (process.env.CORS_ORIGINS || "")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

const apiRateLimiter = new RateLimiter(60_000, 15);
apiRateLimiter.startCleanup(60_000);

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

function getSecurityHeaders(): HeadersInit {
  return {
    "Content-Security-Policy": [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com https://www.google-analytics.com https://pagead2.googlesyndication.com https://googlesyndication.com https://googleads.g.doubleclick.net https://*.googlesyndication.com",
      "script-src-elem 'self' 'unsafe-inline' https://www.googletagmanager.com https://www.google-analytics.com https://pagead2.googlesyndication.com https://googlesyndication.com https://googleads.g.doubleclick.net https://*.googlesyndication.com",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com data:",
      "img-src 'self' data: https: blob:",
      "connect-src 'self' https://www.google-analytics.com https://analytics.google.com https://www.googletagmanager.com https://pagead2.googlesyndication.com https://*.googlesyndication.com https://*.doubleclick.net https://googleads.g.doubleclick.net https://stats.g.doubleclick.net",
      "frame-src 'self' https://pagead2.googlesyndication.com https://tpc.googlesyndication.com https://googleads.g.doubleclick.net https://*.doubleclick.net",
      "child-src 'self' https://pagead2.googlesyndication.com https://tpc.googlesyndication.com https://googleads.g.doubleclick.net",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "frame-ancestors 'none'",
      "upgrade-insecure-requests",
    ].join("; "),
    "Strict-Transport-Security":
      "max-age=31536000; includeSubDomains; preload",
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

function getClientIp(request: NextRequest): string {
  const forwarded = request.headers.get("x-forwarded-for");

  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }

  const realIp = request.headers.get("x-real-ip");

  if (realIp) {
    return realIp.trim();
  }

  return "127.0.0.1";
}

function isAllowedOrigin(origin: string | null): boolean {
  if (!origin) return false;

  if (ALLOWED_ORIGINS.length === 0) {
    return false;
  }

  return ALLOWED_ORIGINS.includes(origin);
}

export function middleware(request: NextRequest) {
  const securityHeaders = getSecurityHeaders();
  const { pathname } = request.nextUrl;
  const origin = request.headers.get("origin");

  if (pathname.startsWith("/api/") && request.method === "OPTIONS") {
    const headers = new Headers(securityHeaders);

    if (isAllowedOrigin(origin)) {
      headers.set("Access-Control-Allow-Origin", origin!);
      headers.set(
        "Access-Control-Allow-Methods",
        "GET, POST, DELETE, OPTIONS",
      );
      headers.set(
        "Access-Control-Allow-Headers",
        "Content-Type, Authorization",
      );
      headers.set("Access-Control-Max-Age", "86400");
      headers.set("Access-Control-Allow-Credentials", "true");
    }

    return new NextResponse(null, {
      status: 204,
      headers,
    });
  }

  const response = NextResponse.next();

  for (const [key, value] of Object.entries(securityHeaders)) {
    response.headers.set(key, value);
  }

  if (pathname.startsWith("/api/") && isAllowedOrigin(origin)) {
    response.headers.set("Access-Control-Allow-Origin", origin!);
    response.headers.set("Access-Control-Allow-Credentials", "true");
  }

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

  if (pathname.startsWith("/api/")) {
    const ip = getClientIp(request);
    const { limited, retryAfter } = apiRateLimiter.check(ip);

    if (limited) {
      const rateLimitHeaders = new Headers(securityHeaders);
      rateLimitHeaders.set("Retry-After", String(retryAfter));

      return new NextResponse("Too Many Requests", {
        status: 429,
        headers: rateLimitHeaders,
      });
    }
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|icon.png|og-image.png|robots.txt|sitemap.xml).*)",
  ],
};