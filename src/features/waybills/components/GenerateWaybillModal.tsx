'use client';

import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../../../components/ui/dialog';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { PhoneInput } from '../../../components/forms/PhoneInput';
import { Badge } from '../../../components/ui/badge';
import { Invoice } from '../../../types/api';
import { waybillService } from '../../../services/waybill.service';
import { apiClient } from '../../../services/api/axios';
import { downloadDocumentPDF, printDocumentPDF } from '../../../lib/document-download';
import { useModal } from '../../../components/ui/modal-provider';
import { useAuth } from '../../auth/context/AuthContext';
import {
  Truck,
  Loader2,
  Calendar,
  User,
  Phone,
  MapPin,
  Check,
  ChevronDown,
  ChevronUp,
  Package,
  FileText,
  Printer,
  FileDown,
} from 'lucide-react';

interface GenerateWaybillModalProps {
  isOpen: boolean;
  onClose: () => void;
  invoice: Invoice | null;
  onSuccess?: () => void;
}

export const GenerateWaybillModal: React.FC<GenerateWaybillModalProps> = ({
  isOpen,
  onClose,
  invoice,
  onSuccess,
}) => {
  const modal = useModal();
  const { user } = useAuth();

  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [driverName, setDriverName] = useState('');
  const [driverPhone, setDriverPhone] = useState('');
  const [lorryNumber, setLorryNumber] = useState('');
  const [deliveredBy, setDeliveredBy] = useState('');
  const [receivedBy, setReceivedBy] = useState('');
  const [lpoNumber, setLpoNumber] = useState('');
  const [dispatchDate, setDispatchDate] = useState('');
  const [notes, setNotes] = useState('');
  const [items, setItems] = useState<
    { position: number; description: string; quantity: number; unit?: string | null }[]
  >([]);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showAdditionalDetails, setShowAdditionalDetails] = useState(false);

  useEffect(() => {
    if (!isOpen || !invoice) return;

    setCustomerName(invoice.customerName || '');
    setCustomerPhone(invoice.customerPhone || '');
    setDeliveryAddress('');
    setDriverName('');
    setDriverPhone('');
    setLorryNumber('');
    const creatorName = invoice.creator ? `${invoice.creator.firstName || ''} ${invoice.creator.lastName || ''}`.trim() : '';
    const currentUserName = user ? `${user.firstName || ''} ${user.lastName || ''}`.trim() : '';
    setDeliveredBy(currentUserName || creatorName || 'Abdulakeem Onilenla');
    setReceivedBy('');
    setLpoNumber('');
    setDispatchDate(new Date().toISOString().split('T')[0]);
    setNotes('');

    const populateItems = (sourceItems: any[]) => {
      setItems(
        sourceItems.map((it: any, idx: number) => ({
          position: it.position ?? idx + 1,
          description: it.description,
          quantity: Number(it.quantity) || 1,
          unit: it.metrics || (it.weight ? `${it.weight} kg` : null),
        }))
      );
    };

    if (invoice.items && invoice.items.length > 0) {
      populateItems(invoice.items);
    } else {
      setIsLoadingDetails(true);
      apiClient
        .get<Invoice>(`/invoices/${invoice.id}`)
        .then((res) => {
          if (res.data?.items && res.data.items.length > 0) {
            populateItems(res.data.items);
          }
        })
        .catch((err) => {
          console.warn('Failed to fetch invoice details for waybill items:', err);
        })
        .finally(() => {
          setIsLoadingDetails(false);
        });
    }
  }, [isOpen, invoice]);

  const handleItemQtyChange = (index: number, newQty: number) => {
    setItems((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], quantity: Math.max(0, newQty) };
      return updated;
    });
  };

  const handleSubmit = async (action: 'download' | 'print' = 'download') => {
    if (!invoice) return;
    if (!customerName.trim()) {
      modal.alert('Missing Information', 'Please enter a customer name.', 'warning');
      return;
    }
    const validItems = items.filter((it) => it.quantity > 0);
    if (validItems.length === 0) {
      modal.alert('Missing Information', 'Please specify a quantity greater than zero for at least one item.', 'warning');
      return;
    }

    try {
      setIsSubmitting(true);
      const waybill = await waybillService.createFromInvoice({
        invoiceId: invoice.id,
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim() || null,
        deliveryAddress: deliveryAddress.trim() || null,
        driverName: driverName.trim() || null,
        driverPhone: driverPhone.trim() || null,
        lorryNumber: lorryNumber.trim() || null,
        deliveredBy: deliveredBy.trim() || null,
        receivedBy: receivedBy.trim() || null,
        lpoNumber: lpoNumber.trim() || null,
        dispatchDate: dispatchDate ? new Date(dispatchDate).toISOString() : new Date().toISOString(),
        notes: notes.trim() || null,
        items: validItems,
      });

      if (action === 'download') {
        try {
          await downloadDocumentPDF(
            `/api/printing/waybill/${waybill.id}/pdf`,
            `waybill_${waybill.waybillNumber}.pdf`
          );
        } catch (downloadErr) {
          console.warn('Direct PDF download fallback:', downloadErr);
        }
      } else if (action === 'print') {
        try {
          await printDocumentPDF(`/api/printing/waybill/${waybill.id}/pdf`);
        } catch (printErr) {
          console.error('Print waybill error:', printErr);
        }
      }

      onClose();
      if (onSuccess) onSuccess();

      modal.alert(
        'Waybill Generated',
        `Waybill ${waybill.waybillNumber} has been created successfully.${action === 'download' ? ' Your PDF document has been downloaded.' : ''}`,
        'success'
      );
    } catch (err: any) {
      modal.alert('Error', err.response?.data?.message || err.message || 'Failed to generate waybill', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[94vw] sm:max-w-3xl lg:max-w-4xl max-h-[92vh] overflow-y-auto p-5 sm:p-8 rounded-3xl border-border bg-card shadow-2xl">
        {/* Header */}
        <DialogHeader className="border-b border-border/70 pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-emerald-500/10 text-emerald-600 rounded-2xl shrink-0">
                <Truck className="h-6 w-6" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <DialogTitle className="text-xl font-bold tracking-tight text-foreground">
                    Generate Waybill
                  </DialogTitle>
                  {invoice?.invoiceNumber && (
                    <Badge variant="outline" className="font-mono text-xs border-emerald-500/30 text-emerald-600 dark:text-emerald-400 bg-emerald-500/5">
                      Invoice #{invoice.invoiceNumber}
                    </Badge>
                  )}
                </div>
                <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                  Official goods dispatch note. Prices and invoice totals are stripped for logistics.
                </DialogDescription>
              </div>
            </div>
          </div>
        </DialogHeader>

        {/* Modal Form Body */}
        <div className="space-y-6 py-4">
          {/* Section 1: Customer & Destination */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <MapPin className="h-4 w-4 text-emerald-500" />
              <span>Delivery Destination</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-muted-foreground">Customer / Company Name *</label>
                <Input
                  value={customerName}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCustomerName(e.target.value)}
                  className="mt-1 h-10 rounded-xl text-sm"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-muted-foreground">Customer Phone (Optional)</label>
                <PhoneInput
                  value={customerPhone}
                  onChange={setCustomerPhone}
                  className="mt-1 h-10 rounded-xl text-sm"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="text-xs font-semibold text-muted-foreground">Delivery Site / Destination Address</label>
                <Input
                  value={deliveryAddress}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDeliveryAddress(e.target.value)}
                  className="mt-1 h-10 rounded-xl text-sm"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Driver & Transport Details */}
          <div className="p-4 sm:p-5 bg-secondary/30 rounded-2xl border border-border/80 space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <Truck className="h-4 w-4 text-emerald-500" />
              <span>Driver & Transport Logistics</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-muted-foreground">Driver Name</label>
                <Input
                  value={driverName}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDriverName(e.target.value)}
                  className="mt-1 h-10 rounded-xl text-sm bg-card"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-muted-foreground">Driver Phone Number</label>
                <PhoneInput
                  value={driverPhone}
                  onChange={setDriverPhone}
                  className="mt-1 h-10 rounded-xl text-sm bg-card"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-muted-foreground">Vehicle / Lorry Registration No.</label>
                <Input
                  value={lorryNumber}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setLorryNumber(e.target.value)}
                  className="mt-1 h-10 rounded-xl text-sm bg-card font-mono"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-muted-foreground">Dispatch Date</label>
                <Input
                  type="date"
                  value={dispatchDate}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDispatchDate(e.target.value)}
                  className="mt-1 h-10 rounded-xl text-sm bg-card"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-muted-foreground">Delivered By (Issuing Staff)</label>
                <Input
                  value={deliveredBy}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDeliveredBy(e.target.value)}
                  className="mt-1 h-10 rounded-xl text-sm bg-card"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-muted-foreground">Received By (Optional)</label>
                <Input
                  value={receivedBy}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setReceivedBy(e.target.value)}
                  className="mt-1 h-10 rounded-xl text-sm bg-card"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Goods Checklist */}
          <div className="space-y-3">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <Package className="h-4 w-4 text-emerald-500" />
                <span>Goods to Dispatch</span>
              </h4>
              <span className="text-[11px] text-muted-foreground">
                Adjust quantities for partial deliveries (all prices excluded)
              </span>
            </div>

            {isLoadingDetails ? (
              <div className="p-8 text-center bg-secondary/20 rounded-2xl border border-border">
                <Loader2 className="h-6 w-6 animate-spin mx-auto text-emerald-500" />
                <p className="text-xs text-muted-foreground mt-2 font-medium">Loading items from invoice...</p>
              </div>
            ) : items.length === 0 ? (
              <div className="p-6 text-center bg-secondary/20 rounded-2xl border border-border text-xs text-muted-foreground">
                No items found on this invoice.
              </div>
            ) : (
              <div className="border border-border/80 rounded-2xl overflow-hidden divide-y divide-border bg-card shadow-sm">
                {items.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-secondary/20 transition-colors"
                  >
                    <div className="flex items-start space-x-3 flex-1 min-w-0">
                      <span className="text-xs font-mono font-bold text-muted-foreground shrink-0 w-6 pt-0.5">
                        #{idx + 1}
                      </span>
                      <div className="min-w-0">
                        <p className="font-semibold text-sm text-foreground leading-snug break-words">
                          {item.description}
                        </p>
                        {item.unit && (
                          <p className="text-[11px] text-muted-foreground font-mono mt-0.5">
                            Unit / Spec: {item.unit}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 self-end sm:self-center shrink-0">
                      <span className="text-xs font-semibold text-muted-foreground">Qty:</span>
                      <Input
                        type="number"
                        min="0"
                        step="any"
                        value={item.quantity}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                          handleItemQtyChange(idx, parseFloat(e.target.value) || 0)
                        }
                        className="w-24 h-9 text-sm text-center font-bold rounded-xl border-border bg-background"
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Section 4: Collapsible Additional Details */}
          <div className="border border-border/80 rounded-2xl overflow-hidden">
            <button
              type="button"
              onClick={() => setShowAdditionalDetails((prev) => !prev)}
              className="w-full p-3.5 bg-secondary/20 hover:bg-secondary/40 text-left flex items-center justify-between text-xs font-semibold text-muted-foreground transition-colors cursor-pointer"
            >
              <div className="flex items-center space-x-2">
                <FileText className="h-4 w-4 text-muted-foreground" />
                <span>Additional Remarks & LPO (Optional)</span>
              </div>
              {showAdditionalDetails ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </button>

            {showAdditionalDetails && (
              <div className="p-4 sm:p-5 bg-card space-y-4 border-t border-border/80">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground">LPO / Customer Order Number</label>
                    <Input
                      value={lpoNumber}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setLpoNumber(e.target.value)}
                      className="mt-1 h-9 rounded-xl text-sm font-mono"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="text-xs font-semibold text-muted-foreground">Dispatch Remarks / Notes</label>
                    <Input
                      value={notes}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNotes(e.target.value)}
                      className="mt-1 h-9 rounded-xl text-sm"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="border-t border-border/80 pt-4 flex flex-col-reverse sm:flex-row items-center justify-end gap-2.5">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isSubmitting}
            className="w-full sm:w-auto rounded-xl h-10 px-5 text-xs font-semibold cursor-pointer"
          >
            Cancel
          </Button>

          <Button
            type="button"
            variant="outline"
            onClick={() => handleSubmit('print')}
            disabled={isSubmitting}
            className="w-full sm:w-auto rounded-xl h-10 px-5 text-xs font-semibold border-border hover:bg-secondary cursor-pointer flex items-center justify-center space-x-1.5"
          >
            {isSubmitting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Printer className="h-4 w-4" />
            )}
            <span>Print</span>
          </Button>

          <Button
            type="button"
            onClick={() => handleSubmit('download')}
            disabled={isSubmitting}
            className="w-full sm:w-auto rounded-xl h-10 px-6 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm cursor-pointer flex items-center justify-center space-x-1.5"
          >
            {isSubmitting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <FileDown className="h-4 w-4" />
            )}
            <span>Download</span>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
