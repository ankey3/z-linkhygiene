'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useAuditStore } from '@/lib/store';

/* ---------- inner countdown component (mount = reset) ---------- */

function AdContent({ onClose }: { onClose: () => void }) {
  const [countdown, setCountdown] = useState(5);
  const [canClose, setCanClose] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setCanClose(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 8 }}
      transition={{ duration: 0.3, ease: [0.19, 1, 0.22, 1] }}
      className="rounded-lg border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-900"
    >
      <DialogHeader className="px-5 pt-4 pb-0">
        <DialogTitle className="sr-only">Sponsor</DialogTitle>
        <DialogDescription className="sr-only">
          Sponsored content before viewing audit results
        </DialogDescription>
      </DialogHeader>

      <div className="px-5 pb-5 pt-2">
        {/* Ad label + countdown row */}
        <div className="mb-3 flex items-center justify-between">
          <span className="text-[11px] font-normal uppercase tracking-wide text-gray-400 dark:text-gray-500">
            Ad
          </span>
          {countdown > 0 && (
            <motion.span
              key={countdown}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-[11px] text-gray-400 dark:text-gray-500"
            >
              {countdown}s
            </motion.span>
          )}
        </div>

        {/* Ad content block — mimics a real AdSense text ad */}
        <div className="rounded-md border border-gray-100 bg-gray-50/60 p-4 dark:border-gray-800 dark:bg-gray-800/40">
          {/* Sponsor line: logo + name */}
          <div className="mb-2.5 flex items-center gap-2.5">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-[11px] font-bold text-white">
              WM
            </div>
            <div className="min-w-0">
              <p className="truncate text-[13px] font-semibold text-gray-900 dark:text-gray-100">
                WebMetrics Pro
              </p>
              <p className="text-[11px] text-gray-400 dark:text-gray-500">
                webmetricspro.com
              </p>
            </div>
          </div>

          {/* Headline */}
          <p className="mb-1.5 text-[15px] font-medium leading-snug text-gray-900 dark:text-gray-100">
            All-in-One Website Analytics Dashboard
          </p>

          {/* Description */}
          <p className="mb-3 text-[12px] leading-relaxed text-gray-600 dark:text-gray-400">
            Track visitors, conversions & SEO rankings in real-time. Simple setup,
            powerful insights for growing your business. Start your free trial today.
          </p>

          {/* "Learn More" link — looks like a real ad CTA */}
          <span className="inline-block cursor-pointer text-[12px] font-medium text-blue-600 underline decoration-blue-300 underline-offset-2 transition-colors hover:text-blue-700 dark:text-blue-400 dark:decoration-blue-700 dark:hover:text-blue-300">
            Learn More →
          </span>
        </div>

        {/* Support message */}
        <p className="mt-3 text-center text-[11px] text-gray-400 dark:text-gray-500">
          LinkHygiene is 100% free. This ad helps us keep it that way.
        </p>

        {/* Continue button */}
        <div className="mt-4">
          <Button
            onClick={onClose}
            disabled={!canClose}
            className="w-full gap-2 border-gray-200 bg-gray-50 text-sm font-medium text-gray-700 transition-all hover:bg-gray-100 hover:text-gray-900 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white"
            variant="outline"
            size="lg"
          >
            {canClose ? (
              <>
                Continue to Results
                <motion.span
                  initial={{ x: -4, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.1 }}
                >
                  →
                </motion.span>
              </>
            ) : (
              <>
                <motion.span
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  className="inline-block h-4 w-4 rounded-full border-2 border-gray-300 border-t-gray-600 dark:border-gray-600 dark:border-t-gray-300"
                />
                Please wait {countdown}s…
              </>
            )}
          </Button>
        </div>
      </div>
    </motion.div>
  );
}

/* ---------- main modal component ---------- */

interface ResultsAdModalProps {
  open: boolean;
  onClose: () => void;
}

export function ResultsAdModal({ open, onClose }: ResultsAdModalProps) {
  const adDismissed = useAuditStore((s) => s.adDismissed);
  const setAdDismissed = useAuditStore((s) => s.setAdDismissed);

  const handleClose = useCallback(() => {
    setAdDismissed(true);
    onClose();
  }, [setAdDismissed, onClose]);

  // If already dismissed, skip entirely
  useEffect(() => {
    if (adDismissed && open) {
      onClose();
    }
  }, [adDismissed, open, onClose]);

  const visible = open && !adDismissed;

  return (
    <Dialog open={visible} onOpenChange={(isOpen) => !isOpen && handleClose()}>
      <DialogContent
        showCloseButton={false}
        className="max-w-md border-0 bg-transparent p-0 shadow-none sm:max-w-lg [&>button]:hidden"
      >
        <AnimatePresence>
          {visible && <AdContent onClose={handleClose} />}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}