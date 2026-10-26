'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../features/auth/context/AuthContext';
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
  Printer,
  ExternalLink,
  Image as ImageIcon,
} from 'lucide-react';
import { CustomTemplateConfig, CustomTemplateColumn } from '../../types/api';

const DEFAULT_CONFIG: CustomTemplateConfig = {
  templateName: 'AI Custom Crafted Template',
  description: 'Bespoke custom invoice layout extracted and crafted from uploaded sample design.',
  archetype: 'standard-trade',
  theme: {
    primaryColor: '#0f2942',
    secondaryColor: '#2563eb',
    accentColor: '#10b981',
    backgroundColor: '#ffffff',
    textColor: '#0f172a',
    mutedTextColor: '#64748b',
    fontFamily: 'sans',
  },
  header: {
    layout: 'split',
    style: 'split',
    showLogo: true,
    logoPosition: 'left',
    titleText: 'INVOICE',
    titleBadge: {
      style: 'pill',
      text: 'INVOICE',
      alignment: 'right',
      badgeColor: '#0f2942',
      badgeTextColor: '#ffffff',
    },
    metaBox: {
      style: 'clean-meta',
      fields: ['invoice_number', 'date'],
    },
  },
  customer: {
    style: 'card',
    showBilledToPill: true,
    nameLabel: 'Billed To:',
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
  isSuperAdmin?: boolean;
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
  isSuperAdmin: isSuperAdminProp,
  onSelectTemplate,
}) => {
  const { user } = useAuth();
  const isSuperAdmin = isSuperAdminProp !== undefined ? isSuperAdminProp : user?.role === 'SUPER_ADMIN';

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
        description: 'Authentic Lao Steel industrial styling with green globe emblem, dual company ledger borders, LSV watermark, and guarantee terms.',
        archetype: 'lao-steel',
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
          style: 'lao-steel',
          showLogo: true,
          logoPosition: 'center',
          titleText: 'INVOICE',
          titleBadge: {
            style: 'box',
            text: 'INVOICE',
            alignment: 'right',
            badgeColor: '#e8f5e9',
            badgeTextColor: '#0f522b',
          },
        },
        customer: {
          style: 'classic-trade',
          nameLabel: 'CUSTOMER NAME:',
          addressLabel: 'PHONE:',
        },
        table: {
          headerBackground: '#0d47a1',
          headerTextColor: '#ffffff',
          alternateRowStriping: false,
          borderStyle: 'double-ledger',
          gridStyle: 'full-grid',
          borderColor: '#0d47a1',
          columns: [
            { id: 'pos', label: 'ITEMS', field: 'index', widthPercent: 8, align: 'center' },
            { id: 'qty', label: 'QTY.', field: 'qty', widthPercent: 14, align: 'center' },
            { id: 'desc', label: 'DESCRIPTION OF GOODS', field: 'description', widthPercent: 44, align: 'left' },
            { id: 'price', label: 'RATE (₦)', field: 'unit_price', widthPercent: 16, align: 'right' },
            { id: 'amt', label: 'AMOUNT (₦)', field: 'amount', widthPercent: 18, align: 'right' },
          ],
          fillBlankRows: true,
          minRows: 8,
        },
        summary: {
          position: 'right',
          layout: 'table-integrated',
          totalLabel: 'TOTAL',
          highlightTotalBackground: '#e8f0fe',
          highlightTotalTextColor: '#0d47a1',
          showAmountInWords: false,
        },
        footer: {
          guaranteeText: 'GUARANTEED GOODS ARE NOT RETURNABLE AFTER PURCHASE. NO REFUND OF MONEY AFTER PAYMENT.',
          courtesyGreeting: '',
          showSignatures: true,
          signatureCount: 2,
          signatureLabels: ["Customer's Signature", 'For: LAO STEEL VENTURES'],
          watermarkText: 'LSV',
          termsAndConditions: 'Guaranteed goods are not returnable after purchase. No refund of money after payment.',
        },
      };
    }

    return DEFAULT_CONFIG;
  };

  const [aiConfig, setAiConfig] = useState<CustomTemplateConfig>(parseConfig(customTemplateUrl));
  const [viewMode, setViewMode] = useState<'template' | 'reference' | 'blueprint'>('template');

  useEffect(() => {
    if (customTemplateUrl !== undefined) {
      setAiConfig(parseConfig(customTemplateUrl));
    }
  }, [customTemplateUrl, businessName, receiptPrefix]);

  const prefix = (receiptPrefix || 'INV').toUpperCase();
  const bizName = (businessName || 'BUSINESS ENTERPRISE').toUpperCase();

  // Validate if business has an authentic custom logo (prevent showing platform default cube)
  const hasRealLogo = Boolean(
    (logoUrl || logo) &&
    typeof (logoUrl || logo) === 'string' &&
    !['/platform-logo.svg', '/logo.png', '/logo.svg', 'null', 'undefined', ''].includes((logoUrl || logo) as string) &&
    !((logoUrl || logo) as string).includes('platform-logo')
  );

  const businessInitials = (businessName || 'B')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join('') || 'B';

  const isTradeVoucher = Boolean(
    aiConfig.archetype === 'trade-voucher' ||
    aiConfig.header.layout === 'trade-header' ||
    aiConfig.header.style === 'trade-strip' ||
    aiConfig.customer?.style === 'underlined-grid' ||
    aiConfig.footer?.signatureBoxStyle === 'stamp-box' ||
    (Boolean(aiConfig.rawImagePreviewUrl) && !isLaoSteel)
  );

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="w-[98vw] max-w-4xl h-[94vh] max-h-[94vh] flex flex-col p-0 rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl overflow-hidden focus:outline-none">
        {/* Modal Top Header */}
        <div className="shrink-0 p-3 sm:p-4 border-b border-slate-800 bg-slate-950/90 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 z-10 pr-10 sm:pr-4">
          <div className="flex items-center space-x-2.5 sm:space-x-3 min-w-0">
            <div className="p-2 sm:p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shrink-0">
              <Printer className="h-4 w-4 sm:h-5 sm:w-5" />
            </div>
            <div className="min-w-0">
              <DialogTitle className="text-sm sm:text-base font-bold text-white flex items-center space-x-2 font-heading truncate">
                <span>{isSuperAdmin ? 'Invoice & Receipt Template Studio' : 'Printable Invoice Template Preview'}</span>
              </DialogTitle>
              <DialogDescription className="text-[11px] sm:text-xs text-slate-400 mt-0.5 line-clamp-1">
                {isSuperAdmin
                  ? 'Official A4 printable invoice design layout extracted and rendered with your business records.'
                  : 'Official visual layout used for your printable PDF receipts and customer invoices.'}
              </DialogDescription>
            </div>
          </div>

          {/* Template Badge */}
          <div className="flex items-center space-x-2 shrink-0">
            <Badge className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[11px] sm:text-xs py-1 px-2.5 sm:px-3 font-semibold">
              <Sparkles className="h-3 w-3 mr-1 text-amber-400 shrink-0" />
              <span className="truncate max-w-[180px] sm:max-w-none">{aiConfig.templateName || 'Bespoke Custom Template'}</span>
            </Badge>
          </div>
        </div>

        {/* Modal Main Workspace */}
        <div className="flex-1 flex flex-col overflow-hidden bg-slate-950/70">
          {/* LEFT: Preview Viewport Canvas */}
          <div className="flex-1 overflow-y-auto overflow-x-auto p-2.5 sm:p-4 md:p-6 flex flex-col items-center justify-start relative">
            {/* View Mode Toolbar */}
            <div className="w-full max-w-[760px] flex flex-wrap items-center justify-between gap-2 pb-3 text-xs mb-2">
              <div className="flex items-center gap-1.5">
                <Badge className="bg-slate-800 text-slate-300 border border-slate-700 text-[10px] py-0.5 px-2 font-mono shrink-0">
                  A4 Printable Layout
                </Badge>
              </div>

              <div className="flex items-center space-x-1 bg-slate-900 border border-slate-800 p-1 rounded-xl shrink-0 overflow-x-auto max-w-full">
                <button
                  type="button"
                  onClick={() => setViewMode('template')}
                  className={`px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center space-x-1.5 shrink-0 ${
                    viewMode === 'template'
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <FileText className="h-3.5 w-3.5 shrink-0" />
                  <span>Preview</span>
                </button>
                {aiConfig.rawImagePreviewUrl && (
                  <button
                    type="button"
                    onClick={() => setViewMode('reference')}
                    className={`px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center space-x-1.5 shrink-0 ${
                      viewMode === 'reference'
                        ? 'bg-purple-600 text-white shadow-sm'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <ImageIcon className="h-3.5 w-3.5 shrink-0" />
                    <span>Original Upload</span>
                  </button>
                )}
                {isSuperAdmin && aiConfig.layoutDescription && (
                  <button
                    type="button"
                    onClick={() => setViewMode('blueprint')}
                    className={`px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center space-x-1.5 shrink-0 ${
                      viewMode === 'blueprint'
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <Sparkles className="h-3.5 w-3.5 shrink-0" />
                    <span>AI Spatial Blueprint</span>
                  </button>
                )}
              </div>
            </div>

            {/* A4 Document Preview */}
            {viewMode === 'template' && (
              <div
                  className="w-full max-w-[760px] rounded-lg shadow-2xl p-3 sm:p-6 md:p-8 relative select-none transition-all duration-300 border"
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
                    {aiConfig.footer.watermarkText === 'LSV' || isLaoSteel ? (
                      <div className="opacity-10 flex flex-col items-center justify-center scale-150 select-none">
                        <img
                          src="/laosteel-logo.svg"
                          alt="LSV Watermark"
                          className="w-48 h-48 object-contain"
                        />
                      </div>
                    ) : (
                      <span
                        className="font-extrabold text-5xl sm:text-7xl uppercase tracking-widest rotate-[-30deg] select-none opacity-10 text-center px-4"
                        style={{ color: aiConfig.theme.primaryColor }}
                      >
                        {aiConfig.footer.watermarkText}
                      </span>
                    )}
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
                {aiConfig.archetype === 'lao-steel' || aiConfig.header.style === 'lao-steel' || (isLaoSteel && !aiConfig.rawImagePreviewUrl) ? (
                  /* 0. Authentic Lao Steel Bespoke Layout */
                  <div className="mb-4">
                    {/* Centered Business Header */}
                    <div className="text-center pb-3 mb-3 border-b-2" style={{ borderColor: '#0f522b' }}>
                      <div className="flex justify-center mb-2">
                        {hasRealLogo ? (
                          <img
                            src={(logoUrl || logo) as string}
                            alt={bizName}
                            className="h-14 max-w-[180px] object-contain"
                          />
                        ) : (
                          <div className="flex items-center justify-center">
                            <img
                              src="/laosteel-logo.svg"
                              alt="Lao Steel Ventures"
                              className="h-14 w-14 object-contain"
                              onError={(e) => {
                                (e.target as HTMLElement).style.display = 'none';
                              }}
                            />
                          </div>
                        )}
                      </div>

                      <h2 className="text-2xl sm:text-3xl font-black font-heading uppercase tracking-tight text-[#0f522b]">
                        LAO STEEL VENTURES
                      </h2>
                      <p className="text-[11px] sm:text-xs font-bold uppercase tracking-wide mt-0.5 text-[#0f522b]">
                        STEEL STOCKISTS, INDUSTRIAL AND BUILDING MATERIALS SUPPLIERS
                      </p>
                      <p className="text-[10px] sm:text-xs font-semibold uppercase mt-0.5 text-slate-700">
                        HEAD OFFICE: S/L/L.G SHOP 249, IFESOWAPO IRON MKT., SECTION &quot;C&quot; LINE 2, ORILE-IGANMU, LAGOS
                      </p>
                      <p className="text-[10px] sm:text-xs font-mono font-bold mt-0.5 text-[#0f522b]">
                        TEL: 08034071931, 08052008315, 08094972005
                      </p>
                    </div>

                    {/* Customer & Invoice Row (Below divider line) */}
                    <div className="flex flex-col sm:flex-row items-start justify-between gap-4 mb-4 text-xs">
                      {/* Left Side: Customer Info (Clean Underlined Trade Lines) */}
                      <div className="w-full sm:w-[58%] space-y-2">
                        <div className="flex items-baseline gap-2">
                          <span className="font-bold text-xs uppercase tracking-wider text-slate-900 shrink-0">
                            CUSTOMER NAME:
                          </span>
                          <span className="flex-1 border-b-2 border-slate-900 font-bold text-slate-900 pb-0.5">
                            Alhaji Musa Dangote &amp; Sons Ltd.
                          </span>
                        </div>
                        <div className="flex items-baseline gap-2">
                          <span className="font-bold text-xs uppercase tracking-wider text-slate-600 shrink-0">
                            PHONE:
                          </span>
                          <span className="font-mono text-slate-800 font-semibold">
                            08023456789
                          </span>
                        </div>
                        <div className="flex items-baseline gap-2">
                          <span className="font-bold text-xs uppercase tracking-wider text-slate-900 shrink-0">
                            L.P.O. No.:
                          </span>
                          <span className="flex-1 border-b border-slate-400 font-mono text-slate-800 pb-0.5">
                            0429
                          </span>
                        </div>
                      </div>

                      {/* Right Side: INVOICE Green Box & Red Code */}
                      <div className="w-full sm:w-[38%] flex flex-col items-start sm:items-end text-left sm:text-right">
                        <div className="px-6 py-1.5 rounded-lg border-2 border-[#0f522b] bg-[#e8f5e9] text-center font-black text-sm text-[#0f522b] uppercase tracking-wider">
                          INVOICE
                        </div>
                        <div className="mt-1.5 font-bold font-mono text-sm text-red-600">
                          No. {prefix}-0000042
                        </div>
                        <div className="text-[11px] font-semibold text-slate-700 mt-0.5">
                          DATE: {new Date().toLocaleDateString('en-GB')}
                        </div>
                      </div>
                    </div>
                  </div>
                ) : isTradeVoucher ? (
                  /* 1. Authentic Nigerian Trade Voucher Layout (Global Refit, Trade Vouchers, Extracted Mockups) */
                  <div className="mb-4">
                    {/* Top Header: Logo on left, Big Bold Company Name & Tagline */}
                    <div className="flex items-center justify-between gap-4 pb-2">
                      <div className="flex items-center gap-3.5">
                        {hasRealLogo ? (
                          <img
                            src={(logoUrl || logo) as string}
                            alt={bizName}
                            className="h-14 max-w-[150px] object-contain"
                          />
                        ) : (
                          <div className="flex flex-col items-center justify-center shrink-0">
                            <div
                              className="h-12 w-12 rounded-xl flex items-center justify-center font-black text-xl text-white shadow-sm"
                              style={{ backgroundColor: aiConfig.theme.primaryColor || '#0052cc' }}
                            >
                              {businessInitials || 'GR'}
                            </div>
                            <span className="text-[9px] font-bold text-slate-600 uppercase tracking-tight mt-0.5 text-center leading-none">
                              {bizName.split(' ').slice(0, 2).join(' ')}
                            </span>
                          </div>
                        )}

                        <div>
                          <h2
                            className="text-2xl sm:text-3xl font-black font-heading uppercase tracking-tight leading-none"
                            style={{ color: aiConfig.theme.primaryColor || '#0052cc' }}
                          >
                            {bizName}
                          </h2>
                          <p className="text-xs font-semibold text-slate-700 mt-1 italic">
                            {tagline || 'Dealers in supply, repair and general services.'}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* 3-Column Trade Sub-Strip: Office Address | INVOICE | Contact */}
                    <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto_1fr] items-center gap-2 pt-2 pb-2 text-xs">
                      <div className="text-left min-w-0">
                        <span className="text-[10px] font-bold text-red-600 uppercase block tracking-wider">
                          Office Address:
                        </span>
                        <span className="text-[11px] sm:text-xs font-bold text-slate-800 leading-tight block break-words">
                          {address || '19 Oguntifa Street, Off Church Street, Alapere Ketu, Lagos'}
                        </span>
                      </div>

                      <div className="text-center sm:px-4 sm:border-l sm:border-r border-slate-300 py-1 shrink-0">
                        <span
                          className="text-xl sm:text-2xl font-black tracking-wider uppercase inline-block"
                          style={{
                            color:
                              aiConfig.theme.accentColor && aiConfig.theme.accentColor !== '#ffffff'
                                ? aiConfig.theme.accentColor
                                : '#dc2626',
                          }}
                        >
                          {aiConfig.header.titleText || 'INVOICE'}
                        </span>
                      </div>

                      <div className="text-left sm:text-right min-w-0">
                        <span className="text-[10px] font-bold text-red-600 uppercase block tracking-wider">
                          Contact:
                        </span>
                        <span className="text-[11px] sm:text-xs font-mono font-bold text-slate-900 block break-words">
                          {phone || '08028386659'}
                        </span>
                      </div>
                    </div>

                    {/* Solid Blue/Primary Divider Line */}
                    <div
                      className="border-b-2 mb-3 mt-1"
                      style={{ borderColor: aiConfig.theme.primaryColor || '#0052cc' }}
                    />

                    {/* Underlined Customer Section: Name/Date and Address/Sign */}
                    <div className="space-y-2 mb-3 text-xs font-semibold">
                      {/* Row 1: Name and Date */}
                      <div className="flex flex-col sm:flex-row items-baseline gap-2 sm:gap-4">
                        <div className="flex-1 min-w-0 w-full flex items-baseline gap-2">
                          <span
                            className="font-bold shrink-0 uppercase tracking-tight text-xs"
                            style={{ color: aiConfig.theme.primaryColor || '#0052cc' }}
                          >
                            {aiConfig.customer?.nameLabel || 'Name:'}
                          </span>
                          <span
                            className="flex-1 min-w-0 border-b-2 pb-0.5 font-bold font-sans text-slate-900 text-xs truncate"
                            style={{ borderColor: aiConfig.table.borderColor || '#0052cc' }}
                          >
                            Alhaji Musa Dangote &amp; Sons Ltd.
                          </span>
                        </div>
                        <div className="w-full sm:w-44 flex items-baseline gap-2 shrink-0">
                          <span
                            className="font-bold shrink-0 uppercase tracking-tight text-xs"
                            style={{ color: aiConfig.theme.primaryColor || '#0052cc' }}
                          >
                            Date:
                          </span>
                          <span
                            className="flex-1 border-b-2 pb-0.5 font-mono text-slate-900 text-xs font-bold text-center"
                            style={{ borderColor: aiConfig.table.borderColor || '#0052cc' }}
                          >
                            {new Date().toLocaleDateString('en-GB')}
                          </span>
                        </div>
                      </div>

                      {/* Row 2: Address and Sign */}
                      <div className="flex flex-col sm:flex-row items-baseline gap-2 sm:gap-4">
                        <div className="flex-1 min-w-0 w-full flex items-baseline gap-2">
                          <span
                            className="font-bold shrink-0 uppercase tracking-tight text-xs"
                            style={{ color: aiConfig.theme.primaryColor || '#0052cc' }}
                          >
                            {aiConfig.customer?.addressLabel || 'Address:'}
                          </span>
                          <span
                            className="flex-1 min-w-0 border-b-2 pb-0.5 font-sans text-slate-700 text-xs truncate"
                            style={{ borderColor: aiConfig.table.borderColor || '#0052cc' }}
                          >
                            Plot 14, Commercial District, Ikeja, Lagos
                          </span>
                        </div>
                        <div className="w-full sm:w-44 flex items-baseline gap-2 shrink-0">
                          <span
                            className="font-bold shrink-0 uppercase tracking-tight text-xs"
                            style={{ color: aiConfig.theme.primaryColor || '#0052cc' }}
                          >
                            Sign:
                          </span>
                          <span
                            className="flex-1 border-b-2 pb-0.5 text-xs"
                            style={{ borderColor: aiConfig.table.borderColor || '#0052cc' }}
                          >
                            &nbsp;
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : aiConfig.archetype === 'commercial-docket' || aiConfig.header.style === 'centered-commercial' ? (
                  /* 2. Centered Commercial Docket Layout (exact match to paper receipt/invoice) */
                  <div className="mb-4">
                    {/* Centered Business Header */}
                    <div className="text-center pb-3 mb-3 border-b-2" style={{ borderColor: aiConfig.theme.primaryColor }}>
                      <div className="flex justify-center mb-2">
                        {hasRealLogo ? (
                          <img
                            src={(logoUrl || logo) as string}
                            alt={bizName}
                            className="h-12 max-w-[160px] object-contain"
                          />
                        ) : (
                          <div
                            className="h-12 w-12 rounded-xl flex items-center justify-center font-black text-xl text-white shadow-sm border border-white/20"
                            style={{ backgroundColor: aiConfig.theme.primaryColor }}
                          >
                            {businessInitials}
                          </div>
                        )}
                      </div>
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
                  /* 3. Top Banner Layout */
                  <div>
                    <div
                      className="p-4 rounded-xl mb-4 flex flex-col sm:flex-row justify-between items-center gap-3"
                      style={{
                        backgroundColor: aiConfig.header.bannerBackground || aiConfig.theme.primaryColor,
                        color: aiConfig.header.bannerTextColor || '#ffffff',
                      }}
                    >
                      <div className="flex items-center gap-3">
                        {hasRealLogo ? (
                          <img
                            src={(logoUrl || logo) as string}
                            alt={bizName}
                            className="h-12 w-12 object-contain bg-white rounded-lg p-1 shadow-sm shrink-0"
                          />
                        ) : (
                          <div
                            className="h-12 w-12 rounded-xl bg-white/20 border border-white/30 flex items-center justify-center font-black text-xl text-white shadow-sm shrink-0"
                          >
                            {businessInitials}
                          </div>
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
                        <p className="font-bold text-sm text-slate-900 mt-0.5">Alhaji Musa Dangote &amp; Sons Ltd.</p>
                        <p className="text-slate-600 text-xs">08023456789 • Orile Commercial Depot</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  /* 4. Modern Split Layout */
                  <div>
                    <div className="flex justify-between items-start pb-5 mb-4 border-b" style={{ borderColor: aiConfig.table.borderColor }}>
                      <div className="flex items-start gap-3">
                        {hasRealLogo ? (
                          <img
                            src={(logoUrl || logo) as string}
                            alt={bizName}
                            className="h-12 w-12 object-contain rounded-xl border border-slate-200 bg-white p-1 shadow-sm shrink-0"
                          />
                        ) : (
                          <div
                            className="h-12 w-12 rounded-xl flex items-center justify-center font-black text-xl text-white shadow-sm shrink-0 border border-white/20"
                            style={{ backgroundColor: aiConfig.theme.primaryColor }}
                          >
                            {businessInitials}
                          </div>
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
                        <p className="font-bold text-sm text-slate-900 mt-0.5">Alhaji Musa Dangote &amp; Sons Ltd.</p>
                        <p className="text-slate-600 text-xs">08023456789 • Orile Commercial Depot</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Dynamic Table Layout */}
                {(() => {
                  const activeColumns: CustomTemplateColumn[] = (aiConfig.table.columns && aiConfig.table.columns.length > 0)
                    ? aiConfig.table.columns
                    : isTradeVoucher
                    ? [
                        { id: 'sn', label: 'S/N', field: 'index', widthPercent: 8, align: 'center' },
                        { id: 'qty', label: 'QUALITY', field: 'qty', widthPercent: 18, align: 'center' },
                        { id: 'desc', label: 'DESCRIPTION', field: 'description', widthPercent: 44, align: 'left' },
                        { id: 'price', label: 'RATE', field: 'unit_price', widthPercent: 15, align: 'right' },
                        { id: 'amt', label: 'AMOUNT', field: 'amount', widthPercent: 15, align: 'right' },
                      ]
                    : [
                        { id: 'qty', label: 'QTY.', field: 'qty', widthPercent: 15, align: 'center' },
                        { id: 'desc', label: 'DESCRIPTION', field: 'description', widthPercent: 45, align: 'left' },
                        { id: 'price', label: 'UNIT PRICE', field: 'unit_price', widthPercent: 20, align: 'right' },
                        { id: 'amt', label: 'AMOUNT', field: 'amount', widthPercent: 20, align: 'right' },
                      ];

                  const sampleRows = [
                    { sn: '1', pos: '1', quality: '120 PCS', qty: '120 PCS', description: '12mm TMT Deformed Rebar (Length: 12m)', rate: '8,500.00', unit_price: '8,500.00', amount: '1,020,000.00', index: 1 },
                    { sn: '2', pos: '2', quality: '80 PCS', qty: '80 PCS', description: '16mm High-Yield High-Tensile Steel Rod', rate: '14,200.00', unit_price: '14,200.00', amount: '1,136,000.00', index: 2 },
                  ];

                  const getCellValue = (row: any, col: CustomTemplateColumn, rIdx: number) => {
                    const f = col.field;
                    const id = col.id?.toLowerCase() || '';
                    const l = col.label?.toLowerCase() || '';

                    if (f === 'index' || id === 'sn' || id === 's/n' || l.includes('s/n') || l === 'sn' || id === 'pos' || l.includes('item')) {
                      return rIdx + 1;
                    }
                    if (f === 'qty' || id === 'quality' || l.includes('qual') || l.includes('qty')) {
                      return row.qty || row.quality;
                    }
                    if (f === 'unit_price' || id === 'rate' || l.includes('rate') || l.includes('price')) {
                      return row.rate || row.unit_price;
                    }
                    if (f === 'amount' || id === 'amt' || l.includes('amount')) {
                      return row.amount;
                    }
                    if (f === 'description' || id === 'desc' || l.includes('desc')) {
                      return row.description;
                    }
                    return (row as any)[f] || '—';
                  };

                  const emptyRowCount = aiConfig.table.fillBlankRows !== false
                    ? Math.max(3, (aiConfig.table.minRows || 8) - sampleRows.length)
                    : 0;

                  return (
                    <div className="relative overflow-x-auto mb-4 rounded-xl border-2" style={{ borderColor: aiConfig.table.borderColor || '#0052cc' }}>
                      {/* Table Center Watermark */}
                      {(hasRealLogo || aiConfig.rawImagePreviewUrl || isTradeVoucher) && (
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.07] select-none z-0">
                          {hasRealLogo ? (
                            <img
                              src={(logoUrl || logo) as string}
                              alt="Watermark"
                              className="w-48 h-48 object-contain"
                            />
                          ) : (
                            <div className="flex flex-col items-center justify-center text-center">
                              <div className="text-6xl font-black tracking-widest uppercase" style={{ color: aiConfig.theme.primaryColor || '#0052cc' }}>
                                {businessInitials || 'GR'}
                              </div>
                              <div className="text-xs font-black uppercase tracking-wider mt-1" style={{ color: aiConfig.theme.primaryColor || '#0052cc' }}>
                                {bizName}
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      <table className="w-full text-xs border-collapse relative z-10">
                        <thead>
                          <tr
                            style={{
                              backgroundColor: aiConfig.table.headerBackground || aiConfig.theme.primaryColor || '#0052cc',
                              color: aiConfig.table.headerTextColor || '#ffffff',
                            }}
                          >
                            {activeColumns.map((col, cIdx) => (
                              <th
                                key={col.id || cIdx}
                                className={`p-1.5 sm:p-2.5 font-bold uppercase tracking-wider text-[10px] sm:text-xs ${
                                  col.align === 'center' ? 'text-center' : col.align === 'right' ? 'text-right' : 'text-left'
                                } ${cIdx < activeColumns.length - 1 ? 'border-r border-white/30' : ''}`}
                                style={{ width: col.widthPercent ? `${col.widthPercent}%` : undefined }}
                              >
                                {col.label}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="font-mono divide-y" style={{ borderColor: aiConfig.table.borderColor || '#0052cc' }}>
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
                                  className={`p-1.5 sm:p-2.5 text-[11px] sm:text-xs ${
                                    col.align === 'center' ? 'text-center' : col.align === 'right' ? 'text-right' : 'text-left'
                                  } ${col.field === 'description' ? 'font-sans font-semibold' : ''} ${
                                    col.field === 'amount' ? 'font-bold' : ''
                                  } ${cIdx < activeColumns.length - 1 ? 'border-r' : ''}`}
                                  style={{
                                    borderColor: aiConfig.table.borderColor || '#0052cc',
                                    backgroundColor: ((aiConfig.archetype === 'lao-steel' || isLaoSteel) && (col.id === 'pos' || col.id === 'qty' || col.id === 'amt'))
                                      ? '#e8f0fe'
                                      : undefined,
                                  }}
                                >
                                  {getCellValue(row, col, rIdx)}
                                </td>
                              ))}
                            </tr>
                          ))}

                          {/* Empty ledger rows */}
                          {Array.from({ length: emptyRowCount }).map((_, eIdx) => (
                            <tr key={`empty_${eIdx}`} className="h-6 sm:h-7" style={{ backgroundColor: '#ffffff' }}>
                              {activeColumns.map((col, cIdx) => (
                                <td
                                  key={`empty_col_${cIdx}`}
                                  className={`p-1.5 sm:p-2.5 ${cIdx < activeColumns.length - 1 ? 'border-r' : ''}`}
                                  style={{
                                    borderColor: aiConfig.table.borderColor || '#0052cc',
                                    backgroundColor: ((aiConfig.archetype === 'lao-steel' || isLaoSteel) && (col.id === 'pos' || col.id === 'qty' || col.id === 'amt'))
                                      ? '#e8f0fe'
                                      : undefined,
                                  }}
                                >
                                  &nbsp;
                                </td>
                              ))}
                            </tr>
                          ))}

                          {/* Integrated Grand Total Row */}
                          {(aiConfig.summary.layout === 'table-integrated' || isTradeVoucher) && (
                            <tr className="font-bold border-t-2" style={{ borderColor: aiConfig.table.borderColor || '#0052cc' }}>
                              <td
                                colSpan={Math.max(1, activeColumns.length - 1)}
                                className="p-2 sm:p-2.5 text-center sm:text-right font-black uppercase tracking-wider text-[11px] sm:text-xs"
                                style={{ color: aiConfig.theme.primaryColor || '#0052cc' }}
                              >
                                {aiConfig.summary.totalLabel || 'TOTAL'} (₦):
                              </td>
                              <td
                                className="p-2 sm:p-2.5 text-right font-black text-xs sm:text-sm font-mono border-l-2"
                                style={{
                                  borderColor: aiConfig.table.borderColor || '#0052cc',
                                  backgroundColor: aiConfig.summary.highlightTotalBackground || '#ffffff',
                                  color: aiConfig.summary.highlightTotalTextColor || aiConfig.theme.primaryColor || '#0052cc',
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

                {/* Detached Totals Card if not table-integrated and not trade voucher */}
                {aiConfig.summary.layout !== 'table-integrated' && !isTradeVoucher && (
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

                {/* Authentic Trade Voucher Footer or Standard Footer */}
                {isTradeVoucher ? (
                  <div className="mt-3 space-y-3">
                    {/* Amount in words + Office Signature Stamp Box */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-3">
                      <div className="flex-1 w-full min-w-0 flex items-baseline gap-2">
                        <span
                          className="font-bold text-xs shrink-0"
                          style={{ color: aiConfig.theme.primaryColor || '#0052cc' }}
                        >
                          Amount in words:
                        </span>
                        <span
                          className="flex-1 min-w-0 border-b-2 pb-0.5 italic font-serif text-xs text-slate-800 break-words"
                          style={{ borderColor: aiConfig.table.borderColor || '#0052cc' }}
                        >
                          Two Million, One Hundred and Fifty-Six Thousand Naira Only.
                        </span>
                      </div>

                      <div
                        className="border-2 w-40 sm:w-48 h-14 sm:h-16 p-2 flex flex-col justify-between shrink-0 bg-white shadow-sm self-end sm:self-auto"
                        style={{ borderColor: aiConfig.table.borderColor || '#0052cc' }}
                      >
                        <span
                          className="text-[10px] font-bold uppercase tracking-tight block"
                          style={{ color: aiConfig.theme.primaryColor || '#0052cc' }}
                        >
                          {aiConfig.footer.signatureLabels?.[0] || 'Office Signature'}
                        </span>
                        <div className="flex-1" />
                      </div>
                    </div>

                    {/* Guarantee Disclaimer */}
                    {aiConfig.footer.guaranteeText && (
                      <p className="text-[11px] font-black uppercase text-red-600 tracking-wide mt-2">
                        {aiConfig.footer.guaranteeText}
                      </p>
                    )}

                    {aiConfig.footer.termsAndConditions && (
                      <p className="text-[9px] text-slate-400 mt-1 leading-relaxed">
                        {aiConfig.footer.termsAndConditions}
                      </p>
                    )}
                  </div>
                ) : (
                  <div>
                    {/* Amount in words */}
                    {aiConfig.summary.showAmountInWords && (
                      <div className="pb-2 mb-3 border-b text-xs" style={{ borderColor: aiConfig.table.borderColor }}>
                        <span className="font-bold text-[10px] text-slate-500 uppercase mr-2">Amount in Words:</span>
                        <span className="italic font-serif" style={{ color: aiConfig.theme.primaryColor }}>
                          Two Million, One Hundred and Fifty-Six Thousand Naira Only.
                        </span>
                      </div>
                    )}

                    {/* Standard Footer Section */}
                    <div className="mt-3 pt-2">
                      {/* Guarantee Disclaimer */}
                      {aiConfig.footer.guaranteeText && (
                        <p className="text-[11px] font-black uppercase text-red-600 mb-3 leading-tight tracking-wide">
                          {aiConfig.footer.guaranteeText}
                        </p>
                      )}

                      {/* Courtesy & Handshake Graphic & Signatures */}
                      <div className="flex flex-col sm:flex-row items-center justify-between my-3 gap-4">
                        {/* Customer Signature Line or Stamp Box */}
                        {aiConfig.footer.signatureBoxStyle === 'stamp-box' ? (
                          <div
                            className="border-2 w-48 h-16 p-2 flex flex-col justify-between shrink-0 bg-white shadow-sm"
                            style={{ borderColor: aiConfig.table.borderColor }}
                          >
                            <span
                              className="text-[10px] font-bold uppercase tracking-tight block"
                              style={{ color: aiConfig.theme.primaryColor }}
                            >
                              {aiConfig.footer.signatureLabels?.[0] || 'Office Signature'}
                            </span>
                            <div className="flex-1" />
                          </div>
                        ) : (
                          <div className="w-56 text-left">
                            <div className="border-b-2 border-dotted pb-0.5" style={{ borderColor: aiConfig.table.borderColor }}>
                              &nbsp;
                            </div>
                            <span className="text-[10px] text-slate-700 font-bold block mt-1">
                              {aiConfig.footer.signatureLabels?.[0] || 'Customer Signature'}
                            </span>
                          </div>
                        )}

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

            {/* AI Spatial Blueprint View Mode (Super Admin Only) */}
            {viewMode === 'blueprint' && (
              <div className="w-full max-w-[760px] bg-slate-900 rounded-2xl border border-slate-800 p-5 space-y-4">
                <div className="flex items-center justify-between text-xs text-slate-400 pb-3 border-b border-slate-800">
                  <span className="flex items-center space-x-2 text-blue-400 font-bold">
                    <Sparkles className="h-4 w-4" />
                    <span>AI Spatial Decomposition &amp; Design Blueprint</span>
                  </span>
                  <Badge className="bg-blue-500/10 text-blue-400 border border-blue-500/20 text-[10px]">
                    Super Admin View
                  </Badge>
                </div>
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-xs leading-relaxed space-y-3 font-sans">
                  <p className="text-slate-400 text-[11px] uppercase tracking-wider font-semibold">
                    Visual Layout Breakdown extracted from uploaded reference:
                  </p>
                  <p className="whitespace-pre-wrap leading-relaxed">
                    {aiConfig.layoutDescription || 'No spatial layout description recorded.'}
                  </p>
                </div>
              </div>
            )}

          </div>
        </div>

        {/* Modal Action Footer */}
        <div className="shrink-0 p-3 sm:p-4 border-t border-slate-800 bg-slate-950/95 flex flex-col sm:flex-row items-center justify-between gap-2.5 z-10">
          <div className="text-xs text-slate-400 text-center sm:text-left min-w-0">
            <span className="text-white font-semibold truncate inline-block max-w-[220px] sm:max-w-none align-bottom">
              {aiConfig.templateName || 'Bespoke Custom Template'}
            </span>
            <span className="ml-1 sm:ml-2 text-emerald-400 text-[11px] sm:text-xs">
              (Live preview with {bizName} details)
            </span>
          </div>

          <div className="flex items-center space-x-2 w-full sm:w-auto justify-end shrink-0">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onClose}
              className="rounded-xl text-xs border-slate-700 text-slate-300 hover:bg-slate-800 h-9 px-3.5 sm:px-4 cursor-pointer flex-1 sm:flex-none"
            >
              Close
            </Button>

            {isSuperAdmin && onSelectTemplate && (
              <Button
                type="button"
                size="sm"
                onClick={() => {
                  onSelectTemplate('custom', JSON.stringify(aiConfig));
                  onClose();
                }}
                className="bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold h-9 px-4 sm:px-5 shadow-md shadow-emerald-500/20 cursor-pointer flex-1 sm:flex-none"
              >
                <span>Save<span className="hidden sm:inline"> &amp; Apply</span> Template</span>
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
