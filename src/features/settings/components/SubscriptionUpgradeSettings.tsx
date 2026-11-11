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
  History,
} from 'lucide-react';
import { useSubscription, useInitiateSubscriptionPayment } from '@/features/subscriptions/hooks/useSubscription';
import { useModal } from '@/components/ui/modal-provider';
import { getErrorDialog } from '@/lib/api-error';
import { DynamicBankTransferModal } from '@/components/subscriptions/DynamicBankTransferModal';
import { SubscriptionHistoryModal } from '@/components/subscriptions/SubscriptionHistoryModal';

export function SubscriptionUpgradeSettings() {
  const modal = useModal();
  const { data: subDetails } = useSubscription();
  const sub = subDetails?.subscription;
  const subPlan = sub?.plan || (subDetails as any)?.plan || 'STARTER';
  const payments = subDetails?.payments || [];

  const [selectedMonths, setSelectedMonths] = useState<number>(1);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
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

  const activePendingPayment = React.useMemo(() => {
    return payments.find(
      (p) =>
        p.status === 'PENDING' &&
        p.accountNumber &&
        p.expiresAt &&
        new Date(p.expiresAt).getTime() > Date.now()
    );
  }, [payments]);

  // Memoized effective remaining counts to ensure we never display a dash "—" when effectiveEndDate is available
  const effectiveDaysRemaining = React.useMemo(() => {
    if (typeof daysRemaining === 'number') return daysRemaining;
    if (typeof (subDetails as any)?.daysRemaining === 'number') return (subDetails as any).daysRemaining;
    if (!effectiveEndDate) return null;
    const diff = new Date(effectiveEndDate).getTime() - Date.now();
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  }, [daysRemaining, (subDetails as any)?.daysRemaining, effectiveEndDate]);

  const effectiveHoursRemaining = React.useMemo(() => {
    if (typeof hoursRemaining === 'number') return hoursRemaining;
    if (typeof (subDetails as any)?.hoursRemaining === 'number') return (subDetails as any).hoursRemaining;
    if (!effectiveEndDate) return 24;
    const diff = new Date(effectiveEndDate).getTime() - Date.now();
    return Math.max(0, Math.floor(diff / (1000 * 60 * 60)));
  }, [hoursRemaining, (subDetails as any)?.hoursRemaining, effectiveEndDate]);

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
    // Dynamic pricing from backend (supports global Super Admin rates and custom business pricing)
    const effectivePricing = (subDetails as any)?.pricing;
    const availablePlans = (subDetails as any)?.availablePlans;

    let monthly = availablePlans?.[plan]?.monthlyPrice || (plan === 'ENTERPRISE' ? 20000 : plan === 'BUSINESS' ? 10500 : 6500);
    let annual = availablePlans?.[plan]?.annualPrice || (plan === 'ENTERPRISE' ? 200000 : plan === 'BUSINESS' ? 105000 : 65000);

    if (subPlan === plan && effectivePricing?.isCustom) {
      if (effectivePricing.monthlyPrice) monthly = effectivePricing.monthlyPrice;
      if (effectivePricing.annualPrice) annual = effectivePricing.annualPrice;
    }

    if (months === 12) {
      return { total: annual, ratePerMonth: Math.round(annual / 12), isDiscounted: true };
    }
    const total = monthly * months;
    return { total, ratePerMonth: monthly, isDiscounted: false };
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
      `Request to Change / Upgrade Plan (${subPlan})`
    );
    const body = encodeURIComponent(
      `Hello BOLXolve Support Team,\n\nWe are currently operating on the ${subPlan} plan and would like to switch or customize our organization workspace tier.\n\nPlease contact us with the next steps.\n\nThank you!`
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
              <strong className="text-amber-300 font-mono">{effectiveHoursRemaining} hours remaining</strong> (until{' '}
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
              Subscription Expiring Soon ({effectiveDaysRemaining} {effectiveDaysRemaining === 1 ? 'day' : 'days'} remaining)
            </h4>
            <p className="text-xs text-amber-200/80 leading-relaxed">
              Your <strong className="text-white">{subPlan}</strong> subscription is approaching its expiration on{' '}
              <strong className="text-white">{formatDate(effectiveEndDate)}</strong>. Renew below now to guarantee
              uninterrupted billing and terminal access for your staff.
            </p>
          </div>
        </div>
      ) : null}

      {/* Active Pending Transfer Banner */}
      {activePendingPayment && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-md shadow-emerald-500/5 animate-in fade-in">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 shrink-0">
              <Clock className="h-5 w-5" />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-foreground">
                Active Transfer Account Generated
              </h4>
              <p className="text-[11px] text-muted-foreground">
                You have a pending transfer of <strong>₦{Number(activePendingPayment.amount).toLocaleString()}</strong> to{' '}
                <strong className="text-foreground">{activePendingPayment.bankName || 'URE MFB'}</strong> (Acct: {activePendingPayment.accountNumber}).
              </p>
            </div>
          </div>
          <Button
            size="sm"
            onClick={() => {
              setActivePaymentData({
                paymentId: activePendingPayment.id,
                transactionReference: activePendingPayment.transactionReference,
                amount: Number(activePendingPayment.amount),
                currency: 'NGN',
                plan: activePendingPayment.plan,
                billingCycle: activePendingPayment.billingCycle,
                months: (activePendingPayment.meta as any)?.months || 1,
                bankName: activePendingPayment.bankName,
                accountNumber: activePendingPayment.accountNumber,
                accountName: activePendingPayment.accountName,
                expiresAt: activePendingPayment.expiresAt,
                isSandbox: (process.env.NEXT_PUBLIC_API_URL || '').includes('localhost'),
              });
              setIsPaymentModalOpen(true);
            }}
            className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-xl shrink-0 cursor-pointer h-9 px-4"
          >
            Resume Payment
          </Button>
        </div>
      )}

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

            <div className="flex flex-wrap items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsHistoryModalOpen(true)}
                className="h-8 text-xs font-semibold border-border/80 bg-background/60 hover:bg-accent flex items-center space-x-1.5 rounded-lg"
              >
                <History className="h-3.5 w-3.5 text-emerald-500" />
                <span>Billing History</span>
                {payments.length > 0 && (
                  <Badge variant="secondary" className="ml-0.5 px-1.5 py-0 text-[10px] h-4 font-mono">
                    {payments.length}
                  </Badge>
                )}
              </Button>
              <Badge className="bg-emerald-500 text-slate-950 font-mono font-bold text-xs px-3 py-1">
                {subPlan} TIER
              </Badge>
              {isExpired ? (
                <Badge className="bg-rose-500/20 border-rose-500/40 text-rose-400 text-xs">SUSPENDED / EXPIRED</Badge>
              ) : isInitialGrace ? (
                <Badge className="bg-amber-500/20 border-amber-500/40 text-amber-300 text-xs">
                  24H SETUP GRACE ({effectiveHoursRemaining}h left)
                </Badge>
              ) : isExpiringSoon ? (
                <Badge className="bg-amber-500/20 border-amber-500/40 text-amber-300 text-xs">
                  EXPIRING IN {effectiveDaysRemaining}D
                </Badge>
              ) : (
                <Badge className="bg-emerald-500/15 border-emerald-500/30 text-emerald-400 text-xs">ACTIVE</Badge>
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-4 sm:p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                className={`text-sm font-bold font-mono ${isExpired ? 'text-rose-400' : isExpiringSoon || isInitialGrace ? 'text-amber-400' : 'text-foreground'
                  }`}
              >
                {formatDate(effectiveEndDate, Boolean(isInitialGrace))}
              </p>
              <p className="text-[11px] text-muted-foreground">
                {isExpired
                  ? 'Expired — renewal required'
                  : isInitialGrace
                    ? `24-hour setup grace deadline (${effectiveHoursRemaining}h left)`
                    : effectiveDaysRemaining !== null
                      ? `${effectiveDaysRemaining} ${effectiveDaysRemaining === 1 ? 'day' : 'days'} remaining`
                      : 'Active subscription'}
              </p>
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
                  Pay via dynamic bank transfer for your assigned plan. Upgrades/downgrades are handled by Support team.
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
                    className={`px-2.5 py-1.5 rounded-lg font-medium transition-all flex items-center space-x-1.5 cursor-pointer ${selectedMonths === preset.months
                      ? 'bg-emerald-500 text-slate-950 font-bold shadow-sm'
                      : 'text-slate-400 hover:text-white'
                      }`}
                  >
                    <span>{preset.label}</span>
                    {preset.badge && (
                      <span
                        className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold ${selectedMonths === preset.months
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
          {(() => {
            const planKey = (subPlan as 'STARTER' | 'BUSINESS' | 'ENTERPRISE') || 'STARTER';
            const pricing = getPlanPrice(planKey, selectedMonths);

            const planDetailsMap: Record<
              'STARTER' | 'BUSINESS' | 'ENTERPRISE',
              {
                name: string;
                features: string[];
                savings: string;
              }
            > = {
              STARTER: {
                name: 'Starter',
                features: [
                  '3 Users (1 Admin + 2 Cashiers)',
                  '10 AI Scans / Month',
                  'Thermal & A4 Printable Invoices',
                ],
                savings: '13,000',
              },
              BUSINESS: {
                name: 'Business',
                features: [
                  '5 Users (1 Admin + 4 Cashiers)',
                  '60 AI Scans / Month',
                  'Custom Branded Domain + Excel Export',
                  'Multi-Branch Inventory & Tracking',
                ],
                savings: '21,000',
              },
              ENTERPRISE: {
                name: 'Enterprise',
                features: [
                  '11 Users (Owner + Sub-admins + 8 Cashiers)',
                  '150 AI Scans / Month',
                  'Multi-Branch Real-Time Control & Audits',
                  'Custom Domain + Dedicated Priority Support',
                ],
                savings: '40,000',
              },
            };

            const planDetails = planDetailsMap[planKey] || planDetailsMap.STARTER;

            return (
              <div className="max-w-lg mx-auto w-full p-6 sm:p-7 rounded-2xl border-2 border-emerald-500 bg-emerald-500/[0.06] shadow-xl ring-2 ring-emerald-500/20 space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                      {planDetails.name} Tier
                    </span>
                    <h5 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
                      ₦{pricing.total.toLocaleString()}
                      <span className="text-xs font-normal text-slate-400 ml-1.5">
                        {selectedMonths === 1 ? '/ month' : `for ${selectedMonths} months`}
                      </span>
                    </h5>
                    {pricing.isDiscounted && (
                      <p className="text-xs text-emerald-400 font-medium mt-1">
                        Effective: ₦{pricing.ratePerMonth.toLocaleString()}/mo (Save ₦{planDetails.savings})
                      </p>
                    )}
                  </div>
                  <Badge className="bg-emerald-500 text-slate-950 font-bold text-xs px-3 py-1">
                    Your Active Plan
                  </Badge>
                </div>

                <ul className="text-xs sm:text-sm text-slate-300 space-y-3 pt-4 border-t border-slate-800/80">
                  {planDetails.features.map((feat, idx) => (
                    <li key={idx} className="flex items-center space-x-2.5">
                      <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>

                <div className="pt-2">
                  <Button
                    size="lg"
                    disabled={initiatePaymentMutation.isPending}
                    onClick={() => handleStartRenewal(selectedMonths)}
                    className="w-full text-xs sm:text-sm h-12 rounded-xl font-bold bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition-all cursor-pointer shadow-lg shadow-emerald-500/20"
                  >
                    Renew {planDetails.name} ({selectedMonths} {selectedMonths === 1 ? 'Month' : 'Months'} • ₦{pricing.total.toLocaleString()})
                  </Button>
                </div>

                <div className="text-center pt-2 border-t border-slate-800/60">
                  <p className="text-xs text-slate-400">
                    Want to switch to another plan?{' '}
                    <button
                      type="button"
                      onClick={() => handleContactSupport('upgrade', planDetails.name)}
                      className="text-emerald-400 hover:underline font-medium inline-flex items-center space-x-1 cursor-pointer"
                    >
                      <span>Contact our support team</span>
                      <ArrowUpRight className="h-3 w-3 inline" />
                    </button>
                  </p>
                </div>
              </div>
            );
          })()}

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
        onRetry={() => {
          setIsPaymentModalOpen(false);
          handleStartRenewal(selectedMonths);
        }}
      />

      {/* Subscription & Billing Payment History Modal */}
      <SubscriptionHistoryModal
        isOpen={isHistoryModalOpen}
        onClose={() => setIsHistoryModalOpen(false)}
        payments={payments}
      />
    </div>
  );
}
