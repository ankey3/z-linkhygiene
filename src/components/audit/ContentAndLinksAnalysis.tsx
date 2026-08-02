'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { BarChart3, Link2, Globe } from 'lucide-react';
import { useAuditStore, type AuditResult } from '@/lib/store';

export function ContentAndLinksAnalysis({ audit }: { audit: AuditResult | null }) {
  if (!audit) return null;

  const linkTypeData = audit.linkData.filter((d) => d.linkType);
  const hostData = audit.linkData.filter((d) => d.host);

  return (
    <Card className="card-hover-lift border-cyan-100 shadow-md shadow-cyan-50/50 dark:border-gray-800 dark:shadow-none">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base font-bold text-gray-900 dark:text-white">
          <BarChart3 className="h-5 w-5 text-cyan-600 dark:text-cyan-400" />
          Content Sentiment & Link Breakdown
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Top Keywords */}
        <div>
          <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-200">
            <BarChart3 className="h-4 w-4 text-purple-500 dark:text-purple-400" />
            Top Keywords Ranked by Density
          </h3>
          <div className="max-h-64 overflow-y-auto rounded-lg border border-gray-100 dark:border-gray-800 custom-scrollbar">
            <Table className="table-alt-rows table-sticky-header">
              <TableHeader>
                <TableRow className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                  <TableHead className="text-xs font-semibold dark:text-gray-300">Keyword</TableHead>
                  <TableHead className="text-right text-xs font-semibold dark:text-gray-300">Count</TableHead>
                  <TableHead className="text-right text-xs font-semibold dark:text-gray-300">Density</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {audit.keywords.map((kw) => (
                  <TableRow key={kw.keyword}>
                    <TableCell className="text-xs font-medium text-gray-700 dark:text-gray-300">{kw.keyword}</TableCell>
                    <TableCell className="text-right text-xs text-gray-600 dark:text-gray-400">{kw.count}</TableCell>
                    <TableCell className="text-right text-xs">
                      <span className="inline-flex items-center gap-1.5">
                        <span className="h-1.5 w-1.5 rounded-full bg-cyan-400" />
                        {kw.density}%
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
                {audit.keywords.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center text-xs text-gray-400 dark:text-gray-500 py-6">
                      No keyword data extracted
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>

        {/* Link Types */}
        <div>
          <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-200">
            <Link2 className="h-4 w-4 text-emerald-500 dark:text-emerald-400" />
            Link Types Distribution
          </h3>
          <div className="max-h-48 overflow-y-auto rounded-lg border border-gray-100 dark:border-gray-800 custom-scrollbar">
            <Table className="table-alt-rows table-sticky-header">
              <TableHeader>
                <TableRow className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                  <TableHead className="text-xs font-semibold dark:text-gray-300">Link Type</TableHead>
                  <TableHead className="text-right text-xs font-semibold dark:text-gray-300">Count</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {linkTypeData.map((d) => (
                  <TableRow key={d.linkType}>
                    <TableCell className="text-xs font-medium text-gray-700 dark:text-gray-300">{d.linkType}</TableCell>
                    <TableCell className="text-right">
                      <span className="inline-flex h-6 min-w-6 items-center justify-center rounded-full bg-cyan-50 px-2 text-xs font-bold text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400">
                        {d.count}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>

        {/* Top Hosts */}
        {hostData.length > 0 && (
          <div>
            <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-200">
              <Globe className="h-4 w-4 text-orange-500 dark:text-orange-400" />
              Top Hosts Linked
            </h3>
            <div className="max-h-48 overflow-y-auto rounded-lg border border-gray-100 dark:border-gray-800 custom-scrollbar">
              <Table className="table-alt-rows table-sticky-header">
                <TableHeader>
                  <TableRow className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                    <TableHead className="text-xs font-semibold dark:text-gray-300">Domain / Host</TableHead>
                    <TableHead className="text-right text-xs font-semibold dark:text-gray-300">Count</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {hostData.map((d) => (
                    <TableRow key={d.host}>
                      <TableCell className="text-xs font-medium text-gray-700 dark:text-gray-300 truncate max-w-[200px]">{d.host}</TableCell>
                      <TableCell className="text-right">
                        <span className="inline-flex h-6 min-w-6 items-center justify-center rounded-full bg-orange-50 px-2 text-xs font-bold text-orange-700 dark:bg-orange-900/30 dark:text-orange-400">
                          {d.count}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}