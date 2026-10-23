'use client';

import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '../ui/dialog';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import {
  FileText,
  Sparkles,
  Layers,
  Upload,
  CheckCircle2,
  X,
  ExternalLink,
  Printer,
  ShieldCheck,
  Building2,
  Image as ImageIcon,
} from 'lucide-react';

interface InvoiceTemplatePreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  templateId: 'classic' | 'modern' | 'custom' | string;
  customTemplateUrl?: string | null;
  businessName?: string;
  tagline?: string;
  address?: string;
  phone?: string;
  email?: string;
  receiptPrefix?: string;
  tin?: string;
  cacOrRegNumber?: string;
  onSelectTemplate?: (templateId: string) => void;
}

export const InvoiceTemplatePreviewModal: React.FC<InvoiceTemplatePreviewModalProps> = ({
  isOpen,
  onClose,
  templateId,
  customTemplateUrl,
  businessName = 'Acme Global Ventures',
  tagline = 'Wholesale Stockists, Industrial & Commercial Suppliers',
  address = 'Suite 104, Commercial Avenue, Victoria Island, Lagos',
  phone = '+234 803 000 0000, +234 805 000 0000',
  email = 'billing@acme-global.com',
  receiptPrefix = 'INV',
  tin = '24891023-0001',
  cacOrRegNumber = 'RC-1849204',
  onSelectTemplate,
}) => {
  const [activeTab, setActiveTab] = useState<'classic' | 'modern' | 'custom'>(
    (templateId === 'modern' || templateId === 'custom' ? templateId : 'classic') as any
  );

  // Sync active tab when templateId prop changes
  React.useEffect(() => {
    if (templateId === 'modern' || templateId === 'custom' || templateId === 'classic') {
      setActiveTab(templateId);
    }
  }, [templateId]);

  const prefix = (receiptPrefix || 'INV').toUpperCase();
  const bizName = (businessName || 'BUSINESS ENTERPRISE').toUpperCase();

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="w-[96vw] max-w-[96vw] sm:max-w-2xl md:max-w-4xl lg:max-w-5xl xl:max-w-5xl h-[92vh] max-h-[92vh] flex flex-col p-0 rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl overflow-hidden focus:outline-none">
        {/* Modal Top Header */}
        <div className="shrink-0 p-3 sm:p-5 border-b border-slate-800 bg-slate-950/90 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 z-10">
          <div className="flex items-center space-x-3 pr-8 sm:pr-0">
            <div className="p-2 sm:p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shrink-0">
              <Printer className="h-4 w-4 sm:h-5 sm:w-5" />
            </div>
            <div>
              <DialogTitle className="text-sm sm:text-base font-bold text-white flex items-center space-x-2 font-heading">
                <span>Invoice & Receipt Template Preview</span>
              </DialogTitle>
              <DialogDescription className="text-[11px] sm:text-xs text-slate-400 mt-0.5 line-clamp-1 sm:line-clamp-none">
                Preview the exact layout and typography rendered for customer receipts & printable PDF documents.
              </DialogDescription>
            </div>
          </div>

          {/* Template Switcher Tabs */}
          <div className="flex items-center bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs w-full sm:w-auto justify-between sm:justify-start">
            <button
              type="button"
              onClick={() => setActiveTab('classic')}
              className={`flex-1 sm:flex-none px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer flex items-center justify-center space-x-1.5 ${
                activeTab === 'classic'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <span>Classic</span>
              {templateId === 'classic' && (
                <span className="h-1.5 w-1.5 rounded-full bg-white" />
              )}
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('modern')}
              className={`flex-1 sm:flex-none px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer flex items-center justify-center space-x-1.5 ${
                activeTab === 'modern'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <span>Modern</span>
              {templateId === 'modern' && (
                <span className="h-1.5 w-1.5 rounded-full bg-white" />
              )}
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('custom')}
              className={`flex-1 sm:flex-none px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer flex items-center justify-center space-x-1.5 ${
                activeTab === 'custom'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <span>Custom Upload</span>
              {templateId === 'custom' && (
                <span className="h-1.5 w-1.5 rounded-full bg-white" />
              )}
            </button>
          </div>
        </div>

        {/* Paper Container Body */}
        <div className="flex-1 overflow-y-auto overflow-x-auto p-3 sm:p-6 md:p-8 bg-slate-950/70 flex justify-center items-start">
          {/* ========================================================= */}
          {/* 1. CLASSIC INDUSTRIAL / THERMAL TEMPLATE                  */}
          {/* ========================================================= */}
          {activeTab === 'classic' && (
            <div className="w-full max-w-[760px] bg-white text-slate-900 rounded-lg shadow-2xl p-4 sm:p-8 border-[1.5px] border-[#0d47a1] relative font-sans text-xs select-none my-auto sm:my-0">
              {/* Background Watermark */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden">
                <span className="text-slate-200 font-extrabold text-4xl sm:text-6xl uppercase tracking-widest rotate-[-30deg] select-none opacity-40 text-center px-4">
                  {bizName}
                </span>
              </div>

              {/* Classic Header Block */}
              <div className="flex flex-col sm:flex-row items-center sm:items-start justify-between border-b-2 border-[#0d47a1] pb-4 mb-4 relative z-10 gap-3 sm:gap-2">
                {/* Left: Globe Circular Emblem */}
                <div className="flex flex-col items-center shrink-0 w-24">
                  <div className="h-12 w-12 sm:h-14 sm:w-14 rounded-full border-2 border-[#0f522b] flex items-center justify-center relative bg-[#0f522b]/5">
                    <div className="absolute inset-0 rounded-full border border-dashed border-[#0f522b]/60 m-1" />
                    <div className="bg-[#0f522b] text-white text-[9px] sm:text-[10px] font-extrabold px-1.5 py-0.5 rounded shadow-sm z-10 font-mono tracking-wider">
                      {prefix}
                    </div>
                  </div>
                  {cacOrRegNumber && (
                    <span className="text-[9px] font-bold text-slate-800 mt-1 font-mono text-center">
                      RC: {cacOrRegNumber}
                    </span>
                  )}
                  {tin && (
                    <span className="text-[9px] font-semibold text-slate-700 font-mono text-center">
                      TIN: {tin}
                    </span>
                  )}
                </div>

                {/* Center / Right: Business Name & Details */}
                <div className="flex-1 text-center px-2 sm:px-3 space-y-1">
                  <h2 className="text-base sm:text-lg font-black text-[#0f522b] tracking-tight leading-tight uppercase font-heading">
                    {bizName}
                  </h2>
                  {tagline && (
                    <p className="text-[10px] sm:text-[11px] text-[#0d47a1] italic font-serif leading-snug">
                      &ldquo;{tagline}&rdquo;
                    </p>
                  )}
                  <p className="text-[9px] sm:text-[10px] text-slate-700 leading-tight">
                    {address}
                  </p>
                  <p className="text-[9px] text-slate-600 font-mono">
                    Mobile: {phone} • Email: {email}
                  </p>
                </div>
              </div>

              {/* Invoice Title & Meta Strip */}
              <div className="flex flex-col sm:flex-row items-center justify-between bg-slate-50 border border-slate-300 p-2 sm:p-2.5 rounded mb-4 relative z-10 gap-1.5 sm:gap-0">
                <div className="flex items-center space-x-2">
                  <span className="font-extrabold text-[#0d47a1] text-xs uppercase tracking-wider">
                    INVOICE / DISPATCH SLIP
                  </span>
                  <Badge className="bg-[#0f522b] text-white text-[9px] px-1.5 py-0 font-mono">
                    FINALIZED
                  </Badge>
                </div>
                <div className="flex flex-wrap items-center justify-center space-x-2 sm:space-x-3 text-[11px] font-mono">
                  <span>
                    No: <strong className="text-rose-600 font-bold">{prefix}-0000042</strong>
                  </span>
                  <span>•</span>
                  <span>
                    Date: <strong>{new Date().toLocaleDateString('en-GB')}</strong>
                  </span>
                </div>
              </div>

              {/* Billed To Customer Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] bg-slate-50/60 p-2.5 rounded border border-slate-200 mb-4 relative z-10">
                <div>
                  <span className="text-slate-500 font-semibold text-[10px] uppercase">Sold / Billed To:</span>
                  <p className="font-bold text-slate-900 uppercase">Alhaji Musa Dangote & Sons Ltd.</p>
                  <p className="text-slate-600 text-[10px]">Phone: 08023456789 • Orile Market</p>
                </div>
                <div className="sm:text-right">
                  <span className="text-slate-500 font-semibold text-[10px] uppercase">Dispatched By / Driver:</span>
                  <p className="font-semibold text-slate-800">Direct Warehouse Dispatch</p>
                  <p className="text-slate-600 text-[10px] font-mono">Vehicle No: KSF-849-XA</p>
                </div>
              </div>

              {/* Classic Ledger Line Items Table (Horizontally Scrollable on small screens) */}
              <div className="border border-slate-300 rounded overflow-x-auto mb-4 relative z-10">
                <table className="w-full min-w-[560px] text-[10px] border-collapse">
                  <thead>
                    <tr className="bg-slate-100 border-b border-slate-300 text-slate-800 font-bold">
                      <th className="p-2 border-r border-slate-300 text-center w-8">S/N</th>
                      <th className="p-2 border-r border-slate-300 text-left">DESCRIPTION OF GOODS</th>
                      <th className="p-2 border-r border-slate-300 text-center w-20">WEIGHT (KG)</th>
                      <th className="p-2 border-r border-slate-300 text-center w-14">QTY</th>
                      <th className="p-2 border-r border-slate-300 text-right w-20">RATE (₦)</th>
                      <th className="p-2 text-right w-24">AMOUNT (₦)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 font-mono">
                    <tr>
                      <td className="p-2 border-r border-slate-300 text-center">1</td>
                      <td className="p-2 border-r border-slate-300 font-sans font-semibold">12mm TMT Deformed Rebar (Length: 12m)</td>
                      <td className="p-2 border-r border-slate-300 text-center">1,250.00</td>
                      <td className="p-2 border-r border-slate-300 text-center">120</td>
                      <td className="p-2 border-r border-slate-300 text-right">8,500.00</td>
                      <td className="p-2 text-right font-bold">1,020,000.00</td>
                    </tr>
                    <tr className="bg-slate-50/50">
                      <td className="p-2 border-r border-slate-300 text-center">2</td>
                      <td className="p-2 border-r border-slate-300 font-sans font-semibold">16mm High Yield Iron Rods</td>
                      <td className="p-2 border-r border-slate-300 text-center">840.00</td>
                      <td className="p-2 border-r border-slate-300 text-center">50</td>
                      <td className="p-2 border-r border-slate-300 text-right">14,200.00</td>
                      <td className="p-2 text-right font-bold">710,000.00</td>
                    </tr>
                    <tr>
                      <td className="p-2 border-r border-slate-300 text-center">3</td>
                      <td className="p-2 border-r border-slate-300 font-sans font-semibold">Angle Iron 50mm x 50mm x 5mm</td>
                      <td className="p-2 border-r border-slate-300 text-center">320.00</td>
                      <td className="p-2 border-r border-slate-300 text-center">25</td>
                      <td className="p-2 border-r border-slate-300 text-right">18,000.00</td>
                      <td className="p-2 text-right font-bold">450,000.00</td>
                    </tr>
                  </tbody>
                  <tfoot className="border-t-2 border-slate-300 bg-slate-50 font-mono text-[10px]">
                    <tr>
                      <td colSpan={4} className="p-2 border-r border-slate-300 text-right font-bold font-sans">
                        Subtotal:
                      </td>
                      <td colSpan={2} className="p-2 text-right font-bold">
                        ₦2,180,000.00
                      </td>
                    </tr>
                    <tr>
                      <td colSpan={4} className="p-2 border-r border-slate-300 text-right font-bold font-sans">
                        VAT (7.5%):
                      </td>
                      <td colSpan={2} className="p-2 text-right font-bold text-slate-700">
                        ₦163,500.00
                      </td>
                    </tr>
                    <tr className="bg-slate-100 border-t border-slate-300 text-[11px]">
                      <td colSpan={4} className="p-2 border-r border-slate-300 text-right font-black font-sans text-[#0d47a1]">
                        GRAND TOTAL:
                      </td>
                      <td colSpan={2} className="p-2 text-right font-black text-[#0f522b]">
                        ₦2,343,500.00
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>

              {/* Customer Guarantee Terms Box */}
              <div className="border border-slate-300 p-2 sm:p-2.5 rounded bg-slate-50/50 mb-4 sm:mb-6 text-[9px] text-slate-600 leading-relaxed relative z-10">
                <p className="font-bold text-slate-800 uppercase text-[9px]">Customer Guarantee & Acceptance Terms:</p>
                <p>
                  Goods received in satisfactory condition and exact count. No cash refund after goods leave the warehouse. Returned items subject to management clearance.
                </p>
              </div>

              {/* Signatures */}
              <div className="flex flex-col sm:flex-row justify-between items-center sm:items-end gap-4 pt-4 border-t border-slate-200 text-[10px] relative z-10">
                <div className="text-center w-full sm:w-40">
                  <div className="border-b border-slate-400 pb-1 mb-1 font-mono italic text-slate-400">
                    ....................................
                  </div>
                  <span className="font-semibold text-slate-700">Customer&apos;s Signature</span>
                </div>

                <div className="text-center w-full sm:w-48">
                  <div className="border-b border-slate-400 pb-1 mb-1 font-mono text-emerald-800 font-bold">
                    {bizName.slice(0, 20)}
                  </div>
                  <span className="font-semibold text-slate-700">Authorized Signatory</span>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* 2. MODERN CORPORATE EXECUTIVE TEMPLATE                    */}
          {/* ========================================================= */}
          {activeTab === 'modern' && (
            <div className="w-full max-w-[760px] bg-white text-slate-900 rounded-lg shadow-2xl p-4 sm:p-8 border border-slate-200 relative font-sans text-xs select-none my-auto sm:my-0">
              {/* Modern Top Header Block */}
              <div className="flex flex-col sm:flex-row justify-between items-start pb-6 border-b border-slate-200 gap-4">
                {/* Left: Modern Clean Business Branding */}
                <div className="space-y-1.5 max-w-sm">
                  <div className="flex items-center space-x-2">
                    <div className="h-8 w-8 rounded-lg bg-slate-900 text-white flex items-center justify-center font-bold text-xs">
                      {prefix.slice(0, 2)}
                    </div>
                    <h2 className="text-lg font-extrabold text-slate-900 tracking-tight font-heading">
                      {bizName}
                    </h2>
                  </div>
                  {tagline && (
                    <p className="text-[11px] text-slate-500 font-medium">
                      {tagline}
                    </p>
                  )}
                  <p className="text-[10px] text-slate-600 leading-relaxed pt-1">
                    {address}
                  </p>
                  <div className="flex items-center space-x-3 text-[10px] text-slate-500 font-mono">
                    <span>{phone}</span>
                    <span>•</span>
                    <span>{email}</span>
                  </div>
                  {(cacOrRegNumber || tin) && (
                    <p className="text-[9px] text-slate-400 font-mono pt-0.5">
                      {cacOrRegNumber && `RC: ${cacOrRegNumber}`} {cacOrRegNumber && tin && '|'} {tin && `TIN: ${tin}`}
                    </p>
                  )}
                </div>

                {/* Right: Invoice Tag & Date */}
                <div className="text-left sm:text-right space-y-1">
                  <h1 className="text-2xl font-black tracking-tight text-slate-900 font-heading">
                    INVOICE
                  </h1>
                  <p className="font-mono text-xs font-bold text-emerald-600">
                    #{prefix}-0000089
                  </p>
                  <p className="text-[10px] text-slate-500 font-mono">
                    DATE: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                  </p>
                  <div className="pt-1">
                    <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px] font-bold px-2 py-0.5">
                      FINALIZED / PAID
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Billed To & Metadata Strip */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-5 border-b border-slate-100 text-[11px]">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    BILLED TO
                  </span>
                  <p className="font-bold text-slate-900 text-sm mt-0.5">Zenith Global Construct Ltd.</p>
                  <p className="text-slate-600 text-[10px]">Contact: procurement@zenithconstruct.com</p>
                  <p className="text-slate-600 text-[10px]">Phone: +234 803 111 2233</p>
                </div>
                <div className="sm:text-right space-y-0.5">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    TRANSACTION SUMMARY
                  </span>
                  <p className="text-slate-700 font-medium text-[11px] mt-0.5">Payment Method: Bank Transfer</p>
                  <p className="text-slate-500 text-[10px] font-mono">Currency: Nigerian Naira (NGN / ₦)</p>
                  <p className="text-slate-500 text-[10px] font-mono">Terminal Ledger: #TL-4920</p>
                </div>
              </div>

              {/* Line Items Table (Horizontally Scrollable) */}
              <div className="my-5 rounded-lg overflow-x-auto border border-slate-200">
                <table className="w-full min-w-[520px] text-[10px]">
                  <thead>
                    <tr className="bg-slate-900 text-white font-bold">
                      <th className="p-2.5 text-center w-8">#</th>
                      <th className="p-2.5 text-left">ITEM & DESCRIPTION</th>
                      <th className="p-2.5 text-center w-14">QTY</th>
                      <th className="p-2.5 text-right w-24">UNIT RATE (₦)</th>
                      <th className="p-2.5 text-right w-28">AMOUNT (₦)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-mono">
                    <tr className="hover:bg-slate-50/50">
                      <td className="p-2.5 text-center text-slate-400">01</td>
                      <td className="p-2.5 font-sans font-semibold text-slate-900">
                        12mm TMT Deformed Rebar (Length: 12m)
                      </td>
                      <td className="p-2.5 text-center">120</td>
                      <td className="p-2.5 text-right">8,500.00</td>
                      <td className="p-2.5 text-right font-bold text-slate-900">1,020,000.00</td>
                    </tr>
                    <tr className="bg-slate-50/40 hover:bg-slate-50/80">
                      <td className="p-2.5 text-center text-slate-400">02</td>
                      <td className="p-2.5 font-sans font-semibold text-slate-900">
                        16mm High Yield Iron Rods
                      </td>
                      <td className="p-2.5 text-center">50</td>
                      <td className="p-2.5 text-right">14,200.00</td>
                      <td className="p-2.5 text-right font-bold text-slate-900">710,000.00</td>
                    </tr>
                    <tr className="hover:bg-slate-50/50">
                      <td className="p-2.5 text-center text-slate-400">03</td>
                      <td className="p-2.5 font-sans font-semibold text-slate-900">
                        Angle Iron 50mm x 50mm x 5mm
                      </td>
                      <td className="p-2.5 text-center">25</td>
                      <td className="p-2.5 text-right">18,000.00</td>
                      <td className="p-2.5 text-right font-bold text-slate-900">450,000.00</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Subtotals & Grand Total Section */}
              <div className="flex flex-col sm:flex-row justify-between items-start gap-4 pt-2 pb-6 border-b border-slate-200">
                <div className="space-y-1 text-[10px] text-slate-500 max-w-xs">
                  <p className="font-bold text-slate-700 uppercase tracking-wide">Payment Verification</p>
                  <p>All payments verified through BOLXolve Cloud Ledger. Scan digital stamp or check serial verification online.</p>
                </div>

                <div className="w-full sm:w-60 space-y-1.5 text-[11px] font-mono">
                  <div className="flex justify-between text-slate-600">
                    <span>Subtotal:</span>
                    <span>₦2,180,000.00</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>VAT (7.5%):</span>
                    <span>₦163,500.00</span>
                  </div>
                  <div className="flex justify-between text-sm font-bold pt-2 border-t border-slate-200 text-slate-900">
                    <span>Total Amount:</span>
                    <span className="text-emerald-600 font-extrabold">₦2,343,500.00</span>
                  </div>
                </div>
              </div>

              {/* Modern Sign-off Footer */}
              <div className="flex flex-col sm:flex-row justify-between items-center gap-2 pt-5 text-[10px] text-slate-500">
                <div className="flex items-center space-x-2">
                  <ShieldCheck className="h-4 w-4 text-emerald-600" />
                  <span>Officially Verified & Generated by BOLXolve</span>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-slate-800">Authorized Executive</p>
                  <p className="font-mono text-[9px] text-slate-400">Digital Seal Verified</p>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* 3. CUSTOM UPLOADED INVOICE TEMPLATE                       */}
          {/* ========================================================= */}
          {activeTab === 'custom' && (
            <div className="w-full max-w-[760px] bg-slate-900 rounded-2xl border border-slate-800 p-4 sm:p-8 text-center space-y-4 my-auto sm:my-0">
              {customTemplateUrl ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between text-xs text-slate-400 pb-2 border-b border-slate-800">
                    <span className="flex items-center space-x-1.5 text-emerald-400 font-semibold">
                      <CheckCircle2 className="h-4 w-4" />
                      <span>Custom Branded Invoice Template File</span>
                    </span>
                    <a
                      href={customTemplateUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-emerald-400 hover:text-emerald-300 flex items-center space-x-1 text-[11px]"
                    >
                      <span>Open Fullscreen</span>
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>

                  <div className="max-h-[60vh] overflow-auto rounded-xl border border-slate-800 bg-black/40 flex items-center justify-center p-2">
                    {customTemplateUrl.startsWith('data:image/') ||
                    customTemplateUrl.endsWith('.png') ||
                    customTemplateUrl.endsWith('.jpg') ||
                    customTemplateUrl.endsWith('.jpeg') ||
                    customTemplateUrl.endsWith('.webp') ? (
                      <img
                        src={customTemplateUrl}
                        alt="Custom Invoice Template"
                        className="max-h-[58vh] max-w-full h-auto rounded-lg shadow-md object-contain mx-auto"
                      />
                    ) : (
                      <iframe
                        src={customTemplateUrl}
                        title="Custom Invoice Template"
                        className="w-full h-[500px] rounded-lg"
                      />
                    )}
                  </div>
                </div>
              ) : (
                <div className="p-8 sm:p-12 border-2 border-dashed border-slate-800 rounded-2xl space-y-3">
                  <div className="p-3 bg-slate-800/80 text-slate-400 rounded-2xl w-fit mx-auto">
                    <ImageIcon className="h-8 w-8" />
                  </div>
                  <h4 className="text-sm font-bold text-white">No Custom Template Uploaded Yet</h4>
                  <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed">
                    This business has not uploaded a bespoke invoice mockup yet. You can upload a design file (PNG, JPG, or PDF) during onboarding or anytime in the tenant&apos;s management tab.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Action Footer */}
        <div className="shrink-0 p-3 sm:p-4 border-t border-slate-800 bg-slate-950/95 flex flex-col sm:flex-row items-center justify-between gap-3 z-10">
          <div className="text-xs text-slate-400 text-center sm:text-left">
            Active Selection: <strong className="text-white capitalize">{activeTab}</strong> Template
          </div>

          <div className="flex items-center space-x-2 w-full sm:w-auto justify-end">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onClose}
              className="rounded-xl text-xs border-slate-700 text-slate-300 hover:bg-slate-800 h-9 px-4"
            >
              Close
            </Button>

            {onSelectTemplate && (
              <Button
                type="button"
                size="sm"
                onClick={() => {
                  onSelectTemplate(activeTab);
                  onClose();
                }}
                className="bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold h-9 px-5 shadow-md shadow-emerald-500/20"
              >
                Use {activeTab.toUpperCase()} Template
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
