'use client';

import React, { useState, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../../../components/ui/dialog';
import { Button } from '../../../components/ui/button';
import { Badge } from '../../../components/ui/badge';
import { Input } from '../../../components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../../components/ui/table';
import { apiClient } from '../../../services/api/axios';
import { AxiosErrorLike, ExtractedInvoiceData, ExtractedItem } from '../../../types/api';
import {
  UploadCloud,
  FileSpreadsheet,
  FileText,
  Image as ImageIcon,
  Sparkles,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Plus,
  Trash2,
  Check,
  User,
  Phone,
  RefreshCw,
} from 'lucide-react';

interface DocumentImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: (data: ExtractedInvoiceData) => void;
  hasExistingItems: boolean;
}

export const DocumentImportModal: React.FC<DocumentImportModalProps> = ({
  isOpen,
  onClose,
  onApply,
  hasExistingItems,
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [statusText, setStatusText] = useState('');
  const [extractedData, setExtractedData] = useState<ExtractedInvoiceData | null>(null);
  const [selectedItemIndices, setSelectedItemIndices] = useState<Set<number>>(new Set());
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const resetState = () => {
    setFile(null);
    setFilePreview(null);
    setIsProcessing(false);
    setStatusText('');
    setExtractedData(null);
    setSelectedItemIndices(new Set());
    setErrorMsg(null);
  };

  const handleClose = () => {
    resetState();
    onClose();
  };

  const handleFileSelect = (selectedFile: File) => {
    resetState();
    setFile(selectedFile);

    if (selectedFile.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => setFilePreview(e.target?.result as string);
      reader.readAsDataURL(selectedFile);
    }

    processFile(selectedFile);
  };

  const processFile = async (targetFile: File) => {
    setIsProcessing(true);
    setErrorMsg(null);

    const isExcel =
      targetFile.name.endsWith('.xlsx') ||
      targetFile.name.endsWith('.xls') ||
      targetFile.name.endsWith('.csv') ||
      targetFile.type.includes('spreadsheet') ||
      targetFile.type.includes('excel');

    if (isExcel) {
      setStatusText('Parsing spreadsheet structure & ledger columns...');
    } else if (targetFile.type === 'application/pdf' || targetFile.name.endsWith('.pdf')) {
      setStatusText('Analyzing PDF purchase order with AI Vision...');
    } else {
      setStatusText('Reading handwritten note & extracting items with AI Vision...');
    }

    try {
      const formData = new FormData();
      formData.append('file', targetFile);

      const response = await apiClient.post<{ data: ExtractedInvoiceData }>(
        '/api/invoices/extract-document',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      const data = response.data?.data;
      if (!data || !Array.isArray(data.items) || data.items.length === 0) {
        setErrorMsg('No items could be clearly identified from this document. Please check the file or enter items manually.');
        setIsProcessing(false);
        return;
      }

      setExtractedData(data);
      // Select all items by default
      setSelectedItemIndices(new Set(data.items.map((_, idx) => idx)));
    } catch (err) {
      console.error('Document extraction error:', err);
      const apiErr = err as AxiosErrorLike;
      setErrorMsg(
        apiErr.response?.data?.error?.message ||
          'Failed to extract document. Please ensure the file is clear and supported.'
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const toggleItem = (idx: number) => {
    setSelectedItemIndices((prev) => {
      const next = new Set(prev);
      if (next.has(idx)) {
        next.delete(idx);
      } else {
        next.add(idx);
      }
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (!extractedData) return;
    if (selectedItemIndices.size === extractedData.items.length) {
      setSelectedItemIndices(new Set());
    } else {
      setSelectedItemIndices(new Set(extractedData.items.map((_, idx) => idx)));
    }
  };

  const handleApply = () => {
    if (!extractedData) return;

    const chosenItems = extractedData.items.filter((_, idx) => selectedItemIndices.has(idx));
    onApply({
      ...extractedData,
      items: chosenItems,
    });
    handleClose();
  };

  const getFileIcon = (fileName: string) => {
    const name = fileName.toLowerCase();
    if (name.endsWith('.xlsx') || name.endsWith('.xls') || name.endsWith('.csv')) {
      return <FileSpreadsheet className="h-6 w-6 text-emerald-500" />;
    }
    if (name.endsWith('.pdf')) {
      return <FileText className="h-6 w-6 text-rose-500" />;
    }
    return <ImageIcon className="h-6 w-6 text-blue-500" />;
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto rounded-3xl p-6 bg-card border-border shadow-2xl">
        <DialogHeader className="space-y-1.5 pb-2 border-b border-border/80">
          <div className="flex items-center space-x-2">
            <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle className="text-base sm:text-lg font-bold text-foreground flex items-center gap-2">
                <span>Auto-Fill from Document / Jotting Note</span>
                <Badge variant="outline" className="text-[10px] font-mono border-emerald-500/30 text-emerald-500">
                  AI Powered
                </Badge>
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                Upload a photo of a handwritten jotting note, WhatsApp order screenshot, paper receipt, customer PDF, or Excel/CSV spreadsheet.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Upload Dropzone */}
        {!extractedData && !isProcessing && (
          <div className="py-4 space-y-4">
            <div
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                const dropped = e.dataTransfer.files?.[0];
                if (dropped) handleFileSelect(dropped);
              }}
              className="border-2 border-dashed border-border/80 hover:border-emerald-500/60 rounded-2xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-all hover:bg-emerald-500/5 group"
            >
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                accept=".jpg,.jpeg,.png,.webp,.pdf,.xlsx,.xls,.csv"
                onChange={(e) => {
                  const selected = e.target.files?.[0];
                  if (selected) handleFileSelect(selected);
                }}
              />
              <div className="h-14 w-14 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform shadow-sm">
                <UploadCloud className="h-7 w-7" />
              </div>
              <h3 className="font-bold text-sm text-foreground">Click to upload or drag & drop</h3>
              <p className="text-xs text-muted-foreground mt-1 max-w-sm">
                Supports Handwritten Notes, Paper Receipts, WhatsApp Screenshots, Customer PDFs, and Excel spreadsheets.
              </p>

              <div className="flex flex-wrap items-center justify-center gap-2 mt-4 text-[11px] font-mono text-muted-foreground">
                <span className="px-2 py-0.5 rounded-md bg-secondary border border-border">JPG / PNG / WEBP</span>
                <span className="px-2 py-0.5 rounded-md bg-secondary border border-border">PDF Documents</span>
                <span className="px-2 py-0.5 rounded-md bg-secondary border border-border">Excel / CSV (.xlsx)</span>
              </div>
            </div>

            {errorMsg && (
              <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-500 flex items-start space-x-2 text-xs">
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                <span>{errorMsg}</span>
              </div>
            )}
          </div>
        )}

        {/* Processing State */}
        {isProcessing && (
          <div className="py-12 flex flex-col items-center justify-center space-y-4 text-center">
            <div className="relative">
              <div className="h-16 w-16 rounded-3xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500 animate-pulse">
                <Sparkles className="h-8 w-8 animate-spin" style={{ animationDuration: '3s' }} />
              </div>
            </div>
            <div className="space-y-1">
              <h4 className="font-bold text-sm text-foreground">Processing Document</h4>
              <p className="text-xs text-muted-foreground font-mono animate-pulse">{statusText}</p>
            </div>
          </div>
        )}

        {/* Extracted Review State */}
        {extractedData && !isProcessing && (
          <div className="space-y-4 py-2">
            {/* File Info Bar */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-secondary/30 border border-border">
              <div className="flex items-center space-x-2.5">
                {file && getFileIcon(file.name)}
                <div className="text-left">
                  <p className="text-xs font-bold text-foreground truncate max-w-[240px] sm:max-w-md">
                    {file?.name}
                  </p>
                  <p className="text-[10px] text-muted-foreground">
                    {((file?.size || 0) / 1024).toFixed(1)} KB • Detected {extractedData.items.length} item(s)
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  resetState();
                  fileInputRef.current?.click();
                }}
                className="text-xs space-x-1 text-muted-foreground hover:text-foreground h-8"
              >
                <RefreshCw className="h-3 w-3" />
                <span>Change File</span>
              </Button>
            </div>

            {/* Extracted Customer Info (if detected) */}
            {(extractedData.customerName || extractedData.customerPhone) && (
              <div className="p-3.5 rounded-xl bg-emerald-500/5 border border-emerald-500/20 grid sm:grid-cols-2 gap-3 text-xs">
                {extractedData.customerName && (
                  <div className="flex items-center space-x-2">
                    <User className="h-4 w-4 text-emerald-500 shrink-0" />
                    <div>
                      <span className="text-[10px] uppercase font-bold text-muted-foreground block">Customer Name</span>
                      <span className="font-semibold text-foreground">{extractedData.customerName}</span>
                    </div>
                  </div>
                )}
                {extractedData.customerPhone && (
                  <div className="flex items-center space-x-2">
                    <Phone className="h-4 w-4 text-emerald-500 shrink-0" />
                    <div>
                      <span className="text-[10px] uppercase font-bold text-muted-foreground block">Phone</span>
                      <span className="font-semibold font-mono text-foreground">{extractedData.customerPhone}</span>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Extracted Items Table */}
            <div className="border border-border rounded-xl overflow-hidden shadow-sm">
              <div className="p-2.5 bg-secondary/30 border-b border-border flex items-center justify-between text-xs font-semibold">
                <span className="text-foreground">Line Items ({selectedItemIndices.size}/{extractedData.items.length} selected)</span>
                <button
                  type="button"
                  onClick={toggleSelectAll}
                  className="text-emerald-500 hover:text-emerald-600 text-[11px] font-bold"
                >
                  {selectedItemIndices.size === extractedData.items.length ? 'Deselect All' : 'Select All'}
                </button>
              </div>

              <div className="max-h-60 overflow-y-auto">
                <Table>
                  <TableHeader className="bg-secondary/10 text-[10px] uppercase font-bold">
                    <TableRow className="border-b border-border">
                      <TableHead className="w-10 text-center">#</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead className="w-20 text-center">Qty</TableHead>
                      <TableHead className="w-28 text-right">Unit Price (₦)</TableHead>
                      <TableHead className="w-28 text-right">Total (₦)</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody className="text-xs">
                    {extractedData.items.map((item, idx) => {
                      const isSelected = selectedItemIndices.has(idx);
                      const rowTotal = item.quantity * item.unitPrice;

                      return (
                        <TableRow
                          key={idx}
                          onClick={() => toggleItem(idx)}
                          className={`cursor-pointer transition-colors ${
                            isSelected ? 'bg-emerald-500/5' : 'opacity-50 hover:opacity-80'
                          }`}
                        >
                          <TableCell className="text-center" onClick={(e) => e.stopPropagation()}>
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => toggleItem(idx)}
                              className="rounded border-border text-emerald-500 focus:ring-emerald-500 h-4 w-4"
                            />
                          </TableCell>
                          <TableCell className="font-medium text-foreground">{item.description}</TableCell>
                          <TableCell className="text-center font-mono">{item.quantity}</TableCell>
                          <TableCell className="text-right font-mono">
                            {item.unitPrice > 0 ? item.unitPrice.toLocaleString() : '—'}
                          </TableCell>
                          <TableCell className="text-right font-mono font-semibold">
                            {rowTotal > 0 ? rowTotal.toLocaleString() : '—'}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </div>

            {/* Mode notification */}
            <p className="text-[11px] text-muted-foreground text-center">
              {hasExistingItems
                ? 'ℹ️ Existing line items will be preserved. These extracted items will be appended.'
                : 'ℹ️ These items will fill up the blank invoice ledger.'}
            </p>
          </div>
        )}

        <DialogFooter className="gap-2 sm:gap-0 pt-2 border-t border-border">
          <Button variant="outline" size="sm" onClick={handleClose} className="rounded-xl text-xs h-9">
            Cancel
          </Button>

          {extractedData && (
            <Button
              size="sm"
              disabled={selectedItemIndices.size === 0}
              onClick={handleApply}
              className="rounded-xl text-xs h-9 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold space-x-1.5 shadow-sm"
            >
              <Check className="h-4 w-4" />
              <span>
                Apply {selectedItemIndices.size} Item{selectedItemIndices.size === 1 ? '' : 's'} to Invoice
              </span>
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
