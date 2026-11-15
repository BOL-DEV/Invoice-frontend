'use client';

import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../../../components/ui/dialog';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Invoice } from '../../../types/api';
import { waybillService } from '../../../services/waybill.service';
import { useModal } from '../../../components/ui/modal-provider';
import { Truck, Loader2, Calendar, User, Phone, MapPin, Hash, Check } from 'lucide-react';
import { useRouter } from 'next/navigation';

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
  const router = useRouter();

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
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (invoice) {
      setCustomerName(invoice.customerName || '');
      setCustomerPhone(invoice.customerPhone || '');
      setDeliveryAddress('');
      setDriverName('');
      setDriverPhone('');
      setLorryNumber('');
      setDeliveredBy(invoice.creator ? `${invoice.creator.firstName} ${invoice.creator.lastName}`.trim() : '');
      setReceivedBy('');
      setLpoNumber('');
      setDispatchDate(new Date().toISOString().split('T')[0]);
      setNotes('');
      setItems(
        (invoice.items || []).map((it: any) => ({
          position: it.position,
          description: it.description,
          quantity: Number(it.quantity),
          unit: it.weight ? `${it.weight} kg` : null,
        }))
      );
    }
  }, [invoice]);

  const handleItemQtyChange = (index: number, newQty: number) => {
    setItems((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], quantity: Math.max(0, newQty) };
      return updated;
    });
  };

  const handleSubmit = async (andPrint = false) => {
    if (!invoice) return;
    if (!customerName.trim()) {
      modal.alert('Validation Error', 'Customer name is required', 'warning');
      return;
    }
    const validItems = items.filter((it) => it.quantity > 0);
    if (validItems.length === 0) {
      modal.alert('Validation Error', 'At least one item must have a quantity greater than zero', 'warning');
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

      onClose();
      if (onSuccess) onSuccess();

      if (andPrint) {
        window.open(waybillService.getPDFUrl(waybill.id), '_blank');
      }

      modal.alert(
        'Waybill Generated',
        `Waybill ${waybill.waybillNumber} has been created successfully for physical dispatch.`,
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
      <DialogContent className="w-[96vw] max-w-3xl max-h-[90vh] overflow-y-auto p-4 sm:p-6 rounded-2xl">
        <DialogHeader className="border-b border-border/80 pb-3">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 bg-emerald-500/10 text-emerald-600 rounded-xl">
              <Truck className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle className="text-lg font-bold">Generate Waybill / Delivery Note</DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                Originating from Invoice #{invoice?.invoiceNumber}. All prices will be stripped for transport.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Customer & Address Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-muted-foreground">Customer Name</label>
              <Input
                value={customerName}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCustomerName(e.target.value)}
                placeholder="Client Name"
                className="mt-1 h-9 rounded-xl text-sm"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-muted-foreground">Customer Phone</label>
              <Input
                value={customerPhone}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCustomerPhone(e.target.value)}
                placeholder="Phone Number"
                className="mt-1 h-9 rounded-xl text-sm"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="text-xs font-semibold text-muted-foreground">Delivery Site / Destination Address</label>
              <Input
                value={deliveryAddress}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDeliveryAddress(e.target.value)}
                placeholder="e.g. Plot 12 Victoria Island Construction Site"
                className="mt-1 h-9 rounded-xl text-sm"
              />
            </div>
          </div>

          {/* Logistics, Driver & Vehicle Info */}
          <div className="p-3 bg-secondary/40 rounded-xl border border-border/70 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <Truck className="h-3.5 w-3.5 text-primary" />
              <span>Logistics & Transport Dispatch</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <div>
                <label className="text-[11px] font-semibold text-muted-foreground">Driver Name</label>
                <Input
                  value={driverName}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDriverName(e.target.value)}
                  placeholder="e.g. Kazeem"
                  className="mt-0.5 h-8 rounded-lg text-xs"
                />
              </div>
              <div>
                <label className="text-[11px] font-semibold text-muted-foreground">Driver Phone</label>
                <Input
                  value={driverPhone}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDriverPhone(e.target.value)}
                  placeholder="Driver Phone"
                  className="mt-0.5 h-8 rounded-lg text-xs"
                />
              </div>
              <div>
                <label className="text-[11px] font-semibold text-muted-foreground">Vehicle / Lorry No.</label>
                <Input
                  value={lorryNumber}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setLorryNumber(e.target.value)}
                  placeholder="e.g. PUR-591-XB"
                  className="mt-0.5 h-8 rounded-lg text-xs"
                />
              </div>
              <div>
                <label className="text-[11px] font-semibold text-muted-foreground">Delivered By (Staff)</label>
                <Input
                  value={deliveredBy}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDeliveredBy(e.target.value)}
                  placeholder="e.g. Sherif"
                  className="mt-0.5 h-8 rounded-lg text-xs"
                />
              </div>
              <div>
                <label className="text-[11px] font-semibold text-muted-foreground">LPO Number (Optional)</label>
                <Input
                  value={lpoNumber}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setLpoNumber(e.target.value)}
                  placeholder="e.g. LPO-892"
                  className="mt-0.5 h-8 rounded-lg text-xs"
                />
              </div>
              <div>
                <label className="text-[11px] font-semibold text-muted-foreground">Dispatch Date</label>
                <Input
                  type="date"
                  value={dispatchDate}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDispatchDate(e.target.value)}
                  className="mt-0.5 h-8 rounded-lg text-xs"
                />
              </div>
            </div>
          </div>

          {/* Items Checklist for Waybill */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Goods to Dispatch (No Prices Displayed)
              </label>
              <span className="text-[11px] text-muted-foreground">Adjust quantities for partial deliveries</span>
            </div>

            <div className="border border-border rounded-xl overflow-hidden divide-y divide-border">
              {items.map((item, idx) => (
                <div key={idx} className="p-2.5 flex items-center justify-between bg-card text-xs">
                  <div className="flex-1 pr-3">
                    <span className="font-semibold text-foreground">{item.description}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-muted-foreground text-[11px]">Qty:</span>
                    <Input
                      type="number"
                      step="any"
                      value={item.quantity}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        handleItemQtyChange(idx, parseFloat(e.target.value) || 0)
                      }
                      className="w-20 h-7 text-xs text-center rounded-lg"
                    />
                    {item.unit && <span className="text-[11px] text-muted-foreground">{item.unit}</span>}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="text-xs font-semibold text-muted-foreground">Dispatch Remarks / Notes</label>
            <Input
              value={notes}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNotes(e.target.value)}
              placeholder="e.g. Delivered on 10-wheeler trailer, gate pass attached"
              className="mt-1 h-8 rounded-xl text-xs"
            />
          </div>
        </div>

        {/* Footer Actions */}
        <div className="border-t border-border/80 pt-3 flex items-center justify-end space-x-2">
          <Button variant="outline" size="sm" onClick={onClose} disabled={isSubmitting} className="rounded-xl h-9">
            Cancel
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => handleSubmit(false)}
            disabled={isSubmitting}
            className="rounded-xl h-9 cursor-pointer"
          >
            {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin mr-1.5" /> : <Check className="h-4 w-4 mr-1.5" />}
            <span>Save Waybill</span>
          </Button>
          <Button
            size="sm"
            onClick={() => handleSubmit(true)}
            disabled={isSubmitting}
            className="rounded-xl h-9 bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer"
          >
            {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin mr-1.5" /> : <Truck className="h-4 w-4 mr-1.5" />}
            <span>Generate & Print Waybill</span>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
