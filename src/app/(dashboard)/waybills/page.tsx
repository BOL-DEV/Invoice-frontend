'use client';

import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { waybillService } from '../../../services/waybill.service';
import { Waybill, WaybillStatus } from '../../../types/api';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../../components/ui/table';
import { Card } from '../../../components/ui/card';
import { Badge } from '../../../components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../../../components/ui/dialog';
import { Skeleton } from '../../../components/ui/skeleton';
import { useModal } from '../../../components/ui/modal-provider';
import { ResponsiveActionMenu } from '../../../components/ui/responsive-action-menu';
import {
  Truck,
  Search,
  Printer,
  Eye,
  ChevronLeft,
  ChevronRight,
  FileText,
  Calendar,
  User,
  Phone,
  CheckCircle2,
  Clock,
  Trash2,
  Loader2,
  FileDown,
} from 'lucide-react';
import { printDocumentPDF, downloadDocumentPDF } from '../../../lib/document-download';
import { useAuth } from '../../../features/auth/context/AuthContext';
import { useSubscription } from '../../../features/subscriptions/hooks/useSubscription';
import { FeatureLockedScreen } from '../../../components/shared/FeatureLockedScreen';

export default function WaybillsPage() {
  const queryClient = useQueryClient();
  const modal = useModal();
  const { user } = useAuth();
  const isSuperAdmin = user?.role === 'SUPER_ADMIN';
  const { data: subDetails, isLoading: isSubLoading } = useSubscription();

  const isStarterPlan = !isSuperAdmin && (
    subDetails?.subscription?.plan === 'STARTER' ||
    (subDetails?.capabilities && subDetails.capabilities.waybills === false)
  );

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [selectedWaybill, setSelectedWaybill] = useState<Waybill | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['waybills', page, search],
    enabled: isSuperAdmin || (!isStarterPlan && !isSubLoading),
    queryFn: () =>
      waybillService.list({
        page,
        limit: 15,
        search: search.trim() || undefined,
      }),
  });

  const waybills = data?.waybills || [];
  const pagination = data?.pagination || { total: 0, totalPages: 1, page: 1 };

  const handlePrint = async (waybillId: string) => {
    try {
      await printDocumentPDF(`/api/printing/waybill/${waybillId}/pdf`);
      queryClient.invalidateQueries({ queryKey: ['waybills'] });
    } catch {
      window.open(waybillService.getPDFUrl(waybillId), '_blank');
      queryClient.invalidateQueries({ queryKey: ['waybills'] });
    }
  };

  const handleDownload = async (wb: Waybill) => {
    try {
      await downloadDocumentPDF(`/api/printing/waybill/${wb.id}/pdf`, `waybill_${wb.waybillNumber}.pdf`);
      queryClient.invalidateQueries({ queryKey: ['waybills'] });
    } catch (err) {
      console.error('Download error:', err);
    }
  };

  const handleDelete = async (waybill: Waybill) => {
    const confirmed = await modal.confirm(
      'Delete Waybill',
      `Are you sure you want to delete waybill ${waybill.waybillNumber}? This action cannot be undone.`
    );
    if (!confirmed) return;

    try {
      await waybillService.delete(waybill.id);
      queryClient.invalidateQueries({ queryKey: ['waybills'] });
      setIsDetailOpen(false);
      modal.alert('Deleted', 'Waybill deleted successfully', 'success');
    } catch (err: any) {
      modal.alert('Error', err.response?.data?.message || 'Failed to delete waybill', 'error');
    }
  };

  const getStatusBadge = (status: WaybillStatus) => {
    if (status === 'CANCELED') {
      return (
        <Badge className="bg-red-500/10 text-red-500 border-red-500/20 text-xs font-medium">
          Canceled
        </Badge>
      );
    }
    return (
      <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 text-xs font-medium">
        Created
      </Badge>
    );
  };

  if (isStarterPlan) {
    return (
      <FeatureLockedScreen
        headerTitle="Waybills & Delivery Notes"
        headerDescription="Transport dispatch & proof-of-delivery documents originated from invoices"
        title="Waybills & Delivery Notes are Locked"
        description="Generate official dispatch consignment notes, track drivers, lorries, and delivery consignments directly from customer invoices. Available on Business and Enterprise plans."
        icon={<Truck className="h-6 w-6 text-emerald-500" />}
        featureBenefits={[
          'Generate official dispatch consignment notes directly from invoices',
          'Driver name, vehicle registration (lorry #), and phone tracking',
          'Good delivery condition acknowledgments and recipient signatures',
          'Thermal receipt and standard multi-copy delivery sheet printing',
        ]}
      />
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-start gap-3">
            <div className="p-2.5 bg-emerald-500/10 text-emerald-600 rounded-xl shrink-0 mt-0.5">
              <Truck className="h-5 w-5 sm:h-6 sm:w-6" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground leading-tight sm:leading-normal">
                Waybills & Delivery Notes
              </h1>
              <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
                Transport dispatch &amp; proof-of-delivery documents originated from invoices
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <Card className="p-4 rounded-2xl border-border bg-card shadow-sm">
        <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
          <div className="relative w-full md:max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Search by customer, waybill #, lorry #..."
              className="pl-9 h-10 rounded-xl text-sm"
            />
          </div>
          <div className="text-xs text-muted-foreground font-medium self-end md:self-center">
            {pagination.total} {pagination.total === 1 ? 'Waybill' : 'Waybills'} Recorded
          </div>
        </div>
      </Card>

      {/* Waybills Table */}
      <Card className="rounded-2xl border-border overflow-hidden bg-card shadow-sm">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-secondary/40">
              <TableRow>
                <TableHead className="font-bold text-xs">Waybill #</TableHead>
                <TableHead className="font-bold text-xs">Customer Name</TableHead>
                <TableHead className="font-bold text-xs">Invoice Ref</TableHead>
                <TableHead className="font-bold text-xs">Driver & Lorry</TableHead>
                <TableHead className="font-bold text-xs">Dispatch Date</TableHead>
                <TableHead className="font-bold text-xs">Status</TableHead>
                <TableHead className="text-right font-bold text-xs">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-28" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                    <TableCell className="text-right"><Skeleton className="h-8 w-20 ml-auto" /></TableCell>
                  </TableRow>
                ))
              ) : waybills.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-48 text-center text-muted-foreground">
                    <Truck className="h-10 w-10 mx-auto mb-2 opacity-30" />
                    <p className="font-medium text-sm">No waybills found</p>
                    <p className="text-xs text-muted-foreground/80 mt-1">
                      Waybills originate directly from invoices. Go to Invoices, click any invoice, and select &quot;Waybill&quot;.
                    </p>
                  </TableCell>
                </TableRow>
              ) : (
                waybills.map((wb) => (
                  <TableRow key={wb.id} className="hover:bg-secondary/20 transition-colors">
                    <TableCell className="font-bold text-xs text-primary">
                      {wb.waybillNumber}
                    </TableCell>
                    <TableCell className="font-medium text-xs">
                      {wb.customerName}
                    </TableCell>
                    <TableCell className="text-xs">
                      <span className="inline-flex items-center gap-1 font-mono text-[11px] bg-secondary/80 px-2 py-0.5 rounded-md border border-border">
                        <FileText className="h-3 w-3 text-muted-foreground" />
                        {wb.invoice?.invoiceNumber || 'Linked Invoice'}
                      </span>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {wb.driverName || wb.lorryNumber ? (
                        <span>
                          {wb.driverName || 'Driver'} {wb.lorryNumber ? `• ${wb.lorryNumber}` : ''}
                        </span>
                      ) : (
                        <span className="italic text-muted-foreground/60">Not specified</span>
                      )}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {new Date(wb.dispatchDate).toLocaleDateString('en-GB')}
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(wb.status)}
                    </TableCell>
                    <TableCell className="text-right">
                      <ResponsiveActionMenu
                        items={[
                          {
                            label: 'View Details',
                            icon: <Eye className="h-4 w-4" />,
                            onClick: () => {
                              setSelectedWaybill(wb);
                              setIsDetailOpen(true);
                            },
                          },
                          {
                            label: 'Download PDF',
                            icon: <FileDown className="h-4 w-4 text-emerald-500" />,
                            onClick: () => handleDownload(wb),
                          },
                          {
                            label: 'Print Waybill',
                            icon: <Printer className="h-4 w-4 text-blue-500" />,
                            onClick: () => handlePrint(wb.id),
                          },
                        ]}
                      >
                        <div className="flex items-center justify-end space-x-1.5">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedWaybill(wb);
                              setIsDetailOpen(true);
                            }}
                            className="h-8 w-8 p-0 rounded-lg cursor-pointer"
                            title="View Details"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDownload(wb)}
                            className="h-8 px-2 rounded-lg text-xs font-semibold flex items-center space-x-1 cursor-pointer hover:bg-emerald-500/10 hover:text-emerald-600 hover:border-emerald-500/30"
                            title="Download Waybill PDF"
                          >
                            <FileDown className="h-3.5 w-3.5" />
                            <span>PDF</span>
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handlePrint(wb.id)}
                            className="h-8 px-2.5 rounded-lg text-xs font-semibold flex items-center space-x-1 cursor-pointer hover:bg-emerald-500/10 hover:text-emerald-600 hover:border-emerald-500/30"
                            title="Print Waybill PDF"
                          >
                            <Printer className="h-3.5 w-3.5" />
                            <span>Print</span>
                          </Button>
                        </div>
                      </ResponsiveActionMenu>
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

      {/* Waybill Details Dialog */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="w-[96vw] max-w-2xl max-h-[85vh] overflow-y-auto p-5 rounded-2xl">
          {selectedWaybill && (
            <div className="space-y-4">
              <DialogHeader className="border-b border-border/80 pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="p-2 bg-emerald-500/10 text-emerald-600 rounded-xl">
                      <Truck className="h-5 w-5" />
                    </div>
                    <div>
                      <DialogTitle className="text-lg font-bold">Waybill #{selectedWaybill.waybillNumber}</DialogTitle>
                      <DialogDescription className="text-xs text-muted-foreground">
                        Originated from Invoice #{selectedWaybill.invoice?.invoiceNumber}
                      </DialogDescription>
                    </div>
                  </div>
                  <div>{getStatusBadge(selectedWaybill.status)}</div>
                </div>
              </DialogHeader>

              {/* Delivery Meta Grid */}
              <div className="grid grid-cols-2 gap-3 text-xs bg-secondary/30 p-3 rounded-xl border border-border/70">
                <div>
                  <span className="text-muted-foreground block text-[11px]">Customer</span>
                  <span className="font-bold text-foreground text-sm">{selectedWaybill.customerName}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-[11px]">Dispatch Date</span>
                  <span className="font-semibold text-foreground">
                    {new Date(selectedWaybill.dispatchDate).toLocaleDateString('en-GB')}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-[11px]">Driver</span>
                  <span className="font-semibold text-foreground">
                    {selectedWaybill.driverName || 'Not specified'} {selectedWaybill.driverPhone ? `(${selectedWaybill.driverPhone})` : ''}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-[11px]">Lorry / Vehicle No.</span>
                  <span className="font-semibold text-foreground">{selectedWaybill.lorryNumber || 'Not specified'}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-[11px]">Delivered By</span>
                  <span className="font-semibold text-foreground">{selectedWaybill.deliveredBy || 'Not specified'}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-[11px]">LPO Number</span>
                  <span className="font-semibold text-foreground">{selectedWaybill.lpoNumber || 'N/A'}</span>
                </div>
                {selectedWaybill.deliveryAddress && (
                  <div className="col-span-2">
                    <span className="text-muted-foreground block text-[11px]">Delivery Address</span>
                    <span className="font-semibold text-foreground">{selectedWaybill.deliveryAddress}</span>
                  </div>
                )}
              </div>

              {/* Items Table */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">
                  Dispatched Items (Proof of Delivery)
                </h4>
                <div className="border border-border rounded-xl overflow-hidden divide-y divide-border">
                  {selectedWaybill.items.map((it, idx) => (
                    <div key={idx} className="p-2.5 flex items-center justify-between text-xs bg-card">
                      <span className="font-medium text-foreground">{it.description}</span>
                      <span className="font-bold text-foreground bg-secondary/80 px-2 py-0.5 rounded-md">
                        {Number(it.quantity)} {it.unit || ''}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {selectedWaybill.notes && (
                <div className="text-xs bg-secondary/20 p-2.5 rounded-xl border border-border">
                  <span className="text-muted-foreground font-semibold block mb-0.5">Notes:</span>
                  <p className="text-foreground">{selectedWaybill.notes}</p>
                </div>
              )}

              {/* Footer Actions */}
              <div className="border-t border-border/80 pt-3 flex items-center justify-between">
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleDelete(selectedWaybill)}
                  className="rounded-xl h-9 text-xs cursor-pointer"
                >
                  <Trash2 className="h-3.5 w-3.5 mr-1" />
                  <span>Delete Waybill</span>
                </Button>
                <div className="flex items-center space-x-2">
                  <Button variant="outline" size="sm" onClick={() => setIsDetailOpen(false)} className="rounded-xl h-9 text-xs">
                    Close
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDownload(selectedWaybill)}
                    className="rounded-xl h-9 text-xs cursor-pointer hover:bg-emerald-500/10 hover:text-emerald-600"
                  >
                    <FileDown className="h-3.5 w-3.5 mr-1.5" />
                    <span>Download</span>
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => handlePrint(selectedWaybill.id)}
                    className="rounded-xl h-9 text-xs bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer"
                  >
                    <Printer className="h-3.5 w-3.5 mr-1.5" />
                    <span>Print</span>
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
