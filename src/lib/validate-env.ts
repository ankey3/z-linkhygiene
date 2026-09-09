/**
 * Environment variable validation — called at startup to fail fast on missing
 * critical configuration. Only checks vars that the app absolutely needs.
 *
 * In development, missing vars produce a warning (not a crash) so that
 * `next dev` stays usable.
 */

interface EnvSpec {
  name: string;
  required: boolean;
  description: string;
}

const REQUIRED_ENV_VARS: EnvSpec[] = [
  {
    name: "DATABASE_URL",
    required: true,
    description: "Neon PostgreSQL connection string (pooled, e.g., postgres://user:pass@ep-xxx.region.aws.neon.tech/dbname)",
  },
  {
    name: "DIRECT_URL",
    required: true,
    description: "Neon direct connection string for Prisma migrations (non-pooled)",
  },
];

const OPTIONAL_ENV_VARS: EnvSpec[] = [
  {
    name: "NEXT_PUBLIC_SITE_URL",
    required: false,
    description: "Canonical site URL for SEO metadata and OG tags",
  },
  {
    name: "NEXT_PUBLIC_ADSENSE_ID",
    required: false,
    description: "Google AdSense publisher ID (e.g., ca-pub-XXXXX)",
  },
  {
    name: "CORS_ORIGINS",
    required: false,
    description: "Comma-separated list of allowed CORS origins (default: same-origin only)",
  },
];

export function validateEnv(): void {
  const isProduction = process.env.NODE_ENV === "production";
  const missing: string[] = [];

  for (const spec of REQUIRED_ENV_VARS) {
    if (!process.env[spec.name]) {
      if (isProduction) {
        missing.push(spec.name);
      } else {
        console.warn(
          `[env] WARNING: ${spec.name} is not set. ${spec.description}`
        );
      }
    }
  }

  if (isProduction && missing.length > 0) {
    console.error(`
═══════════════════════════════════════════════════════════
  FATAL: Missing required environment variables:
  ${missing.join(", ")}

  The application cannot start without these variables.
  Please set them in your Vercel project dashboard:
    Settings → Environment Variables
═══════════════════════════════════════════════════════════
`);
    process.exit(1);
  }

  // Validate DATABASE_URL format (should be postgres:// or postgresql://)
  const dbUrl = process.env.DATABASE_URL;
  if (dbUrl && !dbUrl.startsWith("postgres") && !dbUrl.startsWith("postgresql")) {
    console.warn(
      `[env] WARNING: DATABASE_URL does not appear to be a PostgreSQL connection string. ` +
      `Expected format: postgres://user:pass@host/db or postgresql://user:pass@host/db`
    );
  }

  // Log configured optional vars in development for debugging
  if (!isProduction) {
    for (const spec of OPTIONAL_ENV_VARS) {
      if (process.env[spec.name]) {
        console.log(`[env] ${spec.name} = ${process.env[spec.name]!.substring(0, 20)}...`);
      }
    }
  }
}

// Auto-validate on module import (server-side only)
if (typeof window === "undefined") {
  validateEnv();
}
