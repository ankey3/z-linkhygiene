import '@/lib/validate-env';
import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    // Query logging only in development — never log queries in production
    // as they may contain sensitive data and impact performance.
    ...(process.env.NODE_ENV !== 'production' ? { log: ['query'] } : {}),
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db