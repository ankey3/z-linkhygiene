import '@/lib/validate-env';
import { PrismaClient } from '@prisma/client'
import { Pool, neon } from '@neondatabase/serverless'
import { PrismaNeon } from '@prisma/adapter-neon'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

function createPrismaClient(): PrismaClient {
  // Use Neon serverless driver for Vercel serverless functions
  // Falls back to standard PrismaClient if no DATABASE_URL (shouldn't happen in prod)
  const connectionString = process.env.DATABASE_URL

  if (!connectionString) {
    throw new Error('DATABASE_URL is not set. Required for Neon PostgreSQL connection.')
  }

  // Neon serverless pool — optimized for Vercel edge/serverless
  const pool = new Pool({ connectionString })
  const adapter = new PrismaNeon(pool)

  return new PrismaClient({
    adapter,
    // Query logging only in development — never log queries in production
    // as they may contain sensitive data and impact performance.
    ...(process.env.NODE_ENV !== 'production' ? { log: ['query'] } : {}),
  })
}

export const db = globalForPrisma.prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db
