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
import { Check, X, ThumbsUp, ThumbsDown, CheckCircle2, ShieldAlert } from 'lucide-react';
import { Skeleton } from '../../../components/ui/skeleton';
import { useModal } from '../../../components/ui/modal-provider';

export default function ApprovalsPage() {
  const { isAdmin } = usePermission();
  const modal = useModal();
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
      modal.alert('Success', `Ticket has been ${actionType.toLowerCase()} successfully`, 'success');
    } catch (err) {
      modal.alert('Update Failed', (err as AxiosErrorLike).response?.data?.error?.message || 'Failed to submit ticket update', 'error');
    }
  };

  const getStatusBadge = (status: ApprovalStatus) => {
    switch (status) {
      case 'PENDING':
        return <Badge className="bg-amber-50 hover:bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400 border-amber-100 dark:border-amber-500/25 font-mono text-[10px] font-bold tracking-wider px-2 py-0.5 rounded-full">PENDING</Badge>;
      case 'APPROVED':
        return <Badge className="bg-emerald-50 hover:bg-emerald-50 text-[#059669] dark:bg-emerald-500/10 dark:text-[#10B981] border-emerald-100 dark:border-emerald-500/25 font-mono text-[10px] font-bold tracking-wider px-2 py-0.5 rounded-full">APPROVED</Badge>;
      case 'REJECTED':
        return <Badge variant="destructive" className="bg-rose-50 hover:bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400 border-rose-100 dark:border-rose-500/25 font-mono text-[10px] font-bold tracking-wider px-2 py-0.5 rounded-full">REJECTED</Badge>;
    }
  };

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-[#0F172A] dark:text-[#F8FAFC] font-heading flex items-center space-x-2">
            <CheckCircle2 className="h-5 w-5 text-primary" />
            <span>Authorization Approvals</span>
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Audit and approve cashier overrides, edits, or document deletes.
          </p>
        </div>
      </div>

      {/* Filters */}
      <Card className="border-border bg-card shadow-premium rounded-2xl overflow-hidden">
        <CardContent className="p-4 flex flex-row justify-between items-center gap-4">
          <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Ticket Status Filter</span>
          <div className="w-56">
            <Select value={statusFilter} onValueChange={(val) => setStatusFilter(val || 'PENDING')}>
              <SelectTrigger className="bg-background h-10 rounded-xl">
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
      <Card className="border-border bg-card shadow-premium rounded-2xl overflow-hidden">
        <Table>
          <TableHeader className="bg-secondary/40 sticky top-0 z-10 border-b border-border">
            <TableRow className="hover:bg-transparent">
              <TableHead className="w-36 font-semibold text-[#0F172A] dark:text-[#F8FAFC] py-4 pl-6">Invoice No</TableHead>
              <TableHead className="w-48 font-semibold text-[#0F172A] dark:text-[#F8FAFC] py-4">Cashier</TableHead>
              <TableHead className="w-28 font-semibold text-[#0F172A] dark:text-[#F8FAFC] py-4">Type</TableHead>
              <TableHead className="font-semibold text-[#0F172A] dark:text-[#F8FAFC] py-4">Reasoning Details</TableHead>
              <TableHead className="w-32 font-semibold text-[#0F172A] dark:text-[#F8FAFC] py-4">Date</TableHead>
              <TableHead className="w-32 font-semibold text-[#0F172A] dark:text-[#F8FAFC] py-4">Status</TableHead>
              {isAdmin && statusFilter === 'PENDING' && (
                <TableHead className="w-32 font-semibold text-center text-[#0F172A] dark:text-[#F8FAFC] py-4 pr-6">Actions</TableHead>
              )}
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              [1, 2, 3].map((i) => (
                <TableRow key={i} className="border-b border-border/60">
                  <TableCell className="py-4 pl-6"><Skeleton className="h-4 w-16" /></TableCell>
                  <TableCell className="py-4"><Skeleton className="h-4 w-28" /></TableCell>
                  <TableCell className="py-4"><Skeleton className="h-6 w-12 rounded-full" /></TableCell>
                  <TableCell className="py-4"><Skeleton className="h-4 w-60" /></TableCell>
                  <TableCell className="py-4"><Skeleton className="h-4 w-20" /></TableCell>
                  <TableCell className="py-4"><Skeleton className="h-6 w-16 rounded-full" /></TableCell>
                  {isAdmin && statusFilter === 'PENDING' && (
                    <TableCell className="py-4 pr-6"><Skeleton className="h-8 w-24 rounded-xl mx-auto" /></TableCell>
                  )}
                </TableRow>
              ))
            ) : isError || !tickets ? (
              <TableRow>
                <TableCell colSpan={isAdmin && statusFilter === 'PENDING' ? 7 : 6} className="text-center p-8 text-rose-500 font-medium">
                  Failed to fetch approvals list.
                </TableCell>
              </TableRow>
            ) : tickets.length === 0 ? (
              <TableRow>
                <TableCell colSpan={isAdmin && statusFilter === 'PENDING' ? 7 : 6} className="text-center p-12 text-muted-foreground italic">
                  No authorization requests recorded for this status filter.
                </TableCell>
              </TableRow>
            ) : (
              tickets.map((ticket) => (
                <TableRow key={ticket.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/35 border-b border-border/60">
                  <TableCell className="font-mono font-bold text-xs py-4 pl-6">
                    #{ticket.invoice?.invoiceNumber || 'N/A'}
                  </TableCell>
                  <TableCell className="font-medium text-foreground py-4">
                    {ticket.requester?.firstName} {ticket.requester?.lastName}
                  </TableCell>
                  <TableCell className="py-4">
                    <Badge variant="secondary" className="font-mono text-[10px] font-bold tracking-wider px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                      {ticket.type}
                    </Badge>
                  </TableCell>
                  <TableCell className="max-w-xs truncate text-muted-foreground text-xs py-4" title={ticket.reason}>
                    {ticket.reason}
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground font-mono py-4">
                    {new Date(ticket.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="py-4">{getStatusBadge(ticket.status)}</TableCell>
                  
                  {isAdmin && statusFilter === 'PENDING' && ticket.status === 'PENDING' && (
                    <TableCell className="text-center py-4 pr-6">
                      <div className="flex justify-center space-x-1">
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => handleActionClick(ticket, 'APPROVED')}
                          className="h-8 w-8 rounded-full text-emerald-500 hover:text-emerald-600 hover:bg-emerald-500/10 transition-colors"
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => handleActionClick(ticket, 'REJECTED')}
                          className="h-8 w-8 rounded-full text-rose-500 hover:text-rose-600 hover:bg-rose-500/10 transition-colors"
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
        <DialogContent className="bg-card border-border rounded-2xl p-6 shadow-2xl">
          <DialogHeader className="border-b border-border pb-4">
            <DialogTitle className="flex items-center space-x-2.5 font-bold font-heading">
              {actionType === 'APPROVED' ? (
                <ThumbsUp className="h-5 w-5 text-emerald-500 animate-bounce" />
              ) : (
                <ThumbsDown className="h-5 w-5 text-rose-500 animate-bounce" />
              )}
              <span>{actionType === 'APPROVED' ? 'Approve Ticket request' : 'Reject Ticket request'}</span>
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground mt-1">
              Assign notes to verify the authorization audit trail.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-1.5">
              <Label htmlFor="admin-notes" className="text-xs font-semibold text-muted-foreground">
                Administrator Notes / Remarks
              </Label>
              <Input
                id="admin-notes"
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                placeholder="e.g. Approved single print override / Rejected due to missing reason details..."
                className="bg-background h-10 rounded-xl"
              />
            </div>
          </div>

          <DialogFooter className="border-t border-border pt-4 gap-2">
            <Button type="button" variant="outline" onClick={() => setIsActionModalOpen(false)} className="rounded-xl h-10 text-xs px-4">
              Cancel
            </Button>
            <Button
              onClick={handleActionSubmit}
              className={actionType === 'APPROVED' ? 'bg-[#10B981] hover:bg-[#059669] text-white rounded-xl h-10 text-xs px-5 shadow-premium font-semibold' : 'bg-rose-600 hover:bg-rose-700 text-white rounded-xl h-10 text-xs px-5 shadow-premium font-semibold'}
            >
              Confirm Update
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
