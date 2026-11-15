'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { quotationService } from '../../../../services/quotation.service';
import { Button } from '../../../../components/ui/button';
import { Input } from '../../../../components/ui/input';
import { Card } from '../../../../components/ui/card';
import { useModal } from '../../../../components/ui/modal-provider';
import {
  FileSpreadsheet,
  Plus,
  Trash2,
  ArrowLeft,
  Loader2,
  Calendar,
  Check,
  User,
  Calculator,
} from 'lucide-react';

interface FormItem {
  position: number;
  description: string;
  quantity: number | '';
  unitPrice: number | '';
  totalPrice: number;
  metrics: string;
}

export default function NewQuotationPage() {
  const router = useRouter();
  const modal = useModal();

  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [validUntil, setValidUntil] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [items, setItems] = useState<FormItem[]>([
    { position: 1, description: '', quantity: 1, unitPrice: '', totalPrice: 0, metrics: '' },
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
      { position: prev.length + 1, description: '', quantity: 1, unitPrice: '', totalPrice: 0, metrics: '' },
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

  const subtotal = items.reduce((sum, item) => sum + (Number(item.totalPrice) || 0), 0);
  const grandTotal = subtotal;

  const handleSubmit = async (andPrint = false) => {
    if (!customerName.trim()) {
      modal.alert('Validation Error', 'Customer Name is required', 'warning');
      return;
    }

    const invalidItem = items.find(
      (it) => !it.description.trim() || Number(it.quantity) <= 0 || Number(it.unitPrice) < 0
    );
    if (invalidItem) {
      modal.alert(
        'Invalid Items',
        'Please ensure each line item has a valid description, quantity greater than 0, and non-negative unit price.',
        'warning'
      );
      return;
    }

    try {
      setIsSubmitting(true);
      const quotation = await quotationService.create({
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim() || null,
        customerEmail: customerEmail.trim() || null,
        customerAddress: customerAddress.trim() || null,
        validUntil: validUntil ? new Date(validUntil).toISOString() : null,
        notes: notes.trim() || null,
        subtotal,
        total: grandTotal,
        items: items.map((it, idx) => ({
          position: idx + 1,
          description: it.description.trim(),
          quantity: Number(it.quantity),
          unitPrice: Number(it.unitPrice),
          totalPrice: Number(it.totalPrice),
          metrics: it.metrics.trim() || null,
        })),
      });

      if (andPrint) {
        window.open(quotationService.getPDFUrl(quotation.id), '_blank');
      }

      modal.alert(
        'Quotation Created',
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
            <span>Customer & Validity Information</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-muted-foreground">Customer / Company Name *</label>
              <Input
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="e.g. Dangote Construction Ltd"
                className="mt-1 h-9 rounded-xl text-sm"
                required
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-muted-foreground">Phone Number</label>
              <Input
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                placeholder="e.g. 08034071931"
                className="mt-1 h-9 rounded-xl text-sm"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-muted-foreground">Email Address</label>
              <Input
                type="email"
                value={customerEmail}
                onChange={(e) => setCustomerEmail(e.target.value)}
                placeholder="e.g. procurement@company.com"
                className="mt-1 h-9 rounded-xl text-sm"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-muted-foreground">Valid Until Date</label>
              <Input
                type="date"
                value={validUntil}
                onChange={(e) => setValidUntil(e.target.value)}
                className="mt-1 h-9 rounded-xl text-sm"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="text-xs font-semibold text-muted-foreground">Customer Address</label>
              <Input
                value={customerAddress}
                onChange={(e) => setCustomerAddress(e.target.value)}
                placeholder="e.g. Plot 15 Commercial District, Lagos"
                className="mt-1 h-9 rounded-xl text-sm"
              />
            </div>
          </div>
        </Card>

        {/* Quoted Items Table Card */}
        <Card className="p-5 rounded-2xl border-border bg-card shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <Calculator className="h-4 w-4 text-primary" />
              <span>Quoted Line Items</span>
            </h3>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addItem}
              className="rounded-xl text-xs font-semibold h-8 cursor-pointer"
            >
              <Plus className="h-3.5 w-3.5 mr-1" />
              <span>Add Item Line</span>
            </Button>
          </div>

          <div className="border border-border rounded-xl overflow-hidden divide-y divide-border">
            <div className="p-2.5 grid grid-cols-12 bg-secondary/40 text-[11px] font-bold text-muted-foreground gap-2">
              <span className="col-span-4 sm:col-span-5">Description *</span>
              <span className="col-span-2 sm:col-span-2 text-center">Qty *</span>
              <span className="col-span-2 sm:col-span-2 text-center">Unit / Metric</span>
              <span className="col-span-3 sm:col-span-2 text-right">Rate (₦) *</span>
              <span className="col-span-1 sm:col-span-1 text-center">Action</span>
            </div>

            {items.map((item, idx) => (
              <div key={idx} className="p-2.5 grid grid-cols-12 gap-2 items-center bg-card text-xs">
                <div className="col-span-4 sm:col-span-5">
                  <Input
                    value={item.description}
                    onChange={(e) => handleItemChange(idx, 'description', e.target.value)}
                    placeholder="e.g. 16mm x 12m Iron Rod"
                    className="h-8 rounded-lg text-xs"
                  />
                </div>
                <div className="col-span-2 sm:col-span-2">
                  <Input
                    type="number"
                    step="any"
                    value={item.quantity}
                    onChange={(e) =>
                      handleItemChange(idx, 'quantity', e.target.value === '' ? '' : parseFloat(e.target.value))
                    }
                    placeholder="Qty"
                    className="h-8 rounded-lg text-xs text-center"
                  />
                </div>
                <div className="col-span-2 sm:col-span-2">
                  <Input
                    value={item.metrics}
                    onChange={(e) => handleItemChange(idx, 'metrics', e.target.value)}
                    placeholder="e.g. Meters, Pcs"
                    className="h-8 rounded-lg text-xs text-center"
                  />
                </div>
                <div className="col-span-3 sm:col-span-2">
                  <Input
                    type="number"
                    step="any"
                    value={item.unitPrice}
                    onChange={(e) =>
                      handleItemChange(idx, 'unitPrice', e.target.value === '' ? '' : parseFloat(e.target.value))
                    }
                    placeholder="0.00"
                    className="h-8 rounded-lg text-xs text-right"
                  />
                </div>
                <div className="col-span-1 sm:col-span-1 flex justify-center">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeItem(idx)}
                    className="h-7 w-7 p-0 rounded-lg text-red-500 hover:bg-red-500/10 cursor-pointer"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            ))}

            {/* Total Row */}
            <div className="p-3 bg-secondary/30 flex justify-between items-center text-sm font-bold text-foreground">
              <span>Grand Total:</span>
              <span className="text-lg text-primary">
                ₦{subtotal.toLocaleString('en-NG', { minimumFractionDigits: 2 })}
              </span>
            </div>
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
        <div className="flex items-center justify-end space-x-3 pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push('/quotations')}
            disabled={isSubmitting}
            className="rounded-xl h-10 px-5 text-xs font-semibold cursor-pointer"
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="secondary"
            onClick={() => handleSubmit(false)}
            disabled={isSubmitting}
            className="rounded-xl h-10 px-5 text-xs font-semibold cursor-pointer"
          >
            {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin mr-1.5" /> : <Check className="h-4 w-4 mr-1.5" />}
            <span>Save Quotation</span>
          </Button>
          <Button
            type="button"
            onClick={() => handleSubmit(true)}
            disabled={isSubmitting}
            className="rounded-xl h-10 px-6 text-xs font-semibold bg-primary text-white cursor-pointer"
          >
            {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin mr-1.5" /> : <FileSpreadsheet className="h-4 w-4 mr-1.5" />}
            <span>Save & Print PDF</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
