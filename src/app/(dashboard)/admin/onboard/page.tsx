'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Building2,
  Globe,
  Server,
  Users,
  ShieldCheck,
  ArrowLeft,
  Sparkles,
  Loader2,
  CheckCircle2,
  Sliders,
  DollarSign,
  Lock,
  Mail,
  Phone,
  MapPin,
  Tag,
  Key,
  Eye,
  EyeOff,
  Layers,
  Code,
  Laptop,
  Printer,
  Upload,
  Image as ImageIcon,
  FileText,
  AlertTriangle,
} from 'lucide-react';
import { Button } from '../../../../components/ui/button';
import { Input } from '../../../../components/ui/input';
import { Label } from '../../../../components/ui/label';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../../../components/ui/card';
import { Badge } from '../../../../components/ui/badge';
import { useOnboardTenant } from '../../../../features/admin/hooks/useTenants';
import { useModal } from '../../../../components/ui/modal-provider';
import { PlanType, BillingMode } from '../../../../types/api';
import { InvoiceTemplatePreviewModal } from '../../../../components/templates/InvoiceTemplatePreviewModal';

export const RESERVED_SLUGS = [
  'zentra', 'invoice', 'bolxolve', 'admin', 'superadmin', 'api', 'app',
  'auth', 'login', 'signup', 'register', 'billing', 'support', 'help',
  'docs', 'status', 'mail', 'email', 'root', 'security', 'payments',
  'portal', 'dashboard', 'cdn', 'assets', 'static'
];

export default function OnboardBusinessPage() {
  const router = useRouter();
  const modal = useModal();
  const onboardMutation = useOnboardTenant();

  // Form State
  const [businessName, setBusinessName] = useState('');
  const [slug, setSlug] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [receiptPrefix, setReceiptPrefix] = useState('INV');
  const [tagline, setTagline] = useState('');

  // Invoice Template State (Classic, Modern, or Custom Upload - Optional)
  const [receiptTemplateId, setReceiptTemplateId] = useState<'classic' | 'modern' | 'custom'>('classic');
  const [customTemplateUrl, setCustomTemplateUrl] = useState<string>('');
  const [customFileName, setCustomFileName] = useState<string>('');
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewingTemplate, setPreviewingTemplate] = useState<'classic' | 'modern' | 'custom'>('classic');
  const fileInputRef = React.useRef<HTMLInputElement | null>(null);

  const handleCustomTemplateUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      modal.alert('File Too Large', 'Please upload a template image smaller than 5MB.', 'warning');
      return;
    }

    setCustomFileName(file.name);
    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      setCustomTemplateUrl(base64);
      setReceiptTemplateId('custom');
    };
    reader.readAsDataURL(file);
  };

  // Domains State (Live custom domain / Bolxolve subdomain, Dev domain businessname.localhost)
  const [customDomain, setCustomDomain] = useState('');
  const [devDomain, setDevDomain] = useState('');
  const [enterpriseDomainChoice, setEnterpriseDomainChoice] = useState<'subdomain' | 'custom'>('subdomain');

  // Subscription Plan & Features
  const [plan, setPlan] = useState<PlanType>('BUSINESS');
  const [billingMode, setBillingMode] = useState<BillingMode>('SUBSCRIPTION');
  const [maxStaffCount, setMaxStaffCount] = useState<number>(4);
  const [hasCustomDomain, setHasCustomDomain] = useState<boolean>(false);
  const [hasMultipleBranches, setHasMultipleBranches] = useState<boolean>(false);
  const [hasAdvancedReports, setHasAdvancedReports] = useState<boolean>(true);

  // Primary Administrator State
  const [adminFirstName, setAdminFirstName] = useState('');
  const [adminLastName, setAdminLastName] = useState('');
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Status & Validation
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Slug generator helper
  const handleBusinessNameChange = (name: string) => {
    setBusinessName(name);
    const generatedSlug = name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
    setSlug(generatedSlug);

    // Auto-suggest Live & Dev domains
    if (generatedSlug) {
      if (plan === 'ENTERPRISE') {
        if (enterpriseDomainChoice === 'subdomain') {
          setCustomDomain(`${generatedSlug}.bolxolve.com`);
        } else if (!customDomain || customDomain.endsWith('.bolxolve.com')) {
          setCustomDomain(`invoice.${generatedSlug}.com`);
        }
      }
      setDevDomain(`${generatedSlug}.localhost`);
      if (receiptPrefix === 'INV' || receiptPrefix === slug.slice(0, 3).toUpperCase()) {
        const prefix = generatedSlug.replace(/[^a-z]/g, '').slice(0, 3).toUpperCase() || 'INV';
        setReceiptPrefix(prefix);
      }
    }
  };

  const handlePlanChange = (selectedPlan: PlanType) => {
    setPlan(selectedPlan);
    if (selectedPlan === 'STARTER') {
      setMaxStaffCount(2);
      setHasCustomDomain(false);
      setHasMultipleBranches(false);
      setHasAdvancedReports(false);
      setCustomDomain('');
    } else if (selectedPlan === 'BUSINESS') {
      setMaxStaffCount(4);
      setHasCustomDomain(false);
      setHasMultipleBranches(false);
      setHasAdvancedReports(true);
      setCustomDomain('');
    } else if (selectedPlan === 'ENTERPRISE') {
      setMaxStaffCount(10);
      setHasCustomDomain(true);
      setHasMultipleBranches(true);
      setHasAdvancedReports(true);
      if (enterpriseDomainChoice === 'subdomain') {
        setCustomDomain(slug ? `${slug}.bolxolve.com` : '');
      } else {
        setCustomDomain(slug ? `invoice.${slug}.com` : '');
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const cleanSlug = slug.trim().toLowerCase();
    if (RESERVED_SLUGS.includes(cleanSlug)) {
      setErrorMessage(`The slug "${cleanSlug}" is reserved by the BOLXolve platform (e.g. Zentra ticketing or system services) and cannot be assigned to a tenant.`);
      return;
    }

    const isEnterpriseCustomDomain = plan === 'ENTERPRISE' && hasCustomDomain;
    let cleanLiveDomain = isEnterpriseCustomDomain
      ? customDomain.trim().toLowerCase().replace(/^https?:\/\//, '').split('/')[0]
      : '';

    if (isEnterpriseCustomDomain && !cleanLiveDomain) {
      cleanLiveDomain = enterpriseDomainChoice === 'subdomain' ? `${cleanSlug}.bolxolve.com` : '';
    }

    if (cleanLiveDomain && cleanLiveDomain.endsWith('.bolxolve.com')) {
      const sub = cleanLiveDomain.replace('.bolxolve.com', '');
      if (RESERVED_SLUGS.includes(sub)) {
        setErrorMessage(`The subdomain "${sub}" on bolxolve.com is reserved and cannot be assigned.`);
        return;
      }
    }

    const cleanDevDomain = devDomain.trim().toLowerCase().replace(/^https?:\/\//, '').split('/')[0] || `${cleanSlug}.localhost`;

    if (isEnterpriseCustomDomain && (!cleanLiveDomain || cleanLiveDomain.length < 3)) {
      setErrorMessage('Please provide a live domain (e.g. yourname.bolxolve.com or invoice.company.com) for Enterprise tier.');
      return;
    }

    if (!adminPassword || adminPassword.length < 6) {
      setErrorMessage('Administrator password must be at least 6 characters.');
      return;
    }

    try {
      const res = await onboardMutation.mutateAsync({
        businessName: businessName.trim(),
        slug: cleanSlug,
        address: address.trim(),
        phone: phone.trim(),
        email: email.trim(),
        receiptPrefix: receiptPrefix.trim().toUpperCase(),
        receiptTemplateId,
        customTemplateUrl: customTemplateUrl || null,
        tagline: tagline.trim() || null,
        plan,
        billingMode,
        maxStaffCount,
        hasCustomDomain: isEnterpriseCustomDomain,
        hasMultipleBranches: plan === 'ENTERPRISE' && hasMultipleBranches,
        hasAdvancedReports,
        customDomain: isEnterpriseCustomDomain ? cleanLiveDomain : '',
        devDomain: cleanDevDomain,
        adminFirstName: adminFirstName.trim(),
        adminLastName: adminLastName.trim(),
        adminEmail: adminEmail.trim().toLowerCase(),
        adminPassword,
      });

      await modal.alert(
        'Business Workspace Onboarded',
        isEnterpriseCustomDomain && cleanLiveDomain
          ? `Successfully provisioned ${businessName}! Dedicated domain registered at ${cleanLiveDomain} and local endpoint at ${cleanDevDomain}.`
          : `Successfully provisioned ${businessName}! Assigned to central portal invoice.bolxolve.com (Development endpoint: ${cleanDevDomain}).`
      );

      router.push(`/admin/tenants/${res.business.id}`);
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Failed to onboard business workspace.';
      setErrorMessage(msg);
    }
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-16">
      {/* Top Header & Breadcrumbs */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-border/60">
        <div className="flex items-center space-x-3.5">
          <Link href="/admin/tenants">
            <Button variant="outline" size="icon" className="h-10 w-10 rounded-2xl shadow-sm hover:bg-secondary">
              <ArrowLeft className="h-4 w-4 text-foreground" />
            </Button>
          </Link>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-500">Super Admin Portal</span>
              <span className="text-muted-foreground/40 text-xs">â€¢</span>
              <span className="text-xs text-muted-foreground">Tenant Provisioning</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold font-heading text-foreground tracking-tight">
              Onboard New Business Workspace
            </h1>
          </div>
        </div>
        <Link href="/admin/tenants">
          <Button variant="outline" size="sm" className="rounded-xl text-xs font-semibold h-10 px-4">
            View All Tenants
          </Button>
        </Link>
      </div>

      {errorMessage && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/25 text-rose-500 text-sm font-medium flex items-center justify-between">
          <span>{errorMessage}</span>
          <button onClick={() => setErrorMessage(null)} className="text-xs underline font-bold">Dismiss</button>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* ========================================================= */}
        {/* SECTION 1: SUBSCRIPTION TIER & QUOTAS                     */}
        {/* ========================================================= */}
        <Card className="rounded-3xl border-border bg-card shadow-sm overflow-hidden">
          <CardHeader className="bg-secondary/20 border-b border-border/80 p-6 sm:p-8">
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 flex items-center justify-center font-bold shadow-inner">
                <Sliders className="h-5 w-5" />
              </div>
              <div>
                <CardTitle className="text-lg sm:text-xl font-bold font-heading text-foreground">
                  Subscription Tier & Quotas
                </CardTitle>
                <CardDescription className="text-xs text-muted-foreground">
                  Select customer subscription plan, billing mode, cashier quotas, and modular features.
                </CardDescription>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-6 sm:p-8 space-y-6">
            {/* Tiers */}
            <div className="space-y-2.5">
              <Label className="text-xs font-bold text-foreground">Subscription Tier Package</Label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                {[
                  { id: 'STARTER' as PlanType, name: 'STARTER', staff: '2 Staff Desks', desc: 'Standard invoicing, basic reporting' },
                  { id: 'BUSINESS' as PlanType, name: 'BUSINESS', staff: '4 Staff Desks', desc: 'Includes AI Scanner & Analytics' },
                  { id: 'ENTERPRISE' as PlanType, name: 'ENTERPRISE', staff: 'Custom Quota', desc: 'Multi-branch & full modular suite' },
                ].map((tier) => {
                  const isSelected = plan === tier.id;
                  return (
                    <button
                      key={tier.id}
                      type="button"
                      onClick={() => handlePlanChange(tier.id)}
                      className={`p-4 rounded-2xl border text-left transition-all relative cursor-pointer ${
                        isSelected
                          ? 'border-emerald-500 bg-emerald-500/10 ring-2 ring-emerald-500/20 shadow-md shadow-emerald-500/10'
                          : 'border-border bg-secondary/30 text-muted-foreground hover:bg-secondary/60'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className={`text-sm font-bold tracking-wide ${isSelected ? 'text-emerald-500 font-heading' : 'text-foreground font-heading'}`}>
                          {tier.name}
                        </span>
                        {isSelected && <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />}
                      </div>
                      <p className="text-xs font-semibold text-foreground/80 mb-1">{tier.staff}</p>
                      <p className="text-[11px] text-muted-foreground leading-snug">{tier.desc}</p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Billing Mode & Staff Quota */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="space-y-2">
                <Label className="text-xs font-bold text-foreground">Commercial Billing Mode</Label>
                <div className="grid grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={() => setBillingMode('SUBSCRIPTION')}
                    className={`p-3.5 rounded-2xl border text-left text-xs font-semibold transition-all cursor-pointer ${
                      billingMode === 'SUBSCRIPTION'
                        ? 'border-emerald-500 bg-emerald-500/10 text-emerald-500 ring-2 ring-emerald-500/20'
                        : 'border-border bg-secondary/30 text-muted-foreground hover:bg-secondary/60'
                    }`}
                  >
                    Paid SaaS
                  </button>
                  <button
                    type="button"
                    onClick={() => setBillingMode('COMPLIMENTARY')}
                    className={`p-3.5 rounded-2xl border text-left text-xs font-semibold transition-all cursor-pointer ${
                      billingMode === 'COMPLIMENTARY'
                        ? 'border-amber-500 bg-amber-500/10 text-amber-500 ring-2 ring-amber-500/20'
                        : 'border-border bg-secondary/30 text-muted-foreground hover:bg-secondary/60'
                    }`}
                  >
                    Complimentary
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-bold text-foreground">Staff / Cashier Quota Seats</Label>
                <Input
                  type="number"
                  min={1}
                  max={100}
                  value={maxStaffCount}
                  onChange={(e) => setMaxStaffCount(parseInt(e.target.value) || 2)}
                  className="h-11 rounded-xl text-sm font-mono px-4 bg-background border-border"
                />
              </div>
            </div>

            {/* Modular Features */}
            {plan !== 'STARTER' && (
              <div className="space-y-3 pt-4 border-t border-border/70">
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-bold text-foreground">Modular Feature Toggles</Label>
                  <span className="text-[11px] text-muted-foreground font-medium">
                    {plan === 'BUSINESS' ? 'Business Tier Modular Add-ons' : 'Enterprise Modular Suite'}
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {/* Custom Domains - Enterprise Only */}
                  {plan === 'ENTERPRISE' && (
                    <label className="flex items-center justify-between p-3.5 rounded-2xl border border-border bg-secondary/30 hover:bg-secondary/50 cursor-pointer transition-colors">
                      <div className="pr-2">
                        <span className="text-xs font-semibold text-foreground block">Custom Domains</span>
                        <span className="text-[10px] text-muted-foreground">Dedicated or client DNS</span>
                      </div>
                      <input
                        type="checkbox"
                        checked={hasCustomDomain}
                        onChange={(e) => {
                          const checked = e.target.checked;
                          setHasCustomDomain(checked);
                          if (checked) {
                            if (enterpriseDomainChoice === 'subdomain') {
                              setCustomDomain(slug ? `${slug}.bolxolve.com` : '');
                            } else {
                              setCustomDomain(slug ? `invoice.${slug}.com` : '');
                            }
                          } else {
                            setCustomDomain('');
                          }
                        }}
                        className="h-4 w-4 rounded text-emerald-500 focus:ring-emerald-500 accent-emerald-600"
                      />
                    </label>
                  )}

                  {/* Multi-Branches - Enterprise Only */}
                  {plan === 'ENTERPRISE' && (
                    <label className="flex items-center justify-between p-3.5 rounded-2xl border border-border bg-secondary/30 hover:bg-secondary/50 cursor-pointer transition-colors">
                      <div className="pr-2">
                        <span className="text-xs font-semibold text-foreground block">Multi-Branches</span>
                        <span className="text-[10px] text-muted-foreground">Multiple store depots</span>
                      </div>
                      <input
                        type="checkbox"
                        checked={hasMultipleBranches}
                        onChange={(e) => setHasMultipleBranches(e.target.checked)}
                        className="h-4 w-4 rounded text-emerald-500 focus:ring-emerald-500 accent-emerald-600"
                      />
                    </label>
                  )}

                  {/* AI Reports & Scanner - Business & Enterprise (Default ON) */}
                  <label className="flex items-center justify-between p-3.5 rounded-2xl border border-border bg-secondary/30 hover:bg-secondary/50 cursor-pointer transition-colors">
                    <div className="pr-2">
                      <span className="text-xs font-semibold text-foreground block">AI Reports & Scanner</span>
                      <span className="text-[10px] text-muted-foreground">Default from Business</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={hasAdvancedReports}
                      onChange={(e) => setHasAdvancedReports(e.target.checked)}
                      className="h-4 w-4 rounded text-emerald-500 focus:ring-emerald-500 accent-emerald-600"
                    />
                  </label>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* ========================================================= */}
        {/* SECTION 2: WORKSPACE IDENTITY & PROFILE                   */}
        {/* ========================================================= */}
        <Card className="rounded-3xl border-border bg-card shadow-sm overflow-hidden">
          <CardHeader className="bg-secondary/20 border-b border-border/80 p-6 sm:p-8">
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 flex items-center justify-center font-bold shadow-inner">
                <Building2 className="h-5 w-5" />
              </div>
              <div>
                <CardTitle className="text-lg sm:text-xl font-bold font-heading text-foreground">
                  Workspace Identity & Profile
                </CardTitle>
                <CardDescription className="text-xs text-muted-foreground">
                  Official commercial name, depot address, phone number, and unique subdomain slug.
                </CardDescription>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-6 sm:p-8 space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-foreground">Business Workspace Name *</Label>
                <Input
                  value={businessName}
                  onChange={(e) => handleBusinessNameChange(e.target.value)}
                  placeholder="e.g. Lao Steel Ventures"
                  required
                  className="h-11 rounded-xl text-sm px-4 bg-background border-border"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-foreground">Workspace Routing Slug *</Label>
                <Input
                  value={slug}
                  onChange={(e) => {
                    const s = e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '');
                    setSlug(s);
                    setDevDomain(`${s}.localhost`);
                  }}
                  placeholder="e.g. lao-steel"
                  required
                  className={`h-11 rounded-xl text-sm font-mono px-4 bg-background ${
                    slug && RESERVED_SLUGS.includes(slug) ? 'border-rose-500 ring-1 ring-rose-500' : 'border-border'
                  }`}
                />
                {slug && RESERVED_SLUGS.includes(slug) && (
                  <p className="text-[11px] font-semibold text-rose-500 mt-1 flex items-center gap-1">
                    <AlertTriangle className="h-3 w-3 shrink-0" />
                    The slug &quot;{slug}&quot; is reserved by the platform (e.g. Zentra ticketing or system services) and cannot be claimed.
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-foreground">Physical Depot / Head Office Address *</Label>
              <Input
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="e.g. Shop 249, Ifesowapo Iron Mkt., Section C, Orile, Lagos"
                required
                className="h-11 rounded-xl text-sm px-4 bg-background border-border"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-foreground">Official Phone Number *</Label>
                <Input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="e.g. +234 803 407 1931"
                  required
                  className="h-11 rounded-xl text-sm px-4 bg-background border-border"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-foreground">Official Business Email *</Label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. billing@laosteel.com"
                  required
                  className="h-11 rounded-xl text-sm px-4 bg-background border-border"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-2 border-t border-border/70">
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-foreground">Receipt Numbering Prefix</Label>
                <Input
                  value={receiptPrefix}
                  onChange={(e) => setReceiptPrefix(e.target.value.toUpperCase())}
                  placeholder="e.g. LSV"
                  className="h-11 rounded-xl text-sm font-mono uppercase px-4 bg-background border-border"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-foreground">Motto / Tagline</Label>
                <Input
                  value={tagline}
                  onChange={(e) => setTagline(e.target.value)}
                  placeholder="e.g. Premium Iron, Steel & Building Materials"
                  className="h-11 rounded-xl text-sm px-4 bg-background border-border"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ========================================================= */}
        {/* SECTION 3: DUAL DOMAIN ARCHITECTURE (ENTERPRISE ONLY)     */}
        {/* ========================================================= */}
        {plan === 'ENTERPRISE' && hasCustomDomain && (
          <Card className="rounded-3xl border-border bg-card shadow-sm overflow-hidden animate-in fade-in duration-200">
            <CardHeader className="bg-secondary/20 border-b border-border/80 p-6 sm:p-8">
              <div className="flex items-center space-x-3">
                <div className="h-10 w-10 rounded-2xl bg-purple-500/10 border border-purple-500/20 text-purple-500 flex items-center justify-center font-bold shadow-inner">
                  <Globe className="h-5 w-5" />
                </div>
                <div>
                  <CardTitle className="text-lg sm:text-xl font-bold font-heading text-foreground">
                    Enterprise Domain Architecture (Live & Localhost)
                  </CardTitle>
                  <CardDescription className="text-xs text-muted-foreground">
                    Configure dedicated platform subdomain or customer custom domain routing for this enterprise tenant.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-6 sm:p-8 space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {/* Live Domain Configuration */}
                <div className="space-y-3 p-5 rounded-2xl border border-purple-500/30 bg-purple-500/10">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs font-bold text-foreground flex items-center space-x-2">
                      <Sparkles className="h-4 w-4 text-purple-400" />
                      <span>Enterprise Live Domain Setup</span>
                    </Label>
                    <Badge className="text-[10px] bg-purple-500/20 text-purple-300 border border-purple-500/30">
                      Enterprise Tier
                    </Badge>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                    <button
                      type="button"
                      onClick={() => {
                        setEnterpriseDomainChoice('subdomain');
                        setCustomDomain(slug ? `${slug}.bolxolve.com` : '');
                      }}
                      className={`p-3 rounded-xl border text-left text-xs transition-all cursor-pointer ${
                        enterpriseDomainChoice === 'subdomain'
                          ? 'border-purple-500 bg-purple-500/20 text-white font-bold ring-1 ring-purple-500/50 shadow-sm'
                          : 'border-border bg-background/50 text-muted-foreground hover:bg-secondary'
                      }`}
                    >
                      <p className="font-semibold text-foreground">Option 1: Bolxolve Subdomain</p>
                      <p className="text-[11px] text-purple-300 font-mono mt-0.5">{slug || 'workspace'}.bolxolve.com</p>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setEnterpriseDomainChoice('custom');
                        setCustomDomain(slug ? `invoice.${slug}.com` : '');
                      }}
                      className={`p-3 rounded-xl border text-left text-xs transition-all cursor-pointer ${
                        enterpriseDomainChoice === 'custom'
                          ? 'border-purple-500 bg-purple-500/20 text-white font-bold ring-1 ring-purple-500/50 shadow-sm'
                          : 'border-border bg-background/50 text-muted-foreground hover:bg-secondary'
                      }`}
                    >
                      <p className="font-semibold text-foreground">Option 2: Client Custom Domain</p>
                      <p className="text-[11px] text-purple-300 font-mono mt-0.5">invoice.clientdomain.com</p>
                    </button>
                  </div>

                  {enterpriseDomainChoice === 'subdomain' ? (
                    <div className="space-y-1.5 pt-1">
                      <Label className="text-[11px] font-semibold text-muted-foreground">Assigned Platform Subdomain *</Label>
                      <Input
                        value={customDomain}
                        onChange={(e) => setCustomDomain(e.target.value)}
                        placeholder="e.g. laosteel.bolxolve.com"
                        required
                        className="h-10 rounded-xl text-xs font-mono px-3 bg-background border-border"
                      />
                      <p className="text-[11px] text-muted-foreground leading-relaxed">
                        Dedicated subdomain managed directly on the BOLXolve platform. Auto-registered on the host without open wildcard risks.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-1.5 pt-1">
                      <Label className="text-[11px] font-semibold text-muted-foreground">Client's Custom Production Domain *</Label>
                      <Input
                        value={customDomain}
                        onChange={(e) => setCustomDomain(e.target.value)}
                        placeholder="e.g. invoice.laosteel.com"
                        required
                        className="h-10 rounded-xl text-xs font-mono px-3 bg-background border-border"
                      />
                      <p className="text-[11px] text-muted-foreground leading-relaxed">
                        Client domain. The client will point a CNAME record to <code className="text-emerald-400">cname.vercel-dns.com</code>.
                      </p>
                    </div>
                  )}
                </div>

                {/* Development Domain */}
                <div className="space-y-2 p-5 rounded-2xl border border-border bg-secondary/30">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs font-bold text-foreground flex items-center space-x-2">
                      <Laptop className="h-4 w-4 text-sky-500" />
                      <span>Localhost Development Domain *</span>
                    </Label>
                    <Badge className="text-[10px] bg-sky-500/10 text-sky-500 border border-sky-500/30">
                      Development
                    </Badge>
                  </div>
                  <Input
                    value={devDomain || (slug ? `${slug}.localhost` : '')}
                    onChange={(e) => setDevDomain(e.target.value)}
                    placeholder="e.g. laosteel.localhost"
                    required
                    className="h-11 rounded-xl text-sm font-mono px-4 bg-background border-border"
                  />
                  <p className="text-[11px] text-muted-foreground leading-relaxed">
                    Local debugging & offline POS testing URL (accessible on <code>http://{devDomain || 'name.localhost'}:3000</code>).
                  </p>
                </div>
              </div>

              {/* Automated DNS Configuration Guidance */}
              {customDomain && !customDomain.includes('localhost') && !customDomain.endsWith('.local') && (
                <div className="p-4 rounded-2xl bg-purple-500/10 border border-purple-500/25 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-purple-400 flex items-center gap-1.5">
                      <Sparkles className="h-4 w-4 text-purple-400" />
                      Automated Domain & SSL Provisioning
                    </span>
                    <Badge className="text-[10px] bg-purple-500/20 text-purple-300 border border-purple-500/30">
                      Zero Host Setup
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    The platform will automatically register this domain and provision SSL. Provide these DNS values to the client:
                  </p>
                  <div className="bg-background/80 p-3 rounded-xl border border-border/80 font-mono text-xs flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center space-x-3 text-xs">
                      <span>
                        <span className="text-muted-foreground">Type: </span>
                        <strong className="text-foreground">{customDomain.split('.').length > 2 ? 'CNAME' : 'A'}</strong>
                      </span>
                      <span className="text-muted-foreground">•</span>
                      <span>
                        <span className="text-muted-foreground">Host: </span>
                        <strong className="text-foreground">{customDomain.split('.').length > 2 ? customDomain.split('.')[0] : '@'}</strong>
                      </span>
                      <span className="text-muted-foreground">•</span>
                      <span>
                        <span className="text-muted-foreground">Target: </span>
                        <strong className="text-emerald-400">{customDomain.split('.').length > 2 ? 'cname.vercel-dns.com' : '76.76.21.21'}</strong>
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* ========================================================= */}
        {/* SECTION 4: PRINTABLE INVOICE & RECEIPT TEMPLATE (OPTIONAL) */}
        {/* ========================================================= */}
        <Card className="rounded-3xl border-border bg-card shadow-sm overflow-hidden">
          <CardHeader className="bg-secondary/20 border-b border-border/80 p-6 sm:p-8">
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 rounded-2xl bg-sky-500/10 border border-sky-500/20 text-sky-500 flex items-center justify-center font-bold shadow-inner">
                <Printer className="h-5 w-5" />
              </div>
              <div>
                <CardTitle className="text-lg sm:text-xl font-bold font-heading text-foreground">
                  Invoice & Receipt Template Design
                </CardTitle>
                <CardDescription className="text-xs text-muted-foreground">
                  Choose from built-in receipts or upload a bespoke template. (Optional — can also be set or changed later).
                </CardDescription>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-6 sm:p-8 space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Option 1: Classic Industrial */}
              <div
                onClick={() => setReceiptTemplateId('classic')}
                className={`p-5 rounded-2xl border text-left transition-all relative cursor-pointer flex flex-col justify-between ${
                  receiptTemplateId === 'classic'
                    ? 'border-emerald-500 bg-emerald-500/10 ring-2 ring-emerald-500/20 shadow-md shadow-emerald-500/10'
                    : 'border-border bg-secondary/30 text-muted-foreground hover:bg-secondary/60'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold font-heading text-foreground">
                      Classic Industrial / Thermal
                    </span>
                    <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-[10px]">
                      Built-in Default
                    </Badge>
                  </div>
                  <p className="text-[11px] text-muted-foreground leading-relaxed">
                    Heavy-duty ledger styling with navy outer borders, circular logo emblem, customer guarantee box, and dual signature lines.
                  </p>
                </div>

                <div className="pt-4 flex items-center justify-between border-t border-border/60 mt-4">
                  <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
                    {receiptTemplateId === 'classic' ? '✓ Selected' : 'Click to select'}
                  </span>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      setPreviewingTemplate('classic');
                      setIsPreviewOpen(true);
                    }}
                    className="h-8 rounded-xl text-[11px] px-2.5 border-border hover:bg-secondary flex items-center space-x-1 cursor-pointer"
                  >
                    <Eye className="h-3 w-3 mr-1 text-primary" />
                    <span>Preview</span>
                  </Button>
                </div>
              </div>

              {/* Option 2: Modern Corporate */}
              <div
                onClick={() => setReceiptTemplateId('modern')}
                className={`p-5 rounded-2xl border text-left transition-all relative cursor-pointer flex flex-col justify-between ${
                  receiptTemplateId === 'modern'
                    ? 'border-emerald-500 bg-emerald-500/10 ring-2 ring-emerald-500/20 shadow-md shadow-emerald-500/10'
                    : 'border-border bg-secondary/30 text-muted-foreground hover:bg-secondary/60'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold font-heading text-foreground">
                      Modern Corporate Executive
                    </span>
                    <Badge className="bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 text-[10px]">
                      Built-in Corporate
                    </Badge>
                  </div>
                  <p className="text-[11px] text-muted-foreground leading-relaxed">
                    Sleek minimalist executive SaaS design with dark slate header table, itemized charge breakdown, and digital verification seal.
                  </p>
                </div>

                <div className="pt-4 flex items-center justify-between border-t border-border/60 mt-4">
                  <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
                    {receiptTemplateId === 'modern' ? '✓ Selected' : 'Click to select'}
                  </span>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      setPreviewingTemplate('modern');
                      setIsPreviewOpen(true);
                    }}
                    className="h-8 rounded-xl text-[11px] px-2.5 border-border hover:bg-secondary flex items-center space-x-1 cursor-pointer"
                  >
                    <Eye className="h-3 w-3 mr-1 text-primary" />
                    <span>Preview</span>
                  </Button>
                </div>
              </div>

              {/* Option 3: Custom Upload Template */}
              <div
                onClick={() => {
                  if (customTemplateUrl) setReceiptTemplateId('custom');
                  else fileInputRef.current?.click();
                }}
                className={`p-5 rounded-2xl border text-left transition-all relative cursor-pointer flex flex-col justify-between ${
                  receiptTemplateId === 'custom'
                    ? 'border-emerald-500 bg-emerald-500/10 ring-2 ring-emerald-500/20 shadow-md shadow-emerald-500/10'
                    : 'border-border bg-secondary/30 text-muted-foreground hover:bg-secondary/60'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold font-heading text-foreground">
                      Custom Bespoke Template
                    </span>
                    <Badge className="bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20 text-[10px]">
                      Optional Upload
                    </Badge>
                  </div>
                  <p className="text-[11px] text-muted-foreground leading-relaxed">
                    Upload a custom client invoice template file or mock layout (PNG, JPG, PDF up to 5MB).
                  </p>
                  
                  {customFileName && (
                    <div className="mt-2 p-2 rounded-xl bg-background border border-border text-[10px] font-mono text-foreground flex items-center space-x-1.5 truncate">
                      <ImageIcon className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                      <span className="truncate">{customFileName}</span>
                    </div>
                  )}
                </div>

                <div className="pt-4 flex items-center justify-between border-t border-border/60 mt-4 gap-2">
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept="image/*,.pdf"
                    onChange={handleCustomTemplateUpload}
                    className="hidden"
                  />

                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      fileInputRef.current?.click();
                    }}
                    className="h-8 rounded-xl text-[11px] px-2.5 border-border hover:bg-secondary flex items-center space-x-1 cursor-pointer"
                  >
                    <Upload className="h-3 w-3 mr-1 text-purple-500" />
                    <span>{customTemplateUrl ? 'Change File' : 'Upload File'}</span>
                  </Button>

                  {customTemplateUrl && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        setPreviewingTemplate('custom');
                        setIsPreviewOpen(true);
                      }}
                      className="h-8 rounded-xl text-[11px] px-2.5 border-border hover:bg-secondary flex items-center space-x-1 cursor-pointer"
                    >
                      <Eye className="h-3 w-3 mr-1 text-primary" />
                      <span>Preview</span>
                    </Button>
                  )}
                </div>
              </div>
            </div>

            <p className="text-[11px] text-muted-foreground italic">
              * Note: Custom template upload is completely optional. If not uploaded now, you or the business can still customize and upload later anytime from the business details page.
            </p>
          </CardContent>
        </Card>

        {/* ========================================================= */}
        {/* SECTION 5: PRIMARY ADMINISTRATOR ACCOUNT                  */}
        {/* ========================================================= */}
        <Card className="rounded-3xl border-border bg-card shadow-sm overflow-hidden">
          <CardHeader className="bg-secondary/20 border-b border-border/80 p-6 sm:p-8">
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-500 flex items-center justify-center font-bold shadow-inner">
                <Key className="h-5 w-5" />
              </div>
              <div>
                <CardTitle className="text-lg sm:text-xl font-bold font-heading text-foreground">
                  Primary Administrator Account
                </CardTitle>
                <CardDescription className="text-xs text-muted-foreground">
                  Initial tenant administrator account credentials for managing this workspace.
                </CardDescription>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-6 sm:p-8 space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-foreground">Admin First Name *</Label>
                <Input
                  value={adminFirstName}
                  onChange={(e) => setAdminFirstName(e.target.value)}
                  placeholder="e.g. Habid"
                  required
                  className="h-11 rounded-xl text-sm px-4 bg-background border-border"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-foreground">Admin Last Name *</Label>
                <Input
                  value={adminLastName}
                  onChange={(e) => setAdminLastName(e.target.value)}
                  placeholder="e.g. Onilenla"
                  required
                  className="h-11 rounded-xl text-sm px-4 bg-background border-border"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-foreground">Admin Sign-in Email *</Label>
                <Input
                  type="email"
                  value={adminEmail}
                  onChange={(e) => setAdminEmail(e.target.value)}
                  placeholder="e.g. admin@laosteel.com"
                  required
                  className="h-11 rounded-xl text-sm px-4 bg-background border-border"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-foreground">Admin Initial Password *</Label>
                <div className="relative">
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                    placeholder="Minimum 6 characters"
                    required
                    className="h-11 rounded-xl text-sm px-4 pr-11 bg-background border-border"
                  />
                  <button
                    type="button"
                    tabIndex={-1}
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-end gap-4 pt-4 border-t border-border/80">
          <Link href="/admin/tenants" className="w-full sm:w-auto">
            <Button
              type="button"
              variant="outline"
              className="w-full sm:w-auto rounded-xl text-xs font-semibold h-12 px-7 border-border hover:bg-secondary"
            >
              Cancel
            </Button>
          </Link>
          <Button
            type="submit"
            disabled={onboardMutation.isPending}
            className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold h-12 px-9 shadow-lg shadow-emerald-500/25"
          >
            {onboardMutation.isPending ? (
              <span className="flex items-center space-x-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Provisioning Workspace...</span>
              </span>
            ) : (
              <span className="flex items-center space-x-2">
                <Sparkles className="h-4 w-4" />
                <span>Provision Business Workspace</span>
              </span>
            )}
          </Button>
        </div>
      </form>

      <InvoiceTemplatePreviewModal
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        templateId={previewingTemplate}
        customTemplateUrl={customTemplateUrl}
        businessName={businessName || 'DEMO BUSINESS ENTERPRISE'}
        tagline={tagline}
        address={address}
        phone={phone}
        email={email}
        receiptPrefix={receiptPrefix}
        onSelectTemplate={(tid) => setReceiptTemplateId(tid as any)}
      />
    </div>
  );
}
