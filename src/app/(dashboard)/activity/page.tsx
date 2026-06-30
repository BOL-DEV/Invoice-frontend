'use client';

import React, { useState } from 'react';
import { useActivityLogs } from '../../../features/activity/hooks/useActivityLogs';
import { usePermission } from '../../../features/auth/hooks/usePermission';
import { Card, CardContent } from '../../../components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../../components/ui/table';
import { Button } from '../../../components/ui/button';
import { Badge } from '../../../components/ui/badge';
import { ShieldAlert, ChevronLeft, ChevronRight } from 'lucide-react';

export default function ActivityPage() {
  const { isAdmin } = usePermission();
  const [page, setPage] = useState(1);

  // Query paginated activity logs
  const { data, isLoading, isError } = useActivityLogs(page, 20);

  if (!isAdmin) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <ShieldAlert className="h-12 w-12 text-rose-500 mb-4" />
        <h3 className="text-lg font-bold text-foreground">Access Denied</h3>
        <p className="text-sm text-muted-foreground max-w-xs">
          Only Administrators are authorized to view system transactional audit trails.
        </p>
      </div>
    );
  }

  const getActionBadge = (action: string) => {
    switch (action) {
      case 'LOGIN':
        return <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 font-mono text-xs">LOGIN</Badge>;
      case 'LOGOUT':
        return <Badge variant="secondary" className="bg-zinc-800 text-zinc-300 font-mono text-xs">LOGOUT</Badge>;
      case 'INVOICE_CREATED':
        return <Badge className="bg-blue-500/10 text-blue-500 border-blue-500/20 font-mono text-xs">CREATED</Badge>;
      case 'INVOICE_UPDATED':
        return <Badge className="bg-amber-500/10 text-amber-500 border-amber-500/20 font-mono text-xs">UPDATED</Badge>;
      case 'INVOICE_PRINTED':
        return <Badge className="bg-purple-500/10 text-purple-500 border-purple-500/20 font-mono text-xs">PRINTED</Badge>;
      case 'INVOICE_DOWNLOADED':
        return <Badge className="bg-indigo-500/10 text-indigo-500 border-indigo-500/20 font-mono text-xs">DOWNLOAD</Badge>;
      default:
        return <Badge variant="outline" className="font-mono text-xs">{action}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight">System Activity Logs</h2>
          <p className="text-sm text-muted-foreground">
            Audit transactional logs, cashier sign-ins, document prints, and database updates.
          </p>
        </div>
      </div>

      {/* Logs Table */}
      <Card className="border-border bg-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-secondary/40">
              <TableHead className="w-48 font-semibold">Timestamp</TableHead>
              <TableHead className="w-32 font-semibold">Action</TableHead>
              <TableHead className="w-48 font-semibold">User Email</TableHead>
              <TableHead className="w-36 font-semibold">IP Address</TableHead>
              <TableHead className="font-semibold">Event Details</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              [1, 2, 3, 4, 5].map((i) => (
                <TableRow key={i}>
                  <TableCell><div className="h-4 w-32 bg-muted animate-pulse rounded" /></TableCell>
                  <TableCell><div className="h-6 w-16 bg-muted animate-pulse rounded" /></TableCell>
                  <TableCell><div className="h-4 w-40 bg-muted animate-pulse rounded" /></TableCell>
                  <TableCell><div className="h-4 w-24 bg-muted animate-pulse rounded" /></TableCell>
                  <TableCell><div className="h-4 w-60 bg-muted animate-pulse rounded" /></TableCell>
                </TableRow>
              ))
            ) : isError || !data?.logs ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center p-6 text-rose-500 font-medium">
                  Failed to fetch audit trails.
                </TableCell>
              </TableRow>
            ) : data.logs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center p-8 text-muted-foreground italic">
                  No activity log history recorded.
                </TableCell>
              </TableRow>
            ) : (
              data.logs.map((log) => (
                <TableRow key={log.id}>
                  <TableCell className="text-xs text-muted-foreground font-mono">
                    {new Date(log.createdAt).toLocaleString()}
                  </TableCell>
                  <TableCell>{getActionBadge(log.action)}</TableCell>
                  <TableCell className="font-medium text-foreground">
                    {log.user?.email || `User ID: ${log.userId.slice(0, 8)}...`}
                  </TableCell>
                  <TableCell className="font-mono text-xs text-muted-foreground">
                    {log.ipAddress || 'Unknown'}
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground font-mono truncate max-w-sm" title={JSON.stringify(log.details)}>
                    {log.details ? JSON.stringify(log.details) : '—'}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        {/* Pagination controls */}
        {data && data.pagination && data.pagination.totalPages > 1 && (
          <div className="p-4 border-t border-border flex justify-between items-center bg-secondary/20">
            <span className="text-xs text-muted-foreground">
              Page {data.pagination.page} of {data.pagination.totalPages} ({data.pagination.total} records)
            </span>
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.max(p - 1, 1))}
                disabled={page === 1}
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.min(p + 1, data.pagination.totalPages))}
                disabled={page === data.pagination.totalPages}
              >
                Next
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
