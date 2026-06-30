'use client';

import React, { useState } from 'react';
import { useApprovalsList, useActionApproval } from '../../../features/approvals/hooks/useApprovals';
import { usePermission } from '../../../features/auth/hooks/usePermission';
import { ApprovalStatus, ApprovalRequest, AxiosErrorLike } from '../../../types/api';
import { Button } from '../../../components/ui/button';
import { Card, CardContent } from '../../../components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../../components/ui/table';
import { Badge } from '../../../components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../../../components/ui/dialog';
import { Label } from '../../../components/ui/label';
import { Input } from '../../../components/ui/input';
import { Check, X, ThumbsUp, ThumbsDown } from 'lucide-react';

export default function ApprovalsPage() {
  const { isAdmin } = usePermission();
  const [statusFilter, setStatusFilter] = useState<string>('PENDING');
  const [selectedTicket, setSelectedTicket] = useState<ApprovalRequest | null>(null);
  const [isActionModalOpen, setIsActionModalOpen] = useState(false);
  const [actionType, setActionType] = useState<'APPROVED' | 'REJECTED'>('APPROVED');
  const [adminNotes, setAdminNotes] = useState('');

  // Queries
  const { data: tickets, isLoading, isError } = useApprovalsList({
    status: statusFilter === 'ALL' ? undefined : (statusFilter as ApprovalStatus),
  });

  const actionMutation = useActionApproval();

  const handleActionClick = (ticket: ApprovalRequest, type: 'APPROVED' | 'REJECTED') => {
    setSelectedTicket(ticket);
    setActionType(type);
    setAdminNotes('');
    setIsActionModalOpen(true);
  };

  const handleActionSubmit = async () => {
    if (!selectedTicket) return;
    try {
      await actionMutation.mutateAsync({
        id: selectedTicket.id,
        payload: {
          status: actionType,
          adminNotes: adminNotes || null,
        },
      });
      setIsActionModalOpen(false);
      alert(`Ticket has been ${actionType.toLowerCase()} successfully`);
    } catch (err) {
      alert((err as AxiosErrorLike).response?.data?.error?.message || 'Failed to submit ticket update');
    }
  };

  const getStatusBadge = (status: ApprovalStatus) => {
    switch (status) {
      case 'PENDING':
        return <Badge variant="outline" className="bg-amber-500/10 text-amber-500 border-amber-500/20 font-mono">PENDING</Badge>;
      case 'APPROVED':
        return <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 hover:bg-emerald-500/10 font-mono">APPROVED</Badge>;
      case 'REJECTED':
        return <Badge variant="destructive" className="bg-rose-500/10 text-rose-500 border-rose-500/20 hover:bg-rose-500/10 font-mono">REJECTED</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight">Authorization Approvals</h2>
          <p className="text-sm text-muted-foreground">
            Audit and approve cashier overrides, edits, or document deletes.
          </p>
        </div>
      </div>

      {/* Filters */}
      <Card className="border-border bg-card">
        <CardContent className="pt-6 flex justify-between items-center gap-4">
          <span className="text-sm font-medium text-muted-foreground">Ticket Status Filter:</span>
          <div className="w-48">
            <Select value={statusFilter} onValueChange={(val) => setStatusFilter(val || 'PENDING')}>
              <SelectTrigger className="bg-background">
                <SelectValue placeholder="Select Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Requests</SelectItem>
                <SelectItem value="PENDING">Pending Action</SelectItem>
                <SelectItem value="APPROVED">Approved</SelectItem>
                <SelectItem value="REJECTED">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Approvals Table */}
      <Card className="border-border bg-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-secondary/40">
              <TableHead className="w-32 font-semibold">Invoice No</TableHead>
              <TableHead className="w-40 font-semibold">Cashier</TableHead>
              <TableHead className="w-24 font-semibold">Type</TableHead>
              <TableHead className="font-semibold">Reasoning Details</TableHead>
              <TableHead className="w-28 font-semibold">Date</TableHead>
              <TableHead className="w-28 font-semibold">Status</TableHead>
              {isAdmin && statusFilter === 'PENDING' && (
                <TableHead className="w-32 font-semibold text-center">Actions</TableHead>
              )}
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              [1, 2, 3].map((i) => (
                <TableRow key={i}>
                  <TableCell><div className="h-4 w-16 bg-muted animate-pulse rounded" /></TableCell>
                  <TableCell><div className="h-4 w-28 bg-muted animate-pulse rounded" /></TableCell>
                  <TableCell><div className="h-4 w-12 bg-muted animate-pulse rounded" /></TableCell>
                  <TableCell><div className="h-4 w-60 bg-muted animate-pulse rounded" /></TableCell>
                  <TableCell><div className="h-4 w-20 bg-muted animate-pulse rounded" /></TableCell>
                  <TableCell><div className="h-6 w-16 bg-muted animate-pulse rounded" /></TableCell>
                  {isAdmin && statusFilter === 'PENDING' && (
                    <TableCell><div className="h-8 w-24 bg-muted animate-pulse rounded mx-auto" /></TableCell>
                  )}
                </TableRow>
              ))
            ) : isError || !tickets ? (
              <TableRow>
                <TableCell colSpan={isAdmin && statusFilter === 'PENDING' ? 7 : 6} className="text-center p-6 text-rose-500 font-medium">
                  Failed to fetch approvals list.
                </TableCell>
              </TableRow>
            ) : tickets.length === 0 ? (
              <TableRow>
                <TableCell colSpan={isAdmin && statusFilter === 'PENDING' ? 7 : 6} className="text-center p-8 text-muted-foreground italic">
                  No authorization requests recorded for this status filter.
                </TableCell>
              </TableRow>
            ) : (
              tickets.map((ticket) => (
                <TableRow key={ticket.id}>
                  <TableCell className="font-mono font-bold">
                    #{ticket.invoice?.invoiceNumber || 'N/A'}
                  </TableCell>
                  <TableCell className="font-medium text-foreground">
                    {ticket.requester?.firstName} {ticket.requester?.lastName}
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="font-mono text-xs uppercase bg-zinc-800 text-zinc-300">
                      {ticket.type}
                    </Badge>
                  </TableCell>
                  <TableCell className="max-w-xs truncate text-muted-foreground" title={ticket.reason}>
                    {ticket.reason}
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground font-mono">
                    {new Date(ticket.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell>{getStatusBadge(ticket.status)}</TableCell>
                  
                  {isAdmin && statusFilter === 'PENDING' && ticket.status === 'PENDING' && (
                    <TableCell className="text-center">
                      <div className="flex justify-center space-x-1">
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => handleActionClick(ticket, 'APPROVED')}
                          className="h-8 w-8 text-emerald-500 hover:text-emerald-600 hover:bg-emerald-500/10"
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => handleActionClick(ticket, 'REJECTED')}
                          className="h-8 w-8 text-rose-500 hover:text-rose-600 hover:bg-rose-500/10"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  )}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>

      {/* Actions Admin Notes dialog */}
      <Dialog open={isActionModalOpen} onOpenChange={setIsActionModalOpen}>
        <DialogContent className="bg-card border-border">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              {actionType === 'APPROVED' ? (
                <ThumbsUp className="h-5 w-5 text-emerald-500" />
              ) : (
                <ThumbsDown className="h-5 w-5 text-rose-500" />
              )}
              <span>{actionType === 'APPROVED' ? 'Approve Ticket request' : 'Reject Ticket request'}</span>
            </DialogTitle>
            <DialogDescription>
              Assign notes to verify the authorization audit trail.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-3">
            <div className="space-y-1.5">
              <Label htmlFor="admin-notes" className="text-xs font-semibold">
                Administrator Notes / Remarks
              </Label>
              <Input
                id="admin-notes"
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                placeholder="e.g. Approved single print override / Rejected due to missing reason details..."
                className="bg-background"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsActionModalOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleActionSubmit}
              className={actionType === 'APPROVED' ? 'bg-emerald-600 hover:bg-emerald-700 text-white' : 'bg-rose-600 hover:bg-rose-700 text-white'}
            >
              Confirm Update
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
