'use client';

import React, { useState } from 'react';
import { useApprovalsList, useActionApproval } from '../../../features/approvals/hooks/useApprovals';
import { usePermission } from '../../../features/auth/hooks/usePermission';
import { ApprovalStatus, ApprovalRequest } from '../../../types/api';
import { getErrorDialog } from '../../../lib/api-error';
import { Button } from '../../../components/ui/button';
import { Card, CardContent } from '../../../components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../../components/ui/table';
import { Badge } from '../../../components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../../../components/ui/dialog';
import { Label } from '../../../components/ui/label';
import { Input } from '../../../components/ui/input';
import {
  Check,
  X,
  ThumbsUp,
  ThumbsDown,
  CheckCircle2,
  Clock,
  ShieldCheck,
  Loader2,
} from 'lucide-react';
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
      const { title, message, variant } = getErrorDialog(err, 'Update Failed', 'Failed to submit ticket update');
      modal.alert(title, message, variant);
    }
  };

  const getStatusBadge = (status: ApprovalStatus) => {
    switch (status) {
      case 'PENDING':
        return (
          <Badge className="bg-amber-50 hover:bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400 border-amber-200 dark:border-amber-500/25 font-mono text-[10px] font-bold tracking-wider px-2.5 py-0.5 rounded-full flex items-center space-x-1">
            <Clock className="h-2.5 w-2.5" />
            <span>PENDING</span>
          </Badge>
        );
      case 'APPROVED':
        return (
          <Badge className="bg-emerald-50 hover:bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/25 font-mono text-[10px] font-bold tracking-wider px-2.5 py-0.5 rounded-full flex items-center space-x-1">
            <Check className="h-2.5 w-2.5" />
            <span>APPROVED</span>
          </Badge>
        );
      case 'REJECTED':
        return (
          <Badge variant="destructive" className="bg-rose-50 hover:bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400 border-rose-200 dark:border-rose-500/25 font-mono text-[10px] font-bold tracking-wider px-2.5 py-0.5 rounded-full flex items-center space-x-1">
            <X className="h-2.5 w-2.5" />
            <span>REJECTED</span>
          </Badge>
        );
    }
  };

  const filterTabs = [
    { label: 'Pending Action', value: 'PENDING' },
    { label: 'Approved', value: 'APPROVED' },
    { label: 'Rejected', value: 'REJECTED' },
    { label: 'All Requests', value: 'ALL' },
  ];

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto pb-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-2 border-b border-border/60">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground font-heading flex items-center space-x-2">
            <ShieldCheck className="h-6 w-6 text-emerald-500" />
            <span>Reprint & Override Approvals</span>
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Audit and approve cashier reprint requests, adjustments, or deletions.
          </p>
        </div>
      </div>

      {/* Segmented Filters */}
      <Card className="border-border bg-card shadow-premium rounded-2xl overflow-hidden">
        <CardContent className="p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
            Filter Requests
          </span>
          <div className="flex items-center space-x-1.5 overflow-x-auto w-full sm:w-auto">
            {filterTabs.map((tab) => {
              const isActive = statusFilter === tab.value;
              return (
                <button
                  key={tab.value}
                  type="button"
                  onClick={() => setStatusFilter(tab.value)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all whitespace-nowrap cursor-pointer ${
                    isActive
                      ? 'bg-emerald-500 text-white font-semibold shadow-sm'
                      : 'bg-secondary/60 text-muted-foreground hover:text-foreground hover:bg-secondary'
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Approvals Table */}
      <Card className="border-border bg-card shadow-premium rounded-2xl overflow-hidden">
        <Table>
          <TableHeader className="bg-slate-50/75 dark:bg-slate-900/50 border-b border-border">
            <TableRow className="hover:bg-transparent">
              <TableHead className="w-36 font-bold text-xs text-foreground py-4 pl-6">Invoice No</TableHead>
              <TableHead className="w-44 font-bold text-xs text-foreground py-4">Cashier</TableHead>
              <TableHead className="w-24 font-bold text-xs text-foreground py-4">Type</TableHead>
              <TableHead className="font-bold text-xs text-foreground py-4">Reason / Details</TableHead>
              <TableHead className="w-32 font-bold text-xs text-foreground py-4">Date</TableHead>
              <TableHead className="w-32 font-bold text-xs text-foreground py-4 text-center">Status</TableHead>
              {isAdmin && statusFilter === 'PENDING' && (
                <TableHead className="w-40 font-bold text-xs text-center text-foreground py-4 pr-6">Action</TableHead>
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
                  <TableCell className="py-4 text-center"><Skeleton className="h-6 w-16 rounded-full mx-auto" /></TableCell>
                  {isAdmin && statusFilter === 'PENDING' && (
                    <TableCell className="py-4 pr-6"><Skeleton className="h-8 w-24 rounded-xl mx-auto" /></TableCell>
                  )}
                </TableRow>
              ))
            ) : isError || !tickets ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center p-8 text-rose-500 font-medium">
                  Failed to load authorization queue. Ensure backend is active.
                </TableCell>
              </TableRow>
            ) : tickets.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center p-12 text-muted-foreground">
                  <div className="flex flex-col items-center justify-center space-y-2">
                    <CheckCircle2 className="h-8 w-8 text-emerald-500/50" />
                    <p className="font-semibold text-sm text-foreground">No tickets found</p>
                    <p className="text-xs text-muted-foreground">All reprint and override queues are currently clear.</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              tickets.map((item) => (
                <TableRow key={item.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/35 border-b border-border/60 transition-colors">
                  <TableCell className="font-mono font-bold text-xs text-emerald-600 dark:text-emerald-400 py-4 pl-6">
                    {item.invoice?.invoiceNumber || '-'}
                  </TableCell>
                  <TableCell className="py-4 text-xs font-medium text-foreground">
                    {item.requester ? `${item.requester.firstName} ${item.requester.lastName}` : 'System User'}
                  </TableCell>
                  <TableCell className="py-4">
                    <Badge variant="outline" className="font-mono text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-lg border-border">
                      {item.type}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs py-4 text-muted-foreground max-w-sm truncate">
                    <span className="text-foreground font-medium">{item.reason}</span>
                    {item.adminNotes && (
                      <span className="block text-[11px] text-muted-foreground mt-0.5 italic">
                        Note: {item.adminNotes}
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground font-mono py-4">
                    {new Date(item.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="py-4 text-center">
                    {getStatusBadge(item.status)}
                  </TableCell>
                  {isAdmin && statusFilter === 'PENDING' && (
                    <TableCell className="text-center py-4 pr-6">
                      <div className="flex items-center justify-center space-x-1.5">
                        <Button
                          size="sm"
                          onClick={() => handleActionClick(item, 'APPROVED')}
                          className="h-8 px-2.5 rounded-xl text-xs bg-emerald-500 hover:bg-emerald-600 text-white font-semibold flex items-center space-x-1 shadow-sm"
                        >
                          <Check className="h-3.5 w-3.5" />
                          <span>Approve</span>
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleActionClick(item, 'REJECTED')}
                          className="h-8 px-2.5 rounded-xl text-xs flex items-center space-x-1 shadow-sm"
                        >
                          <X className="h-3.5 w-3.5" />
                          <span>Reject</span>
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

      {/* Action Dialog */}
      <Dialog open={isActionModalOpen} onOpenChange={setIsActionModalOpen}>
        <DialogContent className="bg-card border-border rounded-2xl p-6 shadow-2xl max-w-md">
          <DialogHeader className="border-b border-border pb-4">
            <DialogTitle className="font-heading font-bold text-base flex items-center space-x-2">
              {actionType === 'APPROVED' ? (
                <>
                  <ThumbsUp className="h-5 w-5 text-emerald-500" />
                  <span>Approve Ticket</span>
                </>
              ) : (
                <>
                  <ThumbsDown className="h-5 w-5 text-rose-500" />
                  <span>Reject Ticket</span>
                </>
              )}
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground mt-1">
              {actionType === 'APPROVED'
                ? `Grant permission for ${selectedTicket?.type.toLowerCase()} operation on invoice ${selectedTicket?.invoice?.invoiceNumber}.`
                : `Decline cashier request for invoice ${selectedTicket?.invoice?.invoiceNumber}.`}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4 text-xs">
            <div className="p-3 bg-secondary/50 rounded-xl space-y-1">
              <span className="text-[10px] text-muted-foreground uppercase font-mono font-bold">Requester Reason</span>
              <p className="text-foreground font-medium">{selectedTicket?.reason}</p>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="admin-notes" className="text-xs font-semibold text-muted-foreground">
                Administrative Notes (Optional)
              </Label>
              <Input
                id="admin-notes"
                type="text"
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                placeholder="Reasoning for audit log..."
                className="bg-background h-10 rounded-xl text-xs"
              />
            </div>
          </div>

          <DialogFooter className="flex justify-end space-x-2 pt-2 border-t border-border">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsActionModalOpen(false)}
              className="rounded-xl text-xs h-9 px-4"
            >
              Cancel
            </Button>
            <Button
              size="sm"
              disabled={actionMutation.isPending}
              onClick={handleActionSubmit}
              className={`rounded-xl text-xs h-9 px-4 text-white font-semibold flex items-center space-x-1.5 ${
                actionType === 'APPROVED'
                  ? 'bg-emerald-500 hover:bg-emerald-600 shadow-sm'
                  : 'bg-rose-500 hover:bg-rose-600 shadow-sm'
              }`}
            >
              {actionMutation.isPending ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <span>Confirm {actionType === 'APPROVED' ? 'Approval' : 'Rejection'}</span>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
