interface RateLimitEntry {
  timestamps: number[];
}

export class RateLimiter {
  private requests: Map<string, RateLimitEntry> = new Map();
  private windowMs: number;
  private maxRequests: number;
  private cleanupInterval: ReturnType<typeof setInterval> | null = null;

  constructor(windowMs: number = 60_000, maxRequests: number = 15) {
    this.windowMs = windowMs;
    this.maxRequests = maxRequests;
  }

  /**
   * Check if a given key is rate limited.
   * Returns true if the request should be blocked, false if allowed.
   */
  check(key: string): { limited: boolean; retryAfter: number } {
    const now = Date.now();
    const windowStart = now - this.windowMs;

    let entry = this.requests.get(key);

    if (!entry) {
      entry = { timestamps: [] };
      this.requests.set(key, entry);
    }

    // Remove timestamps outside the current window
    entry.timestamps = entry.timestamps.filter((ts) => ts > windowStart);

    if (entry.timestamps.length >= this.maxRequests) {
      // Calculate when the oldest request in the window will expire
      const oldestInWindow = Math.min(...entry.timestamps);
      const retryAfter = Math.ceil((oldestInWindow + this.windowMs - now) / 1000);
      return { limited: true, retryAfter: Math.max(1, retryAfter) };
    }

    // Record this request
    entry.timestamps.push(now);
    return { limited: false, retryAfter: 0 };
  }

  /**
   * Start the periodic cleanup of stale entries.
   */
  startCleanup(intervalMs: number = 60_000): void {
    if (this.cleanupInterval) return;

    this.cleanupInterval = setInterval(() => {
      const now = Date.now();
      const windowStart = now - this.windowMs;

      for (const [key, entry] of this.requests) {
        entry.timestamps = entry.timestamps.filter((ts) => ts > windowStart);
        if (entry.timestamps.length === 0) {
          this.requests.delete(key);
        }
      }
    }, intervalMs);
  }

  /**
   * Stop the cleanup interval.
   */
  stopCleanup(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
  }

  /**
   * Get the number of tracked keys (useful for monitoring).
   */
  size(): number {
    return this.requests.size;
  }
}