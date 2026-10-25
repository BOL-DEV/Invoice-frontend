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
import { CustomTemplateConfig, CustomTemplateColumn } from '../../types/api';

const DEFAULT_CONFIG: CustomTemplateConfig = {
  templateName: 'AI Custom Crafted Template',
  description: 'Bespoke custom invoice layout extracted and crafted from uploaded sample design.',
  archetype: 'commercial-docket',
  theme: {
    primaryColor: '#0052cc',
    secondaryColor: '#172b4d',
    accentColor: '#0052cc',
    backgroundColor: '#ffffff',
    textColor: '#172b4d',
    mutedTextColor: '#5e6c84',
    fontFamily: 'sans',
  },
  header: {
    layout: 'classic-centered',
    style: 'centered-commercial',
    showLogo: true,
    logoPosition: 'center',
    titleText: 'CASH SALES/INVOICE',
    titleBadge: {
      style: 'pill',
      text: 'CASH SALES/INVOICE',
      alignment: 'left',
      badgeColor: '#0052cc',
      badgeTextColor: '#ffffff',
    },
    metaBox: {
      style: 'day-month-year-grid',
      fields: ['date_grid', 'lpo_number'],
    },
  },
  customer: {
    style: 'dotted-ledger',
    showBilledToPill: false,
    nameLabel: 'Name:',
    addressLabel: 'Address:',
  },
  table: {
    headerBackground: '#0052cc',
    headerTextColor: '#ffffff',
    alternateRowStriping: false,
    borderStyle: 'grid',
    gridStyle: 'full-grid',
    borderColor: '#0052cc',
    columns: [
      { id: 'qty', label: 'QTY.', field: 'qty', widthPercent: 15, align: 'center' },
      { id: 'desc', label: 'DESCRIPTION', field: 'description', widthPercent: 45, align: 'left' },
      { id: 'price', label: 'UNIT PRICE', field: 'unit_price', widthPercent: 20, align: 'right' },
      { id: 'amt', label: 'AMOUNT', field: 'amount', widthPercent: 20, align: 'right' },
    ],
    fillBlankRows: true,
    minRows: 8,
  },
  summary: {
    position: 'right',
    layout: 'table-integrated',
    totalLabel: 'GRAND TOTAL',
    highlightTotalBackground: '#ffffff',
    highlightTotalTextColor: '#0052cc',
    showAmountInWords: false,
  },
  footer: {
    guaranteeText: 'GOODS SOLD OUT ARE NOT RETURNABLE',
    courtesyGreeting: 'THANKS FOR DOING BUSINESS WITH US',
    centerGraphic: 'handshake',
    showSignatures: true,
    signatureCount: 1,
    signatureLabels: ['Customer Signature'],
    signatureBlocks: [
      { label: 'Customer Signature', style: 'dotted', position: 'left' },
    ],
    termsAndConditions: 'Goods sold out are not returnable.',
  },
};

interface InvoiceTemplatePreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  templateId?: 'classic' | 'modern' | 'custom' | string;
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
  const isLaoSteel = Boolean(
    businessName?.toLowerCase().includes('lao steel') ||
    receiptPrefix?.toUpperCase() === 'LSV'
  );

  // Parse initial AI template configuration with Lao Steel bespoke fallback
  const parseConfig = (val?: string | null): CustomTemplateConfig => {
    if (val && val.trim().startsWith('{')) {
      try {
        const parsed = JSON.parse(val);
        return { ...DEFAULT_CONFIG, ...parsed, theme: { ...DEFAULT_CONFIG.theme, ...parsed.theme } };
      } catch {
        // fallback
      }
    } else if (val && (val.startsWith('data:') || val.startsWith('http'))) {
      return { ...DEFAULT_CONFIG, rawImagePreviewUrl: val };
    }

    if (isLaoSteel) {
      return {
        ...DEFAULT_CONFIG,
        templateName: 'Lao Steel Bespoke Ledger',
        description: 'Authentic industrial depot layout with dual navy border, green globe emblem, watermark, and guarantee disclaimer.',
        archetype: 'commercial-docket',
        theme: {
          primaryColor: '#0f522b',
          secondaryColor: '#0d47a1',
          accentColor: '#0f522b',
          backgroundColor: '#ffffff',
          textColor: '#172b4d',
          mutedTextColor: '#5e6c84',
          fontFamily: 'sans',
        },
        header: {
          layout: 'classic-centered',
          style: 'centered-commercial',
          showLogo: true,
          logoPosition: 'center',
          titleText: 'INVOICE / DISPATCH SLIP',
          titleBadge: {
            style: 'pill',
            text: 'INVOICE / DISPATCH SLIP',
            alignment: 'left',
            badgeColor: '#0d47a1',
            badgeTextColor: '#ffffff',
          },
          metaBox: {
            style: 'day-month-year-grid',
            fields: ['date_grid', 'lpo_number'],
          },
        },
        table: {
          ...DEFAULT_CONFIG.table,
          borderColor: '#0d47a1',
          headerBackground: '#0d47a1',
        },
        footer: {
          ...DEFAULT_CONFIG.footer,
          watermarkText: 'LSV',
          guaranteeText: 'GUARANTEED GOODS ARE NOT RETURNABLE AFTER PURCHASE. NO REFUND OF MONEY AFTER PAYMENT.',
          termsAndConditions: 'Guaranteed goods are not returnable after purchase. No refund of money after payment.',
          signatureLabels: ["Customer's Signature", 'For: LAO STEEL VENTURES'],
        },
      };
    }

    return DEFAULT_CONFIG;
  };

  const [aiConfig, setAiConfig] = useState<CustomTemplateConfig>(parseConfig(customTemplateUrl));
  const [viewMode, setViewMode] = useState<'template' | 'reference'>('template');
  const [chatPrompt, setChatPrompt] = useState('');
  const [isRefining, setIsRefining] = useState(false);
  const [chatHistory, setChatHistory] = useState<Array<{ role: 'user' | 'assistant'; content: string }>>([]);
  const [isCopilotOpen, setIsCopilotOpen] = useState(true);

  useEffect(() => {
    if (customTemplateUrl !== undefined) {
      setAiConfig(parseConfig(customTemplateUrl));
    }
  }, [customTemplateUrl, businessName, receiptPrefix]);

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
      const errMsg = err?.response?.data?.message || err?.message || 'Could not apply AI change. Please try again or rephrase.';
      setChatHistory((prev) => [
        ...prev,
        { role: 'assistant', content: errMsg },
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

          {/* Template Badge */}
          <div className="flex items-center space-x-2">
            <Badge className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs py-1 px-3 font-semibold">
              <Sparkles className="h-3 w-3 mr-1.5 text-amber-400" />
              <span>{aiConfig.templateName || 'Bespoke Custom Template'}</span>
            </Badge>
          </div>
        </div>

        {/* Modal Main Workspace */}
        <div className="flex-1 flex flex-col lg:flex-row overflow-hidden bg-slate-950/70">
          {/* LEFT: Preview Viewport Canvas */}
          <div className="flex-1 overflow-y-auto overflow-x-auto p-3 sm:p-6 flex flex-col items-center justify-start relative">
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

                {/* 1-Click Archetype & Layout Quick-Switcher Toolbar */}
                <div className="w-full max-w-[760px] bg-slate-900/90 border border-slate-800 rounded-xl p-2.5 flex flex-wrap items-center justify-between gap-2 shadow-lg mb-2">
                <div className="flex items-center space-x-1.5 flex-wrap gap-y-1">
                  <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider flex items-center gap-1 mr-1">
                    <Sliders className="h-3 w-3 text-purple-400" />
                    <span>Archetype:</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => setAiConfig(prev => ({
                      ...prev,
                      archetype: 'commercial-docket',
                      header: {
                        ...prev.header,
                        style: 'centered-commercial',
                        layout: 'classic-centered',
                        titleBadge: {
                          style: 'pill',
                          text: prev.header.titleBadge?.text || prev.header.titleText || 'CASH SALES/INVOICE',
                          alignment: 'left',
                          badgeColor: prev.theme.primaryColor,
                          badgeTextColor: '#ffffff',
                        },
                      },
                      customer: { ...prev.customer, style: 'dotted-ledger' },
                      table: {
                        ...prev.table,
                        gridStyle: 'full-grid',
                        fillBlankRows: true,
                        columns: [
                          { id: 'qty', label: 'QTY.', field: 'qty', widthPercent: 15, align: 'center' },
                          { id: 'desc', label: 'DESCRIPTION', field: 'description', widthPercent: 45, align: 'left' },
                          { id: 'price', label: 'UNIT PRICE', field: 'unit_price', widthPercent: 20, align: 'right' },
                          { id: 'amt', label: 'AMOUNT', field: 'amount', widthPercent: 20, align: 'right' },
                        ],
                      },
                      summary: { ...prev.summary, layout: 'table-integrated' },
                      footer: { ...prev.footer, centerGraphic: 'handshake' },
                    }))}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                      (aiConfig.archetype === 'commercial-docket' || aiConfig.header.style === 'centered-commercial')
                        ? 'bg-purple-600 text-white shadow-sm'
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    Commercial Docket
                  </button>
                  <button
                    type="button"
                    onClick={() => setAiConfig(prev => ({
                      ...prev,
                      archetype: 'modern-split',
                      header: { ...prev.header, style: 'split-modern', layout: 'modern-split' },
                      customer: { ...prev.customer, style: 'card-bordered' },
                      table: {
                        ...prev.table,
                        gridStyle: 'horizontal-ledger',
                        fillBlankRows: false,
                        columns: [
                          { id: 'desc', label: 'DESCRIPTION', field: 'description', widthPercent: 45, align: 'left' },
                          { id: 'qty', label: 'QTY', field: 'qty', widthPercent: 15, align: 'center' },
                          { id: 'price', label: 'RATE (₦)', field: 'unit_price', widthPercent: 20, align: 'right' },
                          { id: 'amt', label: 'AMOUNT (₦)', field: 'amount', widthPercent: 20, align: 'right' },
                        ],
                      },
                      summary: { ...prev.summary, layout: 'card-bottom-right' },
                    }))}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                      (aiConfig.archetype === 'modern-split' || aiConfig.header.style === 'split-modern')
                        ? 'bg-purple-600 text-white shadow-sm'
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    Modern SaaS
                  </button>
                  <button
                    type="button"
                    onClick={() => setAiConfig(prev => ({
                      ...prev,
                      archetype: 'banner',
                      header: { ...prev.header, style: 'banner', layout: 'banner' },
                    }))}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                      aiConfig.header.style === 'banner'
                        ? 'bg-purple-600 text-white shadow-sm'
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    Top Banner
                  </button>
                </div>

                <div className="flex items-center space-x-1.5">
                  <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">Columns:</span>
                  <button
                    type="button"
                    onClick={() => setAiConfig(prev => ({
                      ...prev,
                      table: {
                        ...prev.table,
                        columns: [
                          { id: 'qty', label: 'QTY.', field: 'qty', widthPercent: 15, align: 'center' },
                          { id: 'desc', label: 'DESCRIPTION', field: 'description', widthPercent: 45, align: 'left' },
                          { id: 'price', label: 'UNIT PRICE', field: 'unit_price', widthPercent: 20, align: 'right' },
                          { id: 'amt', label: 'AMOUNT', field: 'amount', widthPercent: 20, align: 'right' },
                        ],
                      },
                    }))}
                    className={`px-2 py-0.5 rounded text-[11px] font-semibold transition-all cursor-pointer ${
                      aiConfig.table.columns?.[0]?.field === 'qty'
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    QTY First
                  </button>
                  <button
                    type="button"
                    onClick={() => setAiConfig(prev => ({
                      ...prev,
                      table: {
                        ...prev.table,
                        columns: [
                          { id: 'desc', label: 'DESCRIPTION', field: 'description', widthPercent: 45, align: 'left' },
                          { id: 'qty', label: 'QTY', field: 'qty', widthPercent: 15, align: 'center' },
                          { id: 'price', label: 'RATE (₦)', field: 'unit_price', widthPercent: 20, align: 'right' },
                          { id: 'amt', label: 'AMOUNT (₦)', field: 'amount', widthPercent: 20, align: 'right' },
                        ],
                      },
                    }))}
                    className={`px-2 py-0.5 rounded text-[11px] font-semibold transition-all cursor-pointer ${
                      aiConfig.table.columns?.[0]?.field === 'description'
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    Desc First
                  </button>
                </div>
              </div>

            {/* Dynamic Template View */}
            {viewMode === 'template' && (
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

                {/* Header & Sub-Header Layout */}
                {aiConfig.archetype === 'commercial-docket' || aiConfig.header.style === 'centered-commercial' ? (
                  /* 1. Centered Commercial Docket Layout (exact match to paper receipt/invoice) */
                  <div className="mb-4">
                    {/* Centered Business Header */}
                    <div className="text-center pb-3 mb-3 border-b-2" style={{ borderColor: aiConfig.theme.primaryColor }}>
                      {(logoUrl || logo) && (
                        <div className="flex justify-center mb-1.5">
                          <img
                            src={(logoUrl || logo) as string}
                            alt={bizName}
                            className="h-12 max-w-[160px] object-contain"
                          />
                        </div>
                      )}
                      <h2 className="text-2xl sm:text-3xl font-black font-heading uppercase tracking-tight" style={{ color: aiConfig.theme.primaryColor }}>
                        {bizName}
                      </h2>
                      {tagline && (
                        <p className="text-xs font-bold uppercase tracking-wider mt-0.5" style={{ color: aiConfig.theme.primaryColor }}>
                          {tagline}
                        </p>
                      )}
                      <p className="text-xs font-semibold uppercase mt-0.5 text-slate-700">
                        {address}
                      </p>
                      <p className="text-xs font-mono font-bold mt-0.5" style={{ color: aiConfig.theme.primaryColor }}>
                        TEL: {phone}
                      </p>
                    </div>

                    {/* Sub-header Dual-Box: Left Customer Dotted Ledger Box + Right Date/LPO Grid Box */}
                    <div className="flex flex-col sm:flex-row items-end justify-between gap-3">
                      {/* Left Column: Pill Badge + Customer Dotted Ledger Box */}
                      <div className="w-full sm:w-[60%] space-y-2">
                        <div>
                          <span
                            className="px-5 py-1.5 rounded-full font-black text-xs sm:text-sm uppercase tracking-wider shadow-sm inline-block text-white"
                            style={{
                              backgroundColor: aiConfig.header.titleBadge?.badgeColor || aiConfig.theme.primaryColor,
                              color: aiConfig.header.titleBadge?.badgeTextColor || '#ffffff',
                            }}
                          >
                            {aiConfig.header.titleBadge?.text || aiConfig.header.titleText || 'CASH SALES/INVOICE'}
                          </span>
                        </div>

                        <div
                          className="border-2 rounded-xl p-2.5 sm:p-3"
                          style={{ borderColor: aiConfig.table.borderColor }}
                        >
                          <div className="space-y-2 text-xs">
                            <div className="flex items-baseline gap-2">
                              <span className="font-bold shrink-0 text-xs uppercase" style={{ color: aiConfig.theme.primaryColor }}>
                                {aiConfig.customer?.nameLabel || 'Name:'}
                              </span>
                              <span
                                className="flex-1 border-b-2 border-dotted pb-0.5 font-bold font-sans text-slate-900 text-xs"
                                style={{ borderColor: aiConfig.table.borderColor }}
                              >
                                Alhaji Musa Dangote &amp; Sons Ltd.
                              </span>
                            </div>
                            <div className="flex items-baseline gap-2">
                              <span className="font-bold shrink-0 text-xs uppercase" style={{ color: aiConfig.theme.primaryColor }}>
                                {aiConfig.customer?.addressLabel || 'Address:'}
                              </span>
                              <span
                                className="flex-1 border-b-2 border-dotted pb-0.5 font-sans text-slate-700 text-xs"
                                style={{ borderColor: aiConfig.table.borderColor }}
                              >
                                Plot 14, Commercial District, Ikeja
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Right Column: 3-Column Date Box + LPO Number */}
                      <div className="w-full sm:w-[37%] flex flex-col justify-end">
                        <div
                          className="border-2 rounded-xl overflow-hidden text-center text-[10px]"
                          style={{ borderColor: aiConfig.table.borderColor }}
                        >
                          <div
                            className="grid grid-cols-3 font-bold py-1 px-1 uppercase tracking-wide text-white"
                            style={{ backgroundColor: aiConfig.header.titleBadge?.badgeColor || aiConfig.theme.primaryColor }}
                          >
                            <span className="px-1">Day</span>
                            <span className="px-1 border-l border-r border-white/30">Month</span>
                            <span className="px-1">Year</span>
                          </div>
                          <div
                            className="grid grid-cols-3 font-mono py-1.5 px-1 bg-white font-bold"
                            style={{ color: aiConfig.theme.textColor }}
                          >
                            <span className="px-1">{new Date().getDate().toString().padStart(2, '0')}</span>
                            <span className="px-1 border-l border-r" style={{ borderColor: aiConfig.table.borderColor }}>
                              {(new Date().getMonth() + 1).toString().padStart(2, '0')}
                            </span>
                            <span className="px-1">{new Date().getFullYear()}</span>
                          </div>
                          <div className="p-1.5 bg-slate-50 border-t flex items-center justify-between text-xs font-mono" style={{ borderColor: aiConfig.table.borderColor }}>
                            <span className="font-bold text-[11px]" style={{ color: aiConfig.theme.primaryColor }}>L.P.O #:</span>
                            <span
                              className="border-b-2 border-dotted w-20 inline-block pb-0.5 text-center font-bold"
                              style={{ borderColor: aiConfig.table.borderColor }}
                            >
                              0429
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : aiConfig.header.style === 'banner' || aiConfig.header.layout === 'banner' ? (
                  /* 2. Top Banner Layout */
                  <div>
                    <div
                      className="p-4 rounded-xl mb-4 flex flex-col sm:flex-row justify-between items-center gap-3"
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
                    {/* Customer section for banner */}
                    <div
                      className="rounded-xl p-3 mb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center text-xs gap-2 border"
                      style={{
                        backgroundColor: aiConfig.table.alternateRowColor || '#f8fafc',
                        borderColor: aiConfig.table.borderColor,
                      }}
                    >
                      <div>
                        <span className="text-[10px] font-bold uppercase" style={{ color: aiConfig.theme.mutedTextColor }}>Billed To:</span>
                        <p className="font-bold text-sm text-slate-900 mt-0.5">Alhaji Musa Dangote & Sons Ltd.</p>
                        <p className="text-slate-600 text-xs">08023456789 • Orile Commercial Depot</p>
                      </div>
                      <Badge className="font-mono text-xs" style={{ backgroundColor: aiConfig.theme.accentColor || '#f59e0b', color: '#ffffff' }}>
                        FINALIZED ORDER
                      </Badge>
                    </div>
                  </div>
                ) : (
                  /* 3. Modern Split Layout */
                  <div>
                    <div className="flex justify-between items-start pb-5 mb-4 border-b" style={{ borderColor: aiConfig.table.borderColor }}>
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
                          <p className="text-xs text-slate-600 mt-2">{address}</p>
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

                    {/* Customer section for modern split */}
                    <div
                      className="rounded-xl p-3 sm:p-4 mb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center text-xs gap-2 border"
                      style={{
                        backgroundColor: aiConfig.table.alternateRowColor || '#f8fafc',
                        borderColor: aiConfig.table.borderColor,
                      }}
                    >
                      <div>
                        <span className="text-[10px] font-bold uppercase" style={{ color: aiConfig.theme.mutedTextColor }}>Billed To:</span>
                        <p className="font-bold text-sm text-slate-900 mt-0.5">Alhaji Musa Dangote & Sons Ltd.</p>
                        <p className="text-slate-600 text-xs">08023456789 • Orile Commercial Depot</p>
                      </div>
                      <Badge className="font-mono text-xs" style={{ backgroundColor: aiConfig.theme.accentColor || '#f59e0b', color: '#ffffff' }}>
                        FINALIZED ORDER
                      </Badge>
                    </div>
                  </div>
                )}

                {/* Dynamic Table Layout */}
                {(() => {
                  const activeColumns: CustomTemplateColumn[] = (aiConfig.table.columns && aiConfig.table.columns.length > 0)
                    ? aiConfig.table.columns
                    : [
                        { id: 'qty', label: 'QTY.', field: 'qty', widthPercent: 15, align: 'center' },
                        { id: 'desc', label: 'DESCRIPTION', field: 'description', widthPercent: 45, align: 'left' },
                        { id: 'price', label: 'UNIT PRICE', field: 'unit_price', widthPercent: 20, align: 'right' },
                        { id: 'amt', label: 'AMOUNT', field: 'amount', widthPercent: 20, align: 'right' },
                      ];

                  const sampleRows = [
                    { qty: '120 PCS', description: '12mm TMT Deformed Rebar (Length: 12m)', unit_price: '8,500.00', amount: '1,020,000.00', index: 1 },
                    { qty: '80 PCS', description: '16mm High-Yield High-Tensile Steel Rod', unit_price: '14,200.00', amount: '1,136,000.00', index: 2 },
                  ];

                  const emptyRowCount = aiConfig.table.fillBlankRows !== false
                    ? Math.max(3, (aiConfig.table.minRows || 8) - sampleRows.length)
                    : 0;

                  return (
                    <div className="overflow-x-auto mb-4 rounded-xl border-2" style={{ borderColor: aiConfig.table.borderColor }}>
                      <table className="w-full text-xs border-collapse">
                        <thead>
                          <tr
                            style={{
                              backgroundColor: aiConfig.table.headerBackground || aiConfig.theme.primaryColor,
                              color: aiConfig.table.headerTextColor || '#ffffff',
                            }}
                          >
                            {activeColumns.map((col, cIdx) => (
                              <th
                                key={col.id || cIdx}
                                className={`p-2.5 font-bold uppercase tracking-wider text-xs ${
                                  col.align === 'center' ? 'text-center' : col.align === 'right' ? 'text-right' : 'text-left'
                                } ${cIdx < activeColumns.length - 1 ? 'border-r border-white/30' : ''}`}
                                style={{ width: col.widthPercent ? `${col.widthPercent}%` : undefined }}
                              >
                                {col.label}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="font-mono divide-y" style={{ borderColor: aiConfig.table.borderColor }}>
                          {sampleRows.map((row, rIdx) => (
                            <tr
                              key={rIdx}
                              style={{
                                backgroundColor: aiConfig.table.alternateRowStriping && rIdx % 2 === 1
                                  ? aiConfig.table.alternateRowColor || '#f8fafc'
                                  : '#ffffff',
                              }}
                            >
                              {activeColumns.map((col, cIdx) => (
                                <td
                                  key={col.id || cIdx}
                                  className={`p-2.5 text-xs ${
                                    col.align === 'center' ? 'text-center' : col.align === 'right' ? 'text-right' : 'text-left'
                                  } ${col.field === 'description' ? 'font-sans font-semibold' : ''} ${
                                    col.field === 'amount' ? 'font-bold' : ''
                                  } ${cIdx < activeColumns.length - 1 ? 'border-r' : ''}`}
                                  style={{ borderColor: aiConfig.table.borderColor }}
                                >
                                  {(row as any)[col.field] || (col.field === 'index' ? rIdx + 1 : '—')}
                                </td>
                              ))}
                            </tr>
                          ))}

                          {/* Empty ledger rows */}
                          {Array.from({ length: emptyRowCount }).map((_, eIdx) => (
                            <tr key={`empty_${eIdx}`} className="h-7" style={{ backgroundColor: '#ffffff' }}>
                              {activeColumns.map((col, cIdx) => (
                                <td
                                  key={`empty_col_${cIdx}`}
                                  className={`p-2.5 ${cIdx < activeColumns.length - 1 ? 'border-r' : ''}`}
                                  style={{ borderColor: aiConfig.table.borderColor }}
                                >
                                  &nbsp;
                                </td>
                              ))}
                            </tr>
                          ))}

                          {/* Integrated Grand Total Row */}
                          {aiConfig.summary.layout === 'table-integrated' && (
                            <tr className="font-bold border-t-2" style={{ borderColor: aiConfig.table.borderColor }}>
                              <td
                                colSpan={Math.max(1, activeColumns.length - 1)}
                                className="p-2.5 text-right font-black uppercase tracking-wider text-xs"
                                style={{ color: aiConfig.theme.primaryColor }}
                              >
                                {aiConfig.summary.totalLabel || 'GRAND TOTAL'} (₦):
                              </td>
                              <td
                                className="p-2.5 text-right font-black text-sm font-mono border-l-2"
                                style={{
                                  borderColor: aiConfig.table.borderColor,
                                  backgroundColor: aiConfig.summary.highlightTotalBackground || '#ffffff',
                                  color: aiConfig.summary.highlightTotalTextColor || aiConfig.theme.primaryColor,
                                }}
                              >
                                2,156,000.00
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  );
                })()}

                {/* Detached Totals Card if not table-integrated */}
                {aiConfig.summary.layout !== 'table-integrated' && (
                  <div className="flex justify-end mb-4">
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
                        <span>{aiConfig.summary.totalLabel || 'TOTAL DUE'}:</span>
                        <span>₦2,156,000.00</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Amount in words */}
                {aiConfig.summary.showAmountInWords && (
                  <div className="pb-2 mb-3 border-b text-xs" style={{ borderColor: aiConfig.table.borderColor }}>
                    <span className="font-bold text-[10px] text-slate-500 uppercase mr-2">Amount in Words:</span>
                    <span className="italic font-serif" style={{ color: aiConfig.theme.primaryColor }}>
                      Two Million, One Hundred and Fifty-Six Thousand Naira Only.
                    </span>
                  </div>
                )}

                {/* Footer Section */}
                <div className="mt-3 pt-2">
                  {/* Guarantee Disclaimer */}
                  {aiConfig.footer.guaranteeText && (
                    <p className="text-[11px] font-black uppercase text-red-600 mb-3 leading-tight tracking-wide">
                      {aiConfig.footer.guaranteeText}
                    </p>
                  )}

                  {/* Courtesy & Handshake Graphic & Signatures */}
                  <div className="flex flex-col sm:flex-row items-center justify-between my-3 gap-4">
                    {/* Customer Signature Line */}
                    <div className="w-56 text-left">
                      <div className="border-b-2 border-dotted pb-0.5" style={{ borderColor: aiConfig.table.borderColor }}>
                        &nbsp;
                      </div>
                      <span className="text-[10px] text-slate-700 font-bold block mt-1">
                        {aiConfig.footer.signatureLabels?.[0] || 'Customer Signature'}
                      </span>
                    </div>

                    {/* Center Handshake Graphic */}
                    {aiConfig.footer.centerGraphic === 'handshake' && (
                      <div className="flex flex-col items-center justify-center text-center">
                        <svg
                          className="w-11 h-11"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke={aiConfig.theme.primaryColor}
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="m11 17 2 2a1 1 0 0 0 1.4 0l4.3-4.3a1 1 0 0 0 0-1.4l-2-2" />
                          <path d="m13 15 2-2" />
                          <path d="m15 13 2-2" />
                          <path d="M7 21h10a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2z" opacity="0.12" fill={aiConfig.theme.primaryColor} />
                          <path d="m3 14 3-3a1 1 0 0 1 1.4 0l3 3" />
                          <path d="M14 6l3.5 3.5a1 1 0 0 1 0 1.4L13 15.4" />
                        </svg>
                        {aiConfig.footer.courtesyGreeting && (
                          <span className="text-[10px] font-black uppercase tracking-wider mt-1" style={{ color: aiConfig.theme.primaryColor }}>
                            {aiConfig.footer.courtesyGreeting}
                          </span>
                        )}
                      </div>
                    )}

                    {/* Authorized Signatory Line if 2 signatures */}
                    {aiConfig.footer.signatureCount === 2 && (
                      <div className="w-56 text-right">
                        <div className="border-b-2 border-dotted pb-0.5" style={{ borderColor: aiConfig.table.borderColor }}>
                          &nbsp;
                        </div>
                        <span className="text-[10px] text-slate-700 font-bold block mt-1">
                          {aiConfig.footer.signatureLabels?.[1] || `For: ${bizName}`}
                        </span>
                      </div>
                    )}
                  </div>

                  {aiConfig.footer.termsAndConditions && (
                    <p className="text-[9px] text-slate-400 mt-2 leading-relaxed text-center">
                      {aiConfig.footer.termsAndConditions}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Reference Image View Mode */}
            {viewMode === 'reference' && (
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

          {/* RIGHT: AI Copilot Chat Studio */}
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
        </div>

        {/* Modal Action Footer */}
        <div className="shrink-0 p-3 sm:p-4 border-t border-slate-800 bg-slate-950/95 flex flex-col sm:flex-row items-center justify-between gap-3 z-10">
          <div className="text-xs text-slate-400 text-center sm:text-left">
            <span className="text-white font-semibold">{aiConfig.templateName || 'Bespoke Custom Template'}</span>
            <span className="ml-2 text-emerald-400">
              (Live preview with {bizName} details)
            </span>
          </div>

          <div className="flex items-center space-x-2 w-full sm:w-auto justify-end">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onClose}
              className="rounded-xl text-xs border-slate-700 text-slate-300 hover:bg-slate-800 h-9 px-4 cursor-pointer"
            >
              Close
            </Button>

            {onSelectTemplate && (
              <Button
                type="button"
                size="sm"
                onClick={() => {
                  onSelectTemplate('custom', JSON.stringify(aiConfig));
                  onClose();
                }}
                className="bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold h-9 px-5 shadow-md shadow-emerald-500/20 cursor-pointer"
              >
                Save & Apply Template
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
