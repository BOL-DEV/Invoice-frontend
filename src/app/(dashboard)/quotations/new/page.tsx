'use client';

import React, { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { quotationService } from '../../../../services/quotation.service';
import { Button } from '../../../../components/ui/button';
import { Input } from '../../../../components/ui/input';
import { Label } from '../../../../components/ui/label';
import { Textarea } from '../../../../components/ui/textarea';
import { Card, CardHeader, CardTitle, CardContent } from '../../../../components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../../../components/ui/table';
import { useModal } from '../../../../components/ui/modal-provider';
import { printDocumentPDF } from '../../../../lib/document-download';
import { CustomerSearchInput } from '../../../../components/forms/CustomerSearchInput';
import { PhoneInput } from '../../../../components/forms/PhoneInput';
import { QuantityInput } from '../../../../components/forms/QuantityInput';
import { MoneyInput } from '../../../../components/forms/MoneyInput';
import { BasicCalculator } from '../../../../components/forms/BasicCalculator';
import { WeightCalculator } from '../../../../components/forms/WeightCalculator';
import { DocumentImportModal } from '../../../../features/invoices/components/DocumentImportModal';
import { useSubscription } from '../../../../features/subscriptions/hooks/useSubscription';
import { ExtractedInvoiceData } from '../../../../types/api';
import { numberToNairaWords } from '../../../../features/invoices/utils/numberToWords';
import {
  Plus,
  Trash2,
  ArrowLeft,
  Loader2,
  Printer,
  Check,
  User,
  ShoppingBag,
  PenTool,
  RotateCcw,
  CheckCircle2,
  FileText,
  Calculator,
  Scale,
  Sparkles,
} from 'lucide-react';

interface FormItem {
  position: number;
  quantity: number;
  description: string;
  totalMeters: string;
  unitPrice: number;
  totalPrice: number;
}

export default function NewQuotationPage() {
  const router = useRouter();
  const modal = useModal();
  const { data: subDetails } = useSubscription();

  const currentPlan = subDetails?.subscription?.plan;
  const aiScansLimit =
    subDetails?.aiScans?.limit ??
    (currentPlan === 'ENTERPRISE' ? 150 : currentPlan === 'BUSINESS' ? 60 : 10);
  const aiScansUsed = subDetails?.aiScans?.used ?? 0;
  const aiScansRemaining =
    subDetails?.aiScans?.remaining !== undefined
      ? subDetails.aiScans.remaining
      : Math.max(0, aiScansLimit - aiScansUsed);
  const isAiQuotaExhausted = aiScansRemaining <= 0;

  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [notes, setNotes] = useState('');
  const [showNoteField, setShowNoteField] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Scan & Calculator states
  const [showImportModal, setShowImportModal] = useState(false);
  const [showCalculator, setShowCalculator] = useState(false);
  const [showWeightCalculator, setShowWeightCalculator] = useState(false);

  // Customer signature states
  const [customerSignature, setCustomerSignature] = useState<string | null>(null);
  const [showSignatureField, setShowSignatureField] = useState(false);
  const [isEditingSignature, setIsEditingSignature] = useState(false);
  const [isDrawingCustomerSig, setIsDrawingCustomerSig] = useState(false);
  const [hasDrawnCustomerSig, setHasDrawnCustomerSig] = useState(false);
  const customerCanvasRef = useRef<HTMLCanvasElement | null>(null);

  // Start with 3 empty rows, just like Invoice creation
  const [items, setItems] = useState<FormItem[]>([
    { position: 1, quantity: 0, description: '', totalMeters: '', unitPrice: 0, totalPrice: 0 },
    { position: 2, quantity: 0, description: '', totalMeters: '', unitPrice: 0, totalPrice: 0 },
    { position: 3, quantity: 0, description: '', totalMeters: '', unitPrice: 0, totalPrice: 0 },
  ]);

  const handleItemChange = (index: number, field: keyof FormItem, value: any) => {
    setItems((prev) => {
      const updated = [...prev];
      const item = { ...updated[index], [field]: value };

      if (field === 'quantity' || field === 'unitPrice') {
        const qty = Number(item.quantity) || 0;
        const rate = Number(item.unitPrice) || 0;
        item.totalPrice = Math.round(qty * rate * 100) / 100;
      }

      updated[index] = item;
      return updated;
    });
  };

  const addItem = () => {
    setItems((prev) => [
      ...prev,
      { position: prev.length + 1, quantity: 0, description: '', totalMeters: '', unitPrice: 0, totalPrice: 0 },
    ]);
  };

  const removeItem = (index: number) => {
    if (items.length <= 1) {
      modal.alert('Cannot Remove', 'A quotation must have at least one line item', 'warning');
      return;
    }
    setItems((prev) =>
      prev.filter((_, i) => i !== index).map((item, idx) => ({ ...item, position: idx + 1 }))
    );
  };

  const handleClearFormConfirm = async () => {
    const confirmed = await modal.confirm(
      'Clear Quotation Form',
      'Are you sure you want to clear all entered customer details and quotation line items?'
    );
    if (!confirmed) return;

    setCustomerName('');
    setCustomerPhone('');
    setNotes('');
    setShowNoteField(false);
    removeCustomerSignature();
    setItems([
      { position: 1, quantity: 0, description: '', totalMeters: '', unitPrice: 0, totalPrice: 0 },
      { position: 2, quantity: 0, description: '', totalMeters: '', unitPrice: 0, totalPrice: 0 },
      { position: 3, quantity: 0, description: '', totalMeters: '', unitPrice: 0, totalPrice: 0 },
    ]);
  };

  // AI Document / Note scan handler
  const handleApplyExtractedData = (extracted: ExtractedInvoiceData) => {
    if (extracted.customerName && !customerName.trim()) {
      setCustomerName(extracted.customerName);
    }
    if (extracted.customerPhone && !customerPhone.trim()) {
      setCustomerPhone(extracted.customerPhone);
    }
    if (extracted.notes && !notes.trim()) {
      setNotes(extracted.notes);
      setShowNoteField(true);
    }

    const existingFilledItems = items.filter(
      (it) => it.description.trim() !== '' || Number(it.quantity) > 0 || Number(it.unitPrice) > 0
    );
    const hasExistingItems = existingFilledItems.length > 0;

    const newItems: FormItem[] = (extracted.items || []).map((it, idx) => {
      const qty = Number(it.quantity) > 0 ? Number(it.quantity) : 1;
      const unit = Number(it.unitPrice) >= 0 ? Number(it.unitPrice) : 0;
      const accurateTotal = Math.round(qty * unit * 100) / 100;
      const tot = accurateTotal > 0 ? accurateTotal : (Number(it.totalPrice) > 0 ? Number(it.totalPrice) : 0);
      return {
        position: idx + 1,
        description: it.description || '',
        quantity: qty,
        totalMeters: (it as any).metrics || '',
        unitPrice: unit,
        totalPrice: Math.round(tot * 100) / 100,
      };
    });

    if (newItems.length > 0) {
      if (hasExistingItems) {
        const startingPos = existingFilledItems.length + 1;
        const reindexedNew = newItems.map((it, idx) => ({
          ...it,
          position: startingPos + idx,
        }));
        setItems([...existingFilledItems, ...reindexedNew]);
      } else {
        setItems(newItems);
      }
    }

    setShowImportModal(false);
  };

  // Drawing helpers
  const getCanvasCoordinates = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = customerCanvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    return {
      x: (clientX - rect.left) * (canvas.width / rect.width),
      y: (clientY - rect.top) * (canvas.height / rect.height),
    };
  };

  const startDrawingCustomerSig = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const canvas = customerCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const { x, y } = getCanvasCoordinates(e);
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineWidth = 2.8;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = '#0f172a';
    setIsDrawingCustomerSig(true);
  };

  const drawCustomerSig = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawingCustomerSig) return;
    e.preventDefault();
    const canvas = customerCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const { x, y } = getCanvasCoordinates(e);
    ctx.lineTo(x, y);
    ctx.stroke();
    setHasDrawnCustomerSig(true);
  };

  const stopDrawingCustomerSig = () => {
    if (!isDrawingCustomerSig) return;
    setIsDrawingCustomerSig(false);
  };

  const clearCustomerCanvas = () => {
    const canvas = customerCanvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
    setHasDrawnCustomerSig(false);
  };

  const captureAndFitSignature = (): string | null => {
    const canvas = customerCanvasRef.current;
    if (!canvas || !hasDrawnCustomerSig) return null;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    try {
      const { width, height } = canvas;
      const imgData = ctx.getImageData(0, 0, width, height);
      const data = imgData.data;

      let minX = width, minY = height, maxX = 0, maxY = 0;
      let hasInk = false;

      for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
          const alpha = data[(y * width + x) * 4 + 3];
          if (alpha > 15) {
            hasInk = true;
            if (x < minX) minX = x;
            if (x > maxX) maxX = x;
            if (y < minY) minY = y;
            if (y > maxY) maxY = y;
          }
        }
      }

      if (!hasInk) return null;

      const pad = 14;
      const cropX = Math.max(0, minX - pad);
      const cropY = Math.max(0, minY - pad);
      const cropW = Math.min(width - cropX, (maxX - minX) + pad * 2);
      const cropH = Math.min(height - cropY, (maxY - minY) + pad * 2);

      const targetW = 400;
      const targetH = 120;
      const normCanvas = document.createElement('canvas');
      normCanvas.width = targetW;
      normCanvas.height = targetH;
      const normCtx = normCanvas.getContext('2d');
      if (!normCtx) {
        const raw = canvas.toDataURL('image/png');
        setCustomerSignature(raw);
        setIsEditingSignature(false);
        return raw;
      }

      const scale = Math.min((targetW - 20) / cropW, (targetH - 20) / cropH);
      const drawW = cropW * scale;
      const drawH = cropH * scale;
      const offsetX = (targetW - drawW) / 2;
      const offsetY = (targetH - drawH) / 2;

      normCtx.imageSmoothingEnabled = true;
      normCtx.imageSmoothingQuality = 'high';
      normCtx.drawImage(canvas, cropX, cropY, cropW, cropH, offsetX, offsetY, drawW, drawH);

      const fittedDataUrl = normCanvas.toDataURL('image/png');
      setCustomerSignature(fittedDataUrl);
      setIsEditingSignature(false);
      return fittedDataUrl;
    } catch {
      const raw = canvas.toDataURL('image/png');
      setCustomerSignature(raw);
      setIsEditingSignature(false);
      return raw;
    }
  };

  const removeCustomerSignature = () => {
    clearCustomerCanvas();
    setCustomerSignature(null);
    setShowSignatureField(false);
    setIsEditingSignature(false);
  };

  const subtotal = items.reduce((sum, item) => sum + (Number(item.totalPrice) || 0), 0);
  const grandTotal = subtotal;

  const handleSubmit = async (action: 'print' | 'draft' = 'print') => {
    if (!customerName.trim()) {
      modal.alert('Validation Error', 'Customer Name is required', 'warning');
      return;
    }

    const validItems = items.filter(
      (it) => it.description.trim() && Number(it.quantity) > 0 && Number(it.unitPrice) >= 0
    );

    if (validItems.length === 0) {
      modal.alert(
        'Invalid Items',
        'Please enter at least one item with a description, quantity greater than 0, and rate.',
        'warning'
      );
      return;
    }

    try {
      setIsSubmitting(true);

      let currentCustomerSig = customerSignature;
      if (isEditingSignature && hasDrawnCustomerSig) {
        const captured = captureAndFitSignature();
        if (captured) currentCustomerSig = captured;
      }

      const quotation = await quotationService.create({
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim() || null,
        customerSignature: currentCustomerSig || null,
        status: 'DRAFT',
        notes: notes.trim() || null,
        subtotal,
        total: grandTotal,
        items: validItems.map((it, idx) => ({
          position: idx + 1,
          description: it.description.trim(),
          quantity: Number(it.quantity),
          unitPrice: Number(it.unitPrice),
          totalPrice: Number(it.totalPrice),
          metrics: it.totalMeters.trim() ? `${it.totalMeters.trim()} m` : null,
        })),
      });

      if (action === 'print') {
        try {
          // Triggers browser's native built-in print preview window with preview & Save-as-PDF destination
          await printDocumentPDF(`/api/printing/quotation/${quotation.id}/pdf`);
        } catch (printErr) {
          window.open(quotationService.getPDFUrl(quotation.id), '_blank');
        }
      }

      modal.alert(
        'Quotation Saved',
        `Quotation ${quotation.quotationNumber} has been successfully created.`,
        'success'
      );
      router.push('/quotations');
    } catch (err: any) {
      modal.alert('Creation Failed', err.response?.data?.message || err.message || 'Failed to create quotation', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Top Header - Matches Create New Invoice exactly */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-border pb-4">
        <div className="flex items-center space-x-3.5">
          <Button
            variant="outline"
            size="icon"
            onClick={() => router.push('/quotations')}
            className="rounded-full h-9 w-9 shadow-sm cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h2 className="text-xl font-bold tracking-tight text-[#0F172A] dark:text-[#F8FAFC] font-heading">
              Create New Quotation
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Complete cashier ledger entry fields sequentially.
            </p>
          </div>
        </div>

        {/* Floating Utilities triggers */}
        <div className="flex flex-wrap items-center gap-2">
          {/* AI Document Scan Trigger */}
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={isAiQuotaExhausted}
            onClick={() => {
              if (isAiQuotaExhausted) {
                modal.alert(
                  'AI Scanning Quota Exhausted',
                  `This business has exhausted its monthly AI document scanning quota (${aiScansUsed}/${aiScansLimit} scans used). You can enter line items manually or contact your administrator to upgrade your allowance.`,
                  'warning'
                );
                return;
              }
              setShowImportModal(true);
            }}
            className={`space-x-1.5 font-semibold text-xs rounded-xl h-9 shadow-sm transition-all cursor-pointer ${
              isAiQuotaExhausted
                ? 'border-border text-muted-foreground/60 bg-muted/20 cursor-not-allowed opacity-60'
                : 'border-indigo-500/30 text-indigo-600 dark:text-indigo-400 bg-indigo-50/50 dark:bg-indigo-950/20 hover:bg-indigo-100/60 dark:hover:bg-indigo-900/30'
            }`}
            title={
              isAiQuotaExhausted
                ? `AI Document Scanning Quota Exhausted (${aiScansUsed}/${aiScansLimit} scans used this month)`
                : `Auto-fill quotation from handwritten note, photo, or PDF (${aiScansRemaining} scans remaining)`
            }
          >
            <Sparkles className={`h-4 w-4 ${isAiQuotaExhausted ? 'text-muted-foreground/50' : 'text-indigo-500 animate-pulse'}`} />
            <span>Auto-fill from Note / File</span>
            {isAiQuotaExhausted ? (
              <span className="text-[9px] uppercase px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-500 font-bold border border-amber-500/20">
                0 Left
              </span>
            ) : (
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 font-mono font-medium">
                {aiScansRemaining} left
              </span>
            )}
          </Button>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setShowCalculator(!showCalculator)}
            className="space-x-1.5 font-semibold text-xs border-border bg-card rounded-xl h-9 cursor-pointer"
          >
            <Calculator className="h-4 w-4 text-muted-foreground" />
            <span>Open Calculator</span>
          </Button>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setShowWeightCalculator(true)}
            className="space-x-1.5 font-semibold text-xs border-border bg-card rounded-xl h-9 cursor-pointer"
          >
            <Scale className="h-4 w-4 text-muted-foreground" />
            <span>Weight Estimator</span>
          </Button>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleClearFormConfirm}
            className="space-x-1.5 font-semibold text-xs border-rose-500/30 text-rose-600 dark:text-rose-400 bg-rose-50/40 dark:bg-rose-950/20 hover:bg-rose-100/60 dark:hover:bg-rose-900/30 rounded-xl h-9 cursor-pointer"
            title="Clear all fields and start a fresh quotation"
          >
            <RotateCcw className="h-3.5 w-3.5 text-rose-500" />
            <span>Clear Form</span>
          </Button>
        </div>
      </div>

      {/* Main Grid: Left side ledger inputs + Right side sticky summary details */}
      <div className="grid lg:grid-cols-3 gap-6 items-start">
        {/* Left Side: Ledger Input Grid (2 Cols) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Card 1: Customer Details */}
          <Card className="border-border bg-card shadow-sm rounded-2xl">
            <CardHeader className="flex flex-row items-center space-x-2.5 pb-2">
              <div className="bg-primary/10 text-primary p-1.5 rounded-lg">
                <User className="h-4 w-4" />
              </div>
              <CardTitle className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                Customer Details
              </CardTitle>
            </CardHeader>
            <CardContent className="grid sm:grid-cols-2 gap-4 pt-2">
              <div className="space-y-1.5">
                <Label htmlFor="customer-name" className="text-xs font-semibold">
                  Customer Name <span className="text-rose-500">*</span>
                </Label>
                <CustomerSearchInput
                  id="customer-name"
                  value={customerName}
                  onChange={setCustomerName}
                  onSelectCustomer={(cust) => {
                    setCustomerName(cust.name);
                    if (cust.phone) setCustomerPhone(cust.phone);
                  }}
                  placeholder="Type customer name or search..."
                  className="bg-background font-medium h-10 rounded-xl"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="customer-phone" className="text-xs font-semibold">
                  Phone Number (Optional)
                </Label>
                <PhoneInput
                  id="customer-phone"
                  value={customerPhone}
                  onChange={setCustomerPhone}
                  placeholder="e.g. 08012345678"
                  className="bg-background h-10 rounded-xl"
                />
              </div>
            </CardContent>
          </Card>

          {/* Card 2: Quoted Line Items Table */}
          <Card className="border-border bg-card shadow-sm rounded-2xl overflow-hidden">
            <CardHeader className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-secondary/15 border-b border-border py-3 px-4 sm:px-6">
              <div className="flex items-center space-x-2.5">
                <div className="bg-primary/10 text-primary p-1.5 rounded-lg shrink-0">
                  <ShoppingBag className="h-4 w-4" />
                </div>
                <CardTitle className="text-xs sm:text-[10px] font-bold uppercase tracking-wider text-muted-foreground whitespace-nowrap">
                  Ledger Line Items
                </CardTitle>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={isAiQuotaExhausted}
                  onClick={() => setShowImportModal(true)}
                  className="space-x-1.5 font-semibold text-xs border-indigo-500/30 text-indigo-600 dark:text-indigo-400 bg-indigo-50/40 dark:bg-indigo-950/20 hover:bg-indigo-100/60 dark:hover:bg-indigo-900/30 rounded-xl h-8 px-3 cursor-pointer"
                >
                  <Sparkles className="h-3.5 w-3.5 text-indigo-500 animate-pulse" />
                  <span>Scan / Import</span>
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addItem}
                  className="space-x-1.5 font-semibold text-xs border-primary text-primary hover:bg-primary/5 rounded-xl h-8 px-3 cursor-pointer"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>Add Row</span>
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleClearFormConfirm}
                  className="space-x-1.5 font-semibold text-xs border-rose-500/30 text-rose-600 dark:text-rose-400 bg-rose-50/40 dark:bg-rose-950/20 hover:bg-rose-100/60 dark:hover:bg-rose-900/30 rounded-xl h-8 px-3 cursor-pointer"
                >
                  <RotateCcw className="h-3.5 w-3.5 text-rose-500" />
                  <span>Clear Form</span>
                </Button>
              </div>
            </CardHeader>

            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto relative">
              <Table>
                <TableHeader className="bg-secondary/20">
                  <TableRow className="border-b border-border hover:bg-transparent">
                    <TableHead className="w-12 text-center text-[10px] uppercase font-bold text-muted-foreground">
                      S/N
                    </TableHead>
                    <TableHead className="w-24 text-right text-[10px] uppercase font-bold text-muted-foreground">
                      Quantity
                    </TableHead>
                    <TableHead className="w-[38%] text-[10px] uppercase font-bold text-muted-foreground">
                      Description of Goods
                    </TableHead>
                    <TableHead className="w-28 text-right text-[10px] uppercase font-bold text-muted-foreground">
                      Total Meters
                    </TableHead>
                    <TableHead className="w-32 text-right text-[10px] uppercase font-bold text-muted-foreground">
                      Rate
                    </TableHead>
                    <TableHead className="w-32 text-right pr-4 text-[10px] uppercase font-bold text-muted-foreground">
                      Amount
                    </TableHead>
                    <TableHead className="w-12 text-center"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.map((item, idx) => (
                    <TableRow
                      key={idx}
                      className="border-b border-border/60 hover:bg-slate-50/20 dark:hover:bg-slate-900/10 transition-colors"
                    >
                      {/* S/N */}
                      <TableCell className="text-center font-mono text-xs text-muted-foreground select-none py-3">
                        {idx + 1}
                      </TableCell>

                      {/* Quantity - Using QuantityInput (blank placeholder when 0, no spinners) */}
                      <TableCell className="py-2">
                        <QuantityInput
                          id={`row-${idx}-quantity`}
                          value={item.quantity}
                          onChange={(val) => handleItemChange(idx, 'quantity', val)}
                          className="bg-background text-sm h-9 rounded-xl border border-border"
                        />
                      </TableCell>

                      {/* Description of Goods */}
                      <TableCell className="py-2">
                        <Input
                          id={`row-${idx}-description`}
                          type="text"
                          value={item.description}
                          onChange={(e) => handleItemChange(idx, 'description', e.target.value)}
                          placeholder="e.g. 16mm Iron Rods"
                          className="bg-background text-sm font-medium h-9 rounded-xl border border-border"
                        />
                      </TableCell>

                      {/* Total Meters */}
                      <TableCell className="py-2">
                        <Input
                          id={`row-${idx}-totalMeters`}
                          type="text"
                          value={item.totalMeters}
                          onChange={(e) => handleItemChange(idx, 'totalMeters', e.target.value)}
                          placeholder="e.g. 22"
                          className="bg-background text-sm font-medium h-9 rounded-xl border border-border text-right font-mono"
                        />
                      </TableCell>

                      {/* Rate - Using MoneyInput (clean ₦ prefix, formatted decimals) */}
                      <TableCell className="py-2">
                        <MoneyInput
                          id={`row-${idx}-unitPrice`}
                          value={item.unitPrice}
                          onChange={(val) => handleItemChange(idx, 'unitPrice', val)}
                          className="bg-background text-sm h-9 rounded-xl border border-border"
                        />
                      </TableCell>

                      {/* Amount */}
                      <TableCell className="text-right font-mono font-bold text-sm py-3 select-none pr-4 text-[#0F172A] dark:text-[#F8FAFC]">
                        ₦{(Number(item.totalPrice) || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </TableCell>

                      {/* Delete Action */}
                      <TableCell className="text-center py-2">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => removeItem(idx)}
                          disabled={items.length === 1}
                          className="h-8 w-8 rounded-full text-muted-foreground hover:text-rose-500 hover:bg-rose-500/10 transition-colors cursor-pointer"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Mobile Compact View */}
            <div className="md:hidden p-3 space-y-2.5 bg-slate-50/50 dark:bg-slate-900/10 border-t border-border">
              {items.map((item, idx) => (
                <div
                  key={idx}
                  className="p-2.5 rounded-xl border border-border bg-card space-y-2 relative"
                >
                  <div className="flex items-center gap-2">
                    <span className="shrink-0 w-6 h-6 rounded-md bg-secondary/80 text-[11px] font-mono font-bold flex items-center justify-center text-muted-foreground select-none">
                      #{idx + 1}
                    </span>
                    <Input
                      type="text"
                      value={item.description}
                      onChange={(e) => handleItemChange(idx, 'description', e.target.value)}
                      placeholder="Item description (e.g. 16mm Rods)..."
                      className="bg-background text-xs font-medium h-8 rounded-lg border border-border flex-1"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeItem(idx)}
                      disabled={items.length === 1}
                      className="h-8 w-8 shrink-0 rounded-lg text-muted-foreground hover:text-rose-500 hover:bg-rose-500/10 transition-colors"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>

                  <div className="grid grid-cols-3 gap-2 pl-8">
                    <div>
                      <span className="text-[10px] font-bold text-muted-foreground uppercase">Qty:</span>
                      <QuantityInput
                        value={item.quantity}
                        onChange={(val) => handleItemChange(idx, 'quantity', val)}
                        className="bg-background text-xs h-7 rounded-lg border border-border text-center"
                      />
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-muted-foreground uppercase">Meters:</span>
                      <Input
                        type="text"
                        value={item.totalMeters}
                        onChange={(e) => handleItemChange(idx, 'totalMeters', e.target.value)}
                        placeholder="22m"
                        className="bg-background text-xs h-7 rounded-lg border border-border text-center font-mono"
                      />
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-muted-foreground uppercase">Rate:</span>
                      <MoneyInput
                        value={item.unitPrice}
                        onChange={(val) => handleItemChange(idx, 'unitPrice', val)}
                        className="bg-background text-xs h-7 rounded-lg border border-border"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1 border-t border-border/60 text-xs pl-8">
                    <span className="text-muted-foreground">Line Total:</span>
                    <span className="font-mono font-bold text-foreground">
                      ₦{(Number(item.totalPrice) || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>
              ))}

              <div className="pt-1">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addItem}
                  className="w-full text-xs font-semibold h-8 space-x-1.5 border-dashed border-primary/40 text-primary hover:bg-primary/5 rounded-xl cursor-pointer"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>Add Another Item</span>
                </Button>
              </div>
            </div>

            {/* Optional Quotation Note / Remarks Trigger (Collapsible) */}
            <div className="border-t border-border p-4 bg-slate-50/40 dark:bg-slate-900/20">
              {!showNoteField && !notes ? (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowNoteField(true)}
                  className="text-xs text-muted-foreground hover:text-foreground font-medium flex items-center gap-1.5 px-2 h-7 rounded-lg cursor-pointer"
                >
                  <FileText className="h-3.5 w-3.5 text-muted-foreground" />
                  <span>+ Add Note / Remarks (Optional)</span>
                </Button>
              ) : (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs font-semibold flex items-center gap-1.5 text-foreground">
                      <FileText className="h-3.5 w-3.5 text-emerald-500" />
                      <span>Quotation Note / Terms / Remarks</span>
                    </Label>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setNotes('');
                        setShowNoteField(false);
                      }}
                      className="text-[11px] text-muted-foreground hover:text-rose-500 h-6 px-1.5 cursor-pointer"
                    >
                      Remove
                    </Button>
                  </div>
                  <Textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Type any instructions, terms, remarks, or validity notice to appear on this quotation..."
                    className="text-xs bg-background resize-none rounded-xl border border-border focus:border-emerald-500/60"
                    rows={2}
                  />
                </div>
              )}
            </div>

            {/* Optional Customer Signature Field (Collapsible) */}
            <div className="border-t border-border p-4 bg-slate-50/40 dark:bg-slate-900/20">
              {!showSignatureField && !customerSignature ? (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setShowSignatureField(true);
                    setIsEditingSignature(true);
                  }}
                  className="text-xs text-muted-foreground hover:text-foreground font-medium flex items-center gap-1.5 px-2 h-7 rounded-lg cursor-pointer"
                >
                  <PenTool className="h-3.5 w-3.5 text-muted-foreground" />
                  <span>+ Add Customer Signature (Optional)</span>
                </Button>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs font-semibold flex items-center gap-1.5 text-foreground">
                      <PenTool className="h-3.5 w-3.5 text-emerald-500" />
                      <span>Customer Signature</span>
                      <span className="text-[10px] text-muted-foreground font-normal">(Auto-fitted to printable area)</span>
                    </Label>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={removeCustomerSignature}
                      className="text-[11px] text-muted-foreground hover:text-rose-500 h-6 px-1.5 cursor-pointer"
                    >
                      Remove
                    </Button>
                  </div>

                  {customerSignature && !isEditingSignature ? (
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-white dark:bg-slate-950 border border-emerald-500/30">
                      <div className="h-14 w-44 border border-dashed border-border rounded-lg bg-slate-50 dark:bg-slate-900 flex items-center justify-center overflow-hidden p-1">
                        <img src={customerSignature} alt="Customer Signature" className="max-h-full max-w-full object-contain" />
                      </div>
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 text-xs font-semibold">
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          <span>Signature Captured & Fitted</span>
                        </div>
                        <p className="text-[11px] text-muted-foreground">Will appear above "Customer's Signature" on quotation documents.</p>
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setIsEditingSignature(true);
                          setHasDrawnCustomerSig(false);
                        }}
                        className="text-xs h-7 px-2.5 cursor-pointer"
                      >
                        Re-sign
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-2 p-3.5 rounded-2xl bg-white dark:bg-slate-950 border border-border">
                      <div className="flex items-center justify-between text-xs pb-1">
                        <span className="text-[11px] font-semibold text-foreground flex items-center gap-1.5">
                          <span>Sign on screen</span>
                        </span>
                        <button
                          type="button"
                          onClick={clearCustomerCanvas}
                          className="text-muted-foreground hover:text-rose-500 text-[11px] font-semibold transition-colors flex items-center gap-1 cursor-pointer"
                        >
                          <RotateCcw className="h-3 w-3" />
                          Clear
                        </button>
                      </div>

                      <div className="relative bg-slate-50 dark:bg-slate-900/50 rounded-xl border-2 border-dashed border-emerald-500/30 overflow-hidden touch-none flex justify-center py-2">
                        <canvas
                          ref={customerCanvasRef}
                          width={500}
                          height={130}
                          onMouseDown={startDrawingCustomerSig}
                          onMouseMove={drawCustomerSig}
                          onMouseUp={stopDrawingCustomerSig}
                          onMouseLeave={stopDrawingCustomerSig}
                          onTouchStart={startDrawingCustomerSig}
                          onTouchMove={drawCustomerSig}
                          onTouchEnd={stopDrawingCustomerSig}
                          className="cursor-crosshair bg-white dark:bg-slate-950 rounded-lg shadow-sm w-full max-w-[500px] h-[130px]"
                        />
                        <div className="absolute bottom-5 inset-x-8 border-b border-dashed border-slate-300 dark:border-slate-700 pointer-events-none flex justify-between px-2">
                          <span className="text-[9px] text-slate-400 select-none">Sign above line</span>
                          <span className="text-[9px] text-slate-400 select-none">Touch or mouse</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between mt-2">
                        <p className="text-[10px] text-muted-foreground">
                          {hasDrawnCustomerSig
                            ? 'Multiple strokes supported. Click "Done" when finished.'
                            : 'Customer signs with touch, stylus, or mouse. Auto-crops & fits cleanly.'}
                        </p>
                        <div className="flex items-center gap-2">
                          {customerSignature && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => setIsEditingSignature(false)}
                              className="text-xs h-7 px-2 text-muted-foreground cursor-pointer"
                            >
                              Cancel
                            </Button>
                          )}
                          <Button
                            type="button"
                            size="sm"
                            disabled={!hasDrawnCustomerSig}
                            onClick={() => captureAndFitSignature()}
                            className="text-xs h-7 px-3 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg shadow-sm disabled:opacity-40 cursor-pointer"
                          >
                            <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
                            Done
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Right Side: Sticky Summary Details Card (1 Col) - Matches Create New Invoice */}
        <div className="space-y-6 lg:sticky lg:top-20">
          <Card className="border-border bg-card shadow-sm rounded-2xl overflow-hidden">
            <CardHeader className="border-b border-border py-4 px-6 bg-slate-50 dark:bg-slate-900/35">
              <CardTitle className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                Summary Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-5 p-6">
              {/* Financial values */}
              <div className="space-y-2.5 font-mono text-sm border-b border-border pb-4">
                <div className="flex justify-between">
                  <span className="text-muted-foreground font-sans">Subtotal:</span>
                  <span className="font-bold text-foreground">
                    ₦{subtotal.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </span>
                </div>

                <div className="flex justify-between border-t border-border pt-3 text-lg font-bold text-[#0F172A] dark:text-[#F8FAFC]">
                  <span className="font-sans">Grand Total:</span>
                  <span>₦{grandTotal.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                </div>
              </div>

              {/* Amount in words */}
              <div className="space-y-1 bg-slate-50 dark:bg-slate-900/50 p-3.5 rounded-xl border border-border/60 text-xs">
                <h4 className="font-bold text-muted-foreground uppercase tracking-wider text-[9px]">Amount in Words</h4>
                <p className="font-semibold text-[#334155] dark:text-[#E2E8F0] font-sans capitalize italic leading-relaxed mt-0.5">
                  {numberToNairaWords(grandTotal)}
                </p>
              </div>

              {/* Action Operations Buttons - Save & Print is the primary operation with built-in preview/Save-as-PDF */}
              <div className="space-y-2.5 pt-1.5">
                <Button
                  type="button"
                  onClick={() => handleSubmit('print')}
                  disabled={isSubmitting}
                  className="w-full font-bold bg-[#10B981] hover:bg-[#059669] text-white py-5 text-xs rounded-xl shadow-sm cursor-pointer flex items-center justify-center space-x-1.5"
                >
                  {isSubmitting ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-1.5" />
                  ) : (
                    <Printer className="h-4 w-4 mr-1.5" />
                  )}
                  <span>Save & Print Quotation</span>
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  onClick={() => handleSubmit('draft')}
                  disabled={isSubmitting}
                  className="w-full font-semibold border-border hover:bg-secondary py-5 text-xs rounded-xl cursor-pointer flex items-center justify-center space-x-1.5"
                >
                  {isSubmitting ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-1.5" />
                  ) : (
                    <Check className="h-4 w-4 mr-1.5 text-muted-foreground" />
                  )}
                  <span>Save Quotation Draft</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Floating Draggable Calculator */}
      {showCalculator && <BasicCalculator onClose={() => setShowCalculator(false)} />}

      {/* Slide-over Weight Calculator */}
      <WeightCalculator isOpen={showWeightCalculator} onClose={() => setShowWeightCalculator(false)} />

      {/* AI Document & Jotting Note Import Modal */}
      <DocumentImportModal
        isOpen={showImportModal}
        onClose={() => setShowImportModal(false)}
        onApply={handleApplyExtractedData}
        hasExistingItems={items.some((it) => it.description.trim() !== '' || Number(it.quantity) > 0 || Number(it.unitPrice) > 0)}
      />
    </div>
  );
}
