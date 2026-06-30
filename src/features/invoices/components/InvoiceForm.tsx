'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useInvoice, FocusTarget } from '../context/InvoiceContext';
import { useInvoiceRows } from '../hooks/useInvoiceRows';
import { useInvoiceCalculations } from '../hooks/useInvoiceCalculations';
import { useCreateInvoice, useUpdateInvoice, useInvoiceDetails } from '../hooks/useInvoices';
import { CustomerSearchInput } from '../../../components/forms/CustomerSearchInput';
import { PhoneInput } from '../../../components/forms/PhoneInput';
import { MoneyInput } from '../../../components/forms/MoneyInput';
import { QuantityInput } from '../../../components/forms/QuantityInput';
import { BasicCalculator } from '../../../components/forms/BasicCalculator';
import { WeightCalculator } from '../../../components/forms/WeightCalculator';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../../components/ui/table';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from '../../../components/ui/card';
import { Label } from '../../../components/ui/label';
import { Textarea } from '../../../components/ui/textarea';
import { usePermission } from '../../auth/hooks/usePermission';
import { numberToNairaWords } from '../utils/numberToWords';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../../../components/ui/dialog';
import { apiClient } from '../../../services/api/axios';
import { AxiosErrorLike } from '../../../types/api';
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
} from 'lucide-react';

interface InvoiceFormProps {
  mode: 'create' | 'edit';
  invoiceId?: string;
}

export const InvoiceForm: React.FC<InvoiceFormProps> = ({ mode, invoiceId }) => {
  const router = useRouter();
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
    updateCharge,
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
  const [newChargeName, setNewChargeName] = useState('');
  const [newChargeAmount, setNewChargeAmount] = useState(0);

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
    if (focusState) {
      let elementId = '';
      if (focusState.type === 'header') {
        elementId = `customer-${focusState.fieldName}`;
      } else {
        const { rowIndex, fieldName } = focusState;
        elementId = `row-${rowIndex}-${fieldName}`;
      }
      const element = document.getElementById(elementId);
      if (element) {
        element.focus();
      }
    }
  }, [focusState]);

  const handleAddNewCharge = () => {
    if (!newChargeName.trim()) {
      alert('Charge name is required.');
      return;
    }
    addCharge(newChargeName.trim(), newChargeAmount);
    setNewChargeName('');
    setNewChargeAmount(0);
  };

  const handleSave = async (targetStatus: 'DRAFT' | 'FINALIZED') => {
    if (isSubmitting.current) return;

    if (!customerName.trim()) {
      alert('Customer Name is required to save invoice.');
      return;
    }

    const filledRows = items.filter(
      (item) => item.description.trim() !== '' && item.quantity > 0 && item.unitPrice > 0
    );

    if (filledRows.length === 0) {
      alert('Please fill out at least one line item row with description, quantity, and price.');
      return;
    }

    isSubmitting.current = true;
    setStatus(targetStatus);

    // Short timeout to let status state set
    setTimeout(async () => {
      const payload = getFormPayload();
      try {
        if (mode === 'create') {
          const res = await createMutation.mutateAsync(payload);
          alert('Invoice saved successfully');
          if (targetStatus === 'FINALIZED') {
            setCreatedInvoiceId(res.id);
            setCreatedInvoiceNumber(res.invoiceNumber);
            setIsPreviewOpen(true);
          } else {
            router.push('/invoices');
          }
        } else {
          await updateMutation.mutateAsync(payload);
          alert('Invoice updated successfully');
          router.push('/invoices');
        }
      } catch (err) {
        alert((err as AxiosErrorLike).response?.data?.error?.message || 'Failed to save invoice ledger');
      } finally {
        isSubmitting.current = false;
      }
    }, 50);
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
      alert((error as AxiosErrorLike).response?.data?.error?.message || `Failed to export invoice to ${format}`);
    }
  };

  if (mode === 'edit' && isDetailsLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground mb-2" />
        <p className="text-sm text-muted-foreground">Loading invoice ledger details...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top action bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-border pb-4">
        <div className="flex items-center space-x-4">
          <Button variant="outline" size="icon" onClick={() => router.back()} className="rounded-full">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h2 className="text-xl font-bold tracking-tight">
              {mode === 'create' ? 'Create New Invoice' : `Edit Invoice #${existingInvoice?.invoiceNumber}`}
            </h2>
            <p className="text-sm text-muted-foreground">
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
            className="space-x-1.5 font-semibold text-xs border-border bg-card"
          >
            <Calculator className="h-4 w-4 text-muted-foreground" />
            <span>Open Calculator</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowWeightCalculator(true)}
            className="space-x-1.5 font-semibold text-xs border-border bg-card"
          >
            <Scale className="h-4 w-4 text-muted-foreground" />
            <span>Weight Estimator</span>
          </Button>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left Side: Ledger Input Grid */}
        <div className="lg:col-span-2 space-y-6">
          {/* Card 1: Customer metadata */}
          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                Customer Details
              </CardTitle>
            </CardHeader>
            <CardContent className="grid sm:grid-cols-2 gap-4">
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
                  className="bg-background font-medium"
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
                  className="bg-background"
                />
              </div>

            </CardContent>
          </Card>

          {/* Card 2: Items Table Grid */}
          <Card className="border-border bg-card overflow-hidden">
            <CardHeader className="flex flex-row justify-between items-center bg-secondary/10 border-b border-border py-4">
              <CardTitle className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                Ledger Line Items
              </CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={addRow}
                className="space-x-1 font-semibold text-xs border-primary hover:bg-primary/5"
              >
                <Plus className="h-3 w-3" />
                <span>Add Row</span>
              </Button>
            </CardHeader>
            <Table>
              <TableHeader>
                <TableRow className="bg-secondary/40">
                  <TableHead className="w-10 text-center">S/N</TableHead>
                  <TableHead className="w-[50%]">Description</TableHead>
                  <TableHead className="w-24 text-right">Quantity</TableHead>
                  <TableHead className="w-32 text-right">Unit Price</TableHead>
                  <TableHead className="w-32 text-right pr-4">Amount</TableHead>
                  <TableHead className="w-10 text-center"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((item, idx) => (
                  <TableRow key={idx} className="hover:bg-transparent">
                    {/* Position */}
                    <TableCell className="text-center font-mono text-xs text-muted-foreground select-none pt-4">
                      {item.position}
                    </TableCell>

                    {/* Description */}
                    <TableCell className="pt-2">
                      <Input
                        id={`row-${idx}-description`}
                        type="text"
                        value={item.description}
                        onChange={(e) => updateRow(idx, { description: e.target.value })}
                        onKeyDown={(e) => handleKeyDown(e, idx, 'description')}
                        onFocus={() => setFocus({ type: 'item', rowIndex: idx, fieldName: 'description' })}
                        placeholder="e.g. 16mm Iron Rods"
                        className="bg-background text-sm font-medium"
                      />
                    </TableCell>

                    {/* Quantity */}
                    <TableCell className="pt-2">
                      <QuantityInput
                        id={`row-${idx}-quantity`}
                        value={item.quantity}
                        onChange={(val) => updateRow(idx, { quantity: val })}
                        onKeyDown={(e) => handleKeyDown(e, idx, 'quantity')}
                        onFocus={() => setFocus({ type: 'item', rowIndex: idx, fieldName: 'quantity' })}
                        className="bg-background text-sm"
                      />
                    </TableCell>

                    {/* Unit Price */}
                    <TableCell className="pt-2">
                      <MoneyInput
                        id={`row-${idx}-unitPrice`}
                        value={item.unitPrice}
                        onChange={(val) => updateRow(idx, { unitPrice: val })}
                        onKeyDown={(e) => handleKeyDown(e, idx, 'unitPrice')}
                        onFocus={() => setFocus({ type: 'item', rowIndex: idx, fieldName: 'unitPrice' })}
                        className="bg-background text-sm"
                      />
                    </TableCell>

                    {/* Line Total */}
                    <TableCell className="text-right font-mono font-bold text-sm pt-4 select-none pr-4">
                      ₦{item.totalPrice.toFixed(2)}
                    </TableCell>

                    {/* Delete action */}
                    <TableCell className="text-center pt-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => deleteRow(idx)}
                        disabled={rows.length === 1}
                        className="h-8 w-8 text-muted-foreground hover:text-rose-500 hover:bg-rose-500/10"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </div>

        {/* Right Side: Charges & Final Summaries */}
        <div className="space-y-6">
          {/* Card 3: Financial Summary Card */}
          <Card className="border-border bg-card shadow-lg sticky top-20">
            <CardHeader className="border-b border-border py-4">
              <CardTitle className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                Summary details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
              {/* Financial values */}
              <div className="space-y-3 font-mono text-sm border-b border-border pb-4">
                <div className="flex justify-between">
                  <span className="text-muted-foreground font-sans">Subtotal:</span>
                  <span className="font-bold">₦{formattedSubtotal}</span>
                </div>

                {/* Additional Charges list */}
                {charges.length > 0 && (
                  <div className="space-y-2 border-t border-border/40 pt-2 pb-1">
                    {charges.map((charge, idx) => (
                      <div key={idx} className="flex justify-between text-xs items-center">
                        <span className="text-muted-foreground font-sans uppercase flex items-center space-x-1">
                          <button
                            type="button"
                            onClick={() => deleteCharge(idx)}
                            className="text-rose-500 hover:text-rose-600 mr-1 p-0.5 rounded"
                          >
                            ×
                          </button>
                          <span>{charge.name}</span>
                        </span>
                        <span className={charge.amount < 0 ? 'text-emerald-500 font-semibold' : ''}>
                          {charge.amount < 0 ? '-' : ''}₦{Math.abs(charge.amount).toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex justify-between border-t border-border pt-3 text-lg font-bold text-foreground">
                  <span className="font-sans">Grand Total:</span>
                  <span>₦{formattedTotal}</span>
                </div>
              </div>

              {/* Amount in words */}
              <div className="space-y-1 bg-secondary/35 p-3 rounded-lg border border-border/40 text-xs">
                <h4 className="font-bold text-muted-foreground uppercase tracking-wide">Amount in Words</h4>
                <p className="font-semibold text-foreground font-sans capitalize italic leading-relaxed">
                  {numberToNairaWords(total)}
                </p>
              </div>

              {/* Add Custom Charge Section */}
              <div className="space-y-3 bg-secondary/15 p-4 rounded-xl border border-border/50">
                <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center">
                  <DollarSign className="h-4 w-4 mr-1 text-muted-foreground" />
                  <span>Add Additional Charge</span>
                </h4>
                <div className="space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <Label htmlFor="charge-name" className="text-[10px] font-bold">Charge Name</Label>
                      <Input
                        id="charge-name"
                        type="text"
                        value={newChargeName}
                        onChange={(e) => setNewChargeName(e.target.value)}
                        placeholder="e.g. Loading, Discount"
                        className="h-8 bg-background text-xs"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="charge-amount" className="text-[10px] font-bold">Amount (₦)</Label>
                      <Input
                        id="charge-amount"
                        type="number"
                        value={newChargeAmount || ''}
                        onChange={(e) => setNewChargeAmount(parseFloat(e.target.value) || 0)}
                        placeholder="Negative = discount"
                        className="h-8 bg-background text-xs font-mono"
                      />
                    </div>
                  </div>
                  <Button
                    type="button"
                    onClick={handleAddNewCharge}
                    variant="outline"
                    className="w-full text-xs font-semibold h-8 space-x-1"
                  >
                    <Plus className="h-3 w-3" />
                    <span>Apply Charge</span>
                  </Button>
                </div>
              </div>

              {/* Notes */}
              <div className="space-y-1.5">
                <Label htmlFor="invoice-notes" className="text-xs font-semibold">
                  Cashier Transaction Notes
                </Label>
                <Textarea
                  id="invoice-notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Transport delivery arrangements, weight calculations details..."
                  className="bg-background min-h-20 text-xs"
                />
              </div>

              {/* Action operations buttons */}
              <div className="space-y-2 pt-2">
                <Button
                  onClick={() => handleSave('DRAFT')}
                  disabled={createMutation.isPending || updateMutation.isPending}
                  variant="outline"
                  className="w-full font-semibold border-primary hover:bg-primary/5 py-6 text-sm"
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
                    className="w-full font-bold bg-primary text-primary-foreground py-6 text-sm"
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
        <DialogContent className="max-w-2xl bg-card border-border">
          <DialogHeader>
            <DialogTitle className="font-mono font-bold text-lg flex items-center">
              <span>Finalized Invoice #{createdInvoiceNumber}</span>
            </DialogTitle>
            <DialogDescription>
              Backend successfully generated printable formats. Trigger downloads below:
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col items-center justify-center p-8 border rounded-xl bg-secondary/10 border-dashed my-4 space-y-4">
            <Printer className="h-12 w-12 text-muted-foreground animate-pulse" />
            <div className="text-center">
              <p className="font-bold text-sm">Receipt creation finalized</p>
              <p className="text-xs text-muted-foreground mt-1">Invoice is permanently locked in ledger history.</p>
            </div>
          </div>

          <DialogFooter className="flex justify-between sm:justify-between items-center w-full gap-2">
            <div className="flex gap-2">
              <Button
                onClick={() => handleExport(createdInvoiceId || '', 'pdf', createdInvoiceNumber)}
                variant="outline"
                size="sm"
                className="space-x-1 font-semibold"
              >
                <Printer className="h-4 w-4" />
                <span>PDF Document</span>
              </Button>
              <Button
                onClick={() => handleExport(createdInvoiceId || '', 'excel', createdInvoiceNumber)}
                variant="outline"
                size="sm"
                className="space-x-1 font-semibold"
              >
                <FileSpreadsheet className="h-4 w-4" />
                <span>CSV Sheet</span>
              </Button>
              <Button
                onClick={() => handleExport(createdInvoiceId || '', 'image', createdInvoiceNumber)}
                variant="outline"
                size="sm"
                className="space-x-1 font-semibold"
              >
                <FileDown className="h-4 w-4" />
                <span>SVG Image</span>
              </Button>
            </div>
            <Button onClick={() => {
              setIsPreviewOpen(false);
              router.push('/invoices');
            }} className="font-semibold bg-zinc-950 text-white hover:bg-zinc-800">
              Close View
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
