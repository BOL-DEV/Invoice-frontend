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
  Code,
  Copy,
} from 'lucide-react';
import { apiClient } from '../../services/api/axios';
import { API_ENDPOINTS } from '../../services/api/endpoints';
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
  const [viewMode, setViewMode] = useState<'template' | 'reference' | 'blueprint' | 'code'>('template');
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

  const getMasterHtmlTemplate = (
    archetype: 'trade-voucher' | 'lao-steel' | 'corporate' | 'commercial-docket',
    config: CustomTemplateConfig
  ): string => {
    const primaryColor = config.theme?.primaryColor || (archetype === 'lao-steel' ? '#0f522b' : archetype === 'corporate' ? '#0f172a' : archetype === 'commercial-docket' ? '#1e293b' : '#1a365d');
    const accentColor = config.theme?.accentColor || (archetype === 'lao-steel' ? '#16a34a' : archetype === 'corporate' ? '#3b82f6' : archetype === 'commercial-docket' ? '#d97706' : '#dc2626');
    const words = bizName.split(' ');
    const part1 = config.titleSplit?.part1 || words[0] || 'GLOBAL';
    const part2 = config.titleSplit?.part2 || words[1] || 'REFIT';
    const suffix = config.titleSplit?.suffix || (words.length > 2 ? words.slice(2).join(' ') : 'NIGERIA LIMITED');
    const watermark = config.footer?.watermarkText || `${part1} ${part2}`;
    const stampTitle = config.stampBoxTitle || 'Office Signature';
    const guarantee = config.footer?.guaranteeText || 'GOODS SOLD OUT ARE NOT RETURNABLE';

    if (archetype === 'lao-steel') {
      const green = '#0f522b';
      return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif; color: #000; background: #fff; padding: 24px; font-size: 13px; line-height: 1.35; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  .lao-card { max-width: 800px; margin: 0 auto; background: #fff; position: relative; border: 3px solid ${green}; padding: 16px; }
  .inner-ledger-border { border: 1px solid ${green}; padding: 16px; position: relative; }
  .header-center { text-align: center; padding-bottom: 12px; margin-bottom: 12px; border-bottom: 2px solid ${green}; }
  .company-title { font-size: 28px; font-weight: 900; color: ${green}; text-transform: uppercase; letter-spacing: -0.5px; line-height: 1.1; }
  .company-tagline { font-size: 11px; font-weight: 800; color: ${green}; text-transform: uppercase; letter-spacing: 0.5px; margin-top: 3px; }
  .company-address { font-size: 10px; font-weight: 700; color: #334155; text-transform: uppercase; margin-top: 3px; line-height: 1.25; }
  .company-tel { font-size: 11px; font-weight: 800; color: ${green}; font-family: monospace; margin-top: 3px; }
  .cust-section { display: flex; align-items: flex-start; justify-content: space-between; gap: 16px; margin-bottom: 14px; font-size: 12px; }
  .cust-left { flex: 1; }
  .cust-line-item { display: flex; align-items: baseline; gap: 6px; margin-bottom: 6px; }
  .cust-label { font-weight: 800; font-size: 11px; text-transform: uppercase; color: #000; }
  .cust-val-underlined { flex: 1; border-bottom: 2px solid #000; font-weight: 700; font-size: 12px; padding-bottom: 1px; }
  .table-box { position: relative; border: 2px solid ${green}; margin-bottom: 12px; }
  .lsv-watermark { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%) rotate(-25deg); opacity: 0.08; pointer-events: none; font-size: 110px; font-weight: 900; color: ${green}; letter-spacing: 6px; z-index: 0; }
  table.lao-table { width: 100%; border-collapse: collapse; position: relative; z-index: 1; }
  table.lao-table th { background: ${green}; color: #ffffff; font-weight: 800; font-size: 11px; text-transform: uppercase; padding: 7px 8px; border-right: 1px solid rgba(255,255,255,0.4); }
  table.lao-table th:last-child { border-right: none; }
  table.lao-table td { padding: 7px 10px; font-size: 12px; border-right: 1px solid ${green}; border-bottom: 1px solid ${green}; color: #000; }
  table.lao-table td:last-child { border-right: none; }
  .total-row td { font-weight: 900; font-size: 13px; color: ${green}; border-top: 2px solid ${green}; border-bottom: none; padding: 8px 10px; }
  .bottom-row { display: flex; align-items: flex-end; justify-content: space-between; gap: 16px; margin-top: 10px; }
  .words-box { flex: 1; display: flex; align-items: baseline; gap: 6px; }
  .words-title { font-weight: 800; font-size: 11px; color: ${green}; text-transform: uppercase; }
  .words-line { flex: 1; border-bottom: 2px solid ${green}; font-style: italic; font-weight: 700; font-size: 12px; }
  .sign-box { width: 200px; text-align: right; }
  .sign-line { border-bottom: 2px solid ${green}; height: 36px; }
  .sign-label { font-size: 10px; font-weight: 800; color: ${green}; margin-top: 4px; text-transform: uppercase; }
  .disclaimer { color: #dc2626; font-weight: 900; font-size: 11px; text-align: center; margin-top: 12px; letter-spacing: 0.5px; }
  @media print { body { padding: 0; } .lao-card { max-width: 100%; } }
</style>
</head>
<body>
<div class="lao-card">
  <div class="inner-ledger-border">
    <div class="header-center">
      <div style="display: flex; justify-content: center; margin-bottom: 6px;">{{logo}}</div>
      <div class="company-title">{{businessName}}</div>
      <div class="company-tagline">{{tagline}}</div>
      <div class="company-address">{{address}}</div>
      <div class="company-tel">TEL: {{phone}}</div>
    </div>
    <div class="cust-section">
      <div class="cust-left">
        <div class="cust-line-item"><span class="cust-label">CUSTOMER NAME:</span><span class="cust-val-underlined">{{customerName}}</span></div>
        <div class="cust-line-item"><span class="cust-label">ADDRESS:</span><span class="cust-val-underlined">{{customerAddress}}</span></div>
      </div>
      <div style="width: 220px;">
        <div class="cust-line-item"><span class="cust-label">DATE:</span><span class="cust-val-underlined">{{date}}</span></div>
        <div class="cust-line-item"><span class="cust-label">INVOICE NO:</span><span class="cust-val-underlined">{{invoiceNumber}}</span></div>
      </div>
    </div>
    <div class="table-box">
      <div class="lsv-watermark">${watermark || 'LSV'}</div>
      <table class="lao-table">
        <thead>
          <tr>
            <th style="width: 8%; text-align: center;">S/N</th>
            <th style="width: 16%; text-align: center;">QTY</th>
            <th style="width: 46%; text-align: left;">DESCRIPTION</th>
            <th style="width: 15%; text-align: right;">RATE (₦)</th>
            <th style="width: 15%; text-align: right;">AMOUNT (₦)</th>
          </tr>
        </thead>
        <tbody>
          {{itemsTableRows}}
          <tr class="total-row">
            <td colspan="4" style="text-align: right;">TOTAL:</td>
            <td style="text-align: right;">{{total}}</td>
          </tr>
        </tbody>
      </table>
    </div>
    <div class="bottom-row">
      <div class="words-box"><span class="words-title">Amount in words:</span><span class="words-line">{{amountInWords}}</span></div>
      <div class="sign-box"><div class="sign-line"></div><div class="sign-label">For: {{businessName}}</div></div>
    </div>
    <div class="disclaimer">${guarantee}</div>
  </div>
</div>
</body>
</html>`;
    }

    if (archetype === 'corporate') {
      const pColor = '#0f172a';
      return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; color: #0f172a; background: #fff; padding: 30px; font-size: 13px; line-height: 1.4; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  .corp-card { max-width: 800px; margin: 0 auto; }
  .corp-header { display: flex; justify-content: space-between; align-items: flex-start; padding-bottom: 20px; border-bottom: 2px solid ${pColor}; margin-bottom: 20px; }
  .corp-brand h1 { font-size: 24px; font-weight: 900; color: ${pColor}; text-transform: uppercase; }
  .corp-brand p { font-size: 12px; color: #64748b; margin-top: 2px; }
  .corp-meta { text-align: right; }
  .corp-title-badge { font-size: 28px; font-weight: 900; color: ${pColor}; letter-spacing: -0.5px; }
  .corp-meta-val { font-size: 12px; font-weight: 700; color: #475569; margin-top: 4px; }
  .bill-to-row { display: flex; justify-content: space-between; margin-bottom: 20px; }
  .bill-box { width: 48%; }
  .bill-title { font-size: 11px; font-weight: 800; text-transform: uppercase; color: #94a3b8; margin-bottom: 4px; }
  .bill-name { font-size: 14px; font-weight: 800; color: #0f172a; }
  .bill-sub { font-size: 12px; color: #475569; margin-top: 2px; }
  table.corp-table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
  table.corp-table th { background: ${pColor}; color: #ffffff; padding: 10px 12px; font-size: 11px; font-weight: 800; text-transform: uppercase; }
  table.corp-table td { padding: 10px 12px; font-size: 13px; border-bottom: 1px solid #e2e8f0; }
  .total-card-row { display: flex; justify-content: flex-end; margin-bottom: 20px; }
  .total-card { width: 280px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px; }
  .total-card-line { display: flex; justify-content: space-between; font-size: 12px; margin-bottom: 6px; color: #475569; }
  .total-card-main { display: flex; justify-content: space-between; font-size: 15px; font-weight: 900; color: ${pColor}; border-top: 1px solid #cbd5e1; padding-top: 8px; margin-top: 6px; }
  @media print { body { padding: 0; } .corp-card { max-width: 100%; } }
</style>
</head>
<body>
<div class="corp-card">
  <div class="corp-header">
    <div class="corp-brand">{{logo}}<h1>{{businessName}}</h1><p>{{tagline}}</p><p style="font-size: 11px; color: #475569; margin-top: 4px;">{{address}} | TEL: {{phone}}</p></div>
    <div class="corp-meta"><div class="corp-title-badge">INVOICE</div><div class="corp-meta-val">NO: {{invoiceNumber}}</div><div class="corp-meta-val">DATE: {{date}}</div></div>
  </div>
  <div class="bill-to-row">
    <div class="bill-box"><div class="bill-title">BILLED TO:</div><div class="bill-name">{{customerName}}</div><div class="bill-sub">{{customerAddress}}</div><div class="bill-sub">TEL: {{customerPhone}}</div></div>
  </div>
  <table class="corp-table">
    <thead>
      <tr><th style="width: 8%; text-align: center;">#</th><th style="width: 15%; text-align: center;">QTY</th><th style="width: 47%; text-align: left;">DESCRIPTION</th><th style="width: 15%; text-align: right;">UNIT PRICE</th><th style="width: 15%; text-align: right;">AMOUNT</th></tr>
    </thead>
    <tbody>{{itemsTableRows}}</tbody>
  </table>
  <div class="total-card-row">
    <div class="total-card">
      <div class="total-card-line"><span>Subtotal:</span><span>₦{{total}}</span></div>
      <div class="total-card-line"><span>VAT (7.5%):</span><span>Included</span></div>
      <div class="total-card-main"><span>TOTAL DUE:</span><span>₦{{total}}</span></div>
    </div>
  </div>
</div>
</body>
</html>`;
    }

    if (archetype === 'commercial-docket') {
      const pColor = '#1e293b';
      return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, monospace, sans-serif; color: #1e293b; background: #fff; padding: 20px; font-size: 12px; line-height: 1.3; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  .docket-card { max-width: 760px; margin: 0 auto; border: 2px dashed ${pColor}; padding: 16px; background: #fff; }
  .docket-header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid ${pColor}; padding-bottom: 12px; margin-bottom: 12px; }
  .docket-brand h2 { font-size: 20px; font-weight: 900; color: ${pColor}; text-transform: uppercase; letter-spacing: -0.5px; }
  .docket-badge-box { text-align: right; background: #f1f5f9; border: 1px solid #cbd5e1; padding: 6px 12px; border-radius: 6px; }
  .docket-title { font-size: 16px; font-weight: 900; color: ${pColor}; text-transform: uppercase; }
  .docket-no { font-family: monospace; font-weight: 800; font-size: 13px; color: ${accentColor}; }
  .docket-meta-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px 16px; background: #f8fafc; border: 1px solid #e2e8f0; padding: 10px 12px; border-radius: 6px; margin-bottom: 12px; font-size: 11px; }
  .meta-item { display: flex; gap: 6px; }
  .meta-label { font-weight: 800; color: #475569; text-transform: uppercase; }
  .meta-val { font-weight: 700; color: #0f172a; }
  table.docket-table { width: 100%; border-collapse: collapse; margin-bottom: 12px; }
  table.docket-table th { background: ${pColor}; color: #ffffff; font-weight: 800; font-size: 10px; text-transform: uppercase; padding: 6px 8px; }
  table.docket-table td { padding: 6px 8px; font-size: 11px; border-bottom: 1px solid #e2e8f0; }
  .docket-total-row td { font-weight: 900; font-size: 13px; border-top: 2px solid ${pColor}; border-bottom: none; padding: 8px; }
  .docket-footer { display: flex; justify-content: space-between; margin-top: 14px; padding-top: 10px; border-top: 1px dashed #cbd5e1; gap: 16px; }
  .sig-block { flex: 1; text-align: center; }
  .sig-line { border-bottom: 1px solid #475569; height: 32px; margin-bottom: 4px; }
  .sig-caption { font-size: 9px; font-weight: 800; color: #64748b; text-transform: uppercase; }
  @media print { body { padding: 0; } .docket-card { max-width: 100%; border: 1px solid ${pColor}; } }
</style>
</head>
<body>
<div class="docket-card">
  <div class="docket-header"><div class="docket-brand">{{logo}}<h2>{{businessName}}</h2><p>{{address}} • TEL: {{phone}}</p></div><div class="docket-badge-box"><div class="docket-title">DISPATCH DOCKET</div><div class="docket-no">NO: {{invoiceNumber}}</div><div style="font-size: 10px; color: #64748b; margin-top: 2px;">DATE: {{date}}</div></div></div>
  <div class="docket-meta-grid">
    <div class="meta-item"><span class="meta-label">Customer:</span><span class="meta-val">{{customerName}}</span></div>
    <div class="meta-item"><span class="meta-label">Phone:</span><span class="meta-val">{{customerPhone}}</span></div>
    <div class="meta-item"><span class="meta-label">Delivery To:</span><span class="meta-val">{{customerAddress}}</span></div>
    <div class="meta-item"><span class="meta-label">Status:</span><span class="meta-val" style="color: #16a34a;">CLEARED &amp; DISPATCHED</span></div>
  </div>
  <table class="docket-table">
    <thead>
      <tr><th style="width: 8%; text-align: center;">#</th><th style="width: 16%; text-align: center;">QTY</th><th style="width: 48%; text-align: left;">ITEM PARTICULARS</th><th style="width: 14%; text-align: right;">RATE</th><th style="width: 14%; text-align: right;">AMOUNT</th></tr>
    </thead>
    <tbody>
      {{itemsTableRows}}
      <tr class="docket-total-row">
        <td colspan="4" style="text-align: right;">TOTAL:</td>
        <td style="text-align: right; color: ${pColor};">₦{{total}}</td>
      </tr>
    </tbody>
  </table>
  <div style="font-size: 10px; font-weight: 700; color: #475569; margin-bottom: 10px;">Amount In Words: <span style="font-style: italic; color: #0f172a;">{{amountInWords}}</span></div>
  <div class="docket-footer">
    <div class="sig-block"><div class="sig-line"></div><div class="sig-caption">Storekeeper / Dispatcher</div></div>
    <div class="sig-block"><div class="sig-line"></div><div class="sig-caption">Customer / Goods Received In Good Condition</div></div>
  </div>
</div>
</body>
</html>`;
    }

    // Default: Commercial Trade Voucher (Global Refit Style)
    return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; color: #000; background: #fff; padding: 24px 28px; font-size: 13px; line-height: 1.35; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  .voucher-card { max-width: 800px; margin: 0 auto; background: #fff; position: relative; }
  .header-row { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 8px; gap: 16px; }
  .header-logo-col { display: flex; flex-direction: column; align-items: center; justify-content: center; width: 130px; flex-shrink: 0; }
  .logo-sub-text { font-size: 11px; font-weight: 800; color: #000; text-align: center; margin-top: 3px; line-height: 1.15; text-transform: capitalize; }
  .header-text-col { flex: 1; }
  .title-split-row { font-size: 32px; font-weight: 900; letter-spacing: -0.5px; line-height: 1.05; text-transform: uppercase; }
  .title-part1 { color: ${primaryColor}; }
  .title-part2 { color: ${accentColor}; }
  .title-suffix { font-size: 22px; font-weight: 900; color: ${primaryColor}; letter-spacing: 0.5px; text-transform: uppercase; margin-top: 2px; line-height: 1.1; }
  .tagline-text { font-size: 12px; font-weight: 700; color: #000; margin-top: 4px; line-height: 1.2; }
  .sub-strip { display: grid; grid-template-columns: 1fr auto 1fr; align-items: center; border-top: 2px solid ${primaryColor}; border-bottom: 2px solid ${primaryColor}; padding: 6px 0; margin: 10px 0 14px 0; gap: 12px; }
  .strip-left { text-align: left; }
  .strip-center { text-align: center; padding: 0 16px; }
  .strip-right { text-align: right; }
  .strip-red-label { color: ${accentColor}; font-weight: 800; font-size: 10px; text-transform: uppercase; letter-spacing: 0.5px; display: block; margin-bottom: 1px; }
  .strip-black-val { color: #000; font-weight: 700; font-size: 11px; line-height: 1.2; }
  .strip-title-badge { color: ${accentColor}; font-weight: 900; font-size: 26px; letter-spacing: 1px; line-height: 1; text-transform: uppercase; }
  .cust-grid { margin-bottom: 14px; }
  .cust-row { display: flex; align-items: baseline; gap: 16px; margin-bottom: 8px; }
  .cust-field-main { display: flex; align-items: baseline; gap: 6px; flex: 1; }
  .cust-field-side { display: flex; align-items: baseline; gap: 6px; width: 240px; flex-shrink: 0; }
  .cust-label { color: ${primaryColor}; font-weight: 800; font-size: 12px; text-transform: uppercase; flex-shrink: 0; }
  .cust-line { flex: 1; border-bottom: 2px solid ${primaryColor}; font-weight: 700; font-size: 12px; color: #000; padding-bottom: 2px; min-height: 18px; }
  .table-frame { position: relative; border: 2px solid ${primaryColor}; margin-bottom: 10px; }
  .table-watermark-wrap { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); pointer-events: none; opacity: 0.08; text-align: center; z-index: 0; width: 80%; }
  .watermark-logo-text { font-size: 120px; font-weight: 900; color: ${accentColor}; line-height: 1; letter-spacing: -2px; }
  .watermark-sub-text { font-size: 26px; font-weight: 900; color: ${accentColor}; letter-spacing: 6px; text-transform: uppercase; margin-top: -10px; }
  table.voucher-table { width: 100%; border-collapse: collapse; position: relative; z-index: 1; }
  table.voucher-table th { background: #ffffff; color: ${primaryColor}; font-weight: 900; font-size: 11px; text-transform: uppercase; padding: 8px 10px; border-right: 2px solid ${primaryColor}; border-bottom: 2px solid ${primaryColor}; letter-spacing: 0.5px; }
  table.voucher-table th:last-child { border-right: none; }
  table.voucher-table td { padding: 7px 10px; font-size: 12px; border-right: 2px solid ${primaryColor}; border-bottom: 1px solid ${primaryColor}; color: #000; }
  table.voucher-table td:last-child { border-right: none; }
  .total-row td { font-weight: 900; font-size: 13px; color: #000; border-top: 2px solid ${primaryColor}; border-bottom: none; padding: 8px 10px; }
  .footer-row { display: flex; align-items: flex-end; justify-content: space-between; gap: 20px; margin-top: 10px; }
  .words-container { flex: 1; display: flex; align-items: baseline; gap: 8px; }
  .words-label { color: ${primaryColor}; font-weight: 800; font-size: 12px; white-space: nowrap; flex-shrink: 0; }
  .words-line { flex: 1; border-bottom: 2px solid ${primaryColor}; font-style: italic; font-weight: 700; font-size: 12px; color: #000; padding-bottom: 2px; min-height: 18px; }
  .stamp-box-widget { width: 170px; flex-shrink: 0; }
  .stamp-box-header { background: ${primaryColor}; color: #fff; font-weight: 800; font-size: 10px; text-align: center; padding: 4px; text-transform: uppercase; letter-spacing: 0.5px; }
  .stamp-box-body { border: 2px solid ${primaryColor}; border-top: none; height: 52px; background: #fff; }
  .guarantee-note { font-size: 11px; font-weight: 900; color: ${accentColor}; text-transform: uppercase; letter-spacing: 0.5px; margin-top: 10px; }
  @media print { body { padding: 0; } .voucher-card { max-width: 100%; } }
</style>
</head>
<body>
<div class="voucher-card">
  <div class="header-row">
    <div class="header-logo-col">{{logo}}<div class="logo-sub-text">{{businessName}}</div></div>
    <div class="header-text-col">
      <div class="title-split-row"><span class="title-part1">${part1}</span> <span class="title-part2">${part2}</span></div>
      <div class="title-suffix">${suffix}</div>
      <div class="tagline-text">{{tagline}}</div>
    </div>
  </div>
  <div class="sub-strip">
    <div class="strip-left"><span class="strip-red-label">Office Address:</span><span class="strip-black-val">{{address}}</span></div>
    <div class="strip-center"><span class="strip-title-badge">${config.header?.titleText || 'INVOICE'}</span></div>
    <div class="strip-right"><span class="strip-red-label">Contact:</span><span class="strip-black-val">{{phone}}</span></div>
  </div>
  <div class="cust-grid">
    <div class="cust-row">
      <div class="cust-field-main"><span class="cust-label">Name:</span><span class="cust-line">{{customerName}}</span></div>
      <div class="cust-field-side"><span class="cust-label">Date:</span><span class="cust-line">{{date}}</span></div>
    </div>
    <div class="cust-row">
      <div class="cust-field-main"><span class="cust-label">Address:</span><span class="cust-line">{{customerAddress}}</span></div>
      <div class="cust-field-side"><span class="cust-label">Sign:</span><span class="cust-line">&nbsp;</span></div>
    </div>
  </div>
  <div class="table-frame">
    <div class="table-watermark-wrap">
      <div class="watermark-logo-text">${part1}</div>
      <div class="watermark-sub-text">${watermark}</div>
    </div>
    <table class="voucher-table">
      <thead>
        <tr>
          <th style="width: 8%; text-align: center;">S/N</th>
          <th style="width: 16%; text-align: center;">QTY</th>
          <th style="width: 46%; text-align: left;">DESCRIPTION</th>
          <th style="width: 15%; text-align: right;">RATE</th>
          <th style="width: 15%; text-align: right;">AMOUNT</th>
        </tr>
      </thead>
      <tbody>
        {{itemsTableRows}}
        <tr class="total-row">
          <td colspan="4" style="text-align: right;">TOTAL:</td>
          <td style="text-align: right;">₦{{total}}</td>
        </tr>
      </tbody>
    </table>
  </div>
  <div class="footer-row">
    <div class="words-container"><span class="words-label">Amount in words:</span><span class="words-line">{{amountInWords}}</span></div>
    <div class="stamp-box-widget">
      <div class="stamp-box-header">${stampTitle}</div>
      <div class="stamp-box-body"></div>
    </div>
  </div>
  <div class="guarantee-note">${guarantee}</div>
</div>
</body>
</html>`;
  };

  const handleSwitchArchetype = (newArchetype: 'trade-voucher' | 'lao-steel' | 'corporate' | 'commercial-docket') => {
    let pColor = aiConfig.theme.primaryColor;
    let aColor = aiConfig.theme.accentColor || '#dc2626';
    let tName = 'Custom Template';

    if (newArchetype === 'trade-voucher') {
      pColor = '#1a365d';
      aColor = '#dc2626';
      tName = 'Commercial Trade Voucher';
    } else if (newArchetype === 'lao-steel') {
      pColor = '#0f522b';
      aColor = '#16a34a';
      tName = 'Industrial Ledger Frame';
    } else if (newArchetype === 'corporate') {
      pColor = '#0f172a';
      aColor = '#3b82f6';
      tName = 'Corporate Executive Invoice';
    } else if (newArchetype === 'commercial-docket') {
      pColor = '#1e293b';
      aColor = '#d97706';
      tName = 'Warehouse Depot Docket';
    }

    const updated: CustomTemplateConfig = {
      ...aiConfig,
      archetype: newArchetype,
      templateName: tName,
      theme: {
        ...aiConfig.theme,
        primaryColor: pColor,
        accentColor: aColor,
      },
      table: {
        ...aiConfig.table,
        borderColor: pColor,
      },
    };

    updated.htmlTemplate = getMasterHtmlTemplate(newArchetype, updated);
    setAiConfig(updated);
    setViewMode('template');
  };

  const getInterpolatedHtml = (template: string) => {
    const logoHtml = hasRealLogo
      ? `<img src="${(logoUrl || logo) as string}" alt="${bizName}" style="max-height: 52px; max-width: 140px; object-fit: contain;" />`
      : `<div style="width: 48px; height: 48px; border-radius: 10px; background: ${aiConfig.theme.primaryColor || '#0052cc'}; color: #ffffff; display: inline-flex; align-items: center; justify-content: center; font-weight: 800; font-size: 18px; font-family: sans-serif; letter-spacing: -0.5px;">${businessInitials}</div>`;

    return template
      .replace(/\{\{businessName\}\}/g, bizName)
      .replace(/\{\{businessInitials\}\}/g, businessInitials)
      .replace(/\{\{tagline\}\}/g, tagline || 'Dealers in supply, repair and general services.')
      .replace(/\{\{address\}\}/g, address || '19 Oguntifa Street, Off Church Street, Alapere Ketu, Lagos')
      .replace(/\{\{phone\}\}/g, phone || '08028386659')
      .replace(/\{\{email\}\}/g, email || 'billing@acme-global.com')
      .replace(/\{\{invoiceNumber\}\}/g, `${prefix}-0000042`)
      .replace(/\{\{date\}\}/g, new Date().toLocaleDateString('en-GB'))
      .replace(/\{\{customerName\}\}/g, 'Alhaji Musa Dangote & Sons Ltd.')
      .replace(/\{\{customerPhone\}\}/g, '08023456789')
      .replace(/\{\{customerAddress\}\}/g, 'Plot 14, Commercial District, Ikeja, Lagos')
      .replace(/\{\{itemsTableRows\}\}/g, `
        <tr>
          <td style="text-align: center; border-right: 1px solid #0052cc; border-bottom: 1px solid #0052cc; padding: 8px;">1</td>
          <td style="text-align: center; border-right: 1px solid #0052cc; border-bottom: 1px solid #0052cc; padding: 8px;">120 PCS</td>
          <td style="text-align: left; font-weight: 600; border-right: 1px solid #0052cc; border-bottom: 1px solid #0052cc; padding: 8px;">12mm TMT Deformed Rebar (Length: 12m)</td>
          <td style="text-align: right; border-right: 1px solid #0052cc; border-bottom: 1px solid #0052cc; padding: 8px;">8,500.00</td>
          <td style="text-align: right; font-weight: 700; border-bottom: 1px solid #0052cc; padding: 8px;">1,020,000.00</td>
        </tr>
        <tr>
          <td style="text-align: center; border-right: 1px solid #0052cc; border-bottom: 1px solid #0052cc; padding: 8px;">2</td>
          <td style="text-align: center; border-right: 1px solid #0052cc; border-bottom: 1px solid #0052cc; padding: 8px;">80 PCS</td>
          <td style="text-align: left; font-weight: 600; border-right: 1px solid #0052cc; border-bottom: 1px solid #0052cc; padding: 8px;">16mm High-Yield High-Tensile Steel Rod</td>
          <td style="text-align: right; border-right: 1px solid #0052cc; border-bottom: 1px solid #0052cc; padding: 8px;">14,200.00</td>
          <td style="text-align: right; font-weight: 700; border-bottom: 1px solid #0052cc; padding: 8px;">1,136,000.00</td>
        </tr>
        <tr><td style="border-right: 1px solid #0052cc; border-bottom: 1px solid #0052cc; padding: 8px;">&nbsp;</td><td style="border-right: 1px solid #0052cc; border-bottom: 1px solid #0052cc; padding: 8px;">&nbsp;</td><td style="border-right: 1px solid #0052cc; border-bottom: 1px solid #0052cc; padding: 8px;">&nbsp;</td><td style="border-right: 1px solid #0052cc; border-bottom: 1px solid #0052cc; padding: 8px;">&nbsp;</td><td style="border-bottom: 1px solid #0052cc; padding: 8px;">&nbsp;</td></tr>
        <tr><td style="border-right: 1px solid #0052cc; border-bottom: 1px solid #0052cc; padding: 8px;">&nbsp;</td><td style="border-right: 1px solid #0052cc; border-bottom: 1px solid #0052cc; padding: 8px;">&nbsp;</td><td style="border-right: 1px solid #0052cc; border-bottom: 1px solid #0052cc; padding: 8px;">&nbsp;</td><td style="border-right: 1px solid #0052cc; border-bottom: 1px solid #0052cc; padding: 8px;">&nbsp;</td><td style="border-bottom: 1px solid #0052cc; padding: 8px;">&nbsp;</td></tr>
        <tr><td style="border-right: 1px solid #0052cc; border-bottom: 1px solid #0052cc; padding: 8px;">&nbsp;</td><td style="border-right: 1px solid #0052cc; border-bottom: 1px solid #0052cc; padding: 8px;">&nbsp;</td><td style="border-right: 1px solid #0052cc; border-bottom: 1px solid #0052cc; padding: 8px;">&nbsp;</td><td style="border-right: 1px solid #0052cc; border-bottom: 1px solid #0052cc; padding: 8px;">&nbsp;</td><td style="border-bottom: 1px solid #0052cc; padding: 8px;">&nbsp;</td></tr>
        <tr><td style="border-right: 1px solid #0052cc; border-bottom: 1px solid #0052cc; padding: 8px;">&nbsp;</td><td style="border-right: 1px solid #0052cc; border-bottom: 1px solid #0052cc; padding: 8px;">&nbsp;</td><td style="border-right: 1px solid #0052cc; border-bottom: 1px solid #0052cc; padding: 8px;">&nbsp;</td><td style="border-right: 1px solid #0052cc; border-bottom: 1px solid #0052cc; padding: 8px;">&nbsp;</td><td style="border-bottom: 1px solid #0052cc; padding: 8px;">&nbsp;</td></tr>
      `)
      .replace(/\{\{logo\}\}/g, logoHtml)
      .replace(/\{\{logoImgOrAvatar\}\}/g, logoHtml)
      .replace(/\{\{total\}\}/g, '2,156,000.00')
      .replace(/\{\{grandTotal\}\}/g, '2,156,000.00')
      .replace(/\{\{amountInWords\}\}/g, 'Two Million, One Hundred and Fifty-Six Thousand Naira Only.')
      .replace(/\{\{guaranteeText\}\}/g, aiConfig.footer?.guaranteeText || 'GOODS SOLD OUT ARE NOT RETURNABLE');
  };

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
    'Global Refit Trade Voucher with Red & Blue Header',
    '3-Column Sub-strip with Office Address & Contact',
    'Parallel Underlined Customer Grid',
    '5-Column Table with Centered Faint Watermark',
    'Office Signature Stamp Box & Return Terms',
    'Lao Steel Industrial Green Ledger Style',
  ];

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className={`w-[98vw] ${isSuperAdmin ? 'max-w-[98vw] sm:max-w-2xl md:max-w-5xl lg:max-w-6xl xl:max-w-7xl' : 'max-w-4xl'} h-[94vh] max-h-[94vh] flex flex-col p-0 rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl overflow-hidden focus:outline-none`}>
        {/* Modal Top Header */}
        <div className="shrink-0 p-3 sm:p-4 border-b border-slate-800 bg-slate-950/90 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 z-10">
          <div className="flex items-center space-x-3 pr-8 sm:pr-0">
            <div className="p-2 sm:p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shrink-0">
              <Printer className="h-4 w-4 sm:h-5 sm:w-5" />
            </div>
            <div>
              <DialogTitle className="text-sm sm:text-base font-bold text-white flex items-center space-x-2 font-heading">
                <span>{isSuperAdmin ? 'Invoice & Receipt Template Studio' : 'Printable Invoice Template Preview'}</span>
              </DialogTitle>
              <DialogDescription className="text-[11px] sm:text-xs text-slate-400 mt-0.5 line-clamp-1 sm:line-clamp-none">
                {isSuperAdmin
                  ? 'Interactive design studio with AI Copilot to refine layout, colors, and terms.'
                  : 'Official visual layout used for your printable PDF receipts and customer invoices.'}
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
            {isSuperAdmin && (
              <div className="w-full max-w-[800px] flex flex-col sm:flex-row items-center justify-between pb-3 text-xs mb-2 gap-2">
                {/* 1-Click Master Archetype Switcher */}
                <div className="flex items-center space-x-1 bg-slate-900 border border-slate-800 p-1 rounded-xl overflow-x-auto max-w-full">
                  <button
                    type="button"
                    onClick={() => handleSwitchArchetype('trade-voucher')}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold cursor-pointer transition-all whitespace-nowrap ${
                      aiConfig.archetype === 'trade-voucher' || (!aiConfig.archetype && !isLaoSteel)
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800'
                    }`}
                  >
                    🛒 Commercial Voucher
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSwitchArchetype('lao-steel')}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold cursor-pointer transition-all whitespace-nowrap ${
                      aiConfig.archetype === 'lao-steel' || (!aiConfig.archetype && isLaoSteel)
                        ? 'bg-emerald-600 text-white shadow-sm'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800'
                    }`}
                  >
                    🏗️ Industrial Ledger
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSwitchArchetype('corporate')}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold cursor-pointer transition-all whitespace-nowrap ${
                      aiConfig.archetype === 'corporate'
                        ? 'bg-indigo-600 text-white shadow-sm'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800'
                    }`}
                  >
                    🏢 Corporate Exec
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSwitchArchetype('commercial-docket')}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold cursor-pointer transition-all whitespace-nowrap ${
                      aiConfig.archetype === 'commercial-docket'
                        ? 'bg-amber-600 text-white shadow-sm'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800'
                    }`}
                  >
                    📦 Depot Docket
                  </button>
                </div>

                {/* View Modes */}
                <div className="flex items-center space-x-1 bg-slate-900 border border-slate-800 p-1 rounded-xl shrink-0">
                  <button
                    type="button"
                    onClick={() => setViewMode('template')}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all cursor-pointer flex items-center space-x-1 ${
                      viewMode === 'template'
                        ? 'bg-emerald-600 text-white shadow-sm'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <FileText className="h-3 w-3" />
                    <span>Template</span>
                  </button>
                  {aiConfig.rawImagePreviewUrl && (
                    <button
                      type="button"
                      onClick={() => setViewMode('reference')}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all cursor-pointer flex items-center space-x-1 ${
                        viewMode === 'reference'
                          ? 'bg-purple-600 text-white shadow-sm'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      <ImageIcon className="h-3 w-3" />
                      <span>Original</span>
                    </button>
                  )}
                  {aiConfig.layoutDescription && (
                    <button
                      type="button"
                      onClick={() => setViewMode('blueprint')}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all cursor-pointer flex items-center space-x-1 ${
                        viewMode === 'blueprint'
                          ? 'bg-blue-600 text-white shadow-sm'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      <Sparkles className="h-3 w-3" />
                      <span>AI Blueprint</span>
                    </button>
                  )}
                  {aiConfig.htmlTemplate && (
                    <button
                      type="button"
                      onClick={() => setViewMode('code')}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all cursor-pointer flex items-center space-x-1 ${
                        viewMode === 'code'
                          ? 'bg-amber-600 text-white shadow-sm'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      <Code className="h-3 w-3" />
                      <span>HTML</span>
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Dynamic Template View */}
            {viewMode === 'template' && (
              aiConfig.htmlTemplate ? (
                <div className="w-full max-w-[800px] bg-white rounded-xl shadow-2xl overflow-hidden border border-slate-700 transition-all duration-300">
                  <iframe
                    srcDoc={getInterpolatedHtml(aiConfig.htmlTemplate)}
                    title="Bespoke Custom Invoice Template"
                    className="w-full h-[780px] border-0 bg-white"
                    sandbox="allow-same-origin allow-scripts"
                  />
                </div>
              ) : (
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
                    <div className="grid grid-cols-1 sm:grid-cols-3 items-center gap-2 pt-2 pb-2 text-xs">
                      <div className="text-left">
                        <span className="text-[10px] font-bold text-red-600 uppercase block tracking-wider">
                          Office Address:
                        </span>
                        <span className="text-xs font-bold text-slate-800 leading-tight block">
                          {address || '19 Oguntifa Street, Off Church Street, Alapere Ketu, Lagos'}
                        </span>
                      </div>

                      <div className="text-center sm:border-l sm:border-r border-slate-300 py-1">
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

                      <div className="text-left sm:text-right">
                        <span className="text-[10px] font-bold text-red-600 uppercase block tracking-wider">
                          Contact:
                        </span>
                        <span className="text-xs font-mono font-bold text-slate-900 block">
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
                      <div className="flex flex-col sm:flex-row items-baseline gap-3">
                        <div className="flex-1 flex items-baseline gap-2">
                          <span
                            className="font-bold shrink-0 uppercase tracking-tight text-xs"
                            style={{ color: aiConfig.theme.primaryColor || '#0052cc' }}
                          >
                            {aiConfig.customer?.nameLabel || 'Name:'}
                          </span>
                          <span
                            className="flex-1 border-b-2 pb-0.5 font-bold font-sans text-slate-900 text-xs"
                            style={{ borderColor: aiConfig.table.borderColor || '#0052cc' }}
                          >
                            Alhaji Musa Dangote &amp; Sons Ltd.
                          </span>
                        </div>
                        <div className="w-full sm:w-60 flex items-baseline gap-2">
                          <span
                            className="font-bold shrink-0 uppercase tracking-tight text-xs"
                            style={{ color: aiConfig.theme.primaryColor || '#0052cc' }}
                          >
                            Date:
                          </span>
                          <span
                            className="flex-1 border-b-2 pb-0.5 font-mono text-slate-900 text-xs font-bold"
                            style={{ borderColor: aiConfig.table.borderColor || '#0052cc' }}
                          >
                            {new Date().toLocaleDateString('en-GB')}
                          </span>
                        </div>
                      </div>

                      {/* Row 2: Address and Sign */}
                      <div className="flex flex-col sm:flex-row items-baseline gap-3">
                        <div className="flex-1 flex items-baseline gap-2">
                          <span
                            className="font-bold shrink-0 uppercase tracking-tight text-xs"
                            style={{ color: aiConfig.theme.primaryColor || '#0052cc' }}
                          >
                            {aiConfig.customer?.addressLabel || 'Address:'}
                          </span>
                          <span
                            className="flex-1 border-b-2 pb-0.5 font-sans text-slate-700 text-xs"
                            style={{ borderColor: aiConfig.table.borderColor || '#0052cc' }}
                          >
                            Plot 14, Commercial District, Ikeja, Lagos
                          </span>
                        </div>
                        <div className="w-full sm:w-60 flex items-baseline gap-2">
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
                                  className={`p-2.5 text-xs ${
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
                            <tr key={`empty_${eIdx}`} className="h-7" style={{ backgroundColor: '#ffffff' }}>
                              {activeColumns.map((col, cIdx) => (
                                <td
                                  key={`empty_col_${cIdx}`}
                                  className={`p-2.5 ${cIdx < activeColumns.length - 1 ? 'border-r' : ''}`}
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
                                className="p-2.5 text-center sm:text-right font-black uppercase tracking-wider text-xs"
                                style={{ color: aiConfig.theme.primaryColor || '#0052cc' }}
                              >
                                {aiConfig.summary.totalLabel || 'TOTAL'} (₦):
                              </td>
                              <td
                                className="p-2.5 text-right font-black text-sm font-mono border-l-2"
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
                    <div className="flex flex-col sm:flex-row items-end justify-between gap-4">
                      <div className="flex-1 w-full sm:w-auto flex items-baseline gap-2">
                        <span
                          className="font-bold text-xs shrink-0"
                          style={{ color: aiConfig.theme.primaryColor || '#0052cc' }}
                        >
                          Amount in words:
                        </span>
                        <span
                          className="flex-1 border-b-2 pb-0.5 italic font-serif text-xs text-slate-800"
                          style={{ borderColor: aiConfig.table.borderColor || '#0052cc' }}
                        >
                          Two Million, One Hundred and Fifty-Six Thousand Naira Only.
                        </span>
                      </div>

                      <div
                        className="border-2 w-48 h-16 p-2 flex flex-col justify-between shrink-0 bg-white shadow-sm"
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
              )
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

            {/* HTML Code View Mode */}
            {viewMode === 'code' && (
              <div className="w-full max-w-[800px] h-[780px] bg-slate-900 rounded-xl p-4 font-mono text-xs text-emerald-400 overflow-auto border border-slate-800">
                <div className="flex justify-between items-center mb-3 pb-2 border-b border-slate-800">
                  <span className="text-slate-300 font-bold">Unconstrained HTML &amp; CSS Code</span>
                  <button
                    type="button"
                    onClick={() => {
                      if (aiConfig.htmlTemplate) {
                        navigator.clipboard.writeText(aiConfig.htmlTemplate);
                      }
                    }}
                    className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs flex items-center space-x-1 cursor-pointer"
                  >
                    <Copy className="h-3 w-3 mr-1" />
                    <span>Copy Code</span>
                  </button>
                </div>
                <pre className="whitespace-pre-wrap">{aiConfig.htmlTemplate}</pre>
              </div>
            )}
          </div>

          {/* RIGHT: AI Copilot Chat Studio (Super Admin Only) */}
          {isSuperAdmin && (
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

            {isSuperAdmin && onSelectTemplate && (
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
