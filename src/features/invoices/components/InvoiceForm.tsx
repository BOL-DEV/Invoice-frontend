'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useInvoice, FocusTarget } from '../context/InvoiceContext';
import { useInvoiceRows } from '../hooks/useInvoiceRows';
import { useInvoiceCalculations } from '../hooks/useInvoiceCalculations';
import { useInvoiceDetails, useCreateInvoice, useUpdateInvoice } from '../hooks/useInvoices';
import { useBusinessSettings } from '../../business/hooks/useBusinessSettings';
import { useModal } from '../../../components/ui/modal-provider';
import { numberToNairaWords } from '../utils/numberToWords';
import { usePermission } from '../../auth/hooks/usePermission';
import { CustomerSearchInput } from '../../../components/forms/CustomerSearchInput';
import { PhoneInput } from '../../../components/forms/PhoneInput';
import { QuantityInput } from '../../../components/forms/QuantityInput';
import { MoneyInput } from '../../../components/forms/MoneyInput';
import { BasicCalculator } from '../../../components/forms/BasicCalculator';
import { WeightCalculator } from '../../../components/forms/WeightCalculator';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { Button } from '../../../components/ui/button';
import { Textarea } from '../../../components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../../components/ui/table';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from '../../../components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../../../components/ui/dialog';
import { AxiosErrorLike } from '../../../types/api';
import { apiClient } from '../../../services/api/axios';
import { motion, AnimatePresence, LayoutGroup } from 'framer-motion';
import {
  Trash2,
  Plus,
  ArrowLeft,
  Loader2,
  Save,
  FileCheck,
  Calculator,
  Scale,
  DollarSign,
  Printer,
  FileSpreadsheet,
  FileDown,
  User,
  ShoppingBag,
} from 'lucide-react';

interface InvoiceFormProps {
  mode: 'create' | 'edit';
  invoiceId?: string;
}

export const InvoiceForm: React.FC<InvoiceFormProps> = ({ mode, invoiceId }) => {
  const router = useRouter();
  const modal = useModal();
  const { isAdmin } = usePermission();
  
  // Context state
  const {
    customerName,
    customerPhone,
    status,
    notes,
    items,
    charges,
    subtotal,
    total,
    setCustomerName,
    setCustomerPhone,
    setStatus,
    setNotes,
    resetInvoice,
    loadInvoice,
    getFormPayload,
    addCharge,
    deleteCharge,
    focusState,
    setFocus,
    moveFocusNext,
  } = useInvoice();

  const { rows, addRow, updateRow, deleteRow, handleKeyDown } = useInvoiceRows();
  const { formattedSubtotal, formattedTotal } = useInvoiceCalculations();

  // Mutations
  const createMutation = useCreateInvoice();
  const updateMutation = useUpdateInvoice(invoiceId || '');
  const { data: existingInvoice, isLoading: isDetailsLoading } = useInvoiceDetails(invoiceId || null);

  // Modals / Calculator States
  const [showCalculator, setShowCalculator] = useState(false);
  const [showWeightCalculator, setShowWeightCalculator] = useState(false);
  
  // Dynamic custom charge state
  const [chargeType, setChargeType] = useState<'custom' | 'vat' | 'wht'>('custom');
  const [newChargeName, setNewChargeName] = useState('');
  const [newChargeAmount, setNewChargeAmount] = useState(0);

  const { data: businessSettings } = useBusinessSettings();

  // Reactively calculate VAT/WHT when subtotal or preset changes
  useEffect(() => {
    if (chargeType === 'vat') {
      const vatPercent = businessSettings?.defaultVatPercentage ?? 7.5;
      setNewChargeName(`VAT (${vatPercent}%)`);
      const amount = (subtotal * Number(vatPercent)) / 100;
      setNewChargeAmount(Math.round(amount * 100) / 100);
    } else if (chargeType === 'wht') {
      const whtPercent = businessSettings?.defaultWhtPercentage ?? 2.0;
      setNewChargeName(`WHT (${whtPercent}%)`);
      const amount = -((subtotal * Number(whtPercent)) / 100);
      setNewChargeAmount(Math.round(amount * 100) / 100);
    }
  }, [chargeType, subtotal, businessSettings]);

  // Receipt Preview state
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [createdInvoiceId, setCreatedInvoiceId] = useState<string | null>(null);
  const [createdInvoiceNumber, setCreatedInvoiceNumber] = useState('');
  
  const isSubmitting = useRef(false);

  // Initial Autofocus on Customer Name
  useEffect(() => {
    setFocus({ type: 'header', fieldName: 'customerName' });
  }, [setFocus]);

  // Hydrate settings if editing
  useEffect(() => {
    if (mode === 'edit' && existingInvoice) {
      loadInvoice(existingInvoice);
    } else if (mode === 'create') {
      resetInvoice();
    }
  }, [mode, existingInvoice, loadInvoice, resetInvoice]);

  // Render input focus updates
  useEffect(() => {
    if (!focusState) return;

    let elementId = '';
    if (focusState.type === 'header') {
      elementId = `customer-${focusState.fieldName}`;
    } else {
      const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
      elementId = isMobile
        ? `row-mob-${focusState.rowIndex}-${focusState.fieldName}`
        : `row-${focusState.rowIndex}-${focusState.fieldName}`;
    }

    const element = document.getElementById(elementId);
    if (element) {
      element.focus();
      // If it's a standard text input, select the text for quick over-typing
      if (element instanceof HTMLInputElement) {
        element.select();
      }
    }
  }, [focusState]);

  const handleAddNewCharge = () => {
    if (!newChargeName.trim() || !newChargeAmount) {
      modal.alert('Input Error', 'Charge name and amount must be provided.', 'warning');
      return;
    }
    addCharge(newChargeName.trim(), newChargeAmount);
    setNewChargeName('');
    setNewChargeAmount(0);
    setChargeType('custom');
  };

  const handleSave = async (targetStatus: 'DRAFT' | 'FINALIZED') => {
    if (isSubmitting.current) return;

    if (!customerName.trim()) {
      modal.alert('Input Required', 'Customer Name is required to save invoice.', 'warning');
      return;
    }

    const filledRows = items.filter(
      (item) => item.description.trim() !== '' && item.quantity > 0 && item.unitPrice > 0
    );

    if (filledRows.length === 0) {
      modal.alert('Input Required', 'Please fill out at least one line item row with description, quantity, and price.', 'warning');
      return;
    }

    isSubmitting.current = true;
    setStatus(targetStatus);

    // Short timeout to let status state set
    setTimeout(async () => {
      const payload = {
        ...getFormPayload(),
        status: targetStatus,
      };
      try {
        if (mode === 'create') {
          const res = await createMutation.mutateAsync(payload);
          await modal.alert('Success', 'Invoice saved successfully', 'success');
          if (targetStatus === 'FINALIZED') {
            await handleExport(res.id, 'pdf', res.invoiceNumber);
          }
          router.push('/invoices');
        } else {
          const res = await updateMutation.mutateAsync(payload);
          await modal.alert('Success', 'Invoice updated successfully', 'success');
          if (targetStatus === 'FINALIZED') {
            await handleExport(invoiceId || '', 'pdf', res.invoiceNumber);
          }
          router.push('/invoices');
        }
      } catch (err) {
        modal.alert('Operation Failed', (err as AxiosErrorLike).response?.data?.error?.message || 'Failed to save invoice ledger', 'error');
      } finally {
        isSubmitting.current = false;
      }
    }, 50);
  };

  const handleExport = async (invoiceId: string, format: 'pdf' | 'excel' | 'image', invoiceNumber: string) => {
    try {
      if (format === 'image') {
        const response = await apiClient.get(`/api/printing/${invoiceId}/image`, {
          responseType: 'blob',
        });
        const blobUrl = window.URL.createObjectURL(response.data);
        
        const img = new Image();
        img.src = blobUrl;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const scale = 2; // Scale for high-resolution PNG
          canvas.width = 600 * scale;
          canvas.height = (img.naturalHeight || 800) * scale;
          
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.scale(scale, scale);
            ctx.drawImage(img, 0, 0);
            
            canvas.toBlob((pngBlob) => {
              if (pngBlob) {
                const pngUrl = window.URL.createObjectURL(pngBlob);
                const link = document.createElement('a');
                link.href = pngUrl;
                link.setAttribute('download', `invoice_${invoiceNumber}.png`);
                document.body.appendChild(link);
                link.click();
                link.remove();
                window.URL.revokeObjectURL(pngUrl);
              }
              window.URL.revokeObjectURL(blobUrl);
            }, 'image/png');
          } else {
            // Fallback to SVG
            const link = document.createElement('a');
            link.href = blobUrl;
            link.setAttribute('download', `invoice_${invoiceNumber}.svg`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(blobUrl);
          }
        };
        img.onerror = () => {
          const link = document.createElement('a');
          link.href = blobUrl;
          link.setAttribute('download', `invoice_${invoiceNumber}.svg`);
          document.body.appendChild(link);
          link.click();
          link.remove();
          window.URL.revokeObjectURL(blobUrl);
        };
        return;
      }

      const extension = format === 'pdf' ? 'pdf' : 'csv';
      const contentType = format === 'pdf' ? 'application/pdf' : 'text/csv';
      
      const response = await apiClient.get(`/api/printing/${invoiceId}/${format}`, {
        responseType: 'blob',
      });
      
      const blob = new Blob([response.data], { type: contentType });
      const url = window.URL.createObjectURL(blob);
      if (format === 'pdf') {
        window.open(url, '_blank');
      } else {
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `invoice_${invoiceNumber}.${extension}`);
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error(`Export to ${format} failed:`, error);
      modal.alert('Export Failed', (error as AxiosErrorLike).response?.data?.error?.message || `Failed to export invoice to ${format}`, 'error');
    }
  };

  if (mode === 'edit' && isDetailsLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-primary mb-2" />
        <p className="text-sm text-muted-foreground">Loading invoice ledger details...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto">
      {/* Top action bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-border pb-4">
        <div className="flex items-center space-x-3.5">
          <Button variant="outline" size="icon" onClick={() => router.back()} className="rounded-full h-9 w-9 shadow-sm">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h2 className="text-xl font-bold tracking-tight text-[#0F172A] dark:text-[#F8FAFC] font-heading">
              {mode === 'create' ? 'Create New Invoice' : `Edit Invoice #${existingInvoice?.invoiceNumber}`}
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Complete cashier ledger entry fields sequentially.
            </p>
          </div>
        </div>

        {/* Floating Utilities triggers */}
        <div className="flex space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowCalculator(!showCalculator)}
            className="space-x-1.5 font-semibold text-xs border-border bg-card rounded-xl h-9"
          >
            <Calculator className="h-4 w-4 text-muted-foreground" />
            <span>Open Calculator</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowWeightCalculator(true)}
            className="space-x-1.5 font-semibold text-xs border-border bg-card rounded-xl h-9"
          >
            <Scale className="h-4 w-4 text-muted-foreground" />
            <span>Weight Estimator</span>
          </Button>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6 items-start">
        {/* Left Side: Ledger Input Grid */}
        <div className="lg:col-span-2 space-y-6">
          {/* Card 1: Customer metadata */}
          <Card className="border-border bg-card shadow-premium rounded-2xl">
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
                <Label htmlFor="customer-customerName" className="text-xs font-semibold">
                  Customer Name <span className="text-rose-500">*</span>
                </Label>
                <CustomerSearchInput
                  id="customer-customerName"
                  value={customerName}
                  onChange={setCustomerName}
                  onSelectCustomer={(cust) => {
                    setCustomerName(cust.name);
                    if (cust.phone) setCustomerPhone(cust.phone);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      moveFocusNext();
                    }
                  }}
                  onFocus={() => setFocus({ type: 'header', fieldName: 'customerName' })}
                  placeholder="Type customer name or search..."
                  className="bg-background font-medium h-10 rounded-xl"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="customer-customerPhone" className="text-xs font-semibold">
                  Phone Number (Optional)
                </Label>
                <PhoneInput
                  id="customer-customerPhone"
                  value={customerPhone}
                  onChange={setCustomerPhone}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      moveFocusNext();
                    }
                  }}
                  onFocus={() => setFocus({ type: 'header', fieldName: 'customerPhone' })}
                  className="bg-background h-10 rounded-xl"
                />
              </div>
            </CardContent>
          </Card>

          {/* Card 2: Items Table Grid */}
          <Card className="border-border bg-card shadow-premium rounded-2xl overflow-hidden">
            <CardHeader className="flex flex-row justify-between items-center bg-secondary/15 border-b border-border py-3 px-6">
              <div className="flex items-center space-x-2.5">
                <div className="bg-primary/10 text-primary p-1.5 rounded-lg">
                  <ShoppingBag className="h-4 w-4" />
                </div>
                <CardTitle className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  Ledger Line Items
                </CardTitle>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={addRow}
                className="space-x-1.5 font-semibold text-xs border-primary text-primary hover:bg-primary/5 rounded-xl h-8 px-3"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Add Row</span>
              </Button>
            </CardHeader>
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto relative">
              <Table>
                <TableHeader className="bg-secondary/20">
                  <TableRow className="border-b border-border hover:bg-transparent">
                    <TableHead className="w-12 text-center text-[10px] uppercase font-bold text-muted-foreground">S/N</TableHead>
                    <TableHead className="w-28 text-right text-[10px] uppercase font-bold text-muted-foreground">Quantity</TableHead>
                    <TableHead className="w-[50%] text-[10px] uppercase font-bold text-muted-foreground">Description of Goods</TableHead>
                    <TableHead className="w-36 text-right text-[10px] uppercase font-bold text-muted-foreground">Rate</TableHead>
                    <TableHead className="w-36 text-right pr-4 text-[10px] uppercase font-bold text-muted-foreground">Amount</TableHead>
                    <TableHead className="w-12 text-center"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <LayoutGroup>
                    <AnimatePresence initial={false}>
                      {rows.map((item, idx) => {
                        const isActive = focusState?.type === 'item' && focusState.rowIndex === idx;
                        return (
                          <motion.tr
                            key={idx}
                            layout
                            initial={{ opacity: 0, y: 5 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -5 }}
                            transition={{ duration: 0.15 }}
                            className={`border-b border-border/60 transition-all duration-150 ${
                              isActive ? 'active-row-highlight' : 'hover:bg-slate-50/20 dark:hover:bg-slate-900/10'
                            }`}
                          >
                            {/* Position */}
                            <TableCell className="text-center font-mono text-xs text-muted-foreground select-none py-3">
                              {item.position}
                            </TableCell>

                            {/* Quantity */}
                            <TableCell className="py-2">
                              <QuantityInput
                                id={`row-${idx}-quantity`}
                                value={item.quantity}
                                onChange={(val) => updateRow(idx, { quantity: val })}
                                onKeyDown={(e) => handleKeyDown(e, idx, 'quantity')}
                                onFocus={() => setFocus({ type: 'item', rowIndex: idx, fieldName: 'quantity' })}
                                className="bg-background text-sm h-9 rounded-xl border border-border"
                              />
                            </TableCell>

                            {/* Description */}
                            <TableCell className="py-2">
                              <Input
                                id={`row-${idx}-description`}
                                type="text"
                                value={item.description}
                                onChange={(e) => updateRow(idx, { description: e.target.value })}
                                onKeyDown={(e) => handleKeyDown(e, idx, 'description')}
                                onFocus={() => setFocus({ type: 'item', rowIndex: idx, fieldName: 'description' })}
                                placeholder="e.g. 16mm Iron Rods"
                                className="bg-background text-sm font-medium h-9 rounded-xl border border-border"
                              />
                            </TableCell>

                            {/* Unit Price */}
                            <TableCell className="py-2">
                              <MoneyInput
                                id={`row-${idx}-unitPrice`}
                                value={item.unitPrice}
                                onChange={(val) => updateRow(idx, { unitPrice: val })}
                                onKeyDown={(e) => handleKeyDown(e, idx, 'unitPrice')}
                                onFocus={() => setFocus({ type: 'item', rowIndex: idx, fieldName: 'unitPrice' })}
                                className="bg-background text-sm h-9 rounded-xl border border-border"
                              />
                            </TableCell>

                            {/* Line Total */}
                            <TableCell className="text-right font-mono font-bold text-sm py-3 select-none pr-4 text-[#0F172A] dark:text-[#F8FAFC]">
                              ₦{item.totalPrice.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                            </TableCell>

                            {/* Delete action */}
                            <TableCell className="text-center py-2">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => deleteRow(idx)}
                                disabled={rows.length === 1}
                                className="h-8 w-8 rounded-full text-muted-foreground hover:text-rose-500 hover:bg-rose-500/10 transition-colors"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          </motion.tr>
                        );
                      })}
                    </AnimatePresence>
                  </LayoutGroup>
                </TableBody>
              </Table>
            </div>

            {/* Mobile Stacked Items Layout (visible on mobile only) */}
            <div className="md:hidden p-4 space-y-4 bg-slate-50/50 dark:bg-slate-900/10 border-t border-border">
              <AnimatePresence initial={false}>
                {rows.map((item, idx) => {
                  const isActive = focusState?.type === 'item' && focusState.rowIndex === idx;
                  return (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -5 }}
                      transition={{ duration: 0.15 }}
                      className={`p-4 rounded-xl border transition-all duration-155 space-y-3 relative ${
                        isActive
                          ? 'border-primary ring-2 ring-primary/20 bg-card'
                          : 'border-border bg-card shadow-sm'
                      }`}
                    >
                      {/* Card Header: Position & Delete */}
                      <div className="flex justify-between items-center border-b border-border/60 pb-2">
                        <span className="font-mono text-xs font-bold text-muted-foreground select-none">
                          Item #{item.position}
                        </span>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => deleteRow(idx)}
                          disabled={rows.length === 1}
                          className="h-8 w-8 rounded-full text-muted-foreground hover:text-rose-500 hover:bg-rose-500/10 transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>

                      {/* Description */}
                      <div className="space-y-1">
                        <Label htmlFor={`row-mob-${idx}-description`} className="text-[10px] font-bold text-muted-foreground uppercase">
                          Description
                        </Label>
                        <Input
                          id={`row-mob-${idx}-description`}
                          type="text"
                          value={item.description}
                          onChange={(e) => updateRow(idx, { description: e.target.value })}
                          onKeyDown={(e) => handleKeyDown(e, idx, 'description')}
                          onFocus={() => setFocus({ type: 'item', rowIndex: idx, fieldName: 'description' })}
                          placeholder="e.g. 16mm Iron Rods"
                          className="bg-background text-sm font-medium h-9 rounded-xl border border-border"
                        />
                      </div>

                      {/* Quantity & Unit Price in 2-Column Grid */}
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <Label htmlFor={`row-mob-${idx}-quantity`} className="text-[10px] font-bold text-muted-foreground uppercase">
                            Quantity
                          </Label>
                          <QuantityInput
                            id={`row-mob-${idx}-quantity`}
                            value={item.quantity}
                            onChange={(val) => updateRow(idx, { quantity: val })}
                            onKeyDown={(e) => handleKeyDown(e, idx, 'quantity')}
                            onFocus={() => setFocus({ type: 'item', rowIndex: idx, fieldName: 'quantity' })}
                            className="bg-background text-sm h-9 rounded-xl border border-border"
                          />
                        </div>
                        <div className="space-y-1">
                          <Label htmlFor={`row-mob-${idx}-unitPrice`} className="text-[10px] font-bold text-muted-foreground uppercase">
                            Unit Price
                          </Label>
                          <MoneyInput
                            id={`row-mob-${idx}-unitPrice`}
                            value={item.unitPrice}
                            onChange={(val) => updateRow(idx, { unitPrice: val })}
                            onKeyDown={(e) => handleKeyDown(e, idx, 'unitPrice')}
                            onFocus={() => setFocus({ type: 'item', rowIndex: idx, fieldName: 'unitPrice' })}
                            className="bg-background text-sm h-9 rounded-xl border border-border"
                          />
                        </div>
                      </div>

                      {/* Line Amount */}
                      <div className="flex justify-between items-center bg-slate-50 dark:bg-slate-900/50 p-2.5 rounded-lg border border-border/40 text-xs font-mono">
                        <span className="text-muted-foreground font-sans uppercase text-[9px] font-bold">Line Total:</span>
                        <span className="font-bold text-[#0F172A] dark:text-[#F8FAFC]">
                          ₦{item.totalPrice.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </span>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          </Card>
        </div>

        {/* Right Side: Charges & Final Summaries */}
        <div className="space-y-6 lg:sticky lg:top-20">
          {/* Card 3: Financial Summary Card */}
          <Card className="border-border bg-card shadow-premium rounded-2xl overflow-hidden">
            <CardHeader className="border-b border-border py-4 px-6 bg-slate-50 dark:bg-slate-900/35">
              <CardTitle className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                Summary details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-5 p-6">
              {/* Financial values */}
              <div className="space-y-2.5 font-mono text-sm border-b border-border pb-4">
                <div className="flex justify-between">
                  <span className="text-muted-foreground font-sans">Subtotal:</span>
                  <span className="font-bold text-foreground">₦{formattedSubtotal}</span>
                </div>

                {/* Additional Charges list */}
                {charges.length > 0 && (
                  <div className="space-y-2 border-t border-border/40 pt-2 pb-1">
                    {charges.map((charge, idx) => (
                      <div key={idx} className="flex justify-between text-xs items-center">
                        <span className="text-muted-foreground font-sans uppercase flex items-center">
                          <button
                            type="button"
                            onClick={() => deleteCharge(idx)}
                            className="text-rose-500 hover:text-rose-600 mr-1.5 p-0.5 rounded text-sm leading-none font-bold"
                          >
                            ×
                          </button>
                          <span>{charge.name}</span>
                        </span>
                        <span className={charge.amount < 0 ? 'text-emerald-500 font-semibold' : 'text-foreground'}>
                          {charge.amount < 0 ? '-' : ''}₦{Math.abs(charge.amount).toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex justify-between border-t border-border pt-3 text-lg font-bold text-[#0F172A] dark:text-[#F8FAFC]">
                  <span className="font-sans">Grand Total:</span>
                  <span>₦{formattedTotal}</span>
                </div>
              </div>

              {/* Amount in words */}
              <div className="space-y-1 bg-slate-50 dark:bg-slate-900/50 p-3.5 rounded-xl border border-border/60 text-xs">
                <h4 className="font-bold text-muted-foreground uppercase tracking-wider text-[9px]">Amount in Words</h4>
                <p className="font-semibold text-[#334155] dark:text-[#E2E8F0] font-sans capitalize italic leading-relaxed mt-0.5">
                  {numberToNairaWords(total)}
                </p>
              </div>

              {/* Add Custom Charge Section */}
              <div className="space-y-3 bg-[#F8FAFC] dark:bg-[#020617]/25 p-4 rounded-xl border border-border">
                <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider flex items-center">
                  <DollarSign className="h-4 w-4 mr-0.5 text-muted-foreground" />
                  <span>Add Additional Charge</span>
                </h4>
                <div className="space-y-2">
                  <div className="space-y-1">
                    <Label className="text-[9px] font-bold text-muted-foreground">Charge Type</Label>
                    <select
                      value={chargeType}
                      onChange={(e) => setChargeType(e.target.value as 'custom' | 'vat' | 'wht')}
                      className="w-full h-8 bg-background border border-border text-xs rounded-lg px-2 text-[#0F172A] dark:text-[#F8FAFC]"
                    >
                      <option value="custom">Custom Charge</option>
                      <option value="vat">VAT (Value Added Tax)</option>
                      <option value="wht">WHT (Withholding Tax Deduction)</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <Label htmlFor="charge-name" className="text-[9px] font-bold text-muted-foreground">Charge Name</Label>
                      <Input
                        id="charge-name"
                        type="text"
                        value={newChargeName}
                        onChange={(e) => setNewChargeName(e.target.value)}
                        placeholder="e.g. Discount"
                        disabled={chargeType !== 'custom'}
                        className="h-8 bg-background text-xs rounded-lg"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="charge-amount" className="text-[9px] font-bold text-muted-foreground">Amount (₦)</Label>
                      <Input
                        id="charge-amount"
                        type="number"
                        value={newChargeAmount || ''}
                        onChange={(e) => setNewChargeAmount(parseFloat(e.target.value) || 0)}
                        placeholder="Negative = discount"
                        disabled={chargeType !== 'custom'}
                        className="h-8 bg-background text-xs font-mono rounded-lg"
                      />
                    </div>
                  </div>
                  <Button
                    type="button"
                    onClick={handleAddNewCharge}
                    variant="outline"
                    className="w-full text-xs font-semibold h-8 space-x-1 rounded-lg"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    <span>Apply Charge</span>
                  </Button>
                </div>
              </div>

              {/* Notes */}
              <div className="space-y-1.5">
                <Label htmlFor="invoice-notes" className="text-xs font-semibold text-muted-foreground">
                  Cashier Transaction Notes
                </Label>
                <Textarea
                  id="invoice-notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Delivery terms..."
                  className="bg-background min-h-20 text-xs rounded-xl border border-border"
                />
              </div>

              {/* Action operations buttons */}
              <div className="space-y-2 pt-1.5">
                <Button
                  onClick={() => handleSave('DRAFT')}
                  disabled={createMutation.isPending || updateMutation.isPending}
                  variant="outline"
                  className="w-full font-semibold border-[#10B981] hover:bg-emerald-500/5 text-[#059669] dark:text-[#10B981] py-5 text-xs rounded-xl"
                >
                  {createMutation.isPending || updateMutation.isPending ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="mr-2 h-4 w-4" />
                  )}
                  <span>Save Invoice Draft</span>
                </Button>

                {(isAdmin || status === 'DRAFT' || mode === 'create') && (
                  <Button
                    onClick={() => handleSave('FINALIZED')}
                    disabled={createMutation.isPending || updateMutation.isPending}
                    className="w-full font-bold bg-[#10B981] hover:bg-[#059669] text-white py-5 text-xs rounded-xl shadow-premium"
                  >
                    {createMutation.isPending || updateMutation.isPending ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <FileCheck className="mr-2 h-4 w-4" />
                    )}
                    <span>Save & Finalize Invoice</span>
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Floating Draggable Calculator Render */}
      {showCalculator && <BasicCalculator onClose={() => setShowCalculator(false)} />}

      {/* Slide-over Weight Calculator Render */}
      <WeightCalculator isOpen={showWeightCalculator} onClose={() => setShowWeightCalculator(false)} />

      {/* Finalized Receipt Download Dialog popup */}
      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent className="max-w-2xl bg-card border-border rounded-2xl p-6 shadow-2xl">
          <DialogHeader className="border-b border-border pb-4">
            <DialogTitle className="font-mono font-bold text-lg flex items-center">
              <span>Finalized Invoice #{createdInvoiceNumber}</span>
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground mt-1">
              Backend successfully generated printable formats. Trigger downloads below:
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col items-center justify-center p-8 border rounded-2xl bg-[#D1FAE5]/10 border-dashed my-4 space-y-4">
            <div className="p-3 bg-emerald-500/10 text-emerald-500 rounded-full animate-bounce">
              <Printer className="h-10 w-10" />
            </div>
            <div className="text-center">
              <p className="font-bold text-sm text-[#0F172A] dark:text-[#F8FAFC]">Receipt creation finalized</p>
              <p className="text-xs text-muted-foreground mt-1">Invoice is permanently locked in ledger history.</p>
            </div>
          </div>

          <DialogFooter className="flex justify-between sm:justify-between items-center w-full gap-2 pt-2">
            <div className="flex gap-1.5">
              <Button
                onClick={() => handleExport(createdInvoiceId || '', 'pdf', createdInvoiceNumber)}
                variant="outline"
                size="sm"
                className="space-x-1.5 font-semibold text-xs rounded-xl shadow-sm"
              >
                <Printer className="h-3.5 w-3.5 text-muted-foreground" />
                <span>PDF</span>
              </Button>
              <Button
                onClick={() => handleExport(createdInvoiceId || '', 'excel', createdInvoiceNumber)}
                variant="outline"
                size="sm"
                className="space-x-1.5 font-semibold text-xs rounded-xl shadow-sm"
              >
                <FileSpreadsheet className="h-3.5 w-3.5 text-muted-foreground" />
                <span>CSV</span>
              </Button>
              <Button
                onClick={() => handleExport(createdInvoiceId || '', 'image', createdInvoiceNumber)}
                variant="outline"
                size="sm"
                className="space-x-1.5 font-semibold text-xs rounded-xl shadow-sm"
              >
                <FileDown className="h-3.5 w-3.5 text-muted-foreground" />
                <span>PNG</span>
              </Button>
            </div>
            <Button onClick={() => {
              setIsPreviewOpen(false);
              router.push('/invoices');
            }} className="font-semibold bg-[#0F172A] hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-slate-200 text-white dark:text-[#0F172A] rounded-xl text-xs px-4 py-2">
              Close View
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
