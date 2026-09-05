/**
 * Security utilities for API route hardening.
 */

/** Blocked metadata endpoints that should never be reached from this server */
const BLOCKED_METADATA_HOSTNAMES = [
  "169.254.169.254",
  "metadata.google.internal",
  "100.100.100.200",
];

/** Allowed ports for user-submitted URLs */
const ALLOWED_PORTS = new Set([80, 443, 8080]);

/** Blocked URL schemes */
const BLOCKED_SCHEMES = ["file:", "ftp:", "data:"];

/**
 * Check if a hostname is a private, loopback, link-local, or otherwise blocked address.
 *
 * Blocks:
 * - IPv4 loopback (127.0.0.0/8, 0.0.0.0, octal bypass like 0177.0.0.1)
 * - IPv6 loopback (::1, [::1])
 * - IPv4 private ranges (10.0.0.0/8, 172.16.0.0/12, 192.168.0.0/16)
 * - Link-local (169.254.0.0/16)
 * - Carrier-grade NAT (100.64.0.0/10)
 * - Benchmark testing (198.18.0.0/15)
 * - Cloud metadata endpoints
 * - "localhost" hostname
 */
export function isPrivateOrBlocked(hostname: string): boolean {
  // Lowercase for case-insensitive comparison
  const h = hostname.toLowerCase().replace(/^\[|\]$/g, ""); // Strip IPv6 brackets

  // Cloud metadata endpoints — check raw hostname first
  if (BLOCKED_METADATA_HOSTNAMES.includes(hostname.toLowerCase())) {
    return true;
  }
  if (BLOCKED_METADATA_HOSTNAMES.includes(h)) {
    return true;
  }

  // String-based localhost checks
  if (h === "localhost" || h.endsWith(".localhost")) {
    return true;
  }

  // 0.0.0.0
  if (h === "0.0.0.0") {
    return true;
  }

  // Octal bypass attempts (e.g., 0177.0.0.1 = 127.0.0.1)
  // Detect if any octet starts with 0 followed by another digit (octal notation)
  if (/\b0\d/.test(h)) {
    return true;
  }

  // Try to parse as IPv4
  const ipv4Parts = h.split(".");
  if (ipv4Parts.length === 4) {
    const allNumeric = ipv4Parts.every((p) => /^\d{1,3}$/.test(p));
    if (allNumeric) {
      const octets = ipv4Parts.map(Number);

      // 127.0.0.0/8 — loopback
      if (octets[0] === 127) return true;

      // 10.0.0.0/8
      if (octets[0] === 10) return true;

      // 172.16.0.0/12 — only 172.16 through 172.31
      if (octets[0] === 172 && octets[1] >= 16 && octets[1] <= 31) return true;

      // 192.168.0.0/16
      if (octets[0] === 192 && octets[1] === 168) return true;

      // 169.254.0.0/16 — link-local
      if (octets[0] === 169 && octets[1] === 254) return true;

      // 100.64.0.0/10 — carrier-grade NAT (100.64.0.0 – 100.127.255.255)
      if (octets[0] === 100 && octets[1] >= 64 && octets[1] <= 127) return true;

      // 198.18.0.0/15 — benchmark testing (198.18.0.0 – 198.19.255.255)
      if (octets[0] === 198 && (octets[1] === 18 || octets[1] === 19)) return true;
    }
  }

  // IPv6 loopback
  if (h === "::1" || h === "0000:0000:0000:0000:0000:0000:0000:0001") {
    return true;
  }

  // IPv4-mapped IPv6 loopback ::ffff:127.0.0.1 etc.
  if (h.startsWith("::ffff:")) {
    const v4 = h.slice(7);
    if (isPrivateOrBlocked(v4)) return true;
  }

  return false;
}

/**
 * Sanitize a URL string for safe use.
 *
 * Returns `{ url, error }`. If `error` is non-null, the URL should be rejected.
 */
export function sanitizeUrl(raw: string): { url: string; error: string | null } {
  // Strip trailing whitespace and control characters
  let cleaned = raw.replace(/[\x00-\x1f\s]+$/g, "").trim();

  // Limit URL length
  if (cleaned.length > 2048) {
    return { url: cleaned, error: "URL exceeds maximum allowed length" };
  }

  // Ensure a scheme is present
  if (!cleaned.startsWith("http://") && !cleaned.startsWith("https://")) {
    cleaned = "https://" + cleaned;
  }

  let parsed: URL;
  try {
    parsed = new URL(cleaned);
  } catch {
    return { url: cleaned, error: "Invalid URL format" };
  }

  // Block dangerous schemes
  if (BLOCKED_SCHEMES.some((s) => cleaned.toLowerCase().startsWith(s))) {
    return { url: cleaned, error: "URL scheme not allowed" };
  }

  // Block URLs with credentials (user:pass@)
  if (parsed.username || parsed.password) {
    return { url: cleaned, error: "URLs with embedded credentials are not allowed" };
  }

  // Block unusual ports (only allow 80, 443, 8080, and default/unset)
  const port = parsed.port ? parseInt(parsed.port, 10) : null;
  if (port !== null && !ALLOWED_PORTS.has(port)) {
    return { url: cleaned, error: "URL port not allowed" };
  }

  // Block private / internal / metadata hostnames
  if (isPrivateOrBlocked(parsed.hostname)) {
    return { url: cleaned, error: "Cannot audit internal or private URLs" };
  }

  return { url: parsed.href, error: null };
}

/**
 * Standard security response headers for API routes.
 */
export function securityHeaders(): Record<string, string> {
  return {
    "Cache-Control": "no-store, no-cache, must-revalidate",
    Pragma: "no-cache",
    "X-Content-Type-Options": "nosniff",
  };
}