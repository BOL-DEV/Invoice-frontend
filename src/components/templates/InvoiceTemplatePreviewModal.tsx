'use client';

import React, { useState, useEffect } from 'react';
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
  Send,
  Loader2,
  MessageSquare,
  Wand2,
  RefreshCw,
  Sliders,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { apiClient } from '../../services/api/axios';
import { API_ENDPOINTS } from '../../services/api/endpoints';
import { CustomTemplateConfig } from '../../types/api';

const DEFAULT_CONFIG: CustomTemplateConfig = {
  templateName: 'AI Custom Crafted Template',
  description: 'Bespoke custom invoice layout extracted and crafted from uploaded sample design.',
  theme: {
    primaryColor: '#0f2942',
    secondaryColor: '#0d9488',
    accentColor: '#f59e0b',
    backgroundColor: '#ffffff',
    textColor: '#0f172a',
    mutedTextColor: '#64748b',
    fontFamily: 'sans',
  },
  header: {
    layout: 'modern-split',
    showLogo: true,
    logoPosition: 'left',
    titleText: 'COMMERCIAL INVOICE',
  },
  table: {
    headerBackground: '#0f2942',
    headerTextColor: '#ffffff',
    alternateRowStriping: true,
    alternateRowColor: '#f8fafc',
    borderStyle: 'horizontal-only',
    borderColor: '#e2e8f0',
  },
  summary: {
    position: 'right',
    highlightTotalBackground: '#0f2942',
    highlightTotalTextColor: '#ffffff',
    showAmountInWords: true,
  },
  footer: {
    guaranteeText: 'Guaranteed goods are not returnable after purchase. No refund of money after payment.',
    showSignatures: true,
    signatureCount: 2,
    signatureLabels: ["Customer's Acceptance", 'Authorized Signatory'],
    termsAndConditions: 'Payment is due within payment terms. All trade dispute terms governed by commercial laws.',
  },
};

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
  logoUrl?: string | null;
  logo?: string | null;
  tenantId?: string;
  onSelectTemplate?: (templateId: string, customConfigJson?: string) => void;
}

export const InvoiceTemplatePreviewModal: React.FC<InvoiceTemplatePreviewModalProps> = ({
  isOpen,
  onClose,
  templateId,
  customTemplateUrl,
  logoUrl,
  logo,
  businessName = 'Acme Global Ventures',
  tagline = 'Wholesale Stockists, Industrial & Commercial Suppliers',
  address = 'Suite 104, Commercial Avenue, Victoria Island, Lagos',
  phone = '+234 803 000 0000, +234 805 000 0000',
  email = 'billing@acme-global.com',
  receiptPrefix = 'INV',
  tin = '24891023-0001',
  cacOrRegNumber = 'RC-1849204',
  tenantId,
  onSelectTemplate,
}) => {
  const [activeTab, setActiveTab] = useState<'classic' | 'modern' | 'custom'>(
    (templateId === 'modern' || templateId === 'custom' ? templateId : 'classic') as any
  );

  // Parse initial AI template configuration
  const parseConfig = (val?: string | null): CustomTemplateConfig => {
    if (!val) return DEFAULT_CONFIG;
    if (val.trim().startsWith('{')) {
      try {
        const parsed = JSON.parse(val);
        return { ...DEFAULT_CONFIG, ...parsed, theme: { ...DEFAULT_CONFIG.theme, ...parsed.theme } };
      } catch {
        return DEFAULT_CONFIG;
      }
    }
    // If it's a data URI or image URL, use default with rawImagePreviewUrl attached
    return { ...DEFAULT_CONFIG, rawImagePreviewUrl: val };
  };

  const [aiConfig, setAiConfig] = useState<CustomTemplateConfig>(parseConfig(customTemplateUrl));
  const [viewMode, setViewMode] = useState<'template' | 'reference'>('template');
  const [chatPrompt, setChatPrompt] = useState('');
  const [isRefining, setIsRefining] = useState(false);
  const [chatHistory, setChatHistory] = useState<Array<{ role: 'user' | 'assistant'; content: string }>>([]);
  const [isCopilotOpen, setIsCopilotOpen] = useState(true);

  // Sync state when props change
  useEffect(() => {
    if (templateId === 'modern' || templateId === 'custom' || templateId === 'classic') {
      setActiveTab(templateId);
    }
  }, [templateId]);

  useEffect(() => {
    if (customTemplateUrl) {
      setAiConfig(parseConfig(customTemplateUrl));
    }
  }, [customTemplateUrl]);

  const prefix = (receiptPrefix || 'INV').toUpperCase();
  const bizName = (businessName || 'BUSINESS ENTERPRISE').toUpperCase();

  // Send interactive AI chat refinement
  const handleSendPrompt = async (promptToSend?: string) => {
    const text = promptToSend || chatPrompt;
    if (!text || !text.trim() || isRefining) return;

    setIsRefining(true);
    setChatPrompt('');
    const newHistory = [...chatHistory, { role: 'user' as const, content: text.trim() }];
    setChatHistory(newHistory);

    try {
      const endpoint = API_ENDPOINTS.BUSINESS.REFINE_TEMPLATE(tenantId);
      const res = await apiClient.post(endpoint, {
        currentConfig: aiConfig,
        prompt: text.trim(),
        history: newHistory,
      });

      if (res.data?.data?.customTemplateConfig) {
        const updated = res.data.data.customTemplateConfig;
        setAiConfig(updated);
        setChatHistory((prev) => [
          ...prev,
          { role: 'assistant', content: res.data.data.assistantReply || 'Updated layout template.' },
        ]);
        setViewMode('template'); // Auto-switch to template view so user sees changes
      }
    } catch (err: any) {
      console.error('Refinement failed:', err);
      setChatHistory((prev) => [
        ...prev,
        { role: 'assistant', content: 'Could not apply AI change. Please try again or rephrase.' },
      ]);
    } finally {
      setIsRefining(false);
    }
  };

  const quickPrompts = [
    'Deep Navy & Slate Theme',
    'Forest Green Commercial Accent',
    'Double Accounting Ledger Border',
    'Add Watermark saying ORIGINAL',
    'Single Signature for Store Manager',
    'Minimalist Modern SaaS Layout',
  ];

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="w-[98vw] max-w-[98vw] sm:max-w-2xl md:max-w-5xl lg:max-w-6xl xl:max-w-7xl h-[94vh] max-h-[94vh] flex flex-col p-0 rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl overflow-hidden focus:outline-none">
        {/* Modal Top Header */}
        <div className="shrink-0 p-3 sm:p-4 border-b border-slate-800 bg-slate-950/90 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 z-10">
          <div className="flex items-center space-x-3 pr-8 sm:pr-0">
            <div className="p-2 sm:p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shrink-0">
              <Printer className="h-4 w-4 sm:h-5 sm:w-5" />
            </div>
            <div>
              <DialogTitle className="text-sm sm:text-base font-bold text-white flex items-center space-x-2 font-heading">
                <span>Invoice & Receipt Template Studio</span>
              </DialogTitle>
              <DialogDescription className="text-[11px] sm:text-xs text-slate-400 mt-0.5 line-clamp-1 sm:line-clamp-none">
                Interactive preview rendered with real company branding and dynamic customer invoice details.
              </DialogDescription>
            </div>
          </div>

          {/* Template Switcher Tabs */}
          <div className="flex items-center bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs w-full sm:w-auto justify-between sm:justify-start gap-1">
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
              {templateId === 'classic' && <span className="h-1.5 w-1.5 rounded-full bg-white" />}
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
              {templateId === 'modern' && <span className="h-1.5 w-1.5 rounded-full bg-white" />}
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
              <Sparkles className="h-3 w-3 text-amber-400" />
              <span>AI Custom</span>
              {templateId === 'custom' && <span className="h-1.5 w-1.5 rounded-full bg-white" />}
            </button>
          </div>
        </div>

        {/* Modal Main Workspace */}
        <div className="flex-1 flex flex-col lg:flex-row overflow-hidden bg-slate-950/70">
          {/* LEFT: Preview Viewport Canvas */}
          <div className="flex-1 overflow-y-auto overflow-x-auto p-3 sm:p-6 flex flex-col items-center justify-start relative">
            {/* View Mode Toggle when on Custom Tab */}
            {activeTab === 'custom' && (
              <div className="w-full max-w-[760px] flex items-center justify-between pb-3 text-xs mb-2">
                <div className="flex items-center space-x-1 bg-slate-900 border border-slate-800 p-1 rounded-xl">
                  <button
                    type="button"
                    onClick={() => setViewMode('template')}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center space-x-1.5 ${
                      viewMode === 'template'
                        ? 'bg-emerald-600 text-white shadow-sm'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <FileText className="h-3.5 w-3.5" />
                    <span>Dynamic Template</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewMode('reference')}
                    disabled={!aiConfig.rawImagePreviewUrl}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center space-x-1.5 ${
                      viewMode === 'reference'
                        ? 'bg-purple-600 text-white shadow-sm'
                        : 'text-slate-400 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed'
                    }`}
                  >
                    <ImageIcon className="h-3.5 w-3.5" />
                    <span>Original Upload Sample</span>
                  </button>
                </div>

                <Badge className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px]">
                  {aiConfig.templateName || 'AI Extracted Layout'}
                </Badge>
              </div>
            )}

            {/* ========================================================= */}
            {/* 1. CLASSIC INDUSTRIAL / THERMAL TEMPLATE                  */}
            {/* ========================================================= */}
            {activeTab === 'classic' && (
              <div className="w-full max-w-[760px] bg-white text-slate-900 rounded-lg shadow-2xl p-4 sm:p-8 border-[1.5px] border-[#0d47a1] relative font-sans text-xs select-none">
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden">
                  <span className="text-slate-200 font-extrabold text-4xl sm:text-6xl uppercase tracking-widest rotate-[-30deg] select-none opacity-40 text-center px-4">
                    {bizName}
                  </span>
                </div>

                <div className="flex flex-col sm:flex-row items-center sm:items-start justify-between border-b-2 border-[#0d47a1] pb-4 mb-4 relative z-10 gap-3 sm:gap-2">
                  <div className="flex flex-col items-center shrink-0 w-24">
                    <div className="h-12 w-12 sm:h-14 sm:w-14 rounded-full border-2 border-[#0f522b] flex items-center justify-center relative bg-[#0f522b]/5">
                      <div className="bg-[#0f522b] text-white text-[9px] sm:text-[10px] font-extrabold px-1.5 py-0.5 rounded shadow-sm z-10 font-mono tracking-wider">
                        {prefix}
                      </div>
                    </div>
                    {cacOrRegNumber && <span className="text-[9px] font-bold text-slate-800 mt-1 font-mono text-center">RC: {cacOrRegNumber}</span>}
                    {tin && <span className="text-[9px] font-semibold text-slate-700 font-mono text-center">TIN: {tin}</span>}
                  </div>

                  <div className="flex-1 text-center px-2 sm:px-3 space-y-1">
                    <h2 className="text-base sm:text-lg font-black text-[#0f522b] tracking-tight leading-tight uppercase font-heading">
                      {bizName}
                    </h2>
                    {tagline && <p className="text-[10px] sm:text-[11px] text-[#0d47a1] italic font-serif leading-snug">&ldquo;{tagline}&rdquo;</p>}
                    <p className="text-[9px] sm:text-[10px] text-slate-700 leading-tight">{address}</p>
                    <p className="text-[9px] text-slate-600 font-mono">Mobile: {phone} • Email: {email}</p>
                  </div>
                </div>

                {/* Meta Strip */}
                <div className="flex flex-col sm:flex-row items-center justify-between bg-slate-50 border border-slate-300 p-2 sm:p-2.5 rounded mb-4 relative z-10">
                  <span className="font-extrabold text-[#0d47a1] text-xs uppercase tracking-wider">INVOICE / DISPATCH SLIP</span>
                  <div className="flex items-center space-x-2 text-[11px] font-mono">
                    <span>No: <strong className="text-rose-600 font-bold">{prefix}-0000042</strong></span>
                    <span>•</span>
                    <span>Date: <strong>{new Date().toLocaleDateString('en-GB')}</strong></span>
                  </div>
                </div>

                {/* Customer Row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] bg-slate-50/60 p-2.5 rounded border border-slate-200 mb-4 relative z-10">
                  <div>
                    <span className="text-slate-500 font-semibold text-[10px] uppercase">Sold / Billed To:</span>
                    <p className="font-bold text-slate-900 uppercase">Alhaji Musa Dangote & Sons Ltd.</p>
                    <p className="text-slate-600 text-[10px]">Phone: 08023456789 • Orile Market</p>
                  </div>
                  <div className="sm:text-right">
                    <span className="text-slate-500 font-semibold text-[10px] uppercase">Dispatched By:</span>
                    <p className="font-semibold text-slate-800">Direct Warehouse Dispatch</p>
                    <p className="text-slate-600 text-[10px] font-mono">Vehicle No: KSF-849-XA</p>
                  </div>
                </div>

                {/* Table */}
                <div className="border border-slate-300 rounded overflow-x-auto mb-4 relative z-10">
                  <table className="w-full min-w-[560px] text-[10px] border-collapse">
                    <thead>
                      <tr className="bg-slate-100 border-b border-slate-300 text-slate-800 font-bold">
                        <th className="p-2 border-r border-slate-300 text-center w-8">#</th>
                        <th className="p-2 border-r border-slate-300 text-left">DESCRIPTION OF GOODS</th>
                        <th className="p-2 border-r border-slate-300 text-center w-14">QTY</th>
                        <th className="p-2 border-r border-slate-300 text-right w-20">RATE (₦)</th>
                        <th className="p-2 text-right w-24">AMOUNT (₦)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 font-mono">
                      <tr>
                        <td className="p-2 border-r border-slate-300 text-center">1</td>
                        <td className="p-2 border-r border-slate-300 font-sans font-semibold">12mm TMT Deformed Rebar (Length: 12m)</td>
                        <td className="p-2 border-r border-slate-300 text-center">120 PCS</td>
                        <td className="p-2 border-r border-slate-300 text-right">8,500.00</td>
                        <td className="p-2 text-right font-bold">1,020,000.00</td>
                      </tr>
                      <tr>
                        <td className="p-2 border-r border-slate-300 text-center">2</td>
                        <td className="p-2 border-r border-slate-300 font-sans font-semibold">16mm High-Yield High-Tensile Steel Rod</td>
                        <td className="p-2 border-r border-slate-300 text-center">80 PCS</td>
                        <td className="p-2 border-r border-slate-300 text-right">14,200.00</td>
                        <td className="p-2 text-right font-bold">1,136,000.00</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Summary */}
                <div className="flex justify-end mb-4">
                  <div className="w-64 space-y-1 text-[11px] font-mono">
                    <div className="flex justify-between"><span>Subtotal:</span><span>₦2,156,000.00</span></div>
                    <div className="flex justify-between font-bold text-sm bg-slate-100 p-2 rounded border border-slate-300">
                      <span>TOTAL:</span><span>₦2,156,000.00</span>
                    </div>
                  </div>
                </div>

                <p className="text-[10px] text-red-600 font-bold mb-4">
                  Guaranteed goods are not returnable after purchase. No refund of money after payment.
                </p>

                <div className="flex justify-between pt-6 border-t border-slate-300 text-[10px] text-slate-600">
                  <div className="text-center w-40 border-t border-slate-400 pt-1">Customer&apos;s Signature</div>
                  <div className="text-center w-40 border-t border-slate-400 pt-1">For: {bizName}</div>
                </div>
              </div>
            )}

            {/* ========================================================= */}
            {/* 2. MODERN CORPORATE EXECUTIVE                             */}
            {/* ========================================================= */}
            {activeTab === 'modern' && (
              <div className="w-full max-w-[760px] bg-white text-slate-900 rounded-lg shadow-2xl p-4 sm:p-8 border border-slate-200 relative font-sans text-xs select-none">
                <div className="flex justify-between items-start pb-6 border-b border-slate-200 mb-6">
                  <div>
                    <h2 className="text-xl font-bold text-slate-900 font-heading">{bizName}</h2>
                    {tagline && <p className="text-xs text-slate-500 italic mt-0.5">{tagline}</p>}
                    <p className="text-xs text-slate-600 mt-2">{address}</p>
                    <p className="text-xs text-slate-500 font-mono mt-0.5">{phone} • {email}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-2xl font-black text-slate-900 tracking-tight">INVOICE</span>
                    <p className="text-xs font-mono font-bold text-slate-600 mt-1">{prefix}-0000042</p>
                    <p className="text-xs text-slate-500 mt-0.5">{new Date().toLocaleDateString('en-GB')}</p>
                  </div>
                </div>

                <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 mb-6 flex justify-between items-center text-xs">
                  <div>
                    <span className="text-slate-400 uppercase text-[10px] font-bold">Billed To</span>
                    <p className="font-bold text-slate-900 text-sm mt-0.5">Alhaji Musa Dangote & Sons Ltd.</p>
                    <p className="text-slate-600">08023456789 • Orile Market</p>
                  </div>
                  <Badge className="bg-emerald-600 text-white font-mono">PAID IN FULL</Badge>
                </div>

                <table className="w-full text-xs border-collapse mb-6">
                  <thead>
                    <tr className="border-b-2 border-slate-900 text-left text-slate-600 text-[10px] uppercase font-bold">
                      <th className="py-2">Item</th>
                      <th className="py-2 text-center">Qty</th>
                      <th className="py-2 text-right">Rate</th>
                      <th className="py-2 text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-mono">
                    <tr>
                      <td className="py-3 font-sans font-medium text-slate-900">12mm TMT Deformed Rebar (Length: 12m)</td>
                      <td className="py-3 text-center">120 PCS</td>
                      <td className="py-3 text-right">₦8,500.00</td>
                      <td className="py-3 text-right font-bold">₦1,020,000.00</td>
                    </tr>
                    <tr>
                      <td className="py-3 font-sans font-medium text-slate-900">16mm High-Yield High-Tensile Steel Rod</td>
                      <td className="py-3 text-center">80 PCS</td>
                      <td className="py-3 text-right">₦14,200.00</td>
                      <td className="py-3 text-right font-bold">₦1,136,000.00</td>
                    </tr>
                  </tbody>
                </table>

                <div className="flex justify-end mb-6">
                  <div className="w-64 space-y-2 text-xs">
                    <div className="flex justify-between text-slate-600"><span>Subtotal:</span><span>₦2,156,000.00</span></div>
                    <div className="flex justify-between font-bold text-base text-slate-900 pt-2 border-t border-slate-200">
                      <span>Total Due:</span><span>₦2,156,000.00</span>
                    </div>
                  </div>
                </div>

                <div className="pt-6 border-t border-slate-200 flex justify-between text-xs text-slate-500">
                  <div className="w-40 border-t border-slate-300 pt-1 text-center">Customer Acceptance</div>
                  <div className="w-40 border-t border-slate-300 pt-1 text-center">Authorized Signatory</div>
                </div>
              </div>
            )}

            {/* ========================================================= */}
            {/* 3. DYNAMIC AI CUSTOM TEMPLATE ("Template Gan Gan")         */}
            {/* ========================================================= */}
            {activeTab === 'custom' && viewMode === 'template' && (
              <div
                className="w-full max-w-[760px] rounded-lg shadow-2xl p-4 sm:p-8 relative select-none transition-all duration-300 border"
                style={{
                  backgroundColor: aiConfig.theme.backgroundColor || '#ffffff',
                  color: aiConfig.theme.textColor || '#0f172a',
                  borderColor: aiConfig.theme.primaryColor || '#0f2942',
                  fontFamily: aiConfig.theme.fontFamily === 'mono' ? 'monospace' : aiConfig.theme.fontFamily === 'serif' ? 'serif' : 'sans-serif',
                }}
              >
                {/* Optional Watermark */}
                {aiConfig.footer.watermarkText && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden">
                    <span
                      className="font-extrabold text-5xl sm:text-7xl uppercase tracking-widest rotate-[-30deg] select-none opacity-10 text-center px-4"
                      style={{ color: aiConfig.theme.primaryColor }}
                    >
                      {aiConfig.footer.watermarkText}
                    </span>
                  </div>
                )}

                {/* Double Ledger Border if configured */}
                {aiConfig.table.borderStyle === 'double-ledger' && (
                  <div
                    className="absolute inset-2 pointer-events-none border"
                    style={{ borderColor: aiConfig.theme.secondaryColor }}
                  />
                )}

                {/* Header Layout */}
                {aiConfig.header.layout === 'banner' ? (
                  <div
                    className="p-4 rounded-xl mb-6 flex flex-col sm:flex-row justify-between items-center gap-3"
                    style={{
                      backgroundColor: aiConfig.header.bannerBackground || aiConfig.theme.primaryColor,
                      color: aiConfig.header.bannerTextColor || '#ffffff',
                    }}
                  >
                    <div className="flex items-center gap-3">
                      {(logoUrl || logo) && (
                        <img
                          src={(logoUrl || logo) as string}
                          alt={bizName}
                          className="h-12 w-12 object-contain bg-white rounded-lg p-1 shadow-sm shrink-0"
                        />
                      )}
                      <div>
                        <h2 className="text-xl font-bold font-heading">{bizName}</h2>
                        <p className="text-xs opacity-90 mt-0.5">{address} • {phone}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-xl font-black">{aiConfig.header.titleText || 'INVOICE'}</span>
                      <p className="text-xs font-mono font-bold mt-0.5">{prefix}-0000042</p>
                    </div>
                  </div>
                ) : aiConfig.header.layout === 'classic-centered' ? (
                  <div className="text-center pb-5 mb-5 border-b-2" style={{ borderColor: aiConfig.theme.primaryColor }}>
                    {(logoUrl || logo) && (
                      <div className="flex justify-center mb-2.5">
                        <img
                          src={(logoUrl || logo) as string}
                          alt={bizName}
                          className="h-14 max-w-[180px] object-contain"
                        />
                      </div>
                    )}
                    <h2 className="text-2xl font-black font-heading uppercase tracking-tight" style={{ color: aiConfig.theme.primaryColor }}>
                      {bizName}
                    </h2>
                    {tagline && (
                      <p className="text-xs italic mt-1" style={{ color: aiConfig.theme.secondaryColor }}>
                        &ldquo;{tagline}&rdquo;
                      </p>
                    )}
                    <p className="text-xs text-slate-600 mt-1">{address}</p>
                    <p className="text-xs font-mono text-slate-500 mt-0.5">Mobile: {phone} • Email: {email}</p>
                    {cacOrRegNumber && <p className="text-[11px] font-mono font-bold mt-1">RC: {cacOrRegNumber} | TIN: {tin || '24891023-0001'}</p>}
                  </div>
                ) : (
                  // Modern split
                  <div className="flex justify-between items-start pb-5 mb-5 border-b" style={{ borderColor: aiConfig.table.borderColor }}>
                    <div className="flex items-start gap-3">
                      {(logoUrl || logo) && (
                        <img
                          src={(logoUrl || logo) as string}
                          alt={bizName}
                          className="h-12 w-12 object-contain rounded-xl border border-slate-200 bg-white p-1 shadow-sm shrink-0"
                        />
                      )}
                      <div>
                        <h2 className="text-xl font-black font-heading" style={{ color: aiConfig.theme.primaryColor }}>
                          {bizName}
                        </h2>
                        {tagline && <p className="text-xs italic mt-0.5" style={{ color: aiConfig.theme.secondaryColor }}>{tagline}</p>}
                        <p className="text-xs text-slate-600 mt-1">{address}</p>
                        <p className="text-xs font-mono text-slate-500 mt-0.5">{phone} • {email}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-2xl font-black" style={{ color: aiConfig.theme.primaryColor }}>
                        {aiConfig.header.titleText || 'INVOICE'}
                      </span>
                      <p className="text-xs font-mono font-bold mt-1" style={{ color: aiConfig.theme.secondaryColor }}>
                        {prefix}-0000042
                      </p>
                      <p className="text-xs text-slate-500 mt-0.5">{new Date().toLocaleDateString('en-GB')}</p>
                    </div>
                  </div>
                )}

                {/* Customer Bill To Box */}
                <div
                  className="rounded-xl p-3 sm:p-4 mb-5 flex flex-col sm:flex-row justify-between items-start sm:items-center text-xs gap-2 border"
                  style={{
                    backgroundColor: aiConfig.table.alternateRowColor || '#f8fafc',
                    borderColor: aiConfig.table.borderColor,
                  }}
                >
                  <div>
                    <span className="text-[10px] font-bold uppercase" style={{ color: aiConfig.theme.mutedTextColor }}>Billed To:</span>
                    <p className="font-bold text-sm text-slate-900 mt-0.5">Alhaji Musa Dangote & Sons Ltd.</p>
                    <p className="text-slate-600 text-xs">08023456789 • Orile Market</p>
                  </div>
                  <Badge
                    className="font-mono text-xs"
                    style={{
                      backgroundColor: aiConfig.theme.accentColor || '#f59e0b',
                      color: '#ffffff',
                    }}
                  >
                    FINALIZED ORDER
                  </Badge>
                </div>

                {/* Table */}
                <div className="overflow-x-auto mb-5 rounded-lg border" style={{ borderColor: aiConfig.table.borderColor }}>
                  <table className="w-full text-xs border-collapse">
                    <thead>
                      <tr
                        style={{
                          backgroundColor: aiConfig.table.headerBackground || aiConfig.theme.primaryColor,
                          color: aiConfig.table.headerTextColor || '#ffffff',
                        }}
                      >
                        <th className="p-2.5 text-center w-10">#</th>
                        <th className="p-2.5 text-left">DESCRIPTION OF GOODS</th>
                        <th className="p-2.5 text-center w-20">QTY</th>
                        <th className="p-2.5 text-right w-28">RATE (₦)</th>
                        <th className="p-2.5 text-right w-28">AMOUNT (₦)</th>
                      </tr>
                    </thead>
                    <tbody className="font-mono divide-y" style={{ borderColor: aiConfig.table.borderColor }}>
                      <tr style={{ backgroundColor: '#ffffff' }}>
                        <td className="p-2.5 text-center">1</td>
                        <td className="p-2.5 font-sans font-semibold">12mm TMT Deformed Rebar (Length: 12m)</td>
                        <td className="p-2.5 text-center">120 PCS</td>
                        <td className="p-2.5 text-right">8,500.00</td>
                        <td className="p-2.5 text-right font-bold">1,020,000.00</td>
                      </tr>
                      <tr
                        style={{
                          backgroundColor: aiConfig.table.alternateRowStriping
                            ? aiConfig.table.alternateRowColor || '#f8fafc'
                            : '#ffffff',
                        }}
                      >
                        <td className="p-2.5 text-center">2</td>
                        <td className="p-2.5 font-sans font-semibold">16mm High-Yield High-Tensile Steel Rod</td>
                        <td className="p-2.5 text-center">80 PCS</td>
                        <td className="p-2.5 text-right">14,200.00</td>
                        <td className="p-2.5 text-right font-bold">1,136,000.00</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Totals Section */}
                <div className="flex justify-end mb-5">
                  <div className="w-72 space-y-2 text-xs font-mono">
                    <div className="flex justify-between text-slate-600">
                      <span>Subtotal:</span>
                      <span>₦2,156,000.00</span>
                    </div>
                    <div
                      className="flex justify-between font-bold text-sm p-2.5 rounded-lg shadow-sm"
                      style={{
                        backgroundColor: aiConfig.summary.highlightTotalBackground || aiConfig.theme.primaryColor,
                        color: aiConfig.summary.highlightTotalTextColor || '#ffffff',
                      }}
                    >
                      <span>TOTAL DUE:</span>
                      <span>₦2,156,000.00</span>
                    </div>
                  </div>
                </div>

                {/* Amount in words */}
                {aiConfig.summary.showAmountInWords !== false && (
                  <div className="pb-3 mb-3 border-b text-xs" style={{ borderColor: aiConfig.table.borderColor }}>
                    <span className="font-bold text-[10px] text-slate-500 uppercase mr-2">Amount in Words:</span>
                    <span className="italic font-serif" style={{ color: aiConfig.theme.primaryColor }}>
                      Two Million, One Hundred and Fifty-Six Thousand Naira Only.
                    </span>
                  </div>
                )}

                {/* Guarantee & Terms */}
                {aiConfig.footer.guaranteeText && (
                  <p className="text-[10px] font-bold text-red-600 mb-2 leading-relaxed">
                    {aiConfig.footer.guaranteeText}
                  </p>
                )}
                {aiConfig.footer.termsAndConditions && (
                  <p className="text-[9px] text-slate-500 mb-6 leading-relaxed">
                    {aiConfig.footer.termsAndConditions}
                  </p>
                )}

                {/* Signatures */}
                {aiConfig.footer.showSignatures !== false && (
                  <div className="flex justify-between pt-6 border-t text-[11px] text-slate-600" style={{ borderColor: aiConfig.table.borderColor }}>
                    <div className="text-center w-44 border-t border-slate-400 pt-1">
                      {aiConfig.footer.signatureLabels?.[0] || "Customer's Acceptance"}
                    </div>
                    <div className="text-center w-44 border-t border-slate-400 pt-1">
                      {aiConfig.footer.signatureLabels?.[1] || `For: ${bizName}`}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Reference Image View Mode */}
            {activeTab === 'custom' && viewMode === 'reference' && (
              <div className="w-full max-w-[760px] bg-slate-900 rounded-2xl border border-slate-800 p-4 text-center space-y-3">
                <div className="flex items-center justify-between text-xs text-slate-400 pb-2 border-b border-slate-800">
                  <span className="flex items-center space-x-1.5 text-purple-400 font-semibold">
                    <ImageIcon className="h-4 w-4" />
                    <span>Uploaded Reference Sample Document</span>
                  </span>
                  {aiConfig.rawImagePreviewUrl && (
                    <a
                      href={aiConfig.rawImagePreviewUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-purple-400 hover:text-purple-300 flex items-center space-x-1 text-xs"
                    >
                      <span>Fullscreen</span>
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  )}
                </div>
                <div className="max-h-[62vh] overflow-auto rounded-xl bg-black/50 p-2 border border-slate-800 flex items-center justify-center">
                  {aiConfig.rawImagePreviewUrl ? (
                    <img
                      src={aiConfig.rawImagePreviewUrl}
                      alt="Reference Upload"
                      className="max-h-[58vh] max-w-full h-auto rounded shadow-lg object-contain"
                    />
                  ) : (
                    <div className="p-8 text-slate-500 text-xs">No reference image on file.</div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* RIGHT: AI Copilot Chat Studio (Only visible on Custom Tab) */}
          {activeTab === 'custom' && (
            <div className="w-full lg:w-96 border-t lg:border-t-0 lg:border-l border-slate-800 bg-slate-950 flex flex-col shrink-0">
              {/* Studio Header */}
              <div className="p-3 sm:p-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/60">
                <div className="flex items-center space-x-2">
                  <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
                    <Wand2 className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-white flex items-center space-x-1">
                      <span>AI Template Copilot</span>
                      <Badge className="bg-emerald-500/20 text-emerald-400 text-[9px] px-1 py-0">Groq Vision</Badge>
                    </h3>
                    <p className="text-[10px] text-slate-400">Refine layout, colors & terms live</p>
                  </div>
                </div>
              </div>

              {/* Chat Thread Messages */}
              <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3 text-xs">
                {/* Initial Assistant greeting */}
                <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800 text-slate-300 space-y-1.5 shadow-sm">
                  <p className="font-semibold text-white flex items-center space-x-1">
                    <Sparkles className="h-3.5 w-3.5 text-amber-400" />
                    <span>Template Extracted & Ready</span>
                  </p>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    I analyzed your uploaded document and generated this dynamic layout with your company details.
                    Tell me any change you want to make below!
                  </p>
                </div>

                {chatHistory.map((msg, i) => (
                  <div
                    key={i}
                    className={`p-3 rounded-2xl text-xs leading-relaxed ${
                      msg.role === 'user'
                        ? 'bg-emerald-600 text-white ml-6 shadow-md'
                        : 'bg-slate-900 border border-slate-800 text-slate-200 mr-4'
                    }`}
                  >
                    {msg.content}
                  </div>
                ))}

                {isRefining && (
                  <div className="p-3 rounded-2xl bg-slate-900/80 border border-amber-500/30 text-amber-400 text-xs flex items-center space-x-2">
                    <Loader2 className="h-3.5 w-3.5 animate-spin text-amber-400" />
                    <span>Redesigning template with Groq AI...</span>
                  </div>
                )}
              </div>

              {/* Quick Prompt Suggestions */}
              <div className="p-2 sm:p-3 border-t border-slate-800/80 bg-slate-950/90 space-y-1.5">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Quick Suggestions:</span>
                <div className="flex flex-wrap gap-1.5">
                  {quickPrompts.map((chip, idx) => (
                    <button
                      key={idx}
                      type="button"
                      disabled={isRefining}
                      onClick={() => handleSendPrompt(chip)}
                      className="text-[10px] px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 transition-colors cursor-pointer text-left disabled:opacity-50"
                    >
                      {chip}
                    </button>
                  ))}
                </div>
              </div>

              {/* Chat Input Bar */}
              <div className="p-3 border-t border-slate-800 bg-slate-900 flex items-center space-x-2">
                <input
                  type="text"
                  value={chatPrompt}
                  disabled={isRefining}
                  onChange={(e) => setChatPrompt(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSendPrompt();
                  }}
                  placeholder="e.g. Make header deep navy with gold accent..."
                  className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
                <Button
                  type="button"
                  size="sm"
                  disabled={!chatPrompt.trim() || isRefining}
                  onClick={() => handleSendPrompt()}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl h-9 px-3 shrink-0 cursor-pointer shadow-md shadow-emerald-500/20"
                >
                  {isRefining ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Modal Action Footer */}
        <div className="shrink-0 p-3 sm:p-4 border-t border-slate-800 bg-slate-950/95 flex flex-col sm:flex-row items-center justify-between gap-3 z-10">
          <div className="text-xs text-slate-400 text-center sm:text-left">
            Active Selection: <strong className="text-white capitalize">{activeTab}</strong> Template
            {activeTab === 'custom' && (
              <span className="ml-2 text-emerald-400">
                (Dynamic AI Layout with {bizName} details)
              </span>
            )}
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
                  const configPayload = activeTab === 'custom' ? JSON.stringify(aiConfig) : undefined;
                  onSelectTemplate(activeTab, configPayload);
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
