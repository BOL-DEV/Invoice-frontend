'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Sparkles,
  CheckCircle2,
  Calendar,
  Clock,
  AlertTriangle,
  AlertCircle,
  HelpCircle,
  ShieldCheck,
  Mail,
  ArrowUpRight,
} from 'lucide-react';
import { useSubscription, useInitiateSubscriptionPayment } from '@/features/subscriptions/hooks/useSubscription';
import { useModal } from '@/components/ui/modal-provider';
import { getErrorDialog } from '@/lib/api-error';
import { DynamicBankTransferModal } from '@/components/subscriptions/DynamicBankTransferModal';

export function SubscriptionUpgradeSettings() {
  const modal = useModal();
  const { data: subDetails } = useSubscription();
  const sub = subDetails?.subscription;
  const subPlan = sub?.plan || (subDetails as any)?.plan || 'STARTER';

  const [selectedMonths, setSelectedMonths] = useState<number>(1);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [activePaymentData, setActivePaymentData] = useState<any>(null);

  const initiatePaymentMutation = useInitiateSubscriptionPayment();

  // Subscription dates & expiration calculations
  const startDate = sub?.startDate;
  const effectiveEndDate = sub?.effectiveEndDate || sub?.endDate;
  const isInitialGrace = sub?.isInitialGrace;
  const isExpired = sub?.isExpired;
  const isExpiringSoon = sub?.isExpiringSoon;
  const hoursRemaining = sub?.hoursRemaining;
  const daysRemaining = sub?.daysRemaining;

  const formatDate = (dateStr?: string | null, includeTime = false) => {
    if (!dateStr) return '—';
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      ...(includeTime ? { hour: '2-digit', minute: '2-digit' } : {}),
    });
  };

  const getPlanPrice = (plan: 'STARTER' | 'BUSINESS' | 'ENTERPRISE', months: number) => {
    const monthlyRates = { STARTER: 6500, BUSINESS: 10500, ENTERPRISE: 20000 };
    const annualRates = { STARTER: 65000, BUSINESS: 105000, ENTERPRISE: 200000 };
    if (months === 12) {
      return { total: annualRates[plan], ratePerMonth: Math.round(annualRates[plan] / 12), isDiscounted: true };
    }
    const total = monthlyRates[plan] * months;
    return { total, ratePerMonth: monthlyRates[plan], isDiscounted: false };
  };

  const handleStartRenewal = async (months: number = selectedMonths) => {
    try {
      const cycle = months === 12 ? 'ANNUAL' : 'MONTHLY';
      const data = await initiatePaymentMutation.mutateAsync({
        plan: subPlan as 'STARTER' | 'BUSINESS' | 'ENTERPRISE',
        billingCycle: cycle,
        months,
      });
      setActivePaymentData(data);
      setIsPaymentModalOpen(true);
    } catch (err: any) {
      const { title, message, variant } = getErrorDialog(
        err,
        'Renewal Initiation Failed',
        'Could not initiate your payment request.'
      );
      modal.alert(title, message, variant);
    }
  };

  const handleContactSupport = (action: 'upgrade' | 'downgrade', targetPlan: string) => {
    const subject = encodeURIComponent(
      `Request to ${action === 'upgrade' ? 'Upgrade' : 'Downgrade'} to ${targetPlan} Plan`
    );
    const body = encodeURIComponent(
      `Hello BOLXolve Support Team,\n\nWe are currently operating on the ${subPlan} plan and would like to ${action} our organization workspace to the ${targetPlan} tier.\n\nPlease contact us with the next steps and quota adjustments.\n\nThank you!`
    );
    window.location.href = `mailto:support@bolxolve.com?subject=${subject}&body=${body}`;
  };

  const PLAN_RANKS = { STARTER: 1, BUSINESS: 2, ENTERPRISE: 3 };
  const currentRank = PLAN_RANKS[subPlan as keyof typeof PLAN_RANKS] || 1;

  return (
    <div className="space-y-6">
      {/* ========================================================= */}
      {/* 1. URGENT NOTIFICATION BANNERS                            */}
      {/* ========================================================= */}
      {isExpired ? (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-start space-x-3.5 shadow-lg shadow-rose-500/5 animate-in fade-in">
          <AlertTriangle className="h-5 w-5 text-rose-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="text-sm font-bold text-rose-300">Subscription Suspended / Expired</h4>
            <p className="text-xs text-rose-200/80 leading-relaxed">
              Your organization subscription {isInitialGrace ? '24-hour setup grace window' : ''} expired on{' '}
              <strong className="text-white">{formatDate(effectiveEndDate, true)}</strong>. Invoice creation and staff
              operations are suspended. Complete your renewal below to reactivate your workspace immediately.
            </p>
          </div>
        </div>
      ) : isInitialGrace ? (
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-start space-x-3.5 shadow-lg shadow-amber-500/5 animate-in fade-in">
          <Clock className="h-5 w-5 text-amber-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="text-sm font-bold text-amber-300">24-Hour Setup Grace Window Active</h4>
            <p className="text-xs text-amber-200/80 leading-relaxed">
              Welcome to BOLXolve Invoice! Your workspace was created under the{' '}
              <strong className="text-white">{subPlan}</strong> tier. You have{' '}
              <strong className="text-amber-300 font-mono">{hoursRemaining ?? 24} hours remaining</strong> (until{' '}
              {formatDate(effectiveEndDate, true)}) to make your initial subscription payment from this page before your
              account is suspended.
            </p>
          </div>
        </div>
      ) : isExpiringSoon ? (
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-start space-x-3.5 shadow-lg shadow-amber-500/5 animate-in fade-in">
          <AlertCircle className="h-5 w-5 text-amber-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="text-sm font-bold text-amber-300">
              Subscription Expiring Soon ({daysRemaining} {daysRemaining === 1 ? 'day' : 'days'} remaining)
            </h4>
            <p className="text-xs text-amber-200/80 leading-relaxed">
              Your <strong className="text-white">{subPlan}</strong> subscription is approaching its expiration on{' '}
              <strong className="text-white">{formatDate(effectiveEndDate)}</strong>. Renew below now to guarantee
              uninterrupted billing and terminal access for your staff.
            </p>
          </div>
        </div>
      ) : null}

      {/* ========================================================= */}
      {/* 2. SUBSCRIPTION TIMELINE & STATUS METRICS CARD            */}
      {/* ========================================================= */}
      <Card className="border-border/80 bg-card shadow-premium rounded-2xl overflow-hidden">
        <CardHeader className="p-4 sm:p-6 border-b border-border/80 bg-slate-50/50 dark:bg-slate-900/30">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center space-x-3">
              <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <div>
                <CardTitle className="text-sm sm:text-base font-bold text-foreground">
                  Current Subscription Overview
                </CardTitle>
                <CardDescription className="text-xs">
                  Active tier timeline, day of registration, and renewal expiration date.
                </CardDescription>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Badge className="bg-emerald-500 text-slate-950 font-mono font-bold text-xs px-3 py-1">
                {subPlan} TIER
              </Badge>
              {isExpired ? (
                <Badge className="bg-rose-500/20 border-rose-500/40 text-rose-400 text-xs">SUSPENDED / EXPIRED</Badge>
              ) : isInitialGrace ? (
                <Badge className="bg-amber-500/20 border-amber-500/40 text-amber-300 text-xs">
                  24H SETUP GRACE ({hoursRemaining ?? 24}h left)
                </Badge>
              ) : isExpiringSoon ? (
                <Badge className="bg-amber-500/20 border-amber-500/40 text-amber-300 text-xs">
                  EXPIRING IN {daysRemaining}D
                </Badge>
              ) : (
                <Badge className="bg-emerald-500/15 border-emerald-500/30 text-emerald-400 text-xs">ACTIVE</Badge>
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-4 sm:p-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Start Date */}
            <div className="p-4 rounded-xl border border-border/80 bg-slate-50/60 dark:bg-slate-900/50 space-y-1">
              <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                <Calendar className="h-3.5 w-3.5 text-emerald-500" />
                <span>Day of Subscription</span>
              </div>
              <p className="text-sm font-bold text-foreground font-mono">{formatDate(startDate)}</p>
              <p className="text-[11px] text-muted-foreground">Original activation timestamp</p>
            </div>

            {/* Expiry Date */}
            <div className="p-4 rounded-xl border border-border/80 bg-slate-50/60 dark:bg-slate-900/50 space-y-1">
              <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                <Clock className="h-3.5 w-3.5 text-amber-500" />
                <span>Date of Expiry</span>
              </div>
              <p
                className={`text-sm font-bold font-mono ${
                  isExpired ? 'text-rose-400' : isExpiringSoon || isInitialGrace ? 'text-amber-400' : 'text-foreground'
                }`}
              >
                {formatDate(effectiveEndDate, Boolean(isInitialGrace))}
              </p>
              <p className="text-[11px] text-muted-foreground">
                {isExpired
                  ? 'Expired — renewal required'
                  : isInitialGrace
                  ? '24-hour setup grace deadline'
                  : isExpiringSoon
                  ? `Expires in ${daysRemaining} ${daysRemaining === 1 ? 'day' : 'days'}`
                  : `${daysRemaining ?? '—'} days remaining`}
              </p>
            </div>

            {/* Staff Allocation */}
            <div className="p-4 rounded-xl border border-border/80 bg-slate-50/60 dark:bg-slate-900/50 space-y-1">
              <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
                <span>Staff Allocation</span>
              </div>
              <p className="text-sm font-bold text-foreground font-mono">
                {subDetails?.usage?.staffCount ?? (subDetails as any)?.activeStaffCount ?? 0} /{' '}
                {sub?.maxStaffCount ?? 3} Members
              </p>
              <p className="text-[11px] text-muted-foreground">Allocated for {subPlan} tier</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ========================================================= */}
      {/* 3. PLAN RENEWAL SECTION                                   */}
      {/* ========================================================= */}
      <Card className="border-border/80 bg-card shadow-premium rounded-2xl overflow-hidden">
        <CardHeader className="p-4 sm:p-6 border-b border-border/80 bg-slate-50/50 dark:bg-slate-900/30">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center space-x-3">
              <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500">
                <Sparkles className="h-5 w-5" />
              </div>
              <div>
                <CardTitle className="text-sm sm:text-base font-bold text-foreground">
                  Renew Subscription or Manage Tier
                </CardTitle>
                <CardDescription className="text-xs">
                  Pay via dynamic bank transfer for your assigned plan. Upgrades/downgrades are handled by Super Admin.
                </CardDescription>
              </div>
            </div>

            {/* Billing Duration Controls */}
            <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
              <div className="inline-flex items-center p-1 rounded-xl bg-slate-900/80 border border-slate-800 text-xs">
                {[
                  { label: '1 Mo', months: 1 },
                  { label: '3 Mos', months: 3 },
                  { label: '6 Mos', months: 6 },
                  { label: '1 Year', months: 12, badge: '2 Mos Free' },
                ].map((preset) => (
                  <button
                    key={preset.months}
                    type="button"
                    onClick={() => setSelectedMonths(preset.months)}
                    className={`px-2.5 py-1.5 rounded-lg font-medium transition-all flex items-center space-x-1.5 cursor-pointer ${
                      selectedMonths === preset.months
                        ? 'bg-emerald-500 text-slate-950 font-bold shadow-sm'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <span>{preset.label}</span>
                    {preset.badge && (
                      <span
                        className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold ${
                          selectedMonths === preset.months
                            ? 'bg-slate-950/20 text-slate-950'
                            : 'bg-emerald-400/20 text-emerald-300'
                        }`}
                      >
                        {preset.badge}
                      </span>
                    )}
                  </button>
                ))}
              </div>

              {/* Month Stepper */}
              <div className="inline-flex items-center h-9 px-2.5 rounded-xl bg-slate-900/80 border border-slate-800 text-xs text-white">
                <span className="text-slate-400 mr-2 text-[11px]">Months:</span>
                <button
                  type="button"
                  disabled={selectedMonths <= 1}
                  onClick={() => setSelectedMonths((m) => Math.max(1, m - 1))}
                  className="h-6 w-6 rounded-md bg-slate-800 hover:bg-slate-700 disabled:opacity-40 flex items-center justify-center font-bold text-slate-200 transition-colors cursor-pointer"
                  title="Decrease months"
                >
                  -
                </button>
                <span className="w-8 text-center font-mono font-bold text-emerald-400 text-xs">{selectedMonths}</span>
                <button
                  type="button"
                  disabled={selectedMonths >= 36}
                  onClick={() => setSelectedMonths((m) => Math.min(36, m + 1))}
                  className="h-6 w-6 rounded-md bg-slate-800 hover:bg-slate-700 disabled:opacity-40 flex items-center justify-center font-bold text-slate-200 transition-colors cursor-pointer"
                  title="Increase months"
                >
                  +
                </button>
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-4 sm:p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* 1. Starter Tier */}
            {(() => {
              const pricing = getPlanPrice('STARTER', selectedMonths);
              const isCurrent = subPlan === 'STARTER';
              const isUpgrade = PLAN_RANKS.STARTER > currentRank;
              return (
                <div
                  className={`flex flex-col justify-between p-5 rounded-2xl border transition-all ${
                    isCurrent
                      ? 'border-emerald-500 bg-emerald-500/[0.06] shadow-md ring-2 ring-emerald-500/30'
                      : 'border-border/80 bg-slate-900/30 opacity-80 hover:opacity-100'
                  }`}
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Starter</span>
                        <h5 className="text-xl font-bold text-white mt-0.5">
                          ₦{pricing.total.toLocaleString()}
                          <span className="text-xs font-normal text-slate-400">
                            {selectedMonths === 1 ? ' / mo' : ` for ${selectedMonths} mos`}
                          </span>
                        </h5>
                        {pricing.isDiscounted && (
                          <p className="text-[11px] text-emerald-400 font-medium mt-0.5">
                            Effective: ₦{pricing.ratePerMonth.toLocaleString()}/mo (Save ₦13,000)
                          </p>
                        )}
                      </div>
                      {isCurrent ? (
                        <Badge className="bg-emerald-500 text-slate-950 font-bold text-[10px] px-2 py-0.5">
                          Your Active Plan
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="border-slate-700 text-slate-400 text-[10px]">
                          {isUpgrade ? 'Upgrade Tier' : 'Downgrade Tier'}
                        </Badge>
                      )}
                    </div>

                    <ul className="text-xs text-slate-300 space-y-2 pt-2 border-t border-slate-800/80">
                      <li className="flex items-center space-x-2">
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                        <span>3 Users (1 Admin + 2 Cashiers)</span>
                      </li>
                      <li className="flex items-center space-x-2">
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                        <span>10 AI Scans / Month</span>
                      </li>
                      <li className="flex items-center space-x-2">
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                        <span>Thermal & A4 Printable Invoices</span>
                      </li>
                    </ul>
                  </div>

                  <div className="pt-5">
                    {isCurrent ? (
                      <Button
                        size="sm"
                        disabled={initiatePaymentMutation.isPending}
                        onClick={() => handleStartRenewal(selectedMonths)}
                        className="w-full text-xs h-10 rounded-xl font-bold bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition-all cursor-pointer shadow-lg shadow-emerald-500/10"
                      >
                        Renew Starter ({selectedMonths} {selectedMonths === 1 ? 'Mo' : 'Mos'} • ₦
                        {pricing.total.toLocaleString()})
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleContactSupport(isUpgrade ? 'upgrade' : 'downgrade', 'Starter')}
                        className="w-full text-xs h-10 rounded-xl font-medium border-slate-700 text-slate-300 hover:bg-slate-800 transition-all flex items-center justify-center space-x-1.5"
                      >
                        <Mail className="h-3.5 w-3.5 text-slate-400" />
                        <span>Contact Us to {isUpgrade ? 'Upgrade' : 'Downgrade'}</span>
                      </Button>
                    )}
                  </div>
                </div>
              );
            })()}

            {/* 2. Business Tier */}
            {(() => {
              const pricing = getPlanPrice('BUSINESS', selectedMonths);
              const isCurrent = subPlan === 'BUSINESS';
              const isUpgrade = PLAN_RANKS.BUSINESS > currentRank;
              return (
                <div
                  className={`flex flex-col justify-between p-5 rounded-2xl border transition-all ${
                    isCurrent
                      ? 'border-emerald-500 bg-emerald-500/[0.06] shadow-md ring-2 ring-emerald-500/30'
                      : 'border-border/80 bg-slate-900/30 opacity-80 hover:opacity-100'
                  }`}
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Business</span>
                        <h5 className="text-xl font-bold text-white mt-0.5">
                          ₦{pricing.total.toLocaleString()}
                          <span className="text-xs font-normal text-slate-400">
                            {selectedMonths === 1 ? ' / mo' : ` for ${selectedMonths} mos`}
                          </span>
                        </h5>
                        {pricing.isDiscounted && (
                          <p className="text-[11px] text-emerald-400 font-medium mt-0.5">
                            Effective: ₦{pricing.ratePerMonth.toLocaleString()}/mo (Save ₦21,000)
                          </p>
                        )}
                      </div>
                      {isCurrent ? (
                        <Badge className="bg-emerald-500 text-slate-950 font-bold text-[10px] px-2 py-0.5">
                          Your Active Plan
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="border-slate-700 text-slate-400 text-[10px]">
                          {isUpgrade ? 'Upgrade Tier' : 'Downgrade Tier'}
                        </Badge>
                      )}
                    </div>

                    <ul className="text-xs text-slate-300 space-y-2 pt-2 border-t border-slate-800/80">
                      <li className="flex items-center space-x-2">
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                        <span>5 Users (1 Admin + 4 Cashiers)</span>
                      </li>
                      <li className="flex items-center space-x-2">
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                        <span>60 AI Scans / Month</span>
                      </li>
                      <li className="flex items-center space-x-2">
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                        <span>Custom Branded Domain + Excel Export</span>
                      </li>
                    </ul>
                  </div>

                  <div className="pt-5">
                    {isCurrent ? (
                      <Button
                        size="sm"
                        disabled={initiatePaymentMutation.isPending}
                        onClick={() => handleStartRenewal(selectedMonths)}
                        className="w-full text-xs h-10 rounded-xl font-bold bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition-all cursor-pointer shadow-lg shadow-emerald-500/10"
                      >
                        Renew Business ({selectedMonths} {selectedMonths === 1 ? 'Mo' : 'Mos'} • ₦
                        {pricing.total.toLocaleString()})
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleContactSupport(isUpgrade ? 'upgrade' : 'downgrade', 'Business')}
                        className="w-full text-xs h-10 rounded-xl font-medium border-slate-700 text-slate-300 hover:bg-slate-800 transition-all flex items-center justify-center space-x-1.5"
                      >
                        <Mail className="h-3.5 w-3.5 text-slate-400" />
                        <span>Contact Us to {isUpgrade ? 'Upgrade' : 'Downgrade'}</span>
                      </Button>
                    )}
                  </div>
                </div>
              );
            })()}

            {/* 3. Enterprise Tier */}
            {(() => {
              const pricing = getPlanPrice('ENTERPRISE', selectedMonths);
              const isCurrent = subPlan === 'ENTERPRISE';
              const isUpgrade = PLAN_RANKS.ENTERPRISE > currentRank;
              return (
                <div
                  className={`flex flex-col justify-between p-5 rounded-2xl border transition-all ${
                    isCurrent
                      ? 'border-emerald-500 bg-emerald-500/[0.06] shadow-md ring-2 ring-emerald-500/30'
                      : 'border-border/80 bg-slate-900/30 opacity-80 hover:opacity-100'
                  }`}
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Enterprise</span>
                        <h5 className="text-xl font-bold text-white mt-0.5">
                          ₦{pricing.total.toLocaleString()}
                          <span className="text-xs font-normal text-slate-400">
                            {selectedMonths === 1 ? ' / mo' : ` for ${selectedMonths} mos`}
                          </span>
                        </h5>
                        {pricing.isDiscounted && (
                          <p className="text-[11px] text-emerald-400 font-medium mt-0.5">
                            Effective: ₦{pricing.ratePerMonth.toLocaleString()}/mo (Save ₦40,000)
                          </p>
                        )}
                      </div>
                      {isCurrent ? (
                        <Badge className="bg-emerald-500 text-slate-950 font-bold text-[10px] px-2 py-0.5">
                          Your Active Plan
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="border-slate-700 text-slate-400 text-[10px]">
                          Upgrade Tier
                        </Badge>
                      )}
                    </div>

                    <ul className="text-xs text-slate-300 space-y-2 pt-2 border-t border-slate-800/80">
                      <li className="flex items-center space-x-2">
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                        <span>11 Users (Owner + Sub-admins + 8 Cashiers)</span>
                      </li>
                      <li className="flex items-center space-x-2">
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                        <span>150 AI Scans / Month</span>
                      </li>
                      <li className="flex items-center space-x-2">
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                        <span>Multi-Branch Real-Time Control & Audits</span>
                      </li>
                    </ul>
                  </div>

                  <div className="pt-5">
                    {isCurrent ? (
                      <Button
                        size="sm"
                        disabled={initiatePaymentMutation.isPending}
                        onClick={() => handleStartRenewal(selectedMonths)}
                        className="w-full text-xs h-10 rounded-xl font-bold bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition-all cursor-pointer shadow-lg shadow-emerald-500/10"
                      >
                        Renew Enterprise ({selectedMonths} {selectedMonths === 1 ? 'Mo' : 'Mos'} • ₦
                        {pricing.total.toLocaleString()})
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleContactSupport('upgrade', 'Enterprise')}
                        className="w-full text-xs h-10 rounded-xl font-medium border-slate-700 text-slate-300 hover:bg-slate-800 transition-all flex items-center justify-center space-x-1.5"
                      >
                        <Mail className="h-3.5 w-3.5 text-slate-400" />
                        <span>Contact Us to Upgrade</span>
                      </Button>
                    )}
                  </div>
                </div>
              );
            })()}
          </div>

          {/* Footnote on Super Admin Upgrades */}
          <div className="p-4 rounded-xl border border-border/80 bg-slate-50/50 dark:bg-slate-900/40 flex items-start space-x-3 text-xs text-muted-foreground">
            <HelpCircle className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              Your organization is locked to the <strong>{subPlan}</strong> tier. To safeguard team permissions, branch
              allocations, and custom domain routings, upgrades and downgrades are provisioned exclusively by platform
              administrators. If you need to adjust your subscription level, please{' '}
              <a
                href="mailto:support@bolxolve.com"
                className="text-emerald-500 hover:underline font-semibold inline-flex items-center space-x-0.5"
              >
                <span>contact our support desk</span>
                <ArrowUpRight className="h-3 w-3" />
              </a>
              .
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Lenco Dynamic Bank Transfer Modal */}
      <DynamicBankTransferModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        paymentData={activePaymentData}
        onSuccess={() => {
          setIsPaymentModalOpen(false);
        }}
      />
    </div>
  );
}
