'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { quotationService } from '../../../../services/quotation.service';
import { Button } from '../../../../components/ui/button';
import { Input } from '../../../../components/ui/input';
import { Card, CardHeader, CardTitle, CardContent } from '../../../../components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../../../components/ui/table';
import { useModal } from '../../../../components/ui/modal-provider';
import { downloadDocumentPDF, printDocumentPDF } from '../../../../lib/document-download';
import {
  FileSpreadsheet,
  Plus,
  Trash2,
  ArrowLeft,
  Loader2,
  Printer,
  Check,
  User,
  ShoppingBag,
  FileDown,
} from 'lucide-react';

interface FormItem {
  position: number;
  quantity: number | '';
  description: string;
  totalMeters: string;
  unitPrice: number | '';
  totalPrice: number;
}

export default function NewQuotationPage() {
  const router = useRouter();
  const modal = useModal();

  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Start with 3 rows just like invoice creation
  const [items, setItems] = useState<FormItem[]>([
    { position: 1, quantity: '', description: '', totalMeters: '', unitPrice: '', totalPrice: 0 },
    { position: 2, quantity: '', description: '', totalMeters: '', unitPrice: '', totalPrice: 0 },
    { position: 3, quantity: '', description: '', totalMeters: '', unitPrice: '', totalPrice: 0 },
  ]);

  const handleItemChange = (index: number, field: keyof FormItem, value: any) => {
    setItems((prev) => {
      const updated = [...prev];
      const item = { ...updated[index], [field]: value };

      if (field === 'quantity' || field === 'unitPrice') {
        const qty = typeof item.quantity === 'number' ? item.quantity : 0;
        const rate = typeof item.unitPrice === 'number' ? item.unitPrice : 0;
        item.totalPrice = Math.round(qty * rate * 100) / 100;
      }

      updated[index] = item;
      return updated;
    });
  };

  const addItem = () => {
    setItems((prev) => [
      ...prev,
      { position: prev.length + 1, quantity: '', description: '', totalMeters: '', unitPrice: '', totalPrice: 0 },
    ]);
  };

  const removeItem = (index: number) => {
    if (items.length <= 1) {
      modal.alert('Cannot Remove', 'A quotation must have at least one item line', 'warning');
      return;
    }
    setItems((prev) =>
      prev.filter((_, i) => i !== index).map((item, idx) => ({ ...item, position: idx + 1 }))
    );
  };

  const filledItems = items.filter(
    (it) => it.description.trim() !== '' || (typeof it.quantity === 'number' && it.quantity > 0)
  );

  const subtotal = items.reduce((sum, item) => sum + (Number(item.totalPrice) || 0), 0);
  const grandTotal = subtotal;

  const handleSubmit = async (action: 'download' | 'print' | 'draft' = 'download') => {
    if (!customerName.trim()) {
      modal.alert('Validation Error', 'Customer / Company Name is required', 'warning');
      return;
    }

    const validItems = items.filter(
      (it) => it.description.trim() && Number(it.quantity) > 0 && Number(it.unitPrice) >= 0
    );

    if (validItems.length === 0) {
      modal.alert(
        'Invalid Items',
        'Please enter at least one item with a description, quantity greater than 0, and a valid rate.',
        'warning'
      );
      return;
    }

    try {
      setIsSubmitting(true);
      const quotation = await quotationService.create({
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim() || null,
        status: action === 'draft' ? 'DRAFT' : 'SENT',
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

      if (action === 'download') {
        try {
          await downloadDocumentPDF(
            `/api/printing/quotation/${quotation.id}/pdf`,
            `quotation_${quotation.quotationNumber}.pdf`
          );
        } catch (downloadErr) {
          console.warn('PDF direct download fallback:', downloadErr);
        }
      } else if (action === 'print') {
        try {
          await printDocumentPDF(`/api/printing/quotation/${quotation.id}/pdf`);
        } catch (printErr) {
          window.open(quotationService.getPDFUrl(quotation.id), '_blank');
        }
      }

      modal.alert(
        'Quotation Saved',
        `Quotation ${quotation.quotationNumber} has been successfully created.${action === 'download' ? ' Your PDF document has been downloaded.' : ''}`,
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
    <div className="space-y-6 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Top Navigation */}
      <div className="flex items-center justify-between">
        <Link
          href="/quotations"
          className="flex items-center space-x-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Quotations</span>
        </Link>
      </div>

      {/* Page Title */}
      <div className="flex items-center space-x-2.5">
        <div className="p-2.5 bg-blue-500/10 text-blue-600 rounded-xl">
          <FileSpreadsheet className="h-6 w-6" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Create New Quotation</h1>
          <p className="text-sm text-muted-foreground">
            Generate a formal price estimate with customer details and line items
          </p>
        </div>
      </div>

      {/* Form Container */}
      <div className="space-y-6">
        {/* Customer Information Card */}
        <Card className="p-5 rounded-2xl border-border bg-card shadow-sm space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
            <User className="h-4 w-4 text-primary" />
            <span>Customer Information</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-muted-foreground">Customer / Company Name *</label>
              <Input
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="e.g. Dangote Construction Ltd"
                className="mt-1 h-10 rounded-xl text-sm"
                required
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-muted-foreground">Phone Number (Optional)</label>
              <Input
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                placeholder="e.g. 08034071931"
                className="mt-1 h-10 rounded-xl text-sm"
              />
            </div>
          </div>
        </Card>

        {/* Quoted Items Table Card - Styled Exactly Like Invoice Creation */}
        <Card className="border-border bg-card shadow-sm rounded-2xl overflow-hidden">
          <CardHeader className="flex flex-row justify-between items-center bg-secondary/15 border-b border-border py-3 px-4 sm:px-6">
            <div className="flex items-center space-x-2.5">
              <div className="bg-primary/10 text-primary p-1.5 rounded-lg shrink-0">
                <ShoppingBag className="h-4 w-4" />
              </div>
              <CardTitle className="text-xs sm:text-[10px] font-bold uppercase tracking-wider text-muted-foreground whitespace-nowrap">
                Quoted Line Items
              </CardTitle>
            </div>

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
          </CardHeader>

          {/* Desktop Table View */}
          <div className="hidden md:block overflow-x-auto">
            <Table>
              <TableHeader className="bg-secondary/20">
                <TableRow className="border-b border-border hover:bg-transparent">
                  <TableHead className="w-12 text-center text-[10px] uppercase font-bold text-muted-foreground">
                    S/N
                  </TableHead>
                  <TableHead className="w-28 text-right text-[10px] uppercase font-bold text-muted-foreground">
                    Quantity *
                  </TableHead>
                  <TableHead className="text-[10px] uppercase font-bold text-muted-foreground">
                    Description of Goods *
                  </TableHead>
                  <TableHead className="w-32 text-right text-[10px] uppercase font-bold text-muted-foreground">
                    Total Meters
                  </TableHead>
                  <TableHead className="w-36 text-right text-[10px] uppercase font-bold text-muted-foreground">
                    Rate (₦) *
                  </TableHead>
                  <TableHead className="w-36 text-right pr-4 text-[10px] uppercase font-bold text-muted-foreground">
                    Amount (₦)
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

                    {/* Quantity */}
                    <TableCell className="py-2">
                      <Input
                        type="number"
                        step="any"
                        value={item.quantity}
                        onChange={(e) =>
                          handleItemChange(
                            idx,
                            'quantity',
                            e.target.value === '' ? '' : parseFloat(e.target.value) || 0
                          )
                        }
                        placeholder="0"
                        className="bg-background text-sm font-medium h-9 rounded-xl border border-border text-right"
                      />
                    </TableCell>

                    {/* Description of Goods */}
                    <TableCell className="py-2">
                      <Input
                        type="text"
                        value={item.description}
                        onChange={(e) => handleItemChange(idx, 'description', e.target.value)}
                        placeholder="e.g. 15mmX3m U-Channel"
                        className="bg-background text-sm font-medium h-9 rounded-xl border border-border"
                      />
                    </TableCell>

                    {/* Total Meters */}
                    <TableCell className="py-2">
                      <Input
                        type="text"
                        value={item.totalMeters}
                        onChange={(e) => handleItemChange(idx, 'totalMeters', e.target.value)}
                        placeholder="e.g. 22"
                        className="bg-background text-sm font-medium h-9 rounded-xl border border-border text-right"
                      />
                    </TableCell>

                    {/* Rate */}
                    <TableCell className="py-2">
                      <Input
                        type="number"
                        step="any"
                        value={item.unitPrice}
                        onChange={(e) =>
                          handleItemChange(
                            idx,
                            'unitPrice',
                            e.target.value === '' ? '' : parseFloat(e.target.value) || 0
                          )
                        }
                        placeholder="0.00"
                        className="bg-background text-sm font-medium h-9 rounded-xl border border-border text-right"
                      />
                    </TableCell>

                    {/* Amount */}
                    <TableCell className="text-right font-mono font-bold text-sm py-3 select-none pr-4 text-foreground">
                      ₦{(Number(item.totalPrice) || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </TableCell>

                    {/* Action */}
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
          <div className="md:hidden p-3 space-y-3 bg-slate-50/50 dark:bg-slate-900/10 border-t border-border">
            {items.map((item, idx) => (
              <div
                key={idx}
                className="p-3 rounded-xl border border-border bg-card space-y-2.5 shadow-sm"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="w-6 h-6 rounded-md bg-secondary/80 text-[11px] font-mono font-bold flex items-center justify-center text-muted-foreground">
                    #{idx + 1}
                  </span>
                  <Input
                    type="text"
                    value={item.description}
                    onChange={(e) => handleItemChange(idx, 'description', e.target.value)}
                    placeholder="Description (e.g. 15mmX3m)..."
                    className="h-9 rounded-lg text-xs flex-1"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeItem(idx)}
                    disabled={items.length === 1}
                    className="h-8 w-8 text-muted-foreground hover:text-rose-500"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="text-[10px] font-semibold text-muted-foreground">Qty *</label>
                    <Input
                      type="number"
                      value={item.quantity}
                      onChange={(e) =>
                        handleItemChange(
                          idx,
                          'quantity',
                          e.target.value === '' ? '' : parseFloat(e.target.value) || 0
                        )
                      }
                      placeholder="0"
                      className="h-8 rounded-lg text-xs text-right mt-0.5"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-semibold text-muted-foreground">Total Meters</label>
                    <Input
                      type="text"
                      value={item.totalMeters}
                      onChange={(e) => handleItemChange(idx, 'totalMeters', e.target.value)}
                      placeholder="22m"
                      className="h-8 rounded-lg text-xs text-right mt-0.5"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-semibold text-muted-foreground">Rate (₦) *</label>
                    <Input
                      type="number"
                      value={item.unitPrice}
                      onChange={(e) =>
                        handleItemChange(
                          idx,
                          'unitPrice',
                          e.target.value === '' ? '' : parseFloat(e.target.value) || 0
                        )
                      }
                      placeholder="0.00"
                      className="h-8 rounded-lg text-xs text-right mt-0.5"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1 border-t border-border/60 text-xs">
                  <span className="text-muted-foreground">Line Total:</span>
                  <span className="font-mono font-bold text-foreground">
                    ₦{(Number(item.totalPrice) || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Grand Total Summary Row */}
          <div className="p-4 sm:px-6 bg-secondary/30 border-t border-border flex justify-between items-center text-sm font-bold text-foreground">
            <span className="text-xs uppercase tracking-wider text-muted-foreground">Grand Total:</span>
            <span className="text-xl font-bold font-mono text-emerald-600 dark:text-emerald-400">
              ₦{grandTotal.toLocaleString('en-NG', { minimumFractionDigits: 2 })}
            </span>
          </div>
        </Card>

        {/* Notes Card */}
        <Card className="p-5 rounded-2xl border-border bg-card shadow-sm space-y-2">
          <label className="text-xs font-semibold text-muted-foreground">Quotation Terms & Notes</label>
          <Input
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="e.g. Prices are subject to market changes after 7 days. Transportation not included."
            className="h-10 rounded-xl text-xs"
          />
        </Card>

        {/* Footer Actions */}
        <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-2.5 pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push('/quotations')}
            disabled={isSubmitting}
            className="w-full sm:w-auto rounded-xl h-10 px-5 text-xs font-semibold cursor-pointer"
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="secondary"
            onClick={() => handleSubmit('draft')}
            disabled={isSubmitting}
            className="w-full sm:w-auto rounded-xl h-10 px-5 text-xs font-semibold cursor-pointer"
          >
            {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin mr-1.5" /> : <Check className="h-4 w-4 mr-1.5" />}
            <span>Save as Draft</span>
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => handleSubmit('print')}
            disabled={isSubmitting}
            className="w-full sm:w-auto rounded-xl h-10 px-4 text-xs font-semibold border-border hover:bg-secondary cursor-pointer flex items-center justify-center space-x-1.5"
          >
            <Printer className="h-4 w-4 text-muted-foreground" />
            <span>Print</span>
          </Button>
          <Button
            type="button"
            onClick={() => handleSubmit('download')}
            disabled={isSubmitting}
            className="w-full sm:w-auto rounded-xl h-10 px-6 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm cursor-pointer flex items-center justify-center space-x-1.5"
          >
            {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin mr-1.5" /> : <FileDown className="h-4 w-4 mr-1.5" />}
            <span>Save & Download Quotation</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
