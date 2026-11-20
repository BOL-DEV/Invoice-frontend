'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { letterService } from '../../../services/letter.service';
import { Letter, LetterStatus } from '../../../types/api';
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
  Mail,
  Plus,
  Search,
  Printer,
  Eye,
  ChevronLeft,
  ChevronRight,
  Trash2,
  Calendar,
  User,
  FileText,
  FileDown,
} from 'lucide-react';
import { downloadDocumentPDF, printDocumentPDF, formatDocumentFilename } from '../../../lib/document-download';
import { cn } from '../../../lib/utils';
import { useAuth } from '../../../features/auth/context/AuthContext';
import { useBusinessSettings } from '../../../features/business/hooks/useBusinessSettings';
import { useSubscription } from '../../../features/subscriptions/hooks/useSubscription';
import { FeatureLockedScreen } from '../../../components/shared/FeatureLockedScreen';

export default function LettersPage() {
  const queryClient = useQueryClient();
  const modal = useModal();
  const { user } = useAuth();
  const { data: businessSettings } = useBusinessSettings();
  const isSuperAdmin = user?.role === 'SUPER_ADMIN';
  const { data: subDetails, isLoading: isSubLoading } = useSubscription();

  const isStarterPlan = !isSuperAdmin && (
    subDetails?.subscription?.plan === 'STARTER' ||
    (subDetails?.capabilities && subDetails.capabilities.letters === false)
  );

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [selectedLetter, setSelectedLetter] = useState<Letter | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['letters', page, search, statusFilter],
    enabled: isSuperAdmin || (!isStarterPlan && !isSubLoading),
    queryFn: () =>
      letterService.list({
        page,
        limit: 15,
        search: search.trim() || undefined,
        status: statusFilter !== 'ALL' ? (statusFilter as LetterStatus) : undefined,
      }),
  });

  const letters = data?.letters || [];
  const pagination = data?.pagination || { total: 0, totalPages: 1, page: 1 };

  const handlePrint = async (letterId: string) => {
    try {
      await printDocumentPDF(`/api/printing/letter/${letterId}/pdf`);
      queryClient.invalidateQueries({ queryKey: ['letters'] });
    } catch (err) {
      console.error('Print error:', err);
    }
  };

  const handleDownload = async (letter: Letter) => {
    try {
      const filename = formatDocumentFilename(businessSettings?.businessName, 'Letter', letter.letterNumber);
      await downloadDocumentPDF(
        `/api/printing/letter/${letter.id}/pdf`,
        filename
      );
      queryClient.invalidateQueries({ queryKey: ['letters'] });
    } catch (err: any) {
      modal.alert('Download Failed', err.message || 'Failed to download letter PDF', 'error');
    }
  };

  const handleDelete = async (letter: Letter) => {
    const confirmed = await modal.confirm(
      'Delete Letter',
      `Are you sure you want to delete letter "${letter.title}" (${letter.letterNumber})?`
    );
    if (!confirmed) return;

    try {
      await letterService.delete(letter.id);
      queryClient.invalidateQueries({ queryKey: ['letters'] });
      setIsDetailOpen(false);
      modal.alert('Deleted', 'Letter deleted successfully', 'success');
    } catch (err: any) {
      modal.alert('Error', err.response?.data?.message || 'Failed to delete letter', 'error');
    }
  };

  const getStatusBadge = (status: LetterStatus) => {
    switch (status) {
      case 'FINALIZED':
        return <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 text-xs font-semibold">Finalized</Badge>;
      case 'DRAFT':
        return <Badge variant="outline" className="text-xs font-semibold">Draft</Badge>;
      case 'ARCHIVED':
        return <Badge className="bg-muted text-muted-foreground text-xs font-semibold">Archived</Badge>;
      default:
        return <Badge variant="outline" className="text-xs">{status}</Badge>;
    }
  };

  if (isStarterPlan) {
    return (
      <FeatureLockedScreen
        headerTitle="Official Letters & Correspondence"
        headerDescription="Draft formal business letters formatted directly onto your organization letterhead"
        title="Official Letters & Correspondence is Locked"
        description="Draft, format, store, and export formal business correspondence, executive memos, and official notices directly on your branded company letterhead. Available on Business and Enterprise plans."
        icon={<Mail className="h-6 w-6 text-indigo-500" />}
        featureBenefits={[
          'Draft executive business letters on automated branded letterhead',
          'Formatted Our Ref, Your Ref, date stamps, and signatory titles',
          'Rich WYSIWYG text editor with bullet lists and formatting controls',
          'Instant high-resolution PDF generation and direct thermal/A4 printing',
        ]}
      />
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="p-2.5 bg-indigo-500/10 text-indigo-600 rounded-xl shrink-0 mt-0.5">
            <Mail className="h-5 w-5 sm:h-6 sm:w-6" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground leading-tight sm:leading-normal">
              Official Letters & Correspondence
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
              Draft formal business letters formatted directly onto your organization letterhead
            </p>
          </div>
        </div>

        <Link href="/letters/new" className="w-full sm:w-auto">
          <Button className="w-full sm:w-auto rounded-xl font-semibold bg-primary text-primary-foreground shadow-sm hover:opacity-90 cursor-pointer">
            <Plus className="h-4 w-4 mr-1.5" />
            <span>Compose Letter</span>
          </Button>
        </Link>
      </div>

      {/* Filter and Search Bar */}
      <Card className="p-4 rounded-2xl border-border bg-card shadow-sm">
        <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto flex-1">
            <div className="relative w-full sm:max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                placeholder="Search by title, ref #, recipient..."
                className="pl-9 h-10 rounded-xl text-sm"
              />
            </div>

            {/* Total letters indicator */}
            <div className="flex items-center gap-2 px-3 py-2 sm:py-1.5 rounded-xl bg-secondary/60 border border-border/60 text-xs font-semibold text-muted-foreground shrink-0 self-start sm:self-auto">
              <FileText className="h-3.5 w-3.5 text-indigo-500" />
              <span>
                <span className="text-foreground font-bold">{data?.counts?.all ?? pagination.total}</span> {((data?.counts?.all ?? pagination.total) === 1) ? 'Letter' : 'Letters'} Created
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
            {[
              { id: 'ALL', label: 'All', count: data?.counts?.all ?? pagination.total },
              { id: 'DRAFT', label: 'Draft', count: data?.counts?.draft ?? 0 },
              { id: 'FINALIZED', label: 'Finalized', count: data?.counts?.finalized ?? 0 },
            ].map((tab) => (
              <Button
                key={tab.id}
                size="sm"
                variant={statusFilter === tab.id ? 'default' : 'outline'}
                onClick={() => {
                  setStatusFilter(tab.id);
                  setPage(1);
                }}
                className="rounded-xl text-xs font-semibold h-8 cursor-pointer flex items-center space-x-1.5 shrink-0"
              >
                <span>{tab.label}</span>
                <span
                  className={cn(
                    'px-1.5 py-0.5 rounded-full text-[10px] font-bold',
                    statusFilter === tab.id
                      ? 'bg-primary-foreground/20 text-primary-foreground'
                      : 'bg-muted text-muted-foreground'
                  )}
                >
                  {tab.count}
                </span>
              </Button>
            ))}
          </div>
        </div>
      </Card>

      {/* Letters Table */}
      <Card className="rounded-2xl border-border overflow-hidden bg-card shadow-sm">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-secondary/40">
              <TableRow>
                <TableHead className="font-bold text-xs">Letter #</TableHead>
                <TableHead className="font-bold text-xs">Subject / Title</TableHead>
                <TableHead className="font-bold text-xs">Recipient</TableHead>
                <TableHead className="font-bold text-xs">Our Ref</TableHead>
                <TableHead className="font-bold text-xs">Date</TableHead>
                <TableHead className="font-bold text-xs">Status</TableHead>
                <TableHead className="text-right font-bold text-xs">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-48" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                    <TableCell className="text-right"><Skeleton className="h-8 w-20 ml-auto" /></TableCell>
                  </TableRow>
                ))
              ) : letters.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-48 text-center text-muted-foreground">
                    <Mail className="h-10 w-10 mx-auto mb-2 opacity-30" />
                    <p className="font-medium text-sm">No official letters composed yet</p>
                    <p className="text-xs text-muted-foreground/80 mt-1">
                      Click &quot;Compose Letter&quot; above to type a document in the letterhead environment.
                    </p>
                  </TableCell>
                </TableRow>
              ) : (
                letters.map((ltr) => (
                  <TableRow key={ltr.id} className="hover:bg-secondary/20 transition-colors">
                    <TableCell className="font-bold text-xs text-primary">
                      {ltr.letterNumber}
                    </TableCell>
                    <TableCell className="text-xs font-semibold text-foreground max-w-xs truncate">
                      {ltr.title}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {ltr.recipientName || 'Unspecified'}
                    </TableCell>
                    <TableCell className="text-xs font-mono text-[11px] text-muted-foreground">
                      {ltr.ourRef || '-'}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {new Date(ltr.date).toLocaleDateString('en-GB')}
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(ltr.status)}
                    </TableCell>
                    <TableCell className="text-right">
                      <ResponsiveActionMenu
                        items={[
                          {
                            label: 'View Letter',
                            icon: <Eye className="h-4 w-4" />,
                            onClick: () => {
                              setSelectedLetter(ltr);
                              setIsDetailOpen(true);
                            },
                          },
                          {
                            label: 'Download PDF',
                            icon: <FileDown className="h-4 w-4 text-emerald-500" />,
                            onClick: () => handleDownload(ltr),
                          },
                          {
                            label: 'Print on Letterhead',
                            icon: <Printer className="h-4 w-4 text-indigo-500" />,
                            onClick: () => handlePrint(ltr.id),
                          },
                        ]}
                      >
                        <div className="flex items-center justify-end space-x-1.5">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedLetter(ltr);
                              setIsDetailOpen(true);
                            }}
                            className="h-8 w-8 p-0 rounded-lg cursor-pointer"
                            title="View Letter"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDownload(ltr)}
                            className="h-8 px-2 rounded-lg text-xs font-semibold flex items-center space-x-1 cursor-pointer hover:bg-emerald-500/10 hover:text-emerald-600"
                            title="Download Official Letter PDF"
                          >
                            <FileDown className="h-3.5 w-3.5" />
                            <span>PDF</span>
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handlePrint(ltr.id)}
                            className="h-8 px-2.5 rounded-lg text-xs font-semibold flex items-center space-x-1 cursor-pointer hover:bg-indigo-500/10 hover:text-indigo-600"
                            title="Print on Letterhead"
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

      {/* Letter Details / Preview Dialog */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="w-[96vw] max-w-3xl max-h-[85vh] overflow-y-auto p-5 rounded-2xl">
          {selectedLetter && (
            <div className="space-y-4">
              <DialogHeader className="border-b border-border/80 pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="p-2 bg-indigo-500/10 text-indigo-600 rounded-xl">
                      <Mail className="h-5 w-5" />
                    </div>
                    <div>
                      <DialogTitle className="text-lg font-bold">{selectedLetter.title}</DialogTitle>
                      <DialogDescription className="text-xs text-muted-foreground">
                        Document #{selectedLetter.letterNumber} • {new Date(selectedLetter.date).toLocaleDateString('en-GB')}
                      </DialogDescription>
                    </div>
                  </div>
                  <div>{getStatusBadge(selectedLetter.status)}</div>
                </div>
              </DialogHeader>

              {/* References Sub-bar */}
              <div className="grid grid-cols-3 gap-2 bg-secondary/30 p-2.5 rounded-xl text-xs border border-border/70">
                <div>
                  <span className="text-muted-foreground text-[11px] block">Our Ref:</span>
                  <span className="font-semibold text-foreground">{selectedLetter.ourRef || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-muted-foreground text-[11px] block">Your Ref:</span>
                  <span className="font-semibold text-foreground">{selectedLetter.yourRef || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-muted-foreground text-[11px] block">Recipient:</span>
                  <span className="font-semibold text-foreground">{selectedLetter.recipientName || 'N/A'}</span>
                </div>
              </div>

              {/* Letter Preview Sheet Box */}
              <div className="p-6 bg-card border border-border rounded-xl shadow-inner space-y-4 text-xs leading-relaxed font-serif">
                {selectedLetter.recipientAddress && (
                  <div className="text-muted-foreground whitespace-pre-line font-sans text-xs">
                    {selectedLetter.recipientAddress}
                  </div>
                )}
                <div className="font-bold text-sm uppercase text-foreground border-b border-border pb-1">
                  RE: {selectedLetter.title}
                </div>
                <div className="text-foreground whitespace-pre-line text-sm leading-6">
                  {selectedLetter.body}
                </div>
                <div className="pt-4 space-y-1 font-sans text-xs">
                  <div className="text-muted-foreground">Yours faithfully,</div>
                  <div className="font-bold text-foreground text-sm pt-4">
                    {selectedLetter.signatoryName || `${selectedLetter.creator?.firstName || ''} ${selectedLetter.creator?.lastName || ''}`.trim()}
                  </div>
                  {selectedLetter.signatoryTitle && (
                    <div className="text-muted-foreground italic">{selectedLetter.signatoryTitle}</div>
                  )}
                </div>
              </div>

              {/* Footer Actions */}
              <div className="border-t border-border/80 pt-3 flex items-center justify-between">
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleDelete(selectedLetter)}
                  className="rounded-xl h-9 text-xs cursor-pointer"
                >
                  <Trash2 className="h-3.5 w-3.5 mr-1" />
                  <span>Delete</span>
                </Button>
                <div className="flex items-center space-x-2">
                  <Button variant="outline" size="sm" onClick={() => setIsDetailOpen(false)} className="rounded-xl h-9 text-xs">
                    Close
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => handlePrint(selectedLetter.id)}
                    className="rounded-xl h-9 text-xs bg-indigo-600 hover:bg-indigo-700 text-white cursor-pointer"
                  >
                    <Printer className="h-3.5 w-3.5 mr-1.5" />
                    <span>Print Letterhead PDF</span>
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
