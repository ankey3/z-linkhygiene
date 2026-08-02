'use client';

import { motion } from 'framer-motion';

export function ResultsSkeleton() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-8"
    >
      {/* Toolbar skeleton */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-6 w-32 rounded-lg bg-gray-200 animate-pulse" />
          <div className="h-6 w-24 rounded-full bg-emerald-100 animate-pulse" />
        </div>
        <div className="flex items-center gap-2">
          <div className="h-8 w-16 rounded-md bg-gray-200 animate-pulse" />
          <div className="h-8 w-14 rounded-md bg-gray-200 animate-pulse" />
          <div className="h-8 w-20 rounded-md bg-gray-200 animate-pulse" />
        </div>
      </div>

      {/* Scores row skeleton */}
      <div className="grid gap-8 lg:grid-cols-5">
        <div className="lg:col-span-3 rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
          <div className="h-5 w-32 rounded bg-gray-200 animate-pulse mb-6" />
          <div className="flex flex-wrap items-center justify-center gap-6">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex flex-col items-center gap-2">
                <div className="h-[120px] w-[120px] rounded-full bg-gray-100 animate-pulse" />
                <div className="h-3 w-12 rounded bg-gray-200 animate-pulse" />
                <div className="h-2.5 w-20 rounded bg-gray-100 animate-pulse" />
              </div>
            ))}
          </div>
        </div>
        <div className="lg:col-span-2 rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
          <div className="h-5 w-36 rounded bg-gray-200 animate-pulse mb-4" />
          <div className="flex h-[200px] items-center justify-center rounded-lg bg-gray-50">
            <div className="h-40 w-40 rounded-full bg-gray-100 animate-pulse" />
          </div>
        </div>
      </div>

      {/* SEO segments skeleton */}
      <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
        <div className="h-5 w-36 rounded bg-gray-200 animate-pulse mb-4" />
        <div className="grid grid-cols-3 gap-2 mb-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-9 rounded-lg bg-gray-100 animate-pulse" />
          ))}
        </div>
        <div className="space-y-2">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-14 rounded-lg bg-gray-50 animate-pulse" />
          ))}
        </div>
      </div>

      {/* AI readiness skeleton */}
      <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
        <div className="flex items-start justify-between mb-4">
          <div>
            <div className="h-5 w-48 rounded bg-gray-200 animate-pulse" />
            <div className="h-3 w-64 rounded bg-gray-100 animate-pulse mt-2" />
          </div>
          <div className="h-12 w-12 rounded-xl bg-gray-100 animate-pulse" />
        </div>
        <div className="grid gap-2 sm:grid-cols-2">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-16 rounded-lg bg-gray-50 animate-pulse" />
          ))}
        </div>
      </div>

      {/* Content analysis skeleton */}
      <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
        <div className="h-5 w-44 rounded bg-gray-200 animate-pulse mb-4" />
        <div className="space-y-4">
          <div className="h-40 rounded-lg bg-gray-50 animate-pulse" />
        </div>
      </div>
    </motion.div>
  );
}