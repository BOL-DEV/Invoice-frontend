'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { quotationService } from '../../../services/quotation.service';
import { Quotation, QuotationStatus } from '../../../types/api';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../../components/ui/table';
import { Card } from '../../../components/ui/card';
import { Badge } from '../../../components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../../../components/ui/dialog';
import { Skeleton } from '../../../components/ui/skeleton';
import { useModal } from '../../../components/ui/modal-provider';
import {
  FileSpreadsheet,
  Plus,
  Search,
  Printer,
  Eye,
  ChevronLeft,
  ChevronRight,
  ArrowRightCircle,
  FileCheck2,
  Trash2,
  Loader2,
  Calendar,
  User,
  ExternalLink,
  Send,
  Pencil,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { downloadDocumentPDF, printDocumentPDF } from '../../../lib/document-download';

export default function QuotationsPage() {
  const queryClient = useQueryClient();
  const router = useRouter();
  const modal = useModal();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [selectedQuotation, setSelectedQuotation] = useState<Quotation | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isConverting, setIsConverting] = useState(false);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['quotations', page, search, statusFilter],
    queryFn: () =>
      quotationService.list({
        page,
        limit: 15,
        search: search.trim() || undefined,
        status: statusFilter !== 'ALL' ? (statusFilter as QuotationStatus) : undefined,
      }),
  });

  const quotations = data?.quotations || [];
  const pagination = data?.pagination || { total: 0, totalPages: 1, page: 1 };

  const handlePrint = async (quotationId: string) => {
    try {
      await printDocumentPDF(`/api/printing/quotation/${quotationId}/pdf`);
    } catch (err) {
      console.error('Print error:', err);
    }
  };

  const handleConvert = (quotation: Quotation) => {
    if (quotation.status === 'CONVERTED') {
      modal.alert('Already Converted', `This quotation has already been converted to Invoice #${quotation.convertedInvoice?.invoiceNumber || ''}.`, 'info');
      return;
    }

    // Map quotation items to invoice item schema
    const mappedItems = (quotation.items || []).map((it, idx) => ({
      id: `quo_${idx}_${Date.now()}`,
      description: it.description || '',
      quantity: Number(it.quantity) || 0,
      unitPrice: Number(it.unitPrice) || 0,
      totalPrice: Number(it.totalPrice) || (Number(it.quantity) * Number(it.unitPrice)),
    }));

    while (mappedItems.length < 3) {
      mappedItems.push({
        id: `empty_${mappedItems.length}_${Date.now()}`,
        description: '',
        quantity: 0,
        unitPrice: 0,
        totalPrice: 0,
      });
    }

    const draft = {
      customerName: quotation.customerName || '',
      customerPhone: quotation.customerPhone || '',
      notes: quotation.notes || '',
      customerSignature: quotation.customerSignature || '',
      items: mappedItems,
      charges: [],
      fromQuotationId: quotation.id,
      fromQuotationNumber: quotation.quotationNumber,
    };

    try {
      localStorage.setItem('invoice_creation_draft', JSON.stringify(draft));
    } catch (e) {
      console.error('Failed to set invoice draft from quotation', e);
    }

    setIsDetailOpen(false);
    router.push(`/invoices/create?fromQuotation=${quotation.id}`);
  };

  const handleDelete = async (quotation: Quotation) => {
    if (quotation.status === 'CONVERTED') {
      modal.alert('Cannot Delete', 'Converted quotations cannot be deleted.', 'warning');
      return;
    }

    const confirmed = await modal.confirm(
      'Delete Quotation',
      `Are you sure you want to delete quotation ${quotation.quotationNumber}?`
    );
    if (!confirmed) return;

    try {
      await quotationService.delete(quotation.id);
      queryClient.invalidateQueries({ queryKey: ['quotations'] });
      setIsDetailOpen(false);
      modal.alert('Deleted', 'Quotation deleted successfully', 'success');
    } catch (err: any) {
      modal.alert('Error', err.response?.data?.message || 'Failed to delete quotation', 'error');
    }
  };

  const handleUpdateStatus = async (quotationId: string, newStatus: QuotationStatus) => {
    try {
      await quotationService.update(quotationId, { status: newStatus });
      queryClient.invalidateQueries({ queryKey: ['quotations'] });
      if (selectedQuotation && selectedQuotation.id === quotationId) {
        setSelectedQuotation({ ...selectedQuotation, status: newStatus });
      }
    } catch (err: any) {
      modal.alert('Status Update Failed', err.response?.data?.message || 'Failed to update quotation status', 'error');
    }
  };

  const getStatusBadge = (status: QuotationStatus) => {
    switch (status) {
      case 'CONVERTED':
        return <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 text-xs font-semibold">Converted</Badge>;
      case 'SENT':
        return <Badge className="bg-blue-500/10 text-blue-600 border-blue-500/20 text-xs font-semibold">Sent</Badge>;
      case 'EXPIRED':
        return <Badge className="bg-amber-500/10 text-amber-600 border-amber-500/20 text-xs font-semibold">Expired</Badge>;
      case 'DRAFT':
      default:
        return <Badge variant="outline" className="text-xs font-semibold">Draft</Badge>;
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-2.5">
          <div className="p-2 bg-blue-500/10 text-blue-600 rounded-xl">
            <FileSpreadsheet className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">Quotations & Estimates</h1>
            <p className="text-sm text-muted-foreground">
              Prepare price quotes for prospective clients with 1-click conversion to invoice
            </p>
          </div>
        </div>

        <Link href="/quotations/new">
          <Button className="rounded-xl font-semibold bg-primary text-primary-foreground shadow-sm hover:opacity-90 cursor-pointer">
            <Plus className="h-4 w-4 mr-1.5" />
            <span>New Quotation</span>
          </Button>
        </Link>
      </div>

      {/* Filter and Search Bar */}
      <Card className="p-4 rounded-2xl border-border bg-card shadow-sm">
        <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Search by customer, quotation #, phone..."
              className="pl-9 h-10 rounded-xl text-sm"
            />
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
            {['ALL', 'DRAFT', 'SENT', 'CONVERTED', 'EXPIRED'].map((st) => (
              <Button
                key={st}
                size="sm"
                variant={statusFilter === st ? 'default' : 'outline'}
                onClick={() => {
                  setStatusFilter(st);
                  setPage(1);
                }}
                className="rounded-xl text-xs font-semibold h-8 cursor-pointer"
              >
                {st === 'ALL' ? 'All' : st.charAt(0) + st.slice(1).toLowerCase()}
              </Button>
            ))}
          </div>
        </div>
      </Card>

      {/* Quotations Table */}
      <Card className="rounded-2xl border-border overflow-hidden bg-card shadow-sm">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-secondary/40">
              <TableRow>
                <TableHead className="font-bold text-xs">Quotation #</TableHead>
                <TableHead className="font-bold text-xs">Customer</TableHead>
                <TableHead className="font-bold text-xs">Total Amount (₦)</TableHead>
                <TableHead className="font-bold text-xs">Date</TableHead>
                <TableHead className="font-bold text-xs">Valid Until</TableHead>
                <TableHead className="font-bold text-xs">Status</TableHead>
                <TableHead className="text-right font-bold text-xs">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-36" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-28" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                    <TableCell className="text-right"><Skeleton className="h-8 w-24 ml-auto" /></TableCell>
                  </TableRow>
                ))
              ) : quotations.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-48 text-center text-muted-foreground">
                    <FileSpreadsheet className="h-10 w-10 mx-auto mb-2 opacity-30" />
                    <p className="font-medium text-sm">No quotations found</p>
                    <p className="text-xs text-muted-foreground/80 mt-1">
                      Click &quot;New Quotation&quot; above to create your first price estimate.
                    </p>
                  </TableCell>
                </TableRow>
              ) : (
                quotations.map((quo) => (
                  <TableRow key={quo.id} className="hover:bg-secondary/20 transition-colors">
                    <TableCell className="font-bold text-xs text-primary">
                      {quo.quotationNumber}
                    </TableCell>
                    <TableCell className="text-xs">
                      <div className="font-semibold text-foreground">{quo.customerName}</div>
                      {quo.customerPhone && <div className="text-[11px] text-muted-foreground">{quo.customerPhone}</div>}
                    </TableCell>
                    <TableCell className="font-bold text-xs text-foreground">
                      ₦{Number(quo.total).toLocaleString('en-NG', { minimumFractionDigits: 2 })}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {new Date(quo.createdAt).toLocaleDateString('en-GB')}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {quo.validUntil ? new Date(quo.validUntil).toLocaleDateString('en-GB') : 'Open'}
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(quo.status)}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end space-x-1.5">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedQuotation(quo);
                            setIsDetailOpen(true);
                          }}
                          className="h-8 w-8 p-0 rounded-lg cursor-pointer hover:bg-secondary"
                          title="View Details"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>

                        {(quo.status === 'DRAFT' || quo.status === 'SENT') && (
                          <>
                            <Link href={`/quotations/new?edit=${quo.id}`}>
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-8 px-2.5 rounded-lg text-xs font-semibold flex items-center space-x-1 cursor-pointer hover:bg-secondary"
                                title="Edit Quotation"
                              >
                                <Pencil className="h-3.5 w-3.5" />
                                <span>Edit</span>
                              </Button>
                            </Link>

                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handlePrint(quo.id)}
                              className="h-8 px-2.5 rounded-lg text-xs font-semibold flex items-center space-x-1.5 cursor-pointer hover:bg-blue-500/10 hover:text-blue-600"
                              title="Print Quotation PDF"
                            >
                              <Printer className="h-3.5 w-3.5" />
                              <span>Print</span>
                            </Button>
                          </>
                        )}

                        {quo.status !== 'CONVERTED' ? (
                          <Button
                            size="sm"
                            onClick={() => handleConvert(quo)}
                            className="h-8 px-2.5 rounded-lg text-xs font-semibold flex items-center space-x-1 bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer"
                            title="Convert to Live Invoice"
                          >
                            <ArrowRightCircle className="h-3.5 w-3.5" />
                            <span>Convert</span>
                          </Button>
                        ) : (
                          <span className="text-[10px] font-bold text-emerald-600 bg-emerald-500/10 px-2 py-1 rounded-md border border-emerald-500/20">
                            Invoice #{quo.convertedInvoice?.invoiceNumber || ''}
                          </span>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="flex items-center justify-between p-4 border-t border-border">
            <span className="text-xs text-muted-foreground">
              Page {pagination.page} of {pagination.totalPages} ({pagination.total} total)
            </span>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="h-8 rounded-lg text-xs"
              >
                <ChevronLeft className="h-3.5 w-3.5 mr-1" />
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
                disabled={page >= pagination.totalPages}
                className="h-8 rounded-lg text-xs"
              >
                Next
                <ChevronRight className="h-3.5 w-3.5 ml-1" />
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* Quotation Details Dialog */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="w-[95vw] sm:max-w-3xl max-h-[90vh] overflow-y-auto p-4 sm:p-6 rounded-2xl border-border bg-card shadow-2xl">
          {selectedQuotation && (
            <div className="space-y-4">
              <DialogHeader className="border-b border-border/80 pb-3">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center space-x-2.5">
                    <div className="p-2 bg-blue-500/10 text-blue-600 rounded-xl shrink-0">
                      <FileSpreadsheet className="h-5 w-5" />
                    </div>
                    <div>
                      <DialogTitle className="text-lg font-bold">Quotation #{selectedQuotation.quotationNumber}</DialogTitle>
                      <DialogDescription className="text-xs text-muted-foreground">
                        Issued on {new Date(selectedQuotation.createdAt).toLocaleDateString('en-GB')}
                      </DialogDescription>
                    </div>
                  </div>
                  <div>{getStatusBadge(selectedQuotation.status)}</div>
                </div>
              </DialogHeader>

              {/* Converted Banner */}
              {selectedQuotation.status === 'CONVERTED' && selectedQuotation.convertedInvoice && (
                <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center justify-between text-xs text-emerald-700 dark:text-emerald-400">
                  <span className="font-semibold">
                    This quotation was converted to Invoice #{selectedQuotation.convertedInvoice.invoiceNumber}.
                  </span>
                  <Link href="/invoices" className="underline font-bold flex items-center gap-1">
                    <span>View Invoices</span>
                    <ExternalLink className="h-3 w-3" />
                  </Link>
                </div>
              )}

              {/* Meta Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs bg-secondary/30 p-3.5 rounded-xl border border-border/70">
                <div>
                  <span className="text-muted-foreground block text-[11px]">Customer</span>
                  <span className="font-bold text-foreground text-sm break-words">{selectedQuotation.customerName}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-[11px]">Customer Contact</span>
                  <span className="font-semibold text-foreground break-words">
                    {selectedQuotation.customerPhone || selectedQuotation.customerEmail || 'N/A'}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-[11px]">Valid Until</span>
                  <span className="font-semibold text-foreground">
                    {selectedQuotation.validUntil ? new Date(selectedQuotation.validUntil).toLocaleDateString('en-GB') : 'Open'}
                  </span>
                </div>
              </div>

              {/* Line Items Table */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">Quoted Items</h4>
                <div className="rounded-xl border border-border overflow-hidden">
                  <div className="overflow-x-auto">
                    <Table className="w-full min-w-[560px] text-xs">
                      <TableHeader className="bg-secondary/50">
                        <TableRow className="border-b border-border hover:bg-transparent">
                          <TableHead className="w-10 text-center font-bold text-[11px] text-muted-foreground">#</TableHead>
                          <TableHead className="min-w-[200px] font-bold text-[11px] text-muted-foreground">Description</TableHead>
                          <TableHead className="w-28 text-center font-bold text-[11px] text-muted-foreground">Qty / Metric</TableHead>
                          <TableHead className="w-32 text-right font-bold text-[11px] text-muted-foreground">Unit Price</TableHead>
                          <TableHead className="w-36 text-right font-bold text-[11px] text-muted-foreground">Total</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody className="divide-y divide-border">
                        {selectedQuotation.items.map((it, idx) => (
                          <TableRow key={idx} className="hover:bg-secondary/20 transition-colors">
                            <TableCell className="text-center text-muted-foreground font-mono text-[11px]">{idx + 1}</TableCell>
                            <TableCell className="font-semibold text-foreground break-words">{it.description}</TableCell>
                            <TableCell className="text-center text-muted-foreground whitespace-nowrap">
                              {Number(it.quantity).toLocaleString()} {it.metrics || ''}
                            </TableCell>
                            <TableCell className="text-right text-muted-foreground whitespace-nowrap font-mono">
                              ₦{Number(it.unitPrice).toLocaleString('en-NG', { minimumFractionDigits: 2 })}
                            </TableCell>
                            <TableCell className="text-right font-bold text-foreground whitespace-nowrap font-mono">
                              ₦{Number(it.totalPrice).toLocaleString('en-NG', { minimumFractionDigits: 2 })}
                            </TableCell>
                          </TableRow>
                        ))}
                        <TableRow className="bg-secondary/40 hover:bg-secondary/40 font-bold border-t-2 border-border">
                          <TableCell colSpan={3} className="text-right text-xs font-bold text-foreground">
                            Grand Total:
                          </TableCell>
                          <TableCell colSpan={2} className="text-right text-base text-primary font-bold font-mono">
                            ₦{Number(selectedQuotation.total).toLocaleString('en-NG', { minimumFractionDigits: 2 })}
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </div>
                </div>
              </div>

              {selectedQuotation.notes && (
                <div className="text-xs bg-secondary/20 p-2.5 rounded-xl border border-border">
                  <span className="text-muted-foreground font-semibold block mb-0.5">Notes:</span>
                  <p className="text-foreground">{selectedQuotation.notes}</p>
                </div>
              )}

              {/* Footer Actions */}
              <div className="border-t border-border/80 pt-4 flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
                {selectedQuotation.status !== 'CONVERTED' ? (
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDelete(selectedQuotation)}
                    className="rounded-xl h-9 text-xs cursor-pointer w-full sm:w-auto"
                  >
                    <Trash2 className="h-3.5 w-3.5 mr-1" />
                    <span>Delete</span>
                  </Button>
                ) : <div />}

                <div className="flex flex-wrap items-center justify-end gap-2">
                  <Button variant="outline" size="sm" onClick={() => setIsDetailOpen(false)} className="rounded-xl h-9 text-xs cursor-pointer">
                    Close
                  </Button>

                  {(selectedQuotation.status === 'DRAFT' || selectedQuotation.status === 'SENT') && (
                    <>
                      <Link href={`/quotations/new?edit=${selectedQuotation.id}`}>
                        <Button
                          variant="outline"
                          size="sm"
                          className="rounded-xl h-9 text-xs cursor-pointer hover:bg-secondary flex items-center space-x-1.5"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                          <span>Edit Quotation</span>
                        </Button>
                      </Link>

                      {selectedQuotation.status === 'DRAFT' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleUpdateStatus(selectedQuotation.id, 'SENT')}
                          className="rounded-xl h-9 text-xs cursor-pointer hover:bg-blue-500/10 hover:text-blue-600"
                        >
                          <Send className="h-3.5 w-3.5 mr-1.5" />
                          <span>Mark as Sent</span>
                        </Button>
                      )}
                      {selectedQuotation.status === 'SENT' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleUpdateStatus(selectedQuotation.id, 'DRAFT')}
                          className="rounded-xl h-9 text-xs cursor-pointer"
                        >
                          <span>Mark as Draft</span>
                        </Button>
                      )}

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePrint(selectedQuotation.id)}
                        className="rounded-xl h-9 text-xs cursor-pointer hover:bg-blue-500/10 hover:text-blue-600"
                      >
                        <Printer className="h-3.5 w-3.5 mr-1.5" />
                        <span>Print PDF</span>
                      </Button>

                      <Button
                        size="sm"
                        onClick={() => handleConvert(selectedQuotation)}
                        disabled={isConverting}
                        className="rounded-xl h-9 text-xs bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer"
                      >
                        {isConverting ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />
                        ) : (
                          <ArrowRightCircle className="h-3.5 w-3.5 mr-1.5" />
                        )}
                        <span>Convert to Invoice</span>
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
