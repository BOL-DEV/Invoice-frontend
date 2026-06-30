'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useInvoicesList, useInvoiceDetails, useDeleteInvoice } from '../../../features/invoices/hooks/useInvoices';
import { usePermission } from '../../../features/auth/hooks/usePermission';
import { InvoiceStatus, Invoice, AxiosErrorLike } from '../../../types/api';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../../components/ui/table';
import { Card, CardHeader, CardTitle, CardContent } from '../../../components/ui/card';
import { Badge } from '../../../components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../../../components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../components/ui/select';
import { Skeleton } from '../../../components/ui/skeleton';
import { apiClient } from '../../../services/api/axios';
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
} from 'lucide-react';

export default function InvoicesPage() {
  const { hasPermission, isAdmin } = usePermission();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<string | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  // Queries
  const { data, isLoading, isError, refetch } = useInvoicesList({
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
    if (confirm('Are you sure you want to delete this invoice? This action cannot be undone.')) {
      try {
        await deleteInvoiceMutation.mutateAsync(id);
        setIsDetailOpen(false);
        alert('Invoice soft-deleted successfully');
      } catch (err) {
        const errorMsg = (err as AxiosErrorLike).response?.data?.error?.message || 'Failed to delete invoice';
        alert(errorMsg);
      }
    }
  };

  // Secure File Download Handler
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
      alert(errMsg);
    }
  };

  const getStatusBadge = (status: InvoiceStatus) => {
    switch (status) {
      case 'DRAFT':
        return <Badge variant="secondary" className="bg-zinc-800 text-zinc-300 hover:bg-zinc-800 font-mono">DRAFT</Badge>;
      case 'FINALIZED':
        return <Badge className="bg-blue-500/10 text-blue-500 border-blue-500/20 hover:bg-blue-500/10 font-mono">FINALIZED</Badge>;
      case 'PRINTED':
        return <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 hover:bg-emerald-500/10 font-mono">PRINTED</Badge>;
      case 'ARCHIVED':
        return <Badge className="bg-zinc-500/10 text-zinc-500 border-zinc-500/20 hover:bg-zinc-500/10 font-mono">ARCHIVED</Badge>;
      default:
        return <Badge className="bg-zinc-500/10 text-zinc-500 border-zinc-500/20 hover:bg-zinc-500/10 font-mono">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight">Invoice Ledgers</h2>
          <p className="text-sm text-muted-foreground">
            Search, export, or audit digital building material invoices.
          </p>
        </div>
        <Link href="/invoices/create">
          <Button className="font-semibold space-x-2">
            <Plus className="h-4 w-4" />
            <span>Create Invoice</span>
          </Button>
        </Link>
      </div>

      {/* Filters card */}
      <Card className="border-border bg-card">
        <CardContent className="pt-6 flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search by invoice number or customer name..."
              value={search}
              onChange={handleSearchChange}
              className="pl-9 bg-background"
            />
          </div>

          <div className="w-full md:w-48">
            <Select value={statusFilter} onValueChange={(val) => handleStatusFilterChange(val || 'ALL')}>
              <SelectTrigger className="bg-background">
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

      {/* Invoices table */}
      <Card className="border-border bg-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-secondary/40">
              <TableHead className="font-semibold w-32">Invoice No</TableHead>
              <TableHead className="font-semibold">Customer</TableHead>
              <TableHead className="font-semibold">Date</TableHead>
              <TableHead className="font-semibold text-right">Total Price</TableHead>
              <TableHead className="font-semibold">Cashier</TableHead>
              <TableHead className="font-semibold">Status</TableHead>
              <TableHead className="font-semibold text-center w-24">Details</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              [1, 2, 3, 4, 5].map((i) => (
                <TableRow key={i}>
                  <TableCell><div className="h-4 w-16 bg-muted animate-pulse rounded" /></TableCell>
                  <TableCell><div className="h-4 w-32 bg-muted animate-pulse rounded" /></TableCell>
                  <TableCell><div className="h-4 w-24 bg-muted animate-pulse rounded" /></TableCell>
                  <TableCell><div className="h-4 w-20 bg-muted animate-pulse rounded ml-auto" /></TableCell>
                  <TableCell><div className="h-4 w-24 bg-muted animate-pulse rounded" /></TableCell>
                  <TableCell><div className="h-6 w-16 bg-muted animate-pulse rounded" /></TableCell>
                  <TableCell><div className="h-8 w-8 bg-muted animate-pulse rounded-full mx-auto" /></TableCell>
                </TableRow>
              ))
            ) : isError || !data?.invoices ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center p-6 text-rose-500 font-medium">
                  Failed to fetch invoices list. Make sure the backend server is running.
                </TableCell>
              </TableRow>
            ) : data.invoices.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center p-8 text-muted-foreground italic">
                  No invoices matched your filters.
                </TableCell>
              </TableRow>
            ) : (
              data.invoices.map((inv) => (
                <TableRow
                  key={inv.id}
                  onClick={() => handleRowClick(inv.id)}
                  className="cursor-pointer hover:bg-secondary/40 transition-colors"
                >
                  <TableCell className="font-mono font-bold">#{inv.invoiceNumber}</TableCell>
                  <TableCell className="font-medium text-foreground">{inv.customerName}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {new Date(inv.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right font-mono font-bold">
                    ₦{inv.total.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </TableCell>
                  <TableCell>
                    {inv.creator.firstName} {inv.creator.lastName}
                  </TableCell>
                  <TableCell>{getStatusBadge(inv.status)}</TableCell>
                  <TableCell className="text-center">
                    <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-primary hover:text-primary-foreground">
                      <Eye className="h-4 w-4" />
                    </Button>
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

      {/* Invoice Detail Sheet Dialogue */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto bg-card border-border">
          <DialogHeader>
            <DialogTitle className="flex justify-between items-center font-mono font-bold text-xl">
              <span>Invoice #{invoiceDetails?.invoiceNumber}</span>
              <span>{invoiceDetails && getStatusBadge(invoiceDetails.status)}</span>
            </DialogTitle>
            <DialogDescription>
              Displaying complete cashier transaction logs and line records.
            </DialogDescription>
          </DialogHeader>

          {detailsLoading ? (
            <div className="space-y-4 py-4">
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-40 w-full" />
              <Skeleton className="h-16 w-full" />
            </div>
          ) : !invoiceDetails ? (
            <p className="text-rose-500 text-center py-4">Failed to load invoice details.</p>
          ) : (
            <div className="space-y-6 py-4">
              {/* Customer Details metadata */}
              <div className="grid grid-cols-2 gap-4 bg-secondary/40 p-4 rounded-xl border border-border/50 text-sm">
                <div>
                  <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Bill To</h4>
                  <p className="font-bold text-foreground">{invoiceDetails.customerName}</p>
                  {invoiceDetails.customerPhone && <p className="text-muted-foreground font-mono">{invoiceDetails.customerPhone}</p>}
                </div>
                <div className="text-right">
                  <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Details</h4>
                  <p className="text-muted-foreground">Date: {new Date(invoiceDetails.createdAt).toLocaleDateString()}</p>
                  <p className="text-muted-foreground">Cashier: {invoiceDetails.creator.firstName} {invoiceDetails.creator.lastName}</p>
                </div>
              </div>

              {/* Items list */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Line Items</h4>
                <div className="border border-border rounded-lg overflow-hidden">
                  <Table>
                    <TableHeader className="bg-secondary/20">
                      <TableRow>
                        <TableHead className="w-12 text-center">Pos</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead className="text-right">Quantity</TableHead>
                        <TableHead className="text-right">Price</TableHead>
                        <TableHead className="text-right">Line Total</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {invoiceDetails.items.map((item) => (
                        <TableRow key={item.id} className="font-mono text-xs">
                          <TableCell className="text-center">{item.position}</TableCell>
                          <TableCell className="font-sans font-medium text-foreground">{item.description}</TableCell>
                          <TableCell className="text-right">{Number(item.quantity).toFixed(2)}</TableCell>
                          <TableCell className="text-right">₦{Number(item.unitPrice).toFixed(2)}</TableCell>
                          <TableCell className="text-right font-bold text-foreground">₦{Number(item.totalPrice).toFixed(2)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>

              {/* Summary and notes layout */}
              <div className="grid md:grid-cols-2 gap-6 pt-2">
                <div>
                  {invoiceDetails.notes && (
                    <div className="space-y-1">
                      <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Cashier Notes</h4>
                      <p className="text-sm bg-secondary/35 p-3 rounded-lg border border-border/40 text-muted-foreground italic">
                        {invoiceDetails.notes}
                      </p>
                    </div>
                  )}
                </div>
                <div className="space-y-2 text-sm font-mono border border-border p-4 rounded-xl bg-secondary/15">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Subtotal:</span>
                    <span>₦{Number(invoiceDetails.subtotal).toFixed(2)}</span>
                  </div>
                  {invoiceDetails.charges.map((charge) => (
                    <div key={charge.id} className="flex justify-between text-xs">
                      <span className="text-muted-foreground uppercase">{charge.name}:</span>
                      <span className={charge.amount < 0 ? 'text-emerald-500' : ''}>
                        {charge.amount < 0 ? '-' : ''}₦{Math.abs(Number(charge.amount)).toFixed(2)}
                      </span>
                    </div>
                  ))}
                  <div className="flex justify-between border-t border-border pt-2 text-base font-bold text-foreground">
                    <span>Grand Total:</span>
                    <span>₦{Number(invoiceDetails.total).toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex flex-wrap justify-between items-center pt-4 border-t border-border gap-3">
                {/* Print Exporters */}
                <div className="flex gap-2">
                  <Button
                    onClick={() => handleExport(invoiceDetails.id, 'pdf', invoiceDetails.invoiceNumber)}
                    variant="outline"
                    size="sm"
                    className="space-x-1 font-semibold"
                  >
                    <Printer className="h-4 w-4" />
                    <span>PDF</span>
                  </Button>
                  <Button
                    onClick={() => handleExport(invoiceDetails.id, 'excel', invoiceDetails.invoiceNumber)}
                    variant="outline"
                    size="sm"
                    className="space-x-1 font-semibold"
                  >
                    <FileSpreadsheet className="h-4 w-4" />
                    <span>CSV</span>
                  </Button>
                  <Button
                    onClick={() => handleExport(invoiceDetails.id, 'image', invoiceDetails.invoiceNumber)}
                    variant="outline"
                    size="sm"
                    className="space-x-1 font-semibold"
                  >
                    <FileDown className="h-4 w-4" />
                    <span>SVG</span>
                  </Button>
                </div>

                {/* Operations modifiers */}
                <div className="flex gap-2">
                  {/* Edit Draft */}
                  {invoiceDetails.status === 'DRAFT' && (
                    <Link href={`/invoices/${invoiceDetails.id}`}>
                      <Button size="sm" className="space-x-1 bg-zinc-800 hover:bg-zinc-700 text-white font-semibold">
                        <Edit className="h-4 w-4" />
                        <span>Edit Draft</span>
                      </Button>
                    </Link>
                  )}

                  {/* Request approvals for Apprentice if finalized */}
                  {invoiceDetails.status === 'FINALIZED' && !isAdmin && (
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => {
                          const reason = prompt('Please state your reasoning for editing this finalized invoice:');
                          if (reason) {
                            apiClient
                              .post('/api/approvals', {
                                invoiceId: invoiceDetails.id,
                                type: 'EDIT',
                                reason,
                              })
                              .then(() => alert('Edit authorization ticket requested successfully'))
                              .catch((err) => alert(err.response?.data?.error?.message || 'Failed to request ticket'));
                          }
                        }}
                        className="space-x-1 font-semibold"
                      >
                        <Lock className="h-4 w-4 text-amber-500" />
                        <span>Request Edit Approval</span>
                      </Button>
                    </div>
                  )}

                  {/* Direct Admin Edit/Delete */}
                  {isAdmin && (
                    <>
                      <Link href={`/invoices/${invoiceDetails.id}`}>
                        <Button size="sm" className="space-x-1 bg-zinc-800 hover:bg-zinc-700 text-white font-semibold">
                          <Edit className="h-4 w-4" />
                          <span>Modify Invoice</span>
                        </Button>
                      </Link>
                      <Button
                        onClick={() => handleDelete(invoiceDetails.id)}
                        variant="destructive"
                        size="sm"
                        className="space-x-1 font-semibold"
                      >
                        <Trash2 className="h-4 w-4" />
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
