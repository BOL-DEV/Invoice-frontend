'use client';

import React, { useState } from 'react';
import { useActivityLogs } from '../../../features/activity/hooks/useActivityLogs';
import { usePermission } from '../../../features/auth/hooks/usePermission';
import { Card } from '../../../components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../../components/ui/table';
import { Button } from '../../../components/ui/button';
import { Badge } from '../../../components/ui/badge';
import { ShieldAlert, ChevronLeft, ChevronRight, Activity } from 'lucide-react';
import { Skeleton } from '../../../components/ui/skeleton';

export default function ActivityPage() {
  const { isAdmin } = usePermission();
  const [page, setPage] = useState(1);

  // Query paginated activity logs
  const { data, isLoading, isError } = useActivityLogs(page, 20);

  if (!isAdmin) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center max-w-sm mx-auto space-y-3">
        <div className="p-3.5 bg-rose-500/10 text-rose-500 rounded-full">
          <ShieldAlert className="h-10 w-10" />
        </div>
        <div className="space-y-1">
          <h3 className="text-lg font-bold text-foreground font-heading">Access Denied</h3>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Only Administrators are authorized to view system transactional audit trails.
          </p>
        </div>
      </div>
    );
  }

  const getActionBadge = (action: string) => {
    switch (action) {
      case 'LOGIN':
        return <Badge className="bg-emerald-50 hover:bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-[#10B981] border-emerald-100 dark:border-emerald-500/25 font-mono text-[10px] font-bold tracking-wider px-2 py-0.5 rounded-full">LOGIN</Badge>;
      case 'LOGOUT':
        return <Badge variant="secondary" className="bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 font-mono text-[10px] font-bold tracking-wider px-2 py-0.5 rounded-full">LOGOUT</Badge>;
      case 'INVOICE_CREATED':
        return <Badge className="bg-blue-50 hover:bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400 border-blue-100 dark:border-blue-500/25 font-mono text-[10px] font-bold tracking-wider px-2 py-0.5 rounded-full">CREATED</Badge>;
      case 'INVOICE_UPDATED':
        return <Badge className="bg-amber-50 hover:bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400 border-amber-100 dark:border-amber-500/25 font-mono text-[10px] font-bold tracking-wider px-2 py-0.5 rounded-full">UPDATED</Badge>;
      case 'INVOICE_PRINTED':
        return <Badge className="bg-purple-50 hover:bg-purple-50 text-purple-600 dark:bg-purple-500/10 dark:text-purple-400 border-purple-100 dark:border-purple-500/25 font-mono text-[10px] font-bold tracking-wider px-2 py-0.5 rounded-full">PRINTED</Badge>;
      case 'INVOICE_DOWNLOADED':
        return <Badge className="bg-indigo-50 hover:bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400 border-indigo-100 dark:border-indigo-500/25 font-mono text-[10px] font-bold tracking-wider px-2 py-0.5 rounded-full">DOWNLOAD</Badge>;
      default:
        return <Badge variant="outline" className="font-mono text-[10px] tracking-wider px-2 py-0.5 rounded-full">{action}</Badge>;
    }
  };

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-foreground font-heading flex items-center space-x-2">
            <Activity className="h-5 w-5 text-primary" />
            <span>System Activity Logs</span>
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Audit transactional logs, cashier sign-ins, document prints, and database updates.
          </p>
        </div>
      </div>

      {/* Logs Table */}
      <Card className="border-border bg-card shadow-premium rounded-2xl overflow-hidden">
        <Table>
          <TableHeader className="bg-secondary/40 sticky top-0 z-10 border-b border-border">
            <TableRow className="hover:bg-transparent">
              <TableHead className="w-52 font-semibold text-foreground py-4 pl-6">Timestamp</TableHead>
              <TableHead className="w-36 font-semibold text-foreground py-4">Action</TableHead>
              <TableHead className="w-56 font-semibold text-foreground py-4">User Email</TableHead>
              <TableHead className="w-40 font-semibold text-foreground py-4">IP Address</TableHead>
              <TableHead className="font-semibold text-foreground py-4 pr-6">Event Details</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              [1, 2, 3, 4, 5].map((i) => (
                <TableRow key={i} className="border-b border-border/60">
                  <TableCell className="py-4 pl-6"><Skeleton className="h-4 w-32" /></TableCell>
                  <TableCell className="py-4"><Skeleton className="h-6 w-16 rounded-full" /></TableCell>
                  <TableCell className="py-4"><Skeleton className="h-4 w-40" /></TableCell>
                  <TableCell className="py-4"><Skeleton className="h-4 w-24" /></TableCell>
                  <TableCell className="py-4 pr-6"><Skeleton className="h-4 w-60" /></TableCell>
                </TableRow>
              ))
            ) : isError || !data?.logs ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center p-8 text-rose-500 font-medium">
                  Failed to fetch audit trails.
                </TableCell>
              </TableRow>
            ) : data.logs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center p-12 text-muted-foreground italic">
                  No activity log history recorded.
                </TableCell>
              </TableRow>
            ) : (
              data.logs.map((log) => (
                <TableRow key={log.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/35 border-b border-border/60">
                  <TableCell className="text-xs text-muted-foreground font-mono py-4 pl-6">
                    {new Date(log.createdAt).toLocaleString(undefined, {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                      second: '2-digit',
                    })}
                  </TableCell>
                  <TableCell className="py-4">{getActionBadge(log.action)}</TableCell>
                  <TableCell className="font-bold text-foreground text-xs py-4">
                    {log.user?.email || `User ID: ${log.userId.slice(0, 8)}...`}
                  </TableCell>
                  <TableCell className="font-mono text-xs text-muted-foreground py-4">
                    {log.ipAddress || 'Unknown'}
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground font-mono truncate max-w-md py-4 pr-6" title={JSON.stringify(log.details)}>
                    {log.details ? JSON.stringify(log.details) : '—'}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        {/* Numbered Interactive Pagination */}
        {data && data.pagination && data.pagination.totalPages > 1 && (
          <div className="px-6 py-4 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-muted-foreground bg-secondary/15">
            <span className="font-mono text-[11px]">
              Showing {((page - 1) * 20) + 1} to {Math.min(page * 20, data.pagination.total)} of {data.pagination.total} records
            </span>
            
            <div className="flex items-center space-x-1.5">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(p - 1, 1))}
                className="h-8 rounded-xl text-xs px-2.5 border-border hover:bg-secondary cursor-pointer"
              >
                <ChevronLeft className="h-3.5 w-3.5 mr-1" />
                <span className="hidden sm:inline">Previous</span>
              </Button>

              {/* Number Buttons */}
              <div className="flex items-center space-x-1">
                {Array.from({ length: data.pagination.totalPages }, (_, i) => i + 1).map((pageNum) => {
                  if (
                    data.pagination.totalPages > 7 &&
                    pageNum !== 1 &&
                    pageNum !== data.pagination.totalPages &&
                    Math.abs(pageNum - page) > 1
                  ) {
                    if (pageNum === 2 || pageNum === data.pagination.totalPages - 1) {
                      return <span key={pageNum} className="px-1 text-muted-foreground">...</span>;
                    }
                    return null;
                  }

                  const isActive = pageNum === page;
                  return (
                    <button
                      key={pageNum}
                      type="button"
                      onClick={() => setPage(pageNum)}
                      className={`h-8 min-w-8 px-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center justify-center ${
                        isActive
                          ? 'bg-emerald-500 text-white font-bold shadow-sm'
                          : 'bg-secondary/60 text-muted-foreground hover:text-foreground hover:bg-secondary border border-border/50'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>

              <Button
                variant="outline"
                size="sm"
                disabled={page >= data.pagination.totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="h-8 rounded-xl text-xs px-2.5 border-border hover:bg-secondary cursor-pointer"
              >
                <span className="hidden sm:inline">Next</span>
                <ChevronRight className="h-3.5 w-3.5 ml-1" />
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
