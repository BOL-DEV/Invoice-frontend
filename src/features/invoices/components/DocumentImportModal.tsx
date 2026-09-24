'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../../../components/ui/dialog';
import { Button } from '../../../components/ui/button';
import { Badge } from '../../../components/ui/badge';
import { Input } from '../../../components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../../components/ui/table';
import { apiClient } from '../../../services/api/axios';
import { getErrorMessage } from '../../../lib/api-error';
import { ExtractedInvoiceData, ExtractedItem } from '../../../types/api';
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
  Truck,
  DollarSign,
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
  const [files, setFiles] = useState<File[]>([]);
  const [savedFileNames, setSavedFileNames] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingProgress, setProcessingProgress] = useState<{ current: number; total: number; fileName: string } | null>(null);
  const [statusText, setStatusText] = useState('');
  const [extractedData, setExtractedData] = useState<ExtractedInvoiceData | null>(null);
  const [selectedItemIndices, setSelectedItemIndices] = useState<Set<number>>(new Set());
  const [selectedChargeIndices, setSelectedChargeIndices] = useState<Set<number>>(new Set());
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [warningMsg, setWarningMsg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Restore temporary extracted data if user accidentally closed the modal or refreshed
  useEffect(() => {
    if (isOpen && !extractedData) {
      try {
        const saved = localStorage.getItem('invoice_autofill_extracted_data');
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed.extractedData && Array.isArray(parsed.extractedData.items)) {
            setExtractedData(parsed.extractedData);
            setSelectedItemIndices(
              new Set(parsed.selectedItemIndices || parsed.extractedData.items.map((_: any, i: number) => i))
            );
            setSelectedChargeIndices(
              new Set(parsed.selectedChargeIndices || (parsed.extractedData.charges || []).map((_: any, i: number) => i))
            );
            if (Array.isArray(parsed.savedFileNames)) {
              setSavedFileNames(parsed.savedFileNames);
            }
          }
        }
      } catch (err) {
        console.error('Failed to load temporary autofill data:', err);
      }
    }
  }, [isOpen, extractedData]);

  const resetState = () => {
    setFiles([]);
    setSavedFileNames([]);
    setIsProcessing(false);
    setProcessingProgress(null);
    setStatusText('');
    setExtractedData(null);
    setSelectedItemIndices(new Set());
    setSelectedChargeIndices(new Set());
    setErrorMsg(null);
    setWarningMsg(null);
    try {
      localStorage.removeItem('invoice_autofill_extracted_data');
    } catch {}
  };

  const handleClose = () => {
    // Preserve extracted state in memory & localStorage so user doesn't lose scan if closed by mistake
    onClose();
  };

  const validExtensions = ['.jpg', '.jpeg', '.png', '.webp', '.pdf', '.xlsx', '.xls', '.csv'];
  const isSupportedFile = (targetFile: File) => {
    const lowerName = targetFile.name.toLowerCase();
    return (
      validExtensions.some((ext) => lowerName.endsWith(ext)) ||
      targetFile.type.startsWith('image/') ||
      targetFile.type === 'application/pdf' ||
      targetFile.type.includes('spreadsheet') ||
      targetFile.type.includes('excel') ||
      targetFile.type === 'text/csv'
    );
  };

  const compressImageClientSide = async (sourceFile: File): Promise<File> => {
    if (!sourceFile.type.startsWith('image/')) return sourceFile;
    return new Promise((resolve) => {
      const img = new Image();
      const reader = new FileReader();

      reader.onload = (e) => {
        img.src = e.target?.result as string;
      };

      img.onload = () => {
        const maxDim = 1200;
        let width = img.width;
        let height = img.height;

        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(sourceFile);
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              resolve(sourceFile);
              return;
            }
            const compressed = new File([blob], sourceFile.name.replace(/\.[^.]+$/, '.jpg'), {
              type: 'image/jpeg',
              lastModified: Date.now(),
            });
            resolve(compressed);
          },
          'image/jpeg',
          0.8
        );
      };

      img.onerror = () => resolve(sourceFile);
      reader.onerror = () => resolve(sourceFile);
      reader.readAsDataURL(sourceFile);
    });
  };

  const handleFilesSelect = (selectedFiles: File[]) => {
    if (!selectedFiles || selectedFiles.length === 0) return;
    processBatch(selectedFiles);
  };

  const processBatch = async (batchFiles: File[]) => {
    setErrorMsg(null);
    setWarningMsg(null);

    const validFiles = batchFiles.filter(isSupportedFile);
    if (validFiles.length === 0) {
      setErrorMsg(
        'None of the selected files are supported. Please upload clear photos (JPG, PNG, WEBP), PDF documents, or Excel/CSV spreadsheets.'
      );
      return;
    }

    if (validFiles.length < batchFiles.length) {
      setWarningMsg(
        `${batchFiles.length - validFiles.length} unsupported file(s) were skipped. Only images, PDFs, and Excel/CSV files are processed.`
      );
    }

    setIsProcessing(true);

    // If there's already extractedData (e.g. user clicked "Add More Files"), preserve existing items & charges
    const initialItems: ExtractedItem[] = extractedData?.items ? [...extractedData.items] : [];
    const initialCharges = extractedData?.charges ? [...extractedData.charges] : [];
    let curCustomerName = extractedData?.customerName || '';
    let curCustomerPhone = extractedData?.customerPhone || '';
    let curNotes = extractedData?.notes || '';

    const newExtractedItems: ExtractedItem[] = [...initialItems];
    const newExtractedCharges = [...initialCharges];
    const processedFiles: File[] = [...files];
    const failedFiles: Array<{ name: string; error: string }> = [];

    const total = validFiles.length;

    for (let i = 0; i < total; i++) {
      const currentFile = validFiles[i];
      setProcessingProgress({
        current: i + 1,
        total,
        fileName: currentFile.name,
      });

      const isExcel =
        currentFile.name.endsWith('.xlsx') ||
        currentFile.name.endsWith('.xls') ||
        currentFile.name.endsWith('.csv') ||
        currentFile.type.includes('spreadsheet') ||
        currentFile.type.includes('excel');

      if (isExcel) {
        setStatusText(`[${i + 1}/${total}] Parsing spreadsheet table: ${currentFile.name}...`);
      } else if (currentFile.type === 'application/pdf' || currentFile.name.endsWith('.pdf')) {
        setStatusText(`[${i + 1}/${total}] Analyzing PDF document with AI Vision: ${currentFile.name}...`);
      } else {
        setStatusText(`[${i + 1}/${total}] Reading handwritten receipt / note with AI Vision: ${currentFile.name}...`);
      }

      try {
        const fileToUpload = await compressImageClientSide(currentFile);
        const formData = new FormData();
        formData.append('file', fileToUpload);

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
        if (data && Array.isArray(data.items) && data.items.length > 0) {
          data.items.forEach((item) => {
            newExtractedItems.push(item);
          });

          if (Array.isArray(data.charges)) {
            data.charges.forEach((chg) => {
              newExtractedCharges.push(chg);
            });
          }

          if (!curCustomerName && data.customerName) {
            curCustomerName = data.customerName;
          }
          if (!curCustomerPhone && data.customerPhone) {
            curCustomerPhone = data.customerPhone;
          }
          if (!curNotes && data.notes) {
            curNotes = data.notes;
          }

          processedFiles.push(currentFile);
        } else {
          failedFiles.push({
            name: currentFile.name,
            error: 'No invoice/receipt line items recognized in this file.',
          });
        }
      } catch (err: any) {
        console.error(`Error extracting file ${currentFile.name}:`, err);
        const msg = getErrorMessage(
          err,
          'The format or content of this file is not supported. Please upload a clear photo or scan of an invoice, receipt, handwritten order note, or Excel file.'
        );
        failedFiles.push({
          name: currentFile.name,
          error: msg,
        });
      }

      // Small throttle if processing multiple files to be gentle on token rates
      if (i < total - 1) {
        await new Promise((r) => setTimeout(r, 450));
      }
    }

    setIsProcessing(false);
    setProcessingProgress(null);

    if (newExtractedItems.length === 0) {
      if (failedFiles.length === 1) {
        setErrorMsg(failedFiles[0].error);
      } else {
        setErrorMsg(
          `None of the ${total} files contained recognizable line items. Please make sure the uploaded files are clear photos of receipts, invoices, or order notes.`
        );
      }
      return;
    }

    const mergedData: ExtractedInvoiceData = {
      items: newExtractedItems,
      charges: newExtractedCharges,
      customerName: curCustomerName || undefined,
      customerPhone: curCustomerPhone || undefined,
      notes: curNotes || undefined,
    };

    setExtractedData(mergedData);
    setFiles(processedFiles);
    const allFileNames = processedFiles.map((f) => f.name);
    setSavedFileNames(allFileNames);

    const allItemIdxs = newExtractedItems.map((_, idx) => idx);
    const allChargeIdxs = newExtractedCharges.map((_, idx) => idx);
    setSelectedItemIndices(new Set(allItemIdxs));
    setSelectedChargeIndices(new Set(allChargeIdxs));

    if (failedFiles.length > 0) {
      setWarningMsg(
        `Processed ${processedFiles.length} file(s) successfully (${newExtractedItems.length} items found). Note: ${
          failedFiles.length
        } file(s) could not be parsed: ${failedFiles.map((f) => f.name).join(', ')}.`
      );
    }

    try {
      localStorage.setItem(
        'invoice_autofill_extracted_data',
        JSON.stringify({
          extractedData: mergedData,
          selectedItemIndices: allItemIdxs,
          selectedChargeIndices: allChargeIdxs,
          savedFileNames: allFileNames,
        })
      );
    } catch {}
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

  const toggleCharge = (idx: number) => {
    setSelectedChargeIndices((prev) => {
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
    const chosenCharges = (extractedData.charges || []).filter((_, idx) => selectedChargeIndices.has(idx));
    onApply({
      ...extractedData,
      items: chosenItems,
      charges: chosenCharges,
    });
    resetState();
    onClose();
  };

  const getFileIcon = (fileName: string) => {
    const name = fileName.toLowerCase();
    if (name.endsWith('.xlsx') || name.endsWith('.xls') || name.endsWith('.csv')) {
      return <FileSpreadsheet className="h-4 w-4 text-emerald-500 shrink-0" />;
    }
    if (name.endsWith('.pdf')) {
      return <FileText className="h-4 w-4 text-rose-500 shrink-0" />;
    }
    return <ImageIcon className="h-4 w-4 text-blue-500 shrink-0" />;
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="w-[95vw] sm:max-w-3xl md:max-w-4xl max-h-[92vh] flex flex-col p-4 sm:p-6 bg-card border-border shadow-2xl rounded-2xl sm:rounded-3xl overflow-hidden">
        {/* Hidden File Input always mounted so both dropzone and 'Add More Files' can trigger it */}
        <input
          ref={fileInputRef}
          type="file"
          multiple
          className="hidden"
          accept=".jpg,.jpeg,.png,.webp,.pdf,.xlsx,.xls,.csv"
          onChange={(e) => {
            const selected = Array.from(e.target.files || []);
            if (selected.length > 0) handleFilesSelect(selected);
            e.target.value = '';
          }}
        />

        <DialogHeader className="space-y-1 pb-2 border-b border-border/80 shrink-0">
          <div className="flex items-center space-x-2">
            <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 shrink-0">
              <Sparkles className="h-5 w-5" />
            </div>
            <div className="min-w-0 flex-1">
              <DialogTitle className="text-base sm:text-lg font-bold text-foreground flex flex-wrap items-center gap-2">
                <span>Auto-Fill from Document / Jotting Note</span>
                <Badge variant="outline" className="text-[10px] font-mono border-emerald-500/30 text-emerald-500">
                  AI Powered Multi-File
                </Badge>
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground truncate sm:whitespace-normal">
                Upload single or multiple photos of receipts, handwritten notes, WhatsApp screenshots, PDFs, or Excel files.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Upload Dropzone */}
        {!extractedData && !isProcessing && (
          <div className="flex-1 min-h-0 overflow-y-auto pr-1 -mr-1 py-4 space-y-4 overscroll-contain">
            <div
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                const dropped = Array.from(e.dataTransfer.files || []);
                if (dropped.length > 0) handleFilesSelect(dropped);
              }}
              className="border-2 border-dashed border-border/80 hover:border-emerald-500/60 rounded-2xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-all hover:bg-emerald-500/5 group"
            >
              <div className="h-14 w-14 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform shadow-sm">
                <UploadCloud className="h-7 w-7" />
              </div>
              <h3 className="font-bold text-sm text-foreground">Click to upload or drag & drop (1 or multiple files)</h3>
              <p className="text-xs text-muted-foreground mt-1 max-w-sm">
                Select one or several files at once. The AI will scan every page and combine all line items together.
              </p>

              <div className="flex flex-wrap items-center justify-center gap-2 mt-4 text-[11px] font-mono text-muted-foreground">
                <span className="px-2 py-0.5 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-semibold">Multiple Files Supported</span>
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
            {warningMsg && (
              <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 flex items-start space-x-2 text-xs">
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                <span>{warningMsg}</span>
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
            <div className="space-y-1.5 max-w-md px-4">
              <h4 className="font-bold text-sm text-foreground">
                {processingProgress
                  ? `Processing File ${processingProgress.current} of ${processingProgress.total}`
                  : 'Processing Documents'}
              </h4>
              <p className="text-xs text-muted-foreground font-mono animate-pulse">{statusText}</p>
              {processingProgress && (
                <div className="w-56 bg-secondary h-2 rounded-full overflow-hidden mx-auto mt-3 border border-border">
                  <div
                    className="bg-emerald-500 h-full transition-all duration-300 rounded-full"
                    style={{
                      width: `${Math.round((processingProgress.current / processingProgress.total) * 100)}%`,
                    }}
                  />
                </div>
              )}
            </div>
          </div>
        )}

        {/* Extracted Review State */}
        {extractedData && !isProcessing && (
          <div className="flex-1 min-h-0 overflow-y-auto pr-1.5 -mr-1.5 py-2 space-y-4 overscroll-contain">
            {/* File Info Bar */}
            <div className="p-3 rounded-xl bg-secondary/30 border border-border space-y-2.5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center space-x-2.5">
                  <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-500 shrink-0">
                    <CheckCircle2 className="h-4 w-4" />
                  </div>
                  <div className="text-left">
                    <p className="text-xs font-bold text-foreground">
                      {files.length > 0
                        ? `${files.length} Document${files.length === 1 ? '' : 's'} Scanned`
                        : `${savedFileNames.length > 0 ? `${savedFileNames.length} Document(s) Restored` : 'Documents Scanned'}`}
                    </p>
                    <p className="text-[10px] text-muted-foreground">
                      Detected {extractedData.items.length} line item(s)
                      {extractedData.charges && extractedData.charges.length > 0 ? ` and ${extractedData.charges.length} charge(s)` : ''}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 self-end sm:self-center">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                    className="text-xs space-x-1.5 h-8 rounded-xl border-border text-foreground hover:bg-secondary px-2.5"
                    title="Upload additional files to append to this scan"
                  >
                    <Plus className="h-3 w-3 text-emerald-500" />
                    <span>Add More Files</span>
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={resetState}
                    className="text-xs space-x-1 text-rose-500 hover:text-rose-600 hover:bg-rose-500/10 h-8 rounded-xl px-2.5"
                    title="Clear current scanned items and upload new files"
                  >
                    <Trash2 className="h-3 w-3" />
                    <span>Clear Scan</span>
                  </Button>
                </div>
              </div>

              {/* Scanned files list / chips */}
              {(files.length > 0 || savedFileNames.length > 0) && (
                <div className="flex flex-wrap gap-1.5 pt-1 border-t border-border/50">
                  {(files.length > 0 ? files.map((f) => f.name) : savedFileNames).map((fileName, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-background border border-border text-[11px] font-mono text-muted-foreground truncate max-w-[220px]"
                      title={fileName}
                    >
                      {getFileIcon(fileName)}
                      <span className="truncate">{fileName}</span>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {warningMsg && (
              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 flex items-start space-x-2 text-xs">
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                <span>{warningMsg}</span>
              </div>
            )}

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

              <div className="overflow-x-auto w-full">
                <Table className="min-w-[500px]">
                  <TableHeader className="bg-secondary/10 text-[10px] uppercase font-bold sticky top-0 bg-background/95 backdrop-blur-sm z-10">
                    <TableRow className="border-b border-border">
                      <TableHead className="w-10 text-center">#</TableHead>
                      <TableHead className="min-w-[180px]">Description</TableHead>
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
                          <TableCell className="font-medium text-foreground min-w-[180px]">{item.description}</TableCell>
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

            {/* Additional Charges / Logistics Section */}
            {extractedData.charges && extractedData.charges.length > 0 && (
              <div className="border border-border/80 rounded-xl overflow-hidden shadow-sm bg-card">
                <div className="p-2.5 bg-amber-500/10 border-b border-border flex items-center justify-between text-xs font-semibold">
                  <div className="flex items-center space-x-1.5 text-amber-600 dark:text-amber-400">
                    <Truck className="h-4 w-4" />
                    <span>Additional Charges & Logistics ({selectedChargeIndices.size}/{extractedData.charges.length} selected)</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      if (selectedChargeIndices.size === extractedData.charges!.length) {
                        setSelectedChargeIndices(new Set());
                      } else {
                        setSelectedChargeIndices(new Set(extractedData.charges!.map((_, idx) => idx)));
                      }
                    }}
                    className="text-amber-600 dark:text-amber-400 hover:underline text-[11px] font-bold"
                  >
                    {selectedChargeIndices.size === extractedData.charges.length ? 'Deselect All' : 'Select All'}
                  </button>
                </div>

                <div className="divide-y divide-border/60">
                  {extractedData.charges.map((charge, idx) => {
                    const isSelected = selectedChargeIndices.has(idx);
                    return (
                      <div
                        key={idx}
                        onClick={() => toggleCharge(idx)}
                        className={`p-3 flex items-center justify-between cursor-pointer transition-colors text-xs ${
                          isSelected ? 'bg-amber-500/5' : 'opacity-50 hover:opacity-80'
                        }`}
                      >
                        <div className="flex items-center space-x-2.5">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleCharge(idx)}
                            onClick={(e) => e.stopPropagation()}
                            className="rounded border-border text-amber-500 focus:ring-amber-500 h-4 w-4"
                          />
                          <span className="font-semibold text-foreground">{charge.name}</span>
                        </div>
                        <span className="font-mono font-bold text-foreground">
                          ₦{Number(charge.amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Mode notification */}
            <p className="text-[11px] text-muted-foreground text-center">
              {hasExistingItems
                ? 'ℹ️ Existing line items will be preserved. These extracted items will be appended.'
                : 'ℹ️ These items will fill up the blank invoice ledger.'}
            </p>
          </div>
        )}

        <DialogFooter className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 pt-3 border-t border-border shrink-0 mt-auto bg-card">
          <Button variant="outline" size="sm" onClick={handleClose} className="rounded-xl text-xs h-9 w-full sm:w-auto">
            Cancel
          </Button>

          {extractedData && (
            <Button
              size="sm"
              disabled={selectedItemIndices.size === 0 && selectedChargeIndices.size === 0}
              onClick={handleApply}
              className="rounded-xl text-xs h-9 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold space-x-1.5 shadow-sm w-full sm:w-auto"
            >
              <Check className="h-4 w-4 shrink-0" />
              <span className="truncate">
                Apply {selectedItemIndices.size} Item{selectedItemIndices.size === 1 ? '' : 's'}
                {selectedChargeIndices.size > 0 ? ` & ${selectedChargeIndices.size} Charge${selectedChargeIndices.size === 1 ? '' : 's'}` : ''} to Invoice
              </span>
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
