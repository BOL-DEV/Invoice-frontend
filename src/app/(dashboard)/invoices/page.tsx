'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useInvoicesList, useInvoiceDetails, useDeleteInvoice } from '../../../features/invoices/hooks/useInvoices';
import { usePermission } from '../../../features/auth/hooks/usePermission';
import { InvoiceStatus, AxiosErrorLike } from '../../../types/api';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../../components/ui/table';
import { Card, CardContent } from '../../../components/ui/card';
import { Badge } from '../../../components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../../../components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../components/ui/select';
import { Skeleton } from '../../../components/ui/skeleton';
import { apiClient } from '../../../services/api/axios';
import { useModal } from '../../../components/ui/modal-provider';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Plus,
  FileDown,
  Printer,
  Trash2,
  Lock,
  Edit,
  Eye,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  AlertCircle,
  FileSpreadsheet,
  Calendar,
  User,
  Hash,
  Scale,
} from 'lucide-react';

export default function InvoicesPage() {
  const { isAdmin } = usePermission();
  const modal = useModal();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<string | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  // Queries
  const { data, isLoading, isError } = useInvoicesList({
    page,
    limit: 10,
    search: search || undefined,
    status: statusFilter === 'ALL' ? undefined : (statusFilter as InvoiceStatus),
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

  const handleExport = async (invoiceId: string, format: 'pdf' | 'excel' | 'image', invoiceNumber: string) => {
    try {
      const extension = format === 'pdf' ? 'pdf' : format === 'excel' ? 'csv' : 'svg';
      const contentType = format === 'pdf' ? 'application/pdf' : format === 'excel' ? 'text/csv' : 'image/svg+xml';
      
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
      modal.alert('Export Failed', errMsg, 'error');
    }
  };

  const getStatusBadge = (status: InvoiceStatus) => {
    switch (status) {
      case 'DRAFT':
        return <Badge className="bg-slate-100 hover:bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 font-mono text-[10px] font-bold tracking-wider px-2 py-0.5 rounded-full border border-slate-200 dark:border-slate-700">DRAFT</Badge>;
      case 'FINALIZED':
        return <Badge className="bg-emerald-50 hover:bg-emerald-50 text-[#059669] dark:bg-emerald-500/10 dark:text-[#10B981] font-mono text-[10px] font-bold tracking-wider px-2 py-0.5 rounded-full border border-emerald-100 dark:border-emerald-500/25">FINALIZED</Badge>;
      case 'PRINTED':
        return <Badge className="bg-blue-50 hover:bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400 font-mono text-[10px] font-bold tracking-wider px-2 py-0.5 rounded-full border border-blue-100 dark:border-blue-500/25">PRINTED</Badge>;
      case 'ARCHIVED':
        return <Badge className="bg-slate-100 hover:bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400 font-mono text-[10px] font-bold tracking-wider px-2 py-0.5 rounded-full border border-slate-200 dark:border-slate-700">ARCHIVED</Badge>;
      default:
        return <Badge className="bg-slate-100 hover:bg-slate-100 text-slate-500 font-mono text-[10px] tracking-wider px-2 py-0.5 rounded-full border border-slate-200">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto">
      {/* Header controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-[#0F172A] dark:text-[#F8FAFC] font-heading">Invoice Ledgers</h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Search, export, or audit digital building material invoices.
          </p>
        </div>
        <Link href="/invoices/create">
          <Button className="font-semibold space-x-2 bg-primary hover:bg-primary-hover text-white rounded-xl shadow-premium px-4 py-5">
            <Plus className="h-4 w-4" />
            <span>Create Invoice</span>
          </Button>
        </Link>
      </div>

      {/* Filters card */}
      <Card className="border-border bg-card shadow-premium rounded-2xl overflow-hidden">
        <CardContent className="p-4 flex flex-col md:flex-row gap-4 items-center">
          <div className="flex-1 w-full relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search by invoice number or customer name..."
              value={search}
              onChange={handleSearchChange}
              className="pl-9 bg-background h-10 rounded-xl"
            />
          </div>

          <div className="w-full md:w-56">
            <Select value={statusFilter} onValueChange={(val) => handleStatusFilterChange(val || 'ALL')}>
              <SelectTrigger className="bg-background h-10 rounded-xl">
                <SelectValue placeholder="Filter status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Statuses</SelectItem>
                <SelectItem value="DRAFT">Draft</SelectItem>
                <SelectItem value="FINALIZED">Finalized</SelectItem>
                <SelectItem value="PRINTED">Printed</SelectItem>
                <SelectItem value="ARCHIVED">Archived</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Invoices table card */}
      <Card className="border-border bg-card shadow-premium rounded-2xl overflow-hidden">
        <div className="overflow-x-auto relative">
          <Table>
            <TableHeader className="bg-secondary/40 sticky top-0 z-10 border-b border-border">
              <TableRow className="hover:bg-transparent">
                <TableHead className="font-semibold w-36 text-[#0F172A] dark:text-[#F8FAFC] py-4 pl-6">Invoice No</TableHead>
                <TableHead className="font-semibold text-[#0F172A] dark:text-[#F8FAFC] py-4">Customer</TableHead>
                <TableHead className="font-semibold text-[#0F172A] dark:text-[#F8FAFC] py-4">Date</TableHead>
                <TableHead className="font-semibold text-right text-[#0F172A] dark:text-[#F8FAFC] py-4">Total Price</TableHead>
                <TableHead className="font-semibold text-[#0F172A] dark:text-[#F8FAFC] py-4">Cashier</TableHead>
                <TableHead className="font-semibold text-[#0F172A] dark:text-[#F8FAFC] py-4">Status</TableHead>
                <TableHead className="font-semibold text-center w-24 text-[#0F172A] dark:text-[#F8FAFC] py-4 pr-6">Details</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                [1, 2, 3, 4, 5].map((i) => (
                  <TableRow key={i} className="border-b border-border/60">
                    <TableCell className="py-4 pl-6"><Skeleton className="h-4 w-20" /></TableCell>
                    <TableCell className="py-4"><Skeleton className="h-4 w-32" /></TableCell>
                    <TableCell className="py-4"><Skeleton className="h-4 w-24" /></TableCell>
                    <TableCell className="py-4"><Skeleton className="h-4 w-20 ml-auto" /></TableCell>
                    <TableCell className="py-4"><Skeleton className="h-4 w-24" /></TableCell>
                    <TableCell className="py-4"><Skeleton className="h-6 w-16 rounded-full" /></TableCell>
                    <TableCell className="py-4 pr-6"><Skeleton className="h-8 w-8 rounded-full mx-auto" /></TableCell>
                  </TableRow>
                ))
              ) : isError || !data?.invoices ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center p-8 text-rose-500 font-medium">
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <AlertCircle className="h-8 w-8 text-rose-500 animate-bounce" />
                      <p>Failed to load invoices. Ensure backend connectivity is active.</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : data.invoices.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center p-12 text-muted-foreground">
                    <div className="flex flex-col items-center justify-center space-y-3">
                      <FileDown className="h-10 w-10 text-muted-foreground/40" />
                      <div className="space-y-0.5">
                        <p className="font-semibold text-sm">No ledgers found</p>
                        <p className="text-xs text-muted-foreground">Try broadening your filters or create a new invoice.</p>
                      </div>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                data.invoices.map((inv) => {
                  const isActive = selectedInvoiceId === inv.id && isDetailOpen;
                  return (
                    <TableRow
                      key={inv.id}
                      onClick={() => handleRowClick(inv.id)}
                      className={`cursor-pointer group border-b border-border/60 transition-all duration-150 ${
                        isActive
                          ? 'active-row-highlight bg-secondary/80'
                          : 'hover:bg-slate-50/50 dark:hover:bg-slate-800/35'
                      }`}
                    >
                      <TableCell className="font-mono font-bold text-xs text-[#0F172A] dark:text-[#F8FAFC] py-4 pl-6">
                        #{inv.invoiceNumber}
                      </TableCell>
                      <TableCell className="font-medium text-foreground py-4">{inv.customerName}</TableCell>
                      <TableCell className="text-muted-foreground text-xs py-4">
                        {new Date(inv.createdAt).toLocaleDateString(undefined, {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </TableCell>
                      <TableCell className="text-right font-mono font-bold text-sm text-[#0F172A] dark:text-[#F8FAFC] py-4">
                        ₦{inv.total.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground py-4">
                        {inv.creator.firstName} {inv.creator.lastName}
                      </TableCell>
                      <TableCell className="py-4">{getStatusBadge(inv.status)}</TableCell>
                      <TableCell className="text-center py-4 pr-6">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 rounded-full hover:bg-primary hover:text-white transition-colors"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination controls */}
        {data && data.pagination && data.pagination.totalPages > 1 && (
          <div className="p-4 border-t border-border flex justify-between items-center bg-secondary/15">
            <span className="text-xs text-muted-foreground">
              Showing Page {data.pagination.page} of {data.pagination.totalPages} ({data.pagination.total} invoices)
            </span>
            <div className="flex space-x-1">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.max(p - 1, 1))}
                disabled={page === 1}
                className="h-8 rounded-lg"
              >
                <ChevronLeft className="h-4 w-4 mr-0.5" />
                <span>Prev</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.min(p + 1, data.pagination.totalPages))}
                disabled={page === data.pagination.totalPages}
                className="h-8 rounded-lg"
              >
                <span>Next</span>
                <ChevronRight className="h-4 w-4 ml-0.5" />
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* Invoice Detail Sheet Dialogue */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="max-w-3xl lg:max-w-5xl xl:max-w-6xl max-h-[90vh] lg:max-h-[95vh] overflow-y-auto bg-card border-border rounded-2xl p-6 shadow-2xl">
          <DialogHeader className="border-b border-border pb-4">
            <DialogTitle className="flex justify-between items-center text-lg font-bold font-heading">
              <span className="font-mono tracking-tight flex items-center space-x-1.5">
                <Hash className="h-4 w-4 text-muted-foreground" />
                <span>Invoice #{invoiceDetails?.invoiceNumber}</span>
              </span>
              <span>{invoiceDetails && getStatusBadge(invoiceDetails.status)}</span>
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground mt-1">
              View transaction summary, items, and export formats.
            </DialogDescription>
          </DialogHeader>

          {detailsLoading ? (
            <div className="space-y-4 py-6">
              <Skeleton className="h-20 w-full rounded-xl animate-pulse" />
              <Skeleton className="h-40 w-full rounded-xl animate-pulse" />
              <Skeleton className="h-16 w-full rounded-xl animate-pulse" />
            </div>
          ) : !invoiceDetails ? (
            <p className="text-rose-500 text-center py-6">Failed to load invoice details.</p>
          ) : (
            <div className="space-y-6 pt-4">
              {/* Customer and Cashier Details cards */}
              <div className="grid sm:grid-cols-2 gap-4 bg-slate-50 dark:bg-slate-900/50 p-4 rounded-2xl border border-border/80 text-xs">
                <div className="space-y-1">
                  <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider flex items-center space-x-1">
                    <User className="h-3 w-3 mr-0.5" />
                    <span>Bill To</span>
                  </h4>
                  <p className="font-bold text-foreground text-sm">{invoiceDetails.customerName}</p>
                  {invoiceDetails.customerPhone && (
                    <p className="text-muted-foreground font-mono">{invoiceDetails.customerPhone}</p>
                  )}
                </div>
                <div className="space-y-1 sm:text-right">
                  <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider flex items-center sm:justify-end space-x-1">
                    <Calendar className="h-3 w-3 mr-0.5" />
                    <span>Transaction Meta</span>
                  </h4>
                  <p className="text-foreground">
                    Date: <span className="font-semibold">{new Date(invoiceDetails.createdAt).toLocaleDateString()}</span>
                  </p>
                  <p className="text-muted-foreground">
                    Cashier: <span className="font-semibold">{invoiceDetails.creator.firstName} {invoiceDetails.creator.lastName}</span>
                  </p>
                </div>
              </div>

              {/* Items List */}
              <div className="space-y-2">
                <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Line Items</h4>
                <div className="border border-border/80 rounded-xl overflow-hidden shadow-sm">
                  <Table>
                    <TableHeader className="bg-slate-50 dark:bg-slate-900">
                      <TableRow className="hover:bg-transparent border-b border-border/80">
                        <TableHead className="w-12 text-center text-[10px] uppercase font-bold text-muted-foreground">Pos</TableHead>
                        <TableHead className="text-[10px] uppercase font-bold text-muted-foreground">Description</TableHead>
                        <TableHead className="text-right text-[10px] uppercase font-bold text-muted-foreground">Quantity</TableHead>
                        <TableHead className="text-right text-[10px] uppercase font-bold text-muted-foreground">Price</TableHead>
                        <TableHead className="text-right text-[10px] uppercase font-bold text-muted-foreground">Line Total</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {invoiceDetails.items.map((item) => (
                        <TableRow key={item.id} className="border-b border-border/60 hover:bg-transparent text-xs">
                          <TableCell className="text-center font-mono text-muted-foreground">{item.position}</TableCell>
                          <TableCell className="font-medium text-foreground">{item.description}</TableCell>
                          <TableCell className="text-right font-mono font-medium">{Number(item.quantity).toFixed(2)}</TableCell>
                          <TableCell className="text-right font-mono text-muted-foreground">₦{Number(item.unitPrice).toFixed(2)}</TableCell>
                          <TableCell className="text-right font-mono font-bold text-foreground">₦{Number(item.totalPrice).toFixed(2)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>

              {/* Summary and notes layout */}
              <div className="grid md:grid-cols-2 gap-6 pt-1">
                <div>
                  {invoiceDetails.notes && (
                    <div className="space-y-1.5">
                      <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Cashier Notes</h4>
                      <p className="text-xs bg-slate-50 dark:bg-slate-900 p-3.5 rounded-xl border border-border/60 text-muted-foreground italic leading-relaxed">
                        {invoiceDetails.notes}
                      </p>
                    </div>
                  )}
                </div>
                <div className="space-y-2.5 text-xs font-mono border border-border p-4 rounded-xl bg-slate-50/50 dark:bg-slate-900/30">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground font-sans">Subtotal:</span>
                    <span className="font-semibold text-foreground">₦{Number(invoiceDetails.subtotal).toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                  </div>
                  {invoiceDetails.charges.map((charge) => (
                    <div key={charge.id} className="flex justify-between text-[11px] items-center">
                      <span className="text-muted-foreground font-sans uppercase">{charge.name}:</span>
                      <span className={charge.amount < 0 ? 'text-emerald-500 font-semibold' : 'text-foreground'}>
                        {charge.amount < 0 ? '-' : ''}₦{Math.abs(Number(charge.amount)).toFixed(2)}
                      </span>
                    </div>
                  ))}
                  <div className="flex justify-between border-t border-border pt-2 text-base font-bold text-[#0F172A] dark:text-[#F8FAFC]">
                    <span className="font-sans">Grand Total:</span>
                    <span>₦{Number(invoiceDetails.total).toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                  </div>
                </div>
              </div>

              {/* Action buttons drawer */}
              <div className="flex flex-wrap justify-between items-center pt-5 border-t border-border gap-3">
                {/* Print Exporters */}
                <div className="flex gap-1.5">
                  <Button
                    onClick={() => handleExport(invoiceDetails.id, 'pdf', invoiceDetails.invoiceNumber)}
                    variant="outline"
                    size="sm"
                    className="space-x-1.5 font-semibold text-xs rounded-xl shadow-sm"
                  >
                    <Printer className="h-3.5 w-3.5 text-muted-foreground" />
                    <span>PDF</span>
                  </Button>
                  <Button
                    onClick={() => handleExport(invoiceDetails.id, 'excel', invoiceDetails.invoiceNumber)}
                    variant="outline"
                    size="sm"
                    className="space-x-1.5 font-semibold text-xs rounded-xl shadow-sm"
                  >
                    <FileSpreadsheet className="h-3.5 w-3.5 text-muted-foreground" />
                    <span>CSV</span>
                  </Button>
                  <Button
                    onClick={() => handleExport(invoiceDetails.id, 'image', invoiceDetails.invoiceNumber)}
                    variant="outline"
                    size="sm"
                    className="space-x-1.5 font-semibold text-xs rounded-xl shadow-sm"
                  >
                    <FileDown className="h-3.5 w-3.5 text-muted-foreground" />
                    <span>SVG</span>
                  </Button>
                </div>

                {/* Operations modifiers */}
                <div className="flex gap-1.5">
                  {/* Edit Draft */}
                  {invoiceDetails.status === 'DRAFT' && (
                    <Link href={`/invoices/${invoiceDetails.id}`}>
                      <Button size="sm" className="space-x-1.5 bg-[#0F172A] hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-slate-200 text-white dark:text-[#0F172A] font-semibold text-xs rounded-xl">
                        <Edit className="h-3.5 w-3.5" />
                        <span>Edit Draft</span>
                      </Button>
                    </Link>
                  )}

                  {/* Request approvals for Apprentice if finalized */}
                  {invoiceDetails.status === 'FINALIZED' && !isAdmin && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={async () => {
                        const reason = await modal.prompt(
                          'Request Edit Approval',
                          'Please state your reasoning for editing this finalized invoice:'
                        );
                        if (reason) {
                          apiClient
                            .post('/api/approvals', {
                              invoiceId: invoiceDetails.id,
                              type: 'EDIT',
                              reason,
                            })
                            .then(() => modal.alert('Ticket Requested', 'Edit authorization ticket requested successfully', 'success'))
                            .catch((err) => modal.alert('Request Failed', err.response?.data?.error?.message || 'Failed to request ticket', 'error'));
                        }
                      }}
                      className="space-x-1.5 font-semibold text-xs rounded-xl border-amber-500/30 text-amber-600 hover:bg-amber-500/5"
                    >
                      <Lock className="h-3.5 w-3.5 text-amber-500" />
                      <span>Request Edit Approval</span>
                    </Button>
                  )}

                  {/* Direct Admin Edit/Delete */}
                  {isAdmin && (
                    <>
                      <Link href={`/invoices/${invoiceDetails.id}`}>
                        <Button size="sm" className="space-x-1.5 bg-[#0F172A] hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-slate-200 text-white dark:text-[#0F172A] font-semibold text-xs rounded-xl shadow-sm">
                          <Edit className="h-3.5 w-3.5" />
                          <span>Modify Invoice</span>
                        </Button>
                      </Link>
                      <Button
                        onClick={() => handleDelete(invoiceDetails.id)}
                        variant="destructive"
                        size="sm"
                        className="space-x-1.5 font-semibold text-xs rounded-xl"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        <span>Delete Ledger</span>
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
