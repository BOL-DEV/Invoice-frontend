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
} from 'lucide-react';
import { Button } from '../../../../components/ui/button';
import { Input } from '../../../../components/ui/input';
import { Label } from '../../../../components/ui/label';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../../../components/ui/card';
import { Badge } from '../../../../components/ui/badge';
import { useOnboardTenant } from '../../../../features/admin/hooks/useTenants';
import { useModal } from '../../../../components/ui/modal-provider';
import { PlanType, BillingMode } from '../../../../types/api';

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

  // Domains State (Live custom domain minimum 1, Dev domain businessname.localhost)
  const [customDomain, setCustomDomain] = useState('');
  const [devDomain, setDevDomain] = useState('');

  // Subscription Plan & Features
  const [plan, setPlan] = useState<PlanType>('BUSINESS');
  const [billingMode, setBillingMode] = useState<BillingMode>('SUBSCRIPTION');
  const [maxStaffCount, setMaxStaffCount] = useState<number>(4);
  const [hasCustomDomain, setHasCustomDomain] = useState<boolean>(true);
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
      if (!customDomain || customDomain === `invoice.${slug}.com`) {
        setCustomDomain(`invoice.${generatedSlug}.com`);
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
      setHasCustomDomain(true);
      setHasMultipleBranches(false);
      setHasAdvancedReports(false);
    } else if (selectedPlan === 'BUSINESS') {
      setMaxStaffCount(4);
      setHasCustomDomain(true);
      setHasMultipleBranches(false);
      setHasAdvancedReports(true);
    } else if (selectedPlan === 'ENTERPRISE') {
      setMaxStaffCount(10);
      setHasCustomDomain(true);
      setHasMultipleBranches(true);
      setHasAdvancedReports(true);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const cleanSlug = slug.trim().toLowerCase();
    const cleanLiveDomain = customDomain.trim().toLowerCase().replace(/^https?:\/\//, '').split('/')[0];
    const cleanDevDomain = devDomain.trim().toLowerCase().replace(/^https?:\/\//, '').split('/')[0] || `${cleanSlug}.localhost`;

    if (!cleanLiveDomain || cleanLiveDomain.length < 3) {
      setErrorMessage('Please provide a valid live custom domain (e.g. invoice.company.com or company.com).');
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
        tagline: tagline.trim() || null,
        plan,
        billingMode,
        maxStaffCount,
        hasCustomDomain: true,
        hasMultipleBranches,
        hasAdvancedReports,
        customDomain: cleanLiveDomain,
        devDomain: cleanDevDomain,
        adminFirstName: adminFirstName.trim(),
        adminLastName: adminLastName.trim(),
        adminEmail: adminEmail.trim().toLowerCase(),
        adminPassword,
      });

      await modal.alert(
        'Business Workspace Onboarded',
        `Successfully provisioned ${businessName}! Live domain registered at ${cleanLiveDomain} and development endpoint at ${cleanDevDomain}.`
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
              <span className="text-muted-foreground/40 text-xs">•</span>
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
        {/* SECTION 1: BUSINESS PROFILE & SLUG                        */}
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
                  className="h-11 rounded-xl text-sm font-mono px-4 bg-background border-border"
                />
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
        {/* SECTION 2: DUAL DOMAIN ARCHITECTURE (LIVE & DEVELOPMENT) */}
        {/* ========================================================= */}
        <Card className="rounded-3xl border-border bg-card shadow-sm overflow-hidden">
          <CardHeader className="bg-secondary/20 border-b border-border/80 p-6 sm:p-8">
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 rounded-2xl bg-purple-500/10 border border-purple-500/20 text-purple-500 flex items-center justify-center font-bold shadow-inner">
                <Globe className="h-5 w-5" />
              </div>
              <div>
                <CardTitle className="text-lg sm:text-xl font-bold font-heading text-foreground">
                  Dual Domain Architecture (Live & Localhost)
                </CardTitle>
                <CardDescription className="text-xs text-muted-foreground">
                  Every workspace is provisioned with a live production domain and a local development endpoint.
                </CardDescription>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-6 sm:p-8 space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Live Custom Domain */}
              <div className="space-y-2 p-5 rounded-2xl border border-border bg-secondary/30">
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-bold text-foreground flex items-center space-x-2">
                    <Globe className="h-4 w-4 text-purple-500" />
                    <span>Live Production Custom Domain *</span>
                  </Label>
                  <Badge className="text-[10px] bg-purple-500/10 text-purple-500 border border-purple-500/30">
                    Primary Live
                  </Badge>
                </div>
                <Input
                  value={customDomain}
                  onChange={(e) => setCustomDomain(e.target.value)}
                  placeholder="e.g. invoice.laosteel.com or laosteel.com"
                  required
                  className="h-11 rounded-xl text-sm font-mono px-4 bg-background border-border"
                />
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  The actual domain used by customer invoices, staff login, and official receipts.
                </p>
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

            {/* Cloud fallback note */}
            <div className="p-4 rounded-2xl bg-secondary/20 border border-border/70 flex items-center justify-between text-xs text-muted-foreground">
              <div className="flex items-center space-x-2">
                <Server className="h-4 w-4 text-emerald-500" />
                <span>Cloud Platform Fallback Subdomain:</span>
              </div>
              <span className="font-mono font-bold text-foreground">
                {slug ? `${slug}.bolxolve.com` : 'workspace.bolxolve.com'}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* ========================================================= */}
        {/* SECTION 3: SUBSCRIPTION PLAN & QUOTAS                     */}
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
                      className={`p-4 rounded-2xl border text-left transition-all relative ${
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
                    className={`p-3.5 rounded-2xl border text-left text-xs font-semibold transition-all ${
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
                    className={`p-3.5 rounded-2xl border text-left text-xs font-semibold transition-all ${
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
            <div className="space-y-3 pt-4 border-t border-border/70">
              <Label className="text-xs font-bold text-foreground">Modular Feature Toggles</Label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <label className="flex items-center justify-between p-3.5 rounded-2xl border border-border bg-secondary/30 hover:bg-secondary/50 cursor-pointer">
                  <span className="text-xs font-semibold text-foreground">Custom Domains</span>
                  <input
                    type="checkbox"
                    checked={hasCustomDomain}
                    onChange={(e) => setHasCustomDomain(e.target.checked)}
                    className="h-4 w-4 rounded text-emerald-500 focus:ring-emerald-500 accent-emerald-600"
                  />
                </label>

                <label className="flex items-center justify-between p-3.5 rounded-2xl border border-border bg-secondary/30 hover:bg-secondary/50 cursor-pointer">
                  <span className="text-xs font-semibold text-foreground">Multi-Branches</span>
                  <input
                    type="checkbox"
                    checked={hasMultipleBranches}
                    onChange={(e) => setHasMultipleBranches(e.target.checked)}
                    className="h-4 w-4 rounded text-emerald-500 focus:ring-emerald-500 accent-emerald-600"
                  />
                </label>

                <label className="flex items-center justify-between p-3.5 rounded-2xl border border-border bg-secondary/30 hover:bg-secondary/50 cursor-pointer">
                  <span className="text-xs font-semibold text-foreground">AI Reports & Scanner</span>
                  <input
                    type="checkbox"
                    checked={hasAdvancedReports}
                    onChange={(e) => setHasAdvancedReports(e.target.checked)}
                    className="h-4 w-4 rounded text-emerald-500 focus:ring-emerald-500 accent-emerald-600"
                  />
                </label>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ========================================================= */}
        {/* SECTION 4: PRIMARY ADMINISTRATOR ACCOUNT                  */}
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
    </div>
  );
}
