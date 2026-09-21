'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  useInvoicesList,
  useInvoiceDetails,
  useDeleteInvoice,
  useInvoiceRevenueSummary,
  useShareInvoice,
  useRevokeShareInvoice,
} from '../../../features/invoices/hooks/useInvoices';
import { useCreateApproval } from '../../../features/approvals/hooks/useApprovals';
import { useAuth } from '../../../features/auth/context/AuthContext';
import { useUsersList } from '../../../features/users/hooks/useUsers';
import { usePermission } from '../../../features/auth/hooks/usePermission';
import { Invoice, InvoiceStatus, AxiosErrorLike } from '../../../types/api';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../../components/ui/table';
import { Card } from '../../../components/ui/card';
import { Badge } from '../../../components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../../../components/ui/dialog';
import { Skeleton } from '../../../components/ui/skeleton';
import { apiClient } from '../../../services/api/axios';
import { useModal } from '../../../components/ui/modal-provider';
import {
  Search,
  Plus,
  FileDown,
  Printer,
  Trash2,
  Lock,
  Eye,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  AlertCircle,
  FileSpreadsheet,
  Calendar,
  CalendarDays,
  TrendingUp,
  Clock,
  User,
  X,
  Loader2,
  Share2,
} from 'lucide-react';

export default function InvoicesPage() {
  const { user } = useAuth();
  const { isAdmin } = usePermission();
  const modal = useModal();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [cashierFilter, setCashierFilter] = useState<string>('ALL');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');

  const { data: usersData } = useUsersList();
  const staffList = usersData || [];
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<string | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [exportingFormat, setExportingFormat] = useState<string | null>(null);

  // Sharing state & mutations
  const shareMutation = useShareInvoice();
  const revokeShareMutation = useRevokeShareInvoice();
  const createApprovalMutation = useCreateApproval();

  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [invoiceToShare, setInvoiceToShare] = useState<Invoice | null>(null);
  const [targetUserId, setTargetUserId] = useState<string>('');
  const [shareNotes, setShareNotes] = useState<string>('');
  const [isSharing, setIsSharing] = useState(false);

  const getEligibleRecipients = (invoice: Invoice | null) => {
    if (!invoice) return [];
    return staffList.filter(
      (u) => !u.isDeleted && !u.isSuspended && u.id !== invoice.creatorId && u.id !== user?.id
    );
  };

  const openShareModal = (invoice: Invoice, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setInvoiceToShare(invoice);
    setShareNotes('');
    const eligible = getEligibleRecipients(invoice);
    setTargetUserId(eligible.length > 0 ? eligible[0].id : '');
    setIsShareModalOpen(true);
  };

  const handleShareSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!invoiceToShare || !targetUserId) {
      modal.alert('Select Cashier', 'Please select an apprentice cashier to share with.', 'warning');
      return;
    }

    setIsSharing(true);
    try {
      await shareMutation.mutateAsync({
        invoiceId: invoiceToShare.id,
        targetUserId,
        notes: shareNotes.trim() || undefined,
      });
      setIsShareModalOpen(false);
      modal.alert(
        'Invoice Shared',
        `Invoice ${invoiceToShare.invoiceNumber} has been successfully shared. The cashier can now view and print it from their dashboard.`,
        'success'
      );
    } catch (err) {
      const errorMsg = (err as AxiosErrorLike).response?.data?.error?.message || 'Failed to share invoice';
      modal.alert('Sharing Failed', errorMsg, 'error');
    } finally {
      setIsSharing(false);
    }
  };

  const handleRevokeShare = async (invoiceId: string, targetUserId: string, targetName: string) => {
    const isConfirmed = await modal.confirm(
      'Revoke Access',
      `Are you sure you want to revoke access for ${targetName}? They will no longer be able to view or print this invoice.`
    );
    if (isConfirmed) {
      try {
        await revokeShareMutation.mutateAsync({ invoiceId, targetUserId });
        modal.alert('Access Revoked', `Sharing with ${targetName} has been revoked.`, 'success');
      } catch (err) {
        const errorMsg = (err as AxiosErrorLike).response?.data?.error?.message || 'Failed to revoke access';
        modal.alert('Revocation Failed', errorMsg, 'error');
      }
    }
  };

  // Queries
  const { data: summary, isLoading: isSummaryLoading } = useInvoiceRevenueSummary(
    isAdmin && cashierFilter !== 'ALL' ? cashierFilter : undefined
  );

  const { data, isLoading, isError } = useInvoicesList({
    page,
    limit: 10,
    search: search || undefined,
    status: statusFilter === 'ALL' ? undefined : (statusFilter as InvoiceStatus),
    issuedBy: isAdmin && cashierFilter !== 'ALL' ? cashierFilter : undefined,
    startDate: isAdmin && startDate ? startDate : undefined,
    endDate: isAdmin && endDate ? endDate : undefined,
  });

  const { data: invoiceDetails, isLoading: detailsLoading } = useInvoiceDetails(selectedInvoiceId);
  const deleteInvoiceMutation = useDeleteInvoice();

  const handleRowClick = (id: string) => {
    setSelectedInvoiceId(id);
    setIsDetailOpen(true);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setPage(1);
  };

  const handleStatusFilterChange = (val: string) => {
    setStatusFilter(val);
    setPage(1);
  };

  const formatCurrency = (val: number | string | undefined) => {
    const num = Number(val || 0);
    return `₦${num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const handleDelete = async (id: string) => {
    const isConfirmed = await modal.confirm(
      'Delete Invoice Ledger',
      'Are you sure you want to delete this invoice? This action cannot be undone.'
    );
    if (isConfirmed) {
      try {
        await deleteInvoiceMutation.mutateAsync(id);
        setIsDetailOpen(false);
        modal.alert('Success', 'Invoice soft-deleted successfully', 'success');
      } catch (err) {
        const errorMsg = (err as AxiosErrorLike).response?.data?.error?.message || 'Failed to delete invoice';
        modal.alert('Delete Failed', errorMsg, 'error');
      }
    }
  };

  const handleExport = async (invoiceId: string, format: 'pdf' | 'excel', invoiceNumber: string) => {
    // If apprentice trying to print a PRINTED invoice, check if they need approval
    if (!isAdmin && format === 'pdf' && invoiceDetails?.status === 'PRINTED') {
      const shouldRequest = await modal.confirm(
        'Reprint Approval Required',
        'This invoice has already been printed. Administrative authorization is required to reprint official documents. Would you like to request approval now?',
        'Request Approval',
        'Cancel'
      );
      if (shouldRequest) {
        const reason = await modal.prompt(
          'Reprint Reason',
          'Please enter the reason for this reprint request (e.g. Printer paper jam, customer copy replacement):',
          'Customer requested reprint'
        );
        if (reason) {
          try {
            await createApprovalMutation.mutateAsync({
              invoiceId,
              type: 'PRINT',
              reason,
            });
            modal.alert(
              'Request Submitted',
              'Your reprint authorization request has been submitted to the administrators. You will be able to print once approved.',
              'success'
            );
          } catch (approvalErr) {
            const msg = (approvalErr as AxiosErrorLike).response?.data?.error?.message || 'Failed to submit approval request';
            modal.alert('Submission Error', msg, 'error');
          }
        }
      }
      return;
    }

    setExportingFormat(format);
    try {
      const extension = format === 'pdf' ? 'pdf' : 'csv';
      const contentType = format === 'pdf' ? 'application/pdf' : 'text/csv';
      
      const response = await apiClient.get(`/api/printing/${invoiceId}/${format}`, {
        responseType: 'blob',
      });
      
      const blob = new Blob([response.data], { type: contentType });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `invoice_${invoiceNumber}.${extension}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error(`Export to ${format} failed:`, error);
      const errMsg = (error as AxiosErrorLike).response?.data?.error?.message || `Failed to export invoice to ${format}`;
      
      if (!isAdmin && errMsg.toLowerCase().includes('approval')) {
        const shouldRequest = await modal.confirm(
          'Authorization Required',
          `${errMsg}. Would you like to send a reprint approval request to the administrators now?`,
          'Request Approval',
          'Dismiss'
        );
        if (shouldRequest) {
          const reason = await modal.prompt(
            'Reprint Reason',
            'Please enter the reason for this reprint request:',
            'Reprint requested'
          );
          if (reason) {
            try {
              await createApprovalMutation.mutateAsync({
                invoiceId,
                type: 'PRINT',
                reason,
              });
              modal.alert(
                'Request Submitted',
                'Your authorization request has been submitted to the administrators.',
                'success'
              );
            } catch (aErr) {
              const m = (aErr as AxiosErrorLike).response?.data?.error?.message || 'Failed to submit approval request';
              modal.alert('Submission Error', m, 'error');
            }
          }
        }
      } else {
        modal.alert('Export Failed', errMsg, 'error');
      }
    } finally {
      setExportingFormat(null);
    }
  };

  const getStatusBadge = (status: InvoiceStatus) => {
    switch (status) {
      case 'DRAFT':
        return (
          <Badge className="bg-amber-50 hover:bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400 font-mono text-[10px] font-semibold tracking-wider px-2.5 py-0.5 rounded-full border border-amber-200 dark:border-amber-500/25 flex items-center space-x-1">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
            <span>DRAFT</span>
          </Badge>
        );
      case 'FINALIZED':
        return (
          <Badge className="bg-sky-50 hover:bg-sky-50 text-sky-700 dark:bg-sky-500/10 dark:text-sky-400 font-mono text-[10px] font-semibold tracking-wider px-2.5 py-0.5 rounded-full border border-sky-200 dark:border-sky-500/25 flex items-center space-x-1">
            <Lock className="h-2.5 w-2.5" />
            <span>FINALIZED</span>
          </Badge>
        );
      case 'PRINTED':
        return (
          <Badge className="bg-emerald-50 hover:bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 font-mono text-[10px] font-semibold tracking-wider px-2.5 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-500/25 flex items-center space-x-1">
            <Printer className="h-2.5 w-2.5" />
            <span>PRINTED</span>
          </Badge>
        );
      case 'ARCHIVED':
        return (
          <Badge className="bg-slate-100 hover:bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400 font-mono text-[10px] font-semibold tracking-wider px-2.5 py-0.5 rounded-full border border-slate-200 dark:border-slate-700">
            ARCHIVED
          </Badge>
        );
      default:
        return (
          <Badge className="bg-slate-100 hover:bg-slate-100 text-slate-500 font-mono text-[10px] px-2.5 py-0.5 rounded-full border border-slate-200">
            {status}
          </Badge>
        );
    }
  };

  const filterTabs = [
    { label: 'All Invoices', value: 'ALL' },
    { label: 'Finalized', value: 'FINALIZED' },
    { label: 'Printed', value: 'PRINTED' },
    { label: 'Drafts', value: 'DRAFT' },
  ];

  return (
    <div className="space-y-6 max-w-[1440px] mx-auto p-3 sm:p-6 lg:p-8 pb-16">
      
      {/* ========================================================= */}
      {/* PAGE HEADER                                               */}
      {/* ========================================================= */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-2 border-b border-border/60">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground font-heading">
            Invoice Ledgers
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Search, review, export, and audit official Lao Steel Ventures billing records.
          </p>
        </div>
        
        <Link href="/invoices/create">
          <Button className="h-10 font-semibold space-x-2 bg-gradient-to-r from-emerald-500 to-[#059669] hover:from-emerald-600 hover:to-[#047857] text-white rounded-xl shadow-lg shadow-emerald-500/20 px-4 text-xs cursor-pointer">
            <Plus className="h-4 w-4" />
            <span>Create Invoice</span>
          </Button>
        </Link>
      </div>

      {/* ========================================================= */}
      {/* REVENUE SUMMARY METRICS (TODAY, THIS WEEK, MONTH, YEAR)   */}
      {/* ========================================================= */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Today */}
        <Card className="border-border bg-card shadow-sm rounded-2xl overflow-hidden relative group hover:border-emerald-500/40 transition-all">
          <div className="h-1 w-full bg-gradient-to-r from-emerald-500 to-teal-400" />
          <div className="p-3.5 sm:p-4 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-muted-foreground truncate">
                Today&apos;s Revenue
              </span>
              <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-500 shrink-0">
                <TrendingUp className="h-3.5 w-3.5" />
              </div>
            </div>
            {isSummaryLoading ? (
              <Skeleton className="h-6 w-24 rounded-md" />
            ) : (
              <div className="text-base sm:text-xl font-bold font-mono tracking-tight text-foreground tabular-nums truncate">
                {formatCurrency(summary?.today)}
              </div>
            )}
            <p className="text-[10px] text-muted-foreground truncate">Finalized today</p>
          </div>
        </Card>

        {/* This Week */}
        <Card className="border-border bg-card shadow-sm rounded-2xl overflow-hidden relative group hover:border-blue-500/40 transition-all">
          <div className="h-1 w-full bg-gradient-to-r from-blue-500 to-cyan-400" />
          <div className="p-3.5 sm:p-4 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-muted-foreground truncate">
                This Week
              </span>
              <div className="p-1.5 rounded-lg bg-blue-500/10 text-blue-500 shrink-0">
                <Clock className="h-3.5 w-3.5" />
              </div>
            </div>
            {isSummaryLoading ? (
              <Skeleton className="h-6 w-24 rounded-md" />
            ) : (
              <div className="text-base sm:text-xl font-bold font-mono tracking-tight text-foreground tabular-nums truncate">
                {formatCurrency(summary?.thisWeek)}
              </div>
            )}
            <p className="text-[10px] text-muted-foreground truncate">Mon &ndash; Today</p>
          </div>
        </Card>

        {/* This Month */}
        <Card className="border-border bg-card shadow-sm rounded-2xl overflow-hidden relative group hover:border-indigo-500/40 transition-all">
          <div className="h-1 w-full bg-gradient-to-r from-indigo-500 to-purple-400" />
          <div className="p-3.5 sm:p-4 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-muted-foreground truncate">
                This Month
              </span>
              <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-500 shrink-0">
                <Calendar className="h-3.5 w-3.5" />
              </div>
            </div>
            {isSummaryLoading ? (
              <Skeleton className="h-6 w-24 rounded-md" />
            ) : (
              <div className="text-base sm:text-xl font-bold font-mono tracking-tight text-foreground tabular-nums truncate">
                {formatCurrency(summary?.thisMonth)}
              </div>
            )}
            <p className="text-[10px] text-muted-foreground truncate">Current month volume</p>
          </div>
        </Card>

        {/* This Year */}
        <Card className="border-border bg-card shadow-sm rounded-2xl overflow-hidden relative group hover:border-amber-500/40 transition-all">
          <div className="h-1 w-full bg-gradient-to-r from-amber-500 to-orange-400" />
          <div className="p-3.5 sm:p-4 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-muted-foreground truncate">
                This Year
              </span>
              <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-500 shrink-0">
                <CalendarDays className="h-3.5 w-3.5" />
              </div>
            </div>
            {isSummaryLoading ? (
              <Skeleton className="h-6 w-24 rounded-md" />
            ) : (
              <div className="text-base sm:text-xl font-bold font-mono tracking-tight text-foreground tabular-nums truncate">
                {formatCurrency(summary?.thisYear)}
              </div>
            )}
            <p className="text-[10px] text-muted-foreground truncate">Year-to-date total</p>
          </div>
        </Card>
      </div>

      {/* ========================================================= */}
      {/* FILTER CONTROLS: STATUS TABS & ADMIN FILTERS              */}
      {/* ========================================================= */}
      <div className="bg-card border border-border rounded-2xl p-3 sm:p-4 shadow-sm space-y-3">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-3">
          
          {/* Status Tabs (Moved to Filter Section) */}
          <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 lg:pb-0 w-full lg:w-auto">
            {filterTabs.map((tab) => {
              const isActive = statusFilter === tab.value;
              return (
                <button
                  key={tab.value}
                  type="button"
                  onClick={() => handleStatusFilterChange(tab.value)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
                    isActive
                      ? 'bg-emerald-500 text-white shadow-sm shadow-emerald-500/20'
                      : 'bg-secondary/70 text-muted-foreground hover:text-foreground hover:bg-secondary'
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Admin Specific Filters: Issued By & Date Range */}
          {isAdmin && (
            <div className="flex flex-wrap items-center gap-3 text-xs w-full lg:w-auto">
              
              {/* Cashier / Staff Filter (Showing real name, not UUID) */}
              <div className="flex items-center space-x-1.5">
                <span className="text-muted-foreground text-[11px] font-medium">Issued By:</span>
                <div className="relative">
                  <select
                    value={cashierFilter}
                    onChange={(e) => {
                      setCashierFilter(e.target.value);
                      setPage(1);
                    }}
                    className="h-9 pl-3 pr-8 bg-secondary border border-border rounded-xl text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500/30 cursor-pointer font-medium appearance-none transition-colors max-w-[200px] truncate"
                  >
                    <option value="ALL">All Staff</option>
                    {staffList.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.firstName} {u.lastName} ({u.role === 'ADMIN' ? 'Admin' : 'Cashier'})
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
                </div>
              </div>

              {/* Date Range Filter (From / To) */}
              <div className="flex items-center space-x-1.5">
                <span className="text-muted-foreground text-[11px] font-medium">Date:</span>
                <div className="flex items-center space-x-1">
                  <Input
                    type="date"
                    value={startDate}
                    onChange={(e) => {
                      setStartDate(e.target.value);
                      setPage(1);
                    }}
                    className="w-[125px] h-9 bg-secondary border-border rounded-xl text-xs cursor-pointer"
                    title="From date"
                  />
                  <span className="text-muted-foreground text-[11px]">—</span>
                  <Input
                    type="date"
                    value={endDate}
                    onChange={(e) => {
                      setEndDate(e.target.value);
                      setPage(1);
                    }}
                    className="w-[125px] h-9 bg-secondary border-border rounded-xl text-xs cursor-pointer"
                    title="To date"
                  />
                </div>
              </div>

              {/* Reset Filters */}
              {(cashierFilter !== 'ALL' || startDate || endDate || statusFilter !== 'ALL') && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setCashierFilter('ALL');
                    setStartDate('');
                    setEndDate('');
                    setStatusFilter('ALL');
                    setPage(1);
                  }}
                  className="h-8 px-2.5 rounded-xl text-xs text-rose-500 hover:bg-rose-500/10 cursor-pointer font-medium ml-auto lg:ml-0"
                >
                  Clear Filters
                </Button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ========================================================= */}
      {/* INVOICES TABLE WITH ATTACHED SEARCH BAR                   */}
      {/* ========================================================= */}
      <Card className="border-border bg-card shadow-premium rounded-2xl overflow-hidden">
        
        {/* Attached Search Bar (directly on top of table) */}
        <div className="p-3 sm:p-4 border-b border-border/80 bg-secondary/30 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            <Input
              type="text"
              placeholder="Search by invoice number (e.g. INV-0001) or customer name..."
              value={search}
              onChange={handleSearchChange}
              className="pl-10 pr-9 bg-background h-10 rounded-xl text-xs border-border focus:ring-2 focus:ring-emerald-500/30 text-foreground"
            />
            {search && (
              <button
                type="button"
                onClick={() => {
                  setSearch('');
                  setPage(1);
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-1 rounded-md"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          <div className="text-xs text-muted-foreground flex items-center justify-between sm:justify-end w-full sm:w-auto space-x-3">
            {data?.pagination && (
              <span>
                Total: <strong className="text-foreground font-semibold font-mono">{data.pagination.total}</strong> invoices
              </span>
            )}
          </div>
        </div>

        {/* Table content directly follows */}
        <div className="overflow-x-auto relative">
          <Table className="w-full min-w-[900px]">
            <TableHeader className="bg-secondary/70 border-b border-border">
              <TableRow className="hover:bg-transparent">
                <TableHead className="px-6 py-4 font-bold text-xs text-foreground whitespace-nowrap">
                  Invoice No
                </TableHead>
                <TableHead className="px-6 py-4 font-bold text-xs text-foreground whitespace-nowrap">
                  Customer
                </TableHead>
                <TableHead className="px-6 py-4 font-bold text-xs text-foreground whitespace-nowrap">
                  Date
                </TableHead>
                <TableHead className="px-6 py-4 font-bold text-xs text-foreground whitespace-nowrap">
                  Total Amount
                </TableHead>
                <TableHead className="px-6 py-4 font-bold text-xs text-foreground whitespace-nowrap">
                  Issued By
                </TableHead>
                <TableHead className="px-6 py-4 font-bold text-xs text-center text-foreground whitespace-nowrap">
                  Status
                </TableHead>
                <TableHead className="px-6 py-4 font-bold text-xs text-center text-foreground whitespace-nowrap">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                [1, 2, 3, 4, 5].map((i) => (
                  <TableRow key={i} className="border-b border-border/60">
                    <TableCell className="px-6 py-4"><Skeleton className="h-4 w-20" /></TableCell>
                    <TableCell className="px-6 py-4"><Skeleton className="h-4 w-32" /></TableCell>
                    <TableCell className="px-6 py-4"><Skeleton className="h-4 w-24" /></TableCell>
                    <TableCell className="px-6 py-4"><Skeleton className="h-4 w-24" /></TableCell>
                    <TableCell className="px-6 py-4"><Skeleton className="h-4 w-28" /></TableCell>
                    <TableCell className="px-6 py-4 text-center"><Skeleton className="h-6 w-16 rounded-full mx-auto" /></TableCell>
                    <TableCell className="px-6 py-4 text-center"><Skeleton className="h-8 w-14 rounded-xl mx-auto" /></TableCell>
                  </TableRow>
                ))
              ) : isError || !data?.invoices ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center p-8 text-rose-500 font-medium">
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <AlertCircle className="h-8 w-8 text-rose-500" />
                      <p className="text-sm">Failed to load invoices. Ensure backend connectivity is active.</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : data.invoices.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center p-12 text-muted-foreground">
                    <div className="flex flex-col items-center justify-center space-y-3">
                      <div className="h-12 w-12 rounded-2xl bg-secondary flex items-center justify-center text-muted-foreground">
                        <FileDown className="h-6 w-6" />
                      </div>
                      <div className="space-y-1">
                        <p className="font-semibold text-sm text-foreground">No invoices found</p>
                        <p className="text-xs text-muted-foreground">Try clearing your filters or create a new invoice.</p>
                      </div>
                      <Link href="/invoices/create">
                        <Button size="sm" className="mt-2 text-xs bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl">
                          Create New Invoice
                        </Button>
                      </Link>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                data.invoices.map((inv) => (
                  <TableRow
                    key={inv.id}
                    className="border-b border-border/60 hover:bg-secondary/40 transition-colors cursor-pointer"
                    onClick={() => handleRowClick(inv.id)}
                  >
                    {/* Invoice Number */}
                    <TableCell className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col space-y-1">
                        <div className="flex items-center space-x-2">
                          <span className="font-mono font-bold text-xs text-emerald-600 dark:text-emerald-400">
                            {inv.invoiceNumber}
                          </span>
                          {/* Received Badge for Cashier */}
                          {user && inv.creatorId !== user.id && (
                            <span
                              className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-md bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20"
                              title={`Originally issued by ${inv.creator?.firstName} ${inv.creator?.lastName}`}
                            >
                              <Share2 className="h-2.5 w-2.5" />
                              <span>Received</span>
                            </span>
                          )}
                          {/* Shared Badge for Creator or Admin */}
                          {inv.shares && inv.shares.length > 0 && (isAdmin || (user && inv.creatorId === user.id)) && (
                            <span
                              className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-md bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20"
                              title={`Shared with: ${inv.shares.map((s) => `${s.sharedWith.firstName} ${s.sharedWith.lastName}`).join(', ')}`}
                            >
                              <Share2 className="h-2.5 w-2.5" />
                              <span>Shared ({inv.shares.length})</span>
                            </span>
                          )}
                        </div>
                      </div>
                    </TableCell>

                    {/* Customer */}
                    <TableCell className="px-6 py-4 whitespace-nowrap">
                      <div className="font-semibold text-xs text-foreground">
                        {inv.customerName}
                      </div>
                      {inv.customerPhone && (
                        <div className="text-[10px] text-muted-foreground font-mono mt-0.5">
                          {inv.customerPhone}
                        </div>
                      )}
                    </TableCell>

                    {/* Date */}
                    <TableCell className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-1.5 text-xs text-muted-foreground">
                        <Calendar className="h-3.5 w-3.5 text-muted-foreground/80 shrink-0" />
                        <span>{new Date(inv.createdAt).toLocaleDateString()}</span>
                      </div>
                    </TableCell>

                    {/* Total Amount */}
                    <TableCell className="px-6 py-4 whitespace-nowrap">
                      <span className="font-mono font-bold text-xs text-foreground tabular-nums">
                        {formatCurrency(inv.total)}
                      </span>
                    </TableCell>

                    {/* Issued By */}
                    <TableCell className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col space-y-0.5">
                        <div className="flex items-center space-x-1.5 text-xs text-muted-foreground">
                          <User className="h-3.5 w-3.5 text-muted-foreground/80 shrink-0" />
                          <span className="font-medium text-foreground">
                            {inv.creator ? `${inv.creator.firstName} ${inv.creator.lastName}` : 'System'}
                          </span>
                        </div>
                        {inv.shares && inv.shares.length > 0 && (
                          <div className="text-[10px] text-muted-foreground pl-5 font-mono">
                            w/ {inv.shares.map((s) => s.sharedWith.firstName).join(', ')}
                          </div>
                        )}
                      </div>
                    </TableCell>

                    {/* Status */}
                    <TableCell className="px-6 py-4 text-center whitespace-nowrap">
                      {getStatusBadge(inv.status)}
                    </TableCell>

                    {/* Actions */}
                    <TableCell className="px-6 py-4 text-center whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-center space-x-1.5">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleRowClick(inv.id)}
                          className="h-8 px-2.5 rounded-xl text-xs border-border hover:bg-secondary flex items-center space-x-1 cursor-pointer"
                        >
                          <Eye className="h-3.5 w-3.5" />
                          <span>View</span>
                        </Button>

                        {(isAdmin || (user && inv.creatorId === user.id)) && (
                          <Button
                            variant="outline"
                            size="sm"
                            title="Share invoice with another cashier"
                            onClick={(e) => openShareModal(inv, e)}
                            className="h-8 px-2 rounded-xl text-xs border-border hover:bg-blue-500/10 hover:text-blue-600 hover:border-blue-500/30 flex items-center space-x-1 cursor-pointer transition-colors"
                          >
                            <Share2 className="h-3.5 w-3.5 text-blue-500" />
                            <span className="hidden sm:inline">Share</span>
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Numbered Interactive Pagination */}
        {data && data.pagination && data.pagination.totalPages > 1 && (
          <div className="px-6 py-4 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-muted-foreground">
            <span className="font-mono text-[11px]">
              Showing {((page - 1) * 10) + 1} to {Math.min(page * 10, data.pagination.total)} of {data.pagination.total} invoices
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

      {/* ========================================================= */}
      {/* RESPONSIVE DETAILS & EXPORT MODAL                         */}
      {/* ========================================================= */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="sm:max-w-4xl lg:max-w-5xl xl:max-w-6xl w-[95vw] lg:max-h-[92vh] overflow-y-auto p-6 rounded-2xl">
          <DialogHeader className="border-b border-border/80 pb-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="flex items-center space-x-2">
                  <span className="font-mono text-sm font-bold text-emerald-600 dark:text-emerald-400">
                    {invoiceDetails?.invoiceNumber}
                  </span>
                  {invoiceDetails && getStatusBadge(invoiceDetails.status)}
                </div>
                <DialogTitle className="text-lg font-bold mt-1 text-foreground">
                  Invoice Details & Exports
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground">
                  Review calculated items, charges, customer data, and download vector documents.
                </DialogDescription>
              </div>

              {/* Action Buttons in Header */}
              {invoiceDetails && (
                <div className="flex items-center space-x-2">
                  
                  {/* Share Button */}
                  {(isAdmin || (user && invoiceDetails.creatorId === user.id)) && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openShareModal(invoiceDetails)}
                      className="h-9 text-xs rounded-xl border-border flex items-center space-x-1.5 cursor-pointer hover:bg-blue-500/10 hover:text-blue-600 hover:border-blue-500/30 transition-colors"
                    >
                      <Share2 className="h-3.5 w-3.5 text-blue-500" />
                      <span>Share</span>
                    </Button>
                  )}

                  {/* Request Reprint Button for Apprentice if PRINTED */}
                  {!isAdmin && invoiceDetails.status === 'PRINTED' && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={async () => {
                        const reason = await modal.prompt(
                          'Reprint Authorization Request',
                          'Enter the reason for requesting reprint authorization (e.g. Paper damaged, client duplicate copy):',
                          'Customer copy replacement'
                        );
                        if (reason) {
                          try {
                            await createApprovalMutation.mutateAsync({
                              invoiceId: invoiceDetails.id,
                              type: 'PRINT',
                              reason,
                            });
                            modal.alert(
                              'Request Submitted',
                              'Your reprint authorization request has been submitted to the administrators. You will be able to print once approved.',
                              'success'
                            );
                          } catch (err) {
                            const msg = (err as AxiosErrorLike).response?.data?.error?.message || 'Failed to submit reprint request';
                            modal.alert('Request Failed', msg, 'error');
                          }
                        }
                      }}
                      className="h-9 text-xs rounded-xl border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400 hover:bg-amber-500/20 flex items-center space-x-1.5 cursor-pointer"
                    >
                      <Lock className="h-3.5 w-3.5 text-amber-500" />
                      <span>Request Reprint</span>
                    </Button>
                  )}

                  {/* PDF Export */}
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={exportingFormat === 'pdf'}
                    onClick={() => handleExport(invoiceDetails.id, 'pdf', invoiceDetails.invoiceNumber)}
                    className="h-9 text-xs rounded-xl border-border flex items-center space-x-1.5 cursor-pointer"
                  >
                    {exportingFormat === 'pdf' ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Printer className="h-3.5 w-3.5 text-emerald-500" />
                    )}
                    <span>PDF</span>
                  </Button>

                  {/* Excel/CSV Export */}
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={exportingFormat === 'excel'}
                    onClick={() => handleExport(invoiceDetails.id, 'excel', invoiceDetails.invoiceNumber)}
                    className="h-9 text-xs rounded-xl border-border flex items-center space-x-1.5 cursor-pointer"
                  >
                    {exportingFormat === 'excel' ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <FileSpreadsheet className="h-3.5 w-3.5 text-purple-500" />
                    )}
                    <span>Excel</span>
                  </Button>

                  {/* Admin Delete */}
                  {isAdmin && (
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDelete(invoiceDetails.id)}
                      className="h-9 text-xs rounded-xl flex items-center space-x-1"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      <span className="hidden sm:inline">Delete</span>
                    </Button>
                  )}
                </div>
              )}
            </div>
          </DialogHeader>

          {/* Details Content */}
          {detailsLoading ? (
            <div className="space-y-4 py-6">
              <Skeleton className="h-20 w-full rounded-xl" />
              <Skeleton className="h-40 w-full rounded-xl" />
              <Skeleton className="h-16 w-full rounded-xl" />
            </div>
          ) : !invoiceDetails ? (
            <p className="text-sm text-rose-500 py-6 text-center">Failed to load invoice details.</p>
          ) : (
            <div className="space-y-6 pt-4">
              
              {/* Metadata Summary Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-xl bg-secondary/40 border border-border text-xs">
                <div>
                  <span className="text-muted-foreground block text-[10px] uppercase font-mono">Customer</span>
                  <span className="font-bold text-foreground">{invoiceDetails.customerName}</span>
                  {invoiceDetails.customerPhone && (
                    <span className="block text-muted-foreground font-mono text-[11px]">{invoiceDetails.customerPhone}</span>
                  )}
                </div>
                <div>
                  <span className="text-muted-foreground block text-[10px] uppercase font-mono">Date Issued</span>
                  <span className="font-medium text-foreground">
                    {new Date(invoiceDetails.createdAt).toLocaleString()}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-[10px] uppercase font-mono">Cashier</span>
                  <span className="font-medium text-foreground">
                    {invoiceDetails.creator ? `${invoiceDetails.creator.firstName} ${invoiceDetails.creator.lastName}` : 'System'}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-[10px] uppercase font-mono">Grand Total</span>
                  <span className="font-bold text-sm text-emerald-600 dark:text-emerald-400 font-mono tabular-nums">
                    {formatCurrency(invoiceDetails.total)}
                  </span>
                </div>
              </div>

              {/* Invoice Sharing Record (if shared) */}
              {invoiceDetails.shares && invoiceDetails.shares.length > 0 && (
                <div className="p-4 rounded-xl bg-blue-500/5 border border-blue-500/20 space-y-2.5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                    <div className="flex items-center space-x-2">
                      <Share2 className="h-4 w-4 text-blue-500" />
                      <span className="text-xs font-bold text-foreground">Shared Cashier Access</span>
                    </div>
                    <span className="text-[11px] text-muted-foreground">
                      Originally issued by <strong>{invoiceDetails.creator ? `${invoiceDetails.creator.firstName} ${invoiceDetails.creator.lastName}` : 'Original Cashier'}</strong>
                    </span>
                  </div>
                  <div className="divide-y divide-border/60">
                    {invoiceDetails.shares.map((share) => (
                      <div key={share.id} className="pt-2 pb-1.5 first:pt-0 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                        <div className="space-y-0.5">
                          <div className="flex items-center space-x-2">
                            <span className="font-semibold text-foreground">
                              {share.sharedWith.firstName} {share.sharedWith.lastName}
                            </span>
                            <span className="text-[10px] text-muted-foreground">
                              (Shared by {share.sharedBy.firstName} {share.sharedBy.lastName} on {new Date(share.createdAt).toLocaleDateString()})
                            </span>
                          </div>
                          {share.notes && (
                            <p className="text-[11px] text-muted-foreground italic pl-2 border-l-2 border-blue-500/40">
                              &ldquo;{share.notes}&rdquo;
                            </p>
                          )}
                        </div>

                        {(isAdmin || (user && invoiceDetails.creatorId === user.id)) && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRevokeShare(invoiceDetails.id, share.sharedWithId, `${share.sharedWith.firstName} ${share.sharedWith.lastName}`)}
                            className="h-7 px-2.5 text-[11px] text-rose-500 hover:text-rose-600 hover:bg-rose-500/10 cursor-pointer self-start sm:self-auto rounded-lg"
                          >
                            Revoke
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Line Items Table */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Line Items Breakdown</h4>
                <div className="border border-border rounded-xl overflow-hidden">
                  <Table>
                    <TableHeader className="bg-secondary/30">
                      <TableRow>
                        <TableHead className="text-xs font-semibold">Description</TableHead>
                        <TableHead className="text-xs font-semibold text-right">Quantity</TableHead>
                        <TableHead className="text-xs font-semibold text-right">Weight (Tons)</TableHead>
                        <TableHead className="text-xs font-semibold text-right">Unit Price</TableHead>
                        <TableHead className="text-xs font-semibold text-right">Total Price</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {invoiceDetails.items?.map((item) => (
                        <TableRow key={item.id} className="text-xs border-b border-border/50">
                          <TableCell className="font-medium">{item.description}</TableCell>
                          <TableCell className="text-right font-mono tabular-nums">{Number(item.quantity).toLocaleString()}</TableCell>
                          <TableCell className="text-right font-mono tabular-nums">{item.weight ? Number(item.weight).toFixed(3) : '-'}</TableCell>
                          <TableCell className="text-right font-mono tabular-nums">{formatCurrency(item.unitPrice)}</TableCell>
                          <TableCell className="text-right font-mono font-bold tabular-nums">{formatCurrency(item.totalPrice)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>

              {/* Financial Totals */}
              <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 text-xs font-mono">
                <div className="w-full sm:w-72 space-y-1.5 p-4 rounded-xl bg-secondary/30 border border-border">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Subtotal:</span>
                    <span className="tabular-nums font-semibold">{formatCurrency(invoiceDetails.subtotal)}</span>
                  </div>
                  {invoiceDetails.charges?.map((charge) => (
                    <div key={charge.id} className="flex justify-between text-muted-foreground">
                      <span>{charge.name}:</span>
                      <span className="tabular-nums">{formatCurrency(charge.amount)}</span>
                    </div>
                  ))}
                  <div className="border-t border-border pt-2 flex justify-between font-bold text-sm text-emerald-600 dark:text-emerald-400">
                    <span>Grand Total:</span>
                    <span className="tabular-nums">{formatCurrency(invoiceDetails.total)}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* ========================================================= */}
      {/* SHARE INVOICE MODAL                                       */}
      {/* ========================================================= */}
      <Dialog open={isShareModalOpen} onOpenChange={setIsShareModalOpen}>
        <DialogContent className="sm:max-w-md w-[95vw] p-6 rounded-2xl">
          <DialogHeader>
            <div className="flex items-center space-x-3 mb-1">
              <div className="p-2 rounded-xl bg-blue-500/10 text-blue-500">
                <Share2 className="h-5 w-5" />
              </div>
              <div>
                <DialogTitle className="text-base font-bold text-foreground">
                  Share Invoice
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground">
                  Allow another cashier to access, view, and print this invoice.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          {invoiceToShare && (
            <form onSubmit={handleShareSubmit} className="space-y-4 pt-2">
              {/* Invoice Summary Card */}
              <div className="p-3 rounded-xl bg-secondary/50 border border-border text-xs space-y-1">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Invoice Number:</span>
                  <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                    {invoiceToShare.invoiceNumber}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Customer:</span>
                  <span className="font-medium text-foreground">{invoiceToShare.customerName}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Original Issuer:</span>
                  <span className="font-medium text-foreground">
                    {invoiceToShare.creator ? `${invoiceToShare.creator.firstName} ${invoiceToShare.creator.lastName}` : 'Cashier'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Grand Total:</span>
                  <span className="font-mono font-bold text-foreground">{formatCurrency(invoiceToShare.total)}</span>
                </div>
              </div>

              {/* Recipient Cashier Selector */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">
                  Select Recipient Cashier <span className="text-rose-500">*</span>
                </label>
                {getEligibleRecipients(invoiceToShare).length === 0 ? (
                  <div className="text-xs text-amber-600 bg-amber-500/10 p-3.5 rounded-xl border border-amber-500/20 space-y-1.5">
                    <p className="font-semibold">No other active cashier accounts available</p>
                    <p className="text-[11px] text-amber-700/80 dark:text-amber-400/80">
                      To share invoices, there must be at least one other active cashier account registered in the system.
                    </p>
                    {isAdmin && (
                      <Link href="/users">
                        <Button type="button" size="sm" variant="outline" className="mt-1 h-7 text-xs border-amber-500/30 text-amber-700 dark:text-amber-300">
                          Create Cashier Account &rarr;
                        </Button>
                      </Link>
                    )}
                  </div>
                ) : (
                  <div className="relative">
                    <select
                      value={targetUserId}
                      onChange={(e) => setTargetUserId(e.target.value)}
                      required
                      className="w-full h-10 px-3 pr-8 bg-secondary border border-border rounded-xl text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500/30 cursor-pointer font-medium appearance-none"
                    >
                      <option value="" disabled>Choose an apprentice cashier...</option>
                      {getEligibleRecipients(invoiceToShare).map((cashier) => (
                        <option key={cashier.id} value={cashier.id}>
                          {cashier.firstName} {cashier.lastName} ({cashier.role === 'ADMIN' ? 'Admin' : 'Cashier'}) &mdash; {cashier.email}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                  </div>
                )}
                <p className="text-[11px] text-muted-foreground">
                  The invoice will remain officially credited to {invoiceToShare.creator ? `${invoiceToShare.creator.firstName} ${invoiceToShare.creator.lastName}` : 'the issuer'}.
                </p>
              </div>

              {/* Transfer Note */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">
                  Transfer Note / Instructions <span className="text-muted-foreground font-normal">(Optional)</span>
                </label>
                <Input
                  type="text"
                  placeholder="e.g. Please print customer receipt copy and collect balance"
                  value={shareNotes}
                  onChange={(e) => setShareNotes(e.target.value)}
                  className="h-10 text-xs bg-background rounded-xl border-border focus:ring-2 focus:ring-emerald-500/30"
                />
              </div>

              {/* Modal Footer */}
              <div className="flex items-center justify-end space-x-2 pt-3 border-t border-border/80">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsShareModalOpen(false)}
                  className="h-9 px-4 rounded-xl text-xs cursor-pointer"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  disabled={isSharing || !targetUserId}
                  className="h-9 px-4 rounded-xl text-xs bg-blue-600 hover:bg-blue-700 text-white flex items-center space-x-1.5 cursor-pointer"
                >
                  {isSharing ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Share2 className="h-3.5 w-3.5" />
                  )}
                  <span>Share Invoice</span>
                </Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
