'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';

interface InfoModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  content: string;
}

export function InfoModal({ open, onClose, title, content }: InfoModalProps) {
  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-lg border-blue-100 bg-white p-0 shadow-2xl shadow-blue-100/50 dark:border-gray-800 dark:bg-gray-950 dark:shadow-none">
        <DialogHeader className="border-b border-blue-50 bg-gradient-to-r from-blue-50 to-cyan-50/50 px-6 py-4 dark:border-gray-800 dark:from-blue-950/50 dark:to-cyan-950/30">
          <DialogTitle className="text-lg font-bold text-gray-900 dark:text-white">{title}</DialogTitle>
          <DialogDescription className="sr-only">{title}</DialogDescription>
        </DialogHeader>
        <div className="px-6 py-5">
          <div className="whitespace-pre-line text-sm leading-relaxed text-gray-600 dark:text-gray-400">
            {content}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}